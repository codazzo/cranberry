(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {
    function promiseOrValue(res){
        if (res instanceof U) {
            return res.promise;
        }

        return res;
    }

    function wrap(func){
        return typeof func === 'function' ? function() {
            return  promiseOrValue(func.apply(undefined, arguments));
        } : undefined;
    }

    function U (handler){
        var promise = new Promise(handler);

        Object.defineProperty(this, 'promise', {
            value: promise,
            writable: true
        });
    }

    U.prototype.then = function (onFulfilled, onRejected) {
        var nextU = Object.create(U.prototype);

        nextU.promise = this.promise.then(wrap(onFulfilled), wrap(onRejected));

        return nextU;
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

    U.prototype.spread = function spread(func) {
        this.promise = this.promise.then(function (arr) {
            return promiseOrValue(func.apply(null, arr));
        });

        return this;
    }

    U.prototype.catch = function () {
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

        this.promise = this.promise.catch(function (val) {
            var shouldBeCaught = typeof constructor === 'undefined' || val instanceof constructor;

            if (shouldBeCaught) {
                return promiseOrValue(handler.apply(this, arguments));
            }

            throw val;
        });

        return this;
    };

    return U;
}));