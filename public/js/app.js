// if ('serviceWorker' in navigator) {
// 	navigator.serviceWorker
// 		.register('/sw.js', { scope: '/' })
// 		.then((reg) => {
// 			if (reg.installing) {
// 				console.log('Service worker installing');
// 			} else if (reg.waiting) {
// 				console.log('Service worker installed');
// 			} else if (reg.active) {
// 				console.log('Service worker active');
// 			}
// 		})
// 		.catch((error) => {
// 			console.log('Registration failed with ' + error);
// 		});
// }

(function () {
	const getMonthRef = () => {
		var date = new Date();

		return new Date(date.getFullYear(), date.getMonth());
	};

	const getDateFromParam = () => {
		var params = new URLSearchParams(location.search);

		var date = params.get('from');

		try {
			if (!date) throw new Error('No date providaded');

			date = new Date(date.split('-').join('/'));
		} catch (e) {
			console.log('Error', e);

			date = getMonthRef();
		}

		return date;
	};

	const getFormattedDate = (date) => {
		return date.toLocaleDateString().split('/').reverse().slice(0, 2).join('-');
	};

	const setupOverview = () => {
		var links = document.querySelectorAll('#overview-container');

		for (link of links) {
			link.addEventListener('click', (e) => {
				var params = new URLSearchParams(location.search);

				var date = params.get('from');

				var url = location.origin + e.target.getAttribute('href');

				if (date) {
					url = `${url}?from=${date}`;
				}

				location.href = url;
			});
		}
	};

	if (document.querySelector('#month-name')) {
		document.querySelector('#month-name').innerHTML = getDateFromParam().toLocaleString('default', {
			month: 'long',
		});
	}

	if (document.querySelector('#bt-home')) {
		document.querySelector('#bt-home').addEventListener('click', (e) => {
			location.href = `${location.origin}/${location.search}`;
		});
	}

	if (document.querySelector('#bt-open-expenses')) {
		document.querySelector('#bt-open-expenses').addEventListener('click', (e) => {
			location.href = `${location.origin}/expenses${location.search}`;
		});
	}

	if (document.querySelector('#bt-next-month')) {
		document.querySelector('#bt-next-month').addEventListener('click', (e) => {
			const date = getDateFromParam();
			date.setMonth(date.getMonth() + 1);

			location.href = `${location.origin}${location.pathname}?from=${getFormattedDate(date)}`;
		});
	}

	if (document.querySelector('#bt-prev-month')) {
		document.querySelector('#bt-prev-month').addEventListener('click', (e) => {
			const date = getDateFromParam();
			date.setMonth(date.getMonth() - 1);

			location.href = `${location.origin}${location.pathname}?from=${getFormattedDate(date)}`;
		});
	}

	setupOverview();
})();
