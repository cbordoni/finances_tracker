const TRANSACTION_STATUS = {
	PENDING: 0,
	CONFIRMED: 1,
};

const getStatusColor = (expense) => {
	switch (expense.status) {
		case TRANSACTION_STATUS.PENDING:
			return '#e0e0e0';
		case TRANSACTION_STATUS.CONFIRMED:
			return '#81c784';
	}
};

const getStatusIcon = (expense) => {
	switch (expense.status) {
		case TRANSACTION_STATUS.PENDING:
			return 'schedule';
		case TRANSACTION_STATUS.CONFIRMED:
			return 'done';
	}
};

module.exports = {
	TRANSACTION_STATUS,
	getStatusColor,
	getStatusIcon,
};
