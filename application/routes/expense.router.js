const ExpenseController = require('../controllers/expense.controller');
const { EXPENSE_STATUS } = require('../models/expense.schema');

const router = require('express').Router();

module.exports = (app) => {
	const getStatusIcon = (expense) => {
		switch (expense.status) {
			case EXPENSE_STATUS.PENDING:
				return 'schedule';
			case EXPENSE_STATUS.CONFIRMED:
				return 'done';
		}
	};

	app.get('/expenses', async (req, res) => {
		const expenses = await new ExpenseController(req.referenceDate).findByMonth();

		res.render(`${pagesDir}/expenses/index`, {
			title: 'Expenses',
			subtitle: 0.0,
			expenses,
			backIcon: 'arrow_back',
			getStatusIcon,
			...req.renderInfo,
		});
	});

	app.get('/expense', async (req, res) => {
		const expenses = await new ExpenseController(req.referenceDate).findByMonth();

		res.render(`${pagesDir}/expense/create`, {
			title: 'Expenses',
			subtitle: 0.0,
			expenses,
			backIcon: 'arrow_back',
			getStatusIcon,
			...req.renderInfo,
		});
	});

	router.get('/', (req, res) => {});
	router.get('/:id', (req, res) => {});
	router.post('/', (req, res) => {});
	router.put('/:id', (req, res) => {});

	app.use(`/api/expenses`, router);

	return this;
};
