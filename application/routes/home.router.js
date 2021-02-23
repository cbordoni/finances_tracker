const AccountController = require('../controllers/account.controller');
const ExpenseController = require('../controllers/expense.controller');

const EXPENSE_STATUS = require('../models/expense.schema').EXPENSE_STATUS;

const Utils = require('../utils/utils');

const getStatusColor = (expense) => {
	switch (expense.status) {
		case EXPENSE_STATUS.PENDING:
			return '#e0e0e0';
		case EXPENSE_STATUS.CONFIRMED:
			return '#81c784';
	}
};

const getStatusIcon = (expense) => {
	switch (expense.status) {
		case EXPENSE_STATUS.PENDING:
			return 'schedule';
		case EXPENSE_STATUS.CONFIRMED:
			return 'done';
	}
};

module.exports = (app) => {
	// index page
	app.get('/', async (req, res) => {
		const overview = await new AccountController(req.referenceDate).findOverview();

		res.render(`${pagesDir}/home`, {
			headerOptions: {
				showMonthPicker: true,
			},
			...overview,
			getStatusColor,
			getStatusIcon,
			...req.renderInfo,
		});
	});

	app.get('/account/:accountId/expenses', async (req, res) => {
		const accountId = req.params.accountId;

		const date = Utils.getFormattedDate(req.query.from);

		const { openingBalance, ...account } = await new AccountController().getAccountBalanceByMonth(accountId, date);

		const totalExpenses = account.expenses.reduce((total, expense) => total + expense.amount, 0);

		res.json({
			account: {
				account: {
					...account,
					openingBalance: Utils.money.format(openingBalance),
				},
				totalExpenses: Utils.money.format(totalExpenses),
				balance: Utils.money.format(openingBalance - totalExpenses),
			},
		});
	});
};
