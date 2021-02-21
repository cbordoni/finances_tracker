const ExpenseController = require('./expense.controller');

const AccountSchema = require('../models/account.schema');
const { EXPENSE_STATUS } = require('../models/expense.schema');

const { money } = require('../utils/utils');
const { Types } = require('mongoose');

module.exports = class AccountController {
	constructor(date) {
		this.expenseController = new ExpenseController();

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

				this.expenseController.populateDemo(e, (data) => {
					this.update(e._id, data);
				});
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
		const date = new Date(this.referenceDate.toString());
		date.setDate(1);

		const account = await AccountSchema.findOne(
			{
				_id: Types.ObjectId(_id),
				isActive: true,
				toShowOnDashboard: true,
				insertedDate: {
					$lte: this.getMonthLastDayRef(date),
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

		return account.openingBalance - account.expenses.reduce((total, expense) => total + expense.amount, 0);
	}

	async findOverview() {
		const accounts = await AccountSchema.find({
			isActive: true,
			toShowOnDashboard: true,
			insertedDate: {
				$lte: this.referenceDate,
			},
		})
			.lean()
			.populate({
				path: 'expenses',
				match: {
					isActive: true,
					dueDate: {
						$gte: this.getMonthRef(this.referenceDate),
						$lt: this.getMonthLastDayRef(this.referenceDate),
					},
				},
				select: ['title', 'amount', 'dueDate', 'status'],
				options: {
					sort: { dueDate: -1 },
				},
			})
			.sort({ _id: -1 })
			.exec();

		for (var i = 0; i < accounts.length; i++) {
			console.log(`\n> This month expenses\n`);

			accounts[i].expenses.forEach((e) => {
				console.log(`> ${e.dueDate.toLocaleDateString()} ${e.title}`, money.format(e.amount));
			});

			console.log(
				'\n> Total: ',
				money.format(accounts[i].expenses.reduce((total, expense) => total + expense.amount, 0))
			);

			accounts[i].openingBalance = await this.getReducedAccountBalanceByMonth(accounts[i]._id);

			accounts[i].balance =
				accounts[i].openingBalance -
				accounts[i].expenses
					.filter((expense) => expense.status == EXPENSE_STATUS.CONFIRMED)
					.reduce((total, expense) => total + expense.amount, 0);

			accounts[i].foreseen =
				accounts[i].balance -
				accounts[i].expenses
					.filter((expense) => expense.status == EXPENSE_STATUS.PENDING)
					.reduce((total, expense) => total + expense.amount, 0);
		}

		return accounts;
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
