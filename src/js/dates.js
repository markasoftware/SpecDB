const dates = {
	parse: c => {
		if(/^\d{4}-\d{2}-\d{2}$/.test(c)) {
			return new Date(c);
		}
		// yyyy-mm
		if(/^\d{4}-\d{2}$/.test(c)) {
			return new Date(`${c}-01`);
		}
		// yyyy
		if(/^\d{4}$/.test(c)) {
			return new Date(+c, 0);
		}
		// quarter or half (Q2 2017, for example)
		if(/^[QH]\d \d{4}$/.test(c)) {
			const yyyy = c.slice(3);
			// H2 == Q3 for comparison purposes
			const q = c.slice(0, 2) === 'H2' ? 3 : +(c[1]);
			return new Date(yyyy, (q - 1) * 3, 1);
		}
		// something weird, maybe TBA?
		return new Date(0);
	},
	longify: c => {
		const months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		];
		const getMonth = () => months[c.slice(5, 7) - 1];
		// yyyy-mm-dd
		if(/^\d{4}-\d{2}-\d{2}$/.test(c)) {
			return `${getMonth()} ${c.slice(8)}, ${c.slice(0, 4)}`;
		}
		// yyyy-mm
		if(/^\d{4}-\d{2}$/.test(c)) {
			return `${getMonth()} ${c.slice(0, 4)}`;
		}
		// Quarters
		if(/^Q\d \d{4}$/.test(c)) {
			return `Quarter ${c[1]}, ${c.slice(3)}`;
		}
		// Halves
		if(/^H\d \d{4}$/.test(c)) {
			return `Half ${c[1]}, ${c.slice(3)}`;
		}
		// yyyy and any other weird stuff
		return c;
	},
};
module.exports = dates;
