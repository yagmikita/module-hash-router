
var BaseModule = function() {

    var Module = function() {

        var config = {};

        var defaultTrapHandler = function(pageName) {
            console.log('[Module] getTrapHandler("' + pageName + '"): provided module page does not exist');
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

        var getTrapHandler = function(pageName) {
            if (typeof config['trapHandler'] !== 'undefined') {
                return config['trapHandler'](pageName);
            } else {
                defaultTrapHandler(pageName);
            }
        };

        this.pages = {};

        /**
         * @param Array params
         * @returns Object
         */
        this.dispatch = function(params) {
            params = typeof params === 'undefined'
                ? []
                : params;
            var Request = getDispatcher()
                .setConfig({
                    defaultPage: getDefaultPage(),
                    defaultParams: getDefaultParams()
                })
                .setParams(params)
                .dispatch();
            var pageId = Request.page;
            if (pageId in this) {
                return this.pages[pageId](Request);
            } else {
                return getTrapHandler(pageId);
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
    };

    return new Dispatcher();
};

var SinglePageDispatcher = function() {

    var dispatcher = new BaseDispatcher();

    dispatcher.prepareParams = function(requestParams) {
        var _params = {};
        for (var i = 0; i <= requestParams.length - 1; i++) {
            var idx = i + 1;
            _params['param' + idx] = requestParams[i];
        }
        return _params;
    };

    dispatcher.dispatch = function() {
        var params = dispatcher.getConfig().defaultParams;
        if (dispatcher.getParams().length) {
            if (dispatcher.getParams().length > 1) {
                params = dispatcher.getParams().splice(1, dispatcher.getParams().length - 1);
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

    dispatcher.prepareParams = function(requestParams) {
        var _params = {};
        for (var i = 0; i <= requestParams.length - 1; i++) {
            var idx = i + 1;
            _params['param' + idx] = requestParams[i];
        }
        return _params;
    };

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
    var defaultModes = ['std', 'singlePage', 'named'];

    var modesPatterns = {
        std: /^([A-z0-9\-]+){1}(?:\/)?([A-z0-9\-]+)?(?:\/)?([A-z0-9\-]+)?$/i,
        singlePage: /^([A-z0-9\-]+){1}(?:\/)?([A-z0-9\-]+)?$/i,
        named: false
    };

    /**
     * @type String
     */
    var defaultMode = 'std';

    /**
     * @type String
     */
    var defaultModule = 'site';

    /**
     * @type Function
     */
    var defaultHandler = function(){};

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

    var getModuleConfig = function(moduleId) {
        var className = moduleId.substring(0,1).toUpperCase() + moduleId.substring(1) + 'Module';
        return eval('new ' + className + '();').getConfig();
    };

    var getPatternByMode = function(moduleId, mode) {
        if (mode === 'std' || mode === 'singlePage') {
            return modesPatterns[mode];
        } else {
            var config = getModuleConfig(moduleId)
            return // get from module config
        }
    };

    var getRequest = function(params, moduleId, mode) {
        var factory = new ParamsResolverFactory();
        var r = factory.resolve({
            params: params,
            moduleName: moduleId,
            mode: mode
        });
        return {
            module: moduleId,
            page: r.page.replace(/\s/g, ''),
            params: r.params
        };
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

    this.setDefaultHandler = function(handler) {
        if (typeof handler === 'function') {
            defaultHandler = handler;
        }
        return this;
    };

    this.setDefaultModule = function(moduleId) {
        if (typeof moduleId === 'string') {
            defaultModule = moduleId;
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
            ? defaultHandler
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
        for (var moduleId in routesMap) {
            var regexp = getPatternByMode(routesMap[moduleId]);
            if (regexp.test(route)) {
                beforeNavigateCallback();
                var Request = getRequest(regexp.exec(route).filter(function(param) {
                    return typeof param !== 'undefined';
                }), moduleId, routesMap[moduleId]);
                var res = routesMap[moduleId]['handler'](Request);
                afterNavigateCallback();
                return res;
            }
        }
        trapHandler();
        return false;
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
