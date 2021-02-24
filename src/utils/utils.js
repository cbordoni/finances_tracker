const Utils = {};

Utils.money = {
	format: (e, ...{ decimalSeparator = ',', thousandsSeparator = '.', prefix = '$' }) => {
		var intPart = Math.abs(parseInt(e));
		var decPart = Math.abs(Math.floor(Number((e % 1).toFixed(2)) * 100));

		var res = '';
		var i = e < 0 ? '-' : '';

		var res = '';

		while (intPart >= 1000) {
			var length = intPart.toString().length - 1;

			res = thousandsSeparator + intPart.toString().substr(length - 2, length) + res;
			intPart = Number(intPart.toString().slice(0, length - 2));
		}

		return i + prefix + intPart + res + decimalSeparator + decPart.toString().padStart(2, '0');
	},
};

Utils.getFormattedDate = (date, mask) => {
	mask = mask.replace(/yyyy/gi, date.getFullYear());
	mask = mask.replace(/MM/gi, (date.getMonth() + 1).toString().padStart(2, '0'));
	mask = mask.replace(/dd/gi, date.getDate().toString().padStart(2, '0'));
	mask = mask.replace(/hh/gi, date.getHours().toString().padStart(2, '0'));
	mask = mask.replace(/mm/gi, date.getMinutes().toString().padStart(2, '0'));
	mask = mask.replace(/ss/gi, date.getSeconds().toString().padStart(2, '0'));

	return mask;
};

Utils.getDefaultDate = (date) => {
	try {
		if (!date) throw new Error('No date provided');

		date = new Date(date.split('-').join('/'));
	} catch (e) {
		console.log('Error', e.message);

		date = new Date();
	}

	return date;
};

Utils.getDayRef = (date) => {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

Utils.getMaskedDate = (date) => {
	return date.toDateString().substr(4, 6).split(' ').join('/') + ' ' + date.toTimeString().substr(0, 5);
};

Utils.getMonthDiff = (dateFrom, dateTo) => {
	return Math.abs(dateTo.getMonth() - dateFrom.getMonth() + 12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
};

/**
 *
 * @param {Date} date
 *
 * @returns {Object} firstDay and lastDay
 */

Utils.getWeenSpan = (date) => {
	date.setDate(new Date().getDate());

	date.setDate(date.getDate() - date.getDay() + 1);

	var firstDay = new Date(date);

	date.setDate(date.getDate() + 6);

	var lastDay = new Date(date);

	if (process.env.DEBUG) {
		console.log(`\n`);
		console.log(`> Overview chart data`);
		console.log(`> First day: ${firstDay}`);
		console.log(`> Last day: ${lastDay}`);
	}

	return { firstDay, lastDay };
};

/**
 *
 * @param {Date} date
 *
 * @returns day/month
 */

Utils.getFormattedDayAndMonth = (date) => {
	return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

module.exports = Utils;
