const mongoose = require('mongoose');

const { Schema } = mongoose;

const AccountSchema = mongoose.Schema({
	title: { type: String, required: true },
	openingBalance: { type: Number, default: 0.0 },
	description: { type: String, default: '' },
	defaultAccount: { type: Boolean, default: false },
	toShowOnDashboard: { type: Boolean, default: true },
	toSum: { type: Boolean, default: true },
	insertedDate: { type: Date, default: () => Date.now() },
	isActive: { type: Boolean, default: true },
	expenses: [{ type: Schema.Types.ObjectId, ref: 'Expense' }],
	incomes: [{ type: Schema.Types.ObjectId, ref: 'Income' }],
});

module.exports = mongoose.model('Account', AccountSchema);
