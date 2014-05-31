hash-router
===========

Easy to use, flexible, extensible, compact JavaScript hash router


Features
========

 * regexp routes mapping
 * manual injectable handler for either route
 * before & after callbacks
 * add routes on the fly


Example
=======

```javascript
// initialization:
// after the library is loaded via <script type="text/javascript" src="./router.js"></script>
// the following lines of code will set the hash-router to work
            router
                .setDefaultCallback(function(Request) {
                    console.log('... => Loading module: "' + Request.module + '", page: "' + Request.page + '", params: ', Request.params);
                })
                .setRoutes({
                    registration: {
                        pattern: /^(registration){1}\/(\/mode\/(?:[A-z0-9\-]+)?)?$/i
                    },
                    chat: {
                        pattern: /^(chat){1}(?:\/)(:\/id\/(?:\d+)?)?$/i
                    },
                    my: {
                        pattern: /^(my){1}(?:\/)?([A-z0-9\-]+)?(\/mode\/(?:[A-z0-9\-]+)?)?(\/id-media\/(?:\d+)?)?(?:\/)?$/i
                    },
                    user: {
                        pattern: /^(user){1}(?:\/)?([A-z0-9\-]+)?(\/id\/(?:\d+)?)?(\/mode\/(?:[A-z0-9\-]+)?)?(\/id-media\/(?:\d+)?)?(?:\/)?$/i
                    },
                    upgrade: {
                        pattern: /^(upgrade){1}(?:\/)?([A-z0-9\-]+)?(\/id\/(?:\d+)?)?(\/code\/(?:[A-z0-9\-]+)?)?$/i
                    },
                    site: {
                        pattern: /(terms-of-use|about-us|help)/i
                    }
                })
                .enable();
```
