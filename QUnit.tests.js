/*global QUnit F deepEqual QUint ok Atom zig*/

(function($, window, undefined) {

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Google Closure Compiler Magic

	var QUnit = zig(window['QUnit']);


	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// QUnit reconfiguration for lazy loading

	if (sessionStorage['QUintGo'] != 'y') {
		QUnit.test = QUnit.skip;
		QUnit.config.hidepassed = true;
	}

	sessionStorage['QUintGo'] = 'n';

	var qTmr = setInterval(function() {
		if ($('button:contains(Go)')['length'] > 0) {
			$('button:contains(Go)')['click'](function() {
				sessionStorage['QUintGo'] = 'y';
			});
			clearInterval(qTmr);
		}
	}, 50);

	QUnit.begin(function() {
		$.allowScroll && $.allowScroll(false);
		$('#QUnitOuter')['hide']();
		QUnit.myLogs = {};
	});
	QUnit.done(function(totals) {
		$.allowScroll && $.allowScroll(true);
		$('#QUnitOuter')['show']();
		if (Object.keys(QUnit.myLogs).length) { // Test for empty logs
			QUnit.myLogs.totals = totals;
			// $.ajax({
			// 	url: SimpleUserStreamOptions.ajaxurl,
			// 	type: 'POST',
			// 	dataType: 'json',
			// 	data: {
			// 		action: 'save_unit_test',
			// 		userId: (window.UserData || {}).wkid || 0,
			// 		testResults: JSON.stringify(QUnit.myLogs || {})
			// 	},
			// 	success: function(data) {
			// 		console.log("save unit test: " + JSON.stringify(data,null,4));
			// 	},
			// 	error: function(x, status, error) {
			// 		console.log("save unit test error: " + status + " : " + error );
			// 	}
			// });
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

	QUnit.module("dAc-atom");

	var BigAtom = Atom.extend({
		neutrons: 5,
		protons: 2,
		electrons: 22,

		init: function(prop) {
			$.extend(this, prop);
		},

		explode: function() {
			this.destroyed = true;
		}
	});


	var a1 = new BigAtom({
		energy: 42
	});

	QUnit.test("bvt - instanceof", function(p) {
		p.ok(a1 instanceof Atom, 'Passed instanceof Atom');
		p.ok(a1 instanceof BigAtom, 'Passed instanceof BigAtom');
	});

	QUnit.test("bvt - has properties", function(p) {
		p.ok(a1.electrons === 22, 'Passed has primary property 22 electrons');
		p.ok(a1.energy === 42, 'Passed has extended property 42 energy');
	});

	QUnit.test("bvt - stringify", function(p) {
		p.ok(a1.stringify() === '{"neutrons":5,"protons":2,"electrons":22,"energy":42}', a1.stringify());
	});

	QUnit.test("bvt - child methods", function(p) {
		a1.explode();
		p.ok(a1.destroyed === true, a1.destroyed);
	});

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Custom extensions for SimpleUserStream

	// Below require FuncUnit installed
	if (!window['F'])
		return;

	F.itemId = function(setFn) {
		F.defer(function() {
			var l = parseInt(window.HgComm.myLastStreamId);
			if (l > 0) {
				setFn(l);
				ok(true, "last stream item insert id " + l);
				return true;
			}
			return false;
		});
	};

	F.clickInStream = function(selFn) {
		var sel;
		F.scrollIntoView('#Stream');
		F.loop(function(i, next, success) {
			sel = sel || selFn();
			if ($('#StreamOuter .stream-open').length) {
				var $el = $(sel);
				if ($el.length) {
					$el.click();
					ok(true, "found $(" + sel + ") in stream after " + ((i - 1) / 2) + " tries - clicking on it");
					return success();
				}
				$('#Stream').click();
				F.waitOn(next, function() {
					return $('#StreamOuter .stream-open').length === 0;
				});
			} else {
				$('#Stream').click();
				F.waitOn(next, function() {
					return $('#StreamOuter .stream-open').length !== 0;
				});
			}
		});
	};

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration

	F.speed = 0;
	F.timeout = 5000;
	F.waitAsserts = true;
	F.abortAsserts = true;

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// FuncUnit extensions

	F.true = function() {
		return true;
	};

	F.defer = function(fn, msg) {
		var tm = 0,
			cnt = 0;

		function _do(success, error) {
			tm = tm || (new Date()).getTime();
			var ic = fn(cnt++);
			if (ic) {
				if (msg)
					ok(true, typeof(msg) == 'function' ? msg() : msg);
				success();
				return;
			}
			if ((new Date()).getTime() - tm > F.timeout) {
				if (msg)
					ok(false, typeof(msg) == 'function' ? msg() : msg);
				window.FuncUnit._queue = []; // stop here
				error();
			} else
				setTimeout(function() {
					_do(success, error);
				}, 13);
		}
		F.add({
			method: _do,
			timeout: F.timeout + 5000
		});
	};

	F.loop = function(fn, msg) {
		var tmr, tmr2, cnt = 0;

		function _do(success, error) {
			function nxt() { // next
				tmr2 = setTimeout(function() {
					fn(cnt++, nxt, suc, err);
				}, 13);
			}

			function suc() { // success
				clearTimeout(tmr);
				if (msg)
					ok(true, typeof(msg) == 'function' ? msg() : msg);
				success();
			}

			function err() { // error
				clearTimeout(tmr);
				if (msg)
					ok(false, typeof(msg) == 'function' ? msg() : msg);
				window.FuncUnit._queue = []; // stop here
				error();
			}
			fn(cnt++, nxt, suc, err);
			// Timeout detector
			tmr = setTimeout(function() {
				clearTimeout(tmr2);
				if (msg)
					ok(false, typeof(msg) == 'function' ? msg() : msg);
				else
					ok(false, "F.loop timed out");
				window.FuncUnit._queue = []; // stop here
				error();
			}, F.timeout);
		}
		F.add({
			method: _do,
			timeout: F.timeout + 5000
		});
	};

	F.action = function(fn, msg) {
		F.defer(function(i) {
			fn(i);
			return true;
		}, msg);
	};

	F.stop = function() {
		F.action(function() {
			window.FuncUnit._queue = []; // stop here
			ok(false, "stopping on explicit stop command");
		});
	};

	F.scrollIntoView = function(select) {
		F.defer(function() {
			var $el = $(select);
			if ($el.length) {
				$el[0].scrollIntoView();
				ok(true, "scrolled to " + select);
				return true;
			}
			ok(false, "scroll could not locate " + select);
			return false;
		});
	};

	F.setSpeed = function(speed) {
		F.action(function() {
			F.speed = speed;
			ok(true, "set speed " + speed);
		});
	};

	F.pressButton = function(select) {
		F(select).visible().click();
		F(select).missing();
	};

	F.waitOn = function(fn, condition, maxWait) {
		var dt = (maxWait < 0) ? 0 - maxWait : (new Date()).getTime() + ((!maxWait) ? 900000000 : maxWait);
		var ic;
		var sel = null;
		if (typeof(condition) === 'function') {
			sel = ic = condition();
		} else {
			sel = $(condition);
			ic = (sel).length > 0;
		}
		if ((new Date()).getTime() <= dt && !ic) {
			setTimeout(function() {
				F.waitOn(fn, condition, 0 - dt);
			}, 13);
			return;
		}
		fn(sel); // passes logic or jQuery object
	};

	F.randomOf = function(max) {
		return Math.floor(Math.random() * max) + 1;
	};


	// :textis extension
	$.expr[':'].textis = function(a, i, m) {
		return a.childNodes[0] && a.childNodes[0].nodeValue === m[3];
	};

})(jQuery, window);
