const mongoose = require('mongoose');

const { TRANSACTION_STATUS } = require('./transaction.schema');

const { Schema } = mongoose;

const ExpenseSchema = mongoose.Schema({
	title: { type: String, required: true },
	recurrence: { type: Number, default: TRANSACTION_STATUS.PENDING },
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
