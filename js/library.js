goog.provide('napster.library');


var library	= new function () {




/**
* @namespace Library
*/
var self	= this;




/**
* @function
* @property {void} Adds track to library
* @param {string} trackid
*/
var addTrack;




self.addTrack	= function (trackid) {
	datastore.user().library.push(trackid);

	var wait		= new goog.async.ConditionalDelay(function () { return datastore.data.track[trackid]; });
	wait.onSuccess	= function () {
		ui.notify('Added "{0}" by {1}'.assign({0: datastore.data.track[trackid].title, 1: datastore.data.track[trackid].artist}));
	};
	wait.start(0, 60000);
};


};