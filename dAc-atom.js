/*
 * Complex JavaScript Inheritance By dArtagnans Code
 * Derived from Simple JavaScript Inheritance By John Resig http://ejohn.org/blog/simple-javascript-inheritance/
 * Can be used with or without zig zag support for Advanced Google Closure compilation
 * MIT Licensed.
 *
 * Register a kind by placing a kind property on the atom for extended functionality
 * - or capture atom kinds into vars and new them from the var
 * Example:
 *
 * Atom.extend({kind: 'Person', ...}) then use Atom.New('Person', ...)
 *
 * var Person = Atom.extend(...) then use new Person(...)
 *
 * Atoms with kinds can be type discovered using .kindOf() and do not require the variables
 * - holding their kind instance to be in scope in order for another instance to be newed from it.
 * - They can also be serialized with .stringify() and resored with .parse() maintaining all underlying kinds intact as full Atom objects.
 *
 * Properties beginning with an underscore ( _ ) are prive and will not be included in stringify() output.
 */

/*global Class xyz zig zag */

var _Atoms = window['_Atoms'] = {}; // Mapping of names to atom types - remove the window mapping when high security is desired

var Atom = function() {}; // google closure compile magic

(function() {
	var initializing = false,
		_my = this,
		_itn = function(o) {
			for (var k in o) return k;
		},
		_bn = _itn({
			_base: 0
		}),
		_ki = _itn({
			kind: 0
		}),
		_za = typeof zag === 'function' ? zag : function(x) {
			return x;
		},
		_zi = typeof zig === 'function' ? zig : function(x) {
			return x;
		},
		_bz = /xyz/.test(function() {
			xyz();
		}) ? RegExp("\\b" + _bn + "\\b") : /.*/;

	// The base Atom implementation (does nothing)
	Atom = function() {};

	// Create a new Atom that inherits from this class
	Atom.extend = function(prop) {
		var _base = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this;
		initializing = false;

		// Copy the function properties over onto the new prototype
		for (var name in prop) {
			// Check if we're overwriting an existing function
			if (prop[name] instanceof Function &&
				_base[name] instanceof Function && _bz.test(prop[name]))
				prototype[name] = (function(name, fn) {
					return function() {
						//var tmp = prototype._base;
						var tmp = this._base;

						// Add a new ._base() method that is the same method
						// but on the base-class
						this._base = _base[name];

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						var ret = fn.apply(this, arguments);
						tmp ? this._base = tmp : delete this._base;

						return ret;
					};
				})(name, prop[name]);
			else if (prop[name] instanceof Function)
				prototype[name] = prop[name];
		}

		// The dummy class constructor
		function AtomBase() {
			var v;
			// Extend non-function properties directly on the object
			for (var name in prop) {
				if (typeof prop[name] !== 'function')
					this[name] = prop[name];
			}
			// Surface public prototype chain properties
			for (var k in this) {
				if (this.hasOwnProperty(k) || typeof this[k] === 'function' || _za(k).charAt(0) === '_' || k === _bn)
					continue;
				// Move the property to the top level
				v = this[k];
				delete this[k];
				this[k] = v;
			}
			// Remaining construction is done in the init method
			if (!initializing && this.init)
				this.init.apply(this, arguments);
		}

		// Populate our constructed prototype object
		AtomBase.prototype = prototype;

		// Enforce the constructor to be what we expect
		AtomBase.prototype.constructor = AtomBase;

		// And make this class extendable
		AtomBase.extend = arguments.callee;
		
		// And add the kind to the _Atoms map
		if (prop && prop.hasOwnProperty(_ki))
			_Atoms[prop[_ki]] = AtomBase;

		return AtomBase;
	};

	Atom.prototype.init = function(prop) {
		$.extend(this, prop);
	};

	Atom.prototype.forEach = function(fn) {
		for (var k in this) {
			var za = _za(k);
			if (this.hasOwnProperty(k) && za.charAt(0) !== '_' && k !== _bn)
				fn.call(this, k, this[k], za);
		}
	};

	Atom.prototype.merge = function(o, li, ri) {
		return Atom.Merge(this, o, li, ri);
	};

	Atom.prototype.stringify = function() {
		try {
			var my = this;
			return JSON.stringify(typeof zag === 'function' ? zag(this) : this, function(k, v) {
				if (k.charAt(0) === '_' || typeof v === 'function' || k === _bn)
					return void 0;
				return v;
			});
		} catch (ex) {
			debugger;
		}
		return '';
	};

	Atom.prototype.parse = function(json) {
		try {
			this.merge(JSON.parse(json));
		} catch (ex) {
			debugger;
		}
		return this;
	};
	
	Atom.prototype.set = function(n, v) {
		this[_zi(n)] = v;
		return this;
	};

	// Get the topmost known kind even if has no "kind" property
	Atom.prototype.kindOf = function() {
		var k, ki = 'unknown';
		for (k in _Atoms) {
			ki = this instanceof _Atoms[k] ? k : ki;
		}
		return ki;
	};

	Atom.prototype.dump = function() {
		this.forEach(function(k, v) {
			console.log(k + ' = (' + typeof(v) + ') ' + v);
		});
	};
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Static Methods
	
	Atom.Reconstruct = function(o) {
		return Atom.TryRecast(o, 'kind');
		//return Atom.Merge($.extend(true, {}, o), o);
	};

	Atom.TryRecast = function(o, ki) {
		try {
			if (!Atom.IsObject(o) || o instanceof (_Atoms[o[ki]] || Error))
				return o;
			if (!o[ki])
				return Atom.Merge($.extend(true, {}, o), o);
			return Atom.Merge(new _Atoms[o[ki]], o);
		} catch (ex) {
			debugger;
			return o;
		}
	};

	// Merge o onto m using leftInternal(default) and rightInternal(not default)
	Atom.Merge = function(m, o, li, ri) {
		var ki = ri ? _ki : 'kind',
			zt = li === undefined || li;
		for (var k in o) {
			m[zt ? _zi(k) : k] = Atom.TryRecast(o[k], ki);
		}
		return m;
	};
	
	// Left overrides right using leftInternal(default) and rightInternal(not default)
	Atom.MergeLeft = function(m, o, li, ri) {
		var k, zi,
			ki = ri ? _ki : 'kind',
			zt = li === undefined || li;
		for (k in o) {
			zi = zt ? _zi(k) : k;
			if (!m.hasOwnProperty(zi))
				m[zi] = Atom.TryRecast(o[k], ki);
		}
		return this;
	};

	Atom.New = function(kind, prop) {
		if (_Atoms[kind])
			return new _Atoms[kind](prop);
		throw new Error('Atom type ' + kind + ' not registered');
	};

	// Simple and fast object test - does not handle alternative JavaScript objects such as String and RegExp etc.
	Atom.IsObject = function(o) {
		return o && typeof o === 'object' && !(o instanceof Array) && !(o instanceof Function) && !(o instanceof Date);
	};
	/* All objects
		Object
		Function
		Array
		String
		Boolean
		Number
		Date
		RegExp
		Error
		EvalError
		RangeError
		ReferenceError
		SyntaxError
		TypeError
		URIError
	*/

})();