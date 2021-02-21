const AccountController = require('../controllers/account.controller');
const ExpenseController = require('../controllers/expense.controller');

const EXPENSE_STATUS = require('../models/expense.schema').EXPENSE_STATUS;

const Utils = require('../utils/utils');

module.exports = (app) => {
	// index page
	app.get('/', async (req, res) => {
		const expenses = await new ExpenseController(req.referenceDate).findOverview();

		const accounts = await new AccountController(req.referenceDate).findOverview();

		const weekSpan = Utils.getWeenSpan(req.referenceDate);

		var weekExpenses = [];

		var aux = new Date(weekSpan.firstDay);

		while (aux < weekSpan.lastDay) {
			weekExpenses.push({
				title: `${(aux.getMonth() + 1).toString().padStart(2, '0')}/${aux
					.getDate()
					.toString()
					.padStart(2, '0')}`,
				amount: expenses
					.filter((expense) => Utils.getDayRef(expense.dueDate).getTime() == Utils.getDayRef(aux).getTime())
					.reduce((total, expense) => total + expense.amount, 0),
			});

			aux.setDate(aux.getDate() + 1);
		}

		const fulfilled = expenses
			.filter((e) => e.status == EXPENSE_STATUS.CONFIRMED)
			.reduce((total, e) => total + e.amount, 0);

		const remaining = expenses
			.filter((e) => e.status == EXPENSE_STATUS.PENDING)
			.reduce((total, e) => total + e.amount, 0);

		const monthBalance = {};

		monthBalance.openingBalance = accounts.reduce((total, account) => total + account.openingBalance, 0);

		monthBalance.balance = monthBalance.openingBalance - fulfilled;

		monthBalance.foreseen = monthBalance.balance - remaining;

		const overview = [
			{
				title: 'Incomes',
				icon: 'add',
				fulfilled: 0.0,
				remaining: 0.0,
				color: '#2e7d32',
				href: '/incomes',
			},

			{
				title: 'Expenses',
				icon: 'remove',
				fulfilled: fulfilled,
				remaining: remaining,
				color: '#c62828',
				href: '/expenses',
			},
		];

		res.render(`${pagesDir}/home`, {
			weekExpenses,
			monthBalance,
			overview,
			expenses: expenses.slice(0, 5),
			accounts,
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
