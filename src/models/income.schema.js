const mongoose = require('mongoose');

const { Schema } = mongoose;

const INCOME_STATUS = {
	PENDING: 0,
	CONFIRMED: 1,
};

const IncomeSchema = mongoose.Schema({
	title: { type: String, required: true },
	recurrence: { type: Number, default: INCOME_STATUS.PENDING },
	amount: { type: Number, required: true },
	dueDate: { type: Date, required: true },
	insertedDate: { type: Date, default: Date.now },
	status: { type: Number, default: 0 },
	account: { type: Schema.Types.ObjectId, ref: 'Account' },
	isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Income', IncomeSchema);

module.exports.INCOME_STATUS = INCOME_STATUS;
