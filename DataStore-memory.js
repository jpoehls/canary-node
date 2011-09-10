// DataStore-memory.js
//
// DataStore - in-memory implementation

var ds = exports.DataStore = function() {};

// static cache of events (shared across all instances of the repository)
ds.prototype.cache = [];

/*
// document example
{
  "token": "RANDOM_TOKEN",
  "hash": "hash of common data",
  "last_time": Date(),
  "level": 1,
  "common": {
    //...
  },
  "occurances": [
    {
      "time": Date(),
      "details": {
        //...
      }
    }
  ]
}
*/

ds.prototype.addEvent = function(event, callback) {

  if (!callback) return; // if no callback, do nothing
  
  try {
    // guard against sucky input
    if (!event) throw new Error('event parameter is required');
    if (!event.token || !event.hash || !event.common || !event.details || !event.level || !event.time)
      throw new Error('event is required to have the following properties: token:"", time:Date, hash:"", level:0, common:{} and details:{}');

    var doc = null;
    for (var i=0; i<this.cache.length; i++) {
      if (this.cache[i].token === event.token && this.cache[i].hash === event.hash) {
        doc = this.cache[i];
        break;
      }
    }
    if (!doc) {
      doc = { occurances: [] };
      this.cache.push(doc);
    }

    doc.token = event.token;
    doc.hash = event.hash;
    doc.last_time = event.time;
    doc.level = event.level;
    doc.common = event.common;
    doc.occurances.push({
      time: event.time,
      details: event.details
    });
  }
  catch (err) {
    callback(err);
  }
};

ds.prototype.getEventSummaries = function(token, callback) {
  if (!callback) return; // if no callback, do nothing

  try {
    // guard against sucky input
    if (!token) throw new Error('token parameter is required');

    var results = [];
    for (var i=0; i<this.cache.length; i++) {
      var ev = this.cache[i];
      if (ev.token === token) {
        results.push({
          hash: ev.hash,
          total: ev.occurances.length,
          type: ev.common.type,
          message: ev.common.message,
          last_time: ev.last_time,
          level: ev.level
        });
      }
    }

    callback(null, results);
  }
  catch (err) {
    callback(err);
  }
}

ds.prototype.getEvent = function(token, hash, callback) {
  if (!callback) return; // if no callback, do nothing
  
  try {
    // guard against sucky input
    if (!token) throw new Error('token parameter is required');
    if (!hash) throw new Error('hash parameter is required');

    var result = null;
    for (var i=0; i<this.cache.length; i++) {
      if (this.cache[i].token === token && this.cache[i].hash === hash) {
        result = this.cache[i];
        break;
      }
    }

    callback(null, result);
  }
  catch (err) {
    callback(err);
  }
}