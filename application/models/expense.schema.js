const mongoose = require('mongoose');

const { Schema } = mongoose;

const EXPENSE_STATUS = {
	PENDING: 0,
	CONFIRMED: 1,
};

const ExpenseSchema = mongoose.Schema({
	title: { type: String, required: true },
	recurrence: { type: Number, default: EXPENSE_STATUS.PENDING },
	amount: { type: Number, required: true },
	dueDate: { type: Date, required: true },
	insertedDate: { type: Date, default: Date.now },
	status: { type: Number, default: 0 },
	account: { type: Schema.Types.ObjectId, ref: 'Account' },
	payment: {
		date: { type: Date },
		charges: { type: Number },
	},
	isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Expense', ExpenseSchema);

module.exports.EXPENSE_STATUS = EXPENSE_STATUS;
