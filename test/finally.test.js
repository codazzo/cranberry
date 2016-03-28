var C = require('../index');
var assert = require('chai').assert;

describe('.finally', function() {
    var promise;

    it('returns a promise with an unchanged resolution value', function() {
        var someValue = {};

        var res = C.resolve(someValue)
            .finally(function() {
                return 'somethingElse';
            })
            .then(function(val) {
                assert.strictEqual(val, someValue);
            });

        assert.instanceOf(res, C);

        return res;
    });

    [
        {
            describeName: 'if called on a fulfilled promise',
            promise: C.resolve('ok')
        },
        {
            describeName: 'if called on a rejected promise',
            promise: C.reject('ok')
        }
    ].forEach(function(conf) {
        describe(conf.describeName, function() {
            beforeEach(function() {
                promise = conf.promise
            });

            it('is run', function() {
                var called;

                return promise
                    .finally(function(){
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
                        .finally(function(){
                            return res;
                        })
                        .then(function() {
                            assert(run, 'promise returned by finally was not waited for');
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
                        .finally(handler)
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
    });
});
