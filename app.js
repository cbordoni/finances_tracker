const express = require('express');
const consign = require('consign');
const path = require('path');

const mongoose = require('mongoose');

const AccountController = require('./application/controllers/account.controller');

const Utils = require('./application/utils/utils');

global.appRoot = path.resolve(__dirname);

global.pagesDir = appRoot + '/application/views/pages/';

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	var date = Utils.getFormattedDate(req.query.from);

	req.referenceDate = date;

	req.renderInfo = {
		user: {
			name: 'John Doe',
			email: 'johndoe@gmail.com',
			isAdmin: true,
		},
		formatMoney: Utils.money.format,
		formatDate: Utils.getMaskedDate,
		date,
	};

	next();
});

consign().include('application/routes').into(app);

app.listen(process.env.PORT, () => {
	console.log('\n> Server up');

	mongoose
		.connect('mongodb://127.0.0.1:27017/app_finances', { useNewUrlParser: true, useUnifiedTopology: true })
		.then(
			() => {
				console.log('> Connected to the database');

				new AccountController().populateDemo();
			},
			(e) => {
				console.log('Error', e.message);
			}
		);
});
