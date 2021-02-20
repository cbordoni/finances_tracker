module.exports = (app) => {
	const dir = appRoot + '/application/views/pages/';

	const user = {
		name: 'John Doe',
		email: 'johndoe@gmail.com',
		isAdmin: true,
	};

	// index page
	app.get('/', function (req, res) {
		res.render(dir + 'index', { todos: todos || [], user });
	});

	app.get('/todo/:id', function (req, res) {
		const postId = req.params.id;

		res.render(dir + 'todo', {
			todo: todos.find((todo) => todo.id == postId) || {},
			user: user,
			comments: comments.filter((comment) => comment.postId == postId),
		});
	});

	// about page
	app.get('/about', function (req, res) {
		res.render(dir + 'about');
	});
};
