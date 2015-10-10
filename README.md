# js-inheritable-class
JavaScript Inheritable Class that is Google Closure Compiler Proof

Inspired by John Resig's [Simple JavaScript Inheritance Class](http://ejohn.org/blog/simple-javascript-inheritance/) except that it places non-function extension properties on the main object instead of the prototype, has a built-in mechanism for extending the object when newed, and is slightly refactored to pass through advanced google closure compilation successfully.

Also has a few nice helper methods on the base class, such as stringify() and forEach().

UnitTests.html is designed to be accessed on a php webserver and uses QUint to test features after Google Closure Compiling the library and test code together. Compilation happens automatically when the source is loaded via QUnit.source.php.
