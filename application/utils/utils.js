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

Utils.getFormattedDate = (date) => {
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

Utils.getWeenSpan = (date) => {
	date.setDate(new Date().getDate());
	
	const originalDate = new Date(date);

	date.setDate(date.getDate() - date.getDay() + 1);

	var firstDay = new Date(date);

	date.setDate(date.getDate() + 6);

	var lastDay = new Date(date);

	console.log(`\n`);
	console.log(`Overview chart data`);
	console.log(`> First day: ${firstDay}`);
	console.log(`> Last day: ${lastDay}`);

	return { firstDay, lastDay };
};

module.exports = Utils;
