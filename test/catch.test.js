var C = require('../index');
var assert = require('chai').assert;

describe('.catch', function() {
    var promise;
    var value;
    var handler;

    describe('when called on a rejected promise', function() {
        beforeEach(function() {
            promise = C.reject('woops');
            value = 'some value';
            handler = function() {
                return value;
            }
        });

        it('returns the value of the onRejected handler', function() {
            return promise
                .catch(handler)
                .then(function(arg) {
                    assert.equal(arg, value);
                });
        });

        describe('if the onRejected handler returns a fulfilled promise', function() {
            beforeEach(function() {
                value = C.resolve('some other value');
            });

            it('returns a fulfilled promise with the same value as the promise returned by `onRejected`', function() {
                return promise
                    .catch(handler)
                    .then(function(arg) {
                        assert.equal(arg, 'some other value');
                    });
            });
        });

        describe('if the onRejected handler returns a rejected promise', function() {
            beforeEach(function() {
                value = C.reject('nope');
            });

            it('returns a rejected promise with the same value as the promise returned by `onRejected`', function() {
                return promise
                    .catch(handler)
                    .catch(function(arg) {
                        assert.equal(arg, 'nope');
                    });
            });
        });
    });

    describe('when called on a fulfilled promise', function() {
        var handlerCalled;

        beforeEach(function() {
            promise = C.resolve('some value');
            handler = function(){
                handlerCalled = true;
            };
        });

        it('is ignored', function() {
            return promise
                .catch(handler)
                .then(function(){
                    assert(!handlerCalled);
                });
        });
    });

    describe('when the first argument is a function', function() {
        var Constructor;

        beforeEach(function() {
            Constructor = TypeError;
        });

        describe('if called on a promise whose rejection value is an instance of the function', function() {
            beforeEach(function() {
                promise = C.reject(new Constructor());
            });

            it('uses the second argument as an `onRejected` handler', function() {
                return promise
                    .catch(Constructor, function(arg) {
                        assert.instanceOf(arg, Constructor);
                    });
            });
        });

        describe('if called on a promise whose rejection value is not an instance of the function', function() {
            beforeEach(function() {
                promise = C.reject(new Error());
            });

            it('is not run', function() {
                var called;

                return promise
                    .catch(Constructor, function() {
                        called = true;
                    })
                    .catch(function() {
                        assert(!called)
                    });
            });
        });
    });

    describe('if called with more than two arguments', function() {
        it('throws a TypeError', function() {
            try {
                promise.catch(Error, function(){}, 'someOtherArg')
            } catch (e) {
                assert.instanceOf(e, TypeError);
            }
        });
    });
});
