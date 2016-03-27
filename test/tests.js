var U = require('../index');
var assert = require('chai').assert;

describe('.then', function() {
    var promise;
    var value;
    var onFulfilled;
    var onRejected;

    describe('when called on a fulfilled promise', function() {
        beforeEach(function() {
            promise = U.resolve();
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
            promise = U.reject(new Error('woops'));
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

describe('.all', function() {
    var promises;

    describe('when its arguments are native promises', function() {
        beforeEach(function() {
            promises = [
                Promise.resolve(1),
                Promise.resolve(2)
            ];
        });

        it('waits for its arguments to be settled', function() {
            return U.all(promises).then(function (arg){
                assert.sameMembers(arg, [1, 2]);
            });
        });
    });

    describe('when its arguments are cranberry promises', function() {
        beforeEach(function() {
            promises = [
                U.resolve(1),
                U.resolve(2)
            ];
        });

        it('waits for its arguments to be settled', function() {
            return U.all(promises).then(function (arg){
                assert.sameMembers(arg, [1, 2]);
            });
        });
    });
});

describe('.catch', function() {
    var promise;
    var value;
    var handler;

    describe('when called on a rejected promise', function() {
        beforeEach(function() {
            promise = U.reject('woops');
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
                value = U.resolve('some other value');
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
                value = U.reject('nope');
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
            promise = U.resolve('some value');
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
                promise = U.reject(new Constructor());
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
                promise = U.reject(new Error());
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

describe('.spread', function() {
    var promise;

    describe('if called on a rejected promise', function() {
        beforeEach(function() {
            promise = U.reject(new Error('some value'));
        });

        it('is ignored', function() {
            var called;

            return promise
                .spread(function(){
                    called = true;
                })
                .catch(function() {
                    assert(!called)
                })
        });
    });

    describe('if called on a fulfilled promise', function() {
        var value;

        describe('if the fulfillment value is an array', function() {
            beforeEach(function() {
                value = [
                    1,
                    2
                ];
                promise = U.resolve(value);
            });

            it('uses it as an arguments array of the `onFulfillment` handler passed as argument', function() {
                return promise
                    .spread(function(arg1, arg2){
                        assert.equal(arg1, 1);
                        assert.equal(arg2, 2);
                    });
            });
        });

        describe('if the fulfillment value is not an array', function() {
            beforeEach(function() {
                value = 1;
                promise = U.resolve(value);
            });

            it('behaves exactly like .then', function() {
                return promise
                    .spread(function(arg){
                        assert.equal(arg, 1);
                    });
            });
        });
    });
});
