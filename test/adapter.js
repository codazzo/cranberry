var U = require('../index');

exports.deferred = function() {
  var deferred = {};

  deferred.promise = new U(function(resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
};
exports.resolved = U.resolve;
exports.rejected = U.reject;