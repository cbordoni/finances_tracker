const ExpenseController = require('./expense.controller');
const IncomeController = require('./income.controller');

const AccountSchema = require('../models/account.schema');

const { TRANSACTION_STATUS } = require('../models/transaction.schema');

const Utils = require('../utils/utils');

module.exports = class AccountController {
	constructor(date) {
		this.expenseController = new ExpenseController(date);
		this.incomeController = new IncomeController(date);

		this.referenceDate = date;
	}

	filters = {
		past: (e) => e.dueDate <= this.getDay(this.referenceDate),
		confirmed: (e) => e.status == TRANSACTION_STATUS.CONFIRMED,
		pending: (e) => e.status == TRANSACTION_STATUS.PENDING,
	};

	reducers = {
		simple: (total, e) => total + e.amount,
		complex: (total, e) => total + e.amount * (e.recurrence ? Utils.getMonthDiff(this.referenceDate, e.dueDate) : 1),
	};

	async populateDemo() {
		const data = await AccountSchema.findOne({});

		if (!data) {
			console.log('\n> There is no account');

			AccountSchema({
				title: 'Cody Next',
				openingBalance: 3000.0,
				defaultAccount: false,
			}).save((err, e) => {
				if (err) throw err;

				console.log(`> Saved account: ${e._id}`);

				const cb = (data) => {
					this.update(e._id, data);
				};

				this.expenseController.populateDemo(e, cb);

				this.incomeController.populateDemo(e, cb);
			});
		}
		// else {
		// 	console.log(`> Saved account: ${e._id}\n`);
		// }
	}

	getMonth(date) {
		return new Date(date.getFullYear(), date.getMonth()).getTime();
	}

	getMonthLastDay(date) {
		return new Date(date.getFullYear(), date.getMonth() + 1).getTime();
	}

	getDay(date) {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
	}

	find(params) {
		//TODO
	}

	getWeekExpenses(expenses) {
		const { firstDay, lastDay } = Utils.getWeenSpan(this.referenceDate);

		const weekExpenses = [];

		while (firstDay <= lastDay) {
			weekExpenses.push({
				title: Utils.getFormattedDayAndMonth(firstDay),
				amount: expenses.filter((e) => Utils.getDayRef(e.dueDate).getTime() == Utils.getDayRef(firstDay).getTime()).reduce((total, e) => total + e.amount, 0),
			});

			firstDay.setDate(firstDay.getDate() + 1);
		}

		return weekExpenses;
	}

	async getAccountsBalance(filter) {
		const match = {
			isActive: true,
			dueDate: { $lte: this.getMonthLastDay(this.referenceDate) },
		};

		const options = { sort: { dueDate: -1 } };

		const select = ['title', 'amount', 'dueDate', 'recurrence', 'status'];

		const accounts = await AccountSchema.find(filter).populate({ path: 'incomes', match, select, options }).populate({ path: 'expenses', match, select, options }).lean().exec();

		for (var i = 0; i < accounts.length; i++) {
			accounts[i].openingBalance =
				accounts[i].openingBalance +
				accounts[i].incomes.filter(this.filters.past).reduce(this.reducers.complex, 0) -
				accounts[i].expenses.filter(this.filters.past).reduce(this.reducers.complex, 0);

			accounts[i].balance =
				accounts[i].openingBalance +
				// Confirmed incomes
				accounts[i].incomes.filter(this.filters.confirmed).reduce(this.reducers.simple, 0) -
				// Confirmed expenses
				accounts[i].expenses.filter(this.filters.confirmed).reduce(this.reducers.simple, 0);

			accounts[i].foreseen =
				accounts[i].balance +
				// Foreseen incomes
				accounts[i].incomes.filter(this.filters.pending).reduce(this.reducers.simple, 0) -
				// Foreseen expenses
				accounts[i].expenses.filter(this.filters.pending).reduce(this.reducers.simple, 0);
		}

		return accounts;
	}

	async findOverview() {
		const flatReduce = (e) => e.flat(1).reduce((total, e) => total + e.amount, 0);

		const accounts = await this.getAccountsBalance({});

		for (var i = 0; i < accounts.length; i++) {
			accounts[i].expenses = accounts[i].expenses.map((e) => ({ ...e, account: { title: accounts[i].title } }));
		}

		// Month balance
		const monthBalance = {
			openingBalance: accounts.reduce((total, e) => total + e.openingBalance, 0),
			balance: accounts.reduce((total, e) => total + e.balance, 0),
			foreseen: accounts.reduce((total, e) => total + e.foreseen, 0),
		};

		const flatExpenses = accounts
			.map((e) => e.expenses)
			.flat(1)
			.sort((a, b) => b.dueDate - a.dueDate);

		return {
			overview: [
				{
					title: 'Incomes',
					icon: 'add',
					fulfilled: flatReduce(accounts.map((e) => e.incomes.filter(this.filters.confirmed))),
					remaining: flatReduce(accounts.map((e) => e.incomes.filter(this.filters.pending))),
					color: '#57bb8a',
					href: '/incomes',
				},

				{
					title: 'Expenses',
					icon: 'remove',
					fulfilled: flatReduce(accounts.map((e) => e.expenses.filter(this.filters.confirmed))),
					remaining: flatReduce(accounts.map((e) => e.expenses.filter(this.filters.pending))),
					color: '#e06055',
					href: '/expenses',
				},
			],
			weekExpenses: this.getWeekExpenses(flatExpenses),
			expenses: flatExpenses.slice(0, 5),
			monthBalance,
			accounts,
		};
	}

	insert(params) {
		//TODO
	}

	update(_id, data) {
		AccountSchema.findByIdAndUpdate(_id, data, { new: true }, (err, e) => {
			if (err) throw err;

			// console.log('Updated account:', e);
		});
	}
};
