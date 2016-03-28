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
            return C.all(promises).then(function (arg){
                assert.sameMembers(arg, [1, 2]);
            });
        });
    });

    describe('when its arguments are cranberry promises', function() {
        beforeEach(function() {
            promises = [
                C.resolve(1),
                C.resolve(2)
            ];
        });

        it('waits for its arguments to be settled', function() {
            return C.all(promises).then(function (arg){
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

describe('.spread', function() {
    var promise;

    describe('if called on a rejected promise', function() {
        beforeEach(function() {
            promise = C.reject(new Error('some value'));
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
                promise = C.resolve(value);
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
                promise = C.resolve(value);
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

describe('.tap', function() {
    var promise;

    it('returns a promise with an unchanged resolution value', function() {
        var someValue = {};

        var res = C.resolve(someValue)
            .tap(function() {
                return 'somethingElse';
            })
            .then(function(val) {
                assert.strictEqual(val, someValue);
            });

        assert.instanceOf(res, C);

        return res;
    });

    describe('if called on a fulfilled promise', function() {
        beforeEach(function() {
            promise = C.resolve('ok');
        });

        it('is run', function() {
            var called;

            return promise
                .tap(function(){
                    called = true;
                })
                .then(function() {
                    assert(called);
                });
        });

        describe('if the handler returns a promise', function() {
            var res;
            var run;

            beforeEach(function() {
                res = new C(function(resolve) {
                    setTimeout(function(){
                        run = true;
                        resolve('ok');
                    }, 10);
                });
            });

            it('waits on the result to be fulfilled or rejected', function() {
                return promise
                    .tap(function(){
                        return res;
                    })
                    .then(function() {
                        assert(run, 'promise returned by tap was not waited for');
                    });
            });
        });

        describe('if the handler throws', function() {
            var handler;
            var err;

            beforeEach(function() {
                err = new Error('woops!');
                handler = function() {
                    throw err;
                };
            });

            it('returns a rejected promise', function() {
                var wasResolved;

                return C.resolve()
                    .tap(handler)
                    .then(function() {
                        wasResolved = true;
                    })
                    .catch(function(arg) {
                        assert.strictEqual(arg, err);
                    })
                    .then(function() {
                        assert(!wasResolved);
                    });
            });
        });
    });

    describe('if called on a rejected promise', function() {
        beforeEach(function() {
            promise = C.reject(new Error('ok'));
        });

        it('is not run', function() {
            var called;

            return promise
                .tap(function(){
                    called = true;
                })
                .catch(function() {
                    assert(!called);
                });
        });
    });
});
