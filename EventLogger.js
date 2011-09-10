// EventLogger.js

var Sha1 = require('./sha1').Sha1;

exports.EventLogger = logger = function(dataStore) {
	// expects a DataStore
	this.dataStore = dataStore;
}

logger.prototype.log = function(event, callback) {
  if (!callback) return; // if no callback, do nothing

  try {
	  if (!event) throw new Error('event parameter is required');
	  if (!event.token || !event.common)
	  	throw new Error('event is required to have the following properties: token:"", common:{}');

	  // make sure the event has at least an empty details collection
	  event.details = event.details || {};

	  // make sure the event has a level
	  event.level = event.level || 1;

	  // ensure the event has a timestamp
	  // TODO: this should be a UTC timestamp
	  event.time = event.time || new Date();

	  // note: event.common can only have simple properties (no objects or arrays)

	  // smash together all the 'common' properties for hashing
	  var smash = '';
	  for (var prop in event.common) {
	  	if (!event.common.hasOwnProperty(prop)) continue;

	  	smash += event.common[prop].toString();
	  }
	  // also smash in the level
	  smash += event.level.toString();

	  // generate the hash
	  event.hash = Sha1.hash(smash);

	  // add the event to the data store
	  this.dataStore.addEvent(event, function(err) {

	  	// let our caller know that we are done
	  	if (callback) callback(err, event);
	  });
	}
	catch (err) {
		callback(err);
	}
}