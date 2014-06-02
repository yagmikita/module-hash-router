
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

        var getDefaultRouteMap = function() {
            return {};
        };

        var getHash = function() {
            return window.location.hash.substring(1);
        };

        var ParamsResolverFactory = function() {
            var StrictResolver = {
                prepareParams: function(params) {
                    var _params = {};
                    for (var i = 0; i <= params.length - 1; i++) {
                        var idx = i + 1;
                        _params['param' + idx] = params[i];
                    }
                    return _params;
                },
                resolveParams: function(requestParams) {
                    var page = defaultPage;
                    var params = defaultParams;
                    if (requestParams.params.length > 2) {
                        params = requestParams.params.splice(2, requestParams.params.length-2);
                    }
                    return {
                        module: requestParams.moduleName,
                        page: page,
                        params: StrictResolver.prepareParams(params)
                    };
                }
            };
            var NamedResolver = {
                preparePair: function(pair) {
                    pair = pair.substring(1);
                    pair = pair.split('/');
                    return {
                        key: pair[0],
                        value: pair[1]
                    };
                },
                prepareParams: function(requestParams) {
                    var params = {};
                    for (var i = 0; i <= requestParams.length - 1; i++) {
                        var resolvedPair = NamedResolver.preparePair(requestParams[i]);
                        params[resolvedPair['key']] = resolvedPair['value'];
                    }
                    return params;
                },
                resolveParams: function(requestParams) {
                    var page = defaultPage;
                    var params = defaultParams;
                    var paramsPairLikePattern = /^\/[A-z0-9\-]+\/[A-z0-9\-]+$/i;
                    if (requestParams.params.length > 2) {
                        if (requestParams.params[2].match(paramsPairLikePattern)) {
                            params = NamedResolver.prepareParams(requestParams.params.splice(2, requestParams.params.length - 2));
                        } else {
                            page = requestParams.params[2];
                            params = NamedResolver.prepareParams(requestParams.params.splice(3, requestParams.params.length - 3));
                        }
                    }
                    return {
                        module: requestParams.moduleName,
                        page: page,
                        params: params.length
                            ? params.filter(function(param) {
                                return typeof param !== 'undefined';
                            })
                            : params
                    };
                }
            };

            this.resolve = function(r) {
                return (new ParamsResolverFactory)[r.mode](r);
            };

            this.strict = function(params) {
                return StrictResolver.resolveParams(params);
            };

            this.named = function(params) {
                return NamedResolver.resolveParams(params);
            };
        };

        var getRequest = function(params, moduleName, mode) {
            var factory = new ParamsResolverFactory();
            var r = factory.resolve({
                params: params,
                moduleName: moduleName,
                mode: mode
            });
            return {
                module: moduleName,
                page: r.page.replace(/\s/g, ''),
                params: r.params
            };
        };

        var go = function(route) {
            for (var n in routesMap) {
                var regexp = routesMap[n]['pattern'];
                if (regexp.test(route)) {
                    beforeNavigateCallback();
//debugger;
                    var Request = getRequest(regexp.exec(route).filter(function(param) {
                        return typeof param !== 'undefined';
                    }), n, routesMap[n]['mode']);
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
                        mode: _routesMap[n]['mode'],
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
                handler: Route.handler,
                mode: Route.mode
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
