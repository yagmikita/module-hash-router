
(function(){

    var Router = function() {

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

        var defaultCallback = function(){};

        var defaultModule = 'site';

        var defaultPage = 'index';

        var defaultParams = {};

        //var paramPattern = '((?:\/)(?:[A-z0-9\-]+)(?:\/)?(?:[A-z0-9\-]+)?)';

        var getDefaultRouteMap = function() {
            return {};
        };

        var getHash = function() {
            return window.location.hash.substring(1);
        };

        var preparePair = function(pair) {
            pair = pair.substring(1);
            pair = pair.split('/');
            return {
                key: pair[0],
                value: pair[1]
            };
        };

        var prepareParams = function(requestParams) {
            var params = {};
            for (var i = 0; i <= requestParams.length - 1; i++) {
                var resolvedPair = preparePair(requestParams[i]);
                params[resolvedPair['key']] = resolvedPair['value'];
            }
            return params;
        };

        var resolveParams = function(requestParams) {
            var page = defaultPage;
            var params = {};
            var paramsPairLikePattern = /^\/[A-z0-9\-]+\/[A-z0-9\-]+$/i;
            if (requestParams.length) {
                if (requestParams[0].match(paramsPairLikePattern)) {
                    params = prepareParams(requestParams);
                } else {
                    page = requestParams[0];
                    params = prepareParams(requestParams.splice(1, requestParams.length - 1));
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

        var getRequest = function(params, moduleName) {
            var module;
            var page;
            var paramz;
            if (params.length <= 1) {
                module = defaultModule;
                page = defaultPage;
                paramz = defaultParams;
            } else if (params.length === 2) {
                module =  moduleName;
                page = moduleName === defaultModule
                    ? params[1]
                    : defaultPage;
                paramz = defaultParams;
            } else {
                module =  moduleName;
                var r = resolveParams(params.splice(2, params.length-2));
                page = r.page;
                paramz = r.params;
            }
            return {
                module: module.replace(/\s/g, ''),
                page: page.replace(/\s/g, ''),
                params: paramz
            };
        };

        var go = function(route) {
            for (var n in routesMap) {
                var regexp = routesMap[n]['pattern'];
                if (regexp.test(route)) {
                    beforeNavigateCallback();
                    var Request = getRequest(regexp.exec(route).filter(function(param) {
                        return typeof param !== 'undefined';
                    }), n);
                    var res = routesMap[n]['handler'](Request);
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

        this.setDefaultCallback = function(callback) {
            if (typeof callback === 'function') {
                defaultCallback = callback;
            }
            return this;
        };

        this.setDefaultModule = function(moduleName) {
            if (typeof moduleName === 'string') {
                defaultModule = moduleName;
            }
            return this;
        };

        this.setRoutes = function(_routesMap) {
            this.resetRoutes();
            for (var n in _routesMap) {
                if (typeof _routesMap[n]['pattern'] !== 'undefined') {
                    var hasHandler = typeof _routesMap[n]['handler'] !== 'undefined';
                    var Route = {
                        name: n,
                        pattern: _routesMap[n]['pattern'],
                        handler: hasHandler ? _routesMap[n]['handler'] : defaultCallback
                    };
                    this.addRoute(Route);
                }
            }
            return this;
        };

        this.resetRoutes = function() {
            routesMap = getDefaultRouteMap();
            return this;
        };

        this.addRoute = function(Route) {
            Route.handler = typeof Route.handler === 'undefined'
                ? defaultCallback
                : Route.handler;
            routesMap[Route.name] = {
                pattern: Route.pattern,
                handler: Route.handler
            };
            return this;
        };

        this.dropRoute = function(name) {
            for (var n in routesMap) {
                if (n === name) {
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
    };

    window['router'] = new Router();

}());
