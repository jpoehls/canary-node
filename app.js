var express = require('express');
var DataStore = require('./DataStore-memory').DataStore;
var EventLogger = require('./EventLogger').EventLogger;
var uuid = require('node-uuid');

var	app = module.exports = express.createServer();

// Configuration

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.set('view options', {
		layout: 'layout'
	});
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Routes

// INDEX - show info on how add logging to your app
app.get('/', function(req, res) {
	var token = uuid();
	token = token.replace('-', '');
	
	res.render('index', {
		token: token
	});
});

// LOG DASHBOARD - show collected log entries
app.get('/data/:token', function(req, res) {
	var dataStore = new DataStore();
	var counter = 0;

	var all_events = null;
	var top_events = null;

	function sendResponse() {
		if (counter !== 2) return;

		res.render('dashboard', {
			token: req.params.token,
			events: all_events,
			top_events: top_events
		});
	}

	dataStore.getAllEvents(req.params.token, function(err, events) {

		if (err) res.send(500, err);
		
		all_events = events;
		counter++;
		sendResponse();
	});

	dataStore.getTopEvents(req.params.token, function(err, events) {

		if (err) res.send(500, err);
		
		top_events = events;
		counter++;
		sendResponse();
	});
});

// EVENT DETAILS - show details about a specific logged event
app.get('/data/:token/:hash', function(req, res) {
	var dataStore = new DataStore();
	dataStore.getEvent(req.params.token, req.params.hash, function(err, event) {

		if (event) {
			res.render('details', {
				token: req.params.token,
				event: event,
				eventRaw: JSON.stringify(event, null, '    ')
			})
		}
		else {
			res.send('Event does not exist.');
		}
	});
});

app.get('/test', function(req, res) {
	res.render('test', { layout: null });
});

// LOG RECEIVER - receives log entries from applications
app.post('/squawk', function(req, res) {

	if (!req.is('json')) {
		res.send('Only JSON POSTs are supported.', 500);
		return;
	}

	// send the response right away
	res.send(); // 204

	var jsonEvent = req.body;

	console.log('Squawk received!');
	console.log(jsonEvent);

	var dataStore = new DataStore();
	var logger = new EventLogger(dataStore);
	
	logger.log(jsonEvent, function(err, loggedEvent) {
		if (err) console.log('ERROR logging event', err);
		else console.log(loggedEvent);
	});

	// example payload
	/*var payload = {
		"time": "9/7/2011 2:22:54 AM",
		"token": "RANDOM_TOKEN",
		"level": 1,
		"common": [
			"type": "NullReferenceException",
			"message": "...",
			"source": "..."
		],
		"details": [
			"user": "me",
			"platform": "win32",
			"cookies": [
				{ "name": "SESSION_ID",
				  "value": "124380870SJFDK" },
				{ "name": "email",
			      "value": "someone@somewhere.com" }
			]
		]
	};*/
});

// Power up

app.listen(3000);
console.log('Canary server listening on port %d in %s mode', app.address().port, app.settings.env);