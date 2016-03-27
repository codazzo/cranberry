(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.U = factory();
    }
}(this, function () {
    function U (handler, optionalPromise, onFulfilled, onRejected){
        var promise = optionalPromise ? optionalPromise.then(wrap(onFulfilled), wrap(onRejected)) : new Promise(handler);
        var _u = this;

        function wrap(func){
            return typeof func === 'function' ? function() {
                var res = func.apply(undefined, arguments);

                if (res === _u) {
                    throw new TypeError('promise resolution value can`t be promise itself')
                }

                return res;
            } : undefined;
        }

        function _then(onFulfilled, onRejected) {
            return new U(null, promise, onFulfilled, onRejected);
        }

        function _spread(func) {
            return new U(null, promise, function (arr) {
                if (!Array.isArray(arr)) {
                    return func.call(null, arr);
                }
                return func.apply(null, arr);
            });
        }

        function _catch(){
            var handler;
            var constructor;

            switch (arguments.length) {
                case 2:
                    constructor = arguments[0];
                    handler = arguments[1];
                    break;
                case 1:
                    handler = arguments[0];
                    break;
                default:
                    throw new TypeError('Usage: .catch(constructor, handler) or .catch(handler)');
            }

            return new U(null, promise, null, function (val) {
                var shouldBeCaught = typeof constructor === 'undefined' || val instanceof constructor;

                if (shouldBeCaught) {
                    return handler.apply(this, arguments);
                }

                throw val;
            });
        }

        Object.defineProperties(this, {
            then: {
                value: _then
            },
            spread: {
                value: _spread
            },
            catch: {
                value: _catch
            }
        });
    }

    U.resolve = function resolve(value) {
        return new U(function (resolve) {
            resolve(value);
        });
    }

    U.reject = function reject(value) {
        return new U(function (resolve, reject) {
            reject(value);
        });
    }

    U.all = function all(arr) {
        return U.resolve(Promise.all(arr));
    }

    return U;
}));
