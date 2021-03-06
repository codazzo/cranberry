(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.C = factory();
    }
}(this, function () {
    function runAndWaitOn(func) {
        return function (value) {
            var handlerRes = func(value);

            if (handlerRes && typeof handlerRes.then === 'function') {
                return handlerRes.then(function() {
                    return value;
                });
            }

            return value;
        };
    }

    function C (handler, optionalPromise, onFulfilled, onRejected){
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

            return new C(null, promise, null, function (val) {
                var shouldBeCaught = typeof constructor === 'undefined' || val instanceof constructor;

                if (shouldBeCaught) {
                    return handler.apply(this, arguments);
                }

                throw val;
            });
        }

        function _finally(func) {
            return new C(null, promise, runAndWaitOn(func), runAndWaitOn(func));
        }

        function _spread(func) {
            return new C(null, promise, function (arr) {
                if (!Array.isArray(arr)) {
                    return func.call(null, arr);
                }
                return func.apply(null, arr);
            });
        }

        function _then(onFulfilled, onRejected) {
            return new C(null, promise, onFulfilled, onRejected);
        }

        function tap(func) {
            return new C(null, promise, runAndWaitOn(func));
        }

        Object.defineProperties(this, {
            catch: {
                value: _catch
            },
            finally: {
                value: _finally
            },
            spread: {
                value: _spread
            },
            tap: {
                value: tap
            },
            then: {
                value: _then
            }
        });
    }

    C.resolve = function resolve(value) {
        return new C(function (resolve) {
            resolve(value);
        });
    }

    C.reject = function reject(value) {
        return new C(function (resolve, reject) {
            reject(value);
        });
    }

    C.all = function all(arr) {
        return C.resolve(Promise.all(arr));
    }

    return C;
}));
