
var SiteConfig = {
    defaultPage: 'index',
    defaultParams: {},
    mode: 'std'
};

var SiteModule = function() {

    var module = new BaseModule();

    module.pages = {
        'index': function(Request, moduleId) {
            console.log('Module "' + moduleId + '": "index" page (Request): ', Request);
        },
        'terms-of-use': function(Request, moduleId) {
            console.log('Module "' + moduleId + '": "terms-of-use" page (Request): ', Request);
        },
        'about-us': function(Request, moduleId) {
            console.log('Module "' + moduleId + '": "about-us" page (Request): ', Request);
        },
        'dating-tips': function(Request, moduleId) {
            console.log('Module "' + moduleId + '": "dating-tips" page (Request): ', Request);
        }
    }

    module.setConfig(SiteConfig);

    return module;
};

var UpgradeConfig = {
    defaultPage: 'benefits',
    defaultParams: {},
    mode: 'named',
    pattern: /^(upgrade){1}(?:\/)?([A-z0-9\-]+)?(\/id\/(?:\d+)?)?(\/code\/(?:[A-z0-9\-]+)?)?$/i
};

var UpgradeModule = function() {

    var module = new BaseModule();

    module.pages = {
        'benefits': function(Request, moduleId) {
            console.log('Module "' + moduleId + '": "benefits" page (Request): ', Request);
        },
        'packages': function(Request, moduleId) {
            console.log('Module "' + moduleId + '": "packages" page (Request): ', Request);
        }
    }

    module.setConfig(UpgradeConfig);

    return module;
};

var RegisterConfig = {
    defaultPage: 'about-your-date',
    defaultParams: {},
    mode: 'std',
    trapHandler: function(moduleId) {
        alert('"' + moduleId + '" module can not handle the request');
        return false;
    }
};

var RegisterModule = function() {

    var module = new BaseModule();

    module.pages = {
        'about-your-date': function(Request, moduleId) {
            console.log('Module "' + moduleId + '": about-your-date (Request): ', Request);
        },
        'about-yourself': function(Request, moduleId) {
            console.log('Module "' + moduleId + '": about-yourself (Request): ', Request);
        },
        'add-a-photo': function(Request, moduleId) {
            console.log('Module "' + moduleId + '": add-a-photo (Request): ', Request);
        },
        'see-anyone-interesting': function(Request, moduleId) {
            console.log('Module "' + moduleId + '": see-anyone-interesting (Request): ', Request);
        }
    };

    module.setConfig(RegisterConfig);

    return module;
};

var ChatConfig = {
    defaultPage: 'index',
    defaultParams: {},
    mode: 'singlePage'
};

var ChatModule = function() {

    var module = new BaseModule();

    module.pages = {
        'index': function(Request, moduleId) {
            console.log('Module "' + moduleId + '": index (Request): ', Request);
        }
    };

    module.setConfig(ChatConfig);

    return module;
};

var UserConfig = {
    defaultPage: 'index',
    defaultParams: {},
    mode: 'named',
    pattern:  /^(user){1}(?:\/)?([A-z0-9\-]+)?(\/id\/(?:\d+)?)?(\/mode\/(?:[A-z0-9\-]+)?)?(\/id-media\/(?:\d+)?)?(?:\/)?$/i
};

var UserModule = function() {

    var module = new BaseModule();

    module.pages = {
        'index': function(Request, moduleId) {
            console.log('Module "' + moduleId + '": index (Request): ', Request);
        }
    };

    module.setConfig(UserConfig);

    return module;
};
