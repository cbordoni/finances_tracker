(function () {
	if (document.querySelector('#bt-add-expense')) {
		document.querySelector('#bt-add-expense').addEventListener('click', (e) => {
			location.href = `${location.origin}/expenses/create${location.search}`;
		});
	}
})();
