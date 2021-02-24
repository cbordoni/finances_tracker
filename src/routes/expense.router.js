const ExpenseController = require('../controllers/expense.controller');

const { getStatusColor, getStatusIcon } = require('../models/transaction.schema');

const router = require('express').Router();

module.exports = (app) => {
	app.get('/expenses', async (req, res) => {
		const expenses = await new ExpenseController(req.referenceDate).findByMonth();

		res.render(`${pagesDir}/expenses/index`, {
			headerOptions: {
				title: 'Expenses',
				backIcon: 'arrow_back',
				showMonthPicker: true,
			},
			expenses,
			getStatusColor,
			getStatusIcon,
			...req.renderInfo,
		});
	});

	app.get('/expenses/create', async (req, res) => {
		res.render(`${pagesDir}/expenses/create`, {
			headerOptions: {
				title: 'Add Expense',
				backIcon: 'close',
			},
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
