/*global Stocks dAc _ */

/*jshint ignore:start*/
var $ = window['jQuery'];
/*jshint ignore:end*/

var hereMap = {};

var thereMap = {};

function zagMap(map) {
	hereMap !== map && $.extend(hereMap, map);
	for (var k in map) {
		thereMap[map[k]] = k.toString();
	}
}

function zig(o, keys) { // Input
	if (typeof o === 'string')
		return thereMap[o] || o;
	var k, n = {};
	for (k in o) {
		if (!o.hasOwnProperty(k))
			continue;
		if (!keys || keys[k])
			n[thereMap[k] || k] = zObject(o[k]) ? zig(o[k]) : o[k];
		else
			n[thereMap[k] || k] = zObject(o[k]) ? zig(o[k], keys) : o[k];
	}
	return n;
}

function zag(o, keys) { // Output
	if (typeof o === 'string')
		return hereMap[o] || o;
	var k, n = {};
	for (k in o) {
		if (!o.hasOwnProperty(k))
			continue;
		if (!keys || keys[k])
			n[hereMap[k] || k] = zObject(o[k]) ? zag(o[k]) : o[k];
		else
			n[hereMap[k] || k] = zObject(o[k]) ? zag(o[k], keys) : o[k];
	}
	return n;
}

function zigExterns(o) { // Load internal names beside external names on an object
	var k;
	for (k in o) {
		o[thereMap[k] || k] = o[k];
	}
	return o;
}

// Simple and fast object test - does not handle alternative JavaScript objects such as String and RegExp etc.
function zObject(o) {
	return o && typeof o === 'object' && !(o instanceof Array) && !(o instanceof Function) && !(o instanceof Date);
}

// Returns the first property name of o as an internal name
function zName(o) {
	for (var k in o) return k;
}

window['zigMap'] = function(o) {
	var k, ot = '';
	
	for (k in o) {
		if (!o.hasOwnProperty(k))
			continue;
		ot += '\t' + k + ':" ' + k + '",\n';
	}	
	
	return '\n' + ot.substr(0, ot.length-2) + '\n';
};

window['externMap'] = function(o) {
	var k, ot = '';
	
	for (k in o) {
		if (!o.hasOwnProperty(k))
			continue;
		if (typeof(o[k]) === 'function')
			ot += '\t"' + k + '": function() {},\n';
		else
			ot += '\t"' + k + '": {},\n';
	}	
	
	return '\n' + ot.substr(0, ot.length-2) + '\n';
};

zagMap(hereMap);
