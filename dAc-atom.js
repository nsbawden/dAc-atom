/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * http://ejohn.org/blog/simple-javascript-inheritance/
 * MIT Licensed.
 */
/*global Class xyz zag */

var Atom = function() {}; // google closure compile magic

(function() {
	var initializing = false;
	var fnTest = /xyz/.test(function() {
		xyz();
	}) ? /\b_super\b/ : /.*/;

	// The base Atom implementation (does nothing)
	//this.Atom = function() {};
	//debugger;

	// Create a new Atom that inherits from this class
	Atom.extend = function(prop) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new Atom();
		initializing = false;
		
		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we're overwriting an existing function
			if (typeof prop[name] === "function" &&
				typeof _super[name] === "function" && fnTest.test(prop[name]))
				prototype[name] = (function(name, fn) {
					return function() {
						var tmp = this._super;

						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = _super[name];

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						var ret = fn.apply(this, arguments);
						this._super = tmp;

						return ret;
					};
				})(name, prop[name]);
			else if (typeof prop[name] == 'function')
				prototype[name] = prop[name];
		}

		// The dummy class constructor
		function Atom2() {
			// Extend non-functoin properties directly on the object
			for (var name in prop) {
				if (typeof prop[name] !== 'function')
					this[name] = prop[name];
			}
			// All construction is actually done in the init method
			if (!initializing && this.init)
				this.init.apply(this, arguments);
		}
		
		// Populate our constructed prototype object
		Atom2.prototype = prototype;

		// Enforce the constructor to be what we expect
		Atom2.prototype.constructor = Atom;

		// And make this class extendable
		Atom2.extend = arguments.callee;

		prototype.getClassName = function() {
			var funcNameRegex = /function (.{1,})\(/;
   			var results = (funcNameRegex).exec((this).constructor.toString());
   			debugger;
			return (results && results.length > 1) ? results[1] : "";
		};
		
		prototype.forEach = function forEach(fn) {
		    for (var k in this) {
		        if (this.hasOwnProperty(k))
		            fn(k, this[k]);
		    }
		};
		
		prototype.stringify = function() {
			try {
				return JSON.stringify(zag(this));
			} catch (ex) {
				debugger;
			}
			return '';
		};
		
		prototype.parse = function(json) {
			try {
				$.extend(this, JSON.parse(json));
			} catch (ex) {
				debugger;
			}
			return this;
		};
		
		prototype.dump = function() {
			this.forEach(function(k, v) {
				console.log(k + ' = (' + typeof(v) + ') ' + v);
			});
		};

		return Atom2;
	};
})();

