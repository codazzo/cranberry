var C = require('../index');
var assert = require('chai').assert;

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
                    assert(!called);
                });
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
