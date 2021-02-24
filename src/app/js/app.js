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
	const registerTextField = (parent) => {
		const input = parent.querySelector('.text-field--input');
		const label = parent.querySelector('.text-field--label');

		if (input) {
			input.addEventListener('focus', () => {
				parent.classList.add('is-focused');
			});

			input.addEventListener('input', (e) => {
				if (e.target.value) {
					parent.classList.add('is-filled');
				} else {
					parent.classList.remove('is-filled');
				}
			});

			input.addEventListener('blur', () => {
				parent.classList.remove('is-focused');
			});
		}
	};

	for (let item of document.querySelectorAll('.text-field')) {
		registerTextField(item);
	}

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

	if (document.querySelector('#bt-current-month')) {
		document.querySelector('#bt-current-month').addEventListener('click', (e) => {
			location.href = `${location.origin}${location.pathname}`;
		});
	}

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
