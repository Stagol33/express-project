// app.js
const express = require('express');
const path = require('path');
const data = require('./data.json');

// Create the Express app
const app = express();

// Set view engine to Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from 'public' directory
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} Request for: ${req.url}`);
	next();
});

// Routes
// Home page route
app.get('/', (req, res) => {
	res.render('index', { 
	projects: data.projects,
	title: 'JavaScript Developer Portfolio' 
	});
});

// About page route
app.get('/about', (req, res) => {
	res.render('about', { 
	title: 'About Me | JavaScript Developer' 
	});
});

// Individual project page route
app.get('/project/:id', (req, res, next) => {
	const projectId = parseInt(req.params.id);
	const project = data.projects.find(p => p.id === projectId);
	
	if (project) {
		res.render('project', { 
			project,
			title: `${project.project_name} | My Portfolio` 
		});
	} else {
		const err = new Error('Project not found');
		err.status = 404;
		next(err);
	}
});

// Handle Chrome DevTools requests
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
	res.status(204).end(); // No content response
});

// 404 handler with template rendering
app.use((req, res, next) => {
	// Skip logging for Chrome DevTools specific requests
	if (!req.url.includes('/.well-known/appspecific/com.chrome.devtools')) {
		console.log(`404 Not Found: ${req.method} ${req.url}`);
	}
	
	const err = new Error(`Page Not Found: ${req.url}`);
	err.status = 404;
	next(err);
});

// Global error handler with template selection based on status code
app.use((err, req, res, next) => {
	// Set default values if not provided
	err.status = err.status || 500;
	err.message = err.message || 'Internal Server Error';
	
	// Skip logging for Chrome DevTools specific requests
	if (!req.url.includes('/.well-known/appspecific/com.chrome.devtools')) {
		console.log(`Error: ${err.message}, Status: ${err.status}`);
	}
	
	// Set status code
	res.status(err.status);
	
	// Choose template based on status code
	if (err.status === 404) {
		res.render('page-not-found', { 
			error: err,
			title: 'Page Not Found' 
		});
	} else {
		res.render('error', { 
			error: err,
			title: `Error ${err.status}` 
		});
	}
});

// Global error handler with suppression for Chrome DevTools requests
app.use((err, req, res, next) => {
	err.status = err.status || 500;
	err.message = err.message || 'Internal Server Error';
	
	// Skip logging for Chrome DevTools specific requests
	if (!req.url.includes('/.well-known/appspecific/com.chrome.devtools')) {
		console.log(`Error: ${err.message}, Status: ${err.status}`);
	}
	
	res.status(err.status);
	res.render('error', { 
		error: err,
		title: `Error ${err.status}` 
	});
});


// Start the server
const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
	console.log(`The application is running on localhost:${PORT}`);
});
