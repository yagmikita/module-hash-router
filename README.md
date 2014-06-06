module-hash-router
===========

Easy to use, flexible, extensible, compact JavaScript hash module router


Features
========

 * flexible modular system
 * regexp routes mapping
 * manual injectable dispatchers for either module
 * before & after callbacks
 * add routes on the fly


Example
=======

```javascript
// initialization:
// after the library is loaded via <script type="text/javascript" src="./router.js"></script>
// the following lines of code will set the hash-router to work
            window.router = new Router();
            router.setRoutes({
                register: 'std',
                upgrade: 'named',
                chat: 'singlePage',
                site: 'std',
                user: 'named'
            }).enable();
```
