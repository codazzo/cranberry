var C = require('../index');
var assert = require('chai').assert;

describe('.then', function() {
    var promise;
    var value;
    var onFulfilled;
    var onRejected;

    describe('when called on a fulfilled promise', function() {
        beforeEach(function() {
            promise = C.resolve();
        });

        it('does not run onRejected', function() {
            return promise
                .then(null, function() {
                    throw new Error('onRejected called by fulfilled promise');
                });
        });

        describe('if `onFulfilled` returns a fulfilled native promise', function() {
            beforeEach(function() {
                value = 3;
                onFulfilled = function() {
                    return Promise.resolve(value);
                };
            });

            it('returns a fulfilled promise', function() {
                return promise
                    .then(onFulfilled)
                    .then(function(arg) {
                        assert.equal(arg, value);
                    });
            });
        });

        describe('if `onFulfilled` returns a rejected native promise', function() {
            beforeEach(function() {
                value = 3;
                onFulfilled = function() {
                    return Promise.reject(value);
                };
            });

            it('returns a rejected promise', function() {
                return promise
                    .then(onFulfilled)
                    .catch(function(arg) {
                        assert.equal(arg, value);
                    });
            });
        });
    });

    describe('when called on a rejected promise', function() {
        beforeEach(function() {
            promise = C.reject(new Error('woops'));
        });

        it('does not run onFulfilled', function() {
            return promise
                .then(function() {
                    throw new Error('onFulfilled called by rejected promise');
                })
                .catch(function(){
                    //noop: test should pass
                });
        });

        describe('if `onRejected` returns a fulfilled native promise', function() {
            beforeEach(function() {
                value = 3;
                onRejected = function() {
                    return Promise.resolve(value);
                };
            });

            it('returns a fulfilled promise', function() {
                return promise
                    .then(null, onRejected)
                    .then(function(arg) {
                        assert.equal(arg, value);
                    });
            });
        });

        describe('if `onRejected` returns a rejected native promise', function() {
            beforeEach(function() {
                value = 3;
                onRejected = function() {
                    return Promise.reject(value);
                };
            });

            it('returns a rejected promise', function() {
                return promise
                    .catch(onRejected)
                    .catch(function(arg) {
                        assert.equal(arg, value);
                    });
            });
        });
    });
});
