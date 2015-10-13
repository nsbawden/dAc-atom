/*global QUnit F deepEqual QUint ok Atom zagMap zName */

(function() {

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// QUnit reconfiguration for lazy loading

	if (sessionStorage['QUintGo'] != 'y') {
		QUnit.test = QUnit.skip;
		QUnit.config.hidepassed = true;
	}

	sessionStorage['QUintGo'] = 'n';

	var qTmr = setInterval(function() {
		if ($('button:contains(Go)')['length'] > 0) {
			$('button:contains(Go),a:contains(Rerun)')['click'](function() {
				sessionStorage['QUintGo'] = 'y';
			});
			clearInterval(qTmr);
		}
	}, 50);

	QUnit.begin(function() {
		$['allowScroll'] && $['allowScroll'](false);
		$('#QUnitOuter')['hide']();
		QUnit.myLogs = {};
	});
	QUnit.done(function(totals) {
		$['allowScroll'] && $['allowScroll'](true);
		$('#QUnitOuter')['show']();
		if (Object.keys(QUnit.myLogs).length) { // Test for empty logs
			QUnit.myLogs.totals = totals;
			QUnit.myLogs = {};
		}
	});
	QUnit.log(function(details) {
		if (!QUnit.myLogs)
			QUnit.myLogs = {};
		if (!QUnit.myLogs[details.module])
			QUnit.myLogs[details.module] = {};
		if (!QUnit.myLogs[details.module][details.name])
			QUnit.myLogs[details.module][details.name] = {};
		QUnit.myLogs[details.module][details.name][(new Date()).getTime()] = details;
	});

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Basic tests

	QUnit.module("Test dAc-atom and zigzag");

	zagMap({
		// Test objects
		kind: 'kind',
		neutrons: 'neutrons',
		protons: 'protons',
		electrons: 'electrons',
		zartons: 'zartons',
		energy: 'energy',
		destroyed: 'destroyed',
		superDestroyed: 'superDestroyed',
		explode: 'explode',
		split: 'split',
		_spin1: '_spin1',
		bigAtom: 'bigAtom',
		bigAtom2: 'bigAtom2',
		bigUnder: 'bigUnder',
		another: 'another'
	});

	var basicBigAtom = '{"kind":"BigAtom","neutrons":5,"protons":2,"electrons":22,"energy":42,"destroyed":true}';

	var hugeAtomEach = '{"kind":"HugeAtom","neutrons":"50","protons":"20","bigAtom":"[object Object]","bigUnder":"[object Object]","electrons":"22","energy":"420","split":"half","destroyed":"true","superDestroyed":"true"}';
	var basicHugeAtom = '{"kind":"HugeAtom","neutrons":50,"protons":20,"bigAtom":{"kind":"BigAtom","neutrons":10,"protons":2,"electrons":22},"bigUnder":{"bigAtom2":{"kind":"BigAtom","neutrons":7,"protons":2,"electrons":22}},"electrons":22}';
	var fullHugeAtom = '{"kind":"HugeAtom","neutrons":50,"protons":20,"bigAtom":{"kind":"BigAtom","neutrons":10,"protons":2,"electrons":22},"bigUnder":{"bigAtom2":{"kind":"BigAtom","neutrons":7,"protons":2,"electrons":22}},"electrons":22,"energy":420,"split":"half","destroyed":true,"superDestroyed":true}';

	var x, r2;

	var BigAtom = Atom.extend({
		kind: 'BigAtom',
		neutrons: 5,
		protons: 2,
		electrons: 22,

		init: function(prop) {
			this._base(prop);
		},

		explode: function() {
			this.destroyed = true;
			return this;
		}
	});

	var HugeAtom = BigAtom.extend({
		kind: 'HugeAtom',
		neutrons: 50,
		protons: 20,
		bigAtom: new BigAtom({
			neutrons: 10
		}),
		bigUnder: {
			bigAtom2: new BigAtom({
				neutrons: 7
			})
		},
		function_a: function() {},
		function_b: function() {
			return false;
		},

		explode: function() {
			this._base();
			this.superDestroyed = true;
			r2 = this.stringify();
			return this;
		}
	});

	var a1 = new BigAtom({
		energy: 42
	});

	var a2 = new HugeAtom({
		energy: 420
	});

	a2.split = 'half'; // Add a property directly
	a2._spin1 = 'right'; // underscore properties must be quoted or zagged
	a2["_spin2"] = 'left'; // underscore properties must be quoted or zagged

	QUnit.test("bvt - Is advanced compile", function(p) {
		var n = zName({
			_INTERNAL: 0
		});
		p.notStrictEqual(n, '_INTERNAL', n + ' !== _INTERNAL when advanced compile is in effect');
	});

	QUnit.test("bvt - instanceof", function(p) {
		p.ok(a1 instanceof Atom, 'instanceof Atom');
		p.ok(a1 instanceof BigAtom, 'instanceof BigAtom');
		p.ok(a2 instanceof HugeAtom, 'instanceof HugeAtom');
	});

	QUnit.test("bvt - BigAtom has properties", function(p) {
		p.strictEqual(a1.protons, 2, a1.protons);
		p.strictEqual(a1.energy, 42, a1.energy);
	});

	QUnit.test("bvt - BigAtom child methods", function(p) {
		a1.explode();
		p.strictEqual(a1.destroyed, true, a1.destroyed);
	});

	QUnit.test("bvt - HugeAtom has properties", function(p) {
		p.strictEqual(a2.protons, 20, a2.protons);
		p.strictEqual(a2.energy, 420, a2.energy);
	});

	QUnit.test("bvt - HugeAtom child methods", function(p) {
		a2.explode();
		p.strictEqual(a1.destroyed, true, a1.destroyed);
		p.strictEqual(a2.destroyed, true, a2.destroyed);
	});

	QUnit.test("bvt - BigAtom stringify", function(p) {
		p.strictEqual(a1.stringify(), basicBigAtom, a1.stringify());
	});

	QUnit.test("bvt - HugeAtom new atom as property", function(p) {
		p.strictEqual(typeof a2.bigAtom, 'object', typeof a2.bigAtom);
	});

	QUnit.test("bvt - HugeAtom stringify", function(p) {
		p.strictEqual(a2.stringify(), fullHugeAtom, a2.stringify());
	});

	QUnit.test("bvt - Stringify looks same from inside as out", function(p) {
		p.strictEqual(r2, fullHugeAtom, r2);
	});

	QUnit.test("bvt - Foreach is the right stuff", function(p) {
		var rx1 = '';
		a2.forEach(function(n, v, z) {
			rx1 += '"' + z + '":"' + v + '",';
		});
		rx1 = '{' + rx1.substr(0, rx1.length - 1) + '}';
		p.strictEqual(rx1, hugeAtomEach, rx1);
	});

	QUnit.test("bvt - Stringifying then parsing restores kind", function(p) {
		var k1 = a2.stringify();
		var a3 = new HugeAtom().parse(k1);
		p.strictEqual(k1, a3.stringify(), a3.stringify());
		p.strictEqual(a3.bigAtom instanceof BigAtom, true, 'bigAtom is BigAtom');
		p.strictEqual(a3.bigAtom instanceof HugeAtom, false, 'bigAtom is not HugeAtom');
		p.strictEqual(a3.bigUnder.bigAtom2 instanceof BigAtom, true, 'bigUnder.bigAtom2 is BigAtom');
		
		var a4 = new HugeAtom({
			another: {
				another: {
					another: new BigAtom()
				}
			}
		});
		var k4 = a4.stringify();
		p.strictEqual(k4, a4.stringify(), a4.stringify());
		p.strictEqual(a4.another.another.another instanceof BigAtom, true, 'another.another.another is BigAtom');
	});

	QUnit.test("bvt - Atom kinds", function(p) {
		x = (new Atom()).kindOf();
		p.strictEqual(x, 'unknown', 'Atom without a kind is unknown');
		x = a1.kindOf();
		p.strictEqual(x, 'BigAtom', x);
		x = a2.kindOf();
		p.strictEqual(x, 'HugeAtom', x);
	});

	QUnit.test("bvt - Atom.New()", function(p) {
		x = Atom.New('BigAtom', {
			energy: 42
		}).explode().stringify();
		p.strictEqual(x, basicBigAtom, x);

		p.throws(function() {
			Atom.New('NoAtom');
		}, 'Creating unregistered Atom kind does throw an error');

	});

	QUnit.test("bvt - Atom.MergeLeft()", function(p) {
		var a3 = new BigAtom;
		Atom.MergeLeft(a3, {neutrons: 42, zartons: 42});
		var r3 = '{"kind":"BigAtom","neutrons":5,"protons":2,"electrons":22,"zartons":42}';
		p.strictEqual(a3.stringify(), r3, a3.stringify());
	});

	QUnit.test("bvt - .set()", function(p) {
		var a3 = new HugeAtom();
		p.strictEqual(a3.electrons, 22, a3.electrons);
		a3.set('electrons', 33);
		p.strictEqual(a3.electrons, 33, a3.electrons);
		var r3 = basicHugeAtom.replace(/"electrons":22}$/, '"electrons":33}');
		p.strictEqual(a3.stringify(), r3, a3.stringify());
	});

	QUnit.test("bvt - Atom.Reconstruct()", function(p) {
		var a3 = new HugeAtom;
		var raw = JSON.parse(a3.stringify());
		var a4 = Atom.Reconstruct(raw);
		p.strictEqual(a4 instanceof HugeAtom, true, "self instanceof HugeAtom");
		p.strictEqual(a4.bigAtom instanceof BigAtom, true, "self.bigAtom instanceof BigAtom");
		p.strictEqual(a4.stringify(), basicHugeAtom, a4.stringify());
	});

})();