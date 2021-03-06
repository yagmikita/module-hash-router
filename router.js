
var BaseModule = function() {

    var Module = function() {

        var config = {};

        var defaultTrapHandler = function(moduleId, pageId) {
            console.log('Module "' + moduleId + '" can not resolve page "' + pageId + '" as it is absent.');
            return false;
        };

        var getMode = function() {
            return config['mode'];
        };

        var getDefaultPage = function() {
            return config['defaultPage'];
        };

        var getDefaultParams = function() {
            return config['defaultParams'];
        };

        var getDispatcher = function() {
            var className = getMode().substring(0,1).toUpperCase() + getMode().substring(1) + 'Dispatcher';
            return eval('new ' + className + '();');
        };

        var getTrapHandler = function(moduleId, pageId) {
            if (typeof config['trapHandler'] !== 'undefined') {
                return config['trapHandler'](moduleId, pageId);
            } else {
                return defaultTrapHandler(moduleId, pageId);
            }
        };

        this.pages = {};

        /**
         * @param Array params
         * @returns Object
         */
        this.dispatch = function(requestParams, moduleId) {
            requestParams = typeof requestParams === 'undefined'
                ? []
                : requestParams;
            var Request = getDispatcher()
                .setConfig({
                    defaultPage: getDefaultPage(),
                    defaultParams: getDefaultParams()
                })
                .setParams(requestParams)
                .dispatch();
            var pageId = Request.page;
            if (pageId in this.pages) {
                return this.pages[pageId](Request, moduleId);
            } else {
                return getTrapHandler(moduleId, pageId);
            }
        };

        this.setConfig = function(cfg) {
            config = cfg;
            return this;
        };

        this.getConfig = function() {
            return config;
        };

    };

    return new Module();

};

var BaseDispatcher = function() {

    var Dispatcher = function() {

        var params = {};

        var config = {};

        this.setParams = function(requestParams) {
            params = requestParams;
            return this;
        };

        this.setConfig = function(moduleConfig) {
            config = moduleConfig;
            return this;
        };

        this.getParams = function() {
            return params;
        };

        this.getConfig = function() {
            return config;
        };

        this.prepareParams = function(requestParams) {
            var _params = {};
            for (var i = 0; i <= requestParams.length - 1; i++) {
                var idx = i + 1;
                var key;
                if (i === 0) {
                    key = 'id';
                } else {
                    key = 'param' + idx;
                }
                _params[key] = requestParams[i];
            }
            return _params;
        };
    };

    return new Dispatcher();
};

var SinglePageDispatcher = function() {

    var dispatcher = new BaseDispatcher();

    dispatcher.dispatch = function() {
        var params = dispatcher.getConfig().defaultParams;
        if (dispatcher.getParams().length) {
            if (dispatcher.getParams().length) {
                params = dispatcher.getParams();
            }
        }
        return {
            page: dispatcher.getConfig().defaultPage,
            params: dispatcher.prepareParams(params)
        };
    };

    return dispatcher;

};

var StdDispatcher = function() {

    var dispatcher = new BaseDispatcher();

    dispatcher.dispatch = function() {
        var page = dispatcher.getConfig().defaultPage;
        var params = dispatcher.getConfig().defaultParams;
        if (dispatcher.getParams().length) {
            page = dispatcher.getParams()[0];
            if (dispatcher.getParams().length > 1) {
                params = dispatcher.getParams().splice(1, dispatcher.getParams().length - 1);
            }
        }
        return {
            page: page,
            params: dispatcher.prepareParams(params)
        };
    };

    return dispatcher;

};

var NamedDispatcher = function() {

    var dispatcher = new BaseDispatcher();

    dispatcher.preparePair = function(pair) {
        pair = pair.substring(1).split('/');
        return {
            key: pair[0],
            value: pair[1]
        };
    };

    dispatcher.prepareParams = function(requestParams) {
        var _params = {};
        for (var i = 0; i <= requestParams.length - 1; i++) {
            var resolvedPair = dispatcher.preparePair(requestParams[i]);
            _params[resolvedPair['key']] = resolvedPair['value'];
        }
        return _params;
    };

    dispatcher.dispatch = function() {
        var page = dispatcher.getConfig().defaultPage;
        var params = dispatcher.getConfig().defaultParams;
        var paramsPairLikePattern = /^\/[A-z0-9\-]+\/[A-z0-9\-]+$/i;
        if (dispatcher.getParams().length) {
            if (dispatcher.getParams()[0].match(paramsPairLikePattern)) {
                params = dispatcher.prepareParams(dispatcher.getParams());
            } else {
                page = dispatcher.getParams()[0];
                params = dispatcher.prepareParams(dispatcher.getParams().splice(1, dispatcher.getParams().length - 1));
            }
        }
        return {
            page: page,
            params: params.length
                ? params.filter(function(param) {
                    return typeof param !== 'undefined';
                })
                : params
        };
    };

    return dispatcher;

};

var Router = function() {

    /**
     * @type Array
     */
    var predefinedModes = ['std', 'singlePage'];

    var modesPatterns = {
        std: /^([A-z0-9\-]+){1}(?:\/)?([A-z0-9\-]+)?(?:\/)?([A-z0-9\-]+)?$/i,
        singlePage: /^([A-z0-9\-]+){1}(?:\/)?([A-z0-9\-]+)?$/i,
        named: false
    };

    /**
     * @type String
     */
    var defaultModuleId = 'site';

    /**
     * @type Function
     */
    var defaultMode = 'std';

    /**
     * @type Array
     */
    var routesMap = [];

    var beforeNavigateCallback = function() {
        console.log('beforeNavigateCallback(): empty callback');
    };

    var afterNavigateCallback = function() {
        console.log('afterNavigateCallback(): empty callback');
    };

    var trapHandler = function() {
        console.log('trapHandler(): none of the injected routes matched your request!');
    };

    var getDefaultRouteMap = function() {
        return {};
    };

    var getHash = function() {
        return window.location.hash.substring(1);
    };

    var getPatternByMode = function(moduleId, mode, callback) {
        if (predefinedModes.indexOf(mode) >= 0) {
            callback(modesPatterns[mode]);
        } else {
            getModule(moduleId, function(module) {
                var config = module.getConfig();
                if (typeof config.pattern !== 'undefined') {
                    callback(config.pattern);
                } else {
                    callback(false);
                }
            });
        }
    };

    var getModule = function(moduleId, callback) {
        var className = moduleId.substring(0,1).toUpperCase() + moduleId.substring(1) + 'Module';
        var module;
        try {
            module = eval('new ' + className + '();');
        } catch(error) {
            console.log('Router: failed to fined module with id "' + moduleId + '"');
            console.log('Router: attempting to resolve request with default module "' + defaultModuleId + '"');
            className = defaultModuleId.substring(0,1).toUpperCase() + defaultModuleId.substring(1) + 'Module';
            module = eval('new ' + className + '();');
        }
        callback(module);
    };

    var getRequestParams = function(params) {
        if (params.length >= 3) {
            return params.splice(2, params.length -1);
        }
        return [];
    };

    var grabModuleId = function(route) {
        var moduleGrabberPattern = /^([A-z0-9\-]+){1}(?:.*)/i;
        var res = moduleGrabberPattern.exec(route);
        return res[1];
    };

    this.getHash = function() {
        return getHash();
    };

    this.setBeforeNavigate = function(callback) {
        if (typeof callback === 'function') {
            beforeNavigateCallback = callback;
        }
        return this;
    };

    this.setAfterNavigate = function(callback) {
        if (typeof callback === 'function') {
            afterNavigateCallback = callback;
        }
        return this;
    };

    this.setTrapHandler = function(callback) {
        if (typeof callback === 'function') {
            trapHandler = callback;
        }
        return this;
    };

    this.setDefaultModuleId = function(moduleId) {
        if (typeof moduleId === 'string') {
            defaultModuleId = moduleId;
        }
        return this;
    };

    this.setRoutes = function(_routesMap) {
        this.resetRoutes();
        routesMap = _routesMap;
        return this;
    };

    this.resetRoutes = function() {
        routesMap = getDefaultRouteMap();
        return this;
    };

    this.addRoute = function(Route) {
        Route.mode = typeof Route.mode === 'undefined'
            ? defaultMode
            : Route.mode;
        routesMap[Route.moduleId] = Route.mode;
        return this;
    };

    this.dropRoute = function(moduleId) {
        for (var n in routesMap) {
            if (n === moduleId) {
                delete routesMap[n];
            }
        }
        routesMap.filter(function(route) {
            return typeof route !== 'undefined';
        });
        return this;
    };

    this.navigate = function(route) {
        if (typeof route === 'undefined') {
            route = getHash();
        }
        return go(route);
    };

    this.enable = function() {
        addEventListener();
        if (this.getHash().length) {
            this.navigate(this.getHash());
        }
        return this;
    };

    var go = function(route) {
        var handler = function(regexp, route, moduleId) {
            var requestParams;
            regexp = (false === regexp
                ? modesPatterns.std
                : regexp);
            beforeNavigateCallback();
            if (moduleId === defaultModuleId) {
                var _params = regexp.exec(route).filter(function(param) {
                    return typeof param !== 'undefined';
                });
                var _page = _params[1];
                _params[1] = moduleId;
                _params[2] = _page;
                requestParams = getRequestParams(_params);
            } else {
                requestParams = getRequestParams(regexp.exec(route).filter(function(param) {
                    return typeof param !== 'undefined';
                }));
            }
            return getModule(moduleId, function(module) {
                var res = module.dispatch(requestParams, moduleId);
                afterNavigateCallback();
            });
        };
        var moduleId = grabModuleId(route);
        getPatternByMode(moduleId, routesMap[moduleId], function(regexp) {
            if (false === regexp) {
                return handler(regexp, route, defaultModuleId);
            } else if (regexp.test(route)) {
                return handler(regexp, route, moduleId);
            } else {
                return trapHandler();
            }
        });
    };

    var navigate = function(e) {
        if (e.newURL !== e.oldURL) {
            return go(getHash());
        }
    };

    var addEventListener = function() {
        if (window.addEventListener) {
            window.addEventListener('hashchange', navigate, false);
        } else {
            window.attachEvent('onhashchange', navigate);
        }
    };

};
