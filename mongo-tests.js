var mongodb = require('mongodb');
var util = require('util');
var console = require('console');

// driver docs: https://github.com/christkv/node-mongodb-native/blob/master/docs

var connection = new mongodb.Db('test', new mongodb.Server('127.0.0.1', 27017, {}));
connection.open(function(error, db) {
	console.log('connection opened!');

	console.log('Database name: ' + db.databaseName);

	db.collectionNames(function(error, names) {
		console.log('Collections: ' + util.inspect(names));

		connection.close(function(error) {
			console.log('connection closed!')
		});
	});
});