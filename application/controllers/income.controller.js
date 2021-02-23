const IncomeSchema = require('../models/income.schema');

const { Types } = require('mongoose');

module.exports = class IncomeController {
	constructor(date) {
		this.referenceDate = date;
	}

	getExpensesCount() {
		return Math.floor(Math.random() + 1);
	}

	getAmount() {
		return Number((Math.random() * 1000 + 1000).toFixed(2));
	}

	getDueDate() {
		const date = new Date();

		date.setDate(date.getDate() + Math.floor(Math.random() * 40));

		return date;
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

	populateDemo(account, cb) {
		var total = this.getExpensesCount();

		console.log(`\n>Inserting ${total} documents\n`);

		for (var i = 0; i < total; i++) {
			IncomeSchema({
				title: `Income #${i + 1} ${account.title}`,
				recurrence: 1,
				amount: this.getAmount(),
				dueDate: this.getDueDate(),
				account: Types.ObjectId(account._id),
			}).save((err, e) => {
				if (err) throw err;

				console.log(`> Income saved: ${e._id}`);

				try {
					cb({ $push: { incomes: Types.ObjectId(e._id) } });
				} catch (e) {
					console.log('> Error', e.mesage);
				}
			});
		}
	}

	async findByMonth() {
		const incomes = await IncomeSchema.find({
			dueDate: {
				$gte: this.getMonthRef(this.referenceDate),
				$lt: this.getMonthLastDayRef(this.referenceDate),
			},
			isActive: true,
		})
			.populate({
				path: 'account',
				match: {
					isActive: true,
				},
				select: {
					title: 1,
					openingBalance: 1,
				},
			})
			.sort({ dueDate: -1 })
			.exec();

		return incomes;
	}

	async findOverview(accountId) {
		const incomes = await IncomeSchema.find({
			dueDate: {
				$gte: this.getMonthRef(this.referenceDate),
				$lt: this.getMonthLastDayRef(this.referenceDate),
			},
			isActive: true,
			account: accountId
		})
			.populate({
				path: 'account',
				match: {
					isActive: true,
				},
				select: {
					title: 1,
					openingBalance: 1,
				},
			})
			.sort({ dueDate: -1 })
			.exec();

		return incomes;
	}
};
