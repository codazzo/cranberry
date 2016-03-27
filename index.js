(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.U = factory();
    }
}(this, function () {
    var U;

    function buildUFromHandlers(promise, onFulfilled, onRejected){
        var Ctor = UFactory(promise, onFulfilled, onRejected);
        return new Ctor();
    }

    function UFactory(optionalPromise, onFulfilled, onRejected) {
        return function U (handler){
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
                return buildUFromHandlers(promise, onFulfilled, onRejected);
            }

            function _spread(func) {
                return buildUFromHandlers(promise, function (arr) {
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

                return buildUFromHandlers(promise, null, function (val) {
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
    }

    U = UFactory();

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
