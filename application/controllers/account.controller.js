const ExpenseController = require('./expense.controller');
const IncomeController = require('./income.controller');

const AccountSchema = require('../models/account.schema');

const { EXPENSE_STATUS } = require('../models/expense.schema');
const { INCOME_STATUS } = require('../models/income.schema');

const Utils = require('../utils/utils');

const { Types } = require('mongoose');

module.exports = class AccountController {
	constructor(date) {
		this.expenseController = new ExpenseController(date);
		this.incomeController = new IncomeController(date);

		this.referenceDate = date;
	}

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

	getMonthRef(date) {
		return new Date(date.getFullYear(), date.getMonth()).getTime();
	}

	getMonthLastDayRef(date) {
		return new Date(date.getFullYear(), date.getMonth() + 1).getTime();
	}

	getDayRef(date) {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
	}

	find(params) {
		//TODO
	}

	async getAccountBalanceByMonth(_id, date) {
		const account = await AccountSchema.findOne(
			{
				_id: Types.ObjectId(_id),
				isActive: true,
				toShowOnDashboard: true,
				insertedDate: {
					$lte: this.getMonthRef(date),
				},
			},
			{ openingBalance: 1, title: 1, insertedDate: 1 }
		)
			.lean()
			.populate({
				path: 'expenses',
				match: {
					isActive: true,
					dueDate: {
						$lt: date,
					},
				},
				select: ['title', 'amount', 'dueDate', 'status'],
				options: {
					sort: { dueDate: -1 },
				},
			})
			.exec();

		return account;
	}

	async getReducedAccountBalanceByMonth(_id) {
		const date = new Date(this.referenceDate);

		date.setDate(new Date().getDate());

		const matchClause = {
			$and: [
				{
					isActive: true,
					$or: [
						{
							dueDate: {
								$gte: this.getMonthRef(date),
								$lt: date,
							},
							status: EXPENSE_STATUS.CONFIRMED,
						},
						{
							dueDate: {
								$gte: this.getMonthRef(date),
							},
							recurrence: 1,
						},
					],
				},
			],
		};

		console.log('\n> Date: ' + date);

		const account = await AccountSchema.findOne(
			{
				_id: Types.ObjectId(_id),
				isActive: true,
				toShowOnDashboard: true,
				insertedDate: {
					$lte: this.getMonthLastDayRef(date),
				},
			},
			{ openingBalance: 1, title: 1 }
		)
			.lean()
			.populate({ path: 'incomes', match: matchClause, select: ['amount'] })
			.populate({ path: 'expenses', match: matchClause, select: ['amount'] })
			.exec();

		return (
			account.openingBalance +
			account.incomes.reduce((total, income) => total + income.amount, 0) -
			account.expenses.reduce((total, expense) => total + expense.amount, 0)
		);
	}

	async findOverview() {
		const matchClause = {
			$and: [
				{
					isActive: true,
					$or: [
						{
							dueDate: {
								$gte: this.getMonthRef(this.referenceDate),
								$lt: this.getMonthLastDayRef(this.referenceDate),
							},
						},
						{
							recurrence: 1,
							// TODO: dueDate greater than equals account insertedDate
							// dueDate: {
							// 	$gte: this.getMonthRef(this.referenceDate),
							// },
						},
					],
				},
			],
		};

		const accounts = await AccountSchema.find({
			isActive: true,
			toShowOnDashboard: true,
			insertedDate: {
				$lte: this.getMonthLastDayRef(this.referenceDate),
			},
		})
			.lean()
			.populate({
				path: 'incomes',
				match: matchClause,
				select: ['title', 'amount', 'dueDate', 'status'],
				options: { sort: { dueDate: -1 } },
			})
			.populate({
				path: 'expenses',
				match: matchClause,
				select: ['title', 'amount', 'dueDate', 'status'],
				options: { sort: { dueDate: -1 } },
			})
			.sort({ _id: -1 })
			.exec();

		for (var i = 0; i < accounts.length; i++) {
			accounts[i].incomes = accounts[i].incomes.map((e) => ({ ...e, account: { title: accounts[i].title } }));
			accounts[i].expenses = accounts[i].expenses.map((e) => ({ ...e, account: { title: accounts[i].title } }));

			if (process.env.DEBUG) {
				console.log(`\n> This month incomes\n`);

				accounts[i].incomes.forEach((e) => {
					console.log(
						`> ${Utils.getFormattedDayAndMonth(e.dueDate)} ${e.title}`,
						Utils.money.format(e.amount)
					);
				});

				console.log(`\n> This month expenses\n`);

				accounts[i].expenses.forEach((e) => {
					console.log(
						`> ${Utils.getFormattedDayAndMonth(e.dueDate)} ${e.title}`,
						Utils.money.format(e.amount)
					);
				});

				console.log(
					'\n> Total: ',
					Utils.money.format(
						accounts[i].incomes.reduce((total, e) => total + e.amount, 0) -
							accounts[i].expenses.reduce((total, e) => total + e.amount, 0)
					)
				);
			}

			accounts[i].openingBalance = await this.getReducedAccountBalanceByMonth(accounts[i]._id);

			accounts[i].balance =
				// Opening balance
				accounts[i].openingBalance +
				// Incomes
				accounts[i].incomes
					.filter((income) => income.status == INCOME_STATUS.CONFIRMED)
					.reduce((total, income) => total + income.amount, 0) -
				// Expenses
				accounts[i].expenses
					.filter((expense) => expense.status == EXPENSE_STATUS.CONFIRMED)
					.reduce((total, expense) => total + expense.amount, 0);

			accounts[i].foreseen =
				accounts[i].balance +
				// Incomes
				accounts[i].incomes
					.filter((income) => income.status == INCOME_STATUS.PENDING)
					.reduce((total, income) => total + income.amount, 0) -
				// Expenses
				accounts[i].expenses
					.filter((expense) => expense.status == EXPENSE_STATUS.PENDING)
					.reduce((total, expense) => total + expense.amount, 0);
		}

		const weekSpan = Utils.getWeenSpan(this.referenceDate);

		const incomesFlatten = accounts.map((account) => account.incomes).flat(Infinity);

		const expensesFlatten = accounts.map((account) => account.expenses).flat(Infinity);

		const weekExpenses = [];

		const aux = new Date(weekSpan.firstDay);

		while (aux <= weekSpan.lastDay) {
			weekExpenses.push({
				title: Utils.getFormattedDayAndMonth(aux),
				amount: expensesFlatten
					.filter((expense) => Utils.getDayRef(expense.dueDate).getTime() == Utils.getDayRef(aux).getTime())
					.reduce((total, expense) => total + expense.amount, 0),
			});

			aux.setDate(aux.getDate() + 1);
		}

		const incomesFulfilled = incomesFlatten
			.filter((e) => e.status == INCOME_STATUS.CONFIRMED)
			.reduce((total, e) => total + e.amount, 0);

		const incomesRemaining = incomesFlatten
			.filter((e) => e.status == INCOME_STATUS.PENDING)
			.reduce((total, e) => total + e.amount, 0);

		const expensesFulfilled = expensesFlatten
			.filter((e) => e.status == EXPENSE_STATUS.CONFIRMED)
			.reduce((total, e) => total + e.amount, 0);

		const expensesRemaining = expensesFlatten
			.filter((e) => e.status == EXPENSE_STATUS.PENDING)
			.reduce((total, e) => total + e.amount, 0);

		const monthBalance = {};

		monthBalance.openingBalance = accounts.reduce((total, account) => total + account.openingBalance, 0);

		monthBalance.balance = monthBalance.openingBalance + incomesFulfilled - expensesFulfilled;

		monthBalance.foreseen = monthBalance.balance + incomesRemaining - expensesRemaining;

		const overview = [
			{
				title: 'Incomes',
				icon: 'add',
				fulfilled: incomesFulfilled,
				remaining: incomesRemaining,
				color: '#57bb8a',
				href: '/incomes',
			},

			{
				title: 'Expenses',
				icon: 'remove',
				fulfilled: expensesFulfilled,
				remaining: expensesRemaining,
				color: '#e06055',
				href: '/expenses',
			},
		];

		return {
			accounts,
			monthBalance,
			overview,
			weekExpenses,
			expenses: expensesFlatten.slice(0, 5),
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
