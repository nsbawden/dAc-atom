/*global Stocks dAc _ */

/*jshint ignore:start*/
var $ = window['jQuery'];
/*jshint ignore:end*/

var hereMap = {
	// Test objects
	neutrons: 'neutrons',
	protons: 'protons',
	electrons: 'electrons',
	energy: 'energy',
	destroyed: 'destroyed',
	superDestroyed: 'superDestroyed',
	explode: 'explode',
	
	// QUnit
	urlParams:"urlParams",
	isLocal:"isLocal",
	module:"module",
	asyncTest:"asyncTest",
	test:"test",
	skip:"skip",
	start:"start",
	stop:"stop",
	config:"config",
	is:"is",
	objectType:"objectType",
	extend:"extend",
	load:"load",
	begin:"begin",
	done:"done",
	log:"log",
	testStart:"testStart",
	testDone:"testDone",
	moduleStart:"moduleStart",
	moduleDone:"moduleDone",
	reset:"reset",
	pushFailure:"pushFailure",
	assert:"assert",
	equiv:"equiv",
	dump:"dump",
	jsDump:"jsDump",
	expect:"expect",
	async:"async",
	push:"push",
	ok:"ok",
	equal:"equal",
	notEqual:"notEqual",
	propEqual:"propEqual",
	notPropEqual:"notPropEqual",
	deepEqual:"deepEqual",
	notDeepEqual:"notDeepEqual",
	strictEqual:"strictEqual",
	notStrictEqual:"notStrictEqual",
	throws:"throws",
	raises:"raises",
	diff:"diff",
	init:"init",
	
	// QUnit.config
	queue:"queue",
	blocking:"blocking",
	reorder:"reorder",
	altertitle:"altertitle",
	scrolltop:"scrolltop",
	requireExpects:"requireExpects",
	urlConfig:"urlConfig",
	modules:"modules",
	currentModule:"currentModule",
	callbacks:"callbacks",
	filter:"filter",
	testId:"testId",
	pageLoaded:"pageLoaded",
	stats:"stats",
	moduleStats:"moduleStats",
	started:"started",
	updateRate:"updateRate",
	autostart:"autostart",
	fixture:"fixture",
	hidepassed:"hidepassed",
	noglobals:"noglobals",
	notrycatch:"notrycatch",
	depth:"depth",
	current:"current",
	pollution:"pollution",
	autorun:"autorun"

};

var thereMap = {};

function zagMap(map) {
	hereMap !== map && $.extend(hereMap, map);
	for (var k in map) {
		if (thereMap[map[k]]) // duplicate entry
			debugger;
		thereMap[map[k]] = k.toString();
	}
}

function zig(o, keys) { // Input
	var k, n = {};
	for (k in o) {
		if (!o.hasOwnProperty(k))
			continue;
		//if (!thereMap[k]) console.log('zig missing ' + k);
		if (!keys || keys[k])
			n[thereMap[k] || k] = $['isPlainObject'](o[k]) ? zig(o[k]) : o[k];
		else
			n[k] = $['isPlainObject'](o[k]) ? zig(o[k], keys) : o[k];
	}
	//if (n['pref']) debugger;
	return n;
}

function zag(o, keys) { // Output
	var k, n = {};
	for (k in o) {
		if (!o.hasOwnProperty(k))
			continue;
		if (!keys || keys[k])
			n[hereMap[k] || k] = $['isPlainObject'](o[k]) ? zag(o[k]) : o[k];
		else
			n[k] = $['isPlainObject'](o[k]) ? zag(o[k], keys) : o[k];
	}
	return n;
}

window['zigMap'] = function(o) {
	var k, ot = '';
	
	for (k in o) {
		if (!o.hasOwnProperty(k))
			continue;
		ot += '\t' + k + ':"' + k + '",\n';
	}	
	
	return '\n' + ot.substr(0, ot.length-2) + '\n';
};

// function zigExterns() { // Output
// 	var i, l, k, z, o;
// 	for (i=0, l = arguments.length; i<l; i++) {
// 		o = arguments[i];
// 		if (o) for (k in o) {
// 			z = thereMap[k];
// 			if (z) {
// 				if (o.prototype && o.prototype[k])
// 					o.prototype[z] = o.prototype[k];
// 				if (o.hasOwnProperty(k))
// 					o[z] = o[k];
// 			}
// 		}
// 	}
// }

zagMap(hereMap);

