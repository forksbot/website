/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Do a deep-copy of basic JavaScript Objects or Arrays.
 */
function deepCopy(value) {
    return deepExtend(undefined, value);
}
/**
 * Copy properties from source to target (recursively allows extension
 * of Objects and Arrays).  Scalar values in the target are over-written.
 * If target is undefined, an object of the appropriate type will be created
 * (and returned).
 *
 * We recursively copy all child properties of plain Objects in the source- so
 * that namespace- like dictionaries are merged.
 *
 * Note that the target can be a function, in which case the properties in
 * the source Object are copied onto it as static properties of the Function.
 */
function deepExtend(target, source) {
    if (!(source instanceof Object)) {
        return source;
    }
    switch (source.constructor) {
        case Date:
            // Treat Dates like scalars; if the target date object had any child
            // properties - they will be lost!
            var dateValue = source;
            return new Date(dateValue.getTime());
        case Object:
            if (target === undefined) {
                target = {};
            }
            break;
        case Array:
            // Always copy the array source and overwrite the target.
            target = [];
            break;
        default:
            // Not a plain Object - treat it as a scalar.
            return source;
    }
    for (var prop in source) {
        if (!source.hasOwnProperty(prop)) {
            continue;
        }
        target[prop] = deepExtend(target[prop], source[prop]);
    }
    return target;
}
/**
 * Detect Node.js.
 *
 * @return true if Node.js environment is detected.
 */
// Node detection logic from: https://github.com/iliakan/detect-node/
function isNode() {
    try {
        return (Object.prototype.toString.call(global.process) === '[object process]');
    }
    catch (e) {
        return false;
    }
}
/**
 * Detect Browser Environment
 */
function isBrowser() {
    return typeof self === 'object' && self.self === self;
}

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ERROR_NAME = 'FirebaseError';
// Based on code from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
var FirebaseError = /** @class */ (function (_super) {
    __extends(FirebaseError, _super);
    function FirebaseError(code, message) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.name = ERROR_NAME;
        // Fix For ES5
        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(_this, FirebaseError.prototype);
        // Maintains proper stack trace for where our error was thrown.
        // Only available on V8.
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, ErrorFactory.prototype.create);
        }
        return _this;
    }
    return FirebaseError;
}(Error));
var ErrorFactory = /** @class */ (function () {
    function ErrorFactory(service, serviceName, errors) {
        this.service = service;
        this.serviceName = serviceName;
        this.errors = errors;
    }
    ErrorFactory.prototype.create = function (code) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        var customData = data[0] || {};
        var fullCode = this.service + "/" + code;
        var template = this.errors[code];
        var message = template ? replaceTemplate(template, customData) : 'Error';
        // Service Name: Error message (service/code).
        var fullMessage = this.serviceName + ": " + message + " (" + fullCode + ").";
        var error = new FirebaseError(fullCode, fullMessage);
        // Keys with an underscore at the end of their name are not included in
        // error.data for some reason.
        // TODO: Replace with Object.entries when lib is updated to es2017.
        for (var _a = 0, _b = Object.keys(customData); _a < _b.length; _a++) {
            var key = _b[_a];
            if (key.slice(-1) !== '_') {
                if (key in error) {
                    console.warn("Overwriting FirebaseError base field \"" + key + "\" can cause unexpected behavior.");
                }
                error[key] = customData[key];
            }
        }
        return error;
    };
    return ErrorFactory;
}());
function replaceTemplate(template, data) {
    return template.replace(PATTERN, function (_, key) {
        var value = data[key];
        return value != null ? value.toString() : "<" + key + "?>";
    });
}
var PATTERN = /\{\$([^}]+)}/g;

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function contains(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Helper to make a Subscribe function (just like Promise helps make a
 * Thenable).
 *
 * @param executor Function which can make calls to a single Observer
 *     as a proxy.
 * @param onNoObservers Callback when count of Observers goes to zero.
 */
function createSubscribe(executor, onNoObservers) {
    var proxy = new ObserverProxy(executor, onNoObservers);
    return proxy.subscribe.bind(proxy);
}
/**
 * Implement fan-out for any number of Observers attached via a subscribe
 * function.
 */
var ObserverProxy = /** @class */ (function () {
    /**
     * @param executor Function which can make calls to a single Observer
     *     as a proxy.
     * @param onNoObservers Callback when count of Observers goes to zero.
     */
    function ObserverProxy(executor, onNoObservers) {
        var _this = this;
        this.observers = [];
        this.unsubscribes = [];
        this.observerCount = 0;
        // Micro-task scheduling by calling task.then().
        this.task = Promise.resolve();
        this.finalized = false;
        this.onNoObservers = onNoObservers;
        // Call the executor asynchronously so subscribers that are called
        // synchronously after the creation of the subscribe function
        // can still receive the very first value generated in the executor.
        this.task
            .then(function () {
            executor(_this);
        })
            .catch(function (e) {
            _this.error(e);
        });
    }
    ObserverProxy.prototype.next = function (value) {
        this.forEachObserver(function (observer) {
            observer.next(value);
        });
    };
    ObserverProxy.prototype.error = function (error) {
        this.forEachObserver(function (observer) {
            observer.error(error);
        });
        this.close(error);
    };
    ObserverProxy.prototype.complete = function () {
        this.forEachObserver(function (observer) {
            observer.complete();
        });
        this.close();
    };
    /**
     * Subscribe function that can be used to add an Observer to the fan-out list.
     *
     * - We require that no event is sent to a subscriber sychronously to their
     *   call to subscribe().
     */
    ObserverProxy.prototype.subscribe = function (nextOrObserver, error, complete) {
        var _this = this;
        var observer;
        if (nextOrObserver === undefined &&
            error === undefined &&
            complete === undefined) {
            throw new Error('Missing Observer.');
        }
        // Assemble an Observer object when passed as callback functions.
        if (implementsAnyMethods(nextOrObserver, [
            'next',
            'error',
            'complete'
        ])) {
            observer = nextOrObserver;
        }
        else {
            observer = {
                next: nextOrObserver,
                error: error,
                complete: complete
            };
        }
        if (observer.next === undefined) {
            observer.next = noop;
        }
        if (observer.error === undefined) {
            observer.error = noop;
        }
        if (observer.complete === undefined) {
            observer.complete = noop;
        }
        var unsub = this.unsubscribeOne.bind(this, this.observers.length);
        // Attempt to subscribe to a terminated Observable - we
        // just respond to the Observer with the final error or complete
        // event.
        if (this.finalized) {
            // tslint:disable-next-line:no-floating-promises
            this.task.then(function () {
                try {
                    if (_this.finalError) {
                        observer.error(_this.finalError);
                    }
                    else {
                        observer.complete();
                    }
                }
                catch (e) {
                    // nothing
                }
                return;
            });
        }
        this.observers.push(observer);
        return unsub;
    };
    // Unsubscribe is synchronous - we guarantee that no events are sent to
    // any unsubscribed Observer.
    ObserverProxy.prototype.unsubscribeOne = function (i) {
        if (this.observers === undefined || this.observers[i] === undefined) {
            return;
        }
        delete this.observers[i];
        this.observerCount -= 1;
        if (this.observerCount === 0 && this.onNoObservers !== undefined) {
            this.onNoObservers(this);
        }
    };
    ObserverProxy.prototype.forEachObserver = function (fn) {
        if (this.finalized) {
            // Already closed by previous event....just eat the additional values.
            return;
        }
        // Since sendOne calls asynchronously - there is no chance that
        // this.observers will become undefined.
        for (var i = 0; i < this.observers.length; i++) {
            this.sendOne(i, fn);
        }
    };
    // Call the Observer via one of it's callback function. We are careful to
    // confirm that the observe has not been unsubscribed since this asynchronous
    // function had been queued.
    ObserverProxy.prototype.sendOne = function (i, fn) {
        var _this = this;
        // Execute the callback asynchronously
        // tslint:disable-next-line:no-floating-promises
        this.task.then(function () {
            if (_this.observers !== undefined && _this.observers[i] !== undefined) {
                try {
                    fn(_this.observers[i]);
                }
                catch (e) {
                    // Ignore exceptions raised in Observers or missing methods of an
                    // Observer.
                    // Log error to console. b/31404806
                    if (typeof console !== 'undefined' && console.error) {
                        console.error(e);
                    }
                }
            }
        });
    };
    ObserverProxy.prototype.close = function (err) {
        var _this = this;
        if (this.finalized) {
            return;
        }
        this.finalized = true;
        if (err !== undefined) {
            this.finalError = err;
        }
        // Proxy is no longer needed - garbage collect references
        // tslint:disable-next-line:no-floating-promises
        this.task.then(function () {
            _this.observers = undefined;
            _this.onNoObservers = undefined;
        });
    };
    return ObserverProxy;
}());
/**
 * Return true if the object passed in implements any of the named methods.
 */
function implementsAnyMethods(obj, methods) {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    for (var _i = 0, methods_1 = methods; _i < methods_1.length; _i++) {
        var method = methods_1[_i];
        if (method in obj && typeof obj[method] === 'function') {
            return true;
        }
    }
    return false;
}
function noop() {
    // do nothing
}

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * The JS SDK supports 5 log levels and also allows a user the ability to
 * silence the logs altogether.
 *
 * The order is a follows:
 * DEBUG < VERBOSE < INFO < WARN < ERROR
 *
 * All of the log types above the current log level will be captured (i.e. if
 * you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
 * `VERBOSE` logs will not)
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
})(LogLevel || (LogLevel = {}));
/**
 * The default log level
 */
var defaultLogLevel = LogLevel.INFO;
/**
 * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
 * messages on to their corresponding console counterparts (if the log method
 * is supported by the current log level)
 */
var defaultLogHandler = function (instance, logType) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (logType < instance.logLevel) {
        return;
    }
    var now = new Date().toISOString();
    switch (logType) {
        /**
         * By default, `console.debug` is not displayed in the developer console (in
         * chrome). To avoid forcing users to have to opt-in to these logs twice
         * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
         * logs to the `console.log` function.
         */
        case LogLevel.DEBUG:
            console.log.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
            break;
        case LogLevel.VERBOSE:
            console.log.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
            break;
        case LogLevel.INFO:
            console.info.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
            break;
        case LogLevel.WARN:
            console.warn.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
            break;
        case LogLevel.ERROR:
            console.error.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
            break;
        default:
            throw new Error("Attempted to log a message with an invalid logType (value: " + logType + ")");
    }
};
var Logger = /** @class */ (function () {
    /**
     * Gives you an instance of a Logger to capture messages according to
     * Firebase's logging scheme.
     *
     * @param name The name that the logs will be associated with
     */
    function Logger(name) {
        this.name = name;
        /**
         * The log level of the given Logger instance.
         */
        this._logLevel = defaultLogLevel;
        /**
         * The log handler for the Logger instance.
         */
        this._logHandler = defaultLogHandler;
    }
    Object.defineProperty(Logger.prototype, "logLevel", {
        get: function () {
            return this._logLevel;
        },
        set: function (val) {
            if (!(val in LogLevel)) {
                throw new TypeError('Invalid value assigned to `logLevel`');
            }
            this._logLevel = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Logger.prototype, "logHandler", {
        get: function () {
            return this._logHandler;
        },
        set: function (val) {
            if (typeof val !== 'function') {
                throw new TypeError('Value assigned to `logHandler` must be a function');
            }
            this._logHandler = val;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * The functions below are all based on the `console` interface
     */
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._logHandler.apply(this, [this, LogLevel.DEBUG].concat(args));
    };
    Logger.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._logHandler.apply(this, [this, LogLevel.VERBOSE].concat(args));
    };
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._logHandler.apply(this, [this, LogLevel.INFO].concat(args));
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._logHandler.apply(this, [this, LogLevel.WARN].concat(args));
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._logHandler.apply(this, [this, LogLevel.ERROR].concat(args));
    };
    return Logger;
}());

/**
 * @license
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _a;
var ERRORS = (_a = {},
    _a["no-app" /* NO_APP */] = "No Firebase App '{$appName}' has been created - " +
        'call Firebase App.initializeApp()',
    _a["bad-app-name" /* BAD_APP_NAME */] = "Illegal App name: '{$appName}",
    _a["duplicate-app" /* DUPLICATE_APP */] = "Firebase App named '{$appName}' already exists",
    _a["app-deleted" /* APP_DELETED */] = "Firebase App named '{$appName}' already deleted",
    _a["duplicate-service" /* DUPLICATE_SERVICE */] = "Firebase service named '{$appName}' already registered",
    _a["invalid-app-argument" /* INVALID_APP_ARGUMENT */] = 'firebase.{$appName}() takes either no argument or a ' +
        'Firebase App instance.',
    _a);
var ERROR_FACTORY = new ErrorFactory('app', 'Firebase', ERRORS);

/**
 * @license
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var DEFAULT_ENTRY_NAME = '[DEFAULT]';

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// An array to capture listeners before the true auth functions
// exist
var tokenListeners = [];
/**
 * Global context object for a collection of services using
 * a shared authentication state.
 */
var FirebaseAppImpl = /** @class */ (function () {
    function FirebaseAppImpl(options, config, firebase_) {
        this.firebase_ = firebase_;
        this.isDeleted_ = false;
        this.services_ = {};
        this.name_ = config.name;
        this.automaticDataCollectionEnabled_ =
            config.automaticDataCollectionEnabled || false;
        this.options_ = deepCopy(options);
        this.INTERNAL = {
            getUid: function () { return null; },
            getToken: function () { return Promise.resolve(null); },
            addAuthTokenListener: function (callback) {
                tokenListeners.push(callback);
                // Make sure callback is called, asynchronously, in the absence of the auth module
                setTimeout(function () { return callback(null); }, 0);
            },
            removeAuthTokenListener: function (callback) {
                tokenListeners = tokenListeners.filter(function (listener) { return listener !== callback; });
            }
        };
    }
    Object.defineProperty(FirebaseAppImpl.prototype, "automaticDataCollectionEnabled", {
        get: function () {
            this.checkDestroyed_();
            return this.automaticDataCollectionEnabled_;
        },
        set: function (val) {
            this.checkDestroyed_();
            this.automaticDataCollectionEnabled_ = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FirebaseAppImpl.prototype, "name", {
        get: function () {
            this.checkDestroyed_();
            return this.name_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FirebaseAppImpl.prototype, "options", {
        get: function () {
            this.checkDestroyed_();
            return this.options_;
        },
        enumerable: true,
        configurable: true
    });
    FirebaseAppImpl.prototype.delete = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.checkDestroyed_();
            resolve();
        })
            .then(function () {
            _this.firebase_.INTERNAL.removeApp(_this.name_);
            var services = [];
            for (var _i = 0, _a = Object.keys(_this.services_); _i < _a.length; _i++) {
                var serviceKey = _a[_i];
                for (var _b = 0, _c = Object.keys(_this.services_[serviceKey]); _b < _c.length; _b++) {
                    var instanceKey = _c[_b];
                    services.push(_this.services_[serviceKey][instanceKey]);
                }
            }
            return Promise.all(services
                .filter(function (service) { return 'INTERNAL' in service; })
                .map(function (service) { return service.INTERNAL.delete(); }));
        })
            .then(function () {
            _this.isDeleted_ = true;
            _this.services_ = {};
        });
    };
    /**
     * Return a service instance associated with this app (creating it
     * on demand), identified by the passed instanceIdentifier.
     *
     * NOTE: Currently storage and functions are the only ones that are leveraging this
     * functionality. They invoke it by calling:
     *
     * ```javascript
     * firebase.app().storage('STORAGE BUCKET ID')
     * ```
     *
     * The service name is passed to this already
     * @internal
     */
    FirebaseAppImpl.prototype._getService = function (name, instanceIdentifier) {
        if (instanceIdentifier === void 0) { instanceIdentifier = DEFAULT_ENTRY_NAME; }
        this.checkDestroyed_();
        if (!this.services_[name]) {
            this.services_[name] = {};
        }
        if (!this.services_[name][instanceIdentifier]) {
            /**
             * If a custom instance has been defined (i.e. not '[DEFAULT]')
             * then we will pass that instance on, otherwise we pass `null`
             */
            var instanceSpecifier = instanceIdentifier !== DEFAULT_ENTRY_NAME
                ? instanceIdentifier
                : undefined;
            var service = this.firebase_.INTERNAL.factories[name](this, this.extendApp.bind(this), instanceSpecifier);
            this.services_[name][instanceIdentifier] = service;
        }
        return this.services_[name][instanceIdentifier];
    };
    /**
     * Remove a service instance from the cache, so we will create a new instance for this service
     * when people try to get this service again.
     *
     * NOTE: currently only firestore is using this functionality to support firestore shutdown.
     *
     * @param name The service name
     * @param instanceIdentifier instance identifier in case multiple instances are allowed
     * @internal
     */
    FirebaseAppImpl.prototype._removeServiceInstance = function (name, instanceIdentifier) {
        if (instanceIdentifier === void 0) { instanceIdentifier = DEFAULT_ENTRY_NAME; }
        if (this.services_[name] && this.services_[name][instanceIdentifier]) {
            delete this.services_[name][instanceIdentifier];
        }
    };
    /**
     * Callback function used to extend an App instance at the time
     * of service instance creation.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FirebaseAppImpl.prototype.extendApp = function (props) {
        var _this = this;
        // Copy the object onto the FirebaseAppImpl prototype
        deepExtend(this, props);
        /**
         * If the app has overwritten the addAuthTokenListener stub, forward
         * the active token listeners on to the true fxn.
         *
         * TODO: This function is required due to our current module
         * structure. Once we are able to rely strictly upon a single module
         * implementation, this code should be refactored and Auth should
         * provide these stubs and the upgrade logic
         */
        if (props.INTERNAL && props.INTERNAL.addAuthTokenListener) {
            tokenListeners.forEach(function (listener) {
                _this.INTERNAL.addAuthTokenListener(listener);
            });
            tokenListeners = [];
        }
    };
    /**
     * This function will throw an Error if the App has already been deleted -
     * use before performing API actions on the App.
     */
    FirebaseAppImpl.prototype.checkDestroyed_ = function () {
        if (this.isDeleted_) {
            throw ERROR_FACTORY.create("app-deleted" /* APP_DELETED */, { appName: this.name_ });
        }
    };
    return FirebaseAppImpl;
}());
// Prevent dead-code elimination of these methods w/o invalid property
// copying.
(FirebaseAppImpl.prototype.name && FirebaseAppImpl.prototype.options) ||
    FirebaseAppImpl.prototype.delete ||
    console.log('dc');

var version = "6.3.4";

/**
 * @license
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Because auth can't share code with other components, we attach the utility functions
 * in an internal namespace to share code.
 * This function return a firebase namespace object without
 * any utility functions, so it can be shared between the regular firebaseNamespace and
 * the lite version.
 */
function createFirebaseNamespaceCore(firebaseAppImpl) {
    var apps = {};
    var factories = {};
    var appHooks = {};
    // A namespace is a plain JavaScript Object.
    var namespace = {
        // Hack to prevent Babel from modifying the object returned
        // as the firebase namespace.
        // @ts-ignore
        __esModule: true,
        initializeApp: initializeApp,
        // @ts-ignore
        app: app,
        // @ts-ignore
        apps: null,
        SDK_VERSION: version,
        INTERNAL: {
            registerService: registerService,
            removeApp: removeApp,
            factories: factories,
            useAsService: useAsService
        }
    };
    // Inject a circular default export to allow Babel users who were previously
    // using:
    //
    //   import firebase from 'firebase';
    //   which becomes: var firebase = require('firebase').default;
    //
    // instead of
    //
    //   import * as firebase from 'firebase';
    //   which becomes: var firebase = require('firebase');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    namespace['default'] = namespace;
    // firebase.apps is a read-only getter.
    Object.defineProperty(namespace, 'apps', {
        get: getApps
    });
    /**
     * Called by App.delete() - but before any services associated with the App
     * are deleted.
     */
    function removeApp(name) {
        var app = apps[name];
        callAppHooks(app, 'delete');
        delete apps[name];
    }
    /**
     * Get the App object for a given name (or DEFAULT).
     */
    function app(name) {
        name = name || DEFAULT_ENTRY_NAME;
        if (!contains(apps, name)) {
            throw ERROR_FACTORY.create("no-app" /* NO_APP */, { appName: name });
        }
        return apps[name];
    }
    // @ts-ignore
    app['App'] = firebaseAppImpl;
    function initializeApp(options, rawConfig) {
        if (rawConfig === void 0) { rawConfig = {}; }
        if (typeof rawConfig !== 'object' || rawConfig === null) {
            var name_1 = rawConfig;
            rawConfig = { name: name_1 };
        }
        var config = rawConfig;
        if (config.name === undefined) {
            config.name = DEFAULT_ENTRY_NAME;
        }
        var name = config.name;
        if (typeof name !== 'string' || !name) {
            throw ERROR_FACTORY.create("bad-app-name" /* BAD_APP_NAME */, {
                appName: String(name)
            });
        }
        if (contains(apps, name)) {
            throw ERROR_FACTORY.create("duplicate-app" /* DUPLICATE_APP */, { appName: name });
        }
        var app = new firebaseAppImpl(options, config, namespace);
        apps[name] = app;
        callAppHooks(app, 'create');
        return app;
    }
    /*
     * Return an array of all the non-deleted FirebaseApps.
     */
    function getApps() {
        // Make a copy so caller cannot mutate the apps list.
        return Object.keys(apps).map(function (name) { return apps[name]; });
    }
    /*
     * Register a Firebase Service.
     *
     * firebase.INTERNAL.registerService()
     *
     * TODO: Implement serviceProperties.
     */
    function registerService(name, createService, serviceProperties, appHook, allowMultipleInstances) {
        if (allowMultipleInstances === void 0) { allowMultipleInstances = false; }
        // Cannot re-register a service that already exists
        if (factories[name]) {
            throw ERROR_FACTORY.create("duplicate-service" /* DUPLICATE_SERVICE */, { appName: name });
        }
        // Capture the service factory for later service instantiation
        factories[name] = createService;
        // Capture the appHook, if passed
        if (appHook) {
            appHooks[name] = appHook;
            // Run the **new** app hook on all existing apps
            getApps().forEach(function (app) {
                appHook('create', app);
            });
        }
        // The Service namespace is an accessor function ...
        function serviceNamespace(appArg) {
            if (appArg === void 0) { appArg = app(); }
            // @ts-ignore
            if (typeof appArg[name] !== 'function') {
                // Invalid argument.
                // This happens in the following case: firebase.storage('gs:/')
                throw ERROR_FACTORY.create("invalid-app-argument" /* INVALID_APP_ARGUMENT */, {
                    appName: name
                });
            }
            // Forward service instance lookup to the FirebaseApp.
            // @ts-ignore
            return appArg[name]();
        }
        // ... and a container for service-level properties.
        if (serviceProperties !== undefined) {
            deepExtend(serviceNamespace, serviceProperties);
        }
        // Monkey-patch the serviceNamespace onto the firebase namespace
        // @ts-ignore
        namespace[name] = serviceNamespace;
        // Patch the FirebaseAppImpl prototype
        // @ts-ignore
        firebaseAppImpl.prototype[name] =
            // TODO: The eslint disable can be removed and the 'ignoreRestArgs'
            // option added to the no-explicit-any rule when ESlint releases it.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var serviceFxn = this._getService.bind(this, name);
                return serviceFxn.apply(this, allowMultipleInstances ? args : []);
            };
        return serviceNamespace;
    }
    function callAppHooks(app, eventName) {
        for (var _i = 0, _a = Object.keys(factories); _i < _a.length; _i++) {
            var serviceName = _a[_i];
            // Ignore virtual services
            var factoryName = useAsService(app, serviceName);
            if (factoryName === null) {
                return;
            }
            if (appHooks[factoryName]) {
                appHooks[factoryName](eventName, app);
            }
        }
    }
    // Map the requested service to a registered service name
    // (used to map auth to serverAuth service when needed).
    function useAsService(app, name) {
        if (name === 'serverAuth') {
            return null;
        }
        var useService = name;
        return useService;
    }
    return namespace;
}

/**
 * @license
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Return a firebase namespace object.
 *
 * In production, this will be called exactly once and the result
 * assigned to the 'firebase' global.  It may be called multiple times
 * in unit tests.
 */
function createFirebaseNamespace() {
    var namespace = createFirebaseNamespaceCore(FirebaseAppImpl);
    namespace.INTERNAL = __assign({}, namespace.INTERNAL, { createFirebaseNamespace: createFirebaseNamespace,
        extendNamespace: extendNamespace,
        createSubscribe: createSubscribe,
        ErrorFactory: ErrorFactory,
        deepExtend: deepExtend });
    /**
     * Patch the top-level firebase namespace with additional properties.
     *
     * firebase.INTERNAL.extendNamespace()
     */
    function extendNamespace(props) {
        deepExtend(namespace, props);
    }
    return namespace;
}

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var logger = new Logger('@firebase/app');
// Firebase Lite detection
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (isBrowser() && self.firebase !== undefined) {
    logger.warn("\n    Warning: Firebase is already defined in the global scope. Please make sure\n    Firebase library is only loaded once.\n  ");
    // eslint-disable-next-line
    var sdkVersion = self.firebase.SDK_VERSION;
    if (sdkVersion && sdkVersion.indexOf('LITE') >= 0) {
        logger.warn("\n    Warning: You are trying to load Firebase while using Firebase Performance standalone script.\n    You should load Firebase Performance with this instance of Firebase to avoid loading duplicate code.\n    ");
    }
}
var firebaseNamespace = createFirebaseNamespace();
var initializeApp = firebaseNamespace.initializeApp;
// TODO: This disable can be removed and the 'ignoreRestArgs' option added to
// the no-explicit-any rule when ESlint releases it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
firebaseNamespace.initializeApp = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    // Environment check before initializing app
    // Do the check in initializeApp, so people have a chance to disable it by setting logLevel
    // in @firebase/logger
    if (isNode()) {
        logger.warn("\n      Warning: This is a browser-targeted Firebase bundle but it appears it is being\n      run in a Node environment.  If running in a Node environment, make sure you\n      are using the bundle specified by the \"main\" field in package.json.\n      \n      If you are using Webpack, you can specify \"main\" as the first item in\n      \"resolve.mainFields\":\n      https://webpack.js.org/configuration/resolve/#resolvemainfields\n      \n      If using Rollup, use the rollup-plugin-node-resolve plugin and specify \"main\"\n      as the first item in \"mainFields\", e.g. ['main', 'module'].\n      https://github.com/rollup/rollup-plugin-node-resolve\n      ");
    }
    return initializeApp.apply(undefined, args);
};
var firebase = firebaseNamespace;



var firebase$1 = /*#__PURE__*/Object.freeze({
    'default': firebase
});

(function() {var k,aa="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value);},ba="undefined"!=typeof window&&window===this?this:"undefined"!=typeof global&&null!=global?global:this;function ca(a,b){if(b){var c=ba;a=a.split(".");for(var d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e];}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&aa(c,a,{configurable:!0,writable:!0,value:b});}}
function da(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}}function ea(a){var b="undefined"!=typeof Symbol&&Symbol.iterator&&a[Symbol.iterator];return b?b.call(a):{next:da(a)}}
ca("Promise",function(a){function b(g){this.b=0;this.c=void 0;this.a=[];var h=this.f();try{g(h.resolve,h.reject);}catch(m){h.reject(m);}}function c(){this.a=null;}function d(g){return g instanceof b?g:new b(function(h){h(g);})}if(a)return a;c.prototype.b=function(g){if(null==this.a){this.a=[];var h=this;this.c(function(){h.g();});}this.a.push(g);};var e=ba.setTimeout;c.prototype.c=function(g){e(g,0);};c.prototype.g=function(){for(;this.a&&this.a.length;){var g=this.a;this.a=[];for(var h=0;h<g.length;++h){var m=
g[h];g[h]=null;try{m();}catch(p){this.f(p);}}}this.a=null;};c.prototype.f=function(g){this.c(function(){throw g;});};b.prototype.f=function(){function g(p){return function(v){m||(m=!0,p.call(h,v));}}var h=this,m=!1;return {resolve:g(this.o),reject:g(this.g)}};b.prototype.o=function(g){if(g===this)this.g(new TypeError("A Promise cannot resolve to itself"));else if(g instanceof b)this.u(g);else{a:switch(typeof g){case "object":var h=null!=g;break a;case "function":h=!0;break a;default:h=!1;}h?this.l(g):this.h(g);}};
b.prototype.l=function(g){var h=void 0;try{h=g.then;}catch(m){this.g(m);return}"function"==typeof h?this.v(h,g):this.h(g);};b.prototype.g=function(g){this.i(2,g);};b.prototype.h=function(g){this.i(1,g);};b.prototype.i=function(g,h){if(0!=this.b)throw Error("Cannot settle("+g+", "+h+"): Promise already settled in state"+this.b);this.b=g;this.c=h;this.m();};b.prototype.m=function(){if(null!=this.a){for(var g=0;g<this.a.length;++g)f.b(this.a[g]);this.a=null;}};var f=new c;b.prototype.u=function(g){var h=this.f();
g.Ja(h.resolve,h.reject);};b.prototype.v=function(g,h){var m=this.f();try{g.call(h,m.resolve,m.reject);}catch(p){m.reject(p);}};b.prototype.then=function(g,h){function m(H,V){return "function"==typeof H?function(ua){try{p(H(ua));}catch(kd){v(kd);}}:V}var p,v,z=new b(function(H,V){p=H;v=V;});this.Ja(m(g,p),m(h,v));return z};b.prototype.catch=function(g){return this.then(void 0,g)};b.prototype.Ja=function(g,h){function m(){switch(p.b){case 1:g(p.c);break;case 2:h(p.c);break;default:throw Error("Unexpected state: "+
p.b);}}var p=this;null==this.a?f.b(m):this.a.push(m);};b.resolve=d;b.reject=function(g){return new b(function(h,m){m(g);})};b.race=function(g){return new b(function(h,m){for(var p=ea(g),v=p.next();!v.done;v=p.next())d(v.value).Ja(h,m);})};b.all=function(g){var h=ea(g),m=h.next();return m.done?d([]):new b(function(p,v){function z(ua){return function(kd){H[ua]=kd;V--;0==V&&p(H);}}var H=[],V=0;do H.push(void 0),V++,d(m.value).Ja(z(H.length-1),v),m=h.next();while(!m.done)})};return b});
var fa=fa||{},l=this||self;function n(a){return "string"==typeof a}function ha(a){return "boolean"==typeof a}var ia=/^[\w+/_-]+[=]{0,2}$/,ja=null;function ka(){}
function la(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return "array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return "object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return "array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return "function"}else return "null";
else if("function"==b&&"undefined"==typeof a.call)return "object";return b}function ma(a){return null===a}function na(a){return "array"==la(a)}function oa(a){var b=la(a);return "array"==b||"object"==b&&"number"==typeof a.length}function q(a){return "function"==la(a)}function r(a){var b=typeof a;return "object"==b&&null!=a||"function"==b}var pa="closure_uid_"+(1E9*Math.random()>>>0),qa=0;function ra(a,b,c){return a.call.apply(a.bind,arguments)}
function sa(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(b,e)}}return function(){return a.apply(b,arguments)}}function t(a,b,c){Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?t=ra:t=sa;return t.apply(null,arguments)}
function ta(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var d=c.slice();d.push.apply(d,arguments);return a.apply(this,d)}}var va=Date.now||function(){return +new Date};function u(a,b){function c(){}c.prototype=b.prototype;a.qb=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.cd=function(d,e,f){for(var g=Array(arguments.length-2),h=2;h<arguments.length;h++)g[h-2]=arguments[h];return b.prototype[e].apply(d,g)};}function wa(a){if(!a)return !1;try{return !!a.$goog_Thenable}catch(b){return !1}}function w(a){if(Error.captureStackTrace)Error.captureStackTrace(this,w);else{var b=Error().stack;b&&(this.stack=b);}a&&(this.message=String(a));}u(w,Error);w.prototype.name="CustomError";function xa(a,b){a=a.split("%s");for(var c="",d=a.length-1,e=0;e<d;e++)c+=a[e]+(e<b.length?b[e]:"%s");w.call(this,c+a[d]);}u(xa,w);xa.prototype.name="AssertionError";function ya(a,b){throw new xa("Failure"+(a?": "+a:""),Array.prototype.slice.call(arguments,1));}function za(a,b){this.c=a;this.f=b;this.b=0;this.a=null;}za.prototype.get=function(){if(0<this.b){this.b--;var a=this.a;this.a=a.next;a.next=null;}else a=this.c();return a};function Aa(a,b){a.f(b);100>a.b&&(a.b++,b.next=a.a,a.a=b);}function Ba(){this.b=this.a=null;}var Da=new za(function(){return new Ca},function(a){a.reset();});Ba.prototype.add=function(a,b){var c=Da.get();c.set(a,b);this.b?this.b.next=c:this.a=c;this.b=c;};function Ea(){var a=Fa,b=null;a.a&&(b=a.a,a.a=a.a.next,a.a||(a.b=null),b.next=null);return b}function Ca(){this.next=this.b=this.a=null;}Ca.prototype.set=function(a,b){this.a=a;this.b=b;this.next=null;};Ca.prototype.reset=function(){this.next=this.b=this.a=null;};function Ga(a,b){a:{try{var c=a&&a.ownerDocument,d=c&&(c.defaultView||c.parentWindow);d=d||l;if(d.Element&&d.Location){var e=d;break a}}catch(g){}e=null;}if(e&&"undefined"!=typeof e[b]&&(!a||!(a instanceof e[b])&&(a instanceof e.Location||a instanceof e.Element))){if(r(a))try{var f=a.constructor.displayName||a.constructor.name||Object.prototype.toString.call(a);}catch(g){f="<object could not be stringified>";}else f=void 0===a?"undefined":null===a?"null":typeof a;ya("Argument is not a %s (or a non-Element, non-Location mock); got: %s",
b,f);}}var Ha=Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf.call(a,b,void 0)}:function(a,b){if(n(a))return n(b)&&1==b.length?a.indexOf(b,0):-1;for(var c=0;c<a.length;c++)if(c in a&&a[c]===b)return c;return -1},x=Array.prototype.forEach?function(a,b,c){Array.prototype.forEach.call(a,b,c);}:function(a,b,c){for(var d=a.length,e=n(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a);};function Ia(a,b){for(var c=n(a)?a.split(""):a,d=a.length-1;0<=d;--d)d in c&&b.call(void 0,c[d],d,a);}
var Ja=Array.prototype.map?function(a,b){return Array.prototype.map.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=Array(c),e=n(a)?a.split(""):a,f=0;f<c;f++)f in e&&(d[f]=b.call(void 0,e[f],f,a));return d},Ka=Array.prototype.some?function(a,b){return Array.prototype.some.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=n(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a))return !0;return !1};
function La(a){a:{var b=Ma;for(var c=a.length,d=n(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){b=e;break a}b=-1;}return 0>b?null:n(a)?a.charAt(b):a[b]}function Na(a,b){return 0<=Ha(a,b)}function Oa(a,b){b=Ha(a,b);var c;(c=0<=b)&&Array.prototype.splice.call(a,b,1);return c}function y(a,b){var c=0;Ia(a,function(d,e){b.call(void 0,d,e,a)&&1==Array.prototype.splice.call(a,e,1).length&&c++;});}function Pa(a){return Array.prototype.concat.apply([],arguments)}
function Qa(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];return c}return []}function Ra(a,b){for(var c in a)b.call(void 0,a[c],c,a);}function Sa(a){for(var b in a)return !1;return !0}function Ta(a){var b={},c;for(c in a)b[c]=a[c];return b}var Ua="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Va(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var f=0;f<Ua.length;f++)c=Ua[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c]);}}function Wa(a,b){this.a=a===Xa&&b||"";this.b=Ya;}Wa.prototype.na=!0;Wa.prototype.ma=function(){return this.a};Wa.prototype.toString=function(){return "Const{"+this.a+"}"};function Za(a){if(a instanceof Wa&&a.constructor===Wa&&a.b===Ya)return a.a;ya("expected object of type Const, got '"+a+"'");return "type_error:Const"}var Ya={},Xa={},$a=new Wa(Xa,"");function ab(){this.a="";this.b=bb;}ab.prototype.na=!0;ab.prototype.ma=function(){return this.a.toString()};ab.prototype.toString=function(){return "TrustedResourceUrl{"+this.a+"}"};function cb(a){if(a instanceof ab&&a.constructor===ab&&a.b===bb)return a.a;ya("expected object of type TrustedResourceUrl, got '"+a+"' of type "+la(a));return "type_error:TrustedResourceUrl"}
function db(a,b){var c=Za(a);if(!eb.test(c))throw Error("Invalid TrustedResourceUrl format: "+c);a=c.replace(fb,function(d,e){if(!Object.prototype.hasOwnProperty.call(b,e))throw Error('Found marker, "'+e+'", in format string, "'+c+'", but no valid label mapping found in args: '+JSON.stringify(b));d=b[e];return d instanceof Wa?Za(d):encodeURIComponent(String(d))});return gb(a)}var fb=/%{(\w+)}/g,eb=/^((https:)?\/\/[0-9a-z.:[\]-]+\/|\/[^/\\]|[^:/\\%]+\/|[^:/\\%]*[?#]|about:blank#)/i,bb={};
function gb(a){var b=new ab;b.a=a;return b}var hb=String.prototype.trim?function(a){return a.trim()}:function(a){return /^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1]},ib=/&/g,jb=/</g,kb=/>/g,lb=/"/g,mb=/'/g,nb=/\x00/g,ob=/[\x00&<>"']/;function A(a,b){return -1!=a.indexOf(b)}function pb(a,b){return a<b?-1:a>b?1:0}function qb(){this.a="";this.b=rb;}qb.prototype.na=!0;qb.prototype.ma=function(){return this.a.toString()};qb.prototype.toString=function(){return "SafeUrl{"+this.a+"}"};function sb(a){if(a instanceof qb&&a.constructor===qb&&a.b===rb)return a.a;ya("expected object of type SafeUrl, got '"+a+"' of type "+la(a));return "type_error:SafeUrl"}var tb=/^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i;
function ub(a){if(a instanceof qb)return a;a="object"==typeof a&&a.na?a.ma():String(a);tb.test(a)||(a="about:invalid#zClosurez");return vb(a)}var rb={};function vb(a){var b=new qb;b.a=a;return b}vb("about:blank");var wb;a:{var xb=l.navigator;if(xb){var yb=xb.userAgent;if(yb){wb=yb;break a}}wb="";}function B(a){return A(wb,a)}function zb(){this.a="";this.b=Ab;}zb.prototype.na=!0;zb.prototype.ma=function(){return this.a.toString()};zb.prototype.toString=function(){return "SafeHtml{"+this.a+"}"};function Bb(a){if(a instanceof zb&&a.constructor===zb&&a.b===Ab)return a.a;ya("expected object of type SafeHtml, got '"+a+"' of type "+la(a));return "type_error:SafeHtml"}var Ab={};function Cb(a){var b=new zb;b.a=a;return b}Cb("<!DOCTYPE html>");var Db=Cb("");Cb("<br>");function Eb(a){var b=gb(Za($a));Ga(a,"HTMLIFrameElement");a.src=cb(b).toString();}function Fb(a,b){Ga(a,"HTMLScriptElement");a.src=cb(b);if(null===ja)b:{b=l.document;if((b=b.querySelector&&b.querySelector("script[nonce]"))&&(b=b.nonce||b.getAttribute("nonce"))&&ia.test(b)){ja=b;break b}ja="";}b=ja;b&&a.setAttribute("nonce",b);}function Gb(a,b){for(var c=a.split("%s"),d="",e=Array.prototype.slice.call(arguments,1);e.length&&1<c.length;)d+=c.shift()+e.shift();return d+c.join("%s")}function Hb(a){ob.test(a)&&(-1!=a.indexOf("&")&&(a=a.replace(ib,"&amp;")),-1!=a.indexOf("<")&&(a=a.replace(jb,"&lt;")),-1!=a.indexOf(">")&&(a=a.replace(kb,"&gt;")),-1!=a.indexOf('"')&&(a=a.replace(lb,"&quot;")),-1!=a.indexOf("'")&&(a=a.replace(mb,"&#39;")),-1!=a.indexOf("\x00")&&(a=a.replace(nb,"&#0;")));return a}function Ib(a){l.setTimeout(function(){throw a;},0);}var Jb;
function Kb(){var a=l.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&!B("Presto")&&(a=function(){var e=document.createElement("IFRAME");e.style.display="none";Eb(e);document.documentElement.appendChild(e);var f=e.contentWindow;e=f.document;e.open();e.write(Bb(Db));e.close();var g="callImmediate"+Math.random(),h="file:"==f.location.protocol?"*":f.location.protocol+"//"+f.location.host;e=t(function(m){if(("*"==h||m.origin==h)&&m.data==
g)this.port1.onmessage();},this);f.addEventListener("message",e,!1);this.port1={};this.port2={postMessage:function(){f.postMessage(g,h);}};});if("undefined"!==typeof a&&!B("Trident")&&!B("MSIE")){var b=new a,c={},d=c;b.port1.onmessage=function(){if(void 0!==c.next){c=c.next;var e=c.yb;c.yb=null;e();}};return function(e){d.next={yb:e};d=d.next;b.port2.postMessage(0);}}return "undefined"!==typeof document&&"onreadystatechange"in document.createElement("SCRIPT")?function(e){var f=document.createElement("SCRIPT");
f.onreadystatechange=function(){f.onreadystatechange=null;f.parentNode.removeChild(f);f=null;e();e=null;};document.documentElement.appendChild(f);}:function(e){l.setTimeout(e,0);}}function Lb(a,b){Mb||Nb();Ob||(Mb(),Ob=!0);Fa.add(a,b);}var Mb;function Nb(){if(l.Promise&&l.Promise.resolve){var a=l.Promise.resolve(void 0);Mb=function(){a.then(Pb);};}else Mb=function(){var b=Pb;!q(l.setImmediate)||l.Window&&l.Window.prototype&&!B("Edge")&&l.Window.prototype.setImmediate==l.setImmediate?(Jb||(Jb=Kb()),Jb(b)):l.setImmediate(b);};}var Ob=!1,Fa=new Ba;function Pb(){for(var a;a=Ea();){try{a.a.call(a.b);}catch(b){Ib(b);}Aa(Da,a);}Ob=!1;}function C(a,b){this.a=Qb;this.i=void 0;this.f=this.b=this.c=null;this.g=this.h=!1;if(a!=ka)try{var c=this;a.call(b,function(d){Rb(c,Sb,d);},function(d){if(!(d instanceof Tb))try{if(d instanceof Error)throw d;throw Error("Promise rejected.");}catch(e){}Rb(c,Ub,d);});}catch(d){Rb(this,Ub,d);}}var Qb=0,Sb=2,Ub=3;function Vb(){this.next=this.f=this.b=this.g=this.a=null;this.c=!1;}Vb.prototype.reset=function(){this.f=this.b=this.g=this.a=null;this.c=!1;};var Wb=new za(function(){return new Vb},function(a){a.reset();});
function Xb(a,b,c){var d=Wb.get();d.g=a;d.b=b;d.f=c;return d}function D(a){if(a instanceof C)return a;var b=new C(ka);Rb(b,Sb,a);return b}function E(a){return new C(function(b,c){c(a);})}function Yb(a,b,c){Zb(a,b,c,null)||Lb(ta(b,a));}function $b(a){return new C(function(b,c){var d=a.length,e=[];if(d)for(var f=function(p,v){d--;e[p]=v;0==d&&b(e);},g=function(p){c(p);},h=0,m;h<a.length;h++)m=a[h],Yb(m,ta(f,h),g);else b(e);})}
function ac(a){return new C(function(b){var c=a.length,d=[];if(c)for(var e=function(h,m,p){c--;d[h]=m?{Eb:!0,value:p}:{Eb:!1,reason:p};0==c&&b(d);},f=0,g;f<a.length;f++)g=a[f],Yb(g,ta(e,f,!0),ta(e,f,!1));else b(d);})}C.prototype.then=function(a,b,c){return bc(this,q(a)?a:null,q(b)?b:null,c)};C.prototype.$goog_Thenable=!0;k=C.prototype;k.ia=function(a,b){a=Xb(a,a,b);a.c=!0;cc(this,a);return this};k.s=function(a,b){return bc(this,null,a,b)};
k.cancel=function(a){this.a==Qb&&Lb(function(){var b=new Tb(a);dc(this,b);},this);};function dc(a,b){if(a.a==Qb)if(a.c){var c=a.c;if(c.b){for(var d=0,e=null,f=null,g=c.b;g&&(g.c||(d++,g.a==a&&(e=g),!(e&&1<d)));g=g.next)e||(f=g);e&&(c.a==Qb&&1==d?dc(c,b):(f?(d=f,d.next==c.f&&(c.f=d),d.next=d.next.next):ec(c),fc(c,e,Ub,b)));}a.c=null;}else Rb(a,Ub,b);}function cc(a,b){a.b||a.a!=Sb&&a.a!=Ub||gc(a);a.f?a.f.next=b:a.b=b;a.f=b;}
function bc(a,b,c,d){var e=Xb(null,null,null);e.a=new C(function(f,g){e.g=b?function(h){try{var m=b.call(d,h);f(m);}catch(p){g(p);}}:f;e.b=c?function(h){try{var m=c.call(d,h);void 0===m&&h instanceof Tb?g(h):f(m);}catch(p){g(p);}}:g;});e.a.c=a;cc(a,e);return e.a}k.Lc=function(a){this.a=Qb;Rb(this,Sb,a);};k.Mc=function(a){this.a=Qb;Rb(this,Ub,a);};
function Rb(a,b,c){a.a==Qb&&(a===c&&(b=Ub,c=new TypeError("Promise cannot resolve to itself")),a.a=1,Zb(c,a.Lc,a.Mc,a)||(a.i=c,a.a=b,a.c=null,gc(a),b!=Ub||c instanceof Tb||hc(a,c)));}function Zb(a,b,c,d){if(a instanceof C)return cc(a,Xb(b||ka,c||null,d)),!0;if(wa(a))return a.then(b,c,d),!0;if(r(a))try{var e=a.then;if(q(e))return ic(a,e,b,c,d),!0}catch(f){return c.call(d,f),!0}return !1}
function ic(a,b,c,d,e){function f(m){h||(h=!0,d.call(e,m));}function g(m){h||(h=!0,c.call(e,m));}var h=!1;try{b.call(a,g,f);}catch(m){f(m);}}function gc(a){a.h||(a.h=!0,Lb(a.Wb,a));}function ec(a){var b=null;a.b&&(b=a.b,a.b=b.next,b.next=null);a.b||(a.f=null);return b}k.Wb=function(){for(var a;a=ec(this);)fc(this,a,this.a,this.i);this.h=!1;};
function fc(a,b,c,d){if(c==Ub&&b.b&&!b.c)for(;a&&a.g;a=a.c)a.g=!1;if(b.a)b.a.c=null,jc(b,c,d);else try{b.c?b.g.call(b.f):jc(b,c,d);}catch(e){kc.call(null,e);}Aa(Wb,b);}function jc(a,b,c){b==Sb?a.g.call(a.f,c):a.b&&a.b.call(a.f,c);}function hc(a,b){a.g=!0;Lb(function(){a.g&&kc.call(null,b);});}var kc=Ib;function Tb(a){w.call(this,a);}u(Tb,w);Tb.prototype.name="cancel";function lc(){this.qa=this.qa;this.ja=this.ja;}var mc=0;lc.prototype.qa=!1;function oc(a){if(!a.qa&&(a.qa=!0,a.va(),0!=mc)){var b=a[pa]||(a[pa]=++qa);}}lc.prototype.va=function(){if(this.ja)for(;this.ja.length;)this.ja.shift()();};function pc(a){pc[" "](a);return a}pc[" "]=ka;function qc(a,b){var c=rc;return Object.prototype.hasOwnProperty.call(c,a)?c[a]:c[a]=b(a)}var sc=B("Opera"),tc=B("Trident")||B("MSIE"),uc=B("Edge"),vc=uc||tc,wc=B("Gecko")&&!(A(wb.toLowerCase(),"webkit")&&!B("Edge"))&&!(B("Trident")||B("MSIE"))&&!B("Edge"),xc=A(wb.toLowerCase(),"webkit")&&!B("Edge");function yc(){var a=l.document;return a?a.documentMode:void 0}var zc;
a:{var Ac="",Bc=function(){var a=wb;if(wc)return /rv:([^\);]+)(\)|;)/.exec(a);if(uc)return /Edge\/([\d\.]+)/.exec(a);if(tc)return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(xc)return /WebKit\/(\S+)/.exec(a);if(sc)return /(?:Version)[ \/]?(\S+)/.exec(a)}();Bc&&(Ac=Bc?Bc[1]:"");if(tc){var Cc=yc();if(null!=Cc&&Cc>parseFloat(Ac)){zc=String(Cc);break a}}zc=Ac;}var rc={};
function Dc(a){return qc(a,function(){for(var b=0,c=hb(String(zc)).split("."),d=hb(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",h=d[f]||"";do{g=/(\d*)(\D*)(.*)/.exec(g)||["","","",""];h=/(\d*)(\D*)(.*)/.exec(h)||["","","",""];if(0==g[0].length&&0==h[0].length)break;b=pb(0==g[1].length?0:parseInt(g[1],10),0==h[1].length?0:parseInt(h[1],10))||pb(0==g[2].length,0==h[2].length)||pb(g[2],h[2]);g=g[3];h=h[3];}while(0==b)}return 0<=b})}var Ec;
Ec=l.document&&tc?yc():void 0;var Fc=Object.freeze||function(a){return a};var Gc=!tc||9<=Number(Ec),Hc=tc&&!Dc("9"),Ic=function(){if(!l.addEventListener||!Object.defineProperty)return !1;var a=!1,b=Object.defineProperty({},"passive",{get:function(){a=!0;}});try{l.addEventListener("test",ka,b),l.removeEventListener("test",ka,b);}catch(c){}return a}();function Jc(a,b){this.type=a;this.b=this.target=b;this.Kb=!0;}Jc.prototype.preventDefault=function(){this.Kb=!1;};function Kc(a,b){Jc.call(this,a?a.type:"");this.relatedTarget=this.b=this.target=null;this.button=this.screenY=this.screenX=this.clientY=this.clientX=0;this.key="";this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1;this.pointerId=0;this.pointerType="";this.a=null;if(a){var c=this.type=a.type,d=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement;this.b=b;if(b=a.relatedTarget){if(wc){a:{try{pc(b.nodeName);var e=!0;break a}catch(f){}e=!1;}e||(b=null);}}else"mouseover"==
c?b=a.fromElement:"mouseout"==c&&(b=a.toElement);this.relatedTarget=b;d?(this.clientX=void 0!==d.clientX?d.clientX:d.pageX,this.clientY=void 0!==d.clientY?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=d.screenY||0):(this.clientX=void 0!==a.clientX?a.clientX:a.pageX,this.clientY=void 0!==a.clientY?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0);this.button=a.button;this.key=a.key||"";this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=
a.metaKey;this.pointerId=a.pointerId||0;this.pointerType=n(a.pointerType)?a.pointerType:Lc[a.pointerType]||"";this.a=a;a.defaultPrevented&&this.preventDefault();}}u(Kc,Jc);var Lc=Fc({2:"touch",3:"pen",4:"mouse"});Kc.prototype.preventDefault=function(){Kc.qb.preventDefault.call(this);var a=this.a;if(a.preventDefault)a.preventDefault();else if(a.returnValue=!1,Hc)try{if(a.ctrlKey||112<=a.keyCode&&123>=a.keyCode)a.keyCode=-1;}catch(b){}};Kc.prototype.f=function(){return this.a};var Mc="closure_listenable_"+(1E6*Math.random()|0),Nc=0;function Oc(a,b,c,d,e){this.listener=a;this.proxy=null;this.src=b;this.type=c;this.capture=!!d;this.Na=e;this.key=++Nc;this.oa=this.Ia=!1;}function Pc(a){a.oa=!0;a.listener=null;a.proxy=null;a.src=null;a.Na=null;}function Qc(a){this.src=a;this.a={};this.b=0;}Qc.prototype.add=function(a,b,c,d,e){var f=a.toString();a=this.a[f];a||(a=this.a[f]=[],this.b++);var g=Rc(a,b,d,e);-1<g?(b=a[g],c||(b.Ia=!1)):(b=new Oc(b,this.src,f,!!d,e),b.Ia=c,a.push(b));return b};function Sc(a,b){var c=b.type;c in a.a&&Oa(a.a[c],b)&&(Pc(b),0==a.a[c].length&&(delete a.a[c],a.b--));}function Rc(a,b,c,d){for(var e=0;e<a.length;++e){var f=a[e];if(!f.oa&&f.listener==b&&f.capture==!!c&&f.Na==d)return e}return -1}var Tc="closure_lm_"+(1E6*Math.random()|0),Uc={};function Wc(a,b,c,d,e){if(d&&d.once)Xc(a,b,c,d,e);else if(na(b))for(var f=0;f<b.length;f++)Wc(a,b[f],c,d,e);else c=Yc(c),a&&a[Mc]?Zc(a,b,c,r(d)?!!d.capture:!!d,e):$c(a,b,c,!1,d,e);}
function $c(a,b,c,d,e,f){if(!b)throw Error("Invalid event type");var g=r(e)?!!e.capture:!!e,h=ad(a);h||(a[Tc]=h=new Qc(a));c=h.add(b,c,d,g,f);if(!c.proxy){d=bd();c.proxy=d;d.src=a;d.listener=c;if(a.addEventListener)Ic||(e=g),void 0===e&&(e=!1),a.addEventListener(b.toString(),d,e);else if(a.attachEvent)a.attachEvent(cd(b.toString()),d);else if(a.addListener&&a.removeListener)a.addListener(d);else throw Error("addEventListener and attachEvent are unavailable.");}}
function bd(){var a=dd,b=Gc?function(c){return a.call(b.src,b.listener,c)}:function(c){c=a.call(b.src,b.listener,c);if(!c)return c};return b}function Xc(a,b,c,d,e){if(na(b))for(var f=0;f<b.length;f++)Xc(a,b[f],c,d,e);else c=Yc(c),a&&a[Mc]?ed(a,b,c,r(d)?!!d.capture:!!d,e):$c(a,b,c,!0,d,e);}
function fd(a,b,c,d,e){if(na(b))for(var f=0;f<b.length;f++)fd(a,b[f],c,d,e);else(d=r(d)?!!d.capture:!!d,c=Yc(c),a&&a[Mc])?(a=a.m,b=String(b).toString(),b in a.a&&(f=a.a[b],c=Rc(f,c,d,e),-1<c&&(Pc(f[c]),Array.prototype.splice.call(f,c,1),0==f.length&&(delete a.a[b],a.b--)))):a&&(a=ad(a))&&(b=a.a[b.toString()],a=-1,b&&(a=Rc(b,c,d,e)),(c=-1<a?b[a]:null)&&gd(c));}
function gd(a){if("number"!=typeof a&&a&&!a.oa){var b=a.src;if(b&&b[Mc])Sc(b.m,a);else{var c=a.type,d=a.proxy;b.removeEventListener?b.removeEventListener(c,d,a.capture):b.detachEvent?b.detachEvent(cd(c),d):b.addListener&&b.removeListener&&b.removeListener(d);(c=ad(b))?(Sc(c,a),0==c.b&&(c.src=null,b[Tc]=null)):Pc(a);}}}function cd(a){return a in Uc?Uc[a]:Uc[a]="on"+a}
function hd(a,b,c,d){var e=!0;if(a=ad(a))if(b=a.a[b.toString()])for(b=b.concat(),a=0;a<b.length;a++){var f=b[a];f&&f.capture==c&&!f.oa&&(f=id(f,d),e=e&&!1!==f);}return e}function id(a,b){var c=a.listener,d=a.Na||a.src;a.Ia&&gd(a);return c.call(d,b)}
function dd(a,b){if(a.oa)return !0;if(!Gc){if(!b)a:{b=["window","event"];for(var c=l,d=0;d<b.length;d++)if(c=c[b[d]],null==c){b=null;break a}b=c;}d=b;b=new Kc(d,this);c=!0;if(!(0>d.keyCode||void 0!=d.returnValue)){a:{var e=!1;if(0==d.keyCode)try{d.keyCode=-1;break a}catch(g){e=!0;}if(e||void 0==d.returnValue)d.returnValue=!0;}d=[];for(e=b.b;e;e=e.parentNode)d.push(e);a=a.type;for(e=d.length-1;0<=e;e--){b.b=d[e];var f=hd(d[e],a,!0,b);c=c&&f;}for(e=0;e<d.length;e++)b.b=d[e],f=hd(d[e],a,!1,b),c=c&&f;}return c}return id(a,
new Kc(b,this))}function ad(a){a=a[Tc];return a instanceof Qc?a:null}var jd="__closure_events_fn_"+(1E9*Math.random()>>>0);function Yc(a){if(q(a))return a;a[jd]||(a[jd]=function(b){return a.handleEvent(b)});return a[jd]}function F(){lc.call(this);this.m=new Qc(this);this.Pb=this;this.Wa=null;}u(F,lc);F.prototype[Mc]=!0;F.prototype.addEventListener=function(a,b,c,d){Wc(this,a,b,c,d);};F.prototype.removeEventListener=function(a,b,c,d){fd(this,a,b,c,d);};
F.prototype.dispatchEvent=function(a){var b,c=this.Wa;if(c)for(b=[];c;c=c.Wa)b.push(c);c=this.Pb;var d=a.type||a;if(n(a))a=new Jc(a,c);else if(a instanceof Jc)a.target=a.target||c;else{var e=a;a=new Jc(d,c);Va(a,e);}e=!0;if(b)for(var f=b.length-1;0<=f;f--){var g=a.b=b[f];e=ld(g,d,!0,a)&&e;}g=a.b=c;e=ld(g,d,!0,a)&&e;e=ld(g,d,!1,a)&&e;if(b)for(f=0;f<b.length;f++)g=a.b=b[f],e=ld(g,d,!1,a)&&e;return e};
F.prototype.va=function(){F.qb.va.call(this);if(this.m){var a=this.m,c;for(c in a.a){for(var d=a.a[c],e=0;e<d.length;e++)Pc(d[e]);delete a.a[c];a.b--;}}this.Wa=null;};function Zc(a,b,c,d,e){a.m.add(String(b),c,!1,d,e);}function ed(a,b,c,d,e){a.m.add(String(b),c,!0,d,e);}
function ld(a,b,c,d){b=a.m.a[String(b)];if(!b)return !0;b=b.concat();for(var e=!0,f=0;f<b.length;++f){var g=b[f];if(g&&!g.oa&&g.capture==c){var h=g.listener,m=g.Na||g.src;g.Ia&&Sc(a.m,g);e=!1!==h.call(m,d)&&e;}}return e&&0!=d.Kb}function md(a,b,c){if(q(a))c&&(a=t(a,c));else if(a&&"function"==typeof a.handleEvent)a=t(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(b)?-1:l.setTimeout(a,b||0)}function nd(a){var b=null;return (new C(function(c,d){b=md(function(){c(void 0);},a);-1==b&&d(Error("Failed to schedule timer."));})).s(function(c){l.clearTimeout(b);throw c;})}function od(a){if(a.S&&"function"==typeof a.S)return a.S();if(n(a))return a.split("");if(oa(a)){for(var b=[],c=a.length,d=0;d<c;d++)b.push(a[d]);return b}b=[];c=0;for(d in a)b[c++]=a[d];return b}function pd(a){if(a.U&&"function"==typeof a.U)return a.U();if(!a.S||"function"!=typeof a.S){if(oa(a)||n(a)){var b=[];a=a.length;for(var c=0;c<a;c++)b.push(c);return b}b=[];c=0;for(var d in a)b[c++]=d;return b}}
function qd(a,b){if(a.forEach&&"function"==typeof a.forEach)a.forEach(b,void 0);else if(oa(a)||n(a))x(a,b,void 0);else for(var c=pd(a),d=od(a),e=d.length,f=0;f<e;f++)b.call(void 0,d[f],c&&c[f],a);}function rd(a,b){this.b={};this.a=[];this.c=0;var c=arguments.length;if(1<c){if(c%2)throw Error("Uneven number of arguments");for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1]);}else if(a)if(a instanceof rd)for(c=a.U(),d=0;d<c.length;d++)this.set(c[d],a.get(c[d]));else for(d in a)this.set(d,a[d]);}k=rd.prototype;k.S=function(){sd(this);for(var a=[],b=0;b<this.a.length;b++)a.push(this.b[this.a[b]]);return a};k.U=function(){sd(this);return this.a.concat()};
k.clear=function(){this.b={};this.c=this.a.length=0;};function sd(a){if(a.c!=a.a.length){for(var b=0,c=0;b<a.a.length;){var d=a.a[b];td(a.b,d)&&(a.a[c++]=d);b++;}a.a.length=c;}if(a.c!=a.a.length){var e={};for(c=b=0;b<a.a.length;)d=a.a[b],td(e,d)||(a.a[c++]=d,e[d]=1),b++;a.a.length=c;}}k.get=function(a,b){return td(this.b,a)?this.b[a]:b};k.set=function(a,b){td(this.b,a)||(this.c++,this.a.push(a));this.b[a]=b;};
k.forEach=function(a,b){for(var c=this.U(),d=0;d<c.length;d++){var e=c[d],f=this.get(e);a.call(b,f,e,this);}};function td(a,b){return Object.prototype.hasOwnProperty.call(a,b)}var ud=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/;function vd(a,b){if(a){a=a.split("&");for(var c=0;c<a.length;c++){var d=a[c].indexOf("="),e=null;if(0<=d){var f=a[c].substring(0,d);e=a[c].substring(d+1);}else f=a[c];b(f,e?decodeURIComponent(e.replace(/\+/g," ")):"");}}}function wd(a,b){this.b=this.i=this.f="";this.m=null;this.g=this.c="";this.h=!1;var c;a instanceof wd?(this.h=void 0!==b?b:a.h,xd(this,a.f),this.i=a.i,this.b=a.b,yd(this,a.m),this.c=a.c,zd(this,Ad(a.a)),this.g=a.g):a&&(c=String(a).match(ud))?(this.h=!!b,xd(this,c[1]||"",!0),this.i=Bd(c[2]||""),this.b=Bd(c[3]||"",!0),yd(this,c[4]),this.c=Bd(c[5]||"",!0),zd(this,c[6]||"",!0),this.g=Bd(c[7]||"")):(this.h=!!b,this.a=new Cd(null,this.h));}
wd.prototype.toString=function(){var a=[],b=this.f;b&&a.push(Dd(b,Ed,!0),":");var c=this.b;if(c||"file"==b)a.push("//"),(b=this.i)&&a.push(Dd(b,Ed,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.m,null!=c&&a.push(":",String(c));if(c=this.c)this.b&&"/"!=c.charAt(0)&&a.push("/"),a.push(Dd(c,"/"==c.charAt(0)?Fd:Gd,!0));(c=this.a.toString())&&a.push("?",c);(c=this.g)&&a.push("#",Dd(c,Hd));return a.join("")};
wd.prototype.resolve=function(a){var b=new wd(this),c=!!a.f;c?xd(b,a.f):c=!!a.i;c?b.i=a.i:c=!!a.b;c?b.b=a.b:c=null!=a.m;var d=a.c;if(c)yd(b,a.m);else if(c=!!a.c){if("/"!=d.charAt(0))if(this.b&&!this.c)d="/"+d;else{var e=b.c.lastIndexOf("/");-1!=e&&(d=b.c.substr(0,e+1)+d);}e=d;if(".."==e||"."==e)d="";else if(A(e,"./")||A(e,"/.")){d=0==e.lastIndexOf("/",0);e=e.split("/");for(var f=[],g=0;g<e.length;){var h=e[g++];"."==h?d&&g==e.length&&f.push(""):".."==h?((1<f.length||1==f.length&&""!=f[0])&&f.pop(),
d&&g==e.length&&f.push("")):(f.push(h),d=!0);}d=f.join("/");}else d=e;}c?b.c=d:c=""!==a.a.toString();c?zd(b,Ad(a.a)):c=!!a.g;c&&(b.g=a.g);return b};function xd(a,b,c){a.f=c?Bd(b,!0):b;a.f&&(a.f=a.f.replace(/:$/,""));}function yd(a,b){if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.m=b;}else a.m=null;}function zd(a,b,c){b instanceof Cd?(a.a=b,Id(a.a,a.h)):(c||(b=Dd(b,Jd)),a.a=new Cd(b,a.h));}function G(a,b,c){a.a.set(b,c);}function Kd(a,b){return a.a.get(b)}
function Ld(a){return a instanceof wd?new wd(a):new wd(a,void 0)}function Md(a,b){var c=new wd(null,void 0);xd(c,"https");a&&(c.b=a);b&&(c.c=b);return c}function Bd(a,b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Dd(a,b,c){return n(a)?(a=encodeURI(a).replace(b,Nd),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function Nd(a){a=a.charCodeAt(0);return "%"+(a>>4&15).toString(16)+(a&15).toString(16)}
var Ed=/[#\/\?@]/g,Gd=/[#\?:]/g,Fd=/[#\?]/g,Jd=/[#\?@]/g,Hd=/#/g;function Cd(a,b){this.b=this.a=null;this.c=a||null;this.f=!!b;}function Od(a){a.a||(a.a=new rd,a.b=0,a.c&&vd(a.c,function(b,c){a.add(decodeURIComponent(b.replace(/\+/g," ")),c);}));}function Pd(a){var b=pd(a);if("undefined"==typeof b)throw Error("Keys are undefined");var c=new Cd(null,void 0);a=od(a);for(var d=0;d<b.length;d++){var e=b[d],f=a[d];na(f)?Qd(c,e,f):c.add(e,f);}return c}k=Cd.prototype;
k.add=function(a,b){Od(this);this.c=null;a=Rd(this,a);var c=this.a.get(a);c||this.a.set(a,c=[]);c.push(b);this.b+=1;return this};function Sd(a,b){Od(a);b=Rd(a,b);td(a.a.b,b)&&(a.c=null,a.b-=a.a.get(b).length,a=a.a,td(a.b,b)&&(delete a.b[b],a.c--,a.a.length>2*a.c&&sd(a)));}k.clear=function(){this.a=this.c=null;this.b=0;};function Td(a,b){Od(a);b=Rd(a,b);return td(a.a.b,b)}k.forEach=function(a,b){Od(this);this.a.forEach(function(c,d){x(c,function(e){a.call(b,e,d,this);},this);},this);};
k.U=function(){Od(this);for(var a=this.a.S(),b=this.a.U(),c=[],d=0;d<b.length;d++)for(var e=a[d],f=0;f<e.length;f++)c.push(b[d]);return c};k.S=function(a){Od(this);var b=[];if(n(a))Td(this,a)&&(b=Pa(b,this.a.get(Rd(this,a))));else{a=this.a.S();for(var c=0;c<a.length;c++)b=Pa(b,a[c]);}return b};k.set=function(a,b){Od(this);this.c=null;a=Rd(this,a);Td(this,a)&&(this.b-=this.a.get(a).length);this.a.set(a,[b]);this.b+=1;return this};
k.get=function(a,b){if(!a)return b;a=this.S(a);return 0<a.length?String(a[0]):b};function Qd(a,b,c){Sd(a,b);0<c.length&&(a.c=null,a.a.set(Rd(a,b),Qa(c)),a.b+=c.length);}k.toString=function(){if(this.c)return this.c;if(!this.a)return "";for(var a=[],b=this.a.U(),c=0;c<b.length;c++){var d=b[c],e=encodeURIComponent(String(d));d=this.S(d);for(var f=0;f<d.length;f++){var g=e;""!==d[f]&&(g+="="+encodeURIComponent(String(d[f])));a.push(g);}}return this.c=a.join("&")};
function Ad(a){var b=new Cd;b.c=a.c;a.a&&(b.a=new rd(a.a),b.b=a.b);return b}function Rd(a,b){b=String(b);a.f&&(b=b.toLowerCase());return b}function Id(a,b){b&&!a.f&&(Od(a),a.c=null,a.a.forEach(function(c,d){var e=d.toLowerCase();d!=e&&(Sd(this,d),Qd(this,e,c));},a));a.f=b;}var Ud=!tc||9<=Number(Ec);function Vd(a){var b=document;return n(a)?b.getElementById(a):a}function Wd(a,b){Ra(b,function(c,d){c&&"object"==typeof c&&c.na&&(c=c.ma());"style"==d?a.style.cssText=c:"class"==d?a.className=c:"for"==d?a.htmlFor=c:Xd.hasOwnProperty(d)?a.setAttribute(Xd[d],c):0==d.lastIndexOf("aria-",0)||0==d.lastIndexOf("data-",0)?a.setAttribute(d,c):a[d]=c;});}
var Xd={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",frameborder:"frameBorder",height:"height",maxlength:"maxLength",nonce:"nonce",role:"role",rowspan:"rowSpan",type:"type",usemap:"useMap",valign:"vAlign",width:"width"};
function Yd(a,b,c){var d=arguments,e=document,f=String(d[0]),g=d[1];if(!Ud&&g&&(g.name||g.type)){f=["<",f];g.name&&f.push(' name="',Hb(g.name),'"');if(g.type){f.push(' type="',Hb(g.type),'"');var h={};Va(h,g);delete h.type;g=h;}f.push(">");f=f.join("");}f=e.createElement(f);g&&(n(g)?f.className=g:na(g)?f.className=g.join(" "):Wd(f,g));2<d.length&&Zd(e,f,d);return f}
function Zd(a,b,c){function d(g){g&&b.appendChild(n(g)?a.createTextNode(g):g);}for(var e=2;e<c.length;e++){var f=c[e];!oa(f)||r(f)&&0<f.nodeType?d(f):x($d(f)?Qa(f):f,d);}}function $d(a){if(a&&"number"==typeof a.length){if(r(a))return "function"==typeof a.item||"string"==typeof a.item;if(q(a))return "function"==typeof a.item}return !1}function ae(a){var b=[];be(new ce,a,b);return b.join("")}function ce(){}
function be(a,b,c){if(null==b)c.push("null");else{if("object"==typeof b){if(na(b)){var d=b;b=d.length;c.push("[");for(var e="",f=0;f<b;f++)c.push(e),be(a,d[f],c),e=",";c.push("]");return}if(b instanceof String||b instanceof Number||b instanceof Boolean)b=b.valueOf();else{c.push("{");e="";for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(f=b[d],"function"!=typeof f&&(c.push(e),de(d,c),c.push(":"),be(a,f,c),e=","));c.push("}");return}}switch(typeof b){case "string":de(b,c);break;case "number":c.push(isFinite(b)&&
!isNaN(b)?String(b):"null");break;case "boolean":c.push(String(b));break;case "function":c.push("null");break;default:throw Error("Unknown type: "+typeof b);}}}var ee={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},fe=/\uffff/.test("\uffff")?/[\\"\x00-\x1f\x7f-\uffff]/g:/[\\"\x00-\x1f\x7f-\xff]/g;
function de(a,b){b.push('"',a.replace(fe,function(c){var d=ee[c];d||(d="\\u"+(c.charCodeAt(0)|65536).toString(16).substr(1),ee[c]=d);return d}),'"');}function ge(){var a=I();return tc&&!!Ec&&11==Ec||/Edge\/\d+/.test(a)}function he(){return l.window&&l.window.location.href||self&&self.location&&self.location.href||""}function ie(a,b){b=b||l.window;var c="about:blank";a&&(c=sb(ub(a)).toString());b.location.href=c;}function je(a,b){var c=[],d;for(d in a)d in b?typeof a[d]!=typeof b[d]?c.push(d):"object"==typeof a[d]&&null!=a[d]&&null!=b[d]?0<je(a[d],b[d]).length&&c.push(d):a[d]!==b[d]&&c.push(d):c.push(d);for(d in b)d in a||c.push(d);return c}
function ke(){var a=I();a=le(a)!=me?null:(a=a.match(/\sChrome\/(\d+)/i))&&2==a.length?parseInt(a[1],10):null;return a&&30>a?!1:!tc||!Ec||9<Ec}function ne(a){a=(a||I()).toLowerCase();return a.match(/android/)||a.match(/webos/)||a.match(/iphone|ipad|ipod/)||a.match(/blackberry/)||a.match(/windows phone/)||a.match(/iemobile/)?!0:!1}function oe(a){a=a||l.window;try{a.close();}catch(b){}}
function pe(a,b,c){var d=Math.floor(1E9*Math.random()).toString();b=b||500;c=c||600;var e=(window.screen.availHeight-c)/2,f=(window.screen.availWidth-b)/2;b={width:b,height:c,top:0<e?e:0,left:0<f?f:0,location:!0,resizable:!0,statusbar:!0,toolbar:!1};c=I().toLowerCase();d&&(b.target=d,A(c,"crios/")&&(b.target="_blank"));le(I())==qe&&(a=a||"http://localhost",b.scrollbars=!0);c=a||"";(a=b)||(a={});d=window;b=c instanceof qb?c:ub("undefined"!=typeof c.href?c.href:String(c));c=a.target||c.target;e=[];
for(g in a)switch(g){case "width":case "height":case "top":case "left":e.push(g+"="+a[g]);break;case "target":case "noopener":case "noreferrer":break;default:e.push(g+"="+(a[g]?1:0));}var g=e.join(",");(B("iPhone")&&!B("iPod")&&!B("iPad")||B("iPad")||B("iPod"))&&d.navigator&&d.navigator.standalone&&c&&"_self"!=c?(g=d.document.createElement("A"),Ga(g,"HTMLAnchorElement"),b instanceof qb||b instanceof qb||(b="object"==typeof b&&b.na?b.ma():String(b),tb.test(b)||(b="about:invalid#zClosurez"),b=vb(b)),
g.href=sb(b),g.setAttribute("target",c),a.noreferrer&&g.setAttribute("rel","noreferrer"),a=document.createEvent("MouseEvent"),a.initMouseEvent("click",!0,!0,d,1),g.dispatchEvent(a),g={}):a.noreferrer?(g=d.open("",c,g),a=sb(b).toString(),g&&(vc&&A(a,";")&&(a="'"+a.replace(/'/g,"%27")+"'"),g.opener=null,a=Cb('<meta name="referrer" content="no-referrer"><meta http-equiv="refresh" content="0; url='+Hb(a)+'">'),g.document.write(Bb(a)),g.document.close())):(g=d.open(sb(b).toString(),c,g))&&a.noopener&&
(g.opener=null);if(g)try{g.focus();}catch(h){}return g}function re(a){return new C(function(b){function c(){nd(2E3).then(function(){if(!a||a.closed)b();else return c()});}return c()})}var se=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,te=/^[^@]+@[^@]+$/;function ue(){var a=null;return (new C(function(b){"complete"==l.document.readyState?b():(a=function(){b();},Xc(window,"load",a));})).s(function(b){fd(window,"load",a);throw b;})}
function ve(){return we(void 0)?ue().then(function(){return new C(function(a,b){var c=l.document,d=setTimeout(function(){b(Error("Cordova framework is not ready."));},1E3);c.addEventListener("deviceready",function(){clearTimeout(d);a();},!1);})}):E(Error("Cordova must run in an Android or iOS file scheme."))}function we(a){a=a||I();return !("file:"!==xe()||!a.toLowerCase().match(/iphone|ipad|ipod|android/))}function ye(){var a=l.window;try{return !(!a||a==a.top)}catch(b){return !1}}
function ze(){return "undefined"!==typeof l.WorkerGlobalScope&&"function"===typeof l.importScripts}function Ae(){return firebase.INTERNAL.hasOwnProperty("reactNative")?"ReactNative":firebase.INTERNAL.hasOwnProperty("node")?"Node":ze()?"Worker":"Browser"}function Be(){var a=Ae();return "ReactNative"===a||"Node"===a}function Ce(){for(var a=50,b=[];0<a;)b.push("1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(62*Math.random()))),a--;return b.join("")}
var qe="Firefox",me="Chrome";
function le(a){var b=a.toLowerCase();if(A(b,"opera/")||A(b,"opr/")||A(b,"opios/"))return "Opera";if(A(b,"iemobile"))return "IEMobile";if(A(b,"msie")||A(b,"trident/"))return "IE";if(A(b,"edge/"))return "Edge";if(A(b,"firefox/"))return qe;if(A(b,"silk/"))return "Silk";if(A(b,"blackberry"))return "Blackberry";if(A(b,"webos"))return "Webos";if(!A(b,"safari/")||A(b,"chrome/")||A(b,"crios/")||A(b,"android"))if(!A(b,"chrome/")&&!A(b,"crios/")||A(b,"edge/")){if(A(b,"android"))return "Android";if((a=a.match(/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/))&&
2==a.length)return a[1]}else return me;else return "Safari";return "Other"}var De={Sc:"FirebaseCore-web",Uc:"FirebaseUI-web"};function Ee(a,b){b=b||[];var c=[],d={},e;for(e in De)d[De[e]]=!0;for(e=0;e<b.length;e++)"undefined"!==typeof d[b[e]]&&(delete d[b[e]],c.push(b[e]));c.sort();b=c;b.length||(b=["FirebaseCore-web"]);c=Ae();"Browser"===c?(d=I(),c=le(d)):"Worker"===c&&(d=I(),c=le(d)+"-"+c);return c+"/JsCore/"+a+"/"+b.join(",")}function I(){return l.navigator&&l.navigator.userAgent||""}
function J(a,b){a=a.split(".");b=b||l;for(var c=0;c<a.length&&"object"==typeof b&&null!=b;c++)b=b[a[c]];c!=a.length&&(b=void 0);return b}function Fe(){try{var a=l.localStorage,b=Ge();if(a)return a.setItem(b,"1"),a.removeItem(b),ge()?!!l.indexedDB:!0}catch(c){return ze()&&!!l.indexedDB}return !1}function He(){return (Ie()||"chrome-extension:"===xe()||we())&&!Be()&&Fe()&&!ze()}function Ie(){return "http:"===xe()||"https:"===xe()}function xe(){return l.location&&l.location.protocol||null}
function Je(a){a=a||I();return ne(a)||le(a)==qe?!1:!0}function Ke(a){return "undefined"===typeof a?null:ae(a)}function Le(a){var b={},c;for(c in a)a.hasOwnProperty(c)&&null!==a[c]&&void 0!==a[c]&&(b[c]=a[c]);return b}function Me(a){if(null!==a)return JSON.parse(a)}function Ge(a){return a?a:Math.floor(1E9*Math.random()).toString()}function Ne(a){a=a||I();return "Safari"==le(a)||a.toLowerCase().match(/iphone|ipad|ipod/)?!1:!0}
function Oe(){var a=l.___jsl;if(a&&a.H)for(var b in a.H)if(a.H[b].r=a.H[b].r||[],a.H[b].L=a.H[b].L||[],a.H[b].r=a.H[b].L.concat(),a.CP)for(var c=0;c<a.CP.length;c++)a.CP[c]=null;}function Pe(a,b){if(a>b)throw Error("Short delay should be less than long delay!");this.a=a;this.c=b;a=I();b=Ae();this.b=ne(a)||"ReactNative"===b;}
Pe.prototype.get=function(){var a=l.navigator;return (a&&"boolean"===typeof a.onLine&&(Ie()||"chrome-extension:"===xe()||"undefined"!==typeof a.connection)?a.onLine:1)?this.b?this.c:this.a:Math.min(5E3,this.a)};function Qe(){var a=l.document;return a&&"undefined"!==typeof a.visibilityState?"visible"==a.visibilityState:!0}
function Re(){var a=l.document,b=null;return Qe()||!a?D():(new C(function(c){b=function(){Qe()&&(a.removeEventListener("visibilitychange",b,!1),c());};a.addEventListener("visibilitychange",b,!1);})).s(function(c){a.removeEventListener("visibilitychange",b,!1);throw c;})}function Se(a){try{var b=new Date(parseInt(a,10));if(!isNaN(b.getTime())&&!/[^0-9]/.test(a))return b.toUTCString()}catch(c){}return null}function Te(){return !(!J("fireauth.oauthhelper",l)&&!J("fireauth.iframe",l))}
function Ue(){var a=l.navigator;return a&&a.serviceWorker&&a.serviceWorker.controller||null}function Ve(){var a=l.navigator;return a&&a.serviceWorker?D().then(function(){return a.serviceWorker.ready}).then(function(b){return b.active||null}).s(function(){return null}):D(null)}var We={};function Xe(a){We[a]||(We[a]=!0,"undefined"!==typeof console&&"function"===typeof console.warn&&console.warn(a));}var Ye;try{var Ze={};Object.defineProperty(Ze,"abcd",{configurable:!0,enumerable:!0,value:1});Object.defineProperty(Ze,"abcd",{configurable:!0,enumerable:!0,value:2});Ye=2==Ze.abcd;}catch(a){Ye=!1;}function K(a,b,c){Ye?Object.defineProperty(a,b,{configurable:!0,enumerable:!0,value:c}):a[b]=c;}function L(a,b){if(b)for(var c in b)b.hasOwnProperty(c)&&K(a,c,b[c]);}function $e(a){var b={};L(b,a);return b}function af(a){var b={},c;for(c in a)a.hasOwnProperty(c)&&(b[c]=a[c]);return b}
function bf(a,b){if(!b||!b.length)return !0;if(!a)return !1;for(var c=0;c<b.length;c++){var d=a[b[c]];if(void 0===d||null===d||""===d)return !1}return !0}function cf(a){var b=a;if("object"==typeof a&&null!=a){b="length"in a?[]:{};for(var c in a)K(b,c,cf(a[c]));}return b}function df(a){var b={},c=a[ef],d=a[ff];a=a[gf];if(!a||a!=hf&&!c)throw Error("Invalid provider user info!");b[jf]=d||null;b[kf]=c||null;K(this,lf,a);K(this,mf,cf(b));}var hf="EMAIL_SIGNIN",ef="email",ff="newEmail",gf="requestType",kf="email",jf="fromEmail",mf="data",lf="operation";function M(a,b){this.code=nf+a;this.message=b||of[a]||"";}u(M,Error);M.prototype.w=function(){return {code:this.code,message:this.message}};M.prototype.toJSON=function(){return this.w()};function pf(a){var b=a&&a.code;return b?new M(b.substring(nf.length),a.message):null}
var nf="auth/",of={"admin-restricted-operation":"This operation is restricted to administrators only.","argument-error":"","app-not-authorized":"This app, identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.","app-not-installed":"The requested mobile application corresponding to the identifier (Android package name or iOS bundle ID) provided is not installed on this device.",
"captcha-check-failed":"The reCAPTCHA response token provided is either invalid, expired, already used or the domain associated with it does not match the list of whitelisted domains.","code-expired":"The SMS code has expired. Please re-send the verification code to try again.","cordova-not-ready":"Cordova framework is not ready.","cors-unsupported":"This browser is not supported.","credential-already-in-use":"This credential is already associated with a different user account.","custom-token-mismatch":"The custom token corresponds to a different audience.",
"requires-recent-login":"This operation is sensitive and requires recent authentication. Log in again before retrying this request.","dynamic-link-not-activated":"Please activate Dynamic Links in the Firebase Console and agree to the terms and conditions.","email-already-in-use":"The email address is already in use by another account.","expired-action-code":"The action code has expired. ","cancelled-popup-request":"This operation has been cancelled due to another conflicting popup being opened.",
"internal-error":"An internal error has occurred.","invalid-app-credential":"The phone verification request contains an invalid application verifier. The reCAPTCHA token response is either invalid or expired.","invalid-app-id":"The mobile app identifier is not registed for the current project.","invalid-user-token":"This user's credential isn't valid for this project. This can happen if the user's token has been tampered with, or if the user isn't for the project associated with this API key.","invalid-auth-event":"An internal error has occurred.",
"invalid-verification-code":"The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms and be sure use the verification code provided by the user.","invalid-continue-uri":"The continue URL provided in the request is invalid.","invalid-cordova-configuration":"The following Cordova plugins must be installed to enable OAuth sign-in: cordova-plugin-buildinfo, cordova-universal-links-plugin, cordova-plugin-browsertab, cordova-plugin-inappbrowser and cordova-plugin-customurlscheme.",
"invalid-custom-token":"The custom token format is incorrect. Please check the documentation.","invalid-dynamic-link-domain":"The provided dynamic link domain is not configured or authorized for the current project.","invalid-email":"The email address is badly formatted.","invalid-api-key":"Your API key is invalid, please check you have copied it correctly.","invalid-cert-hash":"The SHA-1 certificate hash provided is invalid.","invalid-credential":"The supplied auth credential is malformed or has expired.",
"invalid-message-payload":"The email template corresponding to this action contains invalid characters in its message. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-oauth-provider":"EmailAuthProvider is not supported for this operation. This operation only supports OAuth providers.","invalid-oauth-client-id":"The OAuth client ID provided is either invalid or does not match the specified API key.","unauthorized-domain":"This domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.",
"invalid-action-code":"The action code is invalid. This can happen if the code is malformed, expired, or has already been used.","wrong-password":"The password is invalid or the user does not have a password.","invalid-persistence-type":"The specified persistence type is invalid. It can only be local, session or none.","invalid-phone-number":"The format of the phone number provided is incorrect. Please enter the phone number in a format that can be parsed into E.164 format. E.164 phone numbers are written in the format [+][country code][subscriber number including area code].",
"invalid-provider-id":"The specified provider ID is invalid.","invalid-recipient-email":"The email corresponding to this action failed to send as the provided recipient email address is invalid.","invalid-sender":"The email template corresponding to this action contains an invalid sender email or name. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-verification-id":"The verification ID used to create the phone auth credential is invalid.","missing-android-pkg-name":"An Android Package Name must be provided if the Android App is required to be installed.",
"auth-domain-config-required":"Be sure to include authDomain when calling firebase.initializeApp(), by following the instructions in the Firebase console.","missing-app-credential":"The phone verification request is missing an application verifier assertion. A reCAPTCHA response token needs to be provided.","missing-verification-code":"The phone auth credential was created with an empty SMS verification code.","missing-continue-uri":"A continue URL must be provided in the request.","missing-iframe-start":"An internal error has occurred.",
"missing-ios-bundle-id":"An iOS Bundle ID must be provided if an App Store ID is provided.","missing-or-invalid-nonce":"The OIDC ID token requires a valid unhashed nonce.","missing-phone-number":"To send verification codes, provide a phone number for the recipient.","missing-verification-id":"The phone auth credential was created with an empty verification ID.","app-deleted":"This instance of FirebaseApp has been deleted.","account-exists-with-different-credential":"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.",
"network-request-failed":"A network error (such as timeout, interrupted connection or unreachable host) has occurred.","no-auth-event":"An internal error has occurred.","no-such-provider":"User was not linked to an account with the given provider.","null-user":"A null user object was provided as the argument for an operation which requires a non-null user object.","operation-not-allowed":"The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.",
"operation-not-supported-in-this-environment":'This operation is not supported in the environment this application is running on. "location.protocol" must be http, https or chrome-extension and web storage must be enabled.',"popup-blocked":"Unable to establish a connection with the popup. It may have been blocked by the browser.","popup-closed-by-user":"The popup has been closed by the user before finalizing the operation.","provider-already-linked":"User can only be linked to one identity for the given provider.",
"quota-exceeded":"The project's quota for this operation has been exceeded.","redirect-cancelled-by-user":"The redirect operation has been cancelled by the user before finalizing.","redirect-operation-pending":"A redirect sign-in operation is already pending.","rejected-credential":"The request contains malformed or mismatching credentials.",timeout:"The operation has timed out.","user-token-expired":"The user's credential is no longer valid. The user must sign in again.","too-many-requests":"We have blocked all requests from this device due to unusual activity. Try again later.",
"unauthorized-continue-uri":"The domain of the continue URL is not whitelisted.  Please whitelist the domain in the Firebase console.","unsupported-persistence-type":"The current environment does not support the specified persistence type.","user-cancelled":"User did not grant your application the permissions it requested.","user-not-found":"There is no user record corresponding to this identifier. The user may have been deleted.","user-disabled":"The user account has been disabled by an administrator.",
"user-mismatch":"The supplied credentials do not correspond to the previously signed in user.","user-signed-out":"","weak-password":"The password must be 6 characters long or more.","web-storage-unsupported":"This browser is not supported or 3rd party cookies and data may be disabled."};function qf(a){var b=a[rf];if("undefined"===typeof b)throw new M("missing-continue-uri");if("string"!==typeof b||"string"===typeof b&&!b.length)throw new M("invalid-continue-uri");this.h=b;this.b=this.a=null;this.g=!1;var c=a[sf];if(c&&"object"===typeof c){b=c[tf];var d=c[uf];c=c[vf];if("string"===typeof b&&b.length){this.a=b;if("undefined"!==typeof d&&"boolean"!==typeof d)throw new M("argument-error",uf+" property must be a boolean when specified.");this.g=!!d;if("undefined"!==typeof c&&("string"!==
typeof c||"string"===typeof c&&!c.length))throw new M("argument-error",vf+" property must be a non empty string when specified.");this.b=c||null;}else{if("undefined"!==typeof b)throw new M("argument-error",tf+" property must be a non empty string when specified.");if("undefined"!==typeof d||"undefined"!==typeof c)throw new M("missing-android-pkg-name");}}else if("undefined"!==typeof c)throw new M("argument-error",sf+" property must be a non null object when specified.");this.f=null;if((b=a[wf])&&"object"===
typeof b)if(b=b[xf],"string"===typeof b&&b.length)this.f=b;else{if("undefined"!==typeof b)throw new M("argument-error",xf+" property must be a non empty string when specified.");}else if("undefined"!==typeof b)throw new M("argument-error",wf+" property must be a non null object when specified.");b=a[yf];if("undefined"!==typeof b&&"boolean"!==typeof b)throw new M("argument-error",yf+" property must be a boolean when specified.");this.c=!!b;a=a[zf];if("undefined"!==typeof a&&("string"!==typeof a||"string"===
typeof a&&!a.length))throw new M("argument-error",zf+" property must be a non empty string when specified.");this.i=a||null;}var sf="android",zf="dynamicLinkDomain",yf="handleCodeInApp",wf="iOS",rf="url",uf="installApp",vf="minimumVersion",tf="packageName",xf="bundleId";
function Af(a){var b={};b.continueUrl=a.h;b.canHandleCodeInApp=a.c;if(b.androidPackageName=a.a)b.androidMinimumVersion=a.b,b.androidInstallApp=a.g;b.iOSBundleId=a.f;b.dynamicLinkDomain=a.i;for(var c in b)null===b[c]&&delete b[c];return b}function Bf(a){return Ja(a,function(b){b=b.toString(16);return 1<b.length?b:"0"+b}).join("")}var Cf=null,Df=null;function Ef(a){var b="";Ff(a,function(c){b+=String.fromCharCode(c);});return b}function Ff(a,b){function c(m){for(;d<a.length;){var p=a.charAt(d++),v=Df[p];if(null!=v)return v;if(!/^[\s\xa0]*$/.test(p))throw Error("Unknown base64 encoding at char: "+p);}return m}Gf();for(var d=0;;){var e=c(-1),f=c(0),g=c(64),h=c(64);if(64===h&&-1===e)break;b(e<<2|f>>4);64!=g&&(b(f<<4&240|g>>2),64!=h&&b(g<<6&192|h));}}
function Gf(){if(!Cf){Cf={};Df={};for(var a=0;65>a;a++)Cf[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a),Df[Cf[a]]=a,62<=a&&(Df["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(a)]=a);}}function Hf(a){this.c=a.sub;this.a=a.provider_id||a.firebase&&a.firebase.sign_in_provider||null;this.b=!!a.is_anonymous||"anonymous"==this.a;}Hf.prototype.f=function(){return this.b};function If(a){return (a=Jf(a))&&a.sub&&a.iss&&a.aud&&a.exp?new Hf(a):null}function Jf(a){if(!a)return null;a=a.split(".");if(3!=a.length)return null;a=a[1];for(var b=(4-a.length%4)%4,c=0;c<b;c++)a+=".";try{return JSON.parse(Ef(a))}catch(d){}return null}var Kf={Yc:{bb:"https://www.googleapis.com/identitytoolkit/v3/relyingparty/",jb:"https://securetoken.googleapis.com/v1/token",id:"p"},$c:{bb:"https://staging-www.sandbox.googleapis.com/identitytoolkit/v3/relyingparty/",jb:"https://staging-securetoken.sandbox.googleapis.com/v1/token",id:"s"},ad:{bb:"https://www-googleapis-test.sandbox.google.com/identitytoolkit/v3/relyingparty/",jb:"https://test-securetoken.sandbox.googleapis.com/v1/token",id:"t"}};
function Lf(a){for(var b in Kf)if(Kf[b].id===a)return a=Kf[b],{firebaseEndpoint:a.bb,secureTokenEndpoint:a.jb};return null}var Mf;Mf=Lf("__EID__")?"__EID__":void 0;var Nf="oauth_consumer_key oauth_nonce oauth_signature oauth_signature_method oauth_timestamp oauth_token oauth_version".split(" "),Of=["client_id","response_type","scope","redirect_uri","state"],Pf={Tc:{Oa:"locale",Ba:500,Aa:600,Pa:"facebook.com",ib:Of},Vc:{Oa:null,Ba:500,Aa:620,Pa:"github.com",ib:Of},Wc:{Oa:"hl",Ba:515,Aa:680,Pa:"google.com",ib:Of},bd:{Oa:"lang",Ba:485,Aa:705,Pa:"twitter.com",ib:Nf}};function Qf(a){for(var b in Pf)if(Pf[b].Pa==a)return Pf[b];return null}function Rf(a){var b={};b["facebook.com"]=Sf;b["google.com"]=Tf;b["github.com"]=Uf;b["twitter.com"]=Vf;var c=a&&a[Wf];try{if(c)return b[c]?new b[c](a):new Xf(a);if("undefined"!==typeof a[Yf])return new Zf(a)}catch(d){}return null}var Yf="idToken",Wf="providerId";
function Zf(a){var b=a[Wf];if(!b&&a[Yf]){var c=If(a[Yf]);c&&c.a&&(b=c.a);}if(!b)throw Error("Invalid additional user info!");if("anonymous"==b||"custom"==b)b=null;c=!1;"undefined"!==typeof a.isNewUser?c=!!a.isNewUser:"identitytoolkit#SignupNewUserResponse"===a.kind&&(c=!0);K(this,"providerId",b);K(this,"isNewUser",c);}function Xf(a){Zf.call(this,a);a=Me(a.rawUserInfo||"{}");K(this,"profile",cf(a||{}));}u(Xf,Zf);
function Sf(a){Xf.call(this,a);if("facebook.com"!=this.providerId)throw Error("Invalid provider ID!");}u(Sf,Xf);function Uf(a){Xf.call(this,a);if("github.com"!=this.providerId)throw Error("Invalid provider ID!");K(this,"username",this.profile&&this.profile.login||null);}u(Uf,Xf);function Tf(a){Xf.call(this,a);if("google.com"!=this.providerId)throw Error("Invalid provider ID!");}u(Tf,Xf);
function Vf(a){Xf.call(this,a);if("twitter.com"!=this.providerId)throw Error("Invalid provider ID!");K(this,"username",a.screenName||null);}u(Vf,Xf);function $f(a){this.a=Ld(a);}function ag(a){var b=Ld(a),c=Kd(b,"link"),d=Kd(Ld(c),"link");b=Kd(b,"deep_link_id");return Kd(Ld(b),"link")||b||d||c||a}function bg(){}function cg(a,b){return a.then(function(c){if(c[dg]){var d=If(c[dg]);if(!d||b!=d.c)throw new M("user-mismatch");return c}throw new M("user-mismatch");}).s(function(c){throw c&&c.code&&c.code==nf+"user-not-found"?new M("user-mismatch"):c;})}function eg(a,b){if(b)this.a=b;else throw new M("internal-error","failed to construct a credential");K(this,"providerId",a);K(this,"signInMethod",a);}eg.prototype.la=function(a){return fg(a,gg(this))};
eg.prototype.b=function(a,b){var c=gg(this);c.idToken=b;return hg(a,c)};eg.prototype.f=function(a,b){return cg(ig(a,gg(this)),b)};function gg(a){return {pendingToken:a.a,requestUri:"http://localhost"}}eg.prototype.w=function(){return {providerId:this.providerId,signInMethod:this.signInMethod,pendingToken:this.a}};function jg(a){if(a&&a.providerId&&a.signInMethod&&0==a.providerId.indexOf("saml.")&&a.pendingToken)try{return new eg(a.providerId,a.pendingToken)}catch(b){}return null}
function kg(a,b,c){this.a=null;if(b.idToken||b.accessToken)b.idToken&&K(this,"idToken",b.idToken),b.accessToken&&K(this,"accessToken",b.accessToken),b.nonce&&!b.pendingToken&&K(this,"nonce",b.nonce),b.pendingToken&&(this.a=b.pendingToken);else if(b.oauthToken&&b.oauthTokenSecret)K(this,"accessToken",b.oauthToken),K(this,"secret",b.oauthTokenSecret);else throw new M("internal-error","failed to construct a credential");K(this,"providerId",a);K(this,"signInMethod",c);}
kg.prototype.la=function(a){return fg(a,lg(this))};kg.prototype.b=function(a,b){var c=lg(this);c.idToken=b;return hg(a,c)};kg.prototype.f=function(a,b){var c=lg(this);return cg(ig(a,c),b)};
function lg(a){var b={};a.idToken&&(b.id_token=a.idToken);a.accessToken&&(b.access_token=a.accessToken);a.secret&&(b.oauth_token_secret=a.secret);b.providerId=a.providerId;a.nonce&&!a.a&&(b.nonce=a.nonce);b={postBody:Pd(b).toString(),requestUri:"http://localhost"};a.a&&(delete b.postBody,b.pendingToken=a.a);return b}
kg.prototype.w=function(){var a={providerId:this.providerId,signInMethod:this.signInMethod};this.idToken&&(a.oauthIdToken=this.idToken);this.accessToken&&(a.oauthAccessToken=this.accessToken);this.secret&&(a.oauthTokenSecret=this.secret);this.nonce&&(a.nonce=this.nonce);this.a&&(a.pendingToken=this.a);return a};
function mg(a){if(a&&a.providerId&&a.signInMethod){var b={idToken:a.oauthIdToken,accessToken:a.oauthTokenSecret?null:a.oauthAccessToken,oauthTokenSecret:a.oauthTokenSecret,oauthToken:a.oauthTokenSecret&&a.oauthAccessToken,nonce:a.nonce,pendingToken:a.pendingToken};try{return new kg(a.providerId,b,a.signInMethod)}catch(c){}}return null}function ng(a,b){this.Cc=b||[];L(this,{providerId:a,isOAuthProvider:!0});this.zb={};this.eb=(Qf(a)||{}).Oa||null;this.ab=null;}
ng.prototype.Da=function(a){this.zb=Ta(a);return this};function og(a){if("string"!==typeof a||0!=a.indexOf("saml."))throw new M("argument-error",'SAML provider IDs must be prefixed with "saml."');ng.call(this,a,[]);}u(og,ng);function N(a){ng.call(this,a,Of);this.a=[];}u(N,ng);N.prototype.ua=function(a){Na(this.a,a)||this.a.push(a);return this};N.prototype.Fb=function(){return Qa(this.a)};
N.prototype.credential=function(a,b){var c;r(a)?c={idToken:a.idToken||null,accessToken:a.accessToken||null,nonce:a.rawNonce||null}:c={idToken:a||null,accessToken:b||null};if(!c.idToken&&!c.accessToken)throw new M("argument-error","credential failed: must provide the ID token and/or the access token.");return new kg(this.providerId,c,this.providerId)};function pg(){N.call(this,"facebook.com");}u(pg,N);K(pg,"PROVIDER_ID","facebook.com");K(pg,"FACEBOOK_SIGN_IN_METHOD","facebook.com");
function qg(a){if(!a)throw new M("argument-error","credential failed: expected 1 argument (the OAuth access token).");var b=a;r(a)&&(b=a.accessToken);return (new pg).credential({accessToken:b})}function rg(){N.call(this,"github.com");}u(rg,N);K(rg,"PROVIDER_ID","github.com");K(rg,"GITHUB_SIGN_IN_METHOD","github.com");
function sg(a){if(!a)throw new M("argument-error","credential failed: expected 1 argument (the OAuth access token).");var b=a;r(a)&&(b=a.accessToken);return (new rg).credential({accessToken:b})}function tg(){N.call(this,"google.com");this.ua("profile");}u(tg,N);K(tg,"PROVIDER_ID","google.com");K(tg,"GOOGLE_SIGN_IN_METHOD","google.com");function ug(a,b){var c=a;r(a)&&(c=a.idToken,b=a.accessToken);return (new tg).credential({idToken:c,accessToken:b})}function vg(){ng.call(this,"twitter.com",Nf);}u(vg,ng);
K(vg,"PROVIDER_ID","twitter.com");K(vg,"TWITTER_SIGN_IN_METHOD","twitter.com");function wg(a,b){var c=a;r(c)||(c={oauthToken:a,oauthTokenSecret:b});if(!c.oauthToken||!c.oauthTokenSecret)throw new M("argument-error","credential failed: expected 2 arguments (the OAuth access token and secret).");return new kg("twitter.com",c,"twitter.com")}
function xg(a,b,c){this.a=a;this.c=b;K(this,"providerId","password");K(this,"signInMethod",c===yg.EMAIL_LINK_SIGN_IN_METHOD?yg.EMAIL_LINK_SIGN_IN_METHOD:yg.EMAIL_PASSWORD_SIGN_IN_METHOD);}xg.prototype.la=function(a){return this.signInMethod==yg.EMAIL_LINK_SIGN_IN_METHOD?O(a,zg,{email:this.a,oobCode:this.c}):O(a,Ag,{email:this.a,password:this.c})};
xg.prototype.b=function(a,b){return this.signInMethod==yg.EMAIL_LINK_SIGN_IN_METHOD?O(a,Bg,{idToken:b,email:this.a,oobCode:this.c}):O(a,Cg,{idToken:b,email:this.a,password:this.c})};xg.prototype.f=function(a,b){return cg(this.la(a),b)};xg.prototype.w=function(){return {email:this.a,password:this.c,signInMethod:this.signInMethod}};function Dg(a){return a&&a.email&&a.password?new xg(a.email,a.password,a.signInMethod):null}function yg(){L(this,{providerId:"password",isOAuthProvider:!1});}
function Eg(a,b){b=Fg(b);if(!b)throw new M("argument-error","Invalid email link!");return new xg(a,b,yg.EMAIL_LINK_SIGN_IN_METHOD)}function Fg(a){a=ag(a);a=new $f(a);var b=Kd(a.a,"oobCode")||null;return "signIn"===(Kd(a.a,"mode")||null)&&b?b:null}L(yg,{PROVIDER_ID:"password"});L(yg,{EMAIL_LINK_SIGN_IN_METHOD:"emailLink"});L(yg,{EMAIL_PASSWORD_SIGN_IN_METHOD:"password"});
function Gg(a){if(!(a.Ua&&a.Ta||a.Fa&&a.$))throw new M("internal-error");this.a=a;K(this,"providerId","phone");K(this,"signInMethod","phone");}Gg.prototype.la=function(a){return a.Va(Hg(this))};Gg.prototype.b=function(a,b){var c=Hg(this);c.idToken=b;return O(a,Ig,c)};Gg.prototype.f=function(a,b){var c=Hg(this);c.operation="REAUTH";a=O(a,Jg,c);return cg(a,b)};
Gg.prototype.w=function(){var a={providerId:"phone"};this.a.Ua&&(a.verificationId=this.a.Ua);this.a.Ta&&(a.verificationCode=this.a.Ta);this.a.Fa&&(a.temporaryProof=this.a.Fa);this.a.$&&(a.phoneNumber=this.a.$);return a};function Kg(a){if(a&&"phone"===a.providerId&&(a.verificationId&&a.verificationCode||a.temporaryProof&&a.phoneNumber)){var b={};x(["verificationId","verificationCode","temporaryProof","phoneNumber"],function(c){a[c]&&(b[c]=a[c]);});return new Gg(b)}return null}
function Hg(a){return a.a.Fa&&a.a.$?{temporaryProof:a.a.Fa,phoneNumber:a.a.$}:{sessionInfo:a.a.Ua,code:a.a.Ta}}function Lg(a){try{this.a=a||firebase.auth();}catch(b){throw new M("argument-error","Either an instance of firebase.auth.Auth must be passed as an argument to the firebase.auth.PhoneAuthProvider constructor, or the default firebase App instance must be initialized via firebase.initializeApp().");}L(this,{providerId:"phone",isOAuthProvider:!1});}
Lg.prototype.Va=function(a,b){var c=this.a.c;return D(b.verify()).then(function(d){if(!n(d))throw new M("argument-error","An implementation of firebase.auth.ApplicationVerifier.prototype.verify() must return a firebase.Promise that resolves with a string.");switch(b.type){case "recaptcha":return Mg(c,{phoneNumber:a,recaptchaToken:d}).then(function(e){"function"===typeof b.reset&&b.reset();return e},function(e){"function"===typeof b.reset&&b.reset();throw e;});default:throw new M("argument-error",
'Only firebase.auth.ApplicationVerifiers with type="recaptcha" are currently supported.');}})};function Ng(a,b){if(!a)throw new M("missing-verification-id");if(!b)throw new M("missing-verification-code");return new Gg({Ua:a,Ta:b})}L(Lg,{PROVIDER_ID:"phone"});L(Lg,{PHONE_SIGN_IN_METHOD:"phone"});
function Og(a){if(a.temporaryProof&&a.phoneNumber)return new Gg({Fa:a.temporaryProof,$:a.phoneNumber});var b=a&&a.providerId;if(!b||"password"===b)return null;var c=a&&a.oauthAccessToken,d=a&&a.oauthTokenSecret,e=a&&a.nonce,f=a&&a.oauthIdToken,g=a&&a.pendingToken;try{switch(b){case "google.com":return ug(f,c);case "facebook.com":return qg(c);case "github.com":return sg(c);case "twitter.com":return wg(c,d);default:return c||d||f||g?g?0==b.indexOf("saml.")?new eg(b,g):new kg(b,{pendingToken:g,idToken:a.oauthIdToken,
accessToken:a.oauthAccessToken},b):(new N(b)).credential({idToken:f,accessToken:c,rawNonce:e}):null}}catch(h){return null}}function Pg(a){if(!a.isOAuthProvider)throw new M("invalid-oauth-provider");}function Qg(a,b,c,d,e,f){this.c=a;this.b=b||null;this.g=c||null;this.f=d||null;this.h=f||null;this.a=e||null;if(this.g||this.a){if(this.g&&this.a)throw new M("invalid-auth-event");if(this.g&&!this.f)throw new M("invalid-auth-event");}else throw new M("invalid-auth-event");}Qg.prototype.getUid=function(){var a=[];a.push(this.c);this.b&&a.push(this.b);this.f&&a.push(this.f);this.i&&a.push(this.i);return a.join("-")};
Qg.prototype.w=function(){return {type:this.c,eventId:this.b,urlResponse:this.g,sessionId:this.f,postBody:this.h,error:this.a&&this.a.w()}};function Rg(a){a=a||{};return a.type?new Qg(a.type,a.eventId,a.urlResponse,a.sessionId,a.error&&pf(a.error),a.postBody):null}function Sg(){this.b=null;this.a=[];}var Tg=null;Sg.prototype.subscribe=function(a){var b=this;this.a.push(a);this.b||(this.b=function(c){for(var d=0;d<b.a.length;d++)b.a[d](c);},a=J("universalLinks.subscribe",l),"function"===typeof a&&a(null,this.b));};Sg.prototype.unsubscribe=function(a){y(this.a,function(b){return b==a});};function Ug(a){var b="unauthorized-domain",c=void 0,d=Ld(a);a=d.b;d=d.f;"chrome-extension"==d?c=Gb("This chrome extension ID (chrome-extension://%s) is not authorized to run this operation. Add it to the OAuth redirect domains list in the Firebase console -> Auth section -> Sign in method tab.",a):"http"==d||"https"==d?c=Gb("This domain (%s) is not authorized to run this operation. Add it to the OAuth redirect domains list in the Firebase console -> Auth section -> Sign in method tab.",a):b="operation-not-supported-in-this-environment";
M.call(this,b,c);}u(Ug,M);function Vg(a,b,c){M.call(this,a,c);a=b||{};a.Ab&&K(this,"email",a.Ab);a.$&&K(this,"phoneNumber",a.$);a.credential&&K(this,"credential",a.credential);}u(Vg,M);Vg.prototype.w=function(){var a={code:this.code,message:this.message};this.email&&(a.email=this.email);this.phoneNumber&&(a.phoneNumber=this.phoneNumber);var b=this.credential&&this.credential.w();b&&Va(a,b);return a};Vg.prototype.toJSON=function(){return this.w()};
function Wg(a){if(a.code){var b=a.code||"";0==b.indexOf(nf)&&(b=b.substring(nf.length));var c={credential:Og(a)};if(a.email)c.Ab=a.email;else if(a.phoneNumber)c.$=a.phoneNumber;else if(!c.credential)return new M(b,a.message||void 0);return new Vg(b,c,a.message)}return null}function Xg(){}Xg.prototype.c=null;function Yg(a){return a.c||(a.c=a.b())}var Zg;function $g(){}u($g,Xg);$g.prototype.a=function(){var a=ah(this);return a?new ActiveXObject(a):new XMLHttpRequest};$g.prototype.b=function(){var a={};ah(this)&&(a[0]=!0,a[1]=!0);return a};
function ah(a){if(!a.f&&"undefined"==typeof XMLHttpRequest&&"undefined"!=typeof ActiveXObject){for(var b=["MSXML2.XMLHTTP.6.0","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP","Microsoft.XMLHTTP"],c=0;c<b.length;c++){var d=b[c];try{return new ActiveXObject(d),a.f=d}catch(e){}}throw Error("Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed");}return a.f}Zg=new $g;function bh(){}u(bh,Xg);bh.prototype.a=function(){var a=new XMLHttpRequest;if("withCredentials"in a)return a;if("undefined"!=typeof XDomainRequest)return new ch;throw Error("Unsupported browser");};bh.prototype.b=function(){return {}};
function ch(){this.a=new XDomainRequest;this.readyState=0;this.onreadystatechange=null;this.responseType=this.responseText=this.response="";this.status=-1;this.statusText="";this.a.onload=t(this.cc,this);this.a.onerror=t(this.Gb,this);this.a.onprogress=t(this.dc,this);this.a.ontimeout=t(this.hc,this);}k=ch.prototype;k.open=function(a,b,c){if(null!=c&&!c)throw Error("Only async requests are supported.");this.a.open(a,b);};
k.send=function(a){if(a)if("string"==typeof a)this.a.send(a);else throw Error("Only string data is supported");else this.a.send();};k.abort=function(){this.a.abort();};k.setRequestHeader=function(){};k.getResponseHeader=function(a){return "content-type"==a.toLowerCase()?this.a.contentType:""};k.cc=function(){this.status=200;this.response=this.responseText=this.a.responseText;dh(this,4);};k.Gb=function(){this.status=500;this.response=this.responseText="";dh(this,4);};k.hc=function(){this.Gb();};
k.dc=function(){this.status=200;dh(this,1);};function dh(a,b){a.readyState=b;if(a.onreadystatechange)a.onreadystatechange();}k.getAllResponseHeaders=function(){return "content-type: "+this.a.contentType};function eh(a,b,c){this.reset(a,b,c,void 0,void 0);}eh.prototype.a=null;eh.prototype.reset=function(a,b,c,d,e){delete this.a;};function gh(a){this.f=a;this.b=this.c=this.a=null;}function hh(a,b){this.name=a;this.value=b;}hh.prototype.toString=function(){return this.name};var ih=new hh("SEVERE",1E3),jh=new hh("WARNING",900),kh=new hh("CONFIG",700),lh=new hh("FINE",500);function mh(a){if(a.c)return a.c;if(a.a)return mh(a.a);ya("Root logger has no level set.");return null}gh.prototype.log=function(a,b,c){if(a.value>=mh(this).value)for(q(b)&&(b=b()),a=new eh(a,String(b),this.f),c&&(a.a=c),c=this;c;)c=c.a;};var nh={},oh=null;
function ph(a){oh||(oh=new gh(""),nh[""]=oh,oh.c=kh);var b;if(!(b=nh[a])){b=new gh(a);var c=a.lastIndexOf("."),d=a.substr(c+1);c=ph(a.substr(0,c));c.b||(c.b={});c.b[d]=b;b.a=c;nh[a]=b;}return b}function qh(a,b){a&&a.log(lh,b,void 0);}function rh(a){this.f=a;}u(rh,Xg);rh.prototype.a=function(){return new sh(this.f)};rh.prototype.b=function(a){return function(){return a}}({});function sh(a){F.call(this);this.u=a;this.readyState=th;this.status=0;this.responseType=this.responseText=this.response=this.statusText="";this.onreadystatechange=null;this.i=new Headers;this.b=null;this.o="GET";this.g="";this.a=!1;this.h=ph("goog.net.FetchXmlHttp");this.l=this.c=this.f=null;}u(sh,F);var th=0;k=sh.prototype;
k.open=function(a,b){if(this.readyState!=th)throw this.abort(),Error("Error reopening a connection");this.o=a;this.g=b;this.readyState=1;uh(this);};k.send=function(a){if(1!=this.readyState)throw this.abort(),Error("need to call open() first. ");this.a=!0;var b={headers:this.i,method:this.o,credentials:void 0,cache:void 0};a&&(b.body=a);this.u.fetch(new Request(this.g,b)).then(this.gc.bind(this),this.Ma.bind(this));};
k.abort=function(){this.response=this.responseText="";this.i=new Headers;this.status=0;this.c&&this.c.cancel("Request was aborted.");1<=this.readyState&&this.a&&4!=this.readyState&&(this.a=!1,vh(this,!1));this.readyState=th;};
k.gc=function(a){this.a&&(this.f=a,this.b||(this.b=a.headers,this.readyState=2,uh(this)),this.a&&(this.readyState=3,uh(this),this.a&&("arraybuffer"===this.responseType?a.arrayBuffer().then(this.ec.bind(this),this.Ma.bind(this)):"undefined"!==typeof l.ReadableStream&&"body"in a?(this.response=this.responseText="",this.c=a.body.getReader(),this.l=new TextDecoder,wh(this)):a.text().then(this.fc.bind(this),this.Ma.bind(this)))));};function wh(a){a.c.read().then(a.bc.bind(a)).catch(a.Ma.bind(a));}
k.bc=function(a){if(this.a){var b=this.l.decode(a.value?a.value:new Uint8Array(0),{stream:!a.done});b&&(this.response=this.responseText+=b);a.done?vh(this,!0):uh(this);3==this.readyState&&wh(this);}};k.fc=function(a){this.a&&(this.response=this.responseText=a,vh(this,!0));};k.ec=function(a){this.a&&(this.response=a,vh(this,!0));};k.Ma=function(a){var b=this.h;b&&b.log(jh,"Failed to fetch url "+this.g,a instanceof Error?a:Error(a));this.a&&vh(this,!0);};
function vh(a,b){b&&a.f&&(a.status=a.f.status,a.statusText=a.f.statusText);a.readyState=4;a.f=null;a.c=null;a.l=null;uh(a);}k.setRequestHeader=function(a,b){this.i.append(a,b);};k.getResponseHeader=function(a){return this.b?this.b.get(a.toLowerCase())||"":((a=this.h)&&a.log(jh,"Attempting to get response header but no headers have been received for url: "+this.g,void 0),"")};
k.getAllResponseHeaders=function(){if(!this.b){var a=this.h;a&&a.log(jh,"Attempting to get all response headers but no headers have been received for url: "+this.g,void 0);return ""}a=[];for(var b=this.b.entries(),c=b.next();!c.done;)c=c.value,a.push(c[0]+": "+c[1]),c=b.next();return a.join("\r\n")};function uh(a){a.onreadystatechange&&a.onreadystatechange.call(a);}function xh(a){F.call(this);this.headers=new rd;this.D=a||null;this.c=!1;this.A=this.a=null;this.h=this.N=this.l="";this.f=this.I=this.i=this.G=!1;this.g=0;this.u=null;this.o=yh;this.v=this.O=!1;}u(xh,F);var yh="";xh.prototype.b=ph("goog.net.XhrIo");var zh=/^https?$/i,Ah=["POST","PUT"];
function Bh(a,b,c,d,e){if(a.a)throw Error("[goog.net.XhrIo] Object is active with another request="+a.l+"; newUri="+b);c=c?c.toUpperCase():"GET";a.l=b;a.h="";a.N=c;a.G=!1;a.c=!0;a.a=a.D?a.D.a():Zg.a();a.A=a.D?Yg(a.D):Yg(Zg);a.a.onreadystatechange=t(a.Jb,a);try{qh(a.b,Ch(a,"Opening Xhr")),a.I=!0,a.a.open(c,String(b),!0),a.I=!1;}catch(g){qh(a.b,Ch(a,"Error opening Xhr: "+g.message));Dh(a,g);return}b=d||"";var f=new rd(a.headers);e&&qd(e,function(g,h){f.set(h,g);});e=La(f.U());d=l.FormData&&b instanceof
l.FormData;!Na(Ah,c)||e||d||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");f.forEach(function(g,h){this.a.setRequestHeader(h,g);},a);a.o&&(a.a.responseType=a.o);"withCredentials"in a.a&&a.a.withCredentials!==a.O&&(a.a.withCredentials=a.O);try{Eh(a),0<a.g&&(a.v=Fh(a.a),qh(a.b,Ch(a,"Will abort after "+a.g+"ms if incomplete, xhr2 "+a.v)),a.v?(a.a.timeout=a.g,a.a.ontimeout=t(a.Ga,a)):a.u=md(a.Ga,a.g,a)),qh(a.b,Ch(a,"Sending request")),a.i=!0,a.a.send(b),a.i=!1;}catch(g){qh(a.b,
Ch(a,"Send error: "+g.message)),Dh(a,g);}}function Fh(a){return tc&&Dc(9)&&"number"==typeof a.timeout&&void 0!==a.ontimeout}function Ma(a){return "content-type"==a.toLowerCase()}k=xh.prototype;k.Ga=function(){"undefined"!=typeof fa&&this.a&&(this.h="Timed out after "+this.g+"ms, aborting",qh(this.b,Ch(this,this.h)),this.dispatchEvent("timeout"),this.abort(8));};function Dh(a,b){a.c=!1;a.a&&(a.f=!0,a.a.abort(),a.f=!1);a.h=b;Gh(a);Hh(a);}
function Gh(a){a.G||(a.G=!0,a.dispatchEvent("complete"),a.dispatchEvent("error"));}k.abort=function(){this.a&&this.c&&(qh(this.b,Ch(this,"Aborting")),this.c=!1,this.f=!0,this.a.abort(),this.f=!1,this.dispatchEvent("complete"),this.dispatchEvent("abort"),Hh(this));};k.va=function(){this.a&&(this.c&&(this.c=!1,this.f=!0,this.a.abort(),this.f=!1),Hh(this,!0));xh.qb.va.call(this);};k.Jb=function(){this.qa||(this.I||this.i||this.f?Ih(this):this.vc());};k.vc=function(){Ih(this);};
function Ih(a){if(a.c&&"undefined"!=typeof fa)if(a.A[1]&&4==Jh(a)&&2==Kh(a))qh(a.b,Ch(a,"Local request error detected and ignored"));else if(a.i&&4==Jh(a))md(a.Jb,0,a);else if(a.dispatchEvent("readystatechange"),4==Jh(a)){qh(a.b,Ch(a,"Request complete"));a.c=!1;try{var b=Kh(a);a:switch(b){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break a;default:c=!1;}var d;if(!(d=c)){var e;if(e=0===b){var f=String(a.l).match(ud)[1]||null;if(!f&&l.self&&l.self.location){var g=l.self.location.protocol;
f=g.substr(0,g.length-1);}e=!zh.test(f?f.toLowerCase():"");}d=e;}if(d)a.dispatchEvent("complete"),a.dispatchEvent("success");else{try{var h=2<Jh(a)?a.a.statusText:"";}catch(m){qh(a.b,"Can not get status: "+m.message),h="";}a.h=h+" ["+Kh(a)+"]";Gh(a);}}finally{Hh(a);}}}function Hh(a,b){if(a.a){Eh(a);var c=a.a,d=a.A[0]?ka:null;a.a=null;a.A=null;b||a.dispatchEvent("ready");try{c.onreadystatechange=d;}catch(e){(a=a.b)&&a.log(ih,"Problem encountered resetting onreadystatechange: "+e.message,void 0);}}}
function Eh(a){a.a&&a.v&&(a.a.ontimeout=null);a.u&&(l.clearTimeout(a.u),a.u=null);}function Jh(a){return a.a?a.a.readyState:0}function Kh(a){try{return 2<Jh(a)?a.a.status:-1}catch(b){return -1}}function Lh(a){try{return a.a?a.a.responseText:""}catch(b){return qh(a.b,"Can not get responseText: "+b.message),""}}
k.getResponse=function(){try{if(!this.a)return null;if("response"in this.a)return this.a.response;switch(this.o){case yh:case "text":return this.a.responseText;case "arraybuffer":if("mozResponseArrayBuffer"in this.a)return this.a.mozResponseArrayBuffer}var a=this.b;a&&a.log(ih,"Response type "+this.o+" is not supported on this browser",void 0);return null}catch(b){return qh(this.b,"Can not get response: "+b.message),null}};function Ch(a,b){return b+" ["+a.N+" "+a.l+" "+Kh(a)+"]"}function Mh(a){var b=Nh;this.g=[];this.v=b;this.u=a||null;this.f=this.a=!1;this.c=void 0;this.l=this.A=this.i=!1;this.h=0;this.b=null;this.m=0;}Mh.prototype.cancel=function(a){if(this.a)this.c instanceof Mh&&this.c.cancel();else{if(this.b){var b=this.b;delete this.b;a?b.cancel(a):(b.m--,0>=b.m&&b.cancel());}this.v?this.v.call(this.u,this):this.l=!0;this.a||(a=new Oh(this),Ph(this),Qh(this,!1,a));}};Mh.prototype.o=function(a,b){this.i=!1;Qh(this,a,b);};function Qh(a,b,c){a.a=!0;a.c=c;a.f=!b;Rh(a);}
function Ph(a){if(a.a){if(!a.l)throw new Sh(a);a.l=!1;}}function Th(a,b){Uh(a,null,b,void 0);}function Uh(a,b,c,d){a.g.push([b,c,d]);a.a&&Rh(a);}Mh.prototype.then=function(a,b,c){var d,e,f=new C(function(g,h){d=g;e=h;});Uh(this,d,function(g){g instanceof Oh?f.cancel():e(g);});return f.then(a,b,c)};Mh.prototype.$goog_Thenable=!0;function Vh(a){return Ka(a.g,function(b){return q(b[1])})}
function Rh(a){if(a.h&&a.a&&Vh(a)){var b=a.h,c=Wh[b];c&&(l.clearTimeout(c.a),delete Wh[b]);a.h=0;}a.b&&(a.b.m--,delete a.b);b=a.c;for(var d=c=!1;a.g.length&&!a.i;){var e=a.g.shift(),f=e[0],g=e[1];e=e[2];if(f=a.f?g:f)try{var h=f.call(e||a.u,b);void 0!==h&&(a.f=a.f&&(h==b||h instanceof Error),a.c=b=h);if(wa(b)||"function"===typeof l.Promise&&b instanceof l.Promise)d=!0,a.i=!0;}catch(m){b=m,a.f=!0,Vh(a)||(c=!0);}}a.c=b;d&&(h=t(a.o,a,!0),d=t(a.o,a,!1),b instanceof Mh?(Uh(b,h,d),b.A=!0):b.then(h,d));c&&(b=
new Xh(b),Wh[b.a]=b,a.h=b.a);}function Sh(){w.call(this);}u(Sh,w);Sh.prototype.message="Deferred has already fired";Sh.prototype.name="AlreadyCalledError";function Oh(){w.call(this);}u(Oh,w);Oh.prototype.message="Deferred was canceled";Oh.prototype.name="CanceledError";function Xh(a){this.a=l.setTimeout(t(this.c,this),0);this.b=a;}Xh.prototype.c=function(){delete Wh[this.a];throw this.b;};var Wh={};function Yh(a){var c=document,d=cb(a).toString(),e=document.createElement("SCRIPT"),f={Lb:e,Ga:void 0},g=new Mh(f),h=null,m=5E3;(h=window.setTimeout(function(){Zh(e,!0);var p=new $h(ai,"Timeout reached for loading script "+d);Ph(g);Qh(g,!1,p);},m),f.Ga=h);e.onload=e.onreadystatechange=function(){e.readyState&&"loaded"!=e.readyState&&"complete"!=e.readyState||(Zh(e,!1,h),Ph(g),Qh(g,!0,null));};e.onerror=function(){Zh(e,!0,h);var p=new $h(bi,"Error while loading script "+
d);Ph(g);Qh(g,!1,p);};f={};Va(f,{type:"text/javascript",charset:"UTF-8"});Wd(e,f);Fb(e,a);ci(c).appendChild(e);return g}function ci(a){var b;return (b=(a||document).getElementsByTagName("HEAD"))&&0!=b.length?b[0]:a.documentElement}function Nh(){if(this&&this.Lb){var a=this.Lb;a&&"SCRIPT"==a.tagName&&Zh(a,!0,this.Ga);}}
function Zh(a,b,c){null!=c&&l.clearTimeout(c);a.onload=ka;a.onerror=ka;a.onreadystatechange=ka;b&&window.setTimeout(function(){a&&a.parentNode&&a.parentNode.removeChild(a);},0);}var bi=0,ai=1;function $h(a,b){var c="Jsloader error (code #"+a+")";b&&(c+=": "+b);w.call(this,c);this.code=a;}u($h,w);function di(a){this.f=a;}u(di,Xg);di.prototype.a=function(){return new this.f};di.prototype.b=function(){return {}};
function ei(a,b,c){this.b=a;a=b||{};this.i=a.secureTokenEndpoint||"https://securetoken.googleapis.com/v1/token";this.m=a.secureTokenTimeout||fi;this.f=Ta(a.secureTokenHeaders||gi);this.g=a.firebaseEndpoint||"https://www.googleapis.com/identitytoolkit/v3/relyingparty/";this.h=a.firebaseTimeout||hi;this.a=Ta(a.firebaseHeaders||ii);c&&(this.a["X-Client-Version"]=c,this.f["X-Client-Version"]=c);c="Node"==Ae();c=l.XMLHttpRequest||c&&firebase.INTERNAL.node&&firebase.INTERNAL.node.XMLHttpRequest;if(!c&&
!ze())throw new M("internal-error","The XMLHttpRequest compatibility library was not found.");this.c=void 0;ze()?this.c=new rh(self):Be()?this.c=new di(c):this.c=new bh;}var ji,dg="idToken",fi=new Pe(3E4,6E4),gi={"Content-Type":"application/x-www-form-urlencoded"},hi=new Pe(3E4,6E4),ii={"Content-Type":"application/json"};function ki(a,b){b?a.a["X-Firebase-Locale"]=b:delete a.a["X-Firebase-Locale"];}
function li(a,b){b?(a.a["X-Client-Version"]=b,a.f["X-Client-Version"]=b):(delete a.a["X-Client-Version"],delete a.f["X-Client-Version"]);}function mi(a,b,c,d,e,f,g){ke()||ze()?a=t(a.o,a):(ji||(ji=new C(function(h,m){ni(h,m);})),a=t(a.l,a));a(b,c,d,e,f,g);}
ei.prototype.o=function(a,b,c,d,e,f){if(ze()&&("undefined"===typeof l.fetch||"undefined"===typeof l.Headers||"undefined"===typeof l.Request))throw new M("operation-not-supported-in-this-environment","fetch, Headers and Request native APIs or equivalent Polyfills must be available to support HTTP requests from a Worker environment.");var g=new xh(this.c);if(f){g.g=Math.max(0,f);var h=setTimeout(function(){g.dispatchEvent("timeout");},f);}Zc(g,"complete",function(){h&&clearTimeout(h);var m=null;try{m=
JSON.parse(Lh(this))||null;}catch(p){m=null;}b&&b(m);});ed(g,"ready",function(){h&&clearTimeout(h);oc(this);});ed(g,"timeout",function(){h&&clearTimeout(h);oc(this);b&&b(null);});Bh(g,a,c,d,e);};var oi=new Wa(Xa,"https://apis.google.com/js/client.js?onload=%{onload}"),pi="__fcb"+Math.floor(1E6*Math.random()).toString();
function ni(a,b){if(((window.gapi||{}).client||{}).request)a();else{l[pi]=function(){((window.gapi||{}).client||{}).request?a():b(Error("CORS_UNSUPPORTED"));};var c=db(oi,{onload:pi});Th(Yh(c),function(){b(Error("CORS_UNSUPPORTED"));});}}
ei.prototype.l=function(a,b,c,d,e){var f=this;ji.then(function(){window.gapi.client.setApiKey(f.b);var g=window.gapi.auth.getToken();window.gapi.auth.setToken(null);window.gapi.client.request({path:a,method:c,body:d,headers:e,authType:"none",callback:function(h){window.gapi.auth.setToken(g);b&&b(h);}});}).s(function(g){b&&b({error:{message:g&&g.message||"CORS_UNSUPPORTED"}});});};
function qi(a,b){return new C(function(c,d){"refresh_token"==b.grant_type&&b.refresh_token||"authorization_code"==b.grant_type&&b.code?mi(a,a.i+"?key="+encodeURIComponent(a.b),function(e){e?e.error?d(ri(e)):e.access_token&&e.refresh_token?c(e):d(new M("internal-error")):d(new M("network-request-failed"));},"POST",Pd(b).toString(),a.f,a.m.get()):d(new M("internal-error"));})}
function si(a,b,c,d,e,f){var g=Ld(a.g+b);G(g,"key",a.b);f&&G(g,"cb",va().toString());var h="GET"==c;if(h)for(var m in d)d.hasOwnProperty(m)&&G(g,m,d[m]);return new C(function(p,v){mi(a,g.toString(),function(z){z?z.error?v(ri(z,e||{})):p(z):v(new M("network-request-failed"));},c,h?void 0:ae(Le(d)),a.a,a.h.get());})}function ti(a){a=a.email;if(!n(a)||!te.test(a))throw new M("invalid-email");}function ui(a){"email"in a&&ti(a);}
function vi(a,b){return O(a,wi,{identifier:b,continueUri:Ie()?he():"http://localhost"}).then(function(c){return c.signinMethods||[]})}function xi(a){return O(a,yi,{}).then(function(b){return b.authorizedDomains||[]})}function zi(a){if(!a[dg])throw new M("internal-error");}
function Ai(a){if(a.phoneNumber||a.temporaryProof){if(!a.phoneNumber||!a.temporaryProof)throw new M("internal-error");}else{if(!a.sessionInfo)throw new M("missing-verification-id");if(!a.code)throw new M("missing-verification-code");}}ei.prototype.ob=function(){return O(this,Bi,{})};ei.prototype.rb=function(a,b){return O(this,Ci,{idToken:a,email:b})};ei.prototype.sb=function(a,b){return O(this,Cg,{idToken:a,password:b})};var Di={displayName:"DISPLAY_NAME",photoUrl:"PHOTO_URL"};k=ei.prototype;
k.tb=function(a,b){var c={idToken:a},d=[];Ra(Di,function(e,f){var g=b[f];null===g?d.push(e):f in b&&(c[f]=g);});d.length&&(c.deleteAttribute=d);return O(this,Ci,c)};k.lb=function(a,b){a={requestType:"PASSWORD_RESET",email:a};Va(a,b);return O(this,Ei,a)};k.mb=function(a,b){a={requestType:"EMAIL_SIGNIN",email:a};Va(a,b);return O(this,Fi,a)};k.kb=function(a,b){a={requestType:"VERIFY_EMAIL",idToken:a};Va(a,b);return O(this,Gi,a)};function Mg(a,b){return O(a,Hi,b)}k.Va=function(a){return O(this,Ii,a)};
function Ji(a,b,c){return O(a,Ki,{idToken:b,deleteProvider:c})}function Li(a){if(!a.requestUri||!a.sessionId&&!a.postBody&&!a.pendingToken)throw new M("internal-error");}function Mi(a,b){b.oauthIdToken&&b.providerId&&0==b.providerId.indexOf("oidc.")&&!b.pendingToken&&(a.sessionId?b.nonce=a.sessionId:a.postBody&&(a=new Cd(a.postBody),Td(a,"nonce")&&(b.nonce=a.get("nonce"))));return b}
function Ni(a){var b=null;a.needConfirmation?(a.code="account-exists-with-different-credential",b=Wg(a)):"FEDERATED_USER_ID_ALREADY_LINKED"==a.errorMessage?(a.code="credential-already-in-use",b=Wg(a)):"EMAIL_EXISTS"==a.errorMessage?(a.code="email-already-in-use",b=Wg(a)):a.errorMessage&&(b=Oi(a.errorMessage));if(b)throw b;if(!a[dg])throw new M("internal-error");}function fg(a,b){b.returnIdpCredential=!0;return O(a,Pi,b)}function hg(a,b){b.returnIdpCredential=!0;return O(a,Qi,b)}
function ig(a,b){b.returnIdpCredential=!0;b.autoCreate=!1;return O(a,Ri,b)}function Si(a){if(!a.oobCode)throw new M("invalid-action-code");}k.$a=function(a,b){return O(this,Ti,{oobCode:a,newPassword:b})};k.Ka=function(a){return O(this,Ui,{oobCode:a})};k.Xa=function(a){return O(this,Vi,{oobCode:a})};
var Vi={endpoint:"setAccountInfo",C:Si,da:"email"},Ui={endpoint:"resetPassword",C:Si,J:function(a){var b=a.requestType;if(!b||!a.email&&"EMAIL_SIGNIN"!=b)throw new M("internal-error");}},Wi={endpoint:"signupNewUser",C:function(a){ti(a);if(!a.password)throw new M("weak-password");},J:zi,R:!0},wi={endpoint:"createAuthUri"},Xi={endpoint:"deleteAccount",T:["idToken"]},Ki={endpoint:"setAccountInfo",T:["idToken","deleteProvider"],C:function(a){if(!na(a.deleteProvider))throw new M("internal-error");}},zg=
{endpoint:"emailLinkSignin",T:["email","oobCode"],C:ti,J:zi,R:!0},Bg={endpoint:"emailLinkSignin",T:["idToken","email","oobCode"],C:ti,J:zi,R:!0},Yi={endpoint:"getAccountInfo"},Fi={endpoint:"getOobConfirmationCode",T:["requestType"],C:function(a){if("EMAIL_SIGNIN"!=a.requestType)throw new M("internal-error");ti(a);},da:"email"},Gi={endpoint:"getOobConfirmationCode",T:["idToken","requestType"],C:function(a){if("VERIFY_EMAIL"!=a.requestType)throw new M("internal-error");},da:"email"},Ei={endpoint:"getOobConfirmationCode",
T:["requestType"],C:function(a){if("PASSWORD_RESET"!=a.requestType)throw new M("internal-error");ti(a);},da:"email"},yi={wb:!0,endpoint:"getProjectConfig",Ib:"GET"},Zi={wb:!0,endpoint:"getRecaptchaParam",Ib:"GET",J:function(a){if(!a.recaptchaSiteKey)throw new M("internal-error");}},Ti={endpoint:"resetPassword",C:Si,da:"email"},Hi={endpoint:"sendVerificationCode",T:["phoneNumber","recaptchaToken"],da:"sessionInfo"},Ci={endpoint:"setAccountInfo",T:["idToken"],C:ui,R:!0},Cg={endpoint:"setAccountInfo",
T:["idToken"],C:function(a){ui(a);if(!a.password)throw new M("weak-password");},J:zi,R:!0},Bi={endpoint:"signupNewUser",J:zi,R:!0},Pi={endpoint:"verifyAssertion",C:Li,Qa:Mi,J:Ni,R:!0},Ri={endpoint:"verifyAssertion",C:Li,Qa:Mi,J:function(a){if(a.errorMessage&&"USER_NOT_FOUND"==a.errorMessage)throw new M("user-not-found");if(a.errorMessage)throw Oi(a.errorMessage);if(!a[dg])throw new M("internal-error");},R:!0},Qi={endpoint:"verifyAssertion",C:function(a){Li(a);if(!a.idToken)throw new M("internal-error");
},Qa:Mi,J:Ni,R:!0},$i={endpoint:"verifyCustomToken",C:function(a){if(!a.token)throw new M("invalid-custom-token");},J:zi,R:!0},Ag={endpoint:"verifyPassword",C:function(a){ti(a);if(!a.password)throw new M("wrong-password");},J:zi,R:!0},Ii={endpoint:"verifyPhoneNumber",C:Ai,J:zi},Ig={endpoint:"verifyPhoneNumber",C:function(a){if(!a.idToken)throw new M("internal-error");Ai(a);},J:function(a){if(a.temporaryProof)throw a.code="credential-already-in-use",Wg(a);zi(a);}},Jg={Vb:{USER_NOT_FOUND:"user-not-found"},
endpoint:"verifyPhoneNumber",C:Ai,J:zi};function O(a,b,c){if(!bf(c,b.T))return E(new M("internal-error"));var d=b.Ib||"POST",e;return D(c).then(b.C).then(function(){b.R&&(c.returnSecureToken=!0);return si(a,b.endpoint,d,c,b.Vb,b.wb||!1)}).then(function(f){e=f;return b.Qa?b.Qa(c,e):e}).then(b.J).then(function(){if(!b.da)return e;if(!(b.da in e))throw new M("internal-error");return e[b.da]})}function Oi(a){return ri({error:{errors:[{message:a}],code:400,message:a}})}
function ri(a,b){var c=(a.error&&a.error.errors&&a.error.errors[0]||{}).reason||"";var d={keyInvalid:"invalid-api-key",ipRefererBlocked:"app-not-authorized"};if(c=d[c]?new M(d[c]):null)return c;c=a.error&&a.error.message||"";d={INVALID_CUSTOM_TOKEN:"invalid-custom-token",CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_EMAIL:"invalid-email",INVALID_PASSWORD:"wrong-password",USER_DISABLED:"user-disabled",
MISSING_PASSWORD:"internal-error",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_OR_INVALID_NONCE:"missing-or-invalid-nonce",INVALID_MESSAGE_PAYLOAD:"invalid-message-payload",INVALID_RECIPIENT_EMAIL:"invalid-recipient-email",INVALID_SENDER:"invalid-sender",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",
EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",INVALID_PROVIDER_ID:"invalid-provider-id",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",CORS_UNSUPPORTED:"cors-unsupported",DYNAMIC_LINK_NOT_ACTIVATED:"dynamic-link-not-activated",INVALID_APP_ID:"invalid-app-id",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",WEAK_PASSWORD:"weak-password",
OPERATION_NOT_ALLOWED:"operation-not-allowed",USER_CANCELLED:"user-cancelled",CAPTCHA_CHECK_FAILED:"captcha-check-failed",INVALID_APP_CREDENTIAL:"invalid-app-credential",INVALID_CODE:"invalid-verification-code",INVALID_PHONE_NUMBER:"invalid-phone-number",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_APP_CREDENTIAL:"missing-app-credential",MISSING_CODE:"missing-verification-code",MISSING_PHONE_NUMBER:"missing-phone-number",MISSING_SESSION_INFO:"missing-verification-id",
QUOTA_EXCEEDED:"quota-exceeded",SESSION_EXPIRED:"code-expired",REJECTED_CREDENTIAL:"rejected-credential",INVALID_CONTINUE_URI:"invalid-continue-uri",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",MISSING_IOS_BUNDLE_ID:"missing-ios-bundle-id",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_DYNAMIC_LINK_DOMAIN:"invalid-dynamic-link-domain",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",INVALID_CERT_HASH:"invalid-cert-hash",ADMIN_ONLY_OPERATION:"admin-restricted-operation"};Va(d,
b||{});b=(b=c.match(/^[^\s]+\s*:\s*(.*)$/))&&1<b.length?b[1]:void 0;for(var e in d)if(0===c.indexOf(e))return new M(d[e],b);!b&&a&&(b=Ke(a));return new M("internal-error",b)}function aj(a){this.b=a;this.a=null;this.gb=bj(this);}
function bj(a){return cj().then(function(){return new C(function(b,c){J("gapi.iframes.getContext")().open({where:document.body,url:a.b,messageHandlersFilter:J("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER"),attributes:{style:{position:"absolute",top:"-100px",width:"1px",height:"1px"}},dontclear:!0},function(d){function e(){clearTimeout(f);b();}a.a=d;a.a.restyle({setHideOnLeave:!1});var f=setTimeout(function(){c(Error("Network Error"));},dj.get());d.ping(e).then(e,function(){c(Error("Network Error"));});});})})}
function ej(a,b){return a.gb.then(function(){return new C(function(c){a.a.send(b.type,b,c,J("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER"));})})}function fj(a,b){a.gb.then(function(){a.a.register("authEvent",b,J("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER"));});}var gj=new Wa(Xa,"https://apis.google.com/js/api.js?onload=%{onload}"),hj=new Pe(3E4,6E4),dj=new Pe(5E3,15E3),ij=null;
function cj(){return ij?ij:ij=(new C(function(a,b){function c(){Oe();J("gapi.load")("gapi.iframes",{callback:a,ontimeout:function(){Oe();b(Error("Network Error"));},timeout:hj.get()});}if(J("gapi.iframes.Iframe"))a();else if(J("gapi.load"))c();else{var d="__iframefcb"+Math.floor(1E6*Math.random()).toString();l[d]=function(){J("gapi.load")?c():b(Error("Network Error"));};d=db(gj,{onload:d});D(Yh(d)).s(function(){b(Error("Network Error"));});}})).s(function(a){ij=null;throw a;})}function jj(a,b,c){this.i=a;this.g=b;this.h=c;this.f=null;this.a=Md(this.i,"/__/auth/iframe");G(this.a,"apiKey",this.g);G(this.a,"appName",this.h);this.b=null;this.c=[];}jj.prototype.toString=function(){this.f?G(this.a,"v",this.f):Sd(this.a.a,"v");this.b?G(this.a,"eid",this.b):Sd(this.a.a,"eid");this.c.length?G(this.a,"fw",this.c.join(",")):Sd(this.a.a,"fw");return this.a.toString()};function kj(a,b,c,d,e){this.o=a;this.l=b;this.c=c;this.m=d;this.h=this.g=this.i=null;this.a=e;this.f=null;}
kj.prototype.toString=function(){var a=Md(this.o,"/__/auth/handler");G(a,"apiKey",this.l);G(a,"appName",this.c);G(a,"authType",this.m);if(this.a.isOAuthProvider){var b=this.a;try{var c=firebase.app(this.c).auth().ea();}catch(h){c=null;}b.ab=c;G(a,"providerId",this.a.providerId);b=this.a;c=Le(b.zb);for(var d in c)c[d]=c[d].toString();d=b.Cc;c=Ta(c);for(var e=0;e<d.length;e++){var f=d[e];f in c&&delete c[f];}b.eb&&b.ab&&!c[b.eb]&&(c[b.eb]=b.ab);Sa(c)||G(a,"customParameters",Ke(c));}"function"===typeof this.a.Fb&&
(b=this.a.Fb(),b.length&&G(a,"scopes",b.join(",")));this.i?G(a,"redirectUrl",this.i):Sd(a.a,"redirectUrl");this.g?G(a,"eventId",this.g):Sd(a.a,"eventId");this.h?G(a,"v",this.h):Sd(a.a,"v");if(this.b)for(var g in this.b)this.b.hasOwnProperty(g)&&!Kd(a,g)&&G(a,g,this.b[g]);this.f?G(a,"eid",this.f):Sd(a.a,"eid");g=lj(this.c);g.length&&G(a,"fw",g.join(","));return a.toString()};function lj(a){try{return firebase.app(a).auth().ya()}catch(b){return []}}
function mj(a,b,c,d,e){this.l=a;this.f=b;this.b=c;this.c=d||null;this.h=e||null;this.o=this.u=this.v=null;this.g=[];this.m=this.a=null;}
function nj(a){var b=he();return xi(a).then(function(c){a:{var d=Ld(b),e=d.f;d=d.b;for(var f=0;f<c.length;f++){var g=c[f];var h=d;var m=e;0==g.indexOf("chrome-extension://")?h=Ld(g).b==h&&"chrome-extension"==m:"http"!=m&&"https"!=m?h=!1:se.test(g)?h=h==g:(g=g.split(".").join("\\."),h=(new RegExp("^(.+\\."+g+"|"+g+")$","i")).test(h));if(h){c=!0;break a}}c=!1;}if(!c)throw new Ug(he());})}
function oj(a){if(a.m)return a.m;a.m=ue().then(function(){if(!a.u){var b=a.c,c=a.h,d=lj(a.b),e=new jj(a.l,a.f,a.b);e.f=b;e.b=c;e.c=Qa(d||[]);a.u=e.toString();}a.i=new aj(a.u);pj(a);});return a.m}k=mj.prototype;k.Ea=function(a,b,c){var d=new M("popup-closed-by-user"),e=new M("web-storage-unsupported"),f=this,g=!1;return this.ga().then(function(){qj(f).then(function(h){h||(a&&oe(a),b(e),g=!0);});}).s(function(){}).then(function(){if(!g)return re(a)}).then(function(){if(!g)return nd(c).then(function(){b(d);})})};
k.Mb=function(){var a=I();return !Je(a)&&!Ne(a)};k.Hb=function(){return !1};
k.Db=function(a,b,c,d,e,f,g){if(!a)return E(new M("popup-blocked"));if(g&&!Je())return this.ga().s(function(m){oe(a);e(m);}),d(),D();this.a||(this.a=nj(rj(this)));var h=this;return this.a.then(function(){var m=h.ga().s(function(p){oe(a);e(p);throw p;});d();return m}).then(function(){Pg(c);if(!g){var m=sj(h.l,h.f,h.b,b,c,null,f,h.c,void 0,h.h);ie(m,a);}}).s(function(m){"auth/network-request-failed"==m.code&&(h.a=null);throw m;})};
function rj(a){a.o||(a.v=a.c?Ee(a.c,lj(a.b)):null,a.o=new ei(a.f,Lf(a.h),a.v));return a.o}k.Ca=function(a,b,c){this.a||(this.a=nj(rj(this)));var d=this;return this.a.then(function(){Pg(b);var e=sj(d.l,d.f,d.b,a,b,he(),c,d.c,void 0,d.h);ie(e);}).s(function(e){"auth/network-request-failed"==e.code&&(d.a=null);throw e;})};k.ga=function(){var a=this;return oj(this).then(function(){return a.i.gb}).s(function(){a.a=null;throw new M("network-request-failed");})};k.Ob=function(){return !0};
function sj(a,b,c,d,e,f,g,h,m,p){a=new kj(a,b,c,d,e);a.i=f;a.g=g;a.h=h;a.b=Ta(m||null);a.f=p;return a.toString()}function pj(a){if(!a.i)throw Error("IfcHandler must be initialized!");fj(a.i,function(b){var c={};if(b&&b.authEvent){var d=!1;b=Rg(b.authEvent);for(c=0;c<a.g.length;c++)d=a.g[c](b)||d;c={};c.status=d?"ACK":"ERROR";return D(c)}c.status="ERROR";return D(c)});}
function qj(a){var b={type:"webStorageSupport"};return oj(a).then(function(){return ej(a.i,b)}).then(function(c){if(c&&c.length&&"undefined"!==typeof c[0].webStorageSupport)return c[0].webStorageSupport;throw Error();})}k.wa=function(a){this.g.push(a);};k.La=function(a){y(this.g,function(b){return b==a});};function tj(a){this.a=a||firebase.INTERNAL.reactNative&&firebase.INTERNAL.reactNative.AsyncStorage;if(!this.a)throw new M("internal-error","The React Native compatibility library was not found.");this.type="asyncStorage";}k=tj.prototype;k.get=function(a){return D(this.a.getItem(a)).then(function(b){return b&&Me(b)})};k.set=function(a,b){return D(this.a.setItem(a,Ke(b)))};k.P=function(a){return D(this.a.removeItem(a))};k.Y=function(){};k.ca=function(){};function uj(a){this.b=a;this.a={};this.c=t(this.f,this);}var vj=[];function wj(){var a=ze()?self:null;x(vj,function(c){c.b==a&&(b=c);});if(!b){var b=new uj(a);vj.push(b);}return b}
uj.prototype.f=function(a){var b=a.data.eventType,c=a.data.eventId,d=this.a[b];if(d&&0<d.length){a.ports[0].postMessage({status:"ack",eventId:c,eventType:b,response:null});var e=[];x(d,function(f){e.push(D().then(function(){return f(a.origin,a.data.data)}));});ac(e).then(function(f){var g=[];x(f,function(h){g.push({fulfilled:h.Eb,value:h.value,reason:h.reason?h.reason.message:void 0});});x(g,function(h){for(var m in h)"undefined"===typeof h[m]&&delete h[m];});a.ports[0].postMessage({status:"done",eventId:c,
eventType:b,response:g});});}};uj.prototype.subscribe=function(a,b){Sa(this.a)&&this.b.addEventListener("message",this.c);"undefined"===typeof this.a[a]&&(this.a[a]=[]);this.a[a].push(b);};uj.prototype.unsubscribe=function(a,b){"undefined"!==typeof this.a[a]&&b?(y(this.a[a],function(c){return c==b}),0==this.a[a].length&&delete this.a[a]):b||delete this.a[a];Sa(this.a)&&this.b.removeEventListener("message",this.c);};function xj(a){this.a=a;}xj.prototype.postMessage=function(a,b){this.a.postMessage(a,b);};function yj(a){this.c=a;this.b=!1;this.a=[];}
function zj(a,b,c,d){var e,f=c||{},g,h,m,p=null;if(a.b)return E(Error("connection_unavailable"));var v=d?800:50,z="undefined"!==typeof MessageChannel?new MessageChannel:null;return (new C(function(H,V){z?(e=Math.floor(Math.random()*Math.pow(10,20)).toString(),z.port1.start(),h=setTimeout(function(){V(Error("unsupported_event"));},v),g=function(ua){ua.data.eventId===e&&("ack"===ua.data.status?(clearTimeout(h),m=setTimeout(function(){V(Error("timeout"));},3E3)):"done"===ua.data.status?(clearTimeout(m),
"undefined"!==typeof ua.data.response?H(ua.data.response):V(Error("unknown_error"))):(clearTimeout(h),clearTimeout(m),V(Error("invalid_response"))));},p={messageChannel:z,onMessage:g},a.a.push(p),z.port1.addEventListener("message",g),a.c.postMessage({eventType:b,eventId:e,data:f},[z.port2])):V(Error("connection_unavailable"));})).then(function(H){Aj(a,p);return H}).s(function(H){Aj(a,p);throw H;})}
function Aj(a,b){if(b){var c=b.messageChannel,d=b.onMessage;c&&(c.port1.removeEventListener("message",d),c.port1.close());y(a.a,function(e){return e==b});}}yj.prototype.close=function(){for(;0<this.a.length;)Aj(this,this.a[0]);this.b=!0;};function Bj(){if(!Cj())throw new M("web-storage-unsupported");this.c={};this.a=[];this.b=0;this.l=l.indexedDB;this.type="indexedDB";this.g=this.m=this.f=this.i=null;this.u=!1;this.h=null;var a=this;ze()&&self?(this.m=wj(),this.m.subscribe("keyChanged",function(b,c){return Dj(a).then(function(d){0<d.length&&x(a.a,function(e){e(d);});return {keyProcessed:Na(d,c.key)}})}),this.m.subscribe("ping",function(){return D(["keyChanged"])})):Ve().then(function(b){if(a.h=b)a.g=new yj(new xj(b)),zj(a.g,"ping",null,
!0).then(function(c){c[0].fulfilled&&Na(c[0].value,"keyChanged")&&(a.u=!0);}).s(function(){});});}var Ej;function Fj(a){return new C(function(b,c){var d=a.l.deleteDatabase("firebaseLocalStorageDb");d.onsuccess=function(){b();};d.onerror=function(e){c(Error(e.target.error));};})}
function Gj(a){return new C(function(b,c){var d=a.l.open("firebaseLocalStorageDb",1);d.onerror=function(e){try{e.preventDefault();}catch(f){}c(Error(e.target.error));};d.onupgradeneeded=function(e){e=e.target.result;try{e.createObjectStore("firebaseLocalStorage",{keyPath:"fbase_key"});}catch(f){c(f);}};d.onsuccess=function(e){e=e.target.result;e.objectStoreNames.contains("firebaseLocalStorage")?b(e):Fj(a).then(function(){return Gj(a)}).then(function(f){b(f);}).s(function(f){c(f);});};})}
function Hj(a){a.o||(a.o=Gj(a));return a.o}function Cj(){try{return !!l.indexedDB}catch(a){return !1}}function Ij(a){return a.objectStore("firebaseLocalStorage")}function Jj(a,b){return a.transaction(["firebaseLocalStorage"],b?"readwrite":"readonly")}function Kj(a){return new C(function(b,c){a.onsuccess=function(d){d&&d.target?b(d.target.result):b();};a.onerror=function(d){c(d.target.error);};})}k=Bj.prototype;
k.set=function(a,b){var c=!1,d,e=this;return Hj(this).then(function(f){d=f;f=Ij(Jj(d,!0));return Kj(f.get(a))}).then(function(f){var g=Ij(Jj(d,!0));if(f)return f.value=b,Kj(g.put(f));e.b++;c=!0;f={};f.fbase_key=a;f.value=b;return Kj(g.add(f))}).then(function(){e.c[a]=b;return Lj(e,a)}).ia(function(){c&&e.b--;})};function Lj(a,b){return a.g&&a.h&&Ue()===a.h?zj(a.g,"keyChanged",{key:b},a.u).then(function(){}).s(function(){}):D()}
k.get=function(a){return Hj(this).then(function(b){return Kj(Ij(Jj(b,!1)).get(a))}).then(function(b){return b&&b.value})};k.P=function(a){var b=!1,c=this;return Hj(this).then(function(d){b=!0;c.b++;return Kj(Ij(Jj(d,!0))["delete"](a))}).then(function(){delete c.c[a];return Lj(c,a)}).ia(function(){b&&c.b--;})};
function Dj(a){return Hj(a).then(function(b){var c=Ij(Jj(b,!1));return c.getAll?Kj(c.getAll()):new C(function(d,e){var f=[],g=c.openCursor();g.onsuccess=function(h){(h=h.target.result)?(f.push(h.value),h["continue"]()):d(f);};g.onerror=function(h){e(h.target.error);};})}).then(function(b){var c={},d=[];if(0==a.b){for(d=0;d<b.length;d++)c[b[d].fbase_key]=b[d].value;d=je(a.c,c);a.c=c;}return d})}k.Y=function(a){0==this.a.length&&Mj(this);this.a.push(a);};
k.ca=function(a){y(this.a,function(b){return b==a});0==this.a.length&&Nj(this);};function Mj(a){function b(){a.f=setTimeout(function(){a.i=Dj(a).then(function(c){0<c.length&&x(a.a,function(d){d(c);});}).then(function(){b();}).s(function(c){"STOP_EVENT"!=c.message&&b();});},800);}Nj(a);b();}function Nj(a){a.i&&a.i.cancel("STOP_EVENT");a.f&&(clearTimeout(a.f),a.f=null);}function Oj(a){var b=this,c=null;this.a=[];this.type="indexedDB";this.c=a;this.b=D().then(function(){if(Cj()){var d=Ge(),e="__sak"+d;Ej||(Ej=new Bj);c=Ej;return c.set(e,d).then(function(){return c.get(e)}).then(function(f){if(f!==d)throw Error("indexedDB not supported!");return c.P(e)}).then(function(){return c}).s(function(){return b.c})}return b.c}).then(function(d){b.type=d.type;d.Y(function(e){x(b.a,function(f){f(e);});});return d});}k=Oj.prototype;k.get=function(a){return this.b.then(function(b){return b.get(a)})};
k.set=function(a,b){return this.b.then(function(c){return c.set(a,b)})};k.P=function(a){return this.b.then(function(b){return b.P(a)})};k.Y=function(a){this.a.push(a);};k.ca=function(a){y(this.a,function(b){return b==a});};function Pj(){this.a={};this.type="inMemory";}k=Pj.prototype;k.get=function(a){return D(this.a[a])};k.set=function(a,b){this.a[a]=b;return D()};k.P=function(a){delete this.a[a];return D()};k.Y=function(){};k.ca=function(){};function Qj(){if(!Rj()){if("Node"==Ae())throw new M("internal-error","The LocalStorage compatibility library was not found.");throw new M("web-storage-unsupported");}this.a=Sj()||firebase.INTERNAL.node.localStorage;this.type="localStorage";}function Sj(){try{var a=l.localStorage,b=Ge();a&&(a.setItem(b,"1"),a.removeItem(b));return a}catch(c){return null}}
function Rj(){var a="Node"==Ae();a=Sj()||a&&firebase.INTERNAL.node&&firebase.INTERNAL.node.localStorage;if(!a)return !1;try{return a.setItem("__sak","1"),a.removeItem("__sak"),!0}catch(b){return !1}}k=Qj.prototype;k.get=function(a){var b=this;return D().then(function(){var c=b.a.getItem(a);return Me(c)})};k.set=function(a,b){var c=this;return D().then(function(){var d=Ke(b);null===d?c.P(a):c.a.setItem(a,d);})};k.P=function(a){var b=this;return D().then(function(){b.a.removeItem(a);})};
k.Y=function(a){l.window&&Wc(l.window,"storage",a);};k.ca=function(a){l.window&&fd(l.window,"storage",a);};function Tj(){this.type="nullStorage";}k=Tj.prototype;k.get=function(){return D(null)};k.set=function(){return D()};k.P=function(){return D()};k.Y=function(){};k.ca=function(){};function Uj(){if(!Vj()){if("Node"==Ae())throw new M("internal-error","The SessionStorage compatibility library was not found.");throw new M("web-storage-unsupported");}this.a=Wj()||firebase.INTERNAL.node.sessionStorage;this.type="sessionStorage";}function Wj(){try{var a=l.sessionStorage,b=Ge();a&&(a.setItem(b,"1"),a.removeItem(b));return a}catch(c){return null}}
function Vj(){var a="Node"==Ae();a=Wj()||a&&firebase.INTERNAL.node&&firebase.INTERNAL.node.sessionStorage;if(!a)return !1;try{return a.setItem("__sak","1"),a.removeItem("__sak"),!0}catch(b){return !1}}k=Uj.prototype;k.get=function(a){var b=this;return D().then(function(){var c=b.a.getItem(a);return Me(c)})};k.set=function(a,b){var c=this;return D().then(function(){var d=Ke(b);null===d?c.P(a):c.a.setItem(a,d);})};k.P=function(a){var b=this;return D().then(function(){b.a.removeItem(a);})};k.Y=function(){};
k.ca=function(){};function Xj(){var a={};a.Browser=Yj;a.Node=Zj;a.ReactNative=ak;a.Worker=bk;this.a=a[Ae()];}var ck,Yj={B:Qj,Sa:Uj},Zj={B:Qj,Sa:Uj},ak={B:tj,Sa:Tj},bk={B:Qj,Sa:Tj};var dk={Xc:"local",NONE:"none",Zc:"session"};function ek(a){var b=new M("invalid-persistence-type"),c=new M("unsupported-persistence-type");a:{for(d in dk)if(dk[d]==a){var d=!0;break a}d=!1;}if(!d||"string"!==typeof a)throw b;switch(Ae()){case "ReactNative":if("session"===a)throw c;break;case "Node":if("none"!==a)throw c;break;default:if(!Fe()&&"none"!==a)throw c;}}
function fk(){var a=!Ne(I())&&ye()?!0:!1,b=Je(),c=Fe();this.o=a;this.h=b;this.m=c;this.a={};ck||(ck=new Xj);a=ck;try{this.g=!ge()&&Te()||!l.indexedDB?new a.a.B:new Oj(ze()?new Pj:new a.a.B);}catch(d){this.g=new Pj,this.h=!0;}try{this.i=new a.a.Sa;}catch(d){this.i=new Pj;}this.l=new Pj;this.f=t(this.Nb,this);this.b={};}var gk;function hk(){gk||(gk=new fk);return gk}function ik(a,b){switch(b){case "session":return a.i;case "none":return a.l;default:return a.g}}
function jk(a,b){return "firebase:"+a.name+(b?":"+b:"")}function kk(a,b,c){var d=jk(b,c),e=ik(a,b.B);return a.get(b,c).then(function(f){var g=null;try{g=Me(l.localStorage.getItem(d));}catch(h){}if(g&&!f)return l.localStorage.removeItem(d),a.set(b,g,c);g&&f&&"localStorage"!=e.type&&l.localStorage.removeItem(d);})}k=fk.prototype;k.get=function(a,b){return ik(this,a.B).get(jk(a,b))};function lk(a,b,c){c=jk(b,c);"local"==b.B&&(a.b[c]=null);return ik(a,b.B).P(c)}
k.set=function(a,b,c){var d=jk(a,c),e=this,f=ik(this,a.B);return f.set(d,b).then(function(){return f.get(d)}).then(function(g){"local"==a.B&&(e.b[d]=g);})};k.addListener=function(a,b,c){a=jk(a,b);this.m&&(this.b[a]=l.localStorage.getItem(a));Sa(this.a)&&(ik(this,"local").Y(this.f),this.h||(ge()||!Te())&&l.indexedDB||!this.m||mk(this));this.a[a]||(this.a[a]=[]);this.a[a].push(c);};
k.removeListener=function(a,b,c){a=jk(a,b);this.a[a]&&(y(this.a[a],function(d){return d==c}),0==this.a[a].length&&delete this.a[a]);Sa(this.a)&&(ik(this,"local").ca(this.f),nk(this));};function mk(a){nk(a);a.c=setInterval(function(){for(var b in a.a){var c=l.localStorage.getItem(b),d=a.b[b];c!=d&&(a.b[b]=c,c=new Kc({type:"storage",key:b,target:window,oldValue:d,newValue:c,a:!0}),a.Nb(c));}},1E3);}function nk(a){a.c&&(clearInterval(a.c),a.c=null);}
k.Nb=function(a){if(a&&a.f){var b=a.a.key;if(null==b)for(var c in this.a){var d=this.b[c];"undefined"===typeof d&&(d=null);var e=l.localStorage.getItem(c);e!==d&&(this.b[c]=e,this.Ya(c));}else if(0==b.indexOf("firebase:")&&this.a[b]){"undefined"!==typeof a.a.a?ik(this,"local").ca(this.f):nk(this);if(this.o)if(c=l.localStorage.getItem(b),d=a.a.newValue,d!==c)null!==d?l.localStorage.setItem(b,d):l.localStorage.removeItem(b);else if(this.b[b]===d&&"undefined"===typeof a.a.a)return;var f=this;c=function(){if("undefined"!==
typeof a.a.a||f.b[b]!==l.localStorage.getItem(b))f.b[b]=l.localStorage.getItem(b),f.Ya(b);};tc&&Ec&&10==Ec&&l.localStorage.getItem(b)!==a.a.newValue&&a.a.newValue!==a.a.oldValue?setTimeout(c,10):c();}}else x(a,t(this.Ya,this));};k.Ya=function(a){this.a[a]&&x(this.a[a],function(b){b();});};function ok(a){this.a=a;this.b=hk();}var pk={name:"authEvent",B:"local"};function qk(a){return a.b.get(pk,a.a).then(function(b){return Rg(b)})}function rk(){this.a=hk();}function sk(){this.b=-1;}function tk(a,b){this.b=uk;this.f=l.Uint8Array?new Uint8Array(this.b):Array(this.b);this.g=this.c=0;this.a=[];this.i=a;this.h=b;this.m=l.Int32Array?new Int32Array(64):Array(64);void 0!==vk||(l.Int32Array?vk=new Int32Array(wk):vk=wk);this.reset();}var vk;u(tk,sk);for(var uk=64,xk=uk-1,yk=[],zk=0;zk<xk;zk++)yk[zk]=0;var Ak=Pa(128,yk);tk.prototype.reset=function(){this.g=this.c=0;this.a=l.Int32Array?new Int32Array(this.h):Qa(this.h);};
function Bk(a){for(var b=a.f,c=a.m,d=0,e=0;e<b.length;)c[d++]=b[e]<<24|b[e+1]<<16|b[e+2]<<8|b[e+3],e=4*d;for(b=16;64>b;b++){e=c[b-15]|0;d=c[b-2]|0;var f=(c[b-16]|0)+((e>>>7|e<<25)^(e>>>18|e<<14)^e>>>3)|0,g=(c[b-7]|0)+((d>>>17|d<<15)^(d>>>19|d<<13)^d>>>10)|0;c[b]=f+g|0;}d=a.a[0]|0;e=a.a[1]|0;var h=a.a[2]|0,m=a.a[3]|0,p=a.a[4]|0,v=a.a[5]|0,z=a.a[6]|0;f=a.a[7]|0;for(b=0;64>b;b++){var H=((d>>>2|d<<30)^(d>>>13|d<<19)^(d>>>22|d<<10))+(d&e^d&h^e&h)|0;g=p&v^~p&z;f=f+((p>>>6|p<<26)^(p>>>11|p<<21)^(p>>>25|p<<
7))|0;g=g+(vk[b]|0)|0;g=f+(g+(c[b]|0)|0)|0;f=z;z=v;v=p;p=m+g|0;m=h;h=e;e=d;d=g+H|0;}a.a[0]=a.a[0]+d|0;a.a[1]=a.a[1]+e|0;a.a[2]=a.a[2]+h|0;a.a[3]=a.a[3]+m|0;a.a[4]=a.a[4]+p|0;a.a[5]=a.a[5]+v|0;a.a[6]=a.a[6]+z|0;a.a[7]=a.a[7]+f|0;}
function Ck(a,b,c){void 0===c&&(c=b.length);var d=0,e=a.c;if(n(b))for(;d<c;)a.f[e++]=b.charCodeAt(d++),e==a.b&&(Bk(a),e=0);else if(oa(b))for(;d<c;){var f=b[d++];if(!("number"==typeof f&&0<=f&&255>=f&&f==(f|0)))throw Error("message must be a byte array");a.f[e++]=f;e==a.b&&(Bk(a),e=0);}else throw Error("message must be string or array");a.c=e;a.g+=c;}
var wk=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,
4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];function Dk(){tk.call(this,8,Ek);}u(Dk,tk);var Ek=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225];function Fk(a,b,c,d,e){this.l=a;this.i=b;this.m=c;this.o=d||null;this.u=e||null;this.h=b+":"+c;this.v=new rk;this.g=new ok(this.h);this.f=null;this.b=[];this.a=this.c=null;}function Gk(a){return new M("invalid-cordova-configuration",a)}k=Fk.prototype;
k.ga=function(){return this.za?this.za:this.za=ve().then(function(){if("function"!==typeof J("universalLinks.subscribe",l))throw Gk("cordova-universal-links-plugin-fix is not installed");if("undefined"===typeof J("BuildInfo.packageName",l))throw Gk("cordova-plugin-buildinfo is not installed");if("function"!==typeof J("cordova.plugins.browsertab.openUrl",l))throw Gk("cordova-plugin-browsertab is not installed");if("function"!==typeof J("cordova.InAppBrowser.open",l))throw Gk("cordova-plugin-inappbrowser is not installed");
},function(){throw new M("cordova-not-ready");})};function Hk(){for(var a=20,b=[];0<a;)b.push("1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(62*Math.random()))),a--;return b.join("")}function Ik(a){var b=new Dk;Ck(b,a);a=[];var c=8*b.g;56>b.c?Ck(b,Ak,56-b.c):Ck(b,Ak,b.b-(b.c-56));for(var d=63;56<=d;d--)b.f[d]=c&255,c/=256;Bk(b);for(d=c=0;d<b.i;d++)for(var e=24;0<=e;e-=8)a[c++]=b.a[d]>>e&255;return Bf(a)}
k.Ea=function(a,b){b(new M("operation-not-supported-in-this-environment"));return D()};k.Db=function(){return E(new M("operation-not-supported-in-this-environment"))};k.Ob=function(){return !1};k.Mb=function(){return !0};k.Hb=function(){return !0};
k.Ca=function(a,b,c){if(this.c)return E(new M("redirect-operation-pending"));var d=this,e=l.document,f=null,g=null,h=null,m=null;return this.c=D().then(function(){Pg(b);return Jk(d)}).then(function(){return Kk(d,a,b,c)}).then(function(){return (new C(function(p,v){g=function(){var z=J("cordova.plugins.browsertab.close",l);p();"function"===typeof z&&z();d.a&&"function"===typeof d.a.close&&(d.a.close(),d.a=null);return !1};d.wa(g);h=function(){f||(f=nd(2E3).then(function(){v(new M("redirect-cancelled-by-user"));}));};
m=function(){Qe()&&h();};e.addEventListener("resume",h,!1);I().toLowerCase().match(/android/)||e.addEventListener("visibilitychange",m,!1);})).s(function(p){return Lk(d).then(function(){throw p;})})}).ia(function(){h&&e.removeEventListener("resume",h,!1);m&&e.removeEventListener("visibilitychange",m,!1);f&&f.cancel();g&&d.La(g);d.c=null;})};
function Kk(a,b,c,d){var e=Hk(),f=new Qg(b,d,null,e,new M("no-auth-event")),g=J("BuildInfo.packageName",l);if("string"!==typeof g)throw new M("invalid-cordova-configuration");var h=J("BuildInfo.displayName",l),m={};if(I().toLowerCase().match(/iphone|ipad|ipod/))m.ibi=g;else if(I().toLowerCase().match(/android/))m.apn=g;else return E(new M("operation-not-supported-in-this-environment"));h&&(m.appDisplayName=h);e=Ik(e);m.sessionId=e;var p=sj(a.l,a.i,a.m,b,c,null,d,a.o,m,a.u);return a.ga().then(function(){var v=
a.h;return a.v.a.set(pk,f.w(),v)}).then(function(){var v=J("cordova.plugins.browsertab.isAvailable",l);if("function"!==typeof v)throw new M("invalid-cordova-configuration");var z=null;v(function(H){if(H){z=J("cordova.plugins.browsertab.openUrl",l);if("function"!==typeof z)throw new M("invalid-cordova-configuration");z(p);}else{z=J("cordova.InAppBrowser.open",l);if("function"!==typeof z)throw new M("invalid-cordova-configuration");H=I();a.a=z(p,H.match(/(iPad|iPhone|iPod).*OS 7_\d/i)||H.match(/(iPad|iPhone|iPod).*OS 8_\d/i)?
"_blank":"_system","location=yes");}});})}function Mk(a,b){for(var c=0;c<a.b.length;c++)try{a.b[c](b);}catch(d){}}function Jk(a){a.f||(a.f=a.ga().then(function(){return new C(function(b){function c(d){b(d);a.La(c);return !1}a.wa(c);Nk(a);})}));return a.f}function Lk(a){var b=null;return qk(a.g).then(function(c){b=c;c=a.g;return lk(c.b,pk,c.a)}).then(function(){return b})}
function Nk(a){function b(g){d=!0;e&&e.cancel();Lk(a).then(function(h){var m=c;if(h&&g&&g.url){var p=null;m=ag(g.url);-1!=m.indexOf("/__/auth/callback")&&(p=Ld(m),p=Me(Kd(p,"firebaseError")||null),p=(p="object"===typeof p?pf(p):null)?new Qg(h.c,h.b,null,null,p):new Qg(h.c,h.b,m,h.f));m=p||c;}Mk(a,m);});}var c=new Qg("unknown",null,null,null,new M("no-auth-event")),d=!1,e=nd(500).then(function(){return Lk(a).then(function(){d||Mk(a,c);})}),f=l.handleOpenURL;l.handleOpenURL=function(g){0==g.toLowerCase().indexOf(J("BuildInfo.packageName",
l).toLowerCase()+"://")&&b({url:g});if("function"===typeof f)try{f(g);}catch(h){console.error(h);}};Tg||(Tg=new Sg);Tg.subscribe(b);}k.wa=function(a){this.b.push(a);Jk(this).s(function(b){"auth/invalid-cordova-configuration"===b.code&&(b=new Qg("unknown",null,null,null,new M("no-auth-event")),a(b));});};k.La=function(a){y(this.b,function(b){return b==a});};function Ok(a){this.a=a;this.b=hk();}var Pk={name:"pendingRedirect",B:"session"};function Qk(a){return a.b.set(Pk,"pending",a.a)}function Rk(a){return lk(a.b,Pk,a.a)}function Sk(a){return a.b.get(Pk,a.a).then(function(b){return "pending"==b})}function Tk(a,b,c){this.i={};this.u=0;this.A=a;this.l=b;this.o=c;this.h=[];this.f=!1;this.m=t(this.cb,this);this.b=new Uk;this.v=new Vk;this.g=new Ok(this.l+":"+this.o);this.c={};this.c.unknown=this.b;this.c.signInViaRedirect=this.b;this.c.linkViaRedirect=this.b;this.c.reauthViaRedirect=this.b;this.c.signInViaPopup=this.v;this.c.linkViaPopup=this.v;this.c.reauthViaPopup=this.v;this.a=Wk(this.A,this.l,this.o,Mf);}
function Wk(a,b,c,d){var e=firebase.SDK_VERSION||null;return we()?new Fk(a,b,c,e,d):new mj(a,b,c,e,d)}k=Tk.prototype;k.reset=function(){this.f=!1;this.a.La(this.m);this.a=Wk(this.A,this.l,this.o);this.i={};};k.Za=function(){this.b.Za();};function Xk(a){a.f||(a.f=!0,a.a.wa(a.m));var b=a.a;return a.a.ga().s(function(c){a.a==b&&a.reset();throw c;})}
function Yk(a){a.a.Mb()&&Xk(a).s(function(b){var c=new Qg("unknown",null,null,null,new M("operation-not-supported-in-this-environment"));Zk(b)&&a.cb(c);});a.a.Hb()||$k(a.b);}k.subscribe=function(a){Na(this.h,a)||this.h.push(a);if(!this.f){var b=this;Sk(this.g).then(function(c){c?Rk(b.g).then(function(){Xk(b).s(function(d){var e=new Qg("unknown",null,null,null,new M("operation-not-supported-in-this-environment"));Zk(d)&&b.cb(e);});}):Yk(b);}).s(function(){Yk(b);});}};
k.unsubscribe=function(a){y(this.h,function(b){return b==a});};k.cb=function(a){if(!a)throw new M("invalid-auth-event");6E5<=va()-this.u&&(this.i={},this.u=0);if(a&&a.getUid()&&this.i.hasOwnProperty(a.getUid()))return !1;for(var b=!1,c=0;c<this.h.length;c++){var d=this.h[c];if(d.xb(a.c,a.b)){if(b=this.c[a.c])b.h(a,d),a&&(a.f||a.b)&&(this.i[a.getUid()]=!0,this.u=va());b=!0;break}}$k(this.b);return b};var al=new Pe(2E3,1E4),bl=new Pe(3E4,6E4);Tk.prototype.fa=function(){return this.b.fa()};
function cl(a,b,c,d,e,f){return a.a.Db(b,c,d,function(){a.f||(a.f=!0,a.a.wa(a.m));},function(){a.reset();},e,f)}function Zk(a){return a&&"auth/cordova-not-ready"==a.code?!0:!1}Tk.prototype.Ca=function(a,b,c){var d=this,e;return Qk(this.g).then(function(){return d.a.Ca(a,b,c).s(function(f){if(Zk(f))throw new M("operation-not-supported-in-this-environment");e=f;return Rk(d.g).then(function(){throw e;})}).then(function(){return d.a.Ob()?new C(function(){}):Rk(d.g).then(function(){return d.fa()}).then(function(){}).s(function(){})})})};
Tk.prototype.Ea=function(a,b,c,d){return this.a.Ea(c,function(e){a.ha(b,null,e,d);},al.get())};var dl={};function el(a,b,c){var d=b+":"+c;dl[d]||(dl[d]=new Tk(a,b,c));return dl[d]}function Uk(){this.b=null;this.f=[];this.c=[];this.a=null;this.i=this.g=!1;}Uk.prototype.reset=function(){this.b=null;this.a&&(this.a.cancel(),this.a=null);};
Uk.prototype.h=function(a,b){if(a){this.reset();this.g=!0;var c=a.c,d=a.b,e=a.a&&"auth/web-storage-unsupported"==a.a.code,f=a.a&&"auth/operation-not-supported-in-this-environment"==a.a.code;this.i=!(!e&&!f);"unknown"!=c||e||f?a.a?(fl(this,!0,null,a.a),D()):b.xa(c,d)?gl(this,a,b):E(new M("invalid-auth-event")):(fl(this,!1,null,null),D());}else E(new M("invalid-auth-event"));};function $k(a){a.g||(a.g=!0,fl(a,!1,null,null));}Uk.prototype.Za=function(){this.g&&!this.i&&fl(this,!1,null,null);};
function gl(a,b,c){c=c.xa(b.c,b.b);var d=b.g,e=b.f,f=b.h,g=!!b.c.match(/Redirect$/);c(d,e,f).then(function(h){fl(a,g,h,null);}).s(function(h){fl(a,g,null,h);});}function hl(a,b){a.b=function(){return E(b)};if(a.c.length)for(var c=0;c<a.c.length;c++)a.c[c](b);}function il(a,b){a.b=function(){return D(b)};if(a.f.length)for(var c=0;c<a.f.length;c++)a.f[c](b);}function fl(a,b,c,d){b?d?hl(a,d):il(a,c):il(a,{user:null});a.f=[];a.c=[];}
Uk.prototype.fa=function(){var a=this;return new C(function(b,c){a.b?a.b().then(b,c):(a.f.push(b),a.c.push(c),jl(a));})};function jl(a){var b=new M("timeout");a.a&&a.a.cancel();a.a=nd(bl.get()).then(function(){a.b||(a.g=!0,fl(a,!0,null,b));});}function Vk(){}Vk.prototype.h=function(a,b){if(a){var c=a.c,d=a.b;a.a?(b.ha(a.c,null,a.a,a.b),D()):b.xa(c,d)?kl(a,b):E(new M("invalid-auth-event"));}else E(new M("invalid-auth-event"));};
function kl(a,b){var c=a.b,d=a.c;b.xa(d,c)(a.g,a.f,a.h).then(function(e){b.ha(d,e,null,c);}).s(function(e){b.ha(d,null,e,c);});}function ll(){this.ub=!1;Object.defineProperty(this,"appVerificationDisabled",{get:function(){return this.ub},set:function(a){this.ub=a;},enumerable:!1});}function ml(a,b){this.a=b;K(this,"verificationId",a);}ml.prototype.confirm=function(a){a=Ng(this.verificationId,a);return this.a(a)};function nl(a,b,c,d){return (new Lg(a)).Va(b,c).then(function(e){return new ml(e,d)})}function ol(a){var b=Jf(a);if(!(b&&b.exp&&b.auth_time&&b.iat))throw new M("internal-error","An internal error occurred. The token obtained by Firebase appears to be malformed. Please retry the operation.");L(this,{token:a,expirationTime:Se(1E3*b.exp),authTime:Se(1E3*b.auth_time),issuedAtTime:Se(1E3*b.iat),signInProvider:b.firebase&&b.firebase.sign_in_provider?b.firebase.sign_in_provider:null,claims:b});}function pl(a,b,c){this.h=a;this.i=b;this.g=c;this.c=3E4;this.f=96E4;this.b=null;this.a=this.c;if(this.f<this.c)throw Error("Proactive refresh lower bound greater than upper bound!");}pl.prototype.start=function(){this.a=this.c;ql(this,!0);};function rl(a,b){if(b)return a.a=a.c,a.g();b=a.a;a.a*=2;a.a>a.f&&(a.a=a.f);return b}function ql(a,b){a.stop();a.b=nd(rl(a,b)).then(function(){return Re()}).then(function(){return a.h()}).then(function(){ql(a,!0);}).s(function(c){a.i(c)&&ql(a,!1);});}
pl.prototype.stop=function(){this.b&&(this.b.cancel(),this.b=null);};function sl(a){this.f=a;this.b=this.a=null;this.c=0;}sl.prototype.w=function(){return {apiKey:this.f.b,refreshToken:this.a,accessToken:this.b,expirationTime:this.c}};function tl(a,b){var c=b[dg],d=b.refreshToken;b=ul(b.expiresIn);a.b=c;a.c=b;a.a=d;}function vl(a,b){a.b=b.b;a.a=b.a;a.c=b.c;}function ul(a){return va()+1E3*parseInt(a,10)}
function wl(a,b){return qi(a.f,b).then(function(c){a.b=c.access_token;a.c=ul(c.expires_in);a.a=c.refresh_token;return {accessToken:a.b,expirationTime:a.c,refreshToken:a.a}}).s(function(c){"auth/user-token-expired"==c.code&&(a.a=null);throw c;})}sl.prototype.getToken=function(a){a=!!a;return this.b&&!this.a?E(new M("user-token-expired")):a||!this.b||va()>this.c-3E4?this.a?wl(this,{grant_type:"refresh_token",refresh_token:this.a}):D(null):D({accessToken:this.b,expirationTime:this.c,refreshToken:this.a})};function xl(a,b){this.a=a||null;this.b=b||null;L(this,{lastSignInTime:Se(b||null),creationTime:Se(a||null)});}function yl(a){return new xl(a.a,a.b)}xl.prototype.w=function(){return {lastLoginAt:this.b,createdAt:this.a}};function zl(a,b,c,d,e,f){L(this,{uid:a,displayName:d||null,photoURL:e||null,email:c||null,phoneNumber:f||null,providerId:b});}function Al(a,b){Jc.call(this,a);for(var c in b)this[c]=b[c];}u(Al,Jc);
function P(a,b,c){this.G=[];this.l=a.apiKey;this.o=a.appName;this.u=a.authDomain||null;a=firebase.SDK_VERSION?Ee(firebase.SDK_VERSION):null;this.c=new ei(this.l,Lf(Mf),a);this.h=new sl(this.c);Bl(this,b[dg]);tl(this.h,b);K(this,"refreshToken",this.h.a);Cl(this,c||{});F.call(this);this.I=!1;this.u&&He()&&(this.a=el(this.u,this.l,this.o));this.N=[];this.i=null;this.A=Dl(this);this.V=t(this.Ha,this);var d=this;this.ka=null;this.ta=function(e){d.pa(e.g);};this.X=null;this.O=[];this.sa=function(e){El(d,
e.c);};this.W=null;}u(P,F);P.prototype.pa=function(a){this.ka=a;ki(this.c,a);};P.prototype.ea=function(){return this.ka};function Fl(a,b){a.X&&fd(a.X,"languageCodeChanged",a.ta);(a.X=b)&&Wc(b,"languageCodeChanged",a.ta);}function El(a,b){a.O=b;li(a.c,firebase.SDK_VERSION?Ee(firebase.SDK_VERSION,a.O):null);}P.prototype.ya=function(){return Qa(this.O)};function Gl(a,b){a.W&&fd(a.W,"frameworkChanged",a.sa);(a.W=b)&&Wc(b,"frameworkChanged",a.sa);}P.prototype.Ha=function(){this.A.b&&(this.A.stop(),this.A.start());};
function Hl(a){try{return firebase.app(a.o).auth()}catch(b){throw new M("internal-error","No firebase.auth.Auth instance is available for the Firebase App '"+a.o+"'!");}}function Dl(a){return new pl(function(){return a.F(!0)},function(b){return b&&"auth/network-request-failed"==b.code?!0:!1},function(){var b=a.h.c-va()-3E5;return 0<b?b:0})}function Il(a){a.D||a.A.b||(a.A.start(),fd(a,"tokenChanged",a.V),Wc(a,"tokenChanged",a.V));}function Jl(a){fd(a,"tokenChanged",a.V);a.A.stop();}
function Bl(a,b){a.ra=b;K(a,"_lat",b);}function Kl(a,b){y(a.N,function(c){return c==b});}function Ll(a){for(var b=[],c=0;c<a.N.length;c++)b.push(a.N[c](a));return ac(b).then(function(){return a})}function Ml(a){a.a&&!a.I&&(a.I=!0,a.a.subscribe(a));}
function Cl(a,b){L(a,{uid:b.uid,displayName:b.displayName||null,photoURL:b.photoURL||null,email:b.email||null,emailVerified:b.emailVerified||!1,phoneNumber:b.phoneNumber||null,isAnonymous:b.isAnonymous||!1,metadata:new xl(b.createdAt,b.lastLoginAt),providerData:[]});}K(P.prototype,"providerId","firebase");function Nl(){}function Ol(a){return D().then(function(){if(a.D)throw new M("app-deleted");})}function Pl(a){return Ja(a.providerData,function(b){return b.providerId})}
function Ql(a,b){b&&(Rl(a,b.providerId),a.providerData.push(b));}function Rl(a,b){y(a.providerData,function(c){return c.providerId==b});}function Sl(a,b,c){("uid"!=b||c)&&a.hasOwnProperty(b)&&K(a,b,c);}
function Tl(a,b){a!=b&&(L(a,{uid:b.uid,displayName:b.displayName,photoURL:b.photoURL,email:b.email,emailVerified:b.emailVerified,phoneNumber:b.phoneNumber,isAnonymous:b.isAnonymous,providerData:[]}),b.metadata?K(a,"metadata",yl(b.metadata)):K(a,"metadata",new xl),x(b.providerData,function(c){Ql(a,c);}),vl(a.h,b.h),K(a,"refreshToken",a.h.a));}k=P.prototype;k.reload=function(){var a=this;return Q(this,Ol(this).then(function(){return Ul(a).then(function(){return Ll(a)}).then(Nl)}))};
function Ul(a){return a.F().then(function(b){var c=a.isAnonymous;return Vl(a,b).then(function(){c||Sl(a,"isAnonymous",!1);return b})})}k.ac=function(a){return this.F(a).then(function(b){return new ol(b)})};k.F=function(a){var b=this;return Q(this,Ol(this).then(function(){return b.h.getToken(a)}).then(function(c){if(!c)throw new M("internal-error");c.accessToken!=b.ra&&(Bl(b,c.accessToken),b.dispatchEvent(new Al("tokenChanged")));Sl(b,"refreshToken",c.refreshToken);return c.accessToken}))};
function Wl(a,b){b[dg]&&a.ra!=b[dg]&&(tl(a.h,b),a.dispatchEvent(new Al("tokenChanged")),Bl(a,b[dg]),Sl(a,"refreshToken",a.h.a));}function Vl(a,b){return O(a.c,Yi,{idToken:b}).then(t(a.wc,a))}
k.wc=function(a){a=a.users;if(!a||!a.length)throw new M("internal-error");a=a[0];Cl(this,{uid:a.localId,displayName:a.displayName,photoURL:a.photoUrl,email:a.email,emailVerified:!!a.emailVerified,phoneNumber:a.phoneNumber,lastLoginAt:a.lastLoginAt,createdAt:a.createdAt});for(var b=Xl(a),c=0;c<b.length;c++)Ql(this,b[c]);Sl(this,"isAnonymous",!(this.email&&a.passwordHash)&&!(this.providerData&&this.providerData.length));};
function Xl(a){return (a=a.providerUserInfo)&&a.length?Ja(a,function(b){return new zl(b.rawId,b.providerId,b.email,b.displayName,b.photoUrl,b.phoneNumber)}):[]}k.xc=function(a){Xe("firebase.User.prototype.reauthenticateAndRetrieveDataWithCredential is deprecated. Please use firebase.User.prototype.reauthenticateWithCredential instead.");return this.hb(a)};
k.hb=function(a){var b=this,c=null;return Q(this,a.f(this.c,this.uid).then(function(d){Wl(b,d);c=Yl(b,d,"reauthenticate");b.i=null;return b.reload()}).then(function(){return c}),!0)};function Zl(a,b){return Ul(a).then(function(){if(Na(Pl(a),b))return Ll(a).then(function(){throw new M("provider-already-linked");})})}k.oc=function(a){Xe("firebase.User.prototype.linkAndRetrieveDataWithCredential is deprecated. Please use firebase.User.prototype.linkWithCredential instead.");return this.fb(a)};
k.fb=function(a){var b=this,c=null;return Q(this,Zl(this,a.providerId).then(function(){return b.F()}).then(function(d){return a.b(b.c,d)}).then(function(d){c=Yl(b,d,"link");return $l(b,d)}).then(function(){return c}))};k.pc=function(a,b){var c=this;return Q(this,Zl(this,"phone").then(function(){return nl(Hl(c),a,b,t(c.fb,c))}))};k.yc=function(a,b){var c=this;return Q(this,D().then(function(){return nl(Hl(c),a,b,t(c.hb,c))}),!0)};
function Yl(a,b,c){var d=Og(b);b=Rf(b);return $e({user:a,credential:d,additionalUserInfo:b,operationType:c})}function $l(a,b){Wl(a,b);return a.reload().then(function(){return a})}k.rb=function(a){var b=this;return Q(this,this.F().then(function(c){return b.c.rb(c,a)}).then(function(c){Wl(b,c);return b.reload()}))};k.Pc=function(a){var b=this;return Q(this,this.F().then(function(c){return a.b(b.c,c)}).then(function(c){Wl(b,c);return b.reload()}))};
k.sb=function(a){var b=this;return Q(this,this.F().then(function(c){return b.c.sb(c,a)}).then(function(c){Wl(b,c);return b.reload()}))};
k.tb=function(a){if(void 0===a.displayName&&void 0===a.photoURL)return Ol(this);var b=this;return Q(this,this.F().then(function(c){return b.c.tb(c,{displayName:a.displayName,photoUrl:a.photoURL})}).then(function(c){Wl(b,c);Sl(b,"displayName",c.displayName||null);Sl(b,"photoURL",c.photoUrl||null);x(b.providerData,function(d){"password"===d.providerId&&(K(d,"displayName",b.displayName),K(d,"photoURL",b.photoURL));});return Ll(b)}).then(Nl))};
k.Nc=function(a){var b=this;return Q(this,Ul(this).then(function(c){return Na(Pl(b),a)?Ji(b.c,c,[a]).then(function(d){var e={};x(d.providerUserInfo||[],function(f){e[f.providerId]=!0;});x(Pl(b),function(f){e[f]||Rl(b,f);});e[Lg.PROVIDER_ID]||K(b,"phoneNumber",null);return Ll(b)}):Ll(b).then(function(){throw new M("no-such-provider");})}))};
k.delete=function(){var a=this;return Q(this,this.F().then(function(b){return O(a.c,Xi,{idToken:b})}).then(function(){a.dispatchEvent(new Al("userDeleted"));})).then(function(){for(var b=0;b<a.G.length;b++)a.G[b].cancel("app-deleted");Fl(a,null);Gl(a,null);a.G=[];a.D=!0;Jl(a);K(a,"refreshToken",null);a.a&&a.a.unsubscribe(a);})};
k.xb=function(a,b){return "linkViaPopup"==a&&(this.g||null)==b&&this.f||"reauthViaPopup"==a&&(this.g||null)==b&&this.f||"linkViaRedirect"==a&&(this.aa||null)==b||"reauthViaRedirect"==a&&(this.aa||null)==b?!0:!1};k.ha=function(a,b,c,d){"linkViaPopup"!=a&&"reauthViaPopup"!=a||d!=(this.g||null)||(c&&this.v?this.v(c):b&&!c&&this.f&&this.f(b),this.b&&(this.b.cancel(),this.b=null),delete this.f,delete this.v);};
k.xa=function(a,b){return "linkViaPopup"==a&&b==(this.g||null)?t(this.Bb,this):"reauthViaPopup"==a&&b==(this.g||null)?t(this.Cb,this):"linkViaRedirect"==a&&(this.aa||null)==b?t(this.Bb,this):"reauthViaRedirect"==a&&(this.aa||null)==b?t(this.Cb,this):null};k.qc=function(a){var b=this;return am(this,"linkViaPopup",a,function(){return Zl(b,a.providerId).then(function(){return Ll(b)})},!1)};k.zc=function(a){return am(this,"reauthViaPopup",a,function(){return D()},!0)};
function am(a,b,c,d,e){if(!He())return E(new M("operation-not-supported-in-this-environment"));if(a.i&&!e)return E(a.i);var f=Qf(c.providerId),g=Ge(a.uid+":::"),h=null;(!Je()||ye())&&a.u&&c.isOAuthProvider&&(h=sj(a.u,a.l,a.o,b,c,null,g,firebase.SDK_VERSION||null));var m=pe(h,f&&f.Ba,f&&f.Aa);d=d().then(function(){bm(a);if(!e)return a.F().then(function(){})}).then(function(){return cl(a.a,m,b,c,g,!!h)}).then(function(){return new C(function(p,v){a.ha(b,null,new M("cancelled-popup-request"),a.g||null);
a.f=p;a.v=v;a.g=g;a.b=a.a.Ea(a,b,m,g);})}).then(function(p){m&&oe(m);return p?$e(p):null}).s(function(p){m&&oe(m);throw p;});return Q(a,d,e)}k.rc=function(a){var b=this;return cm(this,"linkViaRedirect",a,function(){return Zl(b,a.providerId)},!1)};k.Ac=function(a){return cm(this,"reauthViaRedirect",a,function(){return D()},!0)};
function cm(a,b,c,d,e){if(!He())return E(new M("operation-not-supported-in-this-environment"));if(a.i&&!e)return E(a.i);var f=null,g=Ge(a.uid+":::");d=d().then(function(){bm(a);if(!e)return a.F().then(function(){})}).then(function(){a.aa=g;return Ll(a)}).then(function(h){a.ba&&(h=a.ba,h=h.b.set(dm,a.w(),h.a));return h}).then(function(){return a.a.Ca(b,c,g)}).s(function(h){f=h;if(a.ba)return em(a.ba);throw f;}).then(function(){if(f)throw f;});return Q(a,d,e)}
function bm(a){if(!a.a||!a.I){if(a.a&&!a.I)throw new M("internal-error");throw new M("auth-domain-config-required");}}k.Bb=function(a,b,c){var d=this;this.b&&(this.b.cancel(),this.b=null);var e=null,f=this.F().then(function(g){return hg(d.c,{requestUri:a,postBody:c,sessionId:b,idToken:g})}).then(function(g){e=Yl(d,g,"link");return $l(d,g)}).then(function(){return e});return Q(this,f)};
k.Cb=function(a,b,c){var d=this;this.b&&(this.b.cancel(),this.b=null);var e=null,f=D().then(function(){return cg(ig(d.c,{requestUri:a,sessionId:b,postBody:c}),d.uid)}).then(function(g){e=Yl(d,g,"reauthenticate");Wl(d,g);d.i=null;return d.reload()}).then(function(){return e});return Q(this,f,!0)};k.kb=function(a){var b=this,c=null;return Q(this,this.F().then(function(d){c=d;return "undefined"===typeof a||Sa(a)?{}:Af(new qf(a))}).then(function(d){return b.c.kb(c,d)}).then(function(d){if(b.email!=d)return b.reload()}).then(function(){}))};
function Q(a,b,c){var d=fm(a,b,c);a.G.push(d);d.ia(function(){Oa(a.G,d);});return d}function fm(a,b,c){return a.i&&!c?(b.cancel(),E(a.i)):b.s(function(d){!d||"auth/user-disabled"!=d.code&&"auth/user-token-expired"!=d.code||(a.i||a.dispatchEvent(new Al("userInvalidated")),a.i=d);throw d;})}k.toJSON=function(){return this.w()};
k.w=function(){var a={uid:this.uid,displayName:this.displayName,photoURL:this.photoURL,email:this.email,emailVerified:this.emailVerified,phoneNumber:this.phoneNumber,isAnonymous:this.isAnonymous,providerData:[],apiKey:this.l,appName:this.o,authDomain:this.u,stsTokenManager:this.h.w(),redirectEventId:this.aa||null};this.metadata&&Va(a,this.metadata.w());x(this.providerData,function(b){a.providerData.push(af(b));});return a};
function gm(a){if(!a.apiKey)return null;var b={apiKey:a.apiKey,authDomain:a.authDomain,appName:a.appName},c={};if(a.stsTokenManager&&a.stsTokenManager.accessToken&&a.stsTokenManager.expirationTime)c[dg]=a.stsTokenManager.accessToken,c.refreshToken=a.stsTokenManager.refreshToken||null,c.expiresIn=(a.stsTokenManager.expirationTime-va())/1E3;else return null;var d=new P(b,c,a);a.providerData&&x(a.providerData,function(e){e&&Ql(d,$e(e));});a.redirectEventId&&(d.aa=a.redirectEventId);return d}
function hm(a,b,c,d){var e=new P(a,b);c&&(e.ba=c);d&&El(e,d);return e.reload().then(function(){return e})}function im(a,b,c,d){b=b||{apiKey:a.l,authDomain:a.u,appName:a.o};var e=a.h,f={};f[dg]=e.b;f.refreshToken=e.a;f.expiresIn=(e.c-va())/1E3;b=new P(b,f);c&&(b.ba=c);d&&El(b,d);Tl(b,a);return b}function jm(a){this.a=a;this.b=hk();}var dm={name:"redirectUser",B:"session"};function em(a){return lk(a.b,dm,a.a)}function km(a,b){return a.b.get(dm,a.a).then(function(c){c&&b&&(c.authDomain=b);return gm(c||{})})}function lm(a){this.a=a;this.b=hk();this.c=null;this.f=mm(this);this.b.addListener(nm("local"),this.a,t(this.g,this));}lm.prototype.g=function(){var a=this,b=nm("local");om(this,function(){return D().then(function(){return a.c&&"local"!=a.c.B?a.b.get(b,a.a):null}).then(function(c){if(c)return pm(a,"local").then(function(){a.c=b;})})});};function pm(a,b){var c=[],d;for(d in dk)dk[d]!==b&&c.push(lk(a.b,nm(dk[d]),a.a));c.push(lk(a.b,qm,a.a));return $b(c)}
function mm(a){var b=nm("local"),c=nm("session"),d=nm("none");return kk(a.b,b,a.a).then(function(){return a.b.get(c,a.a)}).then(function(e){return e?c:a.b.get(d,a.a).then(function(f){return f?d:a.b.get(b,a.a).then(function(g){return g?b:a.b.get(qm,a.a).then(function(h){return h?nm(h):b})})})}).then(function(e){a.c=e;return pm(a,e.B)}).s(function(){a.c||(a.c=b);})}var qm={name:"persistence",B:"session"};function nm(a){return {name:"authUser",B:a}}
lm.prototype.nb=function(a){var b=null,c=this;ek(a);return om(this,function(){return a!=c.c.B?c.b.get(c.c,c.a).then(function(d){b=d;return pm(c,a)}).then(function(){c.c=nm(a);if(b)return c.b.set(c.c,b,c.a)}):D()})};function rm(a){return om(a,function(){return a.b.set(qm,a.c.B,a.a)})}function sm(a,b){return om(a,function(){return a.b.set(a.c,b.w(),a.a)})}function tm(a){return om(a,function(){return lk(a.b,a.c,a.a)})}
function um(a,b){return om(a,function(){return a.b.get(a.c,a.a).then(function(c){c&&b&&(c.authDomain=b);return gm(c||{})})})}function om(a,b){a.f=a.f.then(b,b);return a.f}function vm(a){this.l=!1;K(this,"settings",new ll);K(this,"app",a);if(R(this).options&&R(this).options.apiKey)a=firebase.SDK_VERSION?Ee(firebase.SDK_VERSION):null,this.c=new ei(R(this).options&&R(this).options.apiKey,Lf(Mf),a);else throw new M("invalid-api-key");this.N=[];this.o=[];this.I=[];this.Rb=firebase.INTERNAL.createSubscribe(t(this.kc,this));this.O=void 0;this.Sb=firebase.INTERNAL.createSubscribe(t(this.mc,this));wm(this,null);this.h=new lm(R(this).options.apiKey+":"+R(this).name);this.A=
new jm(R(this).options.apiKey+":"+R(this).name);this.V=S(this,xm(this));this.i=S(this,ym(this));this.X=!1;this.ka=t(this.Kc,this);this.Ha=t(this.Z,this);this.ra=t(this.Zb,this);this.sa=t(this.ic,this);this.ta=t(this.jc,this);zm(this);this.INTERNAL={};this.INTERNAL["delete"]=t(this.delete,this);this.INTERNAL.logFramework=t(this.sc,this);this.u=0;F.call(this);Am(this);this.G=[];}u(vm,F);function Bm(a){Jc.call(this,"languageCodeChanged");this.g=a;}u(Bm,Jc);
function Cm(a){Jc.call(this,"frameworkChanged");this.c=a;}u(Cm,Jc);k=vm.prototype;k.nb=function(a){a=this.h.nb(a);return S(this,a)};k.pa=function(a){this.W===a||this.l||(this.W=a,ki(this.c,this.W),this.dispatchEvent(new Bm(this.ea())));};k.ea=function(){return this.W};k.Qc=function(){var a=l.navigator;this.pa(a?a.languages&&a.languages[0]||a.language||a.userLanguage||null:null);};k.sc=function(a){this.G.push(a);li(this.c,firebase.SDK_VERSION?Ee(firebase.SDK_VERSION,this.G):null);this.dispatchEvent(new Cm(this.G));};
k.ya=function(){return Qa(this.G)};function Am(a){Object.defineProperty(a,"lc",{get:function(){return this.ea()},set:function(b){this.pa(b);},enumerable:!1});a.W=null;}k.toJSON=function(){return {apiKey:R(this).options.apiKey,authDomain:R(this).options.authDomain,appName:R(this).name,currentUser:T(this)&&T(this).w()}};function Dm(a){return a.Qb||E(new M("auth-domain-config-required"))}
function zm(a){var b=R(a).options.authDomain,c=R(a).options.apiKey;b&&He()&&(a.Qb=a.V.then(function(){if(!a.l){a.a=el(b,c,R(a).name);a.a.subscribe(a);T(a)&&Ml(T(a));if(a.D){Ml(a.D);var d=a.D;d.pa(a.ea());Fl(d,a);d=a.D;El(d,a.G);Gl(d,a);a.D=null;}return a.a}}));}k.xb=function(a,b){switch(a){case "unknown":case "signInViaRedirect":return !0;case "signInViaPopup":return this.g==b&&!!this.f;default:return !1}};
k.ha=function(a,b,c,d){"signInViaPopup"==a&&this.g==d&&(c&&this.v?this.v(c):b&&!c&&this.f&&this.f(b),this.b&&(this.b.cancel(),this.b=null),delete this.f,delete this.v);};k.xa=function(a,b){return "signInViaRedirect"==a||"signInViaPopup"==a&&this.g==b&&this.f?t(this.Yb,this):null};
k.Yb=function(a,b,c){var d=this;a={requestUri:a,postBody:c,sessionId:b};this.b&&(this.b.cancel(),this.b=null);var e=null,f=null,g=fg(d.c,a).then(function(h){e=Og(h);f=Rf(h);return h});a=d.V.then(function(){return g}).then(function(h){return Em(d,h)}).then(function(){return $e({user:T(d),credential:e,additionalUserInfo:f,operationType:"signIn"})});return S(this,a)};
k.Ic=function(a){if(!He())return E(new M("operation-not-supported-in-this-environment"));var b=this,c=Qf(a.providerId),d=Ge(),e=null;(!Je()||ye())&&R(this).options.authDomain&&a.isOAuthProvider&&(e=sj(R(this).options.authDomain,R(this).options.apiKey,R(this).name,"signInViaPopup",a,null,d,firebase.SDK_VERSION||null));var f=pe(e,c&&c.Ba,c&&c.Aa);c=Dm(this).then(function(g){return cl(g,f,"signInViaPopup",a,d,!!e)}).then(function(){return new C(function(g,h){b.ha("signInViaPopup",null,new M("cancelled-popup-request"),
b.g);b.f=g;b.v=h;b.g=d;b.b=b.a.Ea(b,"signInViaPopup",f,d);})}).then(function(g){f&&oe(f);return g?$e(g):null}).s(function(g){f&&oe(f);throw g;});return S(this,c)};k.Jc=function(a){if(!He())return E(new M("operation-not-supported-in-this-environment"));var b=this,c=Dm(this).then(function(){return rm(b.h)}).then(function(){return b.a.Ca("signInViaRedirect",a)});return S(this,c)};
k.fa=function(){if(!He())return E(new M("operation-not-supported-in-this-environment"));var a=this,b=Dm(this).then(function(){return a.a.fa()}).then(function(c){return c?$e(c):null});return S(this,b)};
k.Oc=function(a){if(!a)return E(new M("null-user"));var b=this,c={};c.apiKey=R(this).options.apiKey;c.authDomain=R(this).options.authDomain;c.appName=R(this).name;var d=im(a,c,b.A,b.ya());return S(this,this.i.then(function(){if(R(b).options.apiKey!=a.l)return d.reload()}).then(function(){if(T(b)&&a.uid==T(b).uid)return Tl(T(b),a),b.Z(a);wm(b,d);Ml(d);return b.Z(d)}).then(function(){Fm(b);}))};
function Em(a,b){var c={};c.apiKey=R(a).options.apiKey;c.authDomain=R(a).options.authDomain;c.appName=R(a).name;return a.V.then(function(){return hm(c,b,a.A,a.ya())}).then(function(d){if(T(a)&&d.uid==T(a).uid)return Tl(T(a),d),a.Z(d);wm(a,d);Ml(d);return a.Z(d)}).then(function(){Fm(a);})}
function wm(a,b){T(a)&&(Kl(T(a),a.Ha),fd(T(a),"tokenChanged",a.ra),fd(T(a),"userDeleted",a.sa),fd(T(a),"userInvalidated",a.ta),Jl(T(a)));b&&(b.N.push(a.Ha),Wc(b,"tokenChanged",a.ra),Wc(b,"userDeleted",a.sa),Wc(b,"userInvalidated",a.ta),0<a.u&&Il(b));K(a,"currentUser",b);b&&(b.pa(a.ea()),Fl(b,a),El(b,a.G),Gl(b,a));}k.pb=function(){var a=this,b=this.i.then(function(){if(!T(a))return D();wm(a,null);return tm(a.h).then(function(){Fm(a);})});return S(this,b)};
function Gm(a){var b=km(a.A,R(a).options.authDomain).then(function(c){if(a.D=c)c.ba=a.A;return em(a.A)});return S(a,b)}function xm(a){var b=R(a).options.authDomain,c=Gm(a).then(function(){return um(a.h,b)}).then(function(d){return d?(d.ba=a.A,a.D&&(a.D.aa||null)==(d.aa||null)?d:d.reload().then(function(){return sm(a.h,d).then(function(){return d})}).s(function(e){return "auth/network-request-failed"==e.code?d:tm(a.h)})):null}).then(function(d){wm(a,d||null);});return S(a,c)}
function ym(a){return a.V.then(function(){return a.fa()}).s(function(){}).then(function(){if(!a.l)return a.ka()}).s(function(){}).then(function(){if(!a.l){a.X=!0;var b=a.h;b.b.addListener(nm("local"),b.a,a.ka);}})}
k.Kc=function(){var a=this;return um(this.h,R(this).options.authDomain).then(function(b){if(!a.l){var c;if(c=T(a)&&b){c=T(a).uid;var d=b.uid;c=void 0===c||null===c||""===c||void 0===d||null===d||""===d?!1:c==d;}if(c)return Tl(T(a),b),T(a).F();if(T(a)||b)wm(a,b),b&&(Ml(b),b.ba=a.A),a.a&&a.a.subscribe(a),Fm(a);}})};k.Z=function(a){return sm(this.h,a)};k.Zb=function(){Fm(this);this.Z(T(this));};k.ic=function(){this.pb();};k.jc=function(){this.pb();};
function Hm(a,b){var c=null,d=null;return S(a,b.then(function(e){c=Og(e);d=Rf(e);return Em(a,e)}).then(function(){return $e({user:T(a),credential:c,additionalUserInfo:d,operationType:"signIn"})}))}k.kc=function(a){var b=this;this.addAuthTokenListener(function(){a.next(T(b));});};k.mc=function(a){var b=this;Im(this,function(){a.next(T(b));});};k.uc=function(a,b,c){var d=this;this.X&&Promise.resolve().then(function(){q(a)?a(T(d)):q(a.next)&&a.next(T(d));});return this.Rb(a,b,c)};
k.tc=function(a,b,c){var d=this;this.X&&Promise.resolve().then(function(){d.O=d.getUid();q(a)?a(T(d)):q(a.next)&&a.next(T(d));});return this.Sb(a,b,c)};k.$b=function(a){var b=this,c=this.i.then(function(){return T(b)?T(b).F(a).then(function(d){return {accessToken:d}}):null});return S(this,c)};k.Ec=function(a){var b=this;return this.i.then(function(){return Hm(b,O(b.c,$i,{token:a}))}).then(function(c){var d=c.user;Sl(d,"isAnonymous",!1);b.Z(d);return c})};
k.Fc=function(a,b){var c=this;return this.i.then(function(){return Hm(c,O(c.c,Ag,{email:a,password:b}))})};k.Ub=function(a,b){var c=this;return this.i.then(function(){return Hm(c,O(c.c,Wi,{email:a,password:b}))})};k.Ra=function(a){var b=this;return this.i.then(function(){return Hm(b,a.la(b.c))})};k.Dc=function(a){Xe("firebase.auth.Auth.prototype.signInAndRetrieveDataWithCredential is deprecated. Please use firebase.auth.Auth.prototype.signInWithCredential instead.");return this.Ra(a)};
k.ob=function(){var a=this;return this.i.then(function(){var b=T(a);if(b&&b.isAnonymous){var c=$e({providerId:null,isNewUser:!1});return $e({user:b,credential:null,additionalUserInfo:c,operationType:"signIn"})}return Hm(a,a.c.ob()).then(function(d){var e=d.user;Sl(e,"isAnonymous",!0);a.Z(e);return d})})};function R(a){return a.app}function T(a){return a.currentUser}k.getUid=function(){return T(this)&&T(this).uid||null};function Jm(a){return T(a)&&T(a)._lat||null}
function Fm(a){if(a.X){for(var b=0;b<a.o.length;b++)if(a.o[b])a.o[b](Jm(a));if(a.O!==a.getUid()&&a.I.length)for(a.O=a.getUid(),b=0;b<a.I.length;b++)if(a.I[b])a.I[b](Jm(a));}}k.Tb=function(a){this.addAuthTokenListener(a);this.u++;0<this.u&&T(this)&&Il(T(this));};k.Bc=function(a){var b=this;x(this.o,function(c){c==a&&b.u--;});0>this.u&&(this.u=0);0==this.u&&T(this)&&Jl(T(this));this.removeAuthTokenListener(a);};
k.addAuthTokenListener=function(a){var b=this;this.o.push(a);S(this,this.i.then(function(){b.l||Na(b.o,a)&&a(Jm(b));}));};k.removeAuthTokenListener=function(a){y(this.o,function(b){return b==a});};function Im(a,b){a.I.push(b);S(a,a.i.then(function(){!a.l&&Na(a.I,b)&&a.O!==a.getUid()&&(a.O=a.getUid(),b(Jm(a)));}));}
k.delete=function(){this.l=!0;for(var a=0;a<this.N.length;a++)this.N[a].cancel("app-deleted");this.N=[];this.h&&(a=this.h,a.b.removeListener(nm("local"),a.a,this.ka));this.a&&(this.a.unsubscribe(this),this.a.Za());return Promise.resolve()};function S(a,b){a.N.push(b);b.ia(function(){Oa(a.N,b);});return b}k.Xb=function(a){return S(this,vi(this.c,a))};k.nc=function(a){return !!Fg(a)};
k.mb=function(a,b){var c=this;return S(this,D().then(function(){var d=new qf(b);if(!d.c)throw new M("argument-error",yf+" must be true when sending sign in link to email");return Af(d)}).then(function(d){return c.c.mb(a,d)}).then(function(){}))};k.Rc=function(a){return this.Ka(a).then(function(b){return b.data.email})};k.$a=function(a,b){return S(this,this.c.$a(a,b).then(function(){}))};k.Ka=function(a){return S(this,this.c.Ka(a).then(function(b){return new df(b)}))};
k.Xa=function(a){return S(this,this.c.Xa(a).then(function(){}))};k.lb=function(a,b){var c=this;return S(this,D().then(function(){return "undefined"===typeof b||Sa(b)?{}:Af(new qf(b))}).then(function(d){return c.c.lb(a,d)}).then(function(){}))};k.Hc=function(a,b){return S(this,nl(this,a,b,t(this.Ra,this)))};k.Gc=function(a,b){var c=this;return S(this,D().then(function(){var d=Eg(a,b||he());return c.Ra(d)}))};function Km(){}Km.prototype.render=function(){};Km.prototype.reset=function(){};Km.prototype.getResponse=function(){};Km.prototype.execute=function(){};function Lm(){this.a={};this.b=1E12;}var Mm=null;Lm.prototype.render=function(a,b){this.a[this.b.toString()]=new Nm(a,b);return this.b++};Lm.prototype.reset=function(a){var b=Om(this,a);a=Pm(a);b&&a&&(b.delete(),delete this.a[a]);};Lm.prototype.getResponse=function(a){return (a=Om(this,a))?a.getResponse():null};Lm.prototype.execute=function(a){(a=Om(this,a))&&a.execute();};function Om(a,b){return (b=Pm(b))?a.a[b]||null:null}function Pm(a){return (a="undefined"===typeof a?1E12:a)?a.toString():null}
function Nm(a,b){this.g=!1;this.c=b;this.a=this.b=null;this.h="invisible"!==this.c.size;this.f=Vd(a);var c=this;this.i=function(){c.execute();};this.h?this.execute():Wc(this.f,"click",this.i);}Nm.prototype.getResponse=function(){Qm(this);return this.b};
Nm.prototype.execute=function(){Qm(this);var a=this;this.a||(this.a=setTimeout(function(){a.b=Ce();var b=a.c.callback,c=a.c["expired-callback"];if(b)try{b(a.b);}catch(d){}a.a=setTimeout(function(){a.a=null;a.b=null;if(c)try{c();}catch(d){}a.h&&a.execute();},6E4);},500));};Nm.prototype.delete=function(){Qm(this);this.g=!0;clearTimeout(this.a);this.a=null;fd(this.f,"click",this.i);};function Qm(a){if(a.g)throw Error("reCAPTCHA mock was already deleted!");}function Rm(){}Rm.prototype.g=function(){Mm||(Mm=new Lm);return D(Mm)};Rm.prototype.c=function(){};var Sm=null;function Tm(){this.b=l.grecaptcha?Infinity:0;this.f=null;this.a="__rcb"+Math.floor(1E6*Math.random()).toString();}var Um=new Wa(Xa,"https://www.google.com/recaptcha/api.js?onload=%{onload}&render=explicit&hl=%{hl}"),Vm=new Pe(3E4,6E4);
Tm.prototype.g=function(a){var b=this;return new C(function(c,d){var e=setTimeout(function(){d(new M("network-request-failed"));},Vm.get());if(!l.grecaptcha||a!==b.f&&!b.b){l[b.a]=function(){if(l.grecaptcha){b.f=a;var g=l.grecaptcha.render;l.grecaptcha.render=function(h,m){h=g(h,m);b.b++;return h};clearTimeout(e);c(l.grecaptcha);}else clearTimeout(e),d(new M("internal-error"));delete l[b.a];};var f=db(Um,{onload:b.a,hl:a||""});D(Yh(f)).s(function(){clearTimeout(e);d(new M("internal-error","Unable to load external reCAPTCHA dependencies!"));});}else clearTimeout(e),
c(l.grecaptcha);})};Tm.prototype.c=function(){this.b--;};var Wm=null;function Xm(a,b,c,d,e,f,g){K(this,"type","recaptcha");this.c=this.f=null;this.D=!1;this.l=b;this.g=null;g?(Sm||(Sm=new Rm),g=Sm):(Wm||(Wm=new Tm),g=Wm);this.o=g;this.a=c||{theme:"light",type:"image"};this.h=[];if(this.a[Ym])throw new M("argument-error","sitekey should not be provided for reCAPTCHA as one is automatically provisioned for the current project.");this.i="invisible"===this.a[Zm];if(!l.document)throw new M("operation-not-supported-in-this-environment","RecaptchaVerifier is only supported in a browser HTTP/HTTPS environment with DOM support.");
if(!Vd(b)||!this.i&&Vd(b).hasChildNodes())throw new M("argument-error","reCAPTCHA container is either not found or already contains inner elements!");this.u=new ei(a,f||null,e||null);this.v=d||function(){return null};var h=this;this.m=[];var m=this.a[$m];this.a[$m]=function(v){an(h,v);if("function"===typeof m)m(v);else if("string"===typeof m){var z=J(m,l);"function"===typeof z&&z(v);}};var p=this.a[bn];this.a[bn]=function(){an(h,null);if("function"===typeof p)p();else if("string"===typeof p){var v=
J(p,l);"function"===typeof v&&v();}};}var $m="callback",bn="expired-callback",Ym="sitekey",Zm="size";function an(a,b){for(var c=0;c<a.m.length;c++)try{a.m[c](b);}catch(d){}}function cn(a,b){y(a.m,function(c){return c==b});}function dn(a,b){a.h.push(b);b.ia(function(){Oa(a.h,b);});return b}k=Xm.prototype;
k.za=function(){var a=this;return this.f?this.f:this.f=dn(this,D().then(function(){if(Ie()&&!ze())return ue();throw new M("operation-not-supported-in-this-environment","RecaptchaVerifier is only supported in a browser HTTP/HTTPS environment.");}).then(function(){return a.o.g(a.v())}).then(function(b){a.g=b;return O(a.u,Zi,{})}).then(function(b){a.a[Ym]=b.recaptchaSiteKey;}).s(function(b){a.f=null;throw b;}))};
k.render=function(){en(this);var a=this;return dn(this,this.za().then(function(){if(null===a.c){var b=a.l;if(!a.i){var c=Vd(b);b=Yd("DIV");c.appendChild(b);}a.c=a.g.render(b,a.a);}return a.c}))};k.verify=function(){en(this);var a=this;return dn(this,this.render().then(function(b){return new C(function(c){var d=a.g.getResponse(b);if(d)c(d);else{var e=function(f){f&&(cn(a,e),c(f));};a.m.push(e);a.i&&a.g.execute(a.c);}})}))};k.reset=function(){en(this);null!==this.c&&this.g.reset(this.c);};
function en(a){if(a.D)throw new M("internal-error","RecaptchaVerifier instance has been destroyed.");}k.clear=function(){en(this);this.D=!0;this.o.c();for(var a=0;a<this.h.length;a++)this.h[a].cancel("RecaptchaVerifier instance has been destroyed.");if(!this.i){a=Vd(this.l);for(var b;b=a.firstChild;)a.removeChild(b);}};
function fn(a,b,c){var d=!1;try{this.b=c||firebase.app();}catch(g){throw new M("argument-error","No firebase.app.App instance is currently initialized.");}if(this.b.options&&this.b.options.apiKey)c=this.b.options.apiKey;else throw new M("invalid-api-key");var e=this,f=null;try{f=this.b.auth().ya();}catch(g){}try{d=this.b.auth().settings.appVerificationDisabledForTesting;}catch(g){}f=firebase.SDK_VERSION?Ee(firebase.SDK_VERSION,f):null;Xm.call(this,c,a,b,function(){try{var g=e.b.auth().ea();}catch(h){g=
null;}return g},f,Lf(Mf),d);}u(fn,Xm);function gn(a,b,c,d){a:{c=Array.prototype.slice.call(c);var e=0;for(var f=!1,g=0;g<b.length;g++)if(b[g].optional)f=!0;else{if(f)throw new M("internal-error","Argument validator encountered a required argument after an optional argument.");e++;}f=b.length;if(c.length<e||f<c.length)d="Expected "+(e==f?1==e?"1 argument":e+" arguments":e+"-"+f+" arguments")+" but got "+c.length+".";else{for(e=0;e<c.length;e++)if(f=b[e].optional&&void 0===c[e],!b[e].M(c[e])&&!f){b=b[e];if(0>e||e>=hn.length)throw new M("internal-error",
"Argument validator received an unsupported number of arguments.");c=hn[e];d=(d?"":c+" argument ")+(b.name?'"'+b.name+'" ':"")+"must be "+b.K+".";break a}d=null;}}if(d)throw new M("argument-error",a+" failed: "+d);}var hn="First Second Third Fourth Fifth Sixth Seventh Eighth Ninth".split(" ");function U(a,b){return {name:a||"",K:"a valid string",optional:!!b,M:n}}function jn(a,b){return {name:a||"",K:"a boolean",optional:!!b,M:ha}}
function W(a,b){return {name:a||"",K:"a valid object",optional:!!b,M:r}}function kn(a,b){return {name:a||"",K:"a function",optional:!!b,M:q}}function ln(a,b){return {name:a||"",K:"null",optional:!!b,M:ma}}function mn(){return {name:"",K:"an HTML element",optional:!1,M:function(a){return !!(a&&a instanceof Element)}}}function nn(){return {name:"auth",K:"an instance of Firebase Auth",optional:!0,M:function(a){return !!(a&&a instanceof vm)}}}
function on(){return {name:"app",K:"an instance of Firebase App",optional:!0,M:function(a){return !!(a&&a instanceof firebase.app.App)}}}function pn(a){return {name:a?a+"Credential":"credential",K:a?"a valid "+a+" credential":"a valid credential",optional:!1,M:function(b){if(!b)return !1;var c=!a||b.providerId===a;return !(!b.la||!c)}}}
function qn(){return {name:"authProvider",K:"a valid Auth provider",optional:!1,M:function(a){return !!(a&&a.providerId&&a.hasOwnProperty&&a.hasOwnProperty("isOAuthProvider"))}}}function rn(){return {name:"applicationVerifier",K:"an implementation of firebase.auth.ApplicationVerifier",optional:!1,M:function(a){return !!(a&&n(a.type)&&q(a.verify))}}}function X(a,b,c,d){return {name:c||"",K:a.K+" or "+b.K,optional:!!d,M:function(e){return a.M(e)||b.M(e)}}}function Y(a,b){for(var c in b){var d=b[c].name;a[d]=sn(d,a[c],b[c].j);}}function tn(a,b){for(var c in b){var d=b[c].name;d!==c&&Object.defineProperty(a,d,{get:ta(function(e){return this[e]},c),set:ta(function(e,f,g,h){gn(e,[g],[h],!0);this[f]=h;},d,c,b[c].vb),enumerable:!0});}}function Z(a,b,c,d){a[b]=sn(b,c,d);}
function sn(a,b,c){function d(){var g=Array.prototype.slice.call(arguments);gn(e,c,g);return b.apply(this,g)}if(!c)return b;var e=un(a),f;for(f in b)d[f]=b[f];for(f in b.prototype)d.prototype[f]=b.prototype[f];return d}function un(a){a=a.split(".");return a[a.length-1]}Y(vm.prototype,{Xa:{name:"applyActionCode",j:[U("code")]},Ka:{name:"checkActionCode",j:[U("code")]},$a:{name:"confirmPasswordReset",j:[U("code"),U("newPassword")]},Ub:{name:"createUserWithEmailAndPassword",j:[U("email"),U("password")]},Xb:{name:"fetchSignInMethodsForEmail",j:[U("email")]},fa:{name:"getRedirectResult",j:[]},nc:{name:"isSignInWithEmailLink",j:[U("emailLink")]},tc:{name:"onAuthStateChanged",j:[X(W(),kn(),"nextOrObserver"),kn("opt_error",!0),kn("opt_completed",!0)]},uc:{name:"onIdTokenChanged",
j:[X(W(),kn(),"nextOrObserver"),kn("opt_error",!0),kn("opt_completed",!0)]},lb:{name:"sendPasswordResetEmail",j:[U("email"),X(W("opt_actionCodeSettings",!0),ln(null,!0),"opt_actionCodeSettings",!0)]},mb:{name:"sendSignInLinkToEmail",j:[U("email"),W("actionCodeSettings")]},nb:{name:"setPersistence",j:[U("persistence")]},Dc:{name:"signInAndRetrieveDataWithCredential",j:[pn()]},ob:{name:"signInAnonymously",j:[]},Ra:{name:"signInWithCredential",j:[pn()]},Ec:{name:"signInWithCustomToken",j:[U("token")]},
Fc:{name:"signInWithEmailAndPassword",j:[U("email"),U("password")]},Gc:{name:"signInWithEmailLink",j:[U("email"),U("emailLink",!0)]},Hc:{name:"signInWithPhoneNumber",j:[U("phoneNumber"),rn()]},Ic:{name:"signInWithPopup",j:[qn()]},Jc:{name:"signInWithRedirect",j:[qn()]},Oc:{name:"updateCurrentUser",j:[X(function(a){return {name:"user",K:"an instance of Firebase User",optional:!!a,M:function(b){return !!(b&&b instanceof P)}}}(),ln(),"user")]},pb:{name:"signOut",j:[]},toJSON:{name:"toJSON",j:[U(null,!0)]},
Qc:{name:"useDeviceLanguage",j:[]},Rc:{name:"verifyPasswordResetCode",j:[U("code")]}});tn(vm.prototype,{lc:{name:"languageCode",vb:X(U(),ln(),"languageCode")}});vm.Persistence=dk;vm.Persistence.LOCAL="local";vm.Persistence.SESSION="session";vm.Persistence.NONE="none";
Y(P.prototype,{"delete":{name:"delete",j:[]},ac:{name:"getIdTokenResult",j:[jn("opt_forceRefresh",!0)]},F:{name:"getIdToken",j:[jn("opt_forceRefresh",!0)]},oc:{name:"linkAndRetrieveDataWithCredential",j:[pn()]},fb:{name:"linkWithCredential",j:[pn()]},pc:{name:"linkWithPhoneNumber",j:[U("phoneNumber"),rn()]},qc:{name:"linkWithPopup",j:[qn()]},rc:{name:"linkWithRedirect",j:[qn()]},xc:{name:"reauthenticateAndRetrieveDataWithCredential",j:[pn()]},hb:{name:"reauthenticateWithCredential",j:[pn()]},yc:{name:"reauthenticateWithPhoneNumber",
j:[U("phoneNumber"),rn()]},zc:{name:"reauthenticateWithPopup",j:[qn()]},Ac:{name:"reauthenticateWithRedirect",j:[qn()]},reload:{name:"reload",j:[]},kb:{name:"sendEmailVerification",j:[X(W("opt_actionCodeSettings",!0),ln(null,!0),"opt_actionCodeSettings",!0)]},toJSON:{name:"toJSON",j:[U(null,!0)]},Nc:{name:"unlink",j:[U("provider")]},rb:{name:"updateEmail",j:[U("email")]},sb:{name:"updatePassword",j:[U("password")]},Pc:{name:"updatePhoneNumber",j:[pn("phone")]},tb:{name:"updateProfile",j:[W("profile")]}});
Y(Lm.prototype,{execute:{name:"execute"},render:{name:"render"},reset:{name:"reset"},getResponse:{name:"getResponse"}});Y(Km.prototype,{execute:{name:"execute"},render:{name:"render"},reset:{name:"reset"},getResponse:{name:"getResponse"}});Y(C.prototype,{ia:{name:"finally"},s:{name:"catch"},then:{name:"then"}});tn(ll.prototype,{appVerificationDisabled:{name:"appVerificationDisabledForTesting",vb:jn("appVerificationDisabledForTesting")}});Y(ml.prototype,{confirm:{name:"confirm",j:[U("verificationCode")]}});
Z(bg,"fromJSON",function(a){a=n(a)?JSON.parse(a):a;for(var b,c=[mg,Dg,Kg,jg],d=0;d<c.length;d++)if(b=c[d](a))return b;return null},[X(U(),W(),"json")]);Z(yg,"credential",function(a,b){return new xg(a,b)},[U("email"),U("password")]);Y(xg.prototype,{w:{name:"toJSON",j:[U(null,!0)]}});Y(pg.prototype,{ua:{name:"addScope",j:[U("scope")]},Da:{name:"setCustomParameters",j:[W("customOAuthParameters")]}});Z(pg,"credential",qg,[X(U(),W(),"token")]);Z(yg,"credentialWithLink",Eg,[U("email"),U("emailLink")]);
Y(rg.prototype,{ua:{name:"addScope",j:[U("scope")]},Da:{name:"setCustomParameters",j:[W("customOAuthParameters")]}});Z(rg,"credential",sg,[X(U(),W(),"token")]);Y(tg.prototype,{ua:{name:"addScope",j:[U("scope")]},Da:{name:"setCustomParameters",j:[W("customOAuthParameters")]}});Z(tg,"credential",ug,[X(U(),X(W(),ln()),"idToken"),X(U(),ln(),"accessToken",!0)]);Y(vg.prototype,{Da:{name:"setCustomParameters",j:[W("customOAuthParameters")]}});Z(vg,"credential",wg,[X(U(),W(),"token"),U("secret",!0)]);
Y(N.prototype,{ua:{name:"addScope",j:[U("scope")]},credential:{name:"credential",j:[X(U(),X(W(),ln()),"optionsOrIdToken"),X(U(),ln(),"accessToken",!0)]},Da:{name:"setCustomParameters",j:[W("customOAuthParameters")]}});Y(kg.prototype,{w:{name:"toJSON",j:[U(null,!0)]}});Y(eg.prototype,{w:{name:"toJSON",j:[U(null,!0)]}});Z(Lg,"credential",Ng,[U("verificationId"),U("verificationCode")]);Y(Lg.prototype,{Va:{name:"verifyPhoneNumber",j:[U("phoneNumber"),rn()]}});
Y(Gg.prototype,{w:{name:"toJSON",j:[U(null,!0)]}});Y(M.prototype,{toJSON:{name:"toJSON",j:[U(null,!0)]}});Y(Vg.prototype,{toJSON:{name:"toJSON",j:[U(null,!0)]}});Y(Ug.prototype,{toJSON:{name:"toJSON",j:[U(null,!0)]}});Y(fn.prototype,{clear:{name:"clear",j:[]},render:{name:"render",j:[]},verify:{name:"verify",j:[]}});
(function(){if("undefined"!==typeof firebase&&firebase.INTERNAL&&firebase.INTERNAL.registerService){var a={Auth:vm,AuthCredential:bg,Error:M};Z(a,"EmailAuthProvider",yg,[]);Z(a,"FacebookAuthProvider",pg,[]);Z(a,"GithubAuthProvider",rg,[]);Z(a,"GoogleAuthProvider",tg,[]);Z(a,"TwitterAuthProvider",vg,[]);Z(a,"OAuthProvider",N,[U("providerId")]);Z(a,"SAMLAuthProvider",og,[U("providerId")]);Z(a,"PhoneAuthProvider",Lg,[nn()]);Z(a,"RecaptchaVerifier",fn,[X(U(),mn(),"recaptchaContainer"),W("recaptchaParameters",
!0),on()]);firebase.INTERNAL.registerService("auth",function(b,c){b=new vm(b);c({INTERNAL:{getUid:t(b.getUid,b),getToken:t(b.$b,b),addAuthTokenListener:t(b.Tb,b),removeAuthTokenListener:t(b.Bc,b)}});return b},a,function(b,c){if("create"===b)try{c.auth();}catch(d){}});firebase.INTERNAL.extendNamespace({User:P});}else throw Error("Cannot find the firebase namespace; be sure to include firebase-app.js before this library.");})();}).apply(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {});

// nb. This is for IE10 and lower _only_.
var supportCustomEvent = window.CustomEvent;
if (!supportCustomEvent || typeof supportCustomEvent === 'object') {
  supportCustomEvent = function CustomEvent(event, x) {
    x = x || {};
    var ev = document.createEvent('CustomEvent');
    ev.initCustomEvent(event, !!x.bubbles, !!x.cancelable, x.detail || null);
    return ev;
  };
  supportCustomEvent.prototype = window.Event.prototype;
}

/**
 * @param {Element} el to check for stacking context
 * @return {boolean} whether this el or its parents creates a stacking context
 */
function createsStackingContext(el) {
  while (el && el !== document.body) {
    var s = window.getComputedStyle(el);
    var invalid = function(k, ok) {
      return !(s[k] === undefined || s[k] === ok);
    };
    
    if (s.opacity < 1 ||
        invalid('zIndex', 'auto') ||
        invalid('transform', 'none') ||
        invalid('mixBlendMode', 'normal') ||
        invalid('filter', 'none') ||
        invalid('perspective', 'none') ||
        s['isolation'] === 'isolate' ||
        s.position === 'fixed' ||
        s.webkitOverflowScrolling === 'touch') {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

/**
 * Finds the nearest <dialog> from the passed element.
 *
 * @param {Element} el to search from
 * @return {HTMLDialogElement} dialog found
 */
function findNearestDialog(el) {
  while (el) {
    if (el.localName === 'dialog') {
      return /** @type {HTMLDialogElement} */ (el);
    }
    el = el.parentElement;
  }
  return null;
}

/**
 * Blur the specified element, as long as it's not the HTML body element.
 * This works around an IE9/10 bug - blurring the body causes Windows to
 * blur the whole application.
 *
 * @param {Element} el to blur
 */
function safeBlur(el) {
  if (el && el.blur && el !== document.body) {
    el.blur();
  }
}

/**
 * @param {!NodeList} nodeList to search
 * @param {Node} node to find
 * @return {boolean} whether node is inside nodeList
 */
function inNodeList(nodeList, node) {
  for (var i = 0; i < nodeList.length; ++i) {
    if (nodeList[i] === node) {
      return true;
    }
  }
  return false;
}

/**
 * @param {HTMLFormElement} el to check
 * @return {boolean} whether this form has method="dialog"
 */
function isFormMethodDialog(el) {
  if (!el || !el.hasAttribute('method')) {
    return false;
  }
  return el.getAttribute('method').toLowerCase() === 'dialog';
}

/**
 * @param {!HTMLDialogElement} dialog to upgrade
 * @constructor
 */
function dialogPolyfillInfo(dialog) {
  this.dialog_ = dialog;
  this.replacedStyleTop_ = false;
  this.openAsModal_ = false;

  // Set a11y role. Browsers that support dialog implicitly know this already.
  if (!dialog.hasAttribute('role')) {
    dialog.setAttribute('role', 'dialog');
  }

  dialog.show = this.show.bind(this);
  dialog.showModal = this.showModal.bind(this);
  dialog.close = this.close.bind(this);

  if (!('returnValue' in dialog)) {
    dialog.returnValue = '';
  }

  if ('MutationObserver' in window) {
    var mo = new MutationObserver(this.maybeHideModal.bind(this));
    mo.observe(dialog, {attributes: true, attributeFilter: ['open']});
  } else {
    // IE10 and below support. Note that DOMNodeRemoved etc fire _before_ removal. They also
    // seem to fire even if the element was removed as part of a parent removal. Use the removed
    // events to force downgrade (useful if removed/immediately added).
    var removed = false;
    var cb = function() {
      removed ? this.downgradeModal() : this.maybeHideModal();
      removed = false;
    }.bind(this);
    var timeout;
    var delayModel = function(ev) {
      if (ev.target !== dialog) { return; }  // not for a child element
      var cand = 'DOMNodeRemoved';
      removed |= (ev.type.substr(0, cand.length) === cand);
      window.clearTimeout(timeout);
      timeout = window.setTimeout(cb, 0);
    };
    ['DOMAttrModified', 'DOMNodeRemoved', 'DOMNodeRemovedFromDocument'].forEach(function(name) {
      dialog.addEventListener(name, delayModel);
    });
  }
  // Note that the DOM is observed inside DialogManager while any dialog
  // is being displayed as a modal, to catch modal removal from the DOM.

  Object.defineProperty(dialog, 'open', {
    set: this.setOpen.bind(this),
    get: dialog.hasAttribute.bind(dialog, 'open')
  });

  this.backdrop_ = document.createElement('div');
  this.backdrop_.className = 'backdrop';
  this.backdrop_.addEventListener('click', this.backdropClick_.bind(this));
}

dialogPolyfillInfo.prototype = {

  get dialog() {
    return this.dialog_;
  },

  /**
   * Maybe remove this dialog from the modal top layer. This is called when
   * a modal dialog may no longer be tenable, e.g., when the dialog is no
   * longer open or is no longer part of the DOM.
   */
  maybeHideModal: function() {
    if (this.dialog_.hasAttribute('open') && document.body.contains(this.dialog_)) { return; }
    this.downgradeModal();
  },

  /**
   * Remove this dialog from the modal top layer, leaving it as a non-modal.
   */
  downgradeModal: function() {
    if (!this.openAsModal_) { return; }
    this.openAsModal_ = false;
    this.dialog_.style.zIndex = '';

    // This won't match the native <dialog> exactly because if the user set top on a centered
    // polyfill dialog, that top gets thrown away when the dialog is closed. Not sure it's
    // possible to polyfill this perfectly.
    if (this.replacedStyleTop_) {
      this.dialog_.style.top = '';
      this.replacedStyleTop_ = false;
    }

    // Clear the backdrop and remove from the manager.
    this.backdrop_.parentNode && this.backdrop_.parentNode.removeChild(this.backdrop_);
    dialogPolyfill.dm.removeDialog(this);
  },

  /**
   * @param {boolean} value whether to open or close this dialog
   */
  setOpen: function(value) {
    if (value) {
      this.dialog_.hasAttribute('open') || this.dialog_.setAttribute('open', '');
    } else {
      this.dialog_.removeAttribute('open');
      this.maybeHideModal();  // nb. redundant with MutationObserver
    }
  },

  /**
   * Handles clicks on the fake .backdrop element, redirecting them as if
   * they were on the dialog itself.
   *
   * @param {!Event} e to redirect
   */
  backdropClick_: function(e) {
    if (!this.dialog_.hasAttribute('tabindex')) {
      // Clicking on the backdrop should move the implicit cursor, even if dialog cannot be
      // focused. Create a fake thing to focus on. If the backdrop was _before_ the dialog, this
      // would not be needed - clicks would move the implicit cursor there.
      var fake = document.createElement('div');
      this.dialog_.insertBefore(fake, this.dialog_.firstChild);
      fake.tabIndex = -1;
      fake.focus();
      this.dialog_.removeChild(fake);
    } else {
      this.dialog_.focus();
    }

    var redirectedEvent = document.createEvent('MouseEvents');
    redirectedEvent.initMouseEvent(e.type, e.bubbles, e.cancelable, window,
        e.detail, e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey,
        e.altKey, e.shiftKey, e.metaKey, e.button, e.relatedTarget);
    this.dialog_.dispatchEvent(redirectedEvent);
    e.stopPropagation();
  },

  /**
   * Focuses on the first focusable element within the dialog. This will always blur the current
   * focus, even if nothing within the dialog is found.
   */
  focus_: function() {
    // Find element with `autofocus` attribute, or fall back to the first form/tabindex control.
    var target = this.dialog_.querySelector('[autofocus]:not([disabled])');
    if (!target && this.dialog_.tabIndex >= 0) {
      target = this.dialog_;
    }
    if (!target) {
      // Note that this is 'any focusable area'. This list is probably not exhaustive, but the
      // alternative involves stepping through and trying to focus everything.
      var opts = ['button', 'input', 'keygen', 'select', 'textarea'];
      var query = opts.map(function(el) {
        return el + ':not([disabled])';
      });
      // TODO(samthor): tabindex values that are not numeric are not focusable.
      query.push('[tabindex]:not([disabled]):not([tabindex=""])');  // tabindex != "", not disabled
      target = this.dialog_.querySelector(query.join(', '));
    }
    safeBlur(document.activeElement);
    target && target.focus();
  },

  /**
   * Sets the zIndex for the backdrop and dialog.
   *
   * @param {number} dialogZ
   * @param {number} backdropZ
   */
  updateZIndex: function(dialogZ, backdropZ) {
    if (dialogZ < backdropZ) {
      throw new Error('dialogZ should never be < backdropZ');
    }
    this.dialog_.style.zIndex = dialogZ;
    this.backdrop_.style.zIndex = backdropZ;
  },

  /**
   * Shows the dialog. If the dialog is already open, this does nothing.
   */
  show: function() {
    if (!this.dialog_.open) {
      this.setOpen(true);
      this.focus_();
    }
  },

  /**
   * Show this dialog modally.
   */
  showModal: function() {
    if (this.dialog_.hasAttribute('open')) {
      throw new Error('Failed to execute \'showModal\' on dialog: The element is already open, and therefore cannot be opened modally.');
    }
    if (!document.body.contains(this.dialog_)) {
      throw new Error('Failed to execute \'showModal\' on dialog: The element is not in a Document.');
    }
    if (!dialogPolyfill.dm.pushDialog(this)) {
      throw new Error('Failed to execute \'showModal\' on dialog: There are too many open modal dialogs.');
    }

    if (createsStackingContext(this.dialog_.parentElement)) {
      console.warn('A dialog is being shown inside a stacking context. ' +
          'This may cause it to be unusable. For more information, see this link: ' +
          'https://github.com/GoogleChrome/dialog-polyfill/#stacking-context');
    }

    this.setOpen(true);
    this.openAsModal_ = true;

    // Optionally center vertically, relative to the current viewport.
    if (dialogPolyfill.needsCentering(this.dialog_)) {
      dialogPolyfill.reposition(this.dialog_);
      this.replacedStyleTop_ = true;
    } else {
      this.replacedStyleTop_ = false;
    }

    // Insert backdrop.
    this.dialog_.parentNode.insertBefore(this.backdrop_, this.dialog_.nextSibling);

    // Focus on whatever inside the dialog.
    this.focus_();
  },

  /**
   * Closes this HTMLDialogElement. This is optional vs clearing the open
   * attribute, however this fires a 'close' event.
   *
   * @param {string=} opt_returnValue to use as the returnValue
   */
  close: function(opt_returnValue) {
    if (!this.dialog_.hasAttribute('open')) {
      throw new Error('Failed to execute \'close\' on dialog: The element does not have an \'open\' attribute, and therefore cannot be closed.');
    }
    this.setOpen(false);

    // Leave returnValue untouched in case it was set directly on the element
    if (opt_returnValue !== undefined) {
      this.dialog_.returnValue = opt_returnValue;
    }

    // Triggering "close" event for any attached listeners on the <dialog>.
    var closeEvent = new supportCustomEvent('close', {
      bubbles: false,
      cancelable: false
    });
    this.dialog_.dispatchEvent(closeEvent);
  }

};

var dialogPolyfill = {};

dialogPolyfill.reposition = function(element) {
  var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
  var topValue = scrollTop + (window.innerHeight - element.offsetHeight) / 2;
  element.style.top = Math.max(scrollTop, topValue) + 'px';
};

dialogPolyfill.isInlinePositionSetByStylesheet = function(element) {
  for (var i = 0; i < document.styleSheets.length; ++i) {
    var styleSheet = document.styleSheets[i];
    var cssRules = null;
    // Some browsers throw on cssRules.
    try {
      cssRules = styleSheet.cssRules;
    } catch (e) {}
    if (!cssRules) { continue; }
    for (var j = 0; j < cssRules.length; ++j) {
      var rule = cssRules[j];
      var selectedNodes = null;
      // Ignore errors on invalid selector texts.
      try {
        selectedNodes = document.querySelectorAll(rule.selectorText);
      } catch(e) {}
      if (!selectedNodes || !inNodeList(selectedNodes, element)) {
        continue;
      }
      var cssTop = rule.style.getPropertyValue('top');
      var cssBottom = rule.style.getPropertyValue('bottom');
      if ((cssTop && cssTop !== 'auto') || (cssBottom && cssBottom !== 'auto')) {
        return true;
      }
    }
  }
  return false;
};

dialogPolyfill.needsCentering = function(dialog) {
  var computedStyle = window.getComputedStyle(dialog);
  if (computedStyle.position !== 'absolute') {
    return false;
  }

  // We must determine whether the top/bottom specified value is non-auto.  In
  // WebKit/Blink, checking computedStyle.top == 'auto' is sufficient, but
  // Firefox returns the used value. So we do this crazy thing instead: check
  // the inline style and then go through CSS rules.
  if ((dialog.style.top !== 'auto' && dialog.style.top !== '') ||
      (dialog.style.bottom !== 'auto' && dialog.style.bottom !== '')) {
    return false;
  }
  return !dialogPolyfill.isInlinePositionSetByStylesheet(dialog);
};

/**
 * @param {!Element} element to force upgrade
 */
dialogPolyfill.forceRegisterDialog = function(element) {
  if (window.HTMLDialogElement || element.showModal) {
    console.warn('This browser already supports <dialog>, the polyfill ' +
        'may not work correctly', element);
  }
  if (element.localName !== 'dialog') {
    throw new Error('Failed to register dialog: The element is not a dialog.');
  }
  new dialogPolyfillInfo(/** @type {!HTMLDialogElement} */ (element));
};

/**
 * @param {!Element} element to upgrade, if necessary
 */
dialogPolyfill.registerDialog = function(element) {
  if (!element.showModal) {
    dialogPolyfill.forceRegisterDialog(element);
  }
};

/**
 * @constructor
 */
dialogPolyfill.DialogManager = function() {
  /** @type {!Array<!dialogPolyfillInfo>} */
  this.pendingDialogStack = [];

  var checkDOM = this.checkDOM_.bind(this);

  // The overlay is used to simulate how a modal dialog blocks the document.
  // The blocking dialog is positioned on top of the overlay, and the rest of
  // the dialogs on the pending dialog stack are positioned below it. In the
  // actual implementation, the modal dialog stacking is controlled by the
  // top layer, where z-index has no effect.
  this.overlay = document.createElement('div');
  this.overlay.className = '_dialog_overlay';
  this.overlay.addEventListener('click', function(e) {
    this.forwardTab_ = undefined;
    e.stopPropagation();
    checkDOM([]);  // sanity-check DOM
  }.bind(this));

  this.handleKey_ = this.handleKey_.bind(this);
  this.handleFocus_ = this.handleFocus_.bind(this);

  this.zIndexLow_ = 100000;
  this.zIndexHigh_ = 100000 + 150;

  this.forwardTab_ = undefined;

  if ('MutationObserver' in window) {
    this.mo_ = new MutationObserver(function(records) {
      var removed = [];
      records.forEach(function(rec) {
        for (var i = 0, c; c = rec.removedNodes[i]; ++i) {
          if (!(c instanceof Element)) {
            continue;
          } else if (c.localName === 'dialog') {
            removed.push(c);
          }
          removed = removed.concat(c.querySelectorAll('dialog'));
        }
      });
      removed.length && checkDOM(removed);
    });
  }
};

/**
 * Called on the first modal dialog being shown. Adds the overlay and related
 * handlers.
 */
dialogPolyfill.DialogManager.prototype.blockDocument = function() {
  document.documentElement.addEventListener('focus', this.handleFocus_, true);
  document.addEventListener('keydown', this.handleKey_);
  this.mo_ && this.mo_.observe(document, {childList: true, subtree: true});
};

/**
 * Called on the first modal dialog being removed, i.e., when no more modal
 * dialogs are visible.
 */
dialogPolyfill.DialogManager.prototype.unblockDocument = function() {
  document.documentElement.removeEventListener('focus', this.handleFocus_, true);
  document.removeEventListener('keydown', this.handleKey_);
  this.mo_ && this.mo_.disconnect();
};

/**
 * Updates the stacking of all known dialogs.
 */
dialogPolyfill.DialogManager.prototype.updateStacking = function() {
  var zIndex = this.zIndexHigh_;

  for (var i = 0, dpi; dpi = this.pendingDialogStack[i]; ++i) {
    dpi.updateZIndex(--zIndex, --zIndex);
    if (i === 0) {
      this.overlay.style.zIndex = --zIndex;
    }
  }

  // Make the overlay a sibling of the dialog itself.
  var last = this.pendingDialogStack[0];
  if (last) {
    var p = last.dialog.parentNode || document.body;
    p.appendChild(this.overlay);
  } else if (this.overlay.parentNode) {
    this.overlay.parentNode.removeChild(this.overlay);
  }
};

/**
 * @param {Element} candidate to check if contained or is the top-most modal dialog
 * @return {boolean} whether candidate is contained in top dialog
 */
dialogPolyfill.DialogManager.prototype.containedByTopDialog_ = function(candidate) {
  while (candidate = findNearestDialog(candidate)) {
    for (var i = 0, dpi; dpi = this.pendingDialogStack[i]; ++i) {
      if (dpi.dialog === candidate) {
        return i === 0;  // only valid if top-most
      }
    }
    candidate = candidate.parentElement;
  }
  return false;
};

dialogPolyfill.DialogManager.prototype.handleFocus_ = function(event) {
  if (this.containedByTopDialog_(event.target)) { return; }

  if (document.activeElement === document.documentElement) { return; }

  event.preventDefault();
  event.stopPropagation();
  safeBlur(/** @type {Element} */ (event.target));

  if (this.forwardTab_ === undefined) { return; }  // move focus only from a tab key

  var dpi = this.pendingDialogStack[0];
  var dialog = dpi.dialog;
  var position = dialog.compareDocumentPosition(event.target);
  if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    if (this.forwardTab_) {
      // forward
      dpi.focus_();
    } else if (event.target !== document.documentElement) {
      // backwards if we're not already focused on <html>
      document.documentElement.focus();
    }
  }

  return false;
};

dialogPolyfill.DialogManager.prototype.handleKey_ = function(event) {
  this.forwardTab_ = undefined;
  if (event.keyCode === 27) {
    event.preventDefault();
    event.stopPropagation();
    var cancelEvent = new supportCustomEvent('cancel', {
      bubbles: false,
      cancelable: true
    });
    var dpi = this.pendingDialogStack[0];
    if (dpi && dpi.dialog.dispatchEvent(cancelEvent)) {
      dpi.dialog.close();
    }
  } else if (event.keyCode === 9) {
    this.forwardTab_ = !event.shiftKey;
  }
};

/**
 * Finds and downgrades any known modal dialogs that are no longer displayed. Dialogs that are
 * removed and immediately readded don't stay modal, they become normal.
 *
 * @param {!Array<!HTMLDialogElement>} removed that have definitely been removed
 */
dialogPolyfill.DialogManager.prototype.checkDOM_ = function(removed) {
  // This operates on a clone because it may cause it to change. Each change also calls
  // updateStacking, which only actually needs to happen once. But who removes many modal dialogs
  // at a time?!
  var clone = this.pendingDialogStack.slice();
  clone.forEach(function(dpi) {
    if (removed.indexOf(dpi.dialog) !== -1) {
      dpi.downgradeModal();
    } else {
      dpi.maybeHideModal();
    }
  });
};

/**
 * @param {!dialogPolyfillInfo} dpi
 * @return {boolean} whether the dialog was allowed
 */
dialogPolyfill.DialogManager.prototype.pushDialog = function(dpi) {
  var allowed = (this.zIndexHigh_ - this.zIndexLow_) / 2 - 1;
  if (this.pendingDialogStack.length >= allowed) {
    return false;
  }
  if (this.pendingDialogStack.unshift(dpi) === 1) {
    this.blockDocument();
  }
  this.updateStacking();
  return true;
};

/**
 * @param {!dialogPolyfillInfo} dpi
 */
dialogPolyfill.DialogManager.prototype.removeDialog = function(dpi) {
  var index = this.pendingDialogStack.indexOf(dpi);
  if (index === -1) { return; }

  this.pendingDialogStack.splice(index, 1);
  if (this.pendingDialogStack.length === 0) {
    this.unblockDocument();
  }
  this.updateStacking();
};

dialogPolyfill.dm = new dialogPolyfill.DialogManager();
dialogPolyfill.formSubmitter = null;
dialogPolyfill.useValue = null;

/**
 * Installs global handlers, such as click listers and native method overrides. These are needed
 * even if a no dialog is registered, as they deal with <form method="dialog">.
 */
if (window.HTMLDialogElement === undefined) {

  /**
   * If HTMLFormElement translates method="DIALOG" into 'get', then replace the descriptor with
   * one that returns the correct value.
   */
  var testForm = document.createElement('form');
  testForm.setAttribute('method', 'dialog');
  if (testForm.method !== 'dialog') {
    var methodDescriptor = Object.getOwnPropertyDescriptor(HTMLFormElement.prototype, 'method');
    if (methodDescriptor) {
      // nb. Some older iOS and older PhantomJS fail to return the descriptor. Don't do anything
      // and don't bother to update the element.
      var realGet = methodDescriptor.get;
      methodDescriptor.get = function() {
        if (isFormMethodDialog(this)) {
          return 'dialog';
        }
        return realGet.call(this);
      };
      var realSet = methodDescriptor.set;
      methodDescriptor.set = function(v) {
        if (typeof v === 'string' && v.toLowerCase() === 'dialog') {
          return this.setAttribute('method', v);
        }
        return realSet.call(this, v);
      };
      Object.defineProperty(HTMLFormElement.prototype, 'method', methodDescriptor);
    }
  }

  /**
   * Global 'click' handler, to capture the <input type="submit"> or <button> element which has
   * submitted a <form method="dialog">. Needed as Safari and others don't report this inside
   * document.activeElement.
   */
  document.addEventListener('click', function(ev) {
    dialogPolyfill.formSubmitter = null;
    dialogPolyfill.useValue = null;
    if (ev.defaultPrevented) { return; }  // e.g. a submit which prevents default submission

    var target = /** @type {Element} */ (ev.target);
    if (!target || !isFormMethodDialog(target.form)) { return; }

    var valid = (target.type === 'submit' && ['button', 'input'].indexOf(target.localName) > -1);
    if (!valid) {
      if (!(target.localName === 'input' && target.type === 'image')) { return; }
      // this is a <input type="image">, which can submit forms
      dialogPolyfill.useValue = ev.offsetX + ',' + ev.offsetY;
    }

    var dialog = findNearestDialog(target);
    if (!dialog) { return; }

    dialogPolyfill.formSubmitter = target;

  }, false);

  /**
   * Replace the native HTMLFormElement.submit() method, as it won't fire the
   * submit event and give us a chance to respond.
   */
  var nativeFormSubmit = HTMLFormElement.prototype.submit;
  var replacementFormSubmit = function () {
    if (!isFormMethodDialog(this)) {
      return nativeFormSubmit.call(this);
    }
    var dialog = findNearestDialog(this);
    dialog && dialog.close();
  };
  HTMLFormElement.prototype.submit = replacementFormSubmit;

  /**
   * Global form 'dialog' method handler. Closes a dialog correctly on submit
   * and possibly sets its return value.
   */
  document.addEventListener('submit', function(ev) {
    var form = /** @type {HTMLFormElement} */ (ev.target);
    if (!isFormMethodDialog(form)) { return; }
    ev.preventDefault();

    var dialog = findNearestDialog(form);
    if (!dialog) { return; }

    // Forms can only be submitted via .submit() or a click (?), but anyway: sanity-check that
    // the submitter is correct before using its value as .returnValue.
    var s = dialogPolyfill.formSubmitter;
    if (s && s.form === form) {
      dialog.close(dialogPolyfill.useValue || s.value);
    } else {
      dialog.close();
    }
    dialogPolyfill.formSubmitter = null;

  }, true);
}

(function() {/*

 Copyright 2015 Google Inc. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
var componentHandler={upgradeDom:function(optJsClass,optCssClass){},upgradeElement:function(element,optJsClass){},upgradeElements:function(elements){},upgradeAllRegistered:function(){},registerUpgradedCallback:function(jsClass,callback){},register:function(config){},downgradeElements:function(nodes){}};
componentHandler=function(){var registeredComponents_=[];var createdComponents_=[];var componentConfigProperty_="mdlComponentConfigInternal_";function findRegisteredClass_(name,optReplace){for(var i=0;i<registeredComponents_.length;i++)if(registeredComponents_[i].className===name){if(typeof optReplace!=="undefined")registeredComponents_[i]=optReplace;return registeredComponents_[i]}return false}function getUpgradedListOfElement_(element){var dataUpgraded=element.getAttribute("data-upgraded");return dataUpgraded===
null?[""]:dataUpgraded.split(",")}function isElementUpgraded_(element,jsClass){var upgradedList=getUpgradedListOfElement_(element);return upgradedList.indexOf(jsClass)!==-1}function createEvent_(eventType,bubbles,cancelable){if("CustomEvent"in window&&typeof window.CustomEvent==="function")return new CustomEvent(eventType,{bubbles:bubbles,cancelable:cancelable});else{var ev=document.createEvent("Events");ev.initEvent(eventType,bubbles,cancelable);return ev}}function upgradeDomInternal(optJsClass,
optCssClass){if(typeof optJsClass==="undefined"&&typeof optCssClass==="undefined")for(var i=0;i<registeredComponents_.length;i++)upgradeDomInternal(registeredComponents_[i].className,registeredComponents_[i].cssClass);else{var jsClass=optJsClass;if(typeof optCssClass==="undefined"){var registeredClass=findRegisteredClass_(jsClass);if(registeredClass)optCssClass=registeredClass.cssClass;}var elements=document.querySelectorAll("."+optCssClass);for(var n=0;n<elements.length;n++)upgradeElementInternal(elements[n],
jsClass);}}function upgradeElementInternal(element,optJsClass){if(!(typeof element==="object"&&element instanceof Element))throw new Error("Invalid argument provided to upgrade MDL element.");var upgradingEv=createEvent_("mdl-componentupgrading",true,true);element.dispatchEvent(upgradingEv);if(upgradingEv.defaultPrevented)return;var upgradedList=getUpgradedListOfElement_(element);var classesToUpgrade=[];if(!optJsClass){var classList=element.classList;registeredComponents_.forEach(function(component){if(classList.contains(component.cssClass)&&
classesToUpgrade.indexOf(component)===-1&&!isElementUpgraded_(element,component.className))classesToUpgrade.push(component);});}else if(!isElementUpgraded_(element,optJsClass))classesToUpgrade.push(findRegisteredClass_(optJsClass));for(var i=0,n=classesToUpgrade.length,registeredClass;i<n;i++){registeredClass=classesToUpgrade[i];if(registeredClass){upgradedList.push(registeredClass.className);element.setAttribute("data-upgraded",upgradedList.join(","));var instance=new registeredClass.classConstructor(element);
instance[componentConfigProperty_]=registeredClass;createdComponents_.push(instance);for(var j=0,m=registeredClass.callbacks.length;j<m;j++)registeredClass.callbacks[j](element);if(registeredClass.widget)element[registeredClass.className]=instance;}else throw new Error("Unable to find a registered component for the given class.");var upgradedEv=createEvent_("mdl-componentupgraded",true,false);element.dispatchEvent(upgradedEv);}}function upgradeElementsInternal(elements){if(!Array.isArray(elements))if(elements instanceof
Element)elements=[elements];else elements=Array.prototype.slice.call(elements);for(var i=0,n=elements.length,element;i<n;i++){element=elements[i];if(element instanceof HTMLElement){upgradeElementInternal(element);if(element.children.length>0)upgradeElementsInternal(element.children);}}}function registerInternal(config){var widgetMissing=typeof config.widget==="undefined"&&typeof config["widget"]==="undefined";var widget=true;if(!widgetMissing)widget=config.widget||config["widget"];var newConfig={classConstructor:config.constructor||
config["constructor"],className:config.classAsString||config["classAsString"],cssClass:config.cssClass||config["cssClass"],widget:widget,callbacks:[]};registeredComponents_.forEach(function(item){if(item.cssClass===newConfig.cssClass)throw new Error("The provided cssClass has already been registered: "+item.cssClass);if(item.className===newConfig.className)throw new Error("The provided className has already been registered");});if(config.constructor.prototype.hasOwnProperty(componentConfigProperty_))throw new Error("MDL component classes must not have "+
componentConfigProperty_+" defined as a property.");var found=findRegisteredClass_(config.classAsString,newConfig);if(!found)registeredComponents_.push(newConfig);}function registerUpgradedCallbackInternal(jsClass,callback){var regClass=findRegisteredClass_(jsClass);if(regClass)regClass.callbacks.push(callback);}function upgradeAllRegisteredInternal(){for(var n=0;n<registeredComponents_.length;n++)upgradeDomInternal(registeredComponents_[n].className);}function deconstructComponentInternal(component){if(component){var componentIndex=
createdComponents_.indexOf(component);createdComponents_.splice(componentIndex,1);var upgrades=component.element_.getAttribute("data-upgraded").split(",");var componentPlace=upgrades.indexOf(component[componentConfigProperty_].classAsString);upgrades.splice(componentPlace,1);component.element_.setAttribute("data-upgraded",upgrades.join(","));var ev=createEvent_("mdl-componentdowngraded",true,false);component.element_.dispatchEvent(ev);}}function downgradeNodesInternal(nodes){var downgradeNode=function(node){createdComponents_.filter(function(item){return item.element_===
node}).forEach(deconstructComponentInternal);};if(nodes instanceof Array||nodes instanceof NodeList)for(var n=0;n<nodes.length;n++)downgradeNode(nodes[n]);else if(nodes instanceof Node)downgradeNode(nodes);else throw new Error("Invalid argument provided to downgrade MDL nodes.");}return {upgradeDom:upgradeDomInternal,upgradeElement:upgradeElementInternal,upgradeElements:upgradeElementsInternal,upgradeAllRegistered:upgradeAllRegisteredInternal,registerUpgradedCallback:registerUpgradedCallbackInternal,
register:registerInternal,downgradeElements:downgradeNodesInternal}}();componentHandler.ComponentConfigPublic;componentHandler.ComponentConfig;componentHandler.Component;componentHandler["upgradeDom"]=componentHandler.upgradeDom;componentHandler["upgradeElement"]=componentHandler.upgradeElement;componentHandler["upgradeElements"]=componentHandler.upgradeElements;componentHandler["upgradeAllRegistered"]=componentHandler.upgradeAllRegistered;componentHandler["registerUpgradedCallback"]=componentHandler.registerUpgradedCallback;
componentHandler["register"]=componentHandler.register;componentHandler["downgradeElements"]=componentHandler.downgradeElements;window.componentHandler=componentHandler;window["componentHandler"]=componentHandler;
window.addEventListener("load",function(){if("classList"in document.createElement("div")&&"querySelector"in document&&"addEventListener"in window&&Array.prototype.forEach){document.documentElement.classList.add("mdl-js");componentHandler.upgradeAllRegistered();}else{componentHandler.upgradeElement=function(){};componentHandler.register=function(){};}});(function(){var MaterialButton=function MaterialButton(element){this.element_=element;this.init();};window["MaterialButton"]=MaterialButton;MaterialButton.prototype.Constant_={};MaterialButton.prototype.CssClasses_={RIPPLE_EFFECT:"mdl-js-ripple-effect",RIPPLE_CONTAINER:"mdl-button__ripple-container",RIPPLE:"mdl-ripple"};MaterialButton.prototype.blurHandler_=function(event){if(event)this.element_.blur();};MaterialButton.prototype.disable=function(){this.element_.disabled=true;};MaterialButton.prototype["disable"]=
MaterialButton.prototype.disable;MaterialButton.prototype.enable=function(){this.element_.disabled=false;};MaterialButton.prototype["enable"]=MaterialButton.prototype.enable;MaterialButton.prototype.init=function(){if(this.element_){if(this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)){var rippleContainer=document.createElement("span");rippleContainer.classList.add(this.CssClasses_.RIPPLE_CONTAINER);this.rippleElement_=document.createElement("span");this.rippleElement_.classList.add(this.CssClasses_.RIPPLE);
rippleContainer.appendChild(this.rippleElement_);this.boundRippleBlurHandler=this.blurHandler_.bind(this);this.rippleElement_.addEventListener("mouseup",this.boundRippleBlurHandler);this.element_.appendChild(rippleContainer);}this.boundButtonBlurHandler=this.blurHandler_.bind(this);this.element_.addEventListener("mouseup",this.boundButtonBlurHandler);this.element_.addEventListener("mouseleave",this.boundButtonBlurHandler);}};componentHandler.register({constructor:MaterialButton,classAsString:"MaterialButton",
cssClass:"mdl-js-button",widget:true});})();(function(){var MaterialProgress=function MaterialProgress(element){this.element_=element;this.init();};window["MaterialProgress"]=MaterialProgress;MaterialProgress.prototype.Constant_={};MaterialProgress.prototype.CssClasses_={INDETERMINATE_CLASS:"mdl-progress__indeterminate"};MaterialProgress.prototype.setProgress=function(p){if(this.element_.classList.contains(this.CssClasses_.INDETERMINATE_CLASS))return;this.progressbar_.style.width=p+"%";};MaterialProgress.prototype["setProgress"]=MaterialProgress.prototype.setProgress;
MaterialProgress.prototype.setBuffer=function(p){this.bufferbar_.style.width=p+"%";this.auxbar_.style.width=100-p+"%";};MaterialProgress.prototype["setBuffer"]=MaterialProgress.prototype.setBuffer;MaterialProgress.prototype.init=function(){if(this.element_){var el=document.createElement("div");el.className="progressbar bar bar1";this.element_.appendChild(el);this.progressbar_=el;el=document.createElement("div");el.className="bufferbar bar bar2";this.element_.appendChild(el);this.bufferbar_=el;el=document.createElement("div");
el.className="auxbar bar bar3";this.element_.appendChild(el);this.auxbar_=el;this.progressbar_.style.width="0%";this.bufferbar_.style.width="100%";this.auxbar_.style.width="0%";this.element_.classList.add("is-upgraded");}};componentHandler.register({constructor:MaterialProgress,classAsString:"MaterialProgress",cssClass:"mdl-js-progress",widget:true});})();(function(){var MaterialSpinner=function MaterialSpinner(element){this.element_=element;this.init();};window["MaterialSpinner"]=MaterialSpinner;MaterialSpinner.prototype.Constant_={MDL_SPINNER_LAYER_COUNT:4};MaterialSpinner.prototype.CssClasses_={MDL_SPINNER_LAYER:"mdl-spinner__layer",MDL_SPINNER_CIRCLE_CLIPPER:"mdl-spinner__circle-clipper",MDL_SPINNER_CIRCLE:"mdl-spinner__circle",MDL_SPINNER_GAP_PATCH:"mdl-spinner__gap-patch",MDL_SPINNER_LEFT:"mdl-spinner__left",MDL_SPINNER_RIGHT:"mdl-spinner__right"};
MaterialSpinner.prototype.createLayer=function(index){var layer=document.createElement("div");layer.classList.add(this.CssClasses_.MDL_SPINNER_LAYER);layer.classList.add(this.CssClasses_.MDL_SPINNER_LAYER+"-"+index);var leftClipper=document.createElement("div");leftClipper.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE_CLIPPER);leftClipper.classList.add(this.CssClasses_.MDL_SPINNER_LEFT);var gapPatch=document.createElement("div");gapPatch.classList.add(this.CssClasses_.MDL_SPINNER_GAP_PATCH);var rightClipper=
document.createElement("div");rightClipper.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE_CLIPPER);rightClipper.classList.add(this.CssClasses_.MDL_SPINNER_RIGHT);var circleOwners=[leftClipper,gapPatch,rightClipper];for(var i=0;i<circleOwners.length;i++){var circle=document.createElement("div");circle.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE);circleOwners[i].appendChild(circle);}layer.appendChild(leftClipper);layer.appendChild(gapPatch);layer.appendChild(rightClipper);this.element_.appendChild(layer);};
MaterialSpinner.prototype["createLayer"]=MaterialSpinner.prototype.createLayer;MaterialSpinner.prototype.stop=function(){this.element_.classList.remove("is-active");};MaterialSpinner.prototype["stop"]=MaterialSpinner.prototype.stop;MaterialSpinner.prototype.start=function(){this.element_.classList.add("is-active");};MaterialSpinner.prototype["start"]=MaterialSpinner.prototype.start;MaterialSpinner.prototype.init=function(){if(this.element_){for(var i=1;i<=this.Constant_.MDL_SPINNER_LAYER_COUNT;i++)this.createLayer(i);
this.element_.classList.add("is-upgraded");}};componentHandler.register({constructor:MaterialSpinner,classAsString:"MaterialSpinner",cssClass:"mdl-js-spinner",widget:true});})();(function(){var MaterialTextfield=function MaterialTextfield(element){this.element_=element;this.maxRows=this.Constant_.NO_MAX_ROWS;this.init();};window["MaterialTextfield"]=MaterialTextfield;MaterialTextfield.prototype.Constant_={NO_MAX_ROWS:-1,MAX_ROWS_ATTRIBUTE:"maxrows"};MaterialTextfield.prototype.CssClasses_={LABEL:"mdl-textfield__label",INPUT:"mdl-textfield__input",IS_DIRTY:"is-dirty",IS_FOCUSED:"is-focused",IS_DISABLED:"is-disabled",IS_INVALID:"is-invalid",IS_UPGRADED:"is-upgraded",HAS_PLACEHOLDER:"has-placeholder"};
MaterialTextfield.prototype.onKeyDown_=function(event){var currentRowCount=event.target.value.split("\n").length;if(event.keyCode===13)if(currentRowCount>=this.maxRows)event.preventDefault();};MaterialTextfield.prototype.onFocus_=function(event){this.element_.classList.add(this.CssClasses_.IS_FOCUSED);};MaterialTextfield.prototype.onBlur_=function(event){this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);};MaterialTextfield.prototype.onReset_=function(event){this.updateClasses_();};MaterialTextfield.prototype.updateClasses_=
function(){this.checkDisabled();this.checkValidity();this.checkDirty();this.checkFocus();};MaterialTextfield.prototype.checkDisabled=function(){if(this.input_.disabled)this.element_.classList.add(this.CssClasses_.IS_DISABLED);else this.element_.classList.remove(this.CssClasses_.IS_DISABLED);};MaterialTextfield.prototype["checkDisabled"]=MaterialTextfield.prototype.checkDisabled;MaterialTextfield.prototype.checkFocus=function(){if(Boolean(this.element_.querySelector(":focus")))this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
else this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);};MaterialTextfield.prototype["checkFocus"]=MaterialTextfield.prototype.checkFocus;MaterialTextfield.prototype.checkValidity=function(){if(this.input_.validity)if(this.input_.validity.valid)this.element_.classList.remove(this.CssClasses_.IS_INVALID);else this.element_.classList.add(this.CssClasses_.IS_INVALID);};MaterialTextfield.prototype["checkValidity"]=MaterialTextfield.prototype.checkValidity;MaterialTextfield.prototype.checkDirty=
function(){if(this.input_.value&&this.input_.value.length>0)this.element_.classList.add(this.CssClasses_.IS_DIRTY);else this.element_.classList.remove(this.CssClasses_.IS_DIRTY);};MaterialTextfield.prototype["checkDirty"]=MaterialTextfield.prototype.checkDirty;MaterialTextfield.prototype.disable=function(){this.input_.disabled=true;this.updateClasses_();};MaterialTextfield.prototype["disable"]=MaterialTextfield.prototype.disable;MaterialTextfield.prototype.enable=function(){this.input_.disabled=false;
this.updateClasses_();};MaterialTextfield.prototype["enable"]=MaterialTextfield.prototype.enable;MaterialTextfield.prototype.change=function(value){this.input_.value=value||"";this.updateClasses_();};MaterialTextfield.prototype["change"]=MaterialTextfield.prototype.change;MaterialTextfield.prototype.init=function(){if(this.element_){this.label_=this.element_.querySelector("."+this.CssClasses_.LABEL);this.input_=this.element_.querySelector("."+this.CssClasses_.INPUT);if(this.input_){if(this.input_.hasAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE)){this.maxRows=
parseInt(this.input_.getAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE),10);if(isNaN(this.maxRows))this.maxRows=this.Constant_.NO_MAX_ROWS;}if(this.input_.hasAttribute("placeholder"))this.element_.classList.add(this.CssClasses_.HAS_PLACEHOLDER);this.boundUpdateClassesHandler=this.updateClasses_.bind(this);this.boundFocusHandler=this.onFocus_.bind(this);this.boundBlurHandler=this.onBlur_.bind(this);this.boundResetHandler=this.onReset_.bind(this);this.input_.addEventListener("input",this.boundUpdateClassesHandler);
this.input_.addEventListener("focus",this.boundFocusHandler);this.input_.addEventListener("blur",this.boundBlurHandler);this.input_.addEventListener("reset",this.boundResetHandler);if(this.maxRows!==this.Constant_.NO_MAX_ROWS){this.boundKeyDownHandler=this.onKeyDown_.bind(this);this.input_.addEventListener("keydown",this.boundKeyDownHandler);}var invalid=this.element_.classList.contains(this.CssClasses_.IS_INVALID);this.updateClasses_();this.element_.classList.add(this.CssClasses_.IS_UPGRADED);if(invalid)this.element_.classList.add(this.CssClasses_.IS_INVALID);
if(this.input_.hasAttribute("autofocus")){this.element_.focus();this.checkFocus();}}}};componentHandler.register({constructor:MaterialTextfield,classAsString:"MaterialTextfield",cssClass:"mdl-js-textfield",widget:true});})();(function(){var supportCustomEvent=window.CustomEvent;if(!supportCustomEvent||typeof supportCustomEvent==="object"){supportCustomEvent=function CustomEvent(event,x){x=x||{};var ev=document.createEvent("CustomEvent");ev.initCustomEvent(event,!!x.bubbles,!!x.cancelable,x.detail||null);return ev};supportCustomEvent.prototype=window.Event.prototype;}function createsStackingContext(el){while(el&&el!==document.body){var s=window.getComputedStyle(el);var invalid=function(k,ok){return !(s[k]===undefined||s[k]===
ok)};if(s.opacity<1||invalid("zIndex","auto")||invalid("transform","none")||invalid("mixBlendMode","normal")||invalid("filter","none")||invalid("perspective","none")||s["isolation"]==="isolate"||s.position==="fixed"||s.webkitOverflowScrolling==="touch")return true;el=el.parentElement;}return false}function findNearestDialog(el){while(el){if(el.localName==="dialog")return el;el=el.parentElement;}return null}function safeBlur(el){if(el&&el.blur&&el!==document.body)el.blur();}function inNodeList(nodeList,
node){for(var i=0;i<nodeList.length;++i)if(nodeList[i]===node)return true;return false}function isFormMethodDialog(el){if(!el||!el.hasAttribute("method"))return false;return el.getAttribute("method").toLowerCase()==="dialog"}function dialogPolyfillInfo(dialog){this.dialog_=dialog;this.replacedStyleTop_=false;this.openAsModal_=false;if(!dialog.hasAttribute("role"))dialog.setAttribute("role","dialog");dialog.show=this.show.bind(this);dialog.showModal=this.showModal.bind(this);dialog.close=this.close.bind(this);
if(!("returnValue"in dialog))dialog.returnValue="";if("MutationObserver"in window){var mo=new MutationObserver(this.maybeHideModal.bind(this));mo.observe(dialog,{attributes:true,attributeFilter:["open"]});}else{var removed=false;var cb=function(){removed?this.downgradeModal():this.maybeHideModal();removed=false;}.bind(this);var timeout;var delayModel=function(ev){if(ev.target!==dialog)return;var cand="DOMNodeRemoved";removed|=ev.type.substr(0,cand.length)===cand;window.clearTimeout(timeout);timeout=
window.setTimeout(cb,0);};["DOMAttrModified","DOMNodeRemoved","DOMNodeRemovedFromDocument"].forEach(function(name){dialog.addEventListener(name,delayModel);});}Object.defineProperty(dialog,"open",{set:this.setOpen.bind(this),get:dialog.hasAttribute.bind(dialog,"open")});this.backdrop_=document.createElement("div");this.backdrop_.className="backdrop";this.backdrop_.addEventListener("click",this.backdropClick_.bind(this));}dialogPolyfillInfo.prototype={get dialog(){return this.dialog_},maybeHideModal:function(){if(this.dialog_.hasAttribute("open")&&
document.body.contains(this.dialog_))return;this.downgradeModal();},downgradeModal:function(){if(!this.openAsModal_)return;this.openAsModal_=false;this.dialog_.style.zIndex="";if(this.replacedStyleTop_){this.dialog_.style.top="";this.replacedStyleTop_=false;}this.backdrop_.parentNode&&this.backdrop_.parentNode.removeChild(this.backdrop_);dialogPolyfill.dm.removeDialog(this);},setOpen:function(value){if(value)this.dialog_.hasAttribute("open")||this.dialog_.setAttribute("open","");else{this.dialog_.removeAttribute("open");
this.maybeHideModal();}},backdropClick_:function(e){if(!this.dialog_.hasAttribute("tabindex")){var fake=document.createElement("div");this.dialog_.insertBefore(fake,this.dialog_.firstChild);fake.tabIndex=-1;fake.focus();this.dialog_.removeChild(fake);}else this.dialog_.focus();var redirectedEvent=document.createEvent("MouseEvents");redirectedEvent.initMouseEvent(e.type,e.bubbles,e.cancelable,window,e.detail,e.screenX,e.screenY,e.clientX,e.clientY,e.ctrlKey,e.altKey,e.shiftKey,e.metaKey,e.button,e.relatedTarget);
this.dialog_.dispatchEvent(redirectedEvent);e.stopPropagation();},focus_:function(){var target=this.dialog_.querySelector("[autofocus]:not([disabled])");if(!target&&this.dialog_.tabIndex>=0)target=this.dialog_;if(!target){var opts=["button","input","keygen","select","textarea"];var query=opts.map(function(el){return el+":not([disabled])"});query.push('[tabindex]:not([disabled]):not([tabindex=""])');target=this.dialog_.querySelector(query.join(", "));}safeBlur(document.activeElement);target&&target.focus();},
updateZIndex:function(dialogZ,backdropZ){if(dialogZ<backdropZ)throw new Error("dialogZ should never be < backdropZ");this.dialog_.style.zIndex=dialogZ;this.backdrop_.style.zIndex=backdropZ;},show:function(){if(!this.dialog_.open){this.setOpen(true);this.focus_();}},showModal:function(){if(this.dialog_.hasAttribute("open"))throw new Error("Failed to execute 'showModal' on dialog: The element is already open, and therefore cannot be opened modally.");if(!document.body.contains(this.dialog_))throw new Error("Failed to execute 'showModal' on dialog: The element is not in a Document.");
if(!dialogPolyfill.dm.pushDialog(this))throw new Error("Failed to execute 'showModal' on dialog: There are too many open modal dialogs.");if(createsStackingContext(this.dialog_.parentElement))console.warn("A dialog is being shown inside a stacking context. "+"This may cause it to be unusable. For more information, see this link: "+"https://github.com/GoogleChrome/dialog-polyfill/#stacking-context");this.setOpen(true);this.openAsModal_=true;if(dialogPolyfill.needsCentering(this.dialog_)){dialogPolyfill.reposition(this.dialog_);
this.replacedStyleTop_=true;}else this.replacedStyleTop_=false;this.dialog_.parentNode.insertBefore(this.backdrop_,this.dialog_.nextSibling);this.focus_();},close:function(opt_returnValue){if(!this.dialog_.hasAttribute("open"))throw new Error("Failed to execute 'close' on dialog: The element does not have an 'open' attribute, and therefore cannot be closed.");this.setOpen(false);if(opt_returnValue!==undefined)this.dialog_.returnValue=opt_returnValue;var closeEvent=new supportCustomEvent("close",{bubbles:false,
cancelable:false});this.dialog_.dispatchEvent(closeEvent);}};var dialogPolyfill={};dialogPolyfill.reposition=function(element){var scrollTop=document.body.scrollTop||document.documentElement.scrollTop;var topValue=scrollTop+(window.innerHeight-element.offsetHeight)/2;element.style.top=Math.max(scrollTop,topValue)+"px";};dialogPolyfill.isInlinePositionSetByStylesheet=function(element){for(var i=0;i<document.styleSheets.length;++i){var styleSheet=document.styleSheets[i];var cssRules=null;try{cssRules=
styleSheet.cssRules;}catch(e){}if(!cssRules)continue;for(var j=0;j<cssRules.length;++j){var rule=cssRules[j];var selectedNodes=null;try{selectedNodes=document.querySelectorAll(rule.selectorText);}catch(e$0){}if(!selectedNodes||!inNodeList(selectedNodes,element))continue;var cssTop=rule.style.getPropertyValue("top");var cssBottom=rule.style.getPropertyValue("bottom");if(cssTop&&cssTop!=="auto"||cssBottom&&cssBottom!=="auto")return true}}return false};dialogPolyfill.needsCentering=function(dialog){var computedStyle=
window.getComputedStyle(dialog);if(computedStyle.position!=="absolute")return false;if(dialog.style.top!=="auto"&&dialog.style.top!==""||dialog.style.bottom!=="auto"&&dialog.style.bottom!=="")return false;return !dialogPolyfill.isInlinePositionSetByStylesheet(dialog)};dialogPolyfill.forceRegisterDialog=function(element){if(window.HTMLDialogElement||element.showModal)console.warn("This browser already supports <dialog>, the polyfill "+"may not work correctly",element);if(element.localName!=="dialog")throw new Error("Failed to register dialog: The element is not a dialog.");
new dialogPolyfillInfo(element);};dialogPolyfill.registerDialog=function(element){if(!element.showModal)dialogPolyfill.forceRegisterDialog(element);};dialogPolyfill.DialogManager=function(){this.pendingDialogStack=[];var checkDOM=this.checkDOM_.bind(this);this.overlay=document.createElement("div");this.overlay.className="_dialog_overlay";this.overlay.addEventListener("click",function(e){this.forwardTab_=undefined;e.stopPropagation();checkDOM([]);}.bind(this));this.handleKey_=this.handleKey_.bind(this);
this.handleFocus_=this.handleFocus_.bind(this);this.zIndexLow_=1E5;this.zIndexHigh_=1E5+150;this.forwardTab_=undefined;if("MutationObserver"in window)this.mo_=new MutationObserver(function(records){var removed=[];records.forEach(function(rec){for(var i=0,c;c=rec.removedNodes[i];++i){if(!(c instanceof Element))continue;else if(c.localName==="dialog")removed.push(c);removed=removed.concat(c.querySelectorAll("dialog"));}});removed.length&&checkDOM(removed);});};dialogPolyfill.DialogManager.prototype.blockDocument=
function(){document.documentElement.addEventListener("focus",this.handleFocus_,true);document.addEventListener("keydown",this.handleKey_);this.mo_&&this.mo_.observe(document,{childList:true,subtree:true});};dialogPolyfill.DialogManager.prototype.unblockDocument=function(){document.documentElement.removeEventListener("focus",this.handleFocus_,true);document.removeEventListener("keydown",this.handleKey_);this.mo_&&this.mo_.disconnect();};dialogPolyfill.DialogManager.prototype.updateStacking=function(){var zIndex=
this.zIndexHigh_;for(var i=0,dpi;dpi=this.pendingDialogStack[i];++i){dpi.updateZIndex(--zIndex,--zIndex);if(i===0)this.overlay.style.zIndex=--zIndex;}var last=this.pendingDialogStack[0];if(last){var p=last.dialog.parentNode||document.body;p.appendChild(this.overlay);}else if(this.overlay.parentNode)this.overlay.parentNode.removeChild(this.overlay);};dialogPolyfill.DialogManager.prototype.containedByTopDialog_=function(candidate){while(candidate=findNearestDialog(candidate)){for(var i=0,dpi;dpi=this.pendingDialogStack[i];++i)if(dpi.dialog===
candidate)return i===0;candidate=candidate.parentElement;}return false};dialogPolyfill.DialogManager.prototype.handleFocus_=function(event){if(this.containedByTopDialog_(event.target))return;event.preventDefault();event.stopPropagation();safeBlur(event.target);if(this.forwardTab_===undefined)return;var dpi=this.pendingDialogStack[0];var dialog=dpi.dialog;var position=dialog.compareDocumentPosition(event.target);if(position&Node.DOCUMENT_POSITION_PRECEDING)if(this.forwardTab_)dpi.focus_();else document.documentElement.focus();return false};dialogPolyfill.DialogManager.prototype.handleKey_=function(event){this.forwardTab_=undefined;if(event.keyCode===27){event.preventDefault();event.stopPropagation();var cancelEvent=new supportCustomEvent("cancel",{bubbles:false,cancelable:true});var dpi=this.pendingDialogStack[0];if(dpi&&dpi.dialog.dispatchEvent(cancelEvent))dpi.dialog.close();}else if(event.keyCode===9)this.forwardTab_=!event.shiftKey;};dialogPolyfill.DialogManager.prototype.checkDOM_=function(removed){var clone=this.pendingDialogStack.slice();
clone.forEach(function(dpi){if(removed.indexOf(dpi.dialog)!==-1)dpi.downgradeModal();else dpi.maybeHideModal();});};dialogPolyfill.DialogManager.prototype.pushDialog=function(dpi){var allowed=(this.zIndexHigh_-this.zIndexLow_)/2-1;if(this.pendingDialogStack.length>=allowed)return false;if(this.pendingDialogStack.unshift(dpi)===1)this.blockDocument();this.updateStacking();return true};dialogPolyfill.DialogManager.prototype.removeDialog=function(dpi){var index=this.pendingDialogStack.indexOf(dpi);if(index===
-1)return;this.pendingDialogStack.splice(index,1);if(this.pendingDialogStack.length===0)this.unblockDocument();this.updateStacking();};dialogPolyfill.dm=new dialogPolyfill.DialogManager;dialogPolyfill.formSubmitter=null;dialogPolyfill.useValue=null;if(window.HTMLDialogElement===undefined){var testForm=document.createElement("form");testForm.setAttribute("method","dialog");if(testForm.method!=="dialog"){var methodDescriptor=Object.getOwnPropertyDescriptor(HTMLFormElement.prototype,"method");if(methodDescriptor){var realGet=
methodDescriptor.get;methodDescriptor.get=function(){if(isFormMethodDialog(this))return "dialog";return realGet.call(this)};var realSet=methodDescriptor.set;methodDescriptor.set=function(v){if(typeof v==="string"&&v.toLowerCase()==="dialog")return this.setAttribute("method",v);return realSet.call(this,v)};Object.defineProperty(HTMLFormElement.prototype,"method",methodDescriptor);}}document.addEventListener("click",function(ev){dialogPolyfill.formSubmitter=null;dialogPolyfill.useValue=null;if(ev.defaultPrevented)return;
var target=ev.target;if(!target||!isFormMethodDialog(target.form))return;var valid=target.type==="submit"&&["button","input"].indexOf(target.localName)>-1;if(!valid){if(!(target.localName==="input"&&target.type==="image"))return;dialogPolyfill.useValue=ev.offsetX+","+ev.offsetY;}var dialog=findNearestDialog(target);if(!dialog)return;dialogPolyfill.formSubmitter=target;},false);var nativeFormSubmit=HTMLFormElement.prototype.submit;var replacementFormSubmit=function(){if(!isFormMethodDialog(this))return nativeFormSubmit.call(this);
var dialog=findNearestDialog(this);dialog&&dialog.close();};HTMLFormElement.prototype.submit=replacementFormSubmit;document.addEventListener("submit",function(ev){var form=ev.target;if(!isFormMethodDialog(form))return;ev.preventDefault();var dialog=findNearestDialog(form);if(!dialog)return;var s=dialogPolyfill.formSubmitter;if(s&&s.form===form)dialog.close(dialogPolyfill.useValue||s.value);else dialog.close();dialogPolyfill.formSubmitter=null;},true);}dialogPolyfill["forceRegisterDialog"]=dialogPolyfill.forceRegisterDialog;
dialogPolyfill["registerDialog"]=dialogPolyfill.registerDialog;if(typeof define==="function"&&"amd"in define)define(function(){return dialogPolyfill});else if(typeof module==="object"&&typeof module["exports"]==="object")module["exports"]=dialogPolyfill;else window["dialogPolyfill"]=dialogPolyfill;})();(function(){var m,aa="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value);},ca="undefined"!=typeof window&&window===this?this:"undefined"!=typeof global&&null!=global?global:this;function da(a,b){if(b){var c=ca;a=a.split(".");for(var d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e];}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&aa(c,a,{configurable:!0,writable:!0,value:b});}}function ea(a){var b=0;return function(){return b<
a.length?{done:!1,value:a[b++]}:{done:!0}}}function fa(a){var b="undefined"!=typeof Symbol&&Symbol.iterator&&a[Symbol.iterator];return b?b.call(a):{next:ea(a)}}da("Promise",function(a){function b(g){this.g=0;this.h=void 0;this.a=[];var h=this.j();try{g(h.resolve,h.reject);}catch(k){h.reject(k);}}function c(){this.a=null;}function d(g){return g instanceof b?g:new b(function(h){h(g);})}if(a)return a;c.prototype.g=function(g){if(null==this.a){this.a=[];var h=this;this.h(function(){h.i();});}this.a.push(g);};
var e=ca.setTimeout;c.prototype.h=function(g){e(g,0);};c.prototype.i=function(){for(;this.a&&this.a.length;){var g=this.a;this.a=[];for(var h=0;h<g.length;++h){var k=g[h];g[h]=null;try{k();}catch(l){this.j(l);}}}this.a=null;};c.prototype.j=function(g){this.h(function(){throw g;});};b.prototype.j=function(){function g(l){return function(v){k||(k=!0,l.call(h,v));}}var h=this,k=!1;return {resolve:g(this.I),reject:g(this.i)}};b.prototype.I=function(g){if(g===this)this.i(new TypeError("A Promise cannot resolve to itself"));
else if(g instanceof b)this.K(g);else{a:switch(typeof g){case "object":var h=null!=g;break a;case "function":h=!0;break a;default:h=!1;}h?this.F(g):this.v(g);}};b.prototype.F=function(g){var h=void 0;try{h=g.then;}catch(k){this.i(k);return}"function"==typeof h?this.O(h,g):this.v(g);};b.prototype.i=function(g){this.w(2,g);};b.prototype.v=function(g){this.w(1,g);};b.prototype.w=function(g,h){if(0!=this.g)throw Error("Cannot settle("+g+", "+h+"): Promise already settled in state"+this.g);this.g=g;this.h=h;
this.C();};b.prototype.C=function(){if(null!=this.a){for(var g=0;g<this.a.length;++g)f.g(this.a[g]);this.a=null;}};var f=new c;b.prototype.K=function(g){var h=this.j();g.Da(h.resolve,h.reject);};b.prototype.O=function(g,h){var k=this.j();try{g.call(h,k.resolve,k.reject);}catch(l){k.reject(l);}};b.prototype.then=function(g,h){function k(sa,Da){return "function"==typeof sa?function(Ka){try{l(sa(Ka));}catch(ba){v(ba);}}:Da}var l,v,ya=new b(function(sa,Da){l=sa;v=Da;});this.Da(k(g,l),k(h,v));return ya};b.prototype.catch=
function(g){return this.then(void 0,g)};b.prototype.Da=function(g,h){function k(){switch(l.g){case 1:g(l.h);break;case 2:h(l.h);break;default:throw Error("Unexpected state: "+l.g);}}var l=this;null==this.a?f.g(k):this.a.push(k);};b.resolve=d;b.reject=function(g){return new b(function(h,k){k(g);})};b.race=function(g){return new b(function(h,k){for(var l=fa(g),v=l.next();!v.done;v=l.next())d(v.value).Da(h,k);})};b.all=function(g){var h=fa(g),k=h.next();return k.done?d([]):new b(function(l,v){function ya(Ka){return function(ba){sa[Ka]=
ba;Da--;0==Da&&l(sa);}}var sa=[],Da=0;do sa.push(void 0),Da++,d(k.value).Da(ya(sa.length-1),v),k=h.next();while(!k.done)})};return b});var n=this;function ha(a){return void 0!==a}function p(a){return "string"==typeof a}var ia=/^[\w+/_-]+[=]{0,2}$/,ja=null;function ka(){}function la(a){a.V=void 0;a.Sa=function(){return a.V?a.V:a.V=new a};}function ma(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return "array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==
c)return "object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return "array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return "function"}else return "null";else if("function"==b&&"undefined"==typeof a.call)return "object";return b}function na(a){return null!=a}function oa(a){return "array"==ma(a)}function pa(a){var b=
ma(a);return "array"==b||"object"==b&&"number"==typeof a.length}function qa(a){return "function"==ma(a)}function ra(a){var b=typeof a;return "object"==b&&null!=a||"function"==b}var ta="closure_uid_"+(1E9*Math.random()>>>0),ua=0;function va(a,b,c){return a.call.apply(a.bind,arguments)}function wa(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(b,
e)}}return function(){return a.apply(b,arguments)}}function q(a,b,c){Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?q=va:q=wa;return q.apply(null,arguments)}function xa(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var d=c.slice();d.push.apply(d,arguments);return a.apply(this,d)}}function r(a,b){for(var c in b)a[c]=b[c];}var za=Date.now||function(){return +new Date};function Aa(a,b){a=a.split(".");var c=n;a[0]in c||"undefined"==typeof c.execScript||
c.execScript("var "+a[0]);for(var d;a.length&&(d=a.shift());)!a.length&&ha(b)?c[d]=b:c[d]&&c[d]!==Object.prototype[d]?c=c[d]:c=c[d]={};}function t(a,b){function c(){}c.prototype=b.prototype;a.o=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.fc=function(d,e,f){for(var g=Array(arguments.length-2),h=2;h<arguments.length;h++)g[h-2]=arguments[h];return b.prototype[e].apply(d,g)};}function Ba(a){if(Error.captureStackTrace)Error.captureStackTrace(this,Ba);else{var b=Error().stack;b&&(this.stack=
b);}a&&(this.message=String(a));}t(Ba,Error);Ba.prototype.name="CustomError";var Ca;function Ea(a,b){a=a.split("%s");for(var c="",d=a.length-1,e=0;e<d;e++)c+=a[e]+(e<b.length?b[e]:"%s");Ba.call(this,c+a[d]);}t(Ea,Ba);Ea.prototype.name="AssertionError";function Fa(a,b){throw new Ea("Failure"+(a?": "+a:""),Array.prototype.slice.call(arguments,1));}var Ga=Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf.call(a,b,void 0)}:function(a,b){if(p(a))return p(b)&&1==b.length?a.indexOf(b,0):
-1;for(var c=0;c<a.length;c++)if(c in a&&a[c]===b)return c;return -1},Ha=Array.prototype.forEach?function(a,b,c){Array.prototype.forEach.call(a,b,c);}:function(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a);};function Ia(a,b){for(var c=p(a)?a.split(""):a,d=a.length-1;0<=d;--d)d in c&&b.call(void 0,c[d],d,a);}var Ja=Array.prototype.filter?function(a,b){return Array.prototype.filter.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=[],e=0,f=p(a)?a.split(""):a,g=
0;g<c;g++)if(g in f){var h=f[g];b.call(void 0,h,g,a)&&(d[e++]=h);}return d},La=Array.prototype.map?function(a,b){return Array.prototype.map.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=Array(c),e=p(a)?a.split(""):a,f=0;f<c;f++)f in e&&(d[f]=b.call(void 0,e[f],f,a));return d},Ma=Array.prototype.some?function(a,b){return Array.prototype.some.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=p(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a))return !0;return !1};function Na(a,
b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return f;return -1}function Oa(a,b){return 0<=Ga(a,b)}function Pa(a,b){b=Ga(a,b);var c;(c=0<=b)&&Qa(a,b);return c}function Qa(a,b){return 1==Array.prototype.splice.call(a,b,1).length}function Ra(a,b){b=Na(a,b,void 0);0<=b&&Qa(a,b);}function Sa(a,b){var c=0;Ia(a,function(d,e){b.call(void 0,d,e,a)&&Qa(a,e)&&c++;});}function Ta(a){return Array.prototype.concat.apply([],arguments)}function Ua(a){var b=a.length;if(0<b){for(var c=
Array(b),d=0;d<b;d++)c[d]=a[d];return c}return []}function Va(a,b,c,d){return Array.prototype.splice.apply(a,Wa(arguments,1))}function Wa(a,b,c){return 2>=arguments.length?Array.prototype.slice.call(a,b):Array.prototype.slice.call(a,b,c)}var Xa=String.prototype.trim?function(a){return a.trim()}:function(a){return /^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1]},Ya=/&/g,Za=/</g,$a=/>/g,ab=/"/g,bb=/'/g,cb=/\x00/g,db=/[\x00&<>"']/;function eb(a,b){return a<b?-1:a>b?1:0}var fb;a:{var gb=n.navigator;if(gb){var hb=
gb.userAgent;if(hb){fb=hb;break a}}fb="";}function u(a){return -1!=fb.indexOf(a)}function ib(a,b,c){for(var d in a)b.call(c,a[d],d,a);}function jb(a){var b={},c;for(c in a)b[c]=a[c];return b}var kb="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function lb(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var f=0;f<kb.length;f++)c=kb[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c]);}}function mb(){return (u("Chrome")||
u("CriOS"))&&!u("Edge")}function nb(a){db.test(a)&&(-1!=a.indexOf("&")&&(a=a.replace(Ya,"&amp;")),-1!=a.indexOf("<")&&(a=a.replace(Za,"&lt;")),-1!=a.indexOf(">")&&(a=a.replace($a,"&gt;")),-1!=a.indexOf('"')&&(a=a.replace(ab,"&quot;")),-1!=a.indexOf("'")&&(a=a.replace(bb,"&#39;")),-1!=a.indexOf("\x00")&&(a=a.replace(cb,"&#0;")));return a}function ob(a){ob[" "](a);return a}ob[" "]=ka;function pb(a,b){var c=qb;return Object.prototype.hasOwnProperty.call(c,a)?c[a]:c[a]=b(a)}var rb=u("Opera"),w=u("Trident")||
u("MSIE"),sb=u("Edge"),tb=sb||w,ub=u("Gecko")&&!(-1!=fb.toLowerCase().indexOf("webkit")&&!u("Edge"))&&!(u("Trident")||u("MSIE"))&&!u("Edge"),vb=-1!=fb.toLowerCase().indexOf("webkit")&&!u("Edge"),wb=vb&&u("Mobile"),xb=u("Macintosh");function yb(){var a=n.document;return a?a.documentMode:void 0}var zb;a:{var Ab="",Bb=function(){var a=fb;if(ub)return /rv:([^\);]+)(\)|;)/.exec(a);if(sb)return /Edge\/([\d\.]+)/.exec(a);if(w)return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(vb)return /WebKit\/(\S+)/.exec(a);
if(rb)return /(?:Version)[ \/]?(\S+)/.exec(a)}();Bb&&(Ab=Bb?Bb[1]:"");if(w){var Cb=yb();if(null!=Cb&&Cb>parseFloat(Ab)){zb=String(Cb);break a}}zb=Ab;}var qb={};function Db(a){return pb(a,function(){for(var b=0,c=Xa(String(zb)).split("."),d=Xa(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",h=d[f]||"";do{g=/(\d*)(\D*)(.*)/.exec(g)||["","","",""];h=/(\d*)(\D*)(.*)/.exec(h)||["","","",""];if(0==g[0].length&&0==h[0].length)break;b=eb(0==g[1].length?0:parseInt(g[1],
10),0==h[1].length?0:parseInt(h[1],10))||eb(0==g[2].length,0==h[2].length)||eb(g[2],h[2]);g=g[3];h=h[3];}while(0==b)}return 0<=b})}var Eb;var Fb=n.document;Eb=Fb&&w?yb()||("CSS1Compat"==Fb.compatMode?parseInt(zb,10):5):void 0;function Gb(a,b){this.a=a===Hb&&b||"";this.g=Ib;}Gb.prototype.ka=!0;Gb.prototype.ia=function(){return this.a};Gb.prototype.toString=function(){return "Const{"+this.a+"}"};function Jb(a){if(a instanceof Gb&&a.constructor===Gb&&a.g===Ib)return a.a;Fa("expected object of type Const, got '"+
a+"'");return "type_error:Const"}var Ib={},Hb={};function Kb(){this.a="";this.h=Lb;}Kb.prototype.ka=!0;Kb.prototype.ia=function(){return this.a.toString()};Kb.prototype.g=function(){return 1};Kb.prototype.toString=function(){return "TrustedResourceUrl{"+this.a+"}"};function Mb(a){if(a instanceof Kb&&a.constructor===Kb&&a.h===Lb)return a.a;Fa("expected object of type TrustedResourceUrl, got '"+a+"' of type "+ma(a));return "type_error:TrustedResourceUrl"}var Lb={};function Nb(a){var b=new Kb;b.a=a;return b}
function Ob(){this.a="";this.h=Pb;}Ob.prototype.ka=!0;Ob.prototype.ia=function(){return this.a.toString()};Ob.prototype.g=function(){return 1};Ob.prototype.toString=function(){return "SafeUrl{"+this.a+"}"};function Qb(a){return Rb(a).toString()}function Rb(a){if(a instanceof Ob&&a.constructor===Ob&&a.h===Pb)return a.a;Fa("expected object of type SafeUrl, got '"+a+"' of type "+ma(a));return "type_error:SafeUrl"}var Sb=/^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i;function Tb(a){if(a instanceof Ob)return a;
a="object"==typeof a&&a.ka?a.ia():String(a);Sb.test(a)||(a="about:invalid#zClosurez");return Ub(a)}var Pb={};function Ub(a){var b=new Ob;b.a=a;return b}Ub("about:blank");function Vb(){this.a="";this.g=Wb;}Vb.prototype.ka=!0;var Wb={};Vb.prototype.ia=function(){return this.a};Vb.prototype.toString=function(){return "SafeStyle{"+this.a+"}"};function Xb(){this.a="";this.j=Yb;this.h=null;}Xb.prototype.g=function(){return this.h};Xb.prototype.ka=!0;Xb.prototype.ia=function(){return this.a.toString()};Xb.prototype.toString=
function(){return "SafeHtml{"+this.a+"}"};function Zb(a){if(a instanceof Xb&&a.constructor===Xb&&a.j===Yb)return a.a;Fa("expected object of type SafeHtml, got '"+a+"' of type "+ma(a));return "type_error:SafeHtml"}var Yb={};function $b(a,b){var c=new Xb;c.a=a;c.h=b;return c}$b("<!DOCTYPE html>",0);var ac=$b("",0);$b("<br>",0);var bc=function(a){var b=!1,c;return function(){b||(c=a(),b=!0);return c}}(function(){if("undefined"===typeof document)return !1;var a=document.createElement("div"),b=document.createElement("div");
b.appendChild(document.createElement("div"));a.appendChild(b);if(!a.firstChild)return !1;b=a.firstChild.firstChild;a.innerHTML=Zb(ac);return !b.parentElement});function cc(a,b){a.src=Mb(b);if(null===ja)b:{b=n.document;if((b=b.querySelector&&b.querySelector("script[nonce]"))&&(b=b.nonce||b.getAttribute("nonce"))&&ia.test(b)){ja=b;break b}ja="";}b=ja;b&&a.setAttribute("nonce",b);}function dc(a,b){this.a=ha(a)?a:0;this.g=ha(b)?b:0;}dc.prototype.toString=function(){return "("+this.a+", "+this.g+")"};dc.prototype.ceil=
function(){this.a=Math.ceil(this.a);this.g=Math.ceil(this.g);return this};dc.prototype.floor=function(){this.a=Math.floor(this.a);this.g=Math.floor(this.g);return this};dc.prototype.round=function(){this.a=Math.round(this.a);this.g=Math.round(this.g);return this};function ec(a,b){this.width=a;this.height=b;}m=ec.prototype;m.toString=function(){return "("+this.width+" x "+this.height+")"};m.aspectRatio=function(){return this.width/this.height};m.ceil=function(){this.width=Math.ceil(this.width);this.height=
Math.ceil(this.height);return this};m.floor=function(){this.width=Math.floor(this.width);this.height=Math.floor(this.height);return this};m.round=function(){this.width=Math.round(this.width);this.height=Math.round(this.height);return this};function fc(a){return a?new gc(hc(a)):Ca||(Ca=new gc)}function ic(a,b){var c=b||document;return c.querySelectorAll&&c.querySelector?c.querySelectorAll("."+a):jc(document,a,b)}function kc(a,b){var c=b||document;if(c.getElementsByClassName)a=c.getElementsByClassName(a)[0];
else{c=document;var d=b||c;a=d.querySelectorAll&&d.querySelector&&a?d.querySelector(a?"."+a:""):jc(c,a,b)[0]||null;}return a||null}function jc(a,b,c){var d;a=c||a;if(a.querySelectorAll&&a.querySelector&&b)return a.querySelectorAll(b?"."+b:"");if(b&&a.getElementsByClassName){var e=a.getElementsByClassName(b);return e}e=a.getElementsByTagName("*");if(b){var f={};for(c=d=0;a=e[c];c++){var g=a.className;"function"==typeof g.split&&Oa(g.split(/\s+/),b)&&(f[d++]=a);}f.length=d;return f}return e}function lc(a,
b){ib(b,function(c,d){c&&"object"==typeof c&&c.ka&&(c=c.ia());"style"==d?a.style.cssText=c:"class"==d?a.className=c:"for"==d?a.htmlFor=c:mc.hasOwnProperty(d)?a.setAttribute(mc[d],c):0==d.lastIndexOf("aria-",0)||0==d.lastIndexOf("data-",0)?a.setAttribute(d,c):a[d]=c;});}var mc={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",frameborder:"frameBorder",height:"height",maxlength:"maxLength",nonce:"nonce",role:"role",rowspan:"rowSpan",type:"type",usemap:"useMap",valign:"vAlign",width:"width"};
function nc(a){return a.scrollingElement?a.scrollingElement:vb||"CSS1Compat"!=a.compatMode?a.body||a.documentElement:a.documentElement}function oc(a){a&&a.parentNode&&a.parentNode.removeChild(a);}function hc(a){return 9==a.nodeType?a:a.ownerDocument||a.document}function pc(a,b){if("textContent"in a)a.textContent=b;else if(3==a.nodeType)a.data=String(b);else if(a.firstChild&&3==a.firstChild.nodeType){for(;a.lastChild!=a.firstChild;)a.removeChild(a.lastChild);a.firstChild.data=String(b);}else{for(var c;c=
a.firstChild;)a.removeChild(c);a.appendChild(hc(a).createTextNode(String(b)));}}function qc(a,b){return b?rc(a,function(c){return !b||p(c.className)&&Oa(c.className.split(/\s+/),b)}):null}function rc(a,b){for(;a;){if(b(a))return a;a=a.parentNode;}return null}function gc(a){this.a=a||n.document||document;}gc.prototype.N=function(){return p(void 0)?this.a.getElementById(void 0):void 0};var sc="StopIteration"in n?n.StopIteration:{message:"StopIteration",stack:""};function tc(){}tc.prototype.next=
function(){throw sc;};tc.prototype.fa=function(){return this};function uc(a){if(a instanceof tc)return a;if("function"==typeof a.fa)return a.fa(!1);if(pa(a)){var b=0,c=new tc;c.next=function(){for(;;){if(b>=a.length)throw sc;if(b in a)return a[b++];b++;}};return c}throw Error("Not implemented");}function vc(a,b){if(pa(a))try{Ha(a,b,void 0);}catch(c){if(c!==sc)throw c;}else{a=uc(a);try{for(;;)b.call(void 0,a.next(),void 0,a);}catch(c$1){if(c$1!==sc)throw c$1;}}}function wc(a){if(pa(a))return Ua(a);a=
uc(a);var b=[];vc(a,function(c){b.push(c);});return b}function xc(a,b){this.g={};this.a=[];this.j=this.h=0;var c=arguments.length;if(1<c){if(c%2)throw Error("Uneven number of arguments");for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1]);}else if(a)if(a instanceof xc)for(c=a.ha(),d=0;d<c.length;d++)this.set(c[d],a.get(c[d]));else for(d in a)this.set(d,a[d]);}m=xc.prototype;m.ja=function(){yc(this);for(var a=[],b=0;b<this.a.length;b++)a.push(this.g[this.a[b]]);return a};m.ha=function(){yc(this);
return this.a.concat()};m.clear=function(){this.g={};this.j=this.h=this.a.length=0;};function yc(a){if(a.h!=a.a.length){for(var b=0,c=0;b<a.a.length;){var d=a.a[b];zc(a.g,d)&&(a.a[c++]=d);b++;}a.a.length=c;}if(a.h!=a.a.length){var e={};for(c=b=0;b<a.a.length;)d=a.a[b],zc(e,d)||(a.a[c++]=d,e[d]=1),b++;a.a.length=c;}}m.get=function(a,b){return zc(this.g,a)?this.g[a]:b};m.set=function(a,b){zc(this.g,a)||(this.h++,this.a.push(a),this.j++);this.g[a]=b;};m.forEach=function(a,b){for(var c=this.ha(),d=0;d<c.length;d++){var e=
c[d],f=this.get(e);a.call(b,f,e,this);}};m.fa=function(a){yc(this);var b=0,c=this.j,d=this,e=new tc;e.next=function(){if(c!=d.j)throw Error("The map has changed since the iterator was created");if(b>=d.a.length)throw sc;var f=d.a[b++];return a?f:d.g[f]};return e};function zc(a,b){return Object.prototype.hasOwnProperty.call(a,b)}var Ac=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/;function Bc(a,b){if(a){a=a.split("&");for(var c=
0;c<a.length;c++){var d=a[c].indexOf("="),e=null;if(0<=d){var f=a[c].substring(0,d);e=a[c].substring(d+1);}else f=a[c];b(f,e?decodeURIComponent(e.replace(/\+/g," ")):"");}}}function Cc(a,b,c,d){for(var e=c.length;0<=(b=a.indexOf(c,b))&&b<d;){var f=a.charCodeAt(b-1);if(38==f||63==f)if(f=a.charCodeAt(b+e),!f||61==f||38==f||35==f)return b;b+=e+1;}return -1}var Dc=/#|$/;function Ec(a,b){var c=a.search(Dc),d=Cc(a,0,b,c);if(0>d)return null;var e=a.indexOf("&",d);if(0>e||e>c)e=c;d+=b.length+1;return decodeURIComponent(a.substr(d,
e-d).replace(/\+/g," "))}var Fc=/[?&]($|#)/;function Gc(a,b){this.h=this.w=this.j="";this.C=null;this.i=this.g="";this.v=!1;var c;a instanceof Gc?(this.v=ha(b)?b:a.v,Hc(this,a.j),this.w=a.w,this.h=a.h,Ic(this,a.C),this.g=a.g,Jc(this,Kc(a.a)),this.i=a.i):a&&(c=String(a).match(Ac))?(this.v=!!b,Hc(this,c[1]||"",!0),this.w=Lc(c[2]||""),this.h=Lc(c[3]||"",!0),Ic(this,c[4]),this.g=Lc(c[5]||"",!0),Jc(this,c[6]||"",!0),this.i=Lc(c[7]||"")):(this.v=!!b,this.a=new Mc(null,this.v));}Gc.prototype.toString=function(){var a=
[],b=this.j;b&&a.push(Nc(b,Oc,!0),":");var c=this.h;if(c||"file"==b)a.push("//"),(b=this.w)&&a.push(Nc(b,Oc,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.C,null!=c&&a.push(":",String(c));if(c=this.g)this.h&&"/"!=c.charAt(0)&&a.push("/"),a.push(Nc(c,"/"==c.charAt(0)?Pc:Qc,!0));(c=this.a.toString())&&a.push("?",c);(c=this.i)&&a.push("#",Nc(c,Rc));return a.join("")};Gc.prototype.resolve=function(a){var b=new Gc(this),c=!!a.j;c?Hc(b,a.j):c=!!a.w;c?b.w=a.w:
c=!!a.h;c?b.h=a.h:c=null!=a.C;var d=a.g;if(c)Ic(b,a.C);else if(c=!!a.g){if("/"!=d.charAt(0))if(this.h&&!this.g)d="/"+d;else{var e=b.g.lastIndexOf("/");-1!=e&&(d=b.g.substr(0,e+1)+d);}e=d;if(".."==e||"."==e)d="";else if(-1!=e.indexOf("./")||-1!=e.indexOf("/.")){d=0==e.lastIndexOf("/",0);e=e.split("/");for(var f=[],g=0;g<e.length;){var h=e[g++];"."==h?d&&g==e.length&&f.push(""):".."==h?((1<f.length||1==f.length&&""!=f[0])&&f.pop(),d&&g==e.length&&f.push("")):(f.push(h),d=!0);}d=f.join("/");}else d=e;}c?
b.g=d:c=""!==a.a.toString();c?Jc(b,Kc(a.a)):c=!!a.i;c&&(b.i=a.i);return b};function Hc(a,b,c){a.j=c?Lc(b,!0):b;a.j&&(a.j=a.j.replace(/:$/,""));}function Ic(a,b){if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.C=b;}else a.C=null;}function Jc(a,b,c){b instanceof Mc?(a.a=b,Sc(a.a,a.v)):(c||(b=Nc(b,Tc)),a.a=new Mc(b,a.v));}function Uc(a){return a instanceof Gc?new Gc(a):new Gc(a,void 0)}function Vc(a,b){a instanceof Gc||(a=Uc(a));b instanceof Gc||(b=Uc(b));return a.resolve(b)}function Lc(a,
b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Nc(a,b,c){return p(a)?(a=encodeURI(a).replace(b,Wc),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function Wc(a){a=a.charCodeAt(0);return "%"+(a>>4&15).toString(16)+(a&15).toString(16)}var Oc=/[#\/\?@]/g,Qc=/[#\?:]/g,Pc=/[#\?]/g,Tc=/[#\?@]/g,Rc=/#/g;function Mc(a,b){this.g=this.a=null;this.h=a||null;this.j=!!b;}function Xc(a){a.a||(a.a=new xc,a.g=0,a.h&&Bc(a.h,function(b,c){a.add(decodeURIComponent(b.replace(/\+/g,
" ")),c);}));}m=Mc.prototype;m.add=function(a,b){Xc(this);this.h=null;a=Yc(this,a);var c=this.a.get(a);c||this.a.set(a,c=[]);c.push(b);this.g+=1;return this};function Zc(a,b){Xc(a);b=Yc(a,b);zc(a.a.g,b)&&(a.h=null,a.g-=a.a.get(b).length,a=a.a,zc(a.g,b)&&(delete a.g[b],a.h--,a.j++,a.a.length>2*a.h&&yc(a)));}m.clear=function(){this.a=this.h=null;this.g=0;};function $c(a,b){Xc(a);b=Yc(a,b);return zc(a.a.g,b)}m.forEach=function(a,b){Xc(this);this.a.forEach(function(c,d){Ha(c,function(e){a.call(b,e,d,this);},
this);},this);};m.ha=function(){Xc(this);for(var a=this.a.ja(),b=this.a.ha(),c=[],d=0;d<b.length;d++)for(var e=a[d],f=0;f<e.length;f++)c.push(b[d]);return c};m.ja=function(a){Xc(this);var b=[];if(p(a))$c(this,a)&&(b=Ta(b,this.a.get(Yc(this,a))));else{a=this.a.ja();for(var c=0;c<a.length;c++)b=Ta(b,a[c]);}return b};m.set=function(a,b){Xc(this);this.h=null;a=Yc(this,a);$c(this,a)&&(this.g-=this.a.get(a).length);this.a.set(a,[b]);this.g+=1;return this};m.get=function(a,b){if(!a)return b;a=this.ja(a);return 0<
a.length?String(a[0]):b};m.toString=function(){if(this.h)return this.h;if(!this.a)return "";for(var a=[],b=this.a.ha(),c=0;c<b.length;c++){var d=b[c],e=encodeURIComponent(String(d));d=this.ja(d);for(var f=0;f<d.length;f++){var g=e;""!==d[f]&&(g+="="+encodeURIComponent(String(d[f])));a.push(g);}}return this.h=a.join("&")};function Kc(a){var b=new Mc;b.h=a.h;a.a&&(b.a=new xc(a.a),b.g=a.g);return b}function Yc(a,b){b=String(b);a.j&&(b=b.toLowerCase());return b}function Sc(a,b){b&&!a.j&&(Xc(a),a.h=null,
a.a.forEach(function(c,d){var e=d.toLowerCase();d!=e&&(Zc(this,d),Zc(this,e),0<c.length&&(this.h=null,this.a.set(Yc(this,e),Ua(c)),this.g+=c.length));},a));a.j=b;}var ad={qc:!0},bd={sc:!0},cd={pc:!0},dd={rc:!0};function ed(){throw Error("Do not instantiate directly");}ed.prototype.ta=null;ed.prototype.toString=function(){return this.content};function fd(a,b,c,d){a=a(b||gd,void 0,c);d=(d||fc()).a.createElement("DIV");a=hd(a);a.match(id);a=$b(a,null);if(bc())for(;d.lastChild;)d.removeChild(d.lastChild);
d.innerHTML=Zb(a);1==d.childNodes.length&&(a=d.firstChild,1==a.nodeType&&(d=a));return d}function hd(a){if(!ra(a))return nb(String(a));if(a instanceof ed){if(a.da===ad)return a.content;if(a.da===dd)return nb(a.content)}Fa("Soy template output is unsafe for use as HTML: "+a);return "zSoyz"}var id=/^<(body|caption|col|colgroup|head|html|tr|td|th|tbody|thead|tfoot)>/i,gd={};function jd(a){if(null!=a)switch(a.ta){case 1:return 1;case -1:return -1;case 0:return 0}return null}function kd(){ed.call(this);}
t(kd,ed);kd.prototype.da=ad;function x(a){return null!=a&&a.da===ad?a:a instanceof Xb?y(Zb(a).toString(),a.g()):y(nb(String(String(a))),jd(a))}function ld(){ed.call(this);}t(ld,ed);ld.prototype.da=bd;ld.prototype.ta=1;function md(a,b){this.content=String(a);this.ta=null!=b?b:null;}t(md,ed);md.prototype.da=dd;function z(a){return new md(a,void 0)}var y=function(a){function b(c){this.content=c;}b.prototype=a.prototype;return function(c,d){c=new b(String(c));void 0!==d&&(c.ta=d);return c}}(kd),nd=function(a){function b(c){this.content=
c;}b.prototype=a.prototype;return function(c){return new b(String(c))}}(ld);function od(a){function b(){}var c={label:A("New password")};b.prototype=a;a=new b;for(var d in c)a[d]=c[d];return a}function A(a){return (a=String(a))?new md(a,void 0):""}var pd=function(a){function b(c){this.content=c;}b.prototype=a.prototype;return function(c,d){c=String(c);if(!c)return "";c=new b(c);void 0!==d&&(c.ta=d);return c}}(kd);function qd(a){return null!=a&&a.da===ad?String(String(a.content).replace(rd,"").replace(sd,
"&lt;")).replace(ud,vd):nb(String(a))}function wd(a){null!=a&&a.da===bd?a=String(a).replace(xd,yd):a instanceof Ob?a=String(Qb(a)).replace(xd,yd):(a=String(a),zd.test(a)?a=a.replace(xd,yd):(Fa("Bad value `%s` for |filterNormalizeUri",[a]),a="#zSoyz"));return a}var Ad={"\x00":"&#0;","\t":"&#9;","\n":"&#10;","\x0B":"&#11;","\f":"&#12;","\r":"&#13;"," ":"&#32;",'"':"&quot;","&":"&amp;","'":"&#39;","-":"&#45;","/":"&#47;","<":"&lt;","=":"&#61;",">":"&gt;","`":"&#96;","\u0085":"&#133;","\u00a0":"&#160;",
"\u2028":"&#8232;","\u2029":"&#8233;"};function vd(a){return Ad[a]}var Bd={"\x00":"%00","\u0001":"%01","\u0002":"%02","\u0003":"%03","\u0004":"%04","\u0005":"%05","\u0006":"%06","\u0007":"%07","\b":"%08","\t":"%09","\n":"%0A","\x0B":"%0B","\f":"%0C","\r":"%0D","\u000e":"%0E","\u000f":"%0F","\u0010":"%10","\u0011":"%11","\u0012":"%12","\u0013":"%13","\u0014":"%14","\u0015":"%15","\u0016":"%16","\u0017":"%17","\u0018":"%18","\u0019":"%19","\u001a":"%1A","\u001b":"%1B","\u001c":"%1C","\u001d":"%1D",
"\u001e":"%1E","\u001f":"%1F"," ":"%20",'"':"%22","'":"%27","(":"%28",")":"%29","<":"%3C",">":"%3E","\\":"%5C","{":"%7B","}":"%7D","\u007f":"%7F","\u0085":"%C2%85","\u00a0":"%C2%A0","\u2028":"%E2%80%A8","\u2029":"%E2%80%A9","\uff01":"%EF%BC%81","\uff03":"%EF%BC%83","\uff04":"%EF%BC%84","\uff06":"%EF%BC%86","\uff07":"%EF%BC%87","\uff08":"%EF%BC%88","\uff09":"%EF%BC%89","\uff0a":"%EF%BC%8A","\uff0b":"%EF%BC%8B","\uff0c":"%EF%BC%8C","\uff0f":"%EF%BC%8F","\uff1a":"%EF%BC%9A","\uff1b":"%EF%BC%9B","\uff1d":"%EF%BC%9D",
"\uff1f":"%EF%BC%9F","\uff20":"%EF%BC%A0","\uff3b":"%EF%BC%BB","\uff3d":"%EF%BC%BD"};function yd(a){return Bd[a]}var ud=/[\x00\x22\x27\x3c\x3e]/g,xd=/[\x00- \x22\x27-\x29\x3c\x3e\\\x7b\x7d\x7f\x85\xa0\u2028\u2029\uff01\uff03\uff04\uff06-\uff0c\uff0f\uff1a\uff1b\uff1d\uff1f\uff20\uff3b\uff3d]/g,Cd=/^(?!-*(?:expression|(?:moz-)?binding))(?:[.#]?-?(?:[_a-z0-9-]+)(?:-[_a-z0-9-]+)*-?|-?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[a-z]{1,2}|%)?|!important|)$/i,zd=/^(?![^#?]*\/(?:\.|%2E){2}(?:[\/?#]|$))(?:(?:https?|mailto):|[^&:\/?#]*(?:[\/?#]|$))/i,
rd=/<(?:!|\/?([a-zA-Z][a-zA-Z0-9:\-]*))(?:[^>'"]|"[^"]*"|'[^']*')*>/g,sd=/</g;function Dd(){return z("Enter a valid phone number")}function Ed(){return z("Something went wrong. Please try again.")}function Fd(){return z("This email already exists without any means of sign-in. Please reset the password to recover.")}function Gd(){return z("Please login again to perform this operation")}function Hd(a,b,c){this.code=Id+a;if(!(a=b)){a="";switch(this.code){case "firebaseui/merge-conflict":a+="The current anonymous user failed to upgrade. The non-anonymous credential is already associated with a different user account.";
break;default:a+=Ed();}a=z(a).toString();}this.message=a||"";this.credential=c||null;}t(Hd,Error);Hd.prototype.na=function(){return {code:this.code,message:this.message}};Hd.prototype.toJSON=function(){return this.na()};var Id="firebaseui/";function Jd(){this.V={};}function Kd(a,b,c){if(b.toLowerCase()in a.V)throw Error("Configuration "+b+" has already been defined.");a.V[b.toLowerCase()]=c;}function Ld(a,b,c){if(!(b.toLowerCase()in a.V))throw Error("Configuration "+b+" is not defined.");a.V[b.toLowerCase()]=
c;}Jd.prototype.get=function(a){if(!(a.toLowerCase()in this.V))throw Error("Configuration "+a+" is not defined.");return this.V[a.toLowerCase()]};function Md(a,b){a=a.get(b);if(!a)throw Error("Configuration "+b+" is required.");return a}function Nd(){this.g=void 0;this.a={};}m=Nd.prototype;m.set=function(a,b){Od(this,a,b,!1);};m.add=function(a,b){Od(this,a,b,!0);};function Od(a,b,c,d){for(var e=0;e<b.length;e++){var f=b.charAt(e);a.a[f]||(a.a[f]=new Nd);a=a.a[f];}if(d&&void 0!==a.g)throw Error('The collection already contains the key "'+
b+'"');a.g=c;}m.get=function(a){a:{for(var b=this,c=0;c<a.length;c++)if(b=b.a[a.charAt(c)],!b){a=void 0;break a}a=b;}return a?a.g:void 0};m.ja=function(){var a=[];Pd(this,a);return a};function Pd(a,b){void 0!==a.g&&b.push(a.g);for(var c in a.a)Pd(a.a[c],b);}m.ha=function(){var a=[];Qd(this,"",a);return a};function Qd(a,b,c){void 0!==a.g&&c.push(b);for(var d in a.a)Qd(a.a[d],b+d,c);}m.clear=function(){this.a={};this.g=void 0;};function Rd(a){this.a=a;this.g=new Nd;for(a=0;a<this.a.length;a++){var b=this.g.get("+"+
this.a[a].b);b?b.push(this.a[a]):this.g.add("+"+this.a[a].b,[this.a[a]]);}}function Sd(a,b){a=a.g;var c={},d=0;void 0!==a.g&&(c[d]=a.g);for(;d<b.length;d++){var e=b.charAt(d);if(!(e in a.a))break;a=a.a[e];void 0!==a.g&&(c[d]=a.g);}for(var f in c)if(c.hasOwnProperty(f))return c[f];return []}function Td(a){for(var b=0;b<Ud.length;b++)if(Ud[b].c===a)return Ud[b];return null}function Vd(a){a=a.toUpperCase();for(var b=[],c=0;c<Ud.length;c++)Ud[c].f===a&&b.push(Ud[c]);return b}function Wd(a){if(0<a.length&&
"+"==a.charAt(0)){a=a.substring(1);for(var b=[],c=0;c<Ud.length;c++)Ud[c].b==a&&b.push(Ud[c]);a=b;}else a=Vd(a);return a}function Xd(a){a.sort(function(b,c){return b.name.localeCompare(c.name,"en")});}var Ud=[{name:"Afghanistan",c:"93-AF-0",b:"93",f:"AF"},{name:"\u00c5land Islands",c:"358-AX-0",b:"358",f:"AX"},{name:"Albania",c:"355-AL-0",b:"355",f:"AL"},{name:"Algeria",c:"213-DZ-0",b:"213",f:"DZ"},{name:"American Samoa",c:"1-AS-0",b:"1",f:"AS"},{name:"Andorra",c:"376-AD-0",b:"376",f:"AD"},{name:"Angola",
c:"244-AO-0",b:"244",f:"AO"},{name:"Anguilla",c:"1-AI-0",b:"1",f:"AI"},{name:"Antigua and Barbuda",c:"1-AG-0",b:"1",f:"AG"},{name:"Argentina",c:"54-AR-0",b:"54",f:"AR"},{name:"Armenia",c:"374-AM-0",b:"374",f:"AM"},{name:"Aruba",c:"297-AW-0",b:"297",f:"AW"},{name:"Ascension Island",c:"247-AC-0",b:"247",f:"AC"},{name:"Australia",c:"61-AU-0",b:"61",f:"AU"},{name:"Austria",c:"43-AT-0",b:"43",f:"AT"},{name:"Azerbaijan",c:"994-AZ-0",b:"994",f:"AZ"},{name:"Bahamas",c:"1-BS-0",b:"1",f:"BS"},{name:"Bahrain",
c:"973-BH-0",b:"973",f:"BH"},{name:"Bangladesh",c:"880-BD-0",b:"880",f:"BD"},{name:"Barbados",c:"1-BB-0",b:"1",f:"BB"},{name:"Belarus",c:"375-BY-0",b:"375",f:"BY"},{name:"Belgium",c:"32-BE-0",b:"32",f:"BE"},{name:"Belize",c:"501-BZ-0",b:"501",f:"BZ"},{name:"Benin",c:"229-BJ-0",b:"229",f:"BJ"},{name:"Bermuda",c:"1-BM-0",b:"1",f:"BM"},{name:"Bhutan",c:"975-BT-0",b:"975",f:"BT"},{name:"Bolivia",c:"591-BO-0",b:"591",f:"BO"},{name:"Bosnia and Herzegovina",c:"387-BA-0",b:"387",f:"BA"},{name:"Botswana",
c:"267-BW-0",b:"267",f:"BW"},{name:"Brazil",c:"55-BR-0",b:"55",f:"BR"},{name:"British Indian Ocean Territory",c:"246-IO-0",b:"246",f:"IO"},{name:"British Virgin Islands",c:"1-VG-0",b:"1",f:"VG"},{name:"Brunei",c:"673-BN-0",b:"673",f:"BN"},{name:"Bulgaria",c:"359-BG-0",b:"359",f:"BG"},{name:"Burkina Faso",c:"226-BF-0",b:"226",f:"BF"},{name:"Burundi",c:"257-BI-0",b:"257",f:"BI"},{name:"Cambodia",c:"855-KH-0",b:"855",f:"KH"},{name:"Cameroon",c:"237-CM-0",b:"237",f:"CM"},{name:"Canada",c:"1-CA-0",b:"1",
f:"CA"},{name:"Cape Verde",c:"238-CV-0",b:"238",f:"CV"},{name:"Caribbean Netherlands",c:"599-BQ-0",b:"599",f:"BQ"},{name:"Cayman Islands",c:"1-KY-0",b:"1",f:"KY"},{name:"Central African Republic",c:"236-CF-0",b:"236",f:"CF"},{name:"Chad",c:"235-TD-0",b:"235",f:"TD"},{name:"Chile",c:"56-CL-0",b:"56",f:"CL"},{name:"China",c:"86-CN-0",b:"86",f:"CN"},{name:"Christmas Island",c:"61-CX-0",b:"61",f:"CX"},{name:"Cocos [Keeling] Islands",c:"61-CC-0",b:"61",f:"CC"},{name:"Colombia",c:"57-CO-0",b:"57",f:"CO"},
{name:"Comoros",c:"269-KM-0",b:"269",f:"KM"},{name:"Democratic Republic Congo",c:"243-CD-0",b:"243",f:"CD"},{name:"Republic of Congo",c:"242-CG-0",b:"242",f:"CG"},{name:"Cook Islands",c:"682-CK-0",b:"682",f:"CK"},{name:"Costa Rica",c:"506-CR-0",b:"506",f:"CR"},{name:"C\u00f4te d'Ivoire",c:"225-CI-0",b:"225",f:"CI"},{name:"Croatia",c:"385-HR-0",b:"385",f:"HR"},{name:"Cuba",c:"53-CU-0",b:"53",f:"CU"},{name:"Cura\u00e7ao",c:"599-CW-0",b:"599",f:"CW"},{name:"Cyprus",c:"357-CY-0",b:"357",f:"CY"},{name:"Czech Republic",
c:"420-CZ-0",b:"420",f:"CZ"},{name:"Denmark",c:"45-DK-0",b:"45",f:"DK"},{name:"Djibouti",c:"253-DJ-0",b:"253",f:"DJ"},{name:"Dominica",c:"1-DM-0",b:"1",f:"DM"},{name:"Dominican Republic",c:"1-DO-0",b:"1",f:"DO"},{name:"East Timor",c:"670-TL-0",b:"670",f:"TL"},{name:"Ecuador",c:"593-EC-0",b:"593",f:"EC"},{name:"Egypt",c:"20-EG-0",b:"20",f:"EG"},{name:"El Salvador",c:"503-SV-0",b:"503",f:"SV"},{name:"Equatorial Guinea",c:"240-GQ-0",b:"240",f:"GQ"},{name:"Eritrea",c:"291-ER-0",b:"291",f:"ER"},{name:"Estonia",
c:"372-EE-0",b:"372",f:"EE"},{name:"Ethiopia",c:"251-ET-0",b:"251",f:"ET"},{name:"Falkland Islands [Islas Malvinas]",c:"500-FK-0",b:"500",f:"FK"},{name:"Faroe Islands",c:"298-FO-0",b:"298",f:"FO"},{name:"Fiji",c:"679-FJ-0",b:"679",f:"FJ"},{name:"Finland",c:"358-FI-0",b:"358",f:"FI"},{name:"France",c:"33-FR-0",b:"33",f:"FR"},{name:"French Guiana",c:"594-GF-0",b:"594",f:"GF"},{name:"French Polynesia",c:"689-PF-0",b:"689",f:"PF"},{name:"Gabon",c:"241-GA-0",b:"241",f:"GA"},{name:"Gambia",c:"220-GM-0",
b:"220",f:"GM"},{name:"Georgia",c:"995-GE-0",b:"995",f:"GE"},{name:"Germany",c:"49-DE-0",b:"49",f:"DE"},{name:"Ghana",c:"233-GH-0",b:"233",f:"GH"},{name:"Gibraltar",c:"350-GI-0",b:"350",f:"GI"},{name:"Greece",c:"30-GR-0",b:"30",f:"GR"},{name:"Greenland",c:"299-GL-0",b:"299",f:"GL"},{name:"Grenada",c:"1-GD-0",b:"1",f:"GD"},{name:"Guadeloupe",c:"590-GP-0",b:"590",f:"GP"},{name:"Guam",c:"1-GU-0",b:"1",f:"GU"},{name:"Guatemala",c:"502-GT-0",b:"502",f:"GT"},{name:"Guernsey",c:"44-GG-0",b:"44",f:"GG"},
{name:"Guinea Conakry",c:"224-GN-0",b:"224",f:"GN"},{name:"Guinea-Bissau",c:"245-GW-0",b:"245",f:"GW"},{name:"Guyana",c:"592-GY-0",b:"592",f:"GY"},{name:"Haiti",c:"509-HT-0",b:"509",f:"HT"},{name:"Heard Island and McDonald Islands",c:"672-HM-0",b:"672",f:"HM"},{name:"Honduras",c:"504-HN-0",b:"504",f:"HN"},{name:"Hong Kong",c:"852-HK-0",b:"852",f:"HK"},{name:"Hungary",c:"36-HU-0",b:"36",f:"HU"},{name:"Iceland",c:"354-IS-0",b:"354",f:"IS"},{name:"India",c:"91-IN-0",b:"91",f:"IN"},{name:"Indonesia",
c:"62-ID-0",b:"62",f:"ID"},{name:"Iran",c:"98-IR-0",b:"98",f:"IR"},{name:"Iraq",c:"964-IQ-0",b:"964",f:"IQ"},{name:"Ireland",c:"353-IE-0",b:"353",f:"IE"},{name:"Isle of Man",c:"44-IM-0",b:"44",f:"IM"},{name:"Israel",c:"972-IL-0",b:"972",f:"IL"},{name:"Italy",c:"39-IT-0",b:"39",f:"IT"},{name:"Jamaica",c:"1-JM-0",b:"1",f:"JM"},{name:"Japan",c:"81-JP-0",b:"81",f:"JP"},{name:"Jersey",c:"44-JE-0",b:"44",f:"JE"},{name:"Jordan",c:"962-JO-0",b:"962",f:"JO"},{name:"Kazakhstan",c:"7-KZ-0",b:"7",f:"KZ"},{name:"Kenya",
c:"254-KE-0",b:"254",f:"KE"},{name:"Kiribati",c:"686-KI-0",b:"686",f:"KI"},{name:"Kosovo",c:"377-XK-0",b:"377",f:"XK"},{name:"Kosovo",c:"381-XK-0",b:"381",f:"XK"},{name:"Kosovo",c:"386-XK-0",b:"386",f:"XK"},{name:"Kuwait",c:"965-KW-0",b:"965",f:"KW"},{name:"Kyrgyzstan",c:"996-KG-0",b:"996",f:"KG"},{name:"Laos",c:"856-LA-0",b:"856",f:"LA"},{name:"Latvia",c:"371-LV-0",b:"371",f:"LV"},{name:"Lebanon",c:"961-LB-0",b:"961",f:"LB"},{name:"Lesotho",c:"266-LS-0",b:"266",f:"LS"},{name:"Liberia",c:"231-LR-0",
b:"231",f:"LR"},{name:"Libya",c:"218-LY-0",b:"218",f:"LY"},{name:"Liechtenstein",c:"423-LI-0",b:"423",f:"LI"},{name:"Lithuania",c:"370-LT-0",b:"370",f:"LT"},{name:"Luxembourg",c:"352-LU-0",b:"352",f:"LU"},{name:"Macau",c:"853-MO-0",b:"853",f:"MO"},{name:"Macedonia",c:"389-MK-0",b:"389",f:"MK"},{name:"Madagascar",c:"261-MG-0",b:"261",f:"MG"},{name:"Malawi",c:"265-MW-0",b:"265",f:"MW"},{name:"Malaysia",c:"60-MY-0",b:"60",f:"MY"},{name:"Maldives",c:"960-MV-0",b:"960",f:"MV"},{name:"Mali",c:"223-ML-0",
b:"223",f:"ML"},{name:"Malta",c:"356-MT-0",b:"356",f:"MT"},{name:"Marshall Islands",c:"692-MH-0",b:"692",f:"MH"},{name:"Martinique",c:"596-MQ-0",b:"596",f:"MQ"},{name:"Mauritania",c:"222-MR-0",b:"222",f:"MR"},{name:"Mauritius",c:"230-MU-0",b:"230",f:"MU"},{name:"Mayotte",c:"262-YT-0",b:"262",f:"YT"},{name:"Mexico",c:"52-MX-0",b:"52",f:"MX"},{name:"Micronesia",c:"691-FM-0",b:"691",f:"FM"},{name:"Moldova",c:"373-MD-0",b:"373",f:"MD"},{name:"Monaco",c:"377-MC-0",b:"377",f:"MC"},{name:"Mongolia",c:"976-MN-0",
b:"976",f:"MN"},{name:"Montenegro",c:"382-ME-0",b:"382",f:"ME"},{name:"Montserrat",c:"1-MS-0",b:"1",f:"MS"},{name:"Morocco",c:"212-MA-0",b:"212",f:"MA"},{name:"Mozambique",c:"258-MZ-0",b:"258",f:"MZ"},{name:"Myanmar [Burma]",c:"95-MM-0",b:"95",f:"MM"},{name:"Namibia",c:"264-NA-0",b:"264",f:"NA"},{name:"Nauru",c:"674-NR-0",b:"674",f:"NR"},{name:"Nepal",c:"977-NP-0",b:"977",f:"NP"},{name:"Netherlands",c:"31-NL-0",b:"31",f:"NL"},{name:"New Caledonia",c:"687-NC-0",b:"687",f:"NC"},{name:"New Zealand",
c:"64-NZ-0",b:"64",f:"NZ"},{name:"Nicaragua",c:"505-NI-0",b:"505",f:"NI"},{name:"Niger",c:"227-NE-0",b:"227",f:"NE"},{name:"Nigeria",c:"234-NG-0",b:"234",f:"NG"},{name:"Niue",c:"683-NU-0",b:"683",f:"NU"},{name:"Norfolk Island",c:"672-NF-0",b:"672",f:"NF"},{name:"North Korea",c:"850-KP-0",b:"850",f:"KP"},{name:"Northern Mariana Islands",c:"1-MP-0",b:"1",f:"MP"},{name:"Norway",c:"47-NO-0",b:"47",f:"NO"},{name:"Oman",c:"968-OM-0",b:"968",f:"OM"},{name:"Pakistan",c:"92-PK-0",b:"92",f:"PK"},{name:"Palau",
c:"680-PW-0",b:"680",f:"PW"},{name:"Palestinian Territories",c:"970-PS-0",b:"970",f:"PS"},{name:"Panama",c:"507-PA-0",b:"507",f:"PA"},{name:"Papua New Guinea",c:"675-PG-0",b:"675",f:"PG"},{name:"Paraguay",c:"595-PY-0",b:"595",f:"PY"},{name:"Peru",c:"51-PE-0",b:"51",f:"PE"},{name:"Philippines",c:"63-PH-0",b:"63",f:"PH"},{name:"Poland",c:"48-PL-0",b:"48",f:"PL"},{name:"Portugal",c:"351-PT-0",b:"351",f:"PT"},{name:"Puerto Rico",c:"1-PR-0",b:"1",f:"PR"},{name:"Qatar",c:"974-QA-0",b:"974",f:"QA"},{name:"R\u00e9union",
c:"262-RE-0",b:"262",f:"RE"},{name:"Romania",c:"40-RO-0",b:"40",f:"RO"},{name:"Russia",c:"7-RU-0",b:"7",f:"RU"},{name:"Rwanda",c:"250-RW-0",b:"250",f:"RW"},{name:"Saint Barth\u00e9lemy",c:"590-BL-0",b:"590",f:"BL"},{name:"Saint Helena",c:"290-SH-0",b:"290",f:"SH"},{name:"St. Kitts",c:"1-KN-0",b:"1",f:"KN"},{name:"St. Lucia",c:"1-LC-0",b:"1",f:"LC"},{name:"Saint Martin",c:"590-MF-0",b:"590",f:"MF"},{name:"Saint Pierre and Miquelon",c:"508-PM-0",b:"508",f:"PM"},{name:"St. Vincent",c:"1-VC-0",b:"1",
f:"VC"},{name:"Samoa",c:"685-WS-0",b:"685",f:"WS"},{name:"San Marino",c:"378-SM-0",b:"378",f:"SM"},{name:"S\u00e3o Tom\u00e9 and Pr\u00edncipe",c:"239-ST-0",b:"239",f:"ST"},{name:"Saudi Arabia",c:"966-SA-0",b:"966",f:"SA"},{name:"Senegal",c:"221-SN-0",b:"221",f:"SN"},{name:"Serbia",c:"381-RS-0",b:"381",f:"RS"},{name:"Seychelles",c:"248-SC-0",b:"248",f:"SC"},{name:"Sierra Leone",c:"232-SL-0",b:"232",f:"SL"},{name:"Singapore",c:"65-SG-0",b:"65",f:"SG"},{name:"Sint Maarten",c:"1-SX-0",b:"1",f:"SX"},
{name:"Slovakia",c:"421-SK-0",b:"421",f:"SK"},{name:"Slovenia",c:"386-SI-0",b:"386",f:"SI"},{name:"Solomon Islands",c:"677-SB-0",b:"677",f:"SB"},{name:"Somalia",c:"252-SO-0",b:"252",f:"SO"},{name:"South Africa",c:"27-ZA-0",b:"27",f:"ZA"},{name:"South Georgia and the South Sandwich Islands",c:"500-GS-0",b:"500",f:"GS"},{name:"South Korea",c:"82-KR-0",b:"82",f:"KR"},{name:"South Sudan",c:"211-SS-0",b:"211",f:"SS"},{name:"Spain",c:"34-ES-0",b:"34",f:"ES"},{name:"Sri Lanka",c:"94-LK-0",b:"94",f:"LK"},
{name:"Sudan",c:"249-SD-0",b:"249",f:"SD"},{name:"Suriname",c:"597-SR-0",b:"597",f:"SR"},{name:"Svalbard and Jan Mayen",c:"47-SJ-0",b:"47",f:"SJ"},{name:"Swaziland",c:"268-SZ-0",b:"268",f:"SZ"},{name:"Sweden",c:"46-SE-0",b:"46",f:"SE"},{name:"Switzerland",c:"41-CH-0",b:"41",f:"CH"},{name:"Syria",c:"963-SY-0",b:"963",f:"SY"},{name:"Taiwan",c:"886-TW-0",b:"886",f:"TW"},{name:"Tajikistan",c:"992-TJ-0",b:"992",f:"TJ"},{name:"Tanzania",c:"255-TZ-0",b:"255",f:"TZ"},{name:"Thailand",c:"66-TH-0",b:"66",f:"TH"},
{name:"Togo",c:"228-TG-0",b:"228",f:"TG"},{name:"Tokelau",c:"690-TK-0",b:"690",f:"TK"},{name:"Tonga",c:"676-TO-0",b:"676",f:"TO"},{name:"Trinidad/Tobago",c:"1-TT-0",b:"1",f:"TT"},{name:"Tunisia",c:"216-TN-0",b:"216",f:"TN"},{name:"Turkey",c:"90-TR-0",b:"90",f:"TR"},{name:"Turkmenistan",c:"993-TM-0",b:"993",f:"TM"},{name:"Turks and Caicos Islands",c:"1-TC-0",b:"1",f:"TC"},{name:"Tuvalu",c:"688-TV-0",b:"688",f:"TV"},{name:"U.S. Virgin Islands",c:"1-VI-0",b:"1",f:"VI"},{name:"Uganda",c:"256-UG-0",b:"256",
f:"UG"},{name:"Ukraine",c:"380-UA-0",b:"380",f:"UA"},{name:"United Arab Emirates",c:"971-AE-0",b:"971",f:"AE"},{name:"United Kingdom",c:"44-GB-0",b:"44",f:"GB"},{name:"United States",c:"1-US-0",b:"1",f:"US"},{name:"Uruguay",c:"598-UY-0",b:"598",f:"UY"},{name:"Uzbekistan",c:"998-UZ-0",b:"998",f:"UZ"},{name:"Vanuatu",c:"678-VU-0",b:"678",f:"VU"},{name:"Vatican City",c:"379-VA-0",b:"379",f:"VA"},{name:"Venezuela",c:"58-VE-0",b:"58",f:"VE"},{name:"Vietnam",c:"84-VN-0",b:"84",f:"VN"},{name:"Wallis and Futuna",
c:"681-WF-0",b:"681",f:"WF"},{name:"Western Sahara",c:"212-EH-0",b:"212",f:"EH"},{name:"Yemen",c:"967-YE-0",b:"967",f:"YE"},{name:"Zambia",c:"260-ZM-0",b:"260",f:"ZM"},{name:"Zimbabwe",c:"263-ZW-0",b:"263",f:"ZW"}];Xd(Ud);var Yd=new Rd(Ud);function Zd(a,b){this.a=a;this.va=b;}function $d(a){a=Xa(a);var b=Sd(Yd,a);return 0<b.length?new Zd("1"==b[0].b?"1-US-0":b[0].c,Xa(a.substr(b[0].b.length+1))):null}function ae(a){var b=Td(a.a);if(!b)throw Error("Country ID "+a.a+" not found.");return "+"+b.b+a.va}
function be(a,b){for(var c=0;c<a.length;c++)if(!Oa(ce,a[c])&&(null!==de&&a[c]in de||Oa(b,a[c])))return a[c];return null}var ce=["emailLink","password","phone"],de={"facebook.com":"FacebookAuthProvider","github.com":"GithubAuthProvider","google.com":"GoogleAuthProvider",password:"EmailAuthProvider","twitter.com":"TwitterAuthProvider",phone:"PhoneAuthProvider"};var ee=Object.freeze||function(a){return a};function fe(a,b,c){this.reset(a,b,c,void 0,void 0);}fe.prototype.a=null;fe.prototype.reset=
function(a,b,c,d,e){this.h=d||za();this.j=a;this.i=b;this.g=c;delete this.a;};function he(a){this.i=a;this.a=this.h=this.j=this.g=null;}function ie(a,b){this.name=a;this.value=b;}ie.prototype.toString=function(){return this.name};var je=new ie("SEVERE",1E3),ke=new ie("WARNING",900),le=new ie("CONFIG",700);function me(a){if(a.j)return a.j;if(a.g)return me(a.g);Fa("Root logger has no level set.");return null}he.prototype.log=function(a,b,c){if(a.value>=me(this).value)for(qa(b)&&
(b=b()),a=new fe(a,String(b),this.i),c&&(a.a=c),c=this;c;){var d=c,e=a;if(d.a)for(var f=0;b=d.a[f];f++)b(e);c=c.g;}};var ne={},oe=null;function pe(){oe||(oe=new he(""),ne[""]=oe,oe.j=le);}function qe(a){pe();var b;if(!(b=ne[a])){b=new he(a);var c=a.lastIndexOf("."),d=a.substr(c+1);c=qe(a.substr(0,c));c.h||(c.h={});c.h[d]=b;b.g=c;ne[a]=b;}return b}function re(){this.a=za();}var se=null;re.prototype.set=function(a){this.a=a;};re.prototype.reset=function(){this.set(za());};re.prototype.get=function(){return this.a};
function te(a){this.j=a||"";se||(se=new re);this.i=se;}te.prototype.a=!0;te.prototype.g=!0;te.prototype.h=!1;function ue(a){return 10>a?"0"+a:String(a)}function ve(a,b){a=(a.h-b)/1E3;b=a.toFixed(3);var c=0;if(1>a)c=2;else for(;100>a;)c++,a*=10;for(;0<c--;)b=" "+b;return b}function we(a){te.call(this,a);}t(we,te);function xe(a,b){var c=[];c.push(a.j," ");if(a.g){var d=new Date(b.h);c.push("[",ue(d.getFullYear()-2E3)+ue(d.getMonth()+1)+ue(d.getDate())+" "+ue(d.getHours())+":"+ue(d.getMinutes())+":"+ue(d.getSeconds())+
"."+ue(Math.floor(d.getMilliseconds()/10)),"] ");}c.push("[",ve(b,a.i.get()),"s] ");c.push("[",b.g,"] ");c.push(b.i);a.h&&(b=b.a)&&c.push("\n",b instanceof Error?b.message:b.toString());a.a&&c.push("\n");return c.join("")}function ye(){this.i=q(this.h,this);this.a=new we;this.a.g=!1;this.a.h=!1;this.g=this.a.a=!1;this.j={};}ye.prototype.h=function(a){function b(f){if(f){if(f.value>=je.value)return "error";if(f.value>=ke.value)return "warn";if(f.value>=le.value)return "log"}return "debug"}if(!this.j[a.g]){var c=
xe(this.a,a),d=ze;if(d){var e=b(a.j);Ae(d,e,c,a.a);}}};var ze=n.console;function Ae(a,b,c,d){if(a[b])a[b](c,d||"");else a.log(c,d||"");}function Be(a,b){var c=Ce;c&&c.log(je,a,b);}var Ce;Ce=qe("firebaseui");var De=new ye;if(1!=De.g){var Ee;pe();Ee=oe;var Fe=De.i;Ee.a||(Ee.a=[]);Ee.a.push(Fe);De.g=!0;}function Ge(a){var b=Ce;b&&b.log(ke,a,void 0);}function He(a){if(!a)return !1;try{return !!a.$goog_Thenable}catch(b){return !1}}function Ie(a,b){this.h=a;this.j=b;this.g=0;this.a=null;}Ie.prototype.get=function(){if(0<
this.g){this.g--;var a=this.a;this.a=a.next;a.next=null;}else a=this.h();return a};function Je(a,b){a.j(b);100>a.g&&(a.g++,b.next=a.a,a.a=b);}function Ke(){this.g=this.a=null;}var Me=new Ie(function(){return new Le},function(a){a.reset();});Ke.prototype.add=function(a,b){var c=Me.get();c.set(a,b);this.g?this.g.next=c:this.a=c;this.g=c;};function Ne(){var a=Oe,b=null;a.a&&(b=a.a,a.a=a.a.next,a.a||(a.g=null),b.next=null);return b}function Le(){this.next=this.g=this.a=null;}Le.prototype.set=function(a,b){this.a=
a;this.g=b;this.next=null;};Le.prototype.reset=function(){this.next=this.g=this.a=null;};function Pe(a){n.setTimeout(function(){throw a;},0);}var Qe;function Re(){var a=n.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&!u("Presto")&&(a=function(){var e=document.createElement("IFRAME");e.style.display="none";e.src="";document.documentElement.appendChild(e);var f=e.contentWindow;e=f.document;e.open();e.write("");e.close();var g="callImmediate"+
Math.random(),h="file:"==f.location.protocol?"*":f.location.protocol+"//"+f.location.host;e=q(function(k){if(("*"==h||k.origin==h)&&k.data==g)this.port1.onmessage();},this);f.addEventListener("message",e,!1);this.port1={};this.port2={postMessage:function(){f.postMessage(g,h);}};});if("undefined"!==typeof a&&!u("Trident")&&!u("MSIE")){var b=new a,c={},d=c;b.port1.onmessage=function(){if(ha(c.next)){c=c.next;var e=c.ab;c.ab=null;e();}};return function(e){d.next={ab:e};d=d.next;b.port2.postMessage(0);}}return "undefined"!==
typeof document&&"onreadystatechange"in document.createElement("SCRIPT")?function(e){var f=document.createElement("SCRIPT");f.onreadystatechange=function(){f.onreadystatechange=null;f.parentNode.removeChild(f);f=null;e();e=null;};document.documentElement.appendChild(f);}:function(e){n.setTimeout(e,0);}}function Se(a,b){Te||Ue();Ve||(Te(),Ve=!0);Oe.add(a,b);}var Te;function Ue(){if(n.Promise&&n.Promise.resolve){var a=n.Promise.resolve(void 0);Te=function(){a.then(We);};}else Te=function(){var b=We;!qa(n.setImmediate)||
n.Window&&n.Window.prototype&&!u("Edge")&&n.Window.prototype.setImmediate==n.setImmediate?(Qe||(Qe=Re()),Qe(b)):n.setImmediate(b);};}var Ve=!1,Oe=new Ke;function We(){for(var a;a=Ne();){try{a.a.call(a.g);}catch(b){Pe(b);}Je(Me,a);}Ve=!1;}function Xe(a){this.a=Ye;this.w=void 0;this.j=this.g=this.h=null;this.i=this.v=!1;if(a!=ka)try{var b=this;a.call(void 0,function(c){Ze(b,$e,c);},function(c){if(!(c instanceof af))try{if(c instanceof Error)throw c;throw Error("Promise rejected.");}catch(d){}Ze(b,bf,c);});}catch(c){Ze(this,
bf,c);}}var Ye=0,$e=2,bf=3;function cf(){this.next=this.context=this.g=this.h=this.a=null;this.j=!1;}cf.prototype.reset=function(){this.context=this.g=this.h=this.a=null;this.j=!1;};var df=new Ie(function(){return new cf},function(a){a.reset();});function ef(a,b,c){var d=df.get();d.h=a;d.g=b;d.context=c;return d}function B(a){if(a instanceof Xe)return a;var b=new Xe(ka);Ze(b,$e,a);return b}function ff(a){return new Xe(function(b,c){c(a);})}Xe.prototype.then=function(a,b,c){return gf(this,qa(a)?a:null,
qa(b)?b:null,c)};Xe.prototype.$goog_Thenable=!0;function hf(a,b){return gf(a,null,b,void 0)}Xe.prototype.cancel=function(a){this.a==Ye&&Se(function(){var b=new af(a);jf(this,b);},this);};function jf(a,b){if(a.a==Ye)if(a.h){var c=a.h;if(c.g){for(var d=0,e=null,f=null,g=c.g;g&&(g.j||(d++,g.a==a&&(e=g),!(e&&1<d)));g=g.next)e||(f=g);e&&(c.a==Ye&&1==d?jf(c,b):(f?(d=f,d.next==c.j&&(c.j=d),d.next=d.next.next):kf(c),lf(c,e,bf,b)));}a.h=null;}else Ze(a,bf,b);}function mf(a,b){a.g||a.a!=$e&&a.a!=bf||nf(a);a.j?a.j.next=
b:a.g=b;a.j=b;}function gf(a,b,c,d){var e=ef(null,null,null);e.a=new Xe(function(f,g){e.h=b?function(h){try{var k=b.call(d,h);f(k);}catch(l){g(l);}}:f;e.g=c?function(h){try{var k=c.call(d,h);!ha(k)&&h instanceof af?g(h):f(k);}catch(l){g(l);}}:g;});e.a.h=a;mf(a,e);return e.a}Xe.prototype.F=function(a){this.a=Ye;Ze(this,$e,a);};Xe.prototype.I=function(a){this.a=Ye;Ze(this,bf,a);};function Ze(a,b,c){if(a.a==Ye){a===c&&(b=bf,c=new TypeError("Promise cannot resolve to itself"));a.a=1;a:{var d=c,e=a.F,f=a.I;if(d instanceof
Xe){mf(d,ef(e||ka,f||null,a));var g=!0;}else if(He(d))d.then(e,f,a),g=!0;else{if(ra(d))try{var h=d.then;if(qa(h)){of(d,h,e,f,a);g=!0;break a}}catch(k){f.call(a,k);g=!0;break a}g=!1;}}g||(a.w=c,a.a=b,a.h=null,nf(a),b!=bf||c instanceof af||pf(a,c));}}function of(a,b,c,d,e){function f(k){h||(h=!0,d.call(e,k));}function g(k){h||(h=!0,c.call(e,k));}var h=!1;try{b.call(a,g,f);}catch(k){f(k);}}function nf(a){a.v||(a.v=!0,Se(a.C,a));}function kf(a){var b=null;a.g&&(b=a.g,a.g=b.next,b.next=null);a.g||(a.j=null);return b}
Xe.prototype.C=function(){for(var a;a=kf(this);)lf(this,a,this.a,this.w);this.v=!1;};function lf(a,b,c,d){if(c==bf&&b.g&&!b.j)for(;a&&a.i;a=a.h)a.i=!1;if(b.a)b.a.h=null,qf(b,c,d);else try{b.j?b.h.call(b.context):qf(b,c,d);}catch(e){rf.call(null,e);}Je(df,b);}function qf(a,b,c){b==$e?a.h.call(a.context,c):a.g&&a.g.call(a.context,c);}function pf(a,b){a.i=!0;Se(function(){a.i&&rf.call(null,b);});}var rf=Pe;function af(a){Ba.call(this,a);}t(af,Ba);af.prototype.name="cancel";var sf=!w||9<=Number(Eb),tf=w&&!Db("9"),
uf=function(){if(!n.addEventListener||!Object.defineProperty)return !1;var a=!1,b=Object.defineProperty({},"passive",{get:function(){a=!0;}});try{n.addEventListener("test",ka,b),n.removeEventListener("test",ka,b);}catch(c){}return a}();function vf(){this.O=this.O;this.C=this.C;}var wf=0;vf.prototype.O=!1;vf.prototype.m=function(){if(!this.O&&(this.O=!0,this.l(),0!=wf)){var a=this[ta]||(this[ta]=++ua);}};function yf(a,b){a.O?ha(void 0)?b.call(void 0):b():(a.C||(a.C=[]),a.C.push(ha(void 0)?q(b,void 0):b));}vf.prototype.l=function(){if(this.C)for(;this.C.length;)this.C.shift()();};function zf(a){a&&"function"==typeof a.m&&a.m();}function Af(a,b){this.type=a;this.g=this.target=b;this.h=!1;this.ib=!0;}Af.prototype.stopPropagation=function(){this.h=
!0;};Af.prototype.preventDefault=function(){this.ib=!1;};function Bf(a,b){Af.call(this,a?a.type:"");this.relatedTarget=this.g=this.target=null;this.button=this.screenY=this.screenX=this.clientY=this.clientX=0;this.key="";this.j=this.keyCode=0;this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1;this.pointerId=0;this.pointerType="";this.a=null;if(a){var c=this.type=a.type,d=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement;this.g=b;if(b=a.relatedTarget){if(ub){a:{try{ob(b.nodeName);
var e=!0;break a}catch(f){}e=!1;}e||(b=null);}}else"mouseover"==c?b=a.fromElement:"mouseout"==c&&(b=a.toElement);this.relatedTarget=b;d?(this.clientX=void 0!==d.clientX?d.clientX:d.pageX,this.clientY=void 0!==d.clientY?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=d.screenY||0):(this.clientX=void 0!==a.clientX?a.clientX:a.pageX,this.clientY=void 0!==a.clientY?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0);this.button=a.button;this.keyCode=a.keyCode||0;this.key=a.key||
"";this.j=a.charCode||("keypress"==c?a.keyCode:0);this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.pointerId=a.pointerId||0;this.pointerType=p(a.pointerType)?a.pointerType:Cf[a.pointerType]||"";this.a=a;a.defaultPrevented&&this.preventDefault();}}t(Bf,Af);var Cf=ee({2:"touch",3:"pen",4:"mouse"});Bf.prototype.stopPropagation=function(){Bf.o.stopPropagation.call(this);this.a.stopPropagation?this.a.stopPropagation():this.a.cancelBubble=!0;};Bf.prototype.preventDefault=
function(){Bf.o.preventDefault.call(this);var a=this.a;if(a.preventDefault)a.preventDefault();else if(a.returnValue=!1,tf)try{if(a.ctrlKey||112<=a.keyCode&&123>=a.keyCode)a.keyCode=-1;}catch(b){}};var Df="closure_listenable_"+(1E6*Math.random()|0),Ef=0;function Ff(a,b,c,d,e){this.listener=a;this.proxy=null;this.src=b;this.type=c;this.capture=!!d;this.Fa=e;this.key=++Ef;this.qa=this.Ca=!1;}function Gf(a){a.qa=!0;a.listener=null;a.proxy=null;a.src=null;a.Fa=null;}function Hf(a){this.src=a;this.a={};this.g=
0;}Hf.prototype.add=function(a,b,c,d,e){var f=a.toString();a=this.a[f];a||(a=this.a[f]=[],this.g++);var g=If(a,b,d,e);-1<g?(b=a[g],c||(b.Ca=!1)):(b=new Ff(b,this.src,f,!!d,e),b.Ca=c,a.push(b));return b};function Jf(a,b){var c=b.type;c in a.a&&Pa(a.a[c],b)&&(Gf(b),0==a.a[c].length&&(delete a.a[c],a.g--));}function If(a,b,c,d){for(var e=0;e<a.length;++e){var f=a[e];if(!f.qa&&f.listener==b&&f.capture==!!c&&f.Fa==d)return e}return -1}var Kf="closure_lm_"+(1E6*Math.random()|0),Lf={};function Nf(a,b,
c,d,e){if(d&&d.once)return Of(a,b,c,d,e);if(oa(b)){for(var f=0;f<b.length;f++)Nf(a,b[f],c,d,e);return null}c=Pf(c);return a&&a[Df]?a.F.add(String(b),c,!1,ra(d)?!!d.capture:!!d,e):Qf(a,b,c,!1,d,e)}function Qf(a,b,c,d,e,f){if(!b)throw Error("Invalid event type");var g=ra(e)?!!e.capture:!!e,h=Rf(a);h||(a[Kf]=h=new Hf(a));c=h.add(b,c,d,g,f);if(c.proxy)return c;d=Sf();c.proxy=d;d.src=a;d.listener=c;if(a.addEventListener)uf||(e=g),void 0===e&&(e=!1),a.addEventListener(b.toString(),d,e);else if(a.attachEvent)a.attachEvent(Tf(b.toString()),
d);else if(a.addListener&&a.removeListener)a.addListener(d);else throw Error("addEventListener and attachEvent are unavailable.");return c}function Sf(){var a=Uf,b=sf?function(c){return a.call(b.src,b.listener,c)}:function(c){c=a.call(b.src,b.listener,c);if(!c)return c};return b}function Of(a,b,c,d,e){if(oa(b)){for(var f=0;f<b.length;f++)Of(a,b[f],c,d,e);return null}c=Pf(c);return a&&a[Df]?a.F.add(String(b),c,!0,ra(d)?!!d.capture:!!d,e):Qf(a,b,c,!0,d,e)}function Vf(a,b,c,d,e){if(oa(b))for(var f=
0;f<b.length;f++)Vf(a,b[f],c,d,e);else(d=ra(d)?!!d.capture:!!d,c=Pf(c),a&&a[Df])?(a=a.F,b=String(b).toString(),b in a.a&&(f=a.a[b],c=If(f,c,d,e),-1<c&&(Gf(f[c]),Qa(f,c),0==f.length&&(delete a.a[b],a.g--)))):a&&(a=Rf(a))&&(b=a.a[b.toString()],a=-1,b&&(a=If(b,c,d,e)),(c=-1<a?b[a]:null)&&Wf(c));}function Wf(a){if("number"!=typeof a&&a&&!a.qa){var b=a.src;if(b&&b[Df])Jf(b.F,a);else{var c=a.type,d=a.proxy;b.removeEventListener?b.removeEventListener(c,d,a.capture):b.detachEvent?b.detachEvent(Tf(c),d):b.addListener&&
b.removeListener&&b.removeListener(d);(c=Rf(b))?(Jf(c,a),0==c.g&&(c.src=null,b[Kf]=null)):Gf(a);}}}function Tf(a){return a in Lf?Lf[a]:Lf[a]="on"+a}function Xf(a,b,c,d){var e=!0;if(a=Rf(a))if(b=a.a[b.toString()])for(b=b.concat(),a=0;a<b.length;a++){var f=b[a];f&&f.capture==c&&!f.qa&&(f=Yf(f,d),e=e&&!1!==f);}return e}function Yf(a,b){var c=a.listener,d=a.Fa||a.src;a.Ca&&Wf(a);return c.call(d,b)}function Uf(a,b){if(a.qa)return !0;if(!sf){if(!b)a:{b=["window","event"];for(var c=n,d=0;d<b.length;d++)if(c=
c[b[d]],null==c){b=null;break a}b=c;}d=b;b=new Bf(d,this);c=!0;if(!(0>d.keyCode||void 0!=d.returnValue)){a:{var e=!1;if(0==d.keyCode)try{d.keyCode=-1;break a}catch(g){e=!0;}if(e||void 0==d.returnValue)d.returnValue=!0;}d=[];for(e=b.g;e;e=e.parentNode)d.push(e);a=a.type;for(e=d.length-1;!b.h&&0<=e;e--){b.g=d[e];var f=Xf(d[e],a,!0,b);c=c&&f;}for(e=0;!b.h&&e<d.length;e++)b.g=d[e],f=Xf(d[e],a,!1,b),c=c&&f;}return c}return Yf(a,new Bf(b,this))}function Rf(a){a=a[Kf];return a instanceof Hf?a:null}var Zf="__closure_events_fn_"+
(1E9*Math.random()>>>0);function Pf(a){if(qa(a))return a;a[Zf]||(a[Zf]=function(b){return a.handleEvent(b)});return a[Zf]}function $f(a,b,c){b||(b={});c=c||window;var d=a instanceof Ob?a:Tb("undefined"!=typeof a.href?a.href:String(a));a=b.target||a.target;var e=[];for(f in b)switch(f){case "width":case "height":case "top":case "left":e.push(f+"="+b[f]);break;case "target":case "noopener":case "noreferrer":break;default:e.push(f+"="+(b[f]?1:0));}var f=e.join(",");(u("iPhone")&&!u("iPod")&&!u("iPad")||
u("iPad")||u("iPod"))&&c.navigator&&c.navigator.standalone&&a&&"_self"!=a?(f=c.document.createElement("A"),d instanceof Ob||d instanceof Ob||(d="object"==typeof d&&d.ka?d.ia():String(d),Sb.test(d)||(d="about:invalid#zClosurez"),d=Ub(d)),f.href=Rb(d),f.setAttribute("target",a),b.noreferrer&&f.setAttribute("rel","noreferrer"),b=document.createEvent("MouseEvent"),b.initMouseEvent("click",!0,!0,c,1),f.dispatchEvent(b),c={}):b.noreferrer?(c=c.open("",a,f),b=Qb(d),c&&(tb&&-1!=b.indexOf(";")&&(b="'"+b.replace(/'/g,
"%27")+"'"),c.opener=null,b=$b('<meta name="referrer" content="no-referrer"><meta http-equiv="refresh" content="0; url='+nb(b)+'">',null),c.document.write(Zb(b)),c.document.close())):(c=c.open(Qb(d),a,f))&&b.noopener&&(c.opener=null);return c}function ag(a){window.location.assign(Qb(Tb(a)));}function bg(){try{return !!(window.opener&&window.opener.location&&window.opener.location.assign&&window.opener.location.hostname===window.location.hostname&&window.opener.location.protocol===window.location.protocol)}catch(a){}return !1}
function cg(a){$f(a,{target:window.cordova&&window.cordova.InAppBrowser?"_system":"_blank"},void 0);}function dg(a){a=ra(a)&&1==a.nodeType?a:document.querySelector(String(a));if(null==a)throw Error("Could not find the FirebaseUI widget element on the page.");return a}function eg(){return window.location.href}function fg(){var a=null;return hf(new Xe(function(b){"complete"==n.document.readyState?b():(a=function(){b();},Of(window,"load",a));}),function(b){Vf(window,"load",a);throw b;})}function gg(){for(var a=
32,b=[];0<a;)b.push("1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(62*Math.random()))),a--;return b.join("")}function hg(){this.a=new Jd;Kd(this.a,"acUiConfig");Kd(this.a,"autoUpgradeAnonymousUsers");Kd(this.a,"callbacks");Kd(this.a,"credentialHelper",ig);Kd(this.a,"immediateFederatedRedirect",!1);Kd(this.a,"popupMode",!1);Kd(this.a,"privacyPolicyUrl");Kd(this.a,"queryParameterForSignInSuccessUrl","signInSuccessUrl");Kd(this.a,"queryParameterForWidgetMode","mode");
Kd(this.a,"signInFlow");Kd(this.a,"signInOptions");Kd(this.a,"signInSuccessUrl");Kd(this.a,"siteName");Kd(this.a,"tosUrl");Kd(this.a,"widgetUrl");}var ig="accountchooser.com",jg={Vb:ig,Yb:"googleyolo",NONE:"none"},kg={Zb:"popup",ac:"redirect"};function mg(a){return a.a.get("acUiConfig")||null}var ng={Xb:"callback",$b:"recoverEmail",bc:"resetPassword",cc:"select",dc:"signIn",ec:"verifyEmail"},og=["anonymous"],pg=["sitekey","tabindex","callback","expired-callback"];function qg(a){var b=a.a.get("widgetUrl")||
eg();return rg(a,b)}function rg(a,b){a=sg(a);for(var c=b.search(Dc),d=0,e,f=[];0<=(e=Cc(b,d,a,c));)f.push(b.substring(d,e)),d=Math.min(b.indexOf("&",e)+1||c,c);f.push(b.substr(d));b=f.join("").replace(Fc,"$1");c="="+encodeURIComponent("select");(a+=c)?(c=b.indexOf("#"),0>c&&(c=b.length),d=b.indexOf("?"),0>d||d>c?(d=c,e=""):e=b.substring(d+1,c),b=[b.substr(0,d),e,b.substr(c)],c=b[1],b[1]=a?c?c+"&"+a:a:c,a=b[0]+(b[1]?"?"+b[1]:"")+b[2]):a=b;return a}function tg(a){var b=!!a.a.get("autoUpgradeAnonymousUsers");
b&&!ug(a)&&Be('Missing "signInFailure" callback: "signInFailure" callback needs to be provided when "autoUpgradeAnonymousUsers" is set to true.',void 0);return b}function vg(a){a=a.a.get("signInOptions")||[];for(var b=[],c=0;c<a.length;c++){var d=a[c];d=ra(d)?d:{provider:d};d.provider&&b.push(d);}return b}function wg(a,b){a=vg(a);for(var c=0;c<a.length;c++)if(a[c].provider===b)return a[c];return null}function xg(a){return La(vg(a),function(b){return b.provider})}function yg(a,b){a=zg(a);for(var c=
0;c<a.length;c++)if(a[c].providerId===b)return a[c];return null}function zg(a){return La(vg(a),function(b){return de[b.provider]||Oa(og,b.provider)?{providerId:b.provider}:{providerId:b.provider,hb:b.providerName||b.provider,ob:b.buttonColor||null,fb:b.iconUrl?Qb(Tb(b.iconUrl)):null,Db:b.loginHintKey||null}})}function Ag(a){var b=[],c=[];Ha(vg(a),function(e){e.authMethod&&(b.push(e.authMethod),e.clientId&&c.push({uri:e.authMethod,clientId:e.clientId}));});var d=null;"googleyolo"===Bg(a)&&b.length&&
(d={supportedIdTokenProviders:c,supportedAuthMethods:b});return d}function Cg(a,b){var c=null;Ha(vg(a),function(d){d.authMethod===b&&(c=d.provider);});return c}function Dg(a){var b=null;Ha(vg(a),function(d){d.provider==undefined&&ra(d.recaptchaParameters)&&!oa(d.recaptchaParameters)&&(b=jb(d.recaptchaParameters));});if(b){var c=[];Ha(pg,function(d){"undefined"!==typeof b[d]&&(c.push(d),delete b[d]);});c.length&&Ge('The following provided "recaptchaParameters" keys are not allowed: '+
c.join(", "));}return b}function Eg(a,b){a=(a=wg(a,b))&&a.scopes;return oa(a)?a:[]}function Fg(a,b){a=(a=wg(a,b))&&a.customParameters;return ra(a)?(a=jb(a),b===undefined&&delete a.login_hint,b===undefined&&delete a.login,a):null}function Gg(a){a=wg(a,undefined);var b=null;a&&p(a.loginHint)&&(b=$d(a.loginHint));return a&&a.defaultNationalNumber||b&&b.va||null}function Hg(a){var b=(a=wg(a,undefined))&&
a.defaultCountry||null;b=b&&Vd(b);var c=null;a&&p(a.loginHint)&&(c=$d(a.loginHint));return b&&b[0]||c&&Td(c.a)||null}function Ig(a){a=wg(a,undefined);if(!a)return null;var b=a.whitelistedCountries,c=a.blacklistedCountries;if("undefined"!==typeof b&&(!oa(b)||0==b.length))throw Error("WhitelistedCountries must be a non-empty array.");if("undefined"!==typeof c&&!oa(c))throw Error("BlacklistedCountries must be an array.");if(b&&c)throw Error("Both whitelistedCountries and blacklistedCountries are provided.");
if(!b&&!c)return Ud;a=[];if(b){c={};for(var d=0;d<b.length;d++){var e=Wd(b[d]);for(var f=0;f<e.length;f++)c[e[f].c]=e[f];}for(var g in c)c.hasOwnProperty(g)&&a.push(c[g]);}else{g={};for(d=0;d<c.length;d++)for(e=Wd(c[d]),f=0;f<e.length;f++)g[e[f].c]=e[f];for(b=0;b<Ud.length;b++)null!==g&&Ud[b].c in g||a.push(Ud[b]);}return a}function sg(a){return Md(a.a,"queryParameterForWidgetMode")}function C(a){var b=a.a.get("tosUrl")||null;a=a.a.get("privacyPolicyUrl")||null;b&&!a&&Ge("Privacy Policy URL is missing, the link will not be displayed.");
if(b&&a){if(qa(b))return b;if(p(b))return function(){cg(b);}}return null}function D(a){var b=a.a.get("tosUrl")||null,c=a.a.get("privacyPolicyUrl")||null;c&&!b&&Ge("Term of Service URL is missing, the link will not be displayed.");if(b&&c){if(qa(c))return c;if(p(c))return function(){cg(c);}}return null}function Jg(a){return (a=wg(a,undefined))&&"undefined"!==typeof a.requireDisplayName?!!a.requireDisplayName:!0}function Kg(a){a=wg(a,undefined);
return !(!a||a.signInMethod!==undefined)}function Lg(a){a=wg(a,undefined);return !(!a||!a.forceSameDevice)}function Mg(a){if(Kg(a)){var b={url:eg(),handleCodeInApp:!0};(a=wg(a,undefined))&&"function"===typeof a.emailLinkSignIn&&lb(b,a.emailLinkSignIn());b.url=Vc(eg(),b.url).toString();return b}return null}function Ng(a){var b=!!a.a.get("immediateFederatedRedirect"),c=xg(a);a=Og(a);return b&&
1==c.length&&!Oa(ce,c[0])&&"redirect"==a}function Og(a){a=a.a.get("signInFlow");for(var b in kg)if(kg[b]==a)return kg[b];return "redirect"}function Pg(a){return Qg(a).uiShown||null}function Rg(a){return Qg(a).signInSuccess||null}function Sg(a){return Qg(a).signInSuccessWithAuthResult||null}function ug(a){return Qg(a).signInFailure||null}function Qg(a){return a.a.get("callbacks")||{}}function Bg(a){if("http:"!==(window.location&&window.location.protocol)&&"https:"!==(window.location&&window.location.protocol))return "none";
a=a.a.get("credentialHelper");for(var b in jg)if(jg[b]==a)return jg[b];return ig}function Tg(a){this.a=Uc(a);}var E={Ja:"ui_auid",Wb:"apiKey",Ka:"ui_sd",lb:"mode",Va:"oobCode",PROVIDER_ID:"ui_pid",Na:"ui_sid"};function Ug(a,b){b?a.a.a.set(E.Na,b):Zc(a.a.a,E.Na);}function Vg(a,b){null!==b?a.a.a.set(E.Ka,b?"1":"0"):Zc(a.a.a,E.Ka);}function Wg(a){return a.a.a.get(E.Ja)||null}function Xg(a,b){b?a.a.a.set(E.PROVIDER_ID,b):Zc(a.a.a,E.PROVIDER_ID);}Tg.prototype.toString=function(){return this.a.toString()};
function F(){vf.call(this);this.F=new Hf(this);this.mb=this;this.Ba=null;}t(F,vf);F.prototype[Df]=!0;F.prototype.Ua=function(a){this.Ba=a;};F.prototype.removeEventListener=function(a,b,c,d){Vf(this,a,b,c,d);};function Yg(a,b){var c,d=a.Ba;if(d)for(c=[];d;d=d.Ba)c.push(d);a=a.mb;d=b.type||b;if(p(b))b=new Af(b,a);else if(b instanceof Af)b.target=b.target||a;else{var e=b;b=new Af(d,a);lb(b,e);}e=!0;if(c)for(var f=c.length-1;!b.h&&0<=f;f--){var g=b.g=c[f];e=Zg(g,d,!0,b)&&e;}b.h||(g=b.g=a,e=Zg(g,d,!0,b)&&e,
b.h||(e=Zg(g,d,!1,b)&&e));if(c)for(f=0;!b.h&&f<c.length;f++)g=b.g=c[f],e=Zg(g,d,!1,b)&&e;return e}F.prototype.l=function(){F.o.l.call(this);if(this.F){var a=this.F,c;for(c in a.a){for(var d=a.a[c],e=0;e<d.length;e++)Gf(d[e]);delete a.a[c];a.g--;}}this.Ba=null;};function Zg(a,b,c,d){b=a.F.a[String(b)];if(!b)return !0;b=b.concat();for(var e=!0,f=0;f<b.length;++f){var g=b[f];if(g&&!g.qa&&g.capture==c){var h=g.listener,k=g.Fa||g.src;g.Ca&&Jf(a.F,g);e=!1!==h.call(k,d)&&e;}}return e&&0!=d.ib}var $g=
{},ah=0;function bh(a,b){if(!a)throw Error("Event target element must be provided!");a=ch(a);if($g[a]&&$g[a].length)for(var c=0;c<$g[a].length;c++)Yg($g[a][c],b);}function dh(a){var b=ch(a.N());$g[b]&&$g[b].length&&(Ra($g[b],function(c){return c==a}),$g[b].length||delete $g[b]);}function ch(a){"undefined"===typeof a.a&&(a.a=ah,ah++);return a.a}function eh(a){if(!a)throw Error("Event target element must be provided!");this.a=a;F.call(this);}t(eh,F);eh.prototype.N=function(){return this.a};eh.prototype.register=
function(){var a=ch(this.N());$g[a]?Oa($g[a],this)||$g[a].push(this):$g[a]=[this];};function fh(a){var b=gh;this.i=[];this.O=b;this.K=a||null;this.j=this.a=!1;this.h=void 0;this.F=this.s=this.w=!1;this.v=0;this.g=null;this.C=0;}fh.prototype.cancel=function(a){if(this.a)this.h instanceof fh&&this.h.cancel();else{if(this.g){var b=this.g;delete this.g;a?b.cancel(a):(b.C--,0>=b.C&&b.cancel());}this.O?this.O.call(this.K,this):this.F=!0;this.a||(a=new hh(this),ih(this),jh(this,!1,a));}};fh.prototype.I=function(a,
b){this.w=!1;jh(this,a,b);};function jh(a,b,c){a.a=!0;a.h=c;a.j=!b;kh(a);}function ih(a){if(a.a){if(!a.F)throw new lh(a);a.F=!1;}}function mh(a,b,c){a.i.push([b,c,void 0]);a.a&&kh(a);}fh.prototype.then=function(a,b,c){var d,e,f=new Xe(function(g,h){d=g;e=h;});mh(this,d,function(g){g instanceof hh?f.cancel():e(g);});return f.then(a,b,c)};fh.prototype.$goog_Thenable=!0;function nh(a){return Ma(a.i,function(b){return qa(b[1])})}function kh(a){if(a.v&&a.a&&nh(a)){var b=a.v,c=oh[b];c&&(n.clearTimeout(c.a),delete oh[b]);
a.v=0;}a.g&&(a.g.C--,delete a.g);b=a.h;for(var d=c=!1;a.i.length&&!a.w;){var e=a.i.shift(),f=e[0],g=e[1];e=e[2];if(f=a.j?g:f)try{var h=f.call(e||a.K,b);ha(h)&&(a.j=a.j&&(h==b||h instanceof Error),a.h=b=h);if(He(b)||"function"===typeof n.Promise&&b instanceof n.Promise)d=!0,a.w=!0;}catch(k){b=k,a.j=!0,nh(a)||(c=!0);}}a.h=b;d&&(h=q(a.I,a,!0),d=q(a.I,a,!1),b instanceof fh?(mh(b,h,d),b.s=!0):b.then(h,d));c&&(b=new ph(b),oh[b.a]=b,a.v=b.a);}function lh(){Ba.call(this);}t(lh,Ba);lh.prototype.message="Deferred has already fired";
lh.prototype.name="AlreadyCalledError";function hh(){Ba.call(this);}t(hh,Ba);hh.prototype.message="Deferred was canceled";hh.prototype.name="CanceledError";function ph(a){this.a=n.setTimeout(q(this.h,this),0);this.g=a;}ph.prototype.h=function(){delete oh[this.a];throw this.g;};var oh={};function qh(a){var c=document,d=Mb(a).toString(),e=document.createElement("SCRIPT"),f={jb:e,kb:void 0},g=new fh(f),h=null,k=5E3;(h=window.setTimeout(function(){rh(e,!0);
var l=new sh(th,"Timeout reached for loading script "+d);ih(g);jh(g,!1,l);},k),f.kb=h);e.onload=e.onreadystatechange=function(){e.readyState&&"loaded"!=e.readyState&&"complete"!=e.readyState||(rh(e,!1,h),ih(g),jh(g,!0,null));};e.onerror=function(){rh(e,!0,h);var l=new sh(uh,"Error while loading script "+d);ih(g);jh(g,!1,l);};f={};lb(f,{type:"text/javascript",charset:"UTF-8"});lc(e,f);cc(e,a);vh(c).appendChild(e);return g}function vh(a){var b=(a||document).getElementsByTagName("HEAD");
return b&&0!=b.length?b[0]:a.documentElement}function gh(){if(this&&this.jb){var a=this.jb;a&&"SCRIPT"==a.tagName&&rh(a,!0,this.kb);}}function rh(a,b,c){null!=c&&n.clearTimeout(c);a.onload=ka;a.onerror=ka;a.onreadystatechange=ka;b&&window.setTimeout(function(){oc(a);},0);}var uh=0,th=1;function sh(a,b){var c="Jsloader error (code #"+a+")";b&&(c+=": "+b);Ba.call(this,c);this.code=a;}t(sh,Ba);function wh(a){this.a=a||n.googleyolo;this.g=null;this.h=!1;}la(wh);var xh=new Gb(Hb,"https://smartlock.google.com/client");
wh.prototype.cancel=function(){this.a&&this.h&&(this.g=this.a.cancelLastOperation().catch(function(){}));};function yh(a,b,c){if(a.a&&b){var d=function(){a.h=!0;var e=Promise.resolve(null);c||(e=a.a.retrieve(b).catch(function(f){if("userCanceled"===f.type||"illegalConcurrentRequest"===f.type)throw f;return null}));return e.then(function(f){return f?f:a.a.hint(b)}).catch(function(f){if("userCanceled"===f.type)a.g=Promise.resolve();else if("illegalConcurrentRequest"===f.type)return a.cancel(),yh(a,b,
c);return null})};return a.g?a.g.then(d):d()}if(b)return d=hf(zh.Sa().load().then(function(){a.a=n.googleyolo;return yh(a,b,c)}),function(){return null}),Promise.resolve(d);if("undefined"!==typeof Promise)return Promise.resolve(null);throw Error("One-Tap sign in not supported in the current browser!");}function zh(){this.a=null;}la(zh);zh.prototype.load=function(){var a=this;if(this.a)return this.a;var b=Nb(Jb(xh));return n.googleyolo?B():this.a=fg().then(function(){if(!n.googleyolo)return new Xe(function(c,
d){var e=setTimeout(function(){a.a=null;d(Error("Network error!"));},1E4);n.onGoogleYoloLoad=function(){clearTimeout(e);c();};hf(B(qh(b)),function(f){clearTimeout(e);a.a=null;d(f);});})})};function Ah(a,b){this.a=a;this.g=b||function(c){throw c;};}Ah.prototype.confirm=function(a){return hf(B(this.a.confirm(a)),this.g)};function Bh(a,b,c,d){this.a=a;this.h=b||null;this.j=c||null;this.g=d||null;}Bh.prototype.na=function(){return {email:this.a,displayName:this.h,photoUrl:this.j,providerId:this.g}};function Ch(a){return a.email?
new Bh(a.email,a.displayName,a.photoUrl,a.providerId):null}function Dh(){this.a=("undefined"==typeof document?null:document)||{cookie:""};}m=Dh.prototype;m.set=function(a,b,c,d,e,f){if(/[;=\s]/.test(a))throw Error('Invalid cookie name "'+a+'"');if(/[;\r\n]/.test(b))throw Error('Invalid cookie value "'+b+'"');ha(c)||(c=-1);e=e?";domain="+e:"";d=d?";path="+d:"";f=f?";secure":"";c=0>c?"":0==c?";expires="+(new Date(1970,1,1)).toUTCString():";expires="+(new Date(za()+1E3*c)).toUTCString();this.a.cookie=
a+"="+b+e+d+c+f;};m.get=function(a,b){for(var c=a+"=",d=(this.a.cookie||"").split(";"),e=0,f;e<d.length;e++){f=Xa(d[e]);if(0==f.lastIndexOf(c,0))return f.substr(c.length);if(f==a)return ""}return b};m.ha=function(){return Eh(this).keys};m.ja=function(){return Eh(this).values};m.clear=function(){for(var a=Eh(this).keys,b=a.length-1;0<=b;b--){var c=a[b];this.get(c);this.set(c,"",0,void 0,void 0);}};function Eh(a){a=(a.a.cookie||"").split(";");for(var b=[],c=[],d,e,f=0;f<a.length;f++)e=Xa(a[f]),d=e.indexOf("="),
-1==d?(b.push(""),c.push(e)):(b.push(e.substring(0,d)),c.push(e.substring(d+1)));return {keys:b,values:c}}var Fh=new Dh;function Gh(){}function Hh(a,b,c,d){this.h="undefined"!==typeof a&&null!==a?a:-1;this.g=b||null;this.a=c||null;this.j=!!d;}t(Hh,Gh);Hh.prototype.set=function(a,b){Fh.set(a,b,this.h,this.g,this.a,this.j);};Hh.prototype.get=function(a){return Fh.get(a)||null};Hh.prototype.pa=function(a){var b=this.g,c=this.a;Fh.get(a);Fh.set(a,"",0,b,c);};function Ih(a,b){this.g=a;this.a=b||null;}Ih.prototype.na=
function(){return {email:this.g,credential:this.a&&this.a.toJSON()}};function Jh(a){if(a&&a.email){var b=a.credential&&undefined(a.credential);return new Ih(a.email,b)}return null}function Kh(a){for(var b=[],c=0,d=0;d<a.length;d++){var e=a.charCodeAt(d);255<e&&(b[c++]=e&255,e>>=8);b[c++]=e;}return b}function Lh(a){return La(a,function(b){b=b.toString(16);return 1<b.length?b:"0"+b}).join("")}function Mh(a){this.v=a;this.g=this.v.length/4;this.j=this.g+6;this.h=[[],[],[],[]];
this.i=[[],[],[],[]];this.a=Array(Nh*(this.j+1));for(a=0;a<this.g;a++)this.a[a]=[this.v[4*a],this.v[4*a+1],this.v[4*a+2],this.v[4*a+3]];var b=Array(4);for(a=this.g;a<Nh*(this.j+1);a++){b[0]=this.a[a-1][0];b[1]=this.a[a-1][1];b[2]=this.a[a-1][2];b[3]=this.a[a-1][3];if(0==a%this.g){var c=b,d=c[0];c[0]=c[1];c[1]=c[2];c[2]=c[3];c[3]=d;Oh(b);b[0]^=Ph[a/this.g][0];b[1]^=Ph[a/this.g][1];b[2]^=Ph[a/this.g][2];b[3]^=Ph[a/this.g][3];}else 6<this.g&&4==a%this.g&&Oh(b);this.a[a]=Array(4);this.a[a][0]=this.a[a-
this.g][0]^b[0];this.a[a][1]=this.a[a-this.g][1]^b[1];this.a[a][2]=this.a[a-this.g][2]^b[2];this.a[a][3]=this.a[a-this.g][3]^b[3];}}Mh.prototype.w=16;var Nh=Mh.prototype.w/4;function Qh(a,b){for(var c,d=0;d<Nh;d++)for(var e=0;4>e;e++)c=4*e+d,c=b[c],a.h[d][e]=c;}function Rh(a){for(var b=[],c=0;c<Nh;c++)for(var d=0;4>d;d++)b[4*d+c]=a.h[c][d];return b}function Sh(a,b){for(var c=0;4>c;c++)for(var d=0;4>d;d++)a.h[c][d]^=a.a[4*b+d][c];}function Th(a,b){for(var c=0;4>c;c++)for(var d=0;4>d;d++)a.h[c][d]=b[a.h[c][d]];}
function Uh(a){for(var b=1;4>b;b++)for(var c=0;4>c;c++)a.i[b][c]=a.h[b][c];for(b=1;4>b;b++)for(c=0;4>c;c++)a.h[b][c]=a.i[b][(c+b)%Nh];}function Vh(a){for(var b=1;4>b;b++)for(var c=0;4>c;c++)a.i[b][(c+b)%Nh]=a.h[b][c];for(b=1;4>b;b++)for(c=0;4>c;c++)a.h[b][c]=a.i[b][c];}function Oh(a){a[0]=Wh[a[0]];a[1]=Wh[a[1]];a[2]=Wh[a[2]];a[3]=Wh[a[3]];}var Wh=[99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,147,38,54,63,247,204,52,165,
229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,78,169,108,
86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22],Xh=[82,9,106,213,48,54,165,56,191,64,163,158,129,243,215,251,124,227,57,130,155,47,255,135,52,142,67,68,196,222,233,203,84,123,148,50,166,194,35,61,238,76,149,11,66,250,195,78,8,46,161,102,40,217,36,178,118,91,162,73,109,139,209,37,114,248,246,
100,134,104,152,22,212,164,92,204,93,101,182,146,108,112,72,80,253,237,185,218,94,21,70,87,167,141,157,132,144,216,171,0,140,188,211,10,247,228,88,5,184,179,69,6,208,44,30,143,202,63,15,2,193,175,189,3,1,19,138,107,58,145,17,65,79,103,220,234,151,242,207,206,240,180,230,115,150,172,116,34,231,173,53,133,226,249,55,232,28,117,223,110,71,241,26,113,29,41,197,137,111,183,98,14,170,24,190,27,252,86,62,75,198,210,121,32,154,219,192,254,120,205,90,244,31,221,168,51,136,7,199,49,177,18,16,89,39,128,236,
95,96,81,127,169,25,181,74,13,45,229,122,159,147,201,156,239,160,224,59,77,174,42,245,176,200,235,187,60,131,83,153,97,23,43,4,126,186,119,214,38,225,105,20,99,85,33,12,125],Ph=[[0,0,0,0],[1,0,0,0],[2,0,0,0],[4,0,0,0],[8,0,0,0],[16,0,0,0],[32,0,0,0],[64,0,0,0],[128,0,0,0],[27,0,0,0],[54,0,0,0]],Yh=[0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,102,104,106,108,110,112,114,116,118,120,122,124,126,
128,130,132,134,136,138,140,142,144,146,148,150,152,154,156,158,160,162,164,166,168,170,172,174,176,178,180,182,184,186,188,190,192,194,196,198,200,202,204,206,208,210,212,214,216,218,220,222,224,226,228,230,232,234,236,238,240,242,244,246,248,250,252,254,27,25,31,29,19,17,23,21,11,9,15,13,3,1,7,5,59,57,63,61,51,49,55,53,43,41,47,45,35,33,39,37,91,89,95,93,83,81,87,85,75,73,79,77,67,65,71,69,123,121,127,125,115,113,119,117,107,105,111,109,99,97,103,101,155,153,159,157,147,145,151,149,139,137,143,
141,131,129,135,133,187,185,191,189,179,177,183,181,171,169,175,173,163,161,167,165,219,217,223,221,211,209,215,213,203,201,207,205,195,193,199,197,251,249,255,253,243,241,247,245,235,233,239,237,227,225,231,229],Zh=[0,3,6,5,12,15,10,9,24,27,30,29,20,23,18,17,48,51,54,53,60,63,58,57,40,43,46,45,36,39,34,33,96,99,102,101,108,111,106,105,120,123,126,125,116,119,114,113,80,83,86,85,92,95,90,89,72,75,78,77,68,71,66,65,192,195,198,197,204,207,202,201,216,219,222,221,212,215,210,209,240,243,246,245,252,
255,250,249,232,235,238,237,228,231,226,225,160,163,166,165,172,175,170,169,184,187,190,189,180,183,178,177,144,147,150,149,156,159,154,153,136,139,142,141,132,135,130,129,155,152,157,158,151,148,145,146,131,128,133,134,143,140,137,138,171,168,173,174,167,164,161,162,179,176,181,182,191,188,185,186,251,248,253,254,247,244,241,242,227,224,229,230,239,236,233,234,203,200,205,206,199,196,193,194,211,208,213,214,223,220,217,218,91,88,93,94,87,84,81,82,67,64,69,70,79,76,73,74,107,104,109,110,103,100,97,
98,115,112,117,118,127,124,121,122,59,56,61,62,55,52,49,50,35,32,37,38,47,44,41,42,11,8,13,14,7,4,1,2,19,16,21,22,31,28,25,26],$h=[0,9,18,27,36,45,54,63,72,65,90,83,108,101,126,119,144,153,130,139,180,189,166,175,216,209,202,195,252,245,238,231,59,50,41,32,31,22,13,4,115,122,97,104,87,94,69,76,171,162,185,176,143,134,157,148,227,234,241,248,199,206,213,220,118,127,100,109,82,91,64,73,62,55,44,37,26,19,8,1,230,239,244,253,194,203,208,217,174,167,188,181,138,131,152,145,77,68,95,86,105,96,123,114,5,
12,23,30,33,40,51,58,221,212,207,198,249,240,235,226,149,156,135,142,177,184,163,170,236,229,254,247,200,193,218,211,164,173,182,191,128,137,146,155,124,117,110,103,88,81,74,67,52,61,38,47,16,25,2,11,215,222,197,204,243,250,225,232,159,150,141,132,187,178,169,160,71,78,85,92,99,106,113,120,15,6,29,20,43,34,57,48,154,147,136,129,190,183,172,165,210,219,192,201,246,255,228,237,10,3,24,17,46,39,60,53,66,75,80,89,102,111,116,125,161,168,179,186,133,140,151,158,233,224,251,242,205,196,223,214,49,56,35,
42,21,28,7,14,121,112,107,98,93,84,79,70],ai=[0,11,22,29,44,39,58,49,88,83,78,69,116,127,98,105,176,187,166,173,156,151,138,129,232,227,254,245,196,207,210,217,123,112,109,102,87,92,65,74,35,40,53,62,15,4,25,18,203,192,221,214,231,236,241,250,147,152,133,142,191,180,169,162,246,253,224,235,218,209,204,199,174,165,184,179,130,137,148,159,70,77,80,91,106,97,124,119,30,21,8,3,50,57,36,47,141,134,155,144,161,170,183,188,213,222,195,200,249,242,239,228,61,54,43,32,17,26,7,12,101,110,115,120,73,66,95,84,
247,252,225,234,219,208,205,198,175,164,185,178,131,136,149,158,71,76,81,90,107,96,125,118,31,20,9,2,51,56,37,46,140,135,154,145,160,171,182,189,212,223,194,201,248,243,238,229,60,55,42,33,16,27,6,13,100,111,114,121,72,67,94,85,1,10,23,28,45,38,59,48,89,82,79,68,117,126,99,104,177,186,167,172,157,150,139,128,233,226,255,244,197,206,211,216,122,113,108,103,86,93,64,75,34,41,52,63,14,5,24,19,202,193,220,215,230,237,240,251,146,153,132,143,190,181,168,163],bi=[0,13,26,23,52,57,46,35,104,101,114,127,
92,81,70,75,208,221,202,199,228,233,254,243,184,181,162,175,140,129,150,155,187,182,161,172,143,130,149,152,211,222,201,196,231,234,253,240,107,102,113,124,95,82,69,72,3,14,25,20,55,58,45,32,109,96,119,122,89,84,67,78,5,8,31,18,49,60,43,38,189,176,167,170,137,132,147,158,213,216,207,194,225,236,251,246,214,219,204,193,226,239,248,245,190,179,164,169,138,135,144,157,6,11,28,17,50,63,40,37,110,99,116,121,90,87,64,77,218,215,192,205,238,227,244,249,178,191,168,165,134,139,156,145,10,7,16,29,62,51,36,
41,98,111,120,117,86,91,76,65,97,108,123,118,85,88,79,66,9,4,19,30,61,48,39,42,177,188,171,166,133,136,159,146,217,212,195,206,237,224,247,250,183,186,173,160,131,142,153,148,223,210,197,200,235,230,241,252,103,106,125,112,83,94,73,68,15,2,21,24,59,54,33,44,12,1,22,27,56,53,34,47,100,105,126,115,80,93,74,71,220,209,198,203,232,229,242,255,180,185,174,163,128,141,154,151],ci=[0,14,28,18,56,54,36,42,112,126,108,98,72,70,84,90,224,238,252,242,216,214,196,202,144,158,140,130,168,166,180,186,219,213,199,
201,227,237,255,241,171,165,183,185,147,157,143,129,59,53,39,41,3,13,31,17,75,69,87,89,115,125,111,97,173,163,177,191,149,155,137,135,221,211,193,207,229,235,249,247,77,67,81,95,117,123,105,103,61,51,33,47,5,11,25,23,118,120,106,100,78,64,82,92,6,8,26,20,62,48,34,44,150,152,138,132,174,160,178,188,230,232,250,244,222,208,194,204,65,79,93,83,121,119,101,107,49,63,45,35,9,7,21,27,161,175,189,179,153,151,133,139,209,223,205,195,233,231,245,251,154,148,134,136,162,172,190,176,234,228,246,248,210,220,
206,192,122,116,102,104,66,76,94,80,10,4,22,24,50,60,46,32,236,226,240,254,212,218,200,198,156,146,128,142,164,170,184,182,12,2,16,30,52,58,40,38,124,114,96,110,68,74,88,86,55,57,43,37,15,1,19,29,71,73,91,85,127,113,99,109,215,217,203,197,239,225,243,253,167,169,187,181,159,145,131,141];function di(a,b){a=new Mh(ei(a));b=Kh(b);for(var c=Va(b,0,16),d="",e;c.length;){e=16-c.length;for(var f=0;f<e;f++)c.push(0);e=a;Qh(e,c);Sh(e,0);for(c=1;c<e.j;++c){Th(e,Wh);Uh(e);f=e.h;for(var g=e.i[0],h=0;4>h;h++)g[0]=
f[0][h],g[1]=f[1][h],g[2]=f[2][h],g[3]=f[3][h],f[0][h]=Yh[g[0]]^Zh[g[1]]^g[2]^g[3],f[1][h]=g[0]^Yh[g[1]]^Zh[g[2]]^g[3],f[2][h]=g[0]^g[1]^Yh[g[2]]^Zh[g[3]],f[3][h]=Zh[g[0]]^g[1]^g[2]^Yh[g[3]];Sh(e,c);}Th(e,Wh);Uh(e);Sh(e,e.j);d+=Lh(Rh(e));c=Va(b,0,16);}return d}function fi(a,b){a=new Mh(ei(a));for(var c=[],d=0;d<b.length;d+=2)c.push(parseInt(b.substring(d,d+2),16));var e=Va(c,0,16);for(b="";e.length;){d=a;Qh(d,e);Sh(d,d.j);for(e=1;e<d.j;++e){Vh(d);Th(d,Xh);Sh(d,d.j-e);for(var f=d.h,g=d.i[0],h=0;4>h;h++)g[0]=
f[0][h],g[1]=f[1][h],g[2]=f[2][h],g[3]=f[3][h],f[0][h]=ci[g[0]]^ai[g[1]]^bi[g[2]]^$h[g[3]],f[1][h]=$h[g[0]]^ci[g[1]]^ai[g[2]]^bi[g[3]],f[2][h]=bi[g[0]]^$h[g[1]]^ci[g[2]]^ai[g[3]],f[3][h]=ai[g[0]]^bi[g[1]]^$h[g[2]]^ci[g[3]];}Vh(d);Th(d,Xh);Sh(d,0);d=Rh(d);if(8192>=d.length)d=String.fromCharCode.apply(null,d);else{e="";for(f=0;f<d.length;f+=8192)e+=String.fromCharCode.apply(null,Wa(d,f,f+8192));d=e;}b+=d;e=Va(c,0,16);}return b.replace(/(\x00)+$/,"")}function ei(a){a=Kh(a.substring(0,32));for(var b=32-
a.length,c=0;c<b;c++)a.push(0);return a}function gi(a){var b=[];hi(new ii,a,b);return b.join("")}function ii(){}function hi(a,b,c){if(null==b)c.push("null");else{if("object"==typeof b){if(oa(b)){var d=b;b=d.length;c.push("[");for(var e="",f=0;f<b;f++)c.push(e),hi(a,d[f],c),e=",";c.push("]");return}if(b instanceof String||b instanceof Number||b instanceof Boolean)b=b.valueOf();else{c.push("{");e="";for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(f=b[d],"function"!=typeof f&&(c.push(e),ji(d,
c),c.push(":"),hi(a,f,c),e=","));c.push("}");return}}switch(typeof b){case "string":ji(b,c);break;case "number":c.push(isFinite(b)&&!isNaN(b)?String(b):"null");break;case "boolean":c.push(String(b));break;case "function":c.push("null");break;default:throw Error("Unknown type: "+typeof b);}}}var ki={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},li=/\uffff/.test("\uffff")?/[\\"\x00-\x1f\x7f-\uffff]/g:/[\\"\x00-\x1f\x7f-\xff]/g;function ji(a,
b){b.push('"',a.replace(li,function(c){var d=ki[c];d||(d="\\u"+(c.charCodeAt(0)|65536).toString(16).substr(1),ki[c]=d);return d}),'"');}function mi(a){this.a=a;}mi.prototype.set=function(a,b){ha(b)?this.a.set(a,gi(b)):this.a.pa(a);};mi.prototype.get=function(a){try{var b=this.a.get(a);}catch(c){return}if(null!==b)try{return JSON.parse(b)}catch(c$2){throw"Storage: Invalid value was encountered";}};function ni(){}t(ni,Gh);ni.prototype.clear=function(){var a=wc(this.fa(!0)),b=this;Ha(a,function(c){b.pa(c);});};
function oi(a){this.a=a;}t(oi,ni);function pi(a){if(!a.a)return !1;try{return a.a.setItem("__sak","1"),a.a.removeItem("__sak"),!0}catch(b){return !1}}m=oi.prototype;m.set=function(a,b){try{this.a.setItem(a,b);}catch(c){if(0==this.a.length)throw"Storage mechanism: Storage disabled";throw"Storage mechanism: Quota exceeded";}};m.get=function(a){a=this.a.getItem(a);if(!p(a)&&null!==a)throw"Storage mechanism: Invalid value was encountered";return a};m.pa=function(a){this.a.removeItem(a);};m.fa=function(a){var b=
0,c=this.a,d=new tc;d.next=function(){if(b>=c.length)throw sc;var e=c.key(b++);if(a)return e;e=c.getItem(e);if(!p(e))throw"Storage mechanism: Invalid value was encountered";return e};return d};m.clear=function(){this.a.clear();};m.key=function(a){return this.a.key(a)};function qi(){var a=null;try{a=window.localStorage||null;}catch(b){}this.a=a;}t(qi,oi);function ri(){var a=null;try{a=window.sessionStorage||null;}catch(b){}this.a=a;}t(ri,oi);function si(a,b){this.g=a;this.a=b+"::";}t(si,ni);si.prototype.set=
function(a,b){this.g.set(this.a+a,b);};si.prototype.get=function(a){return this.g.get(this.a+a)};si.prototype.pa=function(a){this.g.pa(this.a+a);};si.prototype.fa=function(a){var b=this.g.fa(!0),c=this,d=new tc;d.next=function(){for(var e=b.next();e.substr(0,c.a.length)!=c.a;)e=b.next();return a?e.substr(c.a.length):c.g.get(e)};return d};var ti,ui=new qi;ti=pi(ui)?new si(ui,"firebaseui"):null;var vi=new mi(ti),wi,xi=new ri;wi=pi(xi)?new si(xi,"firebaseui"):null;var yi=new mi(wi),zi={name:"pendingEmailCredential",
storage:yi},Ai={name:"pendingRedirect",storage:yi},Bi={name:"redirectUrl",storage:yi},Ci={name:"rememberAccount",storage:yi},Di={name:"rememberedAccounts",storage:vi},Ei={name:"emailForSignIn",storage:new mi(new Hh(3600,"/"))},Fi={name:"pendingEncryptedCredential",storage:new mi(new Hh(3600,"/"))};function Gi(a,b){return a.storage.get(b?a.name+":"+b:a.name)}function G(a,b){a.storage.a.pa(b?a.name+":"+b:a.name);}function Hi(a,b,c){a.storage.set(c?a.name+":"+c:a.name,b);}function Ii(a){return Gi(Bi,a)||
null}function Ji(a,b){Hi(Bi,a,b);}function Ki(a,b){Hi(Ci,a,b);}function Li(a){a=Gi(Di,a)||[];a=La(a,function(b){return Ch(b)});return Ja(a,na)}function Mi(a,b){var c=Li(b),d=Na(c,function(e){return e.a==a.a&&(e.g||null)==(a.g||null)});-1<d&&Qa(c,d);c.unshift(a);Hi(Di,La(c,function(e){return e.na()}),b);}function Ni(a){a=Gi(zi,a)||null;return Jh(a)}function Oi(a){G(zi,a);}function Pi(a,b){Hi(zi,a.na(),b);}function Qi(a){Hi(Ai,"pending",a);}function Ri(a,b){b=Gi(Ei,b);var c=null;if(b)try{var d=fi(a,b),e=
JSON.parse(d);c=e&&e.email||null;}catch(f){}return c}function Si(a,b){b=Gi(Fi,b);var c=null;if(b)try{var d=fi(a,b);c=JSON.parse(d);}catch(e){}return Jh(c||null)}function Ti(a,b,c){Hi(Fi,di(a,JSON.stringify(b.na())),c);}var Ui=null;function Vi(a){return !(!a||-32E3!=a.code||"Service unavailable"!=a.message)}function Wi(a,b,c,d){Ui||(a={callbacks:{empty:a,select:function(e,f){e&&e.account&&b?b(Ch(e.account)):c&&c(!Vi(f));},store:a,update:a},language:"en",providers:void 0,ui:d},"undefined"!=typeof accountchooser&&
accountchooser.Api&&accountchooser.Api.init?Ui=accountchooser.Api.init(a):(Ui=new Xi(a),Yi()));}function Zi(a,b,c){function d(){var e=Vc(window.location.href,c).toString();Ui.select(La(b||[],function(f){return f.na()}),{clientCallbackUrl:e});}b&&b.length?d():Ui.checkEmpty(function(e,f){e||f?a(!Vi(f)):d();});}function Xi(a){this.a=a;this.a.callbacks=this.a.callbacks||{};}function Yi(){var a=Ui;qa(a.a.callbacks.empty)&&a.a.callbacks.empty();}var $i={code:-32E3,message:"Service unavailable",data:"Service is unavailable."};
m=Xi.prototype;m.store=function(){qa(this.a.callbacks.store)&&this.a.callbacks.store(void 0,$i);};m.select=function(){qa(this.a.callbacks.select)&&this.a.callbacks.select(void 0,$i);};m.update=function(){qa(this.a.callbacks.update)&&this.a.callbacks.update(void 0,$i);};m.checkDisabled=function(a){a(!0);};m.checkEmpty=function(a){a(void 0,$i);};m.checkAccountExist=function(a,b){b(void 0,$i);};m.checkShouldUpdate=function(a,b){b(void 0,$i);};var aj,bj,cj,dj,H={};function I(a,b,c,d){H[a].apply(null,Array.prototype.slice.call(arguments,
1));}var ej=/MSIE ([\d.]+).*Windows NT ([\d.]+)/,fj=/Firefox\/([\d.]+)/,gj=/Opera[ \/]([\d.]+)(.*Version\/([\d.]+))?/,hj=/Chrome\/([\d.]+)/,ij=/((Windows NT ([\d.]+))|(Mac OS X ([\d_]+))).*Version\/([\d.]+).*Safari/,jj=/Mac OS X;.*(?!(Version)).*Safari/,kj=/Android ([\d.]+).*Safari/,lj=/OS ([\d_]+) like Mac OS X.*Mobile.*Safari/,mj=/Konqueror\/([\d.]+)/,nj=/MSIE ([\d.]+).*Windows Phone OS ([\d.]+)/;function oj(a,b){a=a.split(b||".");this.a=[];for(b=0;b<a.length;b++)this.a.push(parseInt(a[b],10));}function pj(a,
b){b instanceof oj||(b=new oj(String(b)));for(var c=Math.max(a.a.length,b.a.length),d=0;d<c;d++){var e=a.a[d],f=b.a[d];if(void 0!==e&&void 0!==f&&e!==f)return e-f;if(void 0===e)return -1;if(void 0===f)return 1}return 0}function qj(a,b){return 0<=pj(a,b)}function rj(){var a=window.navigator&&window.navigator.userAgent;if(a){var b;if(b=a.match(gj)){var c=new oj(b[3]||b[1]);return 0<=a.indexOf("Opera Mini")?!1:0<=a.indexOf("Opera Mobi")?0<=a.indexOf("Android")&&qj(c,"10.1"):qj(c,"8.0")}if(b=a.match(fj))return qj(new oj(b[1]),
"2.0");if(b=a.match(hj))return qj(new oj(b[1]),"6.0");if(b=a.match(ij))return c=new oj(b[6]),a=b[3]&&new oj(b[3]),b=b[5]&&new oj(b[5],"_"),(!(!a||!qj(a,"6.0"))||!(!b||!qj(b,"10.5.6")))&&qj(c,"3.0");if(b=a.match(kj))return qj(new oj(b[1]),"3.0");if(b=a.match(lj))return qj(new oj(b[1],"_"),"4.0");if(b=a.match(mj))return qj(new oj(b[1]),"4.7");if(b=a.match(nj))return c=new oj(b[1]),a=new oj(b[2]),qj(c,"7.0")&&qj(a,"7.0");if(b=a.match(ej))return c=new oj(b[1]),a=new oj(b[2]),qj(c,"7.0")&&qj(a,"6.0");
if(a.match(jj))return !1}return !0}function sj(a){if(a.classList)return a.classList;a=a.className;return p(a)&&a.match(/\S+/g)||[]}function tj(a,b){return a.classList?a.classList.contains(b):Oa(sj(a),b)}function uj(a,b){a.classList?a.classList.add(b):tj(a,b)||(a.className+=0<a.className.length?" "+b:b);}function vj(a,b){a.classList?a.classList.remove(b):tj(a,b)&&(a.className=Ja(sj(a),function(c){return c!=b}).join(" "));}function J(a){var b=a.type;switch(p(b)&&b.toLowerCase()){case "checkbox":case "radio":return a.checked?
a.value:null;case "select-one":return b=a.selectedIndex,0<=b?a.options[b].value:null;case "select-multiple":b=[];for(var c,d=0;c=a.options[d];d++)c.selected&&b.push(c.value);return b.length?b:null;default:return null!=a.value?a.value:null}}function wj(a,b){var c=a.type;switch(p(c)&&c.toLowerCase()){case "checkbox":case "radio":a.checked=b;break;case "select-one":a.selectedIndex=-1;if(p(b))for(var d=0;c=a.options[d];d++)if(c.value==b){c.selected=!0;break}break;case "select-multiple":p(b)&&(b=[b]);
for(d=0;c=a.options[d];d++)if(c.selected=!1,b)for(var e,f=0;e=b[f];f++)c.value==e&&(c.selected=!0);break;default:a.value=null!=b?b:"";}}function xj(a){if(a.altKey&&!a.ctrlKey||a.metaKey||112<=a.keyCode&&123>=a.keyCode)return !1;if(yj(a.keyCode))return !0;switch(a.keyCode){case 18:case 20:case 93:case 17:case 40:case 35:case 27:case 36:case 45:case 37:case 224:case 91:case 144:case 12:case 34:case 33:case 19:case 255:case 44:case 39:case 145:case 16:case 38:case 252:case 224:case 92:return !1;case 0:return !ub;
default:return 166>a.keyCode||183<a.keyCode}}function zj(a,b,c,d,e,f){if(vb&&!Db("525"))return !0;if(xb&&e)return yj(a);if(e&&!d)return !1;if(!ub){"number"==typeof b&&(b=Aj(b));var g=17==b||18==b||xb&&91==b;if((!c||xb)&&g||xb&&16==b&&(d||f))return !1}if((vb||sb)&&d&&c)switch(a){case 220:case 219:case 221:case 192:case 186:case 189:case 187:case 188:case 190:case 191:case 192:case 222:return !1}if(w&&d&&b==a)return !1;switch(a){case 13:return ub?f||e?!1:!(c&&d):!0;case 27:return !(vb||sb||ub)}return ub&&
(d||e||f)?!1:yj(a)}function yj(a){if(48<=a&&57>=a||96<=a&&106>=a||65<=a&&90>=a||(vb||sb)&&0==a)return !0;switch(a){case 32:case 43:case 63:case 64:case 107:case 109:case 110:case 111:case 186:case 59:case 189:case 187:case 61:case 188:case 190:case 191:case 192:case 222:case 219:case 220:case 221:case 163:return !0;case 173:return ub;default:return !1}}function Aj(a){if(ub)a=Bj(a);else if(xb&&vb)switch(a){case 93:a=91;}return a}function Bj(a){switch(a){case 61:return 187;case 59:return 186;case 173:return 189;
case 224:return 91;case 0:return 224;default:return a}}function Cj(a){F.call(this);this.a=a;Nf(a,"keydown",this.g,!1,this);Nf(a,"click",this.h,!1,this);}t(Cj,F);Cj.prototype.g=function(a){(13==a.keyCode||vb&&3==a.keyCode)&&Dj(this,a);};Cj.prototype.h=function(a){Dj(this,a);};function Dj(a,b){var c=new Ej(b);if(Yg(a,c)){c=new Fj(b);try{Yg(a,c);}finally{b.stopPropagation();}}}Cj.prototype.l=function(){Cj.o.l.call(this);Vf(this.a,"keydown",this.g,!1,this);Vf(this.a,"click",this.h,!1,this);delete this.a;};
function Fj(a){Bf.call(this,a.a);this.type="action";}t(Fj,Bf);function Ej(a){Bf.call(this,a.a);this.type="beforeaction";}t(Ej,Bf);function Gj(a){F.call(this);this.a=a;a=w?"focusout":"blur";this.g=Nf(this.a,w?"focusin":"focus",this,!w);this.h=Nf(this.a,a,this,!w);}t(Gj,F);Gj.prototype.handleEvent=function(a){var b=new Bf(a.a);b.type="focusin"==a.type||"focus"==a.type?"focusin":"focusout";Yg(this,b);};Gj.prototype.l=function(){Gj.o.l.call(this);Wf(this.g);Wf(this.h);delete this.a;};function Hj(a,b){F.call(this);
this.g=a||1;this.a=b||n;this.h=q(this.Rb,this);this.j=za();}t(Hj,F);m=Hj.prototype;m.Ea=!1;m.Y=null;m.Rb=function(){if(this.Ea){var a=za()-this.j;0<a&&a<.8*this.g?this.Y=this.a.setTimeout(this.h,this.g-a):(this.Y&&(this.a.clearTimeout(this.Y),this.Y=null),Yg(this,"tick"),this.Ea&&(Ij(this),this.start()));}};m.start=function(){this.Ea=!0;this.Y||(this.Y=this.a.setTimeout(this.h,this.g),this.j=za());};function Ij(a){a.Ea=!1;a.Y&&(a.a.clearTimeout(a.Y),a.Y=null);}m.l=function(){Hj.o.l.call(this);Ij(this);
delete this.a;};function Jj(a,b){if(qa(a))b&&(a=q(a,b));else if(a&&"function"==typeof a.handleEvent)a=q(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(0)?-1:n.setTimeout(a,0)}function Kj(a){vf.call(this);this.g=a;this.a={};}t(Kj,vf);var Lj=[];function Mj(a,b,c,d){oa(c)||(c&&(Lj[0]=c.toString()),c=Lj);for(var e=0;e<c.length;e++){var f=Nf(b,c[e],d||a.handleEvent,!1,a.g||a);if(!f)break;a.a[f.key]=f;}}function Nj(a){ib(a.a,function(b,c){this.a.hasOwnProperty(c)&&
Wf(b);},a);a.a={};}Kj.prototype.l=function(){Kj.o.l.call(this);Nj(this);};Kj.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented");};function Oj(a){F.call(this);this.a=null;this.g=a;a=w||sb||vb&&!Db("531")&&"TEXTAREA"==a.tagName;this.h=new Kj(this);Mj(this.h,this.g,a?["keydown","paste","cut","drop","input"]:"input",this);}t(Oj,F);Oj.prototype.handleEvent=function(a){if("input"==a.type)w&&Db(10)&&0==a.keyCode&&0==a.j||(Pj(this),Yg(this,Qj(a)));else if("keydown"!=a.type||
xj(a)){var b="keydown"==a.type?this.g.value:null;w&&229==a.keyCode&&(b=null);var c=Qj(a);Pj(this);this.a=Jj(function(){this.a=null;this.g.value!=b&&Yg(this,c);},this);}};function Pj(a){null!=a.a&&(n.clearTimeout(a.a),a.a=null);}function Qj(a){a=new Bf(a.a);a.type="input";return a}Oj.prototype.l=function(){Oj.o.l.call(this);this.h.m();Pj(this);delete this.g;};function Rj(a,b){F.call(this);a&&(this.Ia&&Sj(this),this.oa=a,this.Ha=Nf(this.oa,"keypress",this,b),this.Ta=Nf(this.oa,"keydown",this.xb,b,this),
this.Ia=Nf(this.oa,"keyup",this.Ab,b,this));}t(Rj,F);m=Rj.prototype;m.oa=null;m.Ha=null;m.Ta=null;m.Ia=null;m.S=-1;m.W=-1;m.Pa=!1;var Tj={3:13,12:144,63232:38,63233:40,63234:37,63235:39,63236:112,63237:113,63238:114,63239:115,63240:116,63241:117,63242:118,63243:119,63244:120,63245:121,63246:122,63247:123,63248:44,63272:46,63273:36,63275:35,63276:33,63277:34,63289:144,63302:45},Uj={Up:38,Down:40,Left:37,Right:39,Enter:13,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,
F12:123,"U+007F":46,Home:36,End:35,PageUp:33,PageDown:34,Insert:45},Vj=!vb||Db("525"),Wj=xb&&ub;m=Rj.prototype;m.xb=function(a){if(vb||sb)if(17==this.S&&!a.ctrlKey||18==this.S&&!a.altKey||xb&&91==this.S&&!a.metaKey)this.W=this.S=-1;-1==this.S&&(a.ctrlKey&&17!=a.keyCode?this.S=17:a.altKey&&18!=a.keyCode?this.S=18:a.metaKey&&91!=a.keyCode&&(this.S=91));Vj&&!zj(a.keyCode,this.S,a.shiftKey,a.ctrlKey,a.altKey,a.metaKey)?this.handleEvent(a):(this.W=Aj(a.keyCode),Wj&&(this.Pa=a.altKey));};m.Ab=function(a){this.W=
this.S=-1;this.Pa=a.altKey;};m.handleEvent=function(a){var b=a.a,c=b.altKey;if(w&&"keypress"==a.type){var d=this.W;var e=13!=d&&27!=d?b.keyCode:0;}else(vb||sb)&&"keypress"==a.type?(d=this.W,e=0<=b.charCode&&63232>b.charCode&&yj(d)?b.charCode:0):rb&&!vb?(d=this.W,e=yj(d)?b.keyCode:0):("keypress"==a.type?(Wj&&(c=this.Pa),b.keyCode==b.charCode?32>b.keyCode?(d=b.keyCode,e=0):(d=this.W,e=b.charCode):(d=b.keyCode||this.W,e=b.charCode||0)):(d=b.keyCode||this.W,e=b.charCode||0),xb&&63==e&&224==d&&(d=191));
var f=d=Aj(d);d?63232<=d&&d in Tj?f=Tj[d]:25==d&&a.shiftKey&&(f=9):b.keyIdentifier&&b.keyIdentifier in Uj&&(f=Uj[b.keyIdentifier]);ub&&Vj&&"keypress"==a.type&&!zj(f,this.S,a.shiftKey,a.ctrlKey,c,a.metaKey)||(a=f==this.S,this.S=f,b=new Xj(f,e,a,b),b.altKey=c,Yg(this,b));};m.N=function(){return this.oa};function Sj(a){a.Ha&&(Wf(a.Ha),Wf(a.Ta),Wf(a.Ia),a.Ha=null,a.Ta=null,a.Ia=null);a.oa=null;a.S=-1;a.W=-1;}m.l=function(){Rj.o.l.call(this);Sj(this);};function Xj(a,b,c,d){Bf.call(this,d);this.type="key";
this.keyCode=a;this.j=b;this.repeat=c;}t(Xj,Bf);function Yj(a,b,c,d){this.top=a;this.right=b;this.bottom=c;this.left=d;}Yj.prototype.toString=function(){return "("+this.top+"t, "+this.right+"r, "+this.bottom+"b, "+this.left+"l)"};Yj.prototype.ceil=function(){this.top=Math.ceil(this.top);this.right=Math.ceil(this.right);this.bottom=Math.ceil(this.bottom);this.left=Math.ceil(this.left);return this};Yj.prototype.floor=function(){this.top=Math.floor(this.top);this.right=Math.floor(this.right);this.bottom=
Math.floor(this.bottom);this.left=Math.floor(this.left);return this};Yj.prototype.round=function(){this.top=Math.round(this.top);this.right=Math.round(this.right);this.bottom=Math.round(this.bottom);this.left=Math.round(this.left);return this};function Zj(a,b){var c=hc(a);return c.defaultView&&c.defaultView.getComputedStyle&&(a=c.defaultView.getComputedStyle(a,null))?a[b]||a.getPropertyValue(b)||"":""}function ak(a){try{var b=a.getBoundingClientRect();}catch(c){return {left:0,top:0,right:0,bottom:0}}w&&
a.ownerDocument.body&&(a=a.ownerDocument,b.left-=a.documentElement.clientLeft+a.body.clientLeft,b.top-=a.documentElement.clientTop+a.body.clientTop);return b}function bk(a,b){b=b||nc(document);var c=b||nc(document);var d=ck(a),e=ck(c);if(!w||9<=Number(Eb)){g=Zj(c,"borderLeftWidth");var f=Zj(c,"borderRightWidth");h=Zj(c,"borderTopWidth");k=Zj(c,"borderBottomWidth");f=new Yj(parseFloat(h),parseFloat(f),parseFloat(k),parseFloat(g));}else{var g=dk(c,"borderLeft");f=dk(c,"borderRight");var h=dk(c,"borderTop"),
k=dk(c,"borderBottom");f=new Yj(h,f,k,g);}c==nc(document)?(g=d.a-c.scrollLeft,d=d.g-c.scrollTop,!w||10<=Number(Eb)||(g+=f.left,d+=f.top)):(g=d.a-e.a-f.left,d=d.g-e.g-f.top);e=a.offsetWidth;f=a.offsetHeight;h=vb&&!e&&!f;ha(e)&&!h||!a.getBoundingClientRect?a=new ec(e,f):(a=ak(a),a=new ec(a.right-a.left,a.bottom-a.top));e=c.clientHeight-a.height;f=c.scrollLeft;h=c.scrollTop;f+=Math.min(g,Math.max(g-(c.clientWidth-a.width),0));h+=Math.min(d,Math.max(d-e,0));c=new dc(f,h);b.scrollLeft=c.a;b.scrollTop=c.g;}
function ck(a){var b=hc(a),c=new dc(0,0);var d=b?hc(b):document;d=!w||9<=Number(Eb)||"CSS1Compat"==fc(d).a.compatMode?d.documentElement:d.body;if(a==d)return c;a=ak(a);d=fc(b).a;b=nc(d);d=d.parentWindow||d.defaultView;b=w&&Db("10")&&d.pageYOffset!=b.scrollTop?new dc(b.scrollLeft,b.scrollTop):new dc(d.pageXOffset||b.scrollLeft,d.pageYOffset||b.scrollTop);c.a=a.left+b.a;c.g=a.top+b.g;return c}var ek={thin:2,medium:4,thick:6};function dk(a,b){if("none"==(a.currentStyle?a.currentStyle[b+"Style"]:null))return 0;
var c=a.currentStyle?a.currentStyle[b+"Width"]:null;if(c in ek)a=ek[c];else if(/^\d+px?$/.test(c))a=parseInt(c,10);else{b=a.style.left;var d=a.runtimeStyle.left;a.runtimeStyle.left=a.currentStyle.left;a.style.left=c;c=a.style.pixelLeft;a.style.left=b;a.runtimeStyle.left=d;a=+c;}return a}function fk(){}la(fk);fk.prototype.a=0;function gk(a){F.call(this);this.w=a||fc();this.Ya=null;this.la=!1;this.j=null;this.I=void 0;this.xa=this.za=this.Z=null;}t(gk,F);m=gk.prototype;m.Cb=fk.Sa();m.N=function(){return this.j};
function K(a,b){return a.j?kc(b,a.j||a.w.a):null}function hk(a){a.I||(a.I=new Kj(a));return a.I}m.Ua=function(a){if(this.Z&&this.Z!=a)throw Error("Method not supported");gk.o.Ua.call(this,a);};m.eb=function(){this.j=this.w.a.createElement("DIV");};m.render=function(a){if(this.la)throw Error("Component already rendered");this.j||this.eb();a?a.insertBefore(this.j,null):this.w.a.body.appendChild(this.j);this.Z&&!this.Z.la||this.u();};m.u=function(){this.la=!0;ik(this,function(a){!a.la&&a.N()&&a.u();});};
m.ua=function(){ik(this,function(a){a.la&&a.ua();});this.I&&Nj(this.I);this.la=!1;};m.l=function(){this.la&&this.ua();this.I&&(this.I.m(),delete this.I);ik(this,function(a){a.m();});this.j&&oc(this.j);this.Z=this.j=this.xa=this.za=null;gk.o.l.call(this);};function ik(a,b){a.za&&Ha(a.za,b,void 0);}m.removeChild=function(a,b){if(a){var c=p(a)?a:a.Ya||(a.Ya=":"+(a.Cb.a++).toString(36));this.xa&&c?(a=this.xa,a=(null!==a&&c in a?a[c]:void 0)||null):a=null;if(c&&a){var d=this.xa;c in d&&delete d[c];Pa(this.za,
a);b&&(a.ua(),a.j&&oc(a.j));b=a;if(null==b)throw Error("Unable to set parent component");b.Z=null;gk.o.Ua.call(b,null);}}if(!a)throw Error("Child is not in parent component");return a};function L(a,b){var c=qc(a,"firebaseui-textfield");b?(vj(a,"firebaseui-input-invalid"),uj(a,"firebaseui-input"),c&&vj(c,"firebaseui-textfield-invalid")):(vj(a,"firebaseui-input"),uj(a,"firebaseui-input-invalid"),c&&uj(c,"firebaseui-textfield-invalid"));}function jk(a,b,c){b=new Oj(b);yf(a,xa(zf,b));Mj(hk(a),b,"input",
c);}function kk(a,b,c){b=new Rj(b);yf(a,xa(zf,b));Mj(hk(a),b,"key",function(d){13==d.keyCode&&(d.stopPropagation(),d.preventDefault(),c(d));});}function lk(a,b,c){b=new Gj(b);yf(a,xa(zf,b));Mj(hk(a),b,"focusin",c);}function mk(a,b,c){b=new Gj(b);yf(a,xa(zf,b));Mj(hk(a),b,"focusout",c);}function M(a,b,c){b=new Cj(b);yf(a,xa(zf,b));Mj(hk(a),b,"action",function(d){d.stopPropagation();d.preventDefault();c(d);});}function nk(a){uj(a,"firebaseui-hidden");}function N(a,b){b&&pc(a,b);vj(a,"firebaseui-hidden");}function ok(a){return !tj(a,
"firebaseui-hidden")&&"none"!=a.style.display}function pk(a){a=a||{};var b=a.email,c=a.disabled,d='<div class="firebaseui-textfield mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><label class="mdl-textfield__label firebaseui-label" for="email">';d=a.gc?d+"Enter new email address":d+"Email";d+='</label><input type="email" name="email" autocomplete="username" class="mdl-textfield__input firebaseui-input firebaseui-id-email" value="'+qd(null!=b?b:"")+'"'+(c?"disabled":"")+'></div><div class="firebaseui-error-wrapper"><p class="firebaseui-error firebaseui-text-input-error firebaseui-hidden firebaseui-id-email-error"></p></div>';
return y(d)}function qk(a){a=a||{};a=a.label;var b='<button type="submit" class="firebaseui-id-submit firebaseui-button mdl-button mdl-js-button mdl-button--raised mdl-button--colored">';b=a?b+x(a):b+"Next";return y(b+"</button>")}function rk(){var a=""+qk({label:A("Sign In")});return y(a)}function sk(){var a=""+qk({label:A("Save")});return y(a)}function tk(){var a=""+qk({label:A("Continue")});return y(a)}function uk(a){a=a||{};a=a.label;var b='<div class="firebaseui-new-password-component"><div class="firebaseui-textfield mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><label class="mdl-textfield__label firebaseui-label" for="newPassword">';
b=a?b+x(a):b+"Choose password";return y(b+'</label><input type="password" name="newPassword" autocomplete="new-password" class="mdl-textfield__input firebaseui-input firebaseui-id-new-password"></div><a href="javascript:void(0)" class="firebaseui-input-floating-button firebaseui-id-password-toggle firebaseui-input-toggle-on firebaseui-input-toggle-blur"></a><div class="firebaseui-error-wrapper"><p class="firebaseui-error firebaseui-text-input-error firebaseui-hidden firebaseui-id-new-password-error"></p></div></div>')}
function vk(){var b='<div class="firebaseui-textfield mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><label class="mdl-textfield__label firebaseui-label" for="password">';b=b+"Password";return y(b+'</label><input type="password" name="password" autocomplete="current-password" class="mdl-textfield__input firebaseui-input firebaseui-id-password"></div><div class="firebaseui-error-wrapper"><p class="firebaseui-error firebaseui-text-input-error firebaseui-hidden firebaseui-id-password-error"></p></div>')}
function wk(){return y('<a class="firebaseui-link firebaseui-id-secondary-link" href="javascript:void(0)">Trouble signing in?</a>')}function xk(a){a=a||{};a=a.label;var b='<button class="firebaseui-id-secondary-link firebaseui-button mdl-button mdl-js-button mdl-button--primary">';b=a?b+x(a):b+"Cancel";return y(b+"</button>")}function yk(a){var b="";a.H&&a.G&&(b+='<ul class="firebaseui-tos-list firebaseui-tos"><li class="firebaseui-inline-list-item"><a href="javascript:void(0)" class="firebaseui-link firebaseui-tos-link" target="_blank">Terms of Service</a></li><li class="firebaseui-inline-list-item"><a href="javascript:void(0)" class="firebaseui-link firebaseui-pp-link" target="_blank">Privacy Policy</a></li></ul>');
return y(b)}function zk(a){var b="";a.H&&a.G&&(b+='<p class="firebaseui-tos firebaseui-tospp-full-message">By continuing, you are indicating that you accept our <a href="javascript:void(0)" class="firebaseui-link firebaseui-tos-link" target="_blank">Terms of Service</a> and <a href="javascript:void(0)" class="firebaseui-link firebaseui-pp-link" target="_blank">Privacy Policy</a>.</p>');return y(b)}function Ak(a){a='<div class="firebaseui-info-bar firebaseui-id-info-bar"><p class="firebaseui-info-bar-message">'+
x(a.message)+'&nbsp;&nbsp;<a href="javascript:void(0)" class="firebaseui-link firebaseui-id-dismiss-info-bar">Dismiss</a></p></div>';return y(a)}Ak.B="firebaseui.auth.soy2.element.infoBar";function Bk(a){var b=a.content;a=a.qb;return y('<dialog class="mdl-dialog firebaseui-dialog firebaseui-id-dialog'+(a?" "+qd(a):"")+'">'+x(b)+"</dialog>")}function Ck(a){var b=a.message;return y(Bk({content:pd('<div class="firebaseui-dialog-icon-wrapper"><div class="'+qd(a.Ga)+' firebaseui-dialog-icon"></div></div><div class="firebaseui-progress-dialog-message">'+
x(b)+"</div>")}))}Ck.B="firebaseui.auth.soy2.element.progressDialog";function Dk(a){var b='<div class="firebaseui-list-box-actions">';a=a.items;for(var c=a.length,d=0;d<c;d++){var e=a[d];b+='<button type="button" data-listboxid="'+qd(e.id)+'" class="mdl-button firebaseui-id-list-box-dialog-button firebaseui-list-box-dialog-button">'+(e.Ga?'<div class="firebaseui-list-box-icon-wrapper"><div class="firebaseui-list-box-icon '+qd(e.Ga)+'"></div></div>':"")+'<div class="firebaseui-list-box-label-wrapper">'+
x(e.label)+"</div></button>";}b=""+Bk({qb:A("firebaseui-list-box-dialog"),content:pd(b+"</div>")});return y(b)}Dk.B="firebaseui.auth.soy2.element.listBoxDialog";function Ek(a){a=a||{};return y(a.Tb?'<div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active firebaseui-busy-indicator firebaseui-id-busy-indicator"></div>':'<div class="mdl-progress mdl-js-progress mdl-progress__indeterminate firebaseui-busy-indicator firebaseui-id-busy-indicator"></div>')}Ek.B="firebaseui.auth.soy2.element.busyIndicator";
function Fk(a){a=a||{};a=a.ma;var b="";if(a.hb)b+=a.hb;else switch(a.providerId){case "google.com":b+="Google";break;case "github.com":b+="GitHub";break;case "facebook.com":b+="Facebook";break;case "twitter.com":b+="Twitter";break;case "anonymous":b+="Guest";break;default:b+="Password";}return z(b)}function Gk(a){Hk(a,"upgradeElement");}function Ik(a){Hk(a,"downgradeElements");}var Jk=["mdl-js-textfield","mdl-js-progress","mdl-js-spinner","mdl-js-button"];function Hk(a,b){a&&window.componentHandler&&
window.componentHandler[b]&&Ha(Jk,function(c){if(tj(a,c))window.componentHandler[b](a);Ha(ic(c,a),function(d){window.componentHandler[b](d);});});}function Kk(a,b,c){Lk.call(this);document.body.appendChild(a);a.showModal||window.dialogPolyfill.registerDialog(a);a.showModal();Gk(a);b&&M(this,a,function(f){var g=a.getBoundingClientRect();(f.clientX<g.left||g.left+g.width<f.clientX||f.clientY<g.top||g.top+g.height<f.clientY)&&Lk.call(this);});if(!c){var d=this.N().parentElement||this.N().parentNode;if(d){var e=
this;this.ba=function(){if(a.open){var f=a.getBoundingClientRect().height,g=d.getBoundingClientRect().height,h=d.getBoundingClientRect().top-document.body.getBoundingClientRect().top,k=d.getBoundingClientRect().left-document.body.getBoundingClientRect().left,l=a.getBoundingClientRect().width,v=d.getBoundingClientRect().width;a.style.top=(h+(g-f)/2).toString()+"px";f=k+(v-l)/2;a.style.left=f.toString()+"px";a.style.right=(document.body.getBoundingClientRect().width-f-l).toString()+"px";}else window.removeEventListener("resize",
e.ba);};this.ba();window.addEventListener("resize",this.ba,!1);}}}function Lk(){var a=Mk.call(this);a&&(Ik(a),a.open&&a.close(),oc(a),this.ba&&window.removeEventListener("resize",this.ba));}function Mk(){return kc("firebaseui-id-dialog")}function Nk(){oc(Ok.call(this));}function Ok(){return K(this,"firebaseui-id-info-bar")}function Pk(){return K(this,"firebaseui-id-dismiss-info-bar")}var Qk={yb:"https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",wb:"https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/github.svg",
tb:"https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg",Sb:"https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/twitter.svg",Eb:"https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/mail.svg",Gb:"https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/phone.svg",nb:"https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/anonymous.png"};function Rk(a,b,c){Af.call(this,a,b);for(var d in c)this[d]=c[d];}t(Rk,Af);function O(a,b,c,d,e){gk.call(this,c);this.$a=a;this.Za=b;this.Aa=
!1;this.Ma=d||null;this.v=this.ea=null;this.$=jb(Qk);lb(this.$,e||{});}t(O,gk);m=O.prototype;m.eb=function(){var a=fd(this.$a,this.Za,this.$,this.w);Gk(a);this.j=a;};m.u=function(){O.o.u.call(this);bh(P(this),new Rk("pageEnter",P(this),{pageId:this.Ma}));if(this.Xa()&&this.$.H){var a=this.$.H;M(this,this.Xa(),function(){a();});}if(this.Wa()&&this.$.G){var b=this.$.G;M(this,this.Wa(),function(){b();});}};m.ua=function(){bh(P(this),new Rk("pageExit",P(this),{pageId:this.Ma}));O.o.ua.call(this);};m.l=function(){window.clearTimeout(this.ea);
this.Za=this.$a=this.ea=null;this.Aa=!1;this.v=null;Ik(this.N());O.o.l.call(this);};function Sk(a){a.Aa=!0;var b=tj(a.N(),"firebaseui-use-spinner");a.ea=window.setTimeout(function(){a.N()&&null===a.v&&(a.v=fd(Ek,{Tb:b},null,a.w),a.N().appendChild(a.v),Gk(a.v));},500);}m.M=function(a,b,c,d){function e(){if(f.O)return null;f.Aa=!1;window.clearTimeout(f.ea);f.ea=null;f.v&&(Ik(f.v),oc(f.v),f.v=null);}var f=this;if(f.Aa)return null;Sk(f);return a.apply(null,b).then(c,d).then(e,e)};function P(a){return a.N().parentElement||
a.N().parentNode}function Tk(a,b,c){kk(a,b,function(){c.focus();});}function Uk(a,b,c){kk(a,b,function(){c();});}r(O.prototype,{g:function(a){Nk.call(this);var b=fd(Ak,{message:a},null,this.w);this.N().appendChild(b);M(this,Pk.call(this),function(){oc(b);});},ic:Nk,lc:Ok,kc:Pk,X:function(a,b){a=fd(Ck,{Ga:a,message:b},null,this.w);Kk.call(this,a);},h:Lk,pb:Mk,nc:function(){return K(this,"firebaseui-tos")},Xa:function(){return K(this,"firebaseui-tos-link")},Wa:function(){return K(this,"firebaseui-pp-link")},
oc:function(){return K(this,"firebaseui-tos-list")}});function Vk(a,b,c){a=a||{};b=a.Qa;var d=a.ga;a='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-sign-in"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Sign in with email</h1></div><div class="firebaseui-card-content"><div class="firebaseui-relative-wrapper">'+pk(a)+'</div></div><div class="firebaseui-card-actions"><div class="firebaseui-form-actions">'+(b?xk(null):"")+
qk(null)+'</div></div><div class="firebaseui-card-footer">'+(d?zk(c):yk(c))+"</div></form></div>";return y(a)}Vk.B="firebaseui.auth.soy2.page.signIn";function Wk(a,b,c){a=a||{};b=a.ga;a='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-sign-in"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Sign in</h1></div><div class="firebaseui-card-content">'+pk(a)+vk()+'</div><div class="firebaseui-card-actions"><div class="firebaseui-form-links">'+
wk()+'</div><div class="firebaseui-form-actions">'+rk()+'</div></div><div class="firebaseui-card-footer">'+(b?zk(c):yk(c))+"</div></form></div>";return y(a)}Wk.B="firebaseui.auth.soy2.page.passwordSignIn";function Xk(a,b,c){a=a||{};var d=a.Ib;b=a.Oa;var e=a.ga,f='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-sign-up"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Create account</h1></div><div class="firebaseui-card-content">'+
pk(a);d?(a=a||{},a=a.name,a='<div class="firebaseui-textfield mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><label class="mdl-textfield__label firebaseui-label" for="name">First &amp; last name</label><input type="text" name="name" autocomplete="name" class="mdl-textfield__input firebaseui-input firebaseui-id-name" value="'+qd(null!=a?a:"")+'"></div><div class="firebaseui-error-wrapper"><p class="firebaseui-error firebaseui-text-input-error firebaseui-hidden firebaseui-id-name-error"></p></div>',
a=y(a)):a="";c=f+a+uk(null)+'</div><div class="firebaseui-card-actions"><div class="firebaseui-form-actions">'+(b?xk(null):"")+sk()+'</div></div><div class="firebaseui-card-footer">'+(e?zk(c):yk(c))+"</div></form></div>";return y(c)}Xk.B="firebaseui.auth.soy2.page.passwordSignUp";function Yk(a,b,c){a=a||{};b=a.Oa;a='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-recovery"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Recover password</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">Get instructions sent to this email that explain how to reset your password</p>'+
pk(a)+'</div><div class="firebaseui-card-actions"><div class="firebaseui-form-actions">'+(b?xk(null):"")+qk({label:A("Send")})+'</div></div><div class="firebaseui-card-footer">'+yk(c)+"</div></form></div>";return y(a)}Yk.B="firebaseui.auth.soy2.page.passwordRecovery";function Zk(a,b,c){b=a.T;var d="";a="Follow the instructions sent to <strong>"+(x(a.email)+"</strong> to recover your password");d+='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-recovery-email-sent"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Check your email</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">'+
a+'</p></div><div class="firebaseui-card-actions">';b&&(d+='<div class="firebaseui-form-actions">'+qk({label:A("Done")})+"</div>");d+='</div><div class="firebaseui-card-footer">'+yk(c)+"</div></div>";return y(d)}Zk.B="firebaseui.auth.soy2.page.passwordRecoveryEmailSent";function $k(a,b,c){return y('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-callback"><div class="firebaseui-callback-indicator-container">'+Ek(null)+"</div></div>")}$k.B="firebaseui.auth.soy2.page.callback";
function al(){return y('<div class="firebaseui-container firebaseui-id-page-blank firebaseui-use-spinner"></div>')}al.B="firebaseui.auth.soy2.page.blank";function bl(a,b,c){b="";a="A sign-in email with additional instructions was sent to <strong>"+(x(a.email)+"</strong>. Check your email to complete sign-in.");var d=y('<a class="firebaseui-link firebaseui-id-trouble-getting-email-link" href="javascript:void(0)">Trouble getting email?</a>');b+='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-link-sign-in-sent"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Sign-in email sent</h1></div><div class="firebaseui-card-content"><div class="firebaseui-email-sent"></div><p class="firebaseui-text">'+
a+'</p></div><div class="firebaseui-card-actions"><div class="firebaseui-form-links">'+d+'</div><div class="firebaseui-form-actions">'+xk({label:A("Back")})+'</div></div><div class="firebaseui-card-footer">'+yk(c)+"</div></form></div>";return y(b)}bl.B="firebaseui.auth.soy2.page.emailLinkSignInSent";function cl(a,b,c){a='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-not-received"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Trouble getting email?</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">Try these common fixes:<ul><li>Check if the email was marked as spam or filtered.</li><li>Check your internet connection.</li><li>Check that you did not misspell your email.</li><li>Check that your inbox space is not running out or other inbox settings related issues.</li></ul></p><p class="firebaseui-text">If the steps above didn\'t work, you can resend the email. Note that this will deactivate the link in the older email.</p></div><div class="firebaseui-card-actions"><div class="firebaseui-form-links">'+
y('<a class="firebaseui-link firebaseui-id-resend-email-link" href="javascript:void(0)">Resend</a>')+'</div><div class="firebaseui-form-actions">'+xk({label:A("Back")})+'</div></div><div class="firebaseui-card-footer">'+yk(c)+"</div></form></div>";return y(a)}cl.B="firebaseui.auth.soy2.page.emailNotReceived";function dl(a,b,c){a='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-link-sign-in-confirmation"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Confirm email</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">Confirm your email to complete sign in</p><div class="firebaseui-relative-wrapper">'+
pk(a)+'</div></div><div class="firebaseui-card-actions"><div class="firebaseui-form-actions">'+xk(null)+qk(null)+'</div></div><div class="firebaseui-card-footer">'+yk(c)+"</div></form></div>";return y(a)}dl.B="firebaseui.auth.soy2.page.emailLinkSignInConfirmation";function el(){var a='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-different-device-error"><div class="firebaseui-card-header"><h1 class="firebaseui-title">New device or browser detected</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">Try opening the link using the same device or browser where you started the sign-in process.</p></div><div class="firebaseui-card-actions"><div class="firebaseui-form-actions">'+
xk({label:A("Dismiss")})+"</div></div></div>";return y(a)}el.B="firebaseui.auth.soy2.page.differentDeviceError";function fl(){var a='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-anonymous-user-mismatch"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Session ended</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">The session associated with this sign-in request has either expired or was cleared.</p></div><div class="firebaseui-card-actions"><div class="firebaseui-form-actions">'+
xk({label:A("Dismiss")})+"</div></div></div>";return y(a)}fl.B="firebaseui.auth.soy2.page.anonymousUserMismatch";function gl(a,b,c){b="";a="You\u2019ve already used <strong>"+(x(a.email)+"</strong> to sign in. Enter your password for that account.");b+='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-linking"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Sign in</h1></div><div class="firebaseui-card-content"><h2 class="firebaseui-subtitle">You already have an account</h2><p class="firebaseui-text">'+
a+"</p>"+vk()+'</div><div class="firebaseui-card-actions"><div class="firebaseui-form-links">'+wk()+'</div><div class="firebaseui-form-actions">'+rk()+'</div></div><div class="firebaseui-card-footer">'+yk(c)+"</div></form></div>";return y(b)}gl.B="firebaseui.auth.soy2.page.passwordLinking";function hl(a,b,c){var d=a.email;b="";a=""+Fk(a);a=A(a);d="You\u2019ve already used <strong>"+(x(d)+("</strong>. You can connect your <strong>"+(x(a)+("</strong> account with <strong>"+(x(d)+"</strong> by signing in with email link below.")))));
a="For this flow to successfully connect your "+(x(a)+" account with this email, you have to open the link on the same device or browser.");b+='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-link-sign-in-linking"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Sign in</h1></div><div class="firebaseui-card-content"><h2 class="firebaseui-subtitle">You already have an account</h2><p class="firebaseui-text firebaseui-text-justify">'+
d+'<p class="firebaseui-text firebaseui-text-justify">'+a+'</p></div><div class="firebaseui-card-actions"><div class="firebaseui-form-actions">'+rk()+'</div></div><div class="firebaseui-card-footer">'+yk(c)+"</div></form></div>";return y(b)}hl.B="firebaseui.auth.soy2.page.emailLinkSignInLinking";function il(a,b,c){b="";var d=""+Fk(a);d=A(d);a="You originally intended to connect <strong>"+(x(d)+"</strong> to your email account but have opened the link on a different device where you are not signed in.");
d="If you still want to connect your <strong>"+(x(d)+"</strong> account, open the link on the same device where you started sign-in. Otherwise, tap Continue to sign-in on this device.");b+='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-link-sign-in-linking-different-device"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Sign in</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text firebaseui-text-justify">'+
a+'</p><p class="firebaseui-text firebaseui-text-justify">'+d+'</p></div><div class="firebaseui-card-actions"><div class="firebaseui-form-actions">'+tk()+'</div></div><div class="firebaseui-card-footer">'+yk(c)+"</div></form></div>";return y(b)}il.B="firebaseui.auth.soy2.page.emailLinkSignInLinkingDifferentDevice";function jl(a,b,c){var d=a.email;b="";a=""+Fk(a);a=A(a);d="You\u2019ve already used <strong>"+(x(d)+("</strong>. Sign in with "+(x(a)+" to continue.")));b+='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-federated-linking"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Sign in</h1></div><div class="firebaseui-card-content"><h2 class="firebaseui-subtitle">You already have an account</h2><p class="firebaseui-text">'+
d+'</p></div><div class="firebaseui-card-actions"><div class="firebaseui-form-actions">'+qk({label:A("Sign in with "+a)})+'</div></div><div class="firebaseui-card-footer">'+yk(c)+"</div></form></div>";return y(b)}jl.B="firebaseui.auth.soy2.page.federatedLinking";function kl(a,b,c){b="";a="To continue sign in with <strong>"+(x(a.email)+"</strong> on this device, you have to recover the password.");b+='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-unsupported-provider"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Sign in</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">'+
a+'</p></div><div class="firebaseui-card-actions"><div class="firebaseui-form-actions">'+xk(null)+qk({label:A("Recover password")})+'</div></div><div class="firebaseui-card-footer">'+yk(c)+"</div></form></div>";return y(b)}kl.B="firebaseui.auth.soy2.page.unsupportedProvider";function ll(a){var b="",c='<p class="firebaseui-text">for <strong>'+(x(a.email)+"</strong></p>");b+='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-reset"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Reset your password</h1></div><div class="firebaseui-card-content">'+
c+uk(od(a))+'</div><div class="firebaseui-card-actions"><div class="firebaseui-form-actions">'+sk()+"</div></div></form></div>";return y(b)}ll.B="firebaseui.auth.soy2.page.passwordReset";function ml(a){a=a||{};a='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-reset-success"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Password changed</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">You can now sign in with your new password</p></div><div class="firebaseui-card-actions">'+
(a.T?'<div class="firebaseui-form-actions">'+tk()+"</div>":"")+"</div></div>";return y(a)}ml.B="firebaseui.auth.soy2.page.passwordResetSuccess";function nl(a){a=a||{};a='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-reset-failure"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Try resetting your password again</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">Your request to reset your password has expired or the link has already been used</p></div><div class="firebaseui-card-actions">'+
(a.T?'<div class="firebaseui-form-actions">'+qk(null)+"</div>":"")+"</div></div>";return y(a)}nl.B="firebaseui.auth.soy2.page.passwordResetFailure";function ol(a){var b=a.T,c="";a="Your sign-in email address has been changed back to <strong>"+(x(a.email)+"</strong>.");c+='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-change-revoke-success"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Updated email address</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">'+
a+'</p><p class="firebaseui-text">If you didn\u2019t ask to change your sign-in email, it\u2019s possible someone is trying to access your account and you should <a class="firebaseui-link firebaseui-id-reset-password-link" href="javascript:void(0)">change your password right away</a>.</p></div><div class="firebaseui-card-actions">'+(b?'<div class="firebaseui-form-actions">'+qk(null)+"</div>":"")+"</div></form></div>";return y(c)}ol.B="firebaseui.auth.soy2.page.emailChangeRevokeSuccess";function pl(a){a=
a||{};a='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-change-revoke-failure"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Unable to update your email address</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">There was a problem changing your sign-in email back.</p><p class="firebaseui-text">If you try again and still can\u2019t reset your email, try asking your administrator for help.</p></div><div class="firebaseui-card-actions">'+
(a.T?'<div class="firebaseui-form-actions">'+qk(null)+"</div>":"")+"</div></div>";return y(a)}pl.B="firebaseui.auth.soy2.page.emailChangeRevokeFailure";function ql(a){a=a||{};a='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-verification-success"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Your email has been verified</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">You can now sign in with your new account</p></div><div class="firebaseui-card-actions">'+
(a.T?'<div class="firebaseui-form-actions">'+tk()+"</div>":"")+"</div></div>";return y(a)}ql.B="firebaseui.auth.soy2.page.emailVerificationSuccess";function rl(a){a=a||{};a='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-verification-failure"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Try verifying your email again</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">Your request to verify your email has expired or the link has already been used</p></div><div class="firebaseui-card-actions">'+
(a.T?'<div class="firebaseui-form-actions">'+qk(null)+"</div>":"")+"</div></div>";return y(a)}rl.B="firebaseui.auth.soy2.page.emailVerificationFailure";function sl(a){a='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-unrecoverable-error"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Error encountered</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">'+x(a.errorMessage)+"</p></div></div>";return y(a)}sl.B="firebaseui.auth.soy2.page.unrecoverableError";
function tl(a,b,c){var d=a.Fb;b="";a="Continue with "+(x(a.Ub)+"?");d="You originally wanted to sign in with "+x(d);b+='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-mismatch"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Sign in</h1></div><div class="firebaseui-card-content"><h2 class="firebaseui-subtitle">'+a+'</h2><p class="firebaseui-text">'+d+'</p></div><div class="firebaseui-card-actions"><div class="firebaseui-form-actions">'+
xk(null)+qk({label:A("Continue")})+'</div></div><div class="firebaseui-card-footer">'+yk(c)+"</div></form></div>";return y(b)}tl.B="firebaseui.auth.soy2.page.emailMismatch";function ul(a,b,c){var d='<div class="firebaseui-container firebaseui-page-provider-sign-in firebaseui-id-page-provider-sign-in firebaseui-use-spinner"><div class="firebaseui-card-content"><form onsubmit="return false;"><ul class="firebaseui-idp-list">';a=a.Hb;b=a.length;for(var e=0;e<b;e++){var f={ma:a[e]};var g=c;f=f||{};var h=
f.ma,k=f;k=k||{};var l="";switch(k.ma.providerId){case "google.com":l+="firebaseui-idp-google";break;case "github.com":l+="firebaseui-idp-github";break;case "facebook.com":l+="firebaseui-idp-facebook";break;case "twitter.com":l+="firebaseui-idp-twitter";break;case "phone":l+="firebaseui-idp-phone";break;case "anonymous":l+="firebaseui-idp-anonymous";break;case "password":l+="firebaseui-idp-password";break;default:l+="firebaseui-idp-generic";}k='<button class="firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised '+
qd(z(l))+' firebaseui-id-idp-button" data-provider-id="'+qd(h.providerId)+'" style="background-color:';l=h.ob;null!=l&&l.da===cd?l=l.content:null==l?l="":l instanceof Vb?l instanceof Vb&&l.constructor===Vb&&l.g===Wb?l=l.a:(Fa("expected object of type SafeStyle, got '"+l+"' of type "+ma(l)),l="type_error:SafeStyle"):(l=String(l),Cd.test(l)||(Fa("Bad value `%s` for |filterCssValue",[l]),l="zSoyz"));k=k+qd(l)+'"><span class="firebaseui-idp-icon-wrapper"><img class="firebaseui-idp-icon" alt="" src="';
l=(l=f)||{};l=l.ma;var v="";if(l.fb)v+=wd(l.fb);else switch(l.providerId){case "google.com":v+=wd(g.yb);break;case "github.com":v+=wd(g.wb);break;case "facebook.com":v+=wd(g.tb);break;case "twitter.com":v+=wd(g.Sb);break;case "phone":v+=wd(g.Gb);break;case "anonymous":v+=wd(g.nb);break;default:v+=wd(g.Eb);}g=nd(v);g=k+qd(wd(g))+'"></span>';"password"==h.providerId?g+='<span class="firebaseui-idp-text firebaseui-idp-text-long">Sign in with email</span><span class="firebaseui-idp-text firebaseui-idp-text-short">Email</span>':
"phone"==h.providerId?g+='<span class="firebaseui-idp-text firebaseui-idp-text-long">Sign in with phone</span><span class="firebaseui-idp-text firebaseui-idp-text-short">Phone</span>':"anonymous"==h.providerId?g+='<span class="firebaseui-idp-text firebaseui-idp-text-long">Continue as guest</span><span class="firebaseui-idp-text firebaseui-idp-text-short">Guest</span>':(h="Sign in with "+x(Fk(f)),g+='<span class="firebaseui-idp-text firebaseui-idp-text-long">'+h+'</span><span class="firebaseui-idp-text firebaseui-idp-text-short">'+
x(Fk(f))+"</span>");f=y(g+"</button>");d+='<li class="firebaseui-list-item">'+f+"</li>";}d+='</ul></form></div><div class="firebaseui-card-footer firebaseui-provider-sign-in-footer">'+zk(c)+"</div></div>";return y(d)}ul.B="firebaseui.auth.soy2.page.providerSignIn";function vl(a,b,c){a=a||{};var d=a.sb,e=a.Qa;b=a.ga;a=a||{};a=a.va;a='<div class="firebaseui-phone-number"><button class="firebaseui-id-country-selector firebaseui-country-selector mdl-button mdl-js-button"><span class="firebaseui-flag firebaseui-country-selector-flag firebaseui-id-country-selector-flag"></span><span class="firebaseui-id-country-selector-code"></span></button><div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label firebaseui-textfield firebaseui-phone-input-wrapper"><label class="mdl-textfield__label firebaseui-label" for="phoneNumber">Phone number</label><input type="tel" name="phoneNumber" class="mdl-textfield__input firebaseui-input firebaseui-id-phone-number" value="'+
qd(null!=a?a:"")+'"></div></div><div class="firebaseui-error-wrapper"><p class="firebaseui-error firebaseui-text-input-error firebaseui-hidden firebaseui-phone-number-error firebaseui-id-phone-number-error"></p></div>';a='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-phone-sign-in-start"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Enter your phone number</h1></div><div class="firebaseui-card-content"><div class="firebaseui-relative-wrapper">'+
y(a);var f;d?f=y('<div class="firebaseui-recaptcha-wrapper"><div class="firebaseui-recaptcha-container"></div><div class="firebaseui-error-wrapper firebaseui-recaptcha-error-wrapper"><p class="firebaseui-error firebaseui-hidden firebaseui-id-recaptcha-error"></p></div></div>'):f="";f=a+f+'</div></div><div class="firebaseui-card-actions"><div class="firebaseui-form-actions">'+(e?xk(null):"")+qk({label:A("Verify")})+'</div></div><div class="firebaseui-card-footer">';b?(b='<p class="firebaseui-tos firebaseui-phone-tos">',
b=c.H&&c.G?b+'By tapping Verify, you are indicating that you accept our <a href="javascript:void(0)" class="firebaseui-link firebaseui-tos-link" target="_blank">Terms of Service</a> and <a href="javascript:void(0)" class="firebaseui-link firebaseui-pp-link" target="_blank">Privacy Policy</a>. An SMS may be sent. Message &amp; data rates may apply.':b+"By tapping Verify, an SMS may be sent. Message &amp; data rates may apply.",c=y(b+"</p>")):c=y('<p class="firebaseui-tos firebaseui-phone-sms-notice">By tapping Verify, an SMS may be sent. Message &amp; data rates may apply.</p>')+
yk(c);return y(f+c+"</div></form></div>")}vl.B="firebaseui.auth.soy2.page.phoneSignInStart";function wl(a,b,c){a=a||{};b=a.phoneNumber;var d="";a='Enter the 6-digit code we sent to <a class="firebaseui-link firebaseui-change-phone-number-link firebaseui-id-change-phone-number-link" href="javascript:void(0)">&lrm;'+(x(b)+"</a>");x(b);b=d;d=y('<div class="firebaseui-textfield mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><label class="mdl-textfield__label firebaseui-label" for="phoneConfirmationCode">6-digit code</label><input type="number" name="phoneConfirmationCode" class="mdl-textfield__input firebaseui-input firebaseui-id-phone-confirmation-code"></div><div class="firebaseui-error-wrapper"><p class="firebaseui-error firebaseui-text-input-error firebaseui-hidden firebaseui-id-phone-confirmation-code-error"></p></div>');
c='<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-phone-sign-in-finish"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Verify your phone number</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">'+a+"</p>"+d+'</div><div class="firebaseui-card-actions"><div class="firebaseui-form-actions">'+xk(null)+qk({label:A("Continue")})+'</div></div><div class="firebaseui-card-footer">'+yk(c)+"</div></form>";
a=y('<div class="firebaseui-resend-container"><span class="firebaseui-id-resend-countdown"></span><a href="javascript:void(0)" class="firebaseui-id-resend-link firebaseui-hidden firebaseui-link">Resend</a></div>');return y(b+(c+a+"</div>"))}wl.B="firebaseui.auth.soy2.page.phoneSignInFinish";function xl(){return K(this,"firebaseui-id-submit")}function Q(){return K(this,"firebaseui-id-secondary-link")}function yl(a,b){M(this,xl.call(this),function(d){a(d);});var c=Q.call(this);c&&b&&M(this,c,function(d){b(d);});}
function zl(){return K(this,"firebaseui-id-password")}function Al(){return K(this,"firebaseui-id-password-error")}function Bl(){var a=zl.call(this),b=Al.call(this);jk(this,a,function(){ok(b)&&(L(a,!0),nk(b));});}function Cl(){var a=zl.call(this);var b=Al.call(this);J(a)?(L(a,!0),nk(b),b=!0):(L(a,!1),N(b,z("Enter your password").toString()),b=!1);return b?J(a):null}function Dl(a,b,c,d,e,f){O.call(this,gl,{email:a},f,"passwordLinking",{H:d,G:e});this.a=b;this.L=c;}t(Dl,O);Dl.prototype.u=function(){this.R();
this.P(this.a,this.L);Uk(this,this.i(),this.a);this.i().focus();Dl.o.u.call(this);};Dl.prototype.l=function(){this.a=null;Dl.o.l.call(this);};Dl.prototype.J=function(){return J(K(this,"firebaseui-id-email"))};r(Dl.prototype,{i:zl,D:Al,R:Bl,A:Cl,aa:xl,ca:Q,P:yl});var El=/^[+a-zA-Z0-9_.!#$%&'*\/=?^`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,63}$/;function Fl(){return K(this,"firebaseui-id-email")}function Gl(){return K(this,"firebaseui-id-email-error")}function Hl(a){var b=Fl.call(this),c=Gl.call(this);
jk(this,b,function(){ok(c)&&(L(b,!0),nk(c));});a&&kk(this,b,function(){a();});}function Il(){return Xa(J(Fl.call(this))||"")}function Jl(){var a=Fl.call(this);var b=Gl.call(this);var c=J(a)||"";c?El.test(c)?(L(a,!0),nk(b),b=!0):(L(a,!1),N(b,z("That email address isn't correct").toString()),b=!1):(L(a,!1),N(b,z("Enter your email address to continue").toString()),b=!1);return b?Xa(J(a)):null}function Kl(a,b,c,d,e,f,g){O.call(this,Wk,{email:c,ga:!!f},g,"passwordSignIn",{H:d,G:e});this.a=a;this.L=b;}t(Kl,
O);Kl.prototype.u=function(){this.R();this.aa();this.ca(this.a,this.L);Tk(this,this.s(),this.i());Uk(this,this.i(),this.a);J(this.s())?this.i().focus():this.s().focus();Kl.o.u.call(this);};Kl.prototype.l=function(){this.L=this.a=null;Kl.o.l.call(this);};r(Kl.prototype,{s:Fl,U:Gl,R:Hl,P:Il,J:Jl,i:zl,D:Al,aa:Bl,A:Cl,sa:xl,ra:Q,ca:yl});function R(a,b,c,d,e,f){O.call(this,a,b,d,e||"notice",f);this.a=c||null;}t(R,O);R.prototype.u=function(){this.a&&(this.s(this.a),this.i().focus());R.o.u.call(this);};R.prototype.l=
function(){this.a=null;R.o.l.call(this);};r(R.prototype,{i:xl,A:Q,s:yl});function Ll(a,b,c,d,e){R.call(this,Zk,{email:a,T:!!b},b,e,"passwordRecoveryEmailSent",{H:c,G:d});}t(Ll,R);function Ml(a,b){R.call(this,ql,{T:!!a},a,b,"emailVerificationSuccess");}t(Ml,R);function Nl(a,b){R.call(this,rl,{T:!!a},a,b,"emailVerificationFailure");}t(Nl,R);function Ol(a,b){R.call(this,ml,{T:!!a},a,b,"passwordResetSuccess");}t(Ol,R);function Pl(a,b){R.call(this,nl,{T:!!a},a,b,"passwordResetFailure");}t(Pl,R);function Ql(a,
b){R.call(this,pl,{T:!!a},a,b,"emailChangeRevokeFailure");}t(Ql,R);function Rl(a,b){R.call(this,sl,{errorMessage:a},void 0,b,"unrecoverableError");}t(Rl,R);var Sl=!1,Tl=null;function Ul(a,b){Sl=!!b;Tl||("undefined"==typeof accountchooser&&rj()?(b=Nb(Jb(new Gb(Hb,"//www.gstatic.com/accountchooser/client.js"))),Tl=hf(B(qh(b)),function(){})):Tl=B());Tl.then(a,a);}function Vl(a,b){a=S(a);(a=Qg(a).accountChooserInvoked||null)?a(b):b();}function Wl(a,b,c){a=S(a);(a=Qg(a).accountChooserResult||null)?a(b,c):
c();}function Xl(a,b,c,d,e){d?(I("callback",a,b),Sl&&c()):Vl(a,function(){Qi(T(a));Zi(function(f){G(Ai,T(a));Wl(a,f?"empty":"unavailable",function(){I("signIn",a,b);(f||Sl)&&c();});},Li(T(a)),e);});}function Yl(a,b,c,d){function e(f){f=U(f);V(b,c,void 0,f);d();}Wl(b,"accountSelected",function(){Ki(!1,T(b));var f=Zl(b);W(b,X(b).fetchSignInMethodsForEmail(a.a).then(function(g){$l(b,c,g,a.a,a.h||void 0,void 0,f);d();},e));});}function am(a,b,c,d){Wl(b,a?"addAccount":"unavailable",function(){I("signIn",b,c);(a||
Sl)&&d();});}function bm(a,b,c,d){function e(){var f=a();f&&(f=Pg(S(f)))&&f();}Wi(function(){var f=a();f&&Xl(f,b,e,c,d);},function(f){var g=a();g&&Yl(f,g,b,e);},function(f){var g=a();g&&am(f,g,b,e);},a()&&mg(S(a())));}function cm(a,b,c,d){function e(g){if(!g.name||"cancel"!=g.name){a:{var h=g.message;try{var k=((JSON.parse(h).error||{}).message||"").toLowerCase().match(/invalid.+(access|id)_token/);if(k&&k.length){var l=!0;break a}}catch(v){}l=!1;}if(l)g=P(b),b.m(),V(a,g,void 0,z("Your sign-in session has expired. Please try again.").toString());
else{l=g&&g.message||"";if(g.code){if("auth/email-already-in-use"==g.code||"auth/credential-already-in-use"==g.code)return;l=U(g);}b.g(l);}}}dm(a);if(d)return em(a,c),B();if(!c.credential)throw Error("No credential found!");d=X(a).currentUser||c.user;if(!d)throw Error("User not logged in.");d=new Bh(d.email,d.displayName,d.photoURL,"password"==c.credential.providerId?null:c.credential.providerId);null!=Gi(Ci,T(a))&&!Gi(Ci,T(a))||Mi(d,T(a));G(Ci,T(a));try{var f=fm(a,c);}catch(g){return Be(g.code||g.message,
g),b.g(g.code||g.message),B()}c=f.then(function(g){em(a,g);},e).then(void 0,e);W(a,f);return B(c)}function em(a,b){if(!b.user)throw Error("No user found");var c=Sg(S(a));Rg(S(a))&&c&&Ge("Both signInSuccess and signInSuccessWithAuthResult callbacks are provided. Only signInSuccessWithAuthResult callback will be invoked.");if(c){c=Sg(S(a));var d=Ii(T(a))||void 0;G(Bi,T(a));var e=!1;if(bg()){if(!c||c(b,d))e=!0,window.opener.location.assign(Qb(Tb(gm(a,d))));c||window.close();}else if(!c||c(b,d))e=!0,ag(gm(a,
d));e||a.reset();}else{c=b.user;b=b.credential;d=Rg(S(a));e=Ii(T(a))||void 0;G(Bi,T(a));var f=!1;if(bg()){if(!d||d(c,b,e))f=!0,window.opener.location.assign(Qb(Tb(gm(a,e))));d||window.close();}else if(!d||d(c,b,e))f=!0,ag(gm(a,e));f||a.reset();}}function gm(a,b){a=b||S(a).a.get("signInSuccessUrl");if(!a)throw Error("No redirect URL has been found. You must either specify a signInSuccessUrl in the configuration, pass in a redirect URL to the widget URL, or return false from the callback.");return a}function U(a){var b=
"";switch(a.code){case "auth/email-already-in-use":b+="The email address is already used by another account";break;case "auth/requires-recent-login":b+=Gd();break;case "auth/too-many-requests":b+="You have entered an incorrect password too many times. Please try again in a few minutes.";break;case "auth/user-cancelled":b+="Please authorize the required permissions to sign in to the application";break;case "auth/user-not-found":b+="That email address doesn't match an existing account";break;case "auth/user-token-expired":b+=
Gd();break;case "auth/weak-password":b+="Strong passwords have at least 6 characters and a mix of letters and numbers";break;case "auth/wrong-password":b+="The email and password you entered don't match";break;case "auth/network-request-failed":b+="A network error has occurred";break;case "auth/invalid-phone-number":b+=Dd();break;case "auth/invalid-verification-code":b+=z("Wrong code. Try again.");break;case "auth/code-expired":b+="This code is no longer valid";break;case "auth/expired-action-code":b+=
"This code has expired.";break;case "auth/invalid-action-code":b+="The action code is invalid. This can happen if the code is malformed, expired, or has already been used.";}if(b=z(b).toString())return b;try{return JSON.parse(a.message),Be("Internal error: "+a.message,void 0),Ed().toString()}catch(c){return a.message}}function hm(a,b,c){var d=de[b]&&undefined[de[b]]?new undefined[de[b]]:0==b.indexOf("saml.")?new undefined(b):new undefined(b);if(!d)throw Error("Invalid Firebase Auth provider!");
var e=Eg(S(a),b);if(d.addScope)for(var f=0;f<e.length;f++)d.addScope(e[f]);e=Fg(S(a),b)||{};c&&(b==undefined?a="login_hint":b==undefined?a="login":a=(a=yg(S(a),b))&&a.Db,a&&(e[a]=c));d.setCustomParameters&&d.setCustomParameters(e);return d}function im(a,b,c,d){function e(){Qi(T(a));W(a,b.M(q(a.Qb,a),[k],function(){if("file:"===(window.location&&window.location.protocol))return W(a,jm(a).then(function(l){b.m();G(Ai,T(a));I("callback",
a,h,B(l));},f))},g));}function f(l){G(Ai,T(a));if(!l.name||"cancel"!=l.name)switch(l.code){case "auth/popup-blocked":e();break;case "auth/popup-closed-by-user":case "auth/cancelled-popup-request":break;case "auth/credential-already-in-use":break;case "auth/network-request-failed":case "auth/too-many-requests":case "auth/user-cancelled":b.g(U(l));break;default:b.m(),I("callback",a,h,ff(l));}}function g(l){G(Ai,T(a));l.name&&"cancel"==l.name||(Be("signInWithRedirect: "+l.code,void 0),l=U(l),"blank"==b.Ma&&
Ng(S(a))?(b.m(),I("providerSignIn",a,h,l)):b.g(l));}var h=P(b),k=hm(a,c,d);"redirect"==Og(S(a))?e():W(a,km(a,k).then(function(l){b.m();I("callback",a,h,B(l));},f));}function lm(a,b){W(a,b.M(q(a.Mb,a),[],function(c){b.m();return cm(a,b,c,!0)},function(c){c.name&&"cancel"==c.name||(Be("ContinueAsGuest: "+c.code,void 0),c=U(c),b.g(c));}));}function mm(a,b,c){function d(f){var g=!1;f=b.M(q(a.Nb,a),[f],function(h){var k=P(b);b.m();I("callback",a,k,B(h));g=!0;},function(h){if(!h.name||"cancel"!=h.name)if(!h||
"auth/credential-already-in-use"!=h.code)if(h&&"auth/email-already-in-use"==h.code&&h.email&&h.credential){var k=P(b);b.m();I("callback",a,k,ff(h));}else h=U(h),b.g(h);});W(a,f);return f.then(function(){return g},function(){return !1})}var e=Cg(S(a),c&&c.authMethod||null);if(c&&c.idToken&&e===undefined)return Eg(S(a),undefined).length?(im(a,b,e,c.id),c=B(!0)):c=d(undefined(c.idToken)),c;c&&b.g(z("The selected credential for the authentication provider is not supported!").toString());
return B(!1)}function nm(a,b){var c=b.J(),d=b.A();if(c)if(d){var e=undefined(c,d);W(a,b.M(q(a.Ob,a),[c,d],function(f){return cm(a,b,{user:f.user,credential:e,operationType:f.operationType,additionalUserInfo:f.additionalUserInfo})},function(f){if(!f.name||"cancel"!=f.name)switch(f.code){case "auth/email-already-in-use":break;case "auth/email-exists":L(b.s(),!1);N(b.U(),U(f));break;case "auth/too-many-requests":case "auth/wrong-password":L(b.i(),!1);N(b.D(),U(f));break;
default:Be("verifyPassword: "+f.message,void 0),b.g(U(f));}}));}else b.i().focus();else b.s().focus();}function Zl(a){a=xg(S(a));return 1==a.length&&a[0]==undefined}function om(a){a=xg(S(a));return 1==a.length&&a[0]==undefined}function V(a,b,c,d){Zl(a)?d?I("signIn",a,b,c,d):pm(a,b,c):a&&om(a)&&!d?I("phoneSignInStart",a,b):a&&Ng(S(a))&&!d?I("federatedRedirect",a,b):I("providerSignIn",a,b,d);}function qm(a,b,c,d){var e=P(b);W(a,b.M(q(X(a).fetchSignInMethodsForEmail,
X(a)),[c],function(f){Ki(Bg(S(a))==ig,T(a));b.m();$l(a,e,f,c,void 0,d);},function(f){f=U(f);b.g(f);}));}function $l(a,b,c,d,e,f,g){c.length||Kg(S(a))?!c.length&&Kg(S(a))?I("sendEmailLinkForSignIn",a,b,d,function(){I("signIn",a,b);}):Oa(c,undefined)?I("passwordSignIn",a,b,d,g):1==c.length&&c[0]===undefined?I("sendEmailLinkForSignIn",a,b,d,function(){I("signIn",a,b);}):(c=be(c,xg(S(a))))?(Pi(new Ih(d),T(a)),
I("federatedSignIn",a,b,d,c,f)):I("unsupportedProvider",a,b,d):I("passwordSignUp",a,b,d,e,void 0,g);}function rm(a,b,c,d,e,f){var g=P(b);W(a,b.M(q(a.vb,a),[c,f],function(){b.m();I("emailLinkSignInSent",a,g,c,d,f);},e));}function pm(a,b,c){Bg(S(a))==ig?Ul(function(){Ui?Vl(a,function(){Qi(T(a));Zi(function(d){G(Ai,T(a));Wl(a,d?"empty":"unavailable",function(){I("signIn",a,b,c);});},Li(T(a)),qg(S(a)));}):(Y(a),bm(sm,b,!1,qg(S(a))));},!1):(Sl=!1,Vl(a,function(){Wl(a,"unavailable",function(){I("signIn",a,b,c);});}));}
function tm(a){var b=eg();a=sg(S(a));b=Ec(b,a)||"";for(var c in ng)if(ng[c].toLowerCase()==b.toLowerCase())return ng[c];return "callback"}function um(a){var b=eg();a=Md(S(a).a,"queryParameterForSignInSuccessUrl");return (b=Ec(b,a))?Qb(Tb(b)):null}function vm(){return Ec(eg(),"oobCode")}function wm(){var a=Ec(eg(),"continueUrl");return a?function(){ag(a);}:null}function xm(a,b){var c=dg(b);switch(tm(a)){case "callback":(b=um(a))&&Ji(b,T(a));a.gb()?I("callback",a,c):V(a,c);break;case "resetPassword":I("passwordReset",
a,c,vm(),wm());break;case "recoverEmail":I("emailChangeRevocation",a,c,vm());break;case "verifyEmail":I("emailVerification",a,c,vm(),wm());break;case "signIn":I("emailLinkSignInCallback",a,c,eg());ym();break;case "select":if((b=um(a))&&Ji(b,T(a)),Ui){V(a,c);break}else{Ul(function(){Y(a);bm(sm,c,!0);},!0);return}default:throw Error("Unhandled widget operation.");}(b=Pg(S(a)))&&b();}function zm(a,b){O.call(this,fl,void 0,b,"anonymousUserMismatch");this.a=a;}t(zm,O);zm.prototype.u=function(){var a=this;
M(this,this.i(),function(){a.a();});this.i().focus();zm.o.u.call(this);};zm.prototype.l=function(){this.a=null;zm.o.l.call(this);};r(zm.prototype,{i:Q});H.anonymousUserMismatch=function(a,b){var c=new zm(function(){c.m();V(a,b);});c.render(b);Z(a,c);};function Am(a){O.call(this,$k,void 0,a,"callback");}t(Am,O);Am.prototype.M=function(a,b,c,d){return a.apply(null,b).then(c,d)};function Bm(a,b,c){if(c.user){var d={user:c.user,credential:c.credential,operationType:c.operationType,additionalUserInfo:c.additionalUserInfo},
e=Ni(T(a)),f=e&&e.g;if(f&&!Cm(c.user,f))Dm(a,b,d);else{var g=e&&e.a;g?W(a,c.user.linkWithCredential(g).then(function(h){d={user:h.user,credential:g,operationType:h.operationType,additionalUserInfo:h.additionalUserInfo};Em(a,b,d);},function(h){Fm(a,b,h);})):Em(a,b,d);}}else c=P(b),b.m(),Oi(T(a)),V(a,c);}function Em(a,b,c){Oi(T(a));cm(a,b,c);}function Fm(a,b,c){var d=P(b);Oi(T(a));c=U(c);b.m();V(a,d,void 0,c);}function Gm(a,b,c,d){var e=P(b);W(a,X(a).fetchSignInMethodsForEmail(c).then(function(f){b.m();f.length?
Oa(f,undefined)?I("passwordLinking",a,e,c):1==f.length&&f[0]===undefined?I("emailLinkSignInLinking",a,e,c):(f=be(f,xg(S(a))))?I("federatedLinking",a,e,c,f,d):(Oi(T(a)),I("unsupportedProvider",a,e,c)):(Oi(T(a)),I("passwordRecovery",a,e,c,!1,Fd().toString()));},function(f){Fm(a,b,f);}));}function Dm(a,b,c){var d=P(b);W(a,Hm(a).then(function(){b.m();I("emailMismatch",a,d,c);},function(e){e.name&&"cancel"==
e.name||(e=U(e.code),b.g(e));}));}function Cm(a,b){if(b==a.email)return !0;if(a.providerData)for(var c=0;c<a.providerData.length;c++)if(b==a.providerData[c].email)return !0;return !1}H.callback=function(a,b,c){var d=new Am;d.render(b);Z(a,d);b=c||jm(a);W(a,b.then(function(e){Bm(a,d,e);},function(e){if(e&&("auth/account-exists-with-different-credential"==e.code||"auth/email-already-in-use"==e.code)&&e.email&&e.credential)Pi(new Ih(e.email,e.credential),T(a)),Gm(a,d,e.email);else if(e&&"auth/user-cancelled"==
e.code){var f=Ni(T(a)),g=U(e);f&&f.a?Gm(a,d,f.g,g):f?qm(a,d,f.g,g):Fm(a,d,e);}else e&&"auth/credential-already-in-use"==e.code||(e&&"auth/operation-not-supported-in-this-environment"==e.code&&Zl(a)?Bm(a,d,{user:null,credential:null}):Fm(a,d,e));}));};function Im(a,b){O.call(this,el,void 0,b,"differentDeviceError");this.a=a;}t(Im,O);Im.prototype.u=function(){var a=this;M(this,this.i(),function(){a.a();});this.i().focus();Im.o.u.call(this);};Im.prototype.l=function(){this.a=null;Im.o.l.call(this);};r(Im.prototype,
{i:Q});H.differentDeviceError=function(a,b){var c=new Im(function(){c.m();V(a,b);});c.render(b);Z(a,c);};function Jm(a,b,c,d){O.call(this,ol,{email:a,T:!!c},d,"emailChangeRevoke");this.i=b;this.a=c||null;}t(Jm,O);Jm.prototype.u=function(){var a=this;M(this,K(this,"firebaseui-id-reset-password-link"),function(){a.i();});this.a&&(this.A(this.a),this.s().focus());Jm.o.u.call(this);};Jm.prototype.l=function(){this.i=this.a=null;Jm.o.l.call(this);};r(Jm.prototype,{s:xl,D:Q,A:yl});function Km(){return K(this,
"firebaseui-id-new-password")}function Lm(){return K(this,"firebaseui-id-password-toggle")}function Mm(){this.La=!this.La;var a=Lm.call(this),b=Km.call(this);this.La?(b.type="text",uj(a,"firebaseui-input-toggle-off"),vj(a,"firebaseui-input-toggle-on")):(b.type="password",uj(a,"firebaseui-input-toggle-on"),vj(a,"firebaseui-input-toggle-off"));b.focus();}function Nm(){return K(this,"firebaseui-id-new-password-error")}function Om(){this.La=!1;var a=Km.call(this);a.type="password";var b=Nm.call(this);
jk(this,a,function(){ok(b)&&(L(a,!0),nk(b));});var c=Lm.call(this);uj(c,"firebaseui-input-toggle-on");vj(c,"firebaseui-input-toggle-off");lk(this,a,function(){uj(c,"firebaseui-input-toggle-focus");vj(c,"firebaseui-input-toggle-blur");});mk(this,a,function(){uj(c,"firebaseui-input-toggle-blur");vj(c,"firebaseui-input-toggle-focus");});M(this,c,q(Mm,this));}function Pm(){var a=Km.call(this);var b=Nm.call(this);J(a)?(L(a,!0),nk(b),b=!0):(L(a,!1),N(b,z("Enter your password").toString()),b=!1);return b?J(a):
null}function Qm(a,b,c){O.call(this,ll,{email:a},c,"passwordReset");this.a=b;}t(Qm,O);Qm.prototype.u=function(){this.J();this.D(this.a);Uk(this,this.i(),this.a);this.i().focus();Qm.o.u.call(this);};Qm.prototype.l=function(){this.a=null;Qm.o.l.call(this);};r(Qm.prototype,{i:Km,A:Nm,L:Lm,J:Om,s:Pm,R:xl,P:Q,D:yl});function Rm(a,b,c,d,e){var f=c.s();f&&W(a,c.M(q(X(a).confirmPasswordReset,X(a)),[d,f],function(){c.m();var g=new Ol(e);g.render(b);Z(a,g);},function(g){Sm(a,b,c,g);}));}function Sm(a,b,c,d){"auth/weak-password"==
(d&&d.code)?(a=U(d),L(c.i(),!1),N(c.A(),a),c.i().focus()):(c&&c.m(),c=new Pl,c.render(b),Z(a,c));}function Tm(a,b,c){var d=new Jm(c,function(){W(a,d.M(q(X(a).sendPasswordResetEmail,X(a)),[c],function(){d.m();d=new Ll(c,void 0,C(S(a)),D(S(a)));d.render(b);Z(a,d);},function(){d.g(z("Unable to send password reset code to specified email").toString());}));});d.render(b);Z(a,d);}H.passwordReset=function(a,b,c,d){W(a,X(a).verifyPasswordResetCode(c).then(function(e){var f=new Qm(e,function(){Rm(a,b,f,c,d);});
f.render(b);Z(a,f);},function(){Sm(a,b);}));};H.emailChangeRevocation=function(a,b,c){var d=null;W(a,X(a).checkActionCode(c).then(function(e){d=e.data.email;return X(a).applyActionCode(c)}).then(function(){Tm(a,b,d);},function(){var e=new Ql;e.render(b);Z(a,e);}));};H.emailVerification=function(a,b,c,d){W(a,X(a).applyActionCode(c).then(function(){var e=new Ml(d);e.render(b);Z(a,e);},function(){var e=new Nl;e.render(b);Z(a,e);}));};function Um(a,b){try{var c="number"==typeof a.selectionStart;}catch(d){c=!1;}c?
(a.selectionStart=b,a.selectionEnd=b):w&&!Db("9")&&("textarea"==a.type&&(b=a.value.substring(0,b).replace(/(\r\n|\r|\n)/g,"\n").length),a=a.createTextRange(),a.collapse(!0),a.move("character",b),a.select());}function Vm(a,b,c,d,e,f){O.call(this,dl,{email:c},f,"emailLinkSignInConfirmation",{H:d,G:e});this.i=a;this.s=b;}t(Vm,O);Vm.prototype.u=function(){this.D(this.i);this.J(this.i,this.s);this.a().focus();Um(this.a(),(this.a().value||"").length);Vm.o.u.call(this);};Vm.prototype.l=function(){this.s=this.i=
null;Vm.o.l.call(this);};r(Vm.prototype,{a:Fl,P:Gl,D:Hl,L:Il,A:Jl,U:xl,R:Q,J:yl});H.emailLinkConfirmation=function(a,b,c,d,e,f){var g=new Vm(function(){var h=g.A();h?(g.m(),d(a,b,h,c)):g.a().focus();},function(){g.m();V(a,b,e||void 0);},e||void 0,C(S(a)),D(S(a)));g.render(b);Z(a,g);f&&g.g(f);};function Wm(a,b,c,d,e){O.call(this,il,{ma:a},e,"emailLinkSignInLinkingDifferentDevice",{H:c,G:d});this.a=b;}t(Wm,O);Wm.prototype.u=function(){this.s(this.a);this.i().focus();Wm.o.u.call(this);};Wm.prototype.l=function(){this.a=
null;Wm.o.l.call(this);};r(Wm.prototype,{i:xl,s:yl});H.emailLinkNewDeviceLinking=function(a,b,c,d){var e=new Tg(c);c=e.a.a.get(E.PROVIDER_ID)||null;Xg(e,null);if(c){var f=new Wm(yg(S(a),c),function(){f.m();d(a,b,e.toString());},C(S(a)),D(S(a)));f.render(b);Z(a,f);}else V(a,b);};function Xm(a){O.call(this,al,void 0,a,"blank");}t(Xm,O);function Ym(a,b,c,d,e){var f=new Xm,g=new Tg(c),h=g.a.a.get(E.Va)||"",k=g.a.a.get(E.Na)||"",l="1"===g.a.a.get(E.Ka),v=Wg(g),ya=g.a.a.get(E.PROVIDER_ID)||null,sa=!Gi(Ei,T(a)),
Da=d||Ri(k,T(a)),Ka=(d=Si(k,T(a)))&&d.a;ya&&Ka&&Ka.providerId!==ya&&(Ka=null);f.render(b);Z(a,f);W(a,f.M(function(){var ba=B(null);ba=v&&sa||sa&&l?ff(Error("anonymous-user-not-found")):Zm(a,c).then(function(lg){if(ya&&!Ka)throw Error("pending-credential-not-found");return lg});var td=null;return ba.then(function(lg){td=lg;return e?null:X(a).checkActionCode(h)}).then(function(){return td})},[],function(ba){Da?$m(a,f,Da,c,Ka,ba):l?(f.m(),I("differentDeviceError",a,b)):(f.m(),I("emailLinkConfirmation",
a,b,c,an));},function(ba){var td=void 0;if(!ba||!ba.name||"cancel"!=ba.name)switch(f.m(),ba&&ba.message){case "anonymous-user-not-found":I("differentDeviceError",a,b);break;case "anonymous-user-mismatch":I("anonymousUserMismatch",a,b);break;case "pending-credential-not-found":I("emailLinkNewDeviceLinking",a,b,c,bn);break;default:ba&&(td=U(ba)),V(a,b,void 0,td);}}));}function an(a,b,c,d){Ym(a,b,d,c,!0);}function bn(a,b,c){Ym(a,b,c);}function $m(a,b,c,d,e,f){var g=P(b);b.X("mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active firebaseui-progress-dialog-loading-icon",
z("Signing in...").toString());var h=null;e=(f?cn(a,f,c,d,e):dn(a,c,d,e)).then(function(k){G(Fi,T(a));G(Ei,T(a));b.h();b.X("firebaseui-icon-done",z("Signed in!").toString());h=setTimeout(function(){b.h();cm(a,b,k,!0);},1E3);W(a,function(){b&&(b.h(),b.m());clearTimeout(h);});},function(k){b.h();b.m();if(!k.name||"cancel"!=k.name){var l=U(k);"auth/email-already-in-use"==k.code||"auth/credential-already-in-use"==k.code?(G(Fi,T(a)),G(Ei,T(a))):"auth/invalid-email"==k.code?(l=z("The email provided does not match the current sign-in session.").toString(),
I("emailLinkConfirmation",a,g,d,an,null,l)):V(a,g,c,l);}});W(a,e);}H.emailLinkSignInCallback=Ym;function en(a,b,c,d,e,f){O.call(this,hl,{email:a,ma:b},f,"emailLinkSignInLinking",{H:d,G:e});this.a=c;}t(en,O);en.prototype.u=function(){this.s(this.a);this.i().focus();en.o.u.call(this);};en.prototype.l=function(){this.a=null;en.o.l.call(this);};r(en.prototype,{i:xl,s:yl});function fn(a,b,c,d){var e=P(b);rm(a,b,c,function(){V(a,e,c);},function(f){if(!f.name||"cancel"!=f.name){var g=U(f);f&&"auth/network-request-failed"==
f.code?b.g(g):(b.m(),V(a,e,c,g));}},d);}H.emailLinkSignInLinking=function(a,b,c){var d=Ni(T(a));Oi(T(a));if(d){var e=d.a.providerId,f=new en(c,yg(S(a),e),function(){fn(a,f,c,d);},C(S(a)),D(S(a)));f.render(b);Z(a,f);}else V(a,b);};function gn(a,b,c,d,e,f){O.call(this,bl,{email:a},f,"emailLinkSignInSent",{H:d,G:e});this.s=b;this.a=c;}t(gn,O);gn.prototype.u=function(){var a=this;M(this,this.i(),function(){a.a();});M(this,K(this,"firebaseui-id-trouble-getting-email-link"),function(){a.s();});this.i().focus();
gn.o.u.call(this);};gn.prototype.l=function(){this.a=this.s=null;gn.o.l.call(this);};r(gn.prototype,{i:Q});H.emailLinkSignInSent=function(a,b,c,d,e){var f=new gn(c,function(){f.m();I("emailNotReceived",a,b,c,d,e);},function(){f.m();d();},C(S(a)),D(S(a)));f.render(b);Z(a,f);};function hn(a,b,c,d,e,f,g){O.call(this,tl,{Ub:a,Fb:b},g,"emailMismatch",{H:e,G:f});this.s=c;this.i=d;}t(hn,O);hn.prototype.u=function(){this.D(this.s,this.i);this.A().focus();hn.o.u.call(this);};hn.prototype.l=function(){this.i=this.a=
null;hn.o.l.call(this);};r(hn.prototype,{A:xl,J:Q,D:yl});H.emailMismatch=function(a,b,c){var d=Ni(T(a));if(d){var e=new hn(c.user.email,d.g,function(){var f=e;Oi(T(a));cm(a,f,c);},function(){var f=c.credential.providerId,g=P(e);e.m();d.a?I("federatedLinking",a,g,d.g,f):I("federatedSignIn",a,g,d.g,f);},C(S(a)),D(S(a)));e.render(b);Z(a,e);}else V(a,b);};function jn(a,b,c,d,e){O.call(this,cl,void 0,e,"emailNotReceived",{H:c,G:d});this.i=a;this.a=b;}t(jn,O);jn.prototype.u=function(){var a=this;M(this,this.s(),
function(){a.a();});M(this,this.ya(),function(){a.i();});this.s().focus();jn.o.u.call(this);};jn.prototype.ya=function(){return K(this,"firebaseui-id-resend-email-link")};jn.prototype.l=function(){this.a=this.i=null;jn.o.l.call(this);};r(jn.prototype,{s:Q});H.emailNotReceived=function(a,b,c,d,e){var f=new jn(function(){rm(a,f,c,d,function(g){g=U(g);f.g(g);},e);},function(){f.m();V(a,b,c);},C(S(a)),D(S(a)));f.render(b);Z(a,f);};function kn(a,b,c,d,e,f){O.call(this,jl,{email:a,ma:b},f,"federatedLinking",{H:d,
G:e});this.a=c;}t(kn,O);kn.prototype.u=function(){this.s(this.a);this.i().focus();kn.o.u.call(this);};kn.prototype.l=function(){this.a=null;kn.o.l.call(this);};r(kn.prototype,{i:xl,s:yl});H.federatedLinking=function(a,b,c,d,e){var f=Ni(T(a));if(f&&f.a){var g=new kn(c,yg(S(a),d),function(){im(a,g,d,c);},C(S(a)),D(S(a)));g.render(b);Z(a,g);e&&g.g(e);}else V(a,b);};H.federatedRedirect=function(a,b){var c=new Xm;c.render(b);Z(a,c);b=xg(S(a))[0];im(a,c,b);};H.federatedSignIn=function(a,b,c,d,e){var f=new kn(c,
yg(S(a),d),function(){im(a,f,d,c);},C(S(a)),D(S(a)));f.render(b);Z(a,f);e&&f.g(e);};function ln(a,b,c,d){var e=b.A();e?W(a,b.M(q(a.Kb,a),[c,e],function(f){f=f.user.linkWithCredential(d).then(function(g){return cm(a,b,{user:g.user,credential:d,operationType:g.operationType,additionalUserInfo:g.additionalUserInfo})});W(a,f);return f},function(f){if(!f.name||"cancel"!=f.name)switch(f.code){case "auth/wrong-password":L(b.i(),!1);N(b.D(),U(f));break;case "auth/too-many-requests":b.g(U(f));break;default:Be("signInWithEmailAndPassword: "+
f.message,void 0),b.g(U(f));}})):b.i().focus();}H.passwordLinking=function(a,b,c){var d=Ni(T(a));Oi(T(a));var e=d&&d.a;if(e){var f=new Dl(c,function(){ln(a,f,c,e);},function(){f.m();I("passwordRecovery",a,b,c);},C(S(a)),D(S(a)));f.render(b);Z(a,f);}else V(a,b);};function mn(a,b,c,d,e,f){O.call(this,Yk,{email:c,Oa:!!b},f,"passwordRecovery",{H:d,G:e});this.a=a;this.s=b;}t(mn,O);mn.prototype.u=function(){this.J();this.L(this.a,this.s);J(this.i())||this.i().focus();Uk(this,this.i(),this.a);mn.o.u.call(this);};
mn.prototype.l=function(){this.s=this.a=null;mn.o.l.call(this);};r(mn.prototype,{i:Fl,D:Gl,J:Hl,P:Il,A:Jl,U:xl,R:Q,L:yl});function nn(a,b){var c=b.A();if(c){var d=P(b);W(a,b.M(q(X(a).sendPasswordResetEmail,X(a)),[c],function(){b.m();var e=new Ll(c,function(){e.m();V(a,d);},C(S(a)),D(S(a)));e.render(d);Z(a,e);},function(e){L(b.i(),!1);N(b.D(),U(e));}));}else b.i().focus();}H.passwordRecovery=function(a,b,c,d,e){var f=new mn(function(){nn(a,f);},d?void 0:function(){f.m();V(a,b);},c,C(S(a)),D(S(a)));f.render(b);
Z(a,f);e&&f.g(e);};H.passwordSignIn=function(a,b,c,d){var e=new Kl(function(){nm(a,e);},function(){var f=e.P();e.m();I("passwordRecovery",a,b,f);},c,C(S(a)),D(S(a)),d);e.render(b);Z(a,e);};function on(){return K(this,"firebaseui-id-name")}function pn(){return K(this,"firebaseui-id-name-error")}function qn(a,b,c,d,e,f,g,h,k){O.call(this,Xk,{email:d,Ib:a,name:e,Oa:!!c,ga:!!h},k,"passwordSignUp",{H:f,G:g});this.a=b;this.J=c;this.D=a;}t(qn,O);qn.prototype.u=function(){this.aa();this.D&&this.Ra();this.sa();
this.ra(this.a,this.J);this.D?(Tk(this,this.i(),this.A()),Tk(this,this.A(),this.s())):Tk(this,this.i(),this.s());this.a&&Uk(this,this.s(),this.a);J(this.i())?this.D&&!J(this.A())?this.A().focus():this.s().focus():this.i().focus();qn.o.u.call(this);};qn.prototype.l=function(){this.J=this.a=null;qn.o.l.call(this);};r(qn.prototype,{i:Fl,U:Gl,aa:Hl,bb:Il,P:Jl,A:on,mc:pn,Ra:function(){var a=on.call(this),b=pn.call(this);jk(this,a,function(){ok(b)&&(L(a,!0),nk(b));});},L:function(){var a=on.call(this);var b=
pn.call(this);var c=J(a);c=!/^[\s\xa0]*$/.test(null==c?"":String(c));L(a,c);c?(nk(b),b=!0):(N(b,z("Enter your account name").toString()),b=!1);return b?Xa(J(a)):null},s:Km,ca:Nm,zb:Lm,sa:Om,R:Pm,jc:xl,Bb:Q,ra:yl});function rn(a,b){var c=Jg(S(a)),d=b.P(),e=null;c&&(e=b.L());var f=b.R();if(d){if(c)if(e)e=nb(e);else{b.A().focus();return}if(f){var g=undefined(d,f);W(a,b.M(q(a.Lb,a),[d,f],function(h){var k={user:h.user,credential:g,operationType:h.operationType,additionalUserInfo:h.additionalUserInfo};
return c?(h=h.user.updateProfile({displayName:e}).then(function(){return cm(a,b,k)}),W(a,h),h):cm(a,b,k)},function(h){if(!h.name||"cancel"!=h.name){var k=U(h);switch(h.code){case "auth/email-already-in-use":return sn(a,b,d,h);case "auth/too-many-requests":k=z("Too many account requests are coming from your IP address. Try again in a few minutes.").toString();case "auth/operation-not-allowed":case "auth/weak-password":L(b.s(),!1);N(b.ca(),k);break;default:h="setAccountInfo: "+gi(h),Be(h,void 0),b.g(k);}}}));}else b.s().focus();}else b.i().focus();}
function sn(a,b,c,d){function e(){var g=U(d);L(b.i(),!1);N(b.U(),g);b.i().focus();}var f=X(a).fetchSignInMethodsForEmail(c).then(function(g){g.length?e():(g=P(b),b.m(),I("passwordRecovery",a,g,c,!1,Fd().toString()));},function(){e();});W(a,f);return f}H.passwordSignUp=function(a,b,c,d,e,f){function g(){h.m();V(a,b);}var h=new qn(Jg(S(a)),function(){rn(a,h);},e?void 0:g,c,d,C(S(a)),D(S(a)),f);h.render(b);Z(a,h);};function tn(){return K(this,"firebaseui-id-phone-confirmation-code")}function un(){return K(this,
"firebaseui-id-phone-confirmation-code-error")}function vn(){return K(this,"firebaseui-id-resend-countdown")}function wn(a,b,c,d,e,f,g,h,k){O.call(this,wl,{phoneNumber:e},k,"phoneSignInFinish",{H:g,G:h});this.Ra=f;this.i=new Hj(1E3);this.D=f;this.P=a;this.a=b;this.J=c;this.L=d;}t(wn,O);wn.prototype.u=function(){var a=this;this.R(this.Ra);Nf(this.i,"tick",this.A,!1,this);this.i.start();M(this,K(this,"firebaseui-id-change-phone-number-link"),function(){a.P();});M(this,this.ya(),function(){a.L();});this.sa(this.a);
this.ca(this.a,this.J);this.s().focus();wn.o.u.call(this);};wn.prototype.l=function(){this.L=this.J=this.a=this.P=null;Ij(this.i);Vf(this.i,"tick",this.A);this.i=null;wn.o.l.call(this);};wn.prototype.A=function(){--this.D;0<this.D?this.R(this.D):(Ij(this.i),Vf(this.i,"tick",this.A),this.ra(),this.bb());};r(wn.prototype,{s:tn,aa:un,sa:function(a){var b=tn.call(this),c=un.call(this);jk(this,b,function(){ok(c)&&(L(b,!0),nk(c));});a&&kk(this,b,function(){a();});},U:function(){var a=Xa(J(tn.call(this))||"");
return /^\d{6}$/.test(a)?a:null},rb:vn,R:function(a){pc(vn.call(this),z("Resend code in "+((9<a?"0:":"0:0")+a)).toString());},ra:function(){nk(this.rb());},ya:function(){return K(this,"firebaseui-id-resend-link")},bb:function(){N(this.ya());},Bb:xl,zb:Q,ca:yl});function xn(a,b,c,d){function e(g){b.s().focus();L(b.s(),!1);N(b.aa(),g);}var f=b.U();f?(b.X("mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active firebaseui-progress-dialog-loading-icon",z("Verifying...").toString()),W(a,b.M(q(d.confirm,
d),[f],function(g){b.h();b.X("firebaseui-icon-done",z("Verified!").toString());var h=setTimeout(function(){b.h();b.m();var k={user:yn(a).currentUser,credential:null,operationType:g.operationType,additionalUserInfo:g.additionalUserInfo};cm(a,b,k,!0);},1E3);W(a,function(){b&&b.h();clearTimeout(h);});},function(g){if(g.name&&"cancel"==g.name)b.h();else{var h=U(g);switch(g.code){case "auth/credential-already-in-use":b.h();break;case "auth/code-expired":g=P(b);b.h();b.m();I("phoneSignInStart",a,g,c,h);break;
case "auth/missing-verification-code":case "auth/invalid-verification-code":b.h();e(h);break;default:b.h(),b.g(h);}}}))):e(z("Wrong code. Try again.").toString());}H.phoneSignInFinish=function(a,b,c,d,e,f){var g=new wn(function(){g.m();I("phoneSignInStart",a,b,c);},function(){xn(a,g,c,e);},function(){g.m();V(a,b);},function(){g.m();I("phoneSignInStart",a,b,c);},ae(c),d,C(S(a)),D(S(a)));g.render(b);Z(a,g);f&&g.g(f);};var zn=!w&&!(u("Safari")&&!(mb()||u("Coast")||u("Opera")||u("Edge")||u("Firefox")||u("FxiOS")||
u("Silk")||u("Android")));function An(a,b){if(/-[a-z]/.test(b))return null;if(zn&&a.dataset){if(!(!u("Android")||mb()||u("Firefox")||u("FxiOS")||u("Opera")||u("Silk")||b in a.dataset))return null;a=a.dataset[b];return void 0===a?null:a}return a.getAttribute("data-"+String(b).replace(/([A-Z])/g,"-$1").toLowerCase())}function Bn(a,b,c){var d=this;a=fd(Dk,{items:a},null,this.w);Kk.call(this,a,!0,!0);c&&(c=Cn(a,c))&&(c.focus(),bk(c,a));M(this,a,function(e){if(e=(e=qc(e.target,"firebaseui-id-list-box-dialog-button"))&&
An(e,"listboxid"))Lk.call(d),b(e);});}function Cn(a,b){a=(a||document).getElementsByTagName("BUTTON");for(var c=0;c<a.length;c++)if(An(a[c],"listboxid")===b)return a[c];return null}function Dn(){return K(this,"firebaseui-id-phone-number")}function En(){return K(this,"firebaseui-id-country-selector")}function Fn(){return K(this,"firebaseui-id-phone-number-error")}function Gn(a,b){var c=a.a,d=Hn("1-US-0",c),e=null;b&&Hn(b,c)?e=b:d?e="1-US-0":e=0<c.length?c[0].c:null;if(!e)throw Error("No available default country");
In.call(this,e,a);}function Hn(a,b){a=Td(a);return !(!a||!Oa(b,a))}function Jn(a){return La(a,function(b){return {id:b.c,Ga:"firebaseui-flag "+Kn(b),label:b.name+" "+("\u200e+"+b.b)}})}function Kn(a){return "firebaseui-flag-"+a.f}function Ln(a){var b=this;Bn.call(this,Jn(a.a),function(c){In.call(b,c,a,!0);b.K().focus();},this.wa);}function In(a,b,c){var d=Td(a);d&&(c&&(c=Xa(J(Dn.call(this))||""),b=Sd(b,c),b.length&&b[0].b!=d.b&&(c="+"+d.b+c.substr(b[0].b.length+1),wj(Dn.call(this),c))),b=Td(this.wa),this.wa=
a,a=K(this,"firebaseui-id-country-selector-flag"),b&&vj(a,Kn(b)),uj(a,Kn(d)),pc(K(this,"firebaseui-id-country-selector-code"),"\u200e+"+d.b));}function Mn(a,b,c,d,e,f,g,h,k,l){O.call(this,vl,{sb:b,va:k||null,Qa:!!c,ga:!!f},l,"phoneSignInStart",{H:d,G:e});this.J=h||null;this.L=b;this.a=a;this.A=c||null;this.aa=g||null;}t(Mn,O);Mn.prototype.u=function(){this.ca(this.aa,this.J);this.P(this.a,this.A||void 0);this.L||Tk(this,this.K(),this.i());Uk(this,this.i(),this.a);this.K().focus();Um(this.K(),(this.K().value||
"").length);Mn.o.u.call(this);};Mn.prototype.l=function(){this.A=this.a=null;Mn.o.l.call(this);};r(Mn.prototype,{pb:Mk,K:Dn,D:Fn,ca:function(a,b,c){var d=this,e=Dn.call(this),f=En.call(this),g=Fn.call(this),h=a||Yd,k=h.a;if(0==k.length)throw Error("No available countries provided.");Gn.call(d,h,b);M(this,f,function(){Ln.call(d,h);});jk(this,e,function(){ok(g)&&(L(e,!0),nk(g));var l=Xa(J(e)||""),v=Td(this.wa),ya=Sd(h,l);l=Hn("1-US-0",k);ya.length&&ya[0].b!=v.b&&(v=ya[0],In.call(d,"1"==v.b&&l?"1-US-0":
v.c,h));});c&&kk(this,e,function(){c();});},R:function(a){var b=Xa(J(Dn.call(this))||"");a=a||Yd;var c=a.a,d=Sd(Yd,b);if(d.length&&!Oa(c,d[0]))throw wj(Dn.call(this)),Dn.call(this).focus(),N(Fn.call(this),z("The country code provided is not supported.").toString()),Error("The country code provided is not supported.");c=Td(this.wa);d.length&&d[0].b!=c.b&&In.call(this,d[0].c,a);d.length&&(b=b.substr(d[0].b.length+1));return b?new Zd(this.wa,b):null},sa:En,U:function(){return K(this,"firebaseui-recaptcha-container")},
s:function(){return K(this,"firebaseui-id-recaptcha-error")},i:xl,ra:Q,P:yl});function Nn(a,b,c,d){try{var e=b.R(cj);}catch(f){return}e?aj?(b.X("mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active firebaseui-progress-dialog-loading-icon",z("Verifying...").toString()),W(a,b.M(q(a.Pb,a),[ae(e),c],function(f){var g=P(b);b.X("firebaseui-icon-done",z("Code sent!").toString());var h=setTimeout(function(){b.h();b.m();I("phoneSignInFinish",a,g,e,15,f);},1E3);W(a,function(){b&&b.h();clearTimeout(h);});},
function(f){b.h();if(!f.name||"cancel"!=f.name){grecaptcha.reset(dj);aj=null;var g=f&&f.message||"";if(f.code)switch(f.code){case "auth/too-many-requests":g=z("This phone number has been used too many times").toString();break;case "auth/invalid-phone-number":case "auth/missing-phone-number":b.K().focus();N(b.D(),Dd().toString());return;default:g=U(f);}b.g(g);}}))):bj?N(b.s(),z("Solve the reCAPTCHA").toString()):!bj&&d&&b.i().click():(b.K().focus(),N(b.D(),Dd().toString()));}H.phoneSignInStart=function(a,
b,c,d){var e=Dg(S(a))||{};aj=null;bj=!(e&&"invisible"===e.size);var f=om(a),g=Hg(S(a)),h=f?Gg(S(a)):null;g=c&&c.a||g&&g.c||null;c=c&&c.va||h;(h=Ig(S(a)))&&Xd(h);cj=h?new Rd(Ig(S(a))):Yd;var k=new Mn(function(v){Nn(a,k,l,!(!v||!v.keyCode));},bj,f?null:function(){l.clear();k.m();V(a,b);},C(S(a)),D(S(a)),f,cj,g,c);k.render(b);Z(a,k);d&&k.g(d);e.callback=function(v){k.s()&&nk(k.s());aj=v;bj||Nn(a,k,l);};e["expired-callback"]=function(){aj=null;};var l=new undefined(bj?k.U():k.i(),e,
yn(a).app);W(a,k.M(q(l.render,l),[],function(v){dj=v;},function(v){v.name&&"cancel"==v.name||(v=U(v),k.m(),V(a,b,void 0,v));}));};function On(a,b,c,d,e){O.call(this,ul,{Hb:b},e,"providerSignIn",{H:c,G:d});this.a=a;}t(On,O);On.prototype.u=function(){this.i(this.a);On.o.u.call(this);};On.prototype.l=function(){this.a=null;On.o.l.call(this);};r(On.prototype,{i:function(a){function b(g){a(g);}for(var c=this.j?ic("firebaseui-id-idp-button",this.j||this.w.a):[],d=0;d<c.length;d++){var e=c[d],f=An(e,"providerId");
M(this,e,xa(b,f));}}});H.providerSignIn=function(a,b,c){var d=new On(function(e){e==undefined?(d.m(),pm(a,b)):e==undefined?(d.m(),I("phoneSignInStart",a,b)):"anonymous"==e?lm(a,d):im(a,d,e);Y(a);a.O.cancel();},zg(S(a)),C(S(a)),D(S(a)));d.render(b);Z(a,d);c&&d.g(c);Pn(a);};H.sendEmailLinkForSignIn=function(a,b,c,d){var e=new Am;e.render(b);Z(a,e);rm(a,e,c,d,function(f){e.m();f=U(f);I("signIn",a,b,c,f);});};function Qn(a,b,c,d,e,f,g){O.call(this,
Vk,{email:c,Qa:!!b,ga:!!f},g,"signIn",{H:d,G:e});this.a=a;this.s=b;}t(Qn,O);Qn.prototype.u=function(){this.D(this.a);this.J(this.a,this.s||void 0);this.i().focus();Um(this.i(),(this.i().value||"").length);Qn.o.u.call(this);};Qn.prototype.l=function(){this.s=this.a=null;Qn.o.l.call(this);};r(Qn.prototype,{i:Fl,P:Gl,D:Hl,L:Il,A:Jl,U:xl,R:Q,J:yl});H.signIn=function(a,b,c,d){var e=Zl(a),f=e&&Bg(S(a))!=ig,g=new Qn(function(){var h=g,k=h.A()||"";k&&qm(a,h,k);},f?null:function(){g.m();V(a,b,c);},c,C(S(a)),D(S(a)),
e);g.render(b);Z(a,g);d&&g.g(d);};function Rn(a,b,c,d,e,f){O.call(this,kl,{email:a},f,"unsupportedProvider",{H:d,G:e});this.a=b;this.i=c;}t(Rn,O);Rn.prototype.u=function(){this.A(this.a,this.i);this.s().focus();Rn.o.u.call(this);};Rn.prototype.l=function(){this.i=this.a=null;Rn.o.l.call(this);};r(Rn.prototype,{s:xl,D:Q,A:yl});H.unsupportedProvider=function(a,b,c){var d=new Rn(c,function(){d.m();I("passwordRecovery",a,b,c);},function(){d.m();V(a,b,c);},C(S(a)),D(S(a)));d.render(b);Z(a,d);};function Sn(a,
b){this.$=!1;var c=Tn(b);if(Un[c])throw Error('An AuthUI instance already exists for the key "'+c+'"');Un[c]=this;this.g=a;this.A=null;this.s=!1;Vn(this.g);this.v=undefined({apiKey:a.app.options.apiKey,authDomain:a.app.options.authDomain},a.app.name+"-firebaseui-temp").auth();Vn(this.v);this.v.setPersistence&&this.v.setPersistence(undefined);this.ea=b;this.X=new hg;this.a=this.K=this.i=this.F=null;this.j=[];this.Z=!1;this.O=wh.Sa();this.h=this.C=null;this.ba=
this.w=!1;}function Vn(a){a&&a.INTERNAL&&a.INTERNAL.logFramework&&a.INTERNAL.logFramework("FirebaseUI-web");}var Un={};function Tn(a){return a||"[DEFAULT]"}function jm(a){Y(a);a.i||(a.i=Wn(a,function(b){return b&&!Ni(T(a))?B(yn(a).getRedirectResult().then(function(c){return c},function(c){if(c&&"auth/email-already-in-use"==c.code&&c.email&&c.credential)throw c;return Xn(a,c)})):B(X(a).getRedirectResult().then(function(c){return tg(S(a))&&!c.user&&a.h&&!a.h.isAnonymous?yn(a).getRedirectResult():c}))}));
return a.i}function Z(a,b){Y(a);a.a=b;}var Yn=null;function sm(){return Yn}function X(a){Y(a);return a.v}function yn(a){Y(a);return a.g}function T(a){Y(a);return a.ea}m=Sn.prototype;m.gb=function(){Y(this);return "pending"===Gi(Ai,T(this))||Zn(eg())};function Zn(a){a=new Tg(a);return "signIn"===(a.a.a.get(E.lb)||null)&&!!a.a.a.get(E.Va)}m.start=function(a,b){Y(this);var c=this;"undefined"!==typeof this.g.languageCode&&(this.A=this.g.languageCode);var d="en".replace(/_/g,"-");this.g.languageCode=d;this.v.languageCode=
d;this.s=!0;this.cb(b);var e=n.document;this.C?this.C.then(function(){"complete"==e.readyState?$n(c,a):Of(window,"load",function(){$n(c,a);});}):"complete"==e.readyState?$n(c,a):Of(window,"load",function(){$n(c,a);});};function $n(a,b){var c=dg(b);c.setAttribute("lang","en".replace(/_/g,"-"));if(Yn){var d=Yn;Y(d);Ni(T(d))&&Ge("UI Widget is already rendered on the page and is pending some user interaction. Only one widget instance can be rendered per page. The previous instance has been automatically reset.");
Yn.reset();}Yn=a;a.K=c;ao(a,c);pi(new qi)&&pi(new ri)?xm(a,b):(b=dg(b),c=new Rl(z("The browser you are using does not support Web Storage. Please try again in a different browser.").toString()),c.render(b),Z(a,c));G(Ai,T(a));}function Wn(a,b){if(a.w)return b(bo(a));W(a,function(){a.w=!1;});if(tg(S(a))){var c=new Xe(function(d){W(a,a.g.onAuthStateChanged(function(e){a.h=e;a.w||(a.w=!0,d(b(bo(a))));}));});W(a,c);return c}a.w=!0;return b(null)}function bo(a){Y(a);return tg(S(a))&&a.h&&a.h.isAnonymous?a.h:
null}function W(a,b){Y(a);if(b){a.j.push(b);var c=function(){Sa(a.j,function(d){return d==b});};"function"!=typeof b&&b.then(c,c);}}m.disableAutoSignIn=function(){Y(this);this.Z=!0;};function co(a){Y(a);var b;(b=a.Z)||(a=S(a),a=Fg(a,undefined),b=!(!a||"select_account"!==a.prompt));return b}function dm(a){"undefined"!==typeof a.g.languageCode&&a.s&&(a.s=!1,a.g.languageCode=a.A);}m.reset=function(){Y(this);var a=this;this.K&&this.K.removeAttribute("lang");this.F&&dh(this.F);
dm(this);ym();G(Ai,T(this));Y(this);this.O.cancel();this.i=B({user:null,credential:null});Yn==this&&(Yn=null);this.K=null;for(var b=0;b<this.j.length;b++)if("function"==typeof this.j[b])this.j[b]();else this.j[b].cancel&&this.j[b].cancel();this.j=[];Oi(T(this));this.a&&(this.a.m(),this.a=null);this.I=null;this.v&&(this.C=Hm(this).then(function(){a.C=null;},function(){a.C=null;}));};function ao(a,b){a.I=null;a.F=new eh(b);a.F.register();Nf(a.F,"pageEnter",function(c){c=c&&c.pageId;if(a.I!=c){var d=S(a);
(d=Qg(d).uiChanged||null)&&d(a.I,c);a.I=c;}});}m.cb=function(a){Y(this);var b=this.X,c;for(c in a)try{Ld(b.a,c,a[c]);}catch(d){Be('Invalid config: "'+c+'"',void 0);}wb&&Ld(b.a,"popupMode",!1);Ig(b);!this.ba&&Rg(S(this))&&(Ge("signInSuccess callback is deprecated. Please use signInSuccessWithAuthResult callback instead."),this.ba=!0);};function S(a){Y(a);return a.X}m.Jb=function(){Y(this);var a=S(this),b=Md(a.a,"widgetUrl");var c=rg(a,b);S(this).a.get("popupMode")?(a=(window.screen.availHeight-600)/2,b=
(window.screen.availWidth-500)/2,c=c||"about:blank",a={width:500,height:600,top:0<a?a:0,left:0<b?b:0,location:!0,resizable:!0,statusbar:!0,toolbar:!1},a.target=a.target||c.target||"google_popup",a.width=a.width||690,a.height=a.height||500,(a=$f(c,a))&&a.focus()):ag(c);};function Y(a){if(a.$)throw Error("AuthUI instance is deleted!");}m.ub=function(){var a=this;Y(this);return this.v.app.delete().then(function(){var b=Tn(T(a));delete Un[b];a.reset();a.$=!0;})};function Pn(a){Y(a);try{yh(a.O,Ag(S(a)),
co(a)).then(function(b){return a.a?mm(a,a.a,b):!1});}catch(b){}}m.vb=function(a,b){Y(this);var c=this,d=gg();if(!Kg(S(this)))throw Error("Email link sign-in should be enabled to trigger email sending.");var e=Mg(S(this)),f=new Tg(e.url);Ug(f,d);b&&b.a&&(Ti(d,b,T(this)),Xg(f,b.a.providerId));Vg(f,Lg(S(this)));return Wn(this,function(g){g&&((g=g.uid)?f.a.a.set(E.Ja,g):Zc(f.a.a,E.Ja));e.url=f.toString();return X(c).sendSignInLinkToEmail(a,e)}).then(function(){var g=T(c),h={};h.email=a;Hi(Ei,di(d,JSON.stringify(h)),
g);},function(g){G(Fi,T(c));G(Ei,T(c));throw g;})};function Zm(a,b){var c=Wg(new Tg(b));if(!c)return B(null);b=new Xe(function(d,e){var f=yn(a).onAuthStateChanged(function(g){f();g&&g.isAnonymous&&g.uid===c?d(g):g&&g.isAnonymous&&g.uid!==c?e(Error("anonymous-user-mismatch")):e(Error("anonymous-user-not-found"));});W(a,f);});W(a,b);return b}function cn(a,b,c,d,e){Y(a);var f=e||null,g=undefined(c,d);c=f?X(a).signInWithEmailLink(c,d).then(function(h){return h.user.linkWithCredential(f)}).then(function(){return Hm(a)}).then(function(){return Xn(a,
{code:"auth/email-already-in-use"},f)}):X(a).fetchSignInMethodsForEmail(c).then(function(h){return h.length?Xn(a,{code:"auth/email-already-in-use"},g):b.linkWithCredential(g)});W(a,c);return c}function dn(a,b,c,d){Y(a);var e=d||null,f;b=X(a).signInWithEmailLink(b,c).then(function(g){f={user:g.user,credential:null,operationType:g.operationType,additionalUserInfo:g.additionalUserInfo};if(e)return g.user.linkWithCredential(e).then(function(h){f={user:h.user,credential:e,operationType:f.operationType,
additionalUserInfo:h.additionalUserInfo};})}).then(function(){Hm(a);}).then(function(){return yn(a).updateCurrentUser(f.user)}).then(function(){f.user=yn(a).currentUser;return f});W(a,b);return b}function ym(){var a=eg();if(Zn(a)){a=new Tg(a);for(var b in E)E.hasOwnProperty(b)&&Zc(a.a.a,E[b]);b={state:"signIn",mode:"emailLink",operation:"clear"};var c=n.document.title;n.history&&n.history.replaceState&&n.history.replaceState(b,c,a.toString());}}m.Ob=function(a,b){Y(this);var c=this;return X(this).signInWithEmailAndPassword(a,
b).then(function(d){return Wn(c,function(e){return e?Hm(c).then(function(){return Xn(c,{code:"auth/email-already-in-use"},undefined(a,b))}):d})})};m.Lb=function(a,b){Y(this);var c=this;return Wn(this,function(d){if(d){var e=undefined(a,b);return d.linkWithCredential(e)}return X(c).createUserWithEmailAndPassword(a,b)})};m.Nb=function(a){Y(this);var b=this;return Wn(this,function(c){return c?c.linkWithCredential(a).then(function(d){return d},
function(d){if(d&&"auth/email-already-in-use"==d.code&&d.email&&d.credential)throw d;return Xn(b,d,a)}):X(b).signInWithCredential(a)})};function km(a,b){Y(a);return Wn(a,function(c){return c&&!Ni(T(a))?c.linkWithPopup(b).then(function(d){return d},function(d){if(d&&"auth/email-already-in-use"==d.code&&d.email&&d.credential)throw d;return Xn(a,d)}):X(a).signInWithPopup(b)})}m.Qb=function(a){Y(this);var b=this,c=this.i;this.i=null;return Wn(this,function(d){return d&&!Ni(T(b))?d.linkWithRedirect(a):
X(b).signInWithRedirect(a)}).then(function(){},function(d){b.i=c;throw d;})};m.Pb=function(a,b){Y(this);var c=this;return Wn(this,function(d){return d?d.linkWithPhoneNumber(a,b).then(function(e){return new Ah(e,function(f){if("auth/credential-already-in-use"==f.code)return Xn(c,f);throw f;})}):yn(c).signInWithPhoneNumber(a,b).then(function(e){return new Ah(e)})})};m.Mb=function(){Y(this);return yn(this).signInAnonymously()};function fm(a,b){Y(a);return Wn(a,function(c){if(a.h&&!a.h.isAnonymous&&tg(S(a))&&
!X(a).currentUser)return Hm(a).then(function(){"password"==b.credential.providerId&&(b.credential=null);return b});if(c)return Hm(a).then(function(){return c.linkWithCredential(b.credential)}).then(function(d){b.user=d.user;b.credential=d.credential;b.operationType=d.operationType;b.additionalUserInfo=d.additionalUserInfo;return b},function(d){if(d&&"auth/email-already-in-use"==d.code&&d.email&&d.credential)throw d;return Xn(a,d,b.credential)});if(!b.user)throw Error('Internal error: An incompatible or outdated version of "firebase.js" may be used.');
return Hm(a).then(function(){return yn(a).updateCurrentUser(b.user)}).then(function(){b.user=yn(a).currentUser;b.operationType="signIn";b.credential&&b.credential.providerId&&"password"==b.credential.providerId&&(b.credential=null);return b})})}m.Kb=function(a,b){Y(this);return X(this).signInWithEmailAndPassword(a,b)};function Hm(a){Y(a);return X(a).signOut()}function Xn(a,b,c){Y(a);if(b&&b.code&&("auth/email-already-in-use"==b.code||"auth/credential-already-in-use"==b.code)){var d=ug(S(a));return B().then(function(){return d(new Hd("anonymous-upgrade-merge-conflict",
null,c||b.credential))}).then(function(){a.a&&(a.a.m(),a.a=null);throw b;})}return ff(b)}Aa("firebaseui.auth.AuthUI",Sn);Aa("firebaseui.auth.AuthUI.getInstance",function(a){a=Tn(a);return Un[a]?Un[a]:null});Aa("firebaseui.auth.AuthUI.prototype.disableAutoSignIn",Sn.prototype.disableAutoSignIn);Aa("firebaseui.auth.AuthUI.prototype.start",Sn.prototype.start);Aa("firebaseui.auth.AuthUI.prototype.setConfig",Sn.prototype.cb);Aa("firebaseui.auth.AuthUI.prototype.signIn",Sn.prototype.Jb);Aa("firebaseui.auth.AuthUI.prototype.reset",
Sn.prototype.reset);Aa("firebaseui.auth.AuthUI.prototype.delete",Sn.prototype.ub);Aa("firebaseui.auth.AuthUI.prototype.isPendingRedirect",Sn.prototype.gb);Aa("firebaseui.auth.AuthUIError",Hd);Aa("firebaseui.auth.AuthUIError.prototype.toJSON",Hd.prototype.toJSON);Aa("firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM",ig);Aa("firebaseui.auth.CredentialHelper.GOOGLE_YOLO","googleyolo");Aa("firebaseui.auth.CredentialHelper.NONE","none");Aa("firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID","anonymous");}).apply(typeof global!==
"undefined"?global:typeof self!=="undefined"?self:window);}).apply(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : window );if(typeof window!=='undefined'){window.dialogPolyfill=dialogPolyfill;}const auth = firebaseui.auth;

var esm = /*#__PURE__*/Object.freeze({
    auth: auth
});

export { esm as firebaseui };
//# sourceMappingURL=firebaseui.js.map
