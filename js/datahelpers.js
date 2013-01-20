goog.provide('datahelpers');


var datahelpers	= new function () {




/**
* @namespace Datahelpers
*/
var self	= this;




/**
* @function
* @property {function} Returns generic handler for Firebase child_added event
* @param {object} dataLocation
*/
var onChildAdded;

/**
* @function
* @property {function} Returns generic handler for Firebase child_removed event
* @param {object} dataLocation
*/
var onChildRemoved;

/**
* @function
* @property {function} Returns generic handler for Firebase value event
* @param {object} dataLocation
* @param {string} key
*/
var onValue;

/**
* @function
* @property {void} Processes track
* @param {string} trackid
* @param {function} callback
*/
var processTrack;

/**
* @function
* @property {void} Syncs local data for specified group
* @param {string} groupid
*/
var syncGroup;

/**
* @function
* @property {void} Syncs local data for specified track
* @param {string} trackid
*/
var syncTrack;




self.onChildAdded	= function (dataLocation) {
	return function (newData) {
		dataLocation[newData.name()]	= newData.val();
		ui.update();
	};
};

self.onChildRemoved	= function (dataLocation) {
	return function (newData) {
		if (dataLocation[newData.name()]) {
			goog.object.remove(dataLocation, newData.name());
		}
		else {
			goog.object.remove(dataLocation, newData.val());
		}
		ui.update();
	};
};

self.onValue	= function (dataLocation, key) {
	return function (newData) {
		dataLocation[key]	= newData.val();
		ui.update();
	};
};

self.processTrack	= function (track, callback) {
	var processedTrack			= track;
	processedTrack.length		= stream.processTime(processedTrack.length);

	/* Will equal epoch if not yet played */
	processedTrack.lastPlayed	= new Date(processedTrack.lastPlayed || 0).format('{12hr}{tt}, {yyyy}-{MM}-{dd}');

	authentication.getUsername(processedTrack.lastPlayedBy, function (username) {
		processedTrack.lastPlayedBy		= username;
		
		callback(processedTrack);
	});
};

self.syncGroup	= function (groupid, shouldStopSync) {
	datastore.data.group[groupid]	= datastore.data.group[groupid] || {id: groupid, members: {}, messages: {}, name: ''};

	var members		= datastore.group(groupid).members().limit(500);
	var messages	= datastore.group(groupid).messages().limit(500);
	var name		= datastore.group(groupid).name;

	members.off('child_added');
	messages.off('child_added');
	name.off('value');

	if (!shouldStopSync) {
		members.on('child_added', self.onChildAdded(datastore.data.group[groupid].members));
		messages.on('child_added', self.onChildAdded(datastore.data.group[groupid].messages));
		name.on('value', self.onValue(datastore.data.group[groupid], 'name'));
	}
	else {
		goog.object.remove(datastore.data.group, groupid);
	}
};

self.syncTrack	= function (trackid, shouldStopSync) {
	datastore.data.track[trackid]	= datastore.data.track[trackid] || {id: trackid};

	var track	= datastore.track(trackid);

	track.off('value');

	if (!shouldStopSync) {
		track.on('value', function (newData) {
			self.processTrack(newData.val(), function (processedTrack) {
				goog.object.forEach(processedTrack, function (value, key) {
					datastore.data.track[trackid][key]	= value;
				});
				ui.update();
			});
		});
	}
	else {
		goog.object.remove(datastore.data.track, trackid);
	}
};


};