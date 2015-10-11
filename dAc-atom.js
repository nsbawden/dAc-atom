/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * http://ejohn.org/blog/simple-javascript-inheritance/
 * MIT Licensed.
 */
/*global Class xyz zag */

var Atom = function() {}; // google closure compile magic

(function() {
	var initializing = false;
	var bn = function(bx) { for (var k in bx) return k; }({_base: 0}); // More google closure magic to get the _base name
	var fnTest = /xyz/.test(function() {
		xyz();
	}) ?  RegExp("\\b" + bn + "\\b") : /.*/;

	// The base Atom implementation (does nothing)
	//this.Atom = function() {};
	//debugger;

	// Create a new Atom that inherits from this class
	Atom = function() {};
	Atom.extend = function(prop) {
		var _base = this.prototype, tx = this;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new tx();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we're overwriting an existing function
			if (typeof prop[name] === "function" &&
				typeof _base[name] === "function" && fnTest.test(prop[name]))
				prototype[name] = (function(name, fn) {
					return function() {
						//var tmp = prototype._base;
						var tmp = this._base;

						// Add a new ._base() method that is the same method
						// but on the super-class
						//prototype._base = _base[name];
						this._base = _base[name];

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						var ret = fn.apply(this, arguments);
						//tmp ? prototype._base = tmp : delete prototype._base;
						tmp ? this._base = tmp : delete this._base;

						return ret;
					};
				})(name, prop[name]);
			else if (typeof prop[name] == 'function')
				prototype[name] = prop[name];
		}

		// The dummy class constructor
		function AtomBase() {
			// Extend non-functoin properties directly on the object
			for (var name in prop) {
				if (typeof prop[name] !== 'function')
					this[name] = prop[name];
			}
			// All construction is actually done in the init method
			if (!initializing && this.init) {
				// So that _base works in init
				//prototype._base = prototype.init;
				this.init.apply(this, arguments);
				//delete prototype._base;
			}
		}

		// Populate our constructed prototype object
		AtomBase.prototype = prototype;

		// Enforce the constructor to be what we expect
		AtomBase.prototype.constructor = AtomBase;

		// And make this class extendable
		AtomBase.extend = arguments.callee;

		return AtomBase;
	};

	Atom.prototype.init = function(prop) {
		$.extend(this, prop);
	};

	Atom.prototype.forEach = function forEach(fn) {
		for (var k in this) {
			if (this.hasOwnProperty(k))
				fn.call(this, k, this[k]);
		}
	};

	Atom.prototype.stringify = function() {
		try {
			return JSON.stringify(typeof zag === 'function' ? zag(this) : this);
		} catch (ex) {
			debugger;
		}
		return '';
	};

	Atom.prototype.parse = function(json) {
		try {
			$.extend(this, JSON.parse(json));
		} catch (ex) {
			debugger;
		}
		return this;
	};

	Atom.prototype.dump = function() {
		this.forEach(function(k, v) {
			console.log(k + ' = (' + typeof(v) + ') ' + v);
		});
	};

})();
