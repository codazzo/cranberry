var C = require('../index');
var assert = require('chai').assert;

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
