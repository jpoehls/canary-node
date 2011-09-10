//var expresso = require('expresso');
var assert = require('assert');
var vows = require('vows');
//var should = require('should');
var console = require('console');
var util = require('util');

// hasher stuff
var Sha1 = require('./sha1').Sha1;

// mongo stuff
var mongodb = require('mongodb');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;


vows.describe('Sha1 hasher').addBatch({
	'when hashing "abc"': {
		topic: function() { return Sha1.hash('abc'); }
		,'we get the expected hash': function(topic) {
			assert.equal(topic, 'a9993e364706816aba3e25717850c26c9cd0d89d');
		}
	}
}).export(module);
var client;
vows.describe('Mongo experiement').addBatch({
	// context
	'opening connection': {
		topic: function() {
			client = new Db('test', new Server('127.0.0.1', 27017, {}));
			client.open(this.callback);
		}
		,'shouldn\'t throw an error': function(error, collection) {
			assert.equal(error, null);
		}

		// sub-context
		,'inserting record': {
			// use callback args from opening the connection
			topic: function(error, collection) {
				var collection = new mongodb.Collection(client, 'test_collection');
				collection.insert({hello: 'world'}, {safe:true}, this.callback);
			}
			,'shouldn\'t throw an error': function(error, objects) {
				assert.equal(error, null);
			}

			// sub-sub-context
			,'then getting the count': {
				// use callback args from inserting the record
				topic: function(error, objects, connectionError, collection) {
					collection.find().toArray(this.callback);
				}
				,'should be 1': function(error, docs) {
					assert.equal(docs.length, 1);
				}
			}
		}
	}
}).export(module);

/*
module.exports = {
	'make sure hasher returns expected value': function() {
		// http://www.movable-type.co.uk/scripts/sha1.html
		var hash = Sha1.hash('abc');
		hash.should.equal('a9993e364706816aba3e25717850c26c9cd0d89d');
	}

	,'test mongo stuff': function() {
		var client = new Db('test', new Server("127.0.0.1", 27017, {})),
		    test = function (err, collection) {
		      collection.insert({a:2}, function(err, docs) {

		        collection.count(function(err, count) {
		        	assert.equal(count, 1);
		        });

		        // Locate all the entries using find
		        collection.find().toArray(function(err, results) {
		        	assert.equal(results.length, 1);
		        	assert.equal(results.a, 2);

		        	// Let's close the db
		        	client.close();
		        });
		      });
		    };

		client.open(function(err, p_client) {
		  client.collection('test_insert', test);
		});
	}
};
*/