const AccountController = require('../controllers/account.controller');

const { getStatusColor, getStatusIcon } = require('../models/transaction.schema');

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

	// index page
	app.get('/api/accounts/balance', async (req, res) => {
		const overview = await new AccountController(req.referenceDate).getAccountsBalance();

		res.json(overview);
	});
};
