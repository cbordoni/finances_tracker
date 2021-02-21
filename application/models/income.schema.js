const mongoose = require('mongoose');

const { Schema } = mongoose;

const IncomeSchema = mongoose.Schema({
	title: { type: String, required: true },
	recurrence: { type: Number },
	amount: { type: Number, required: true },
	dueDate: { type: Date, default: Date.now, required: true },
	insertedDate: { type: Date, default: Date.now },
	status: { type: Number },
	payment: {
		charges: { type: Number },
		date: { type: Date, default: Date.now },
	},
	account: { type: Schema.Types.ObjectId, ref: 'Account' },
});

module.exports = mongoose.model('Income', IncomeSchema);
