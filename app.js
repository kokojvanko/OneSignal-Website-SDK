(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = null;
    hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};

require.register("brunch/node_modules/process/browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "brunch/node_modules/process");
  (function() {
    // shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };
  })();
});

require.register("atoa/atoa.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "atoa");
  (function() {
    module.exports = function atoa (a, n) { return Array.prototype.slice.call(a, n); }
  })();
});

require.register("bowser/src/bowser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bowser");
  (function() {
    /*!
 * Bowser - a browser detector
 * https://github.com/ded/bowser
 * MIT License | (c) Dustin Diaz 2015
 */

!function (name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(name, definition)
  else this[name] = definition()
}('bowser', function () {
  /**
    * See useragents.js for examples of navigator.userAgent
    */

  var t = true

  function detect(ua) {

    function getFirstMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[1]) || '';
    }

    function getSecondMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[2]) || '';
    }

    var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase()
      , likeAndroid = /like android/i.test(ua)
      , android = !likeAndroid && /android/i.test(ua)
      , nexusMobile = /nexus\s*[0-6]\s*/i.test(ua)
      , nexusTablet = !nexusMobile && /nexus\s*[0-9]+/i.test(ua)
      , chromeos = /CrOS/.test(ua)
      , silk = /silk/i.test(ua)
      , sailfish = /sailfish/i.test(ua)
      , tizen = /tizen/i.test(ua)
      , webos = /(web|hpw)os/i.test(ua)
      , windowsphone = /windows phone/i.test(ua)
      , samsungBrowser = /SamsungBrowser/i.test(ua)
      , windows = !windowsphone && /windows/i.test(ua)
      , mac = !iosdevice && !silk && /macintosh/i.test(ua)
      , linux = !android && !sailfish && !tizen && !webos && /linux/i.test(ua)
      , edgeVersion = getFirstMatch(/edge\/(\d+(\.\d+)?)/i)
      , versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i)
      , tablet = /tablet/i.test(ua)
      , mobile = !tablet && /[^-]mobi/i.test(ua)
      , xbox = /xbox/i.test(ua)
      , result

    if (/opera/i.test(ua)) {
      //  an old Opera
      result = {
        name: 'Opera'
      , opera: t
      , version: versionIdentifier || getFirstMatch(/(?:opera|opr|opios)[\s\/](\d+(\.\d+)?)/i)
      }
    } else if (/opr|opios/i.test(ua)) {
      // a new Opera
      result = {
        name: 'Opera'
        , opera: t
        , version: getFirstMatch(/(?:opr|opios)[\s\/](\d+(\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (/SamsungBrowser/i.test(ua)) {
      result = {
        name: 'Samsung Internet for Android'
        , samsungBrowser: t
        , version: versionIdentifier || getFirstMatch(/(?:SamsungBrowser)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/coast/i.test(ua)) {
      result = {
        name: 'Opera Coast'
        , coast: t
        , version: versionIdentifier || getFirstMatch(/(?:coast)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/yabrowser/i.test(ua)) {
      result = {
        name: 'Yandex Browser'
      , yandexbrowser: t
      , version: versionIdentifier || getFirstMatch(/(?:yabrowser)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/ucbrowser/i.test(ua)) {
      result = {
          name: 'UC Browser'
        , ucbrowser: t
        , version: getFirstMatch(/(?:ucbrowser)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/mxios/i.test(ua)) {
      result = {
        name: 'Maxthon'
        , maxthon: t
        , version: getFirstMatch(/(?:mxios)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/epiphany/i.test(ua)) {
      result = {
        name: 'Epiphany'
        , epiphany: t
        , version: getFirstMatch(/(?:epiphany)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/puffin/i.test(ua)) {
      result = {
        name: 'Puffin'
        , puffin: t
        , version: getFirstMatch(/(?:puffin)[\s\/](\d+(?:\.\d+)?)/i)
      }
    }
    else if (/sleipnir/i.test(ua)) {
      result = {
        name: 'Sleipnir'
        , sleipnir: t
        , version: getFirstMatch(/(?:sleipnir)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/k-meleon/i.test(ua)) {
      result = {
        name: 'K-Meleon'
        , kMeleon: t
        , version: getFirstMatch(/(?:k-meleon)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (windowsphone) {
      result = {
        name: 'Windows Phone'
      , windowsphone: t
      }
      if (edgeVersion) {
        result.msedge = t
        result.version = edgeVersion
      }
      else {
        result.msie = t
        result.version = getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/msie|trident/i.test(ua)) {
      result = {
        name: 'Internet Explorer'
      , msie: t
      , version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
      }
    } else if (chromeos) {
      result = {
        name: 'Chrome'
      , chromeos: t
      , chromeBook: t
      , chrome: t
      , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    } else if (/chrome.+? edge/i.test(ua)) {
      result = {
        name: 'Microsoft Edge'
      , msedge: t
      , version: edgeVersion
      }
    }
    else if (/vivaldi/i.test(ua)) {
      result = {
        name: 'Vivaldi'
        , vivaldi: t
        , version: getFirstMatch(/vivaldi\/(\d+(\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (sailfish) {
      result = {
        name: 'Sailfish'
      , sailfish: t
      , version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/seamonkey\//i.test(ua)) {
      result = {
        name: 'SeaMonkey'
      , seamonkey: t
      , version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/firefox|iceweasel|fxios/i.test(ua)) {
      result = {
        name: 'Firefox'
      , firefox: t
      , version: getFirstMatch(/(?:firefox|iceweasel|fxios)[ \/](\d+(\.\d+)?)/i)
      }
      if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
        result.firefoxos = t
      }
    }
    else if (silk) {
      result =  {
        name: 'Amazon Silk'
      , silk: t
      , version : getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/phantom/i.test(ua)) {
      result = {
        name: 'PhantomJS'
      , phantom: t
      , version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/slimerjs/i.test(ua)) {
      result = {
        name: 'SlimerJS'
        , slimer: t
        , version: getFirstMatch(/slimerjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
      result = {
        name: 'BlackBerry'
      , blackberry: t
      , version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
      }
    }
    else if (webos) {
      result = {
        name: 'WebOS'
      , webos: t
      , version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
      };
      /touchpad\//i.test(ua) && (result.touchpad = t)
    }
    else if (/bada/i.test(ua)) {
      result = {
        name: 'Bada'
      , bada: t
      , version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
      };
    }
    else if (tizen) {
      result = {
        name: 'Tizen'
      , tizen: t
      , version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
      };
    }
    else if (/qupzilla/i.test(ua)) {
      result = {
        name: 'QupZilla'
        , qupzilla: t
        , version: getFirstMatch(/(?:qupzilla)[\s\/](\d+(?:\.\d+)+)/i) || versionIdentifier
      }
    }
    else if (/chromium/i.test(ua)) {
      result = {
        name: 'Chromium'
        , chromium: t
        , version: getFirstMatch(/(?:chromium)[\s\/](\d+(?:\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (/chrome|crios|crmo/i.test(ua)) {
      result = {
        name: 'Chrome'
        , chrome: t
        , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    }
    else if (android) {
      result = {
        name: 'Android'
        , version: versionIdentifier
      }
    }
    else if (/safari|applewebkit/i.test(ua)) {
      result = {
        name: 'Safari'
      , safari: t
      }
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if (iosdevice) {
      result = {
        name : iosdevice == 'iphone' ? 'iPhone' : iosdevice == 'ipad' ? 'iPad' : 'iPod'
      }
      // WTF: version is not part of user agent in web apps
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if(/googlebot/i.test(ua)) {
      result = {
        name: 'Googlebot'
      , googlebot: t
      , version: getFirstMatch(/googlebot\/(\d+(\.\d+))/i) || versionIdentifier
      }
    }
    else {
      result = {
        name: getFirstMatch(/^(.*)\/(.*) /),
        version: getSecondMatch(/^(.*)\/(.*) /)
     };
   }

    // set webkit or gecko flag for browsers based on these engines
    if (!result.msedge && /(apple)?webkit/i.test(ua)) {
      if (/(apple)?webkit\/537\.36/i.test(ua)) {
        result.name = result.name || "Blink"
        result.blink = t
      } else {
        result.name = result.name || "Webkit"
        result.webkit = t
      }
      if (!result.version && versionIdentifier) {
        result.version = versionIdentifier
      }
    } else if (!result.opera && /gecko\//i.test(ua)) {
      result.name = result.name || "Gecko"
      result.gecko = t
      result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i)
    }

    // set OS flags for platforms that have multiple browsers
    if (!result.msedge && (android || result.silk)) {
      result.android = t
    } else if (iosdevice) {
      result[iosdevice] = t
      result.ios = t
    } else if (mac) {
      result.mac = t
    } else if (xbox) {
      result.xbox = t
    } else if (windows) {
      result.windows = t
    } else if (linux) {
      result.linux = t
    }

    // OS version extraction
    var osVersion = '';
    if (result.windowsphone) {
      osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
    } else if (iosdevice) {
      osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
      osVersion = osVersion.replace(/[_\s]/g, '.');
    } else if (android) {
      osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
    } else if (result.webos) {
      osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
    } else if (result.blackberry) {
      osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
    } else if (result.bada) {
      osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
    } else if (result.tizen) {
      osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
    }
    if (osVersion) {
      result.osversion = osVersion;
    }

    // device type extraction
    var osMajorVersion = osVersion.split('.')[0];
    if (
         tablet
      || nexusTablet
      || iosdevice == 'ipad'
      || (android && (osMajorVersion == 3 || (osMajorVersion >= 4 && !mobile)))
      || result.silk
    ) {
      result.tablet = t
    } else if (
         mobile
      || iosdevice == 'iphone'
      || iosdevice == 'ipod'
      || android
      || nexusMobile
      || result.blackberry
      || result.webos
      || result.bada
    ) {
      result.mobile = t
    }

    // Graded Browser Support
    // http://developer.yahoo.com/yui/articles/gbs
    if (result.msedge ||
        (result.msie && result.version >= 10) ||
        (result.yandexbrowser && result.version >= 15) ||
		    (result.vivaldi && result.version >= 1.0) ||
        (result.chrome && result.version >= 20) ||
        (result.samsungBrowser && result.version >= 4) ||
        (result.firefox && result.version >= 20.0) ||
        (result.safari && result.version >= 6) ||
        (result.opera && result.version >= 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] >= 6) ||
        (result.blackberry && result.version >= 10.1)
        || (result.chromium && result.version >= 20)
        ) {
      result.a = t;
    }
    else if ((result.msie && result.version < 10) ||
        (result.chrome && result.version < 20) ||
        (result.firefox && result.version < 20.0) ||
        (result.safari && result.version < 6) ||
        (result.opera && result.version < 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] < 6)
        || (result.chromium && result.version < 20)
        ) {
      result.c = t
    } else result.x = t

    return result
  }

  var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent || '' : '')

  bowser.test = function (browserList) {
    for (var i = 0; i < browserList.length; ++i) {
      var browserItem = browserList[i];
      if (typeof browserItem=== 'string') {
        if (browserItem in bowser) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get version precisions count
   *
   * @example
   *   getVersionPrecision("1.10.3") // 3
   *
   * @param  {string} version
   * @return {number}
   */
  function getVersionPrecision(version) {
    return version.split(".").length;
  }

  /**
   * Array::map polyfill
   *
   * @param  {Array} arr
   * @param  {Function} iterator
   * @return {Array}
   */
  function map(arr, iterator) {
    var result = [], i;
    if (Array.prototype.map) {
      return Array.prototype.map.call(arr, iterator);
    }
    for (i = 0; i < arr.length; i++) {
      result.push(iterator(arr[i]));
    }
    return result;
  }

  /**
   * Calculate browser version weight
   *
   * @example
   *   compareVersions(['1.10.2.1',  '1.8.2.1.90'])    // 1
   *   compareVersions(['1.010.2.1', '1.09.2.1.90']);  // 1
   *   compareVersions(['1.10.2.1',  '1.10.2.1']);     // 0
   *   compareVersions(['1.10.2.1',  '1.0800.2']);     // -1
   *
   * @param  {Array<String>} versions versions to compare
   * @return {Number} comparison result
   */
  function compareVersions(versions) {
    // 1) get common precision for both versions, for example for "10.0" and "9" it should be 2
    var precision = Math.max(getVersionPrecision(versions[0]), getVersionPrecision(versions[1]));
    var chunks = map(versions, function (version) {
      var delta = precision - getVersionPrecision(version);

      // 2) "9" -> "9.0" (for precision = 2)
      version = version + new Array(delta + 1).join(".0");

      // 3) "9.0" -> ["000000000"", "000000009"]
      return map(version.split("."), function (chunk) {
        return new Array(20 - chunk.length).join("0") + chunk;
      }).reverse();
    });

    // iterate in reverse order by reversed chunks array
    while (--precision >= 0) {
      // 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
      if (chunks[0][precision] > chunks[1][precision]) {
        return 1;
      }
      else if (chunks[0][precision] === chunks[1][precision]) {
        if (precision === 0) {
          // all version chunks are same
          return 0;
        }
      }
      else {
        return -1;
      }
    }
  }

  /**
   * Check if browser is unsupported
   *
   * @example
   *   bowser.isUnsupportedBrowser({
   *     msie: "10",
   *     firefox: "23",
   *     chrome: "29",
   *     safari: "5.1",
   *     opera: "16",
   *     phantom: "534"
   *   });
   *
   * @param  {Object}  minVersions map of minimal version to browser
   * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
   * @param  {String}  [ua] user agent string
   * @return {Boolean}
   */
  function isUnsupportedBrowser(minVersions, strictMode, ua) {
    var _bowser = bowser;

    // make strictMode param optional with ua param usage
    if (typeof strictMode === 'string') {
      ua = strictMode;
      strictMode = void(0);
    }

    if (strictMode === void(0)) {
      strictMode = false;
    }
    if (ua) {
      _bowser = detect(ua);
    }

    var version = "" + _bowser.version;
    for (var browser in minVersions) {
      if (minVersions.hasOwnProperty(browser)) {
        if (_bowser[browser]) {
          // browser version and min supported version.
          return compareVersions([version, minVersions[browser]]) < 0;
        }
      }
    }

    return strictMode; // not found
  }

  /**
   * Check if browser is supported
   *
   * @param  {Object} minVersions map of minimal version to browser
   * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
   * @param  {String}  [ua] user agent string
   * @return {Boolean}
   */
  function check(minVersions, strictMode, ua) {
    return !isUnsupportedBrowser(minVersions, strictMode, ua);
  }

  bowser.isUnsupportedBrowser = isUnsupportedBrowser;
  bowser.compareVersions = compareVersions;
  bowser.check = check;

  /*
   * Set our detect method to the main bowser object so we can
   * reuse it to test other user agents.
   * This is needed to implement future tests.
   */
  bowser._detect = detect;

  return bowser
});
  })();
});

require.register("contra/debounce.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "contra");
  (function() {
    'use strict';

var ticky = require('ticky');

module.exports = function debounce (fn, args, ctx) {
  if (!fn) { return; }
  ticky(function run () {
    fn.apply(ctx || null, args || []);
  });
};
  })();
});

require.register("contra/emitter.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "contra");
  (function() {
    'use strict';

var atoa = require('atoa');
var debounce = require('./debounce');

module.exports = function emitter (thing, options) {
  var opts = options || {};
  var evt = {};
  if (thing === undefined) { thing = {}; }
  thing.on = function (type, fn) {
    if (!evt[type]) {
      evt[type] = [fn];
    } else {
      evt[type].push(fn);
    }
    return thing;
  };
  thing.once = function (type, fn) {
    fn._once = true; // thing.off(fn) still works!
    thing.on(type, fn);
    return thing;
  };
  thing.off = function (type, fn) {
    var c = arguments.length;
    if (c === 1) {
      delete evt[type];
    } else if (c === 0) {
      evt = {};
    } else {
      var et = evt[type];
      if (!et) { return thing; }
      et.splice(et.indexOf(fn), 1);
    }
    return thing;
  };
  thing.emit = function () {
    var args = atoa(arguments);
    return thing.emitterSnapshot(args.shift()).apply(this, args);
  };
  thing.emitterSnapshot = function (type) {
    var et = (evt[type] || []).slice(0);
    return function () {
      var args = atoa(arguments);
      var ctx = this || thing;
      if (type === 'error' && opts.throws !== false && !et.length) { throw args.length === 1 ? args[0] : args; }
      et.forEach(function emitter (listen) {
        if (opts.async) { debounce(listen, args, ctx); } else { listen.apply(ctx, args); }
        if (listen._once) { thing.off(type, listen); }
      });
      return thing;
    };
  };
  return thing;
};
  })();
});

require.register("es6-error/lib/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "es6-error");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    cls.apply(this, arguments);
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

var ExtendableError = function (_extendableBuiltin2) {
  _inherits(ExtendableError, _extendableBuiltin2);

  function ExtendableError() {
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    _classCallCheck(this, ExtendableError);

    // extending Error is weird and does not propagate `message`
    var _this = _possibleConstructorReturn(this, (ExtendableError.__proto__ || Object.getPrototypeOf(ExtendableError)).call(this, message));

    Object.defineProperty(_this, 'message', {
      configurable: true,
      enumerable: false,
      value: message,
      writable: true
    });

    Object.defineProperty(_this, 'name', {
      configurable: true,
      enumerable: false,
      value: _this.constructor.name,
      writable: true
    });

    if (Error.hasOwnProperty('captureStackTrace')) {
      Error.captureStackTrace(_this, _this.constructor);
      return _possibleConstructorReturn(_this);
    }

    Object.defineProperty(_this, 'stack', {
      configurable: true,
      enumerable: false,
      value: new Error(message).stack,
      writable: true
    });
    return _this;
  }

  return ExtendableError;
}(_extendableBuiltin(Error));

exports.default = ExtendableError;
module.exports = exports['default'];
  })();
});

require.register("es6-promise/dist/es6-promise.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"vertx":false}, "es6-promise");
  (function() {
    /*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   4.0.5
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  return typeof x === 'function' || typeof x === 'object' && x !== null;
}

function isFunction(x) {
  return typeof x === 'function';
}

var _isArray = undefined;
if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
} else {
  _isArray = Array.isArray;
}

var isArray = _isArray;

var len = 0;
var vertxNext = undefined;
var customSchedulerFn = undefined;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var r = require;
    var vertx = r('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var _arguments = arguments;

  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;

  if (_state) {
    (function () {
      var callback = _arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    })();
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  _resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(16);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
  try {
    then.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        _resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      _reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      _reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    _reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return _resolve(promise, value);
    }, function (reason) {
      return _reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$) {
  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$ === GET_THEN_ERROR) {
      _reject(promise, GET_THEN_ERROR.error);
    } else if (then$$ === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$)) {
      handleForeignThenable(promise, maybeThenable, then$$);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function _resolve(promise, value) {
  if (promise === value) {
    _reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function _reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;

  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = undefined,
      callback = undefined,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = undefined,
      error = undefined,
      succeeded = undefined,
      failed = undefined;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      _reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
      _resolve(promise, value);
    } else if (failed) {
      _reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      _reject(promise, value);
    }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      _resolve(promise, value);
    }, function rejectPromise(reason) {
      _reject(promise, reason);
    });
  } catch (e) {
    _reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function Enumerator(Constructor, input) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop);

  if (!this.promise[PROMISE_ID]) {
    makePromise(this.promise);
  }

  if (isArray(input)) {
    this._input = input;
    this.length = input.length;
    this._remaining = input.length;

    this._result = new Array(this.length);

    if (this.length === 0) {
      fulfill(this.promise, this._result);
    } else {
      this.length = this.length || 0;
      this._enumerate();
      if (this._remaining === 0) {
        fulfill(this.promise, this._result);
      }
    }
  } else {
    _reject(this.promise, validationError());
  }
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
};

Enumerator.prototype._enumerate = function () {
  var length = this.length;
  var _input = this._input;

  for (var i = 0; this._state === PENDING && i < length; i++) {
    this._eachEntry(_input[i], i);
  }
};

Enumerator.prototype._eachEntry = function (entry, i) {
  var c = this._instanceConstructor;
  var resolve$$ = c.resolve;

  if (resolve$$ === resolve) {
    var _then = getThen(entry);

    if (_then === then && entry._state !== PENDING) {
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof _then !== 'function') {
      this._remaining--;
      this._result[i] = entry;
    } else if (c === Promise) {
      var promise = new c(noop);
      handleMaybeThenable(promise, entry, _then);
      this._willSettleAt(promise, i);
    } else {
      this._willSettleAt(new c(function (resolve$$) {
        return resolve$$(entry);
      }), i);
    }
  } else {
    this._willSettleAt(resolve$$(entry), i);
  }
};

Enumerator.prototype._settledAt = function (state, i, value) {
  var promise = this.promise;

  if (promise._state === PENDING) {
    this._remaining--;

    if (state === REJECTED) {
      _reject(promise, value);
    } else {
      this._result[i] = value;
    }
  }

  if (this._remaining === 0) {
    fulfill(promise, this._result);
  }
};

Enumerator.prototype._willSettleAt = function (promise, i) {
  var enumerator = this;

  subscribe(promise, undefined, function (value) {
    return enumerator._settledAt(FULFILLED, i, value);
  }, function (reason) {
    return enumerator._settledAt(REJECTED, i, reason);
  });
};

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  _reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
function Promise(resolver) {
  this[PROMISE_ID] = nextId();
  this._result = this._state = undefined;
  this._subscribers = [];

  if (noop !== resolver) {
    typeof resolver !== 'function' && needsResolver();
    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
  }
}

Promise.all = all;
Promise.race = race;
Promise.resolve = resolve;
Promise.reject = reject;
Promise._setScheduler = setScheduler;
Promise._setAsap = setAsap;
Promise._asap = asap;

Promise.prototype = {
  constructor: Promise,

  /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
  
    ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
  
    Chaining
    --------
  
    The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
  
    ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
  
    findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
    ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
  
    Assimilation
    ------------
  
    Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
  
    If the assimliated promise rejects, then the downstream promise will also reject.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
  
    Simple Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let result;
  
    try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
  
    Advanced Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let author, books;
  
    try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
  
    function foundBooks(books) {
  
    }
  
    function failure(reason) {
  
    }
  
    findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
  
    @method then
    @param {Function} onFulfilled
    @param {Function} onRejected
    Useful for tooling.
    @return {Promise}
  */
  then: then,

  /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
  
    ```js
    function findAuthor(){
      throw new Error('couldn't find that author');
    }
  
    // synchronous
    try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }
  
    // async with promises
    findAuthor().catch(function(reason){
      // something went wrong
    });
    ```
  
    @method catch
    @param {Function} onRejection
    Useful for tooling.
    @return {Promise}
  */
  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};

function polyfill() {
    var local = undefined;

    if (typeof global !== 'undefined') {
        local = global;
    } else if (typeof self !== 'undefined') {
        local = self;
    } else {
        try {
            local = Function('return this')();
        } catch (e) {
            throw new Error('polyfill failed because global object is unavailable in this environment');
        }
    }

    var P = local.Promise;

    if (P) {
        var promiseToString = null;
        try {
            promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
            // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
            return;
        }
    }

    local.Promise = Promise;
}

// Strange compat..
Promise.polyfill = polyfill;
Promise.Promise = Promise;

return Promise;

})));
//# sourceMappingURL=es6-promise.map
  })();
});

require.register("heir/heir.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "heir");
  (function() {
    /**
 * Heir v3.0.0 - http://git.io/F87mKg
 * Oliver Caldwell - http://oli.me.uk/
 * Unlicense - http://unlicense.org/
 */

(function (name, root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }
    else if (typeof exports === 'object') {
        module.exports = factory();
    }
    else {
        root[name] = factory();
    }
}('heir', this, function () {
    /*global define,module*/
    'use strict';

    var heir = {
        /**
         * Causes your desired class to inherit from a source class. This uses
         * prototypical inheritance so you can override methods without ruining
         * the parent class.
         *
         * This will alter the actual destination class though, it does not
         * create a new class.
         *
         * @param {Function} destination The target class for the inheritance.
         * @param {Function} source Class to inherit from.
         * @param {Boolean} addSuper Should we add the _super property to the prototype? Defaults to true.
         */
        inherit: function inherit(destination, source, addSuper) {
            var proto = destination.prototype = heir.createObject(source.prototype);
            proto.constructor = destination;

            if (addSuper || typeof addSuper === 'undefined') {
                destination._super = source.prototype;
            }
        },

        /**
         * Creates a new object with the source object nestled within its
         * prototype chain.
         *
         * @param {Object} source Method to insert into the new object's prototype.
         * @return {Object} An empty object with the source object in it's prototype chain.
         */
        createObject: Object.create || function createObject(source) {
            var Host = function () {};
            Host.prototype = source;
            return new Host();
        },

        /**
         * Mixes the specified object into your class. This can be used to add
         * certain capabilities and helper methods to a class that is already
         * inheriting from some other class. You can mix in as many object as
         * you want, but only inherit from one.
         *
         * These values are mixed into the actual prototype object of your
         * class, they are not added to the prototype chain like inherit.
         *
         * @param {Function} destination Class to mix the object into.
         * @param {Object} source Object to mix into the class.
         */
        mixin: function mixin(destination, source) {
            return heir.merge(destination.prototype, source);
        },

        /**
         * Merges one object into another, change the object in place.
         *
         * @param {Object} destination The destination for the merge.
         * @param {Object} source The source of the properties to merge.
         */
        merge: function merge(destination, source) {
            var key;

            for (key in source) {
                destination[key] = source[key];
            }
        },

        /**
         * Shortcut for `Object.prototype.hasOwnProperty`.
         *
         * Uses `Object.prototype.hasOwnPropety` rather than
         * `object.hasOwnProperty` as it could be overwritten.
         *
         * @param {Object} object The object to check
         * @param {String} key The key to check for.
         * @return {Boolean} Does object have key as an own propety?
         */
        hasOwn: function hasOwn(object, key) {
            return Object.prototype.hasOwnProperty.call(object, key);
        }
    };

    return heir;
}));
  })();
});

require.register("js-cookie/src/js.cookie.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "js-cookie");
  (function() {
    /*!
 * JavaScript Cookie v2.1.3
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires ? '; expires=' + attributes.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
					attributes.path ? '; path=' + attributes.path : '',
					attributes.domain ? '; domain=' + attributes.domain : '',
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));
  })();
});

require.register("loglevel/lib/loglevel.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "loglevel");
  (function() {
    /*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(definition);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = definition();
    } else {
        root.log = definition();
    }
}(this, function () {
    "use strict";
    var noop = function() {};
    var undefinedType = "undefined";

    function realMethod(methodName) {
        if (typeof console === undefinedType) {
            return false; // We can't build a real method without a console to log to
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // these private functions always need `this` to be set properly

    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    function replaceLoggingMethods(level, loggerName) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, loggerName);
        }
    }

    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      var storageKey = "loglevel";
      if (name) {
        storageKey += ":" + name;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      /*
       *
       * Public API
       *
       */

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Package-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    return defaultLogger;
}));
  })();
});

require.register("object-assign/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "object-assign");
  (function() {
    'use strict';
/* eslint-disable no-unused-vars */
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (e) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};
  })();
});

require.register("swivel/page.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swivel");
  (function() {
    'use strict';

var atoa = require('atoa');
var serialization = require('./serialization');
var emitter = require('contra/emitter');

module.exports = createChannel;

function createChannel () {
  var channel = at(navigator.serviceWorker.controller);
  return channel;

  function at (worker) {
    var internalEmitter = emitter();
    var api = {
      on: selfed('on'),
      once: selfed('once'),
      off: selfed('off'),
      emit: postToWorker,
      at: at
    };
    var postFromWorker = serialization.emission(internalEmitter, { broadcast: false });
    navigator.serviceWorker.addEventListener('message', broadcastHandler);
    return api;

    function selfed (method) {
      return function selfish () {
        internalEmitter[method].apply(null, arguments);
        return api;
      };
    }

    function postToWorker () {
      if (!worker) {
        return Promise.reject(new Error('ServiceWorker not found.'));
      }
      var payload = serialization.parsePayload(atoa(arguments));
      var messageChannel = new MessageChannel();
      messageChannel.port1.addEventListener('message', postFromWorker);
      return worker.postMessage(payload, [messageChannel.port2]);
    }

    function broadcastHandler (e) {
      var data = e.data;
      if (data) {
        if (data.__broadcast) {
          serialization.emission(internalEmitter, {broadcast: true})(e);
        } else {
          serialization.emission(internalEmitter, {broadcast: false})(e);
        }
      }
    }
  }
}
  })();
});

require.register("swivel/serialization.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swivel");
  (function() {
    'use strict';

function serializeError (err) {
  return err ? err.toString() : null;
}

function deserializeError (err) {
  return err ? new Error(err) : null;
}

function parsePayload (payload) {
  var type = payload.shift();
  if (type === 'error') {
    return { error: serializeError(payload[0]), type: type, payload: [] };
  }
  return { error: null, type: type, payload: payload };
}

function emission (emitter, context) {
  return emit;
  function emit (e) {
    var data = e.data;
    if (data.type === 'error') {
      emitter.emit.call(null, 'error', context, deserializeError(data.error));
    } else {
      emitter.emit.apply(null, [data.type, context].concat(data.payload));
    }
  }
}

module.exports = {
  parsePayload: parsePayload,
  emission: emission
};
  })();
});

require.register("swivel/swivel.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swivel");
  (function() {
    'use strict';

var page = require('./page');
var worker = require('./worker');
var api;

if ('serviceWorker' in navigator) {
  api = page();
} else if ('clients' in self) {
  api = worker();
} else {
  api = {
    on: complain,
    once: complain,
    off: complain,
    emit: complain,
    broadcast: complain
  };
}

function complain () {
  throw new Error('Swivel couldn\'t detect ServiceWorker support. Please feature detect before using Swivel in your web pages!');
}

module.exports = api;
  })();
});

require.register("swivel/worker.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "swivel");
  (function() {
    'use strict';

var atoa = require('atoa');
var serialization = require('./serialization');
var emitter = require('contra/emitter');

module.exports = createChannel;

function createChannel () {
  var internalEmitter = emitter();
  var api = {
    on: selfed('on'),
    once: selfed('once'),
    off: selfed('off'),
    broadcast: broadcastToPages,
    emit: replyToClient
  };

  self.addEventListener('message', postFromPage);

  return api;

  function selfed (method) {
    return function selfish () {
      internalEmitter[method].apply(null, arguments);
      return api;
    };
  }

  function postFromPage (e) {
    var context = {
      reply: replyToPage(e)
    };
    serialization.emission(internalEmitter, context)(e);
  }

  function broadcastToPages (type) {
    var payload = atoa(arguments, 1);
    return self.clients.matchAll({includeUncontrolled: true}).then(gotClients);
    function gotClients (clients) {
      return clients.map(emitToClient);
    }
    function emitToClient (client) {
      return client.postMessage({ type: type, payload: payload, __broadcast: true });
    }
  }

  function replyTo (client) {
    var payload = serialization.parsePayload(atoa(arguments, 1));
    return client.postMessage(payload);
  }

  function replyToPage (e) {
    return replyTo.bind(null, e.ports[0]);
  }

  function replyToClient (clientId) {
        var payload = serialization.parsePayload(atoa(arguments, 1));
    return self.clients.matchAll({includeUncontrolled: true}).then(function(clients) {
      var wasClientFound = false;
      clients.forEach(function(client) {
        if (client.id === clientId) {
          wasClientFound = true;
          return client.postMessage(payload);
        }
      });
      if (!wasClientFound) {
        return Promise.reject('Could not find service worker client with ID ' + clientId + ' to reply to.');
      }
    });
  }
}
  })();
});

require.register("ticky/ticky-browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ticky");
  (function() {
    var si = typeof setImmediate === 'function', tick;
if (si) {
  tick = function (fn) { setImmediate(fn); };
} else {
  tick = function (fn) { setTimeout(fn, 0); };
}

module.exports = tick;
  })();
});

require.register("validator/lib/isUUID.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "validator");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isUUID;

var _assertString = require('./util/assertString');

var _assertString2 = _interopRequireDefault(_assertString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var uuid = {
  3: /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
  4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  5: /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
};

function isUUID(str) {
  var version = arguments.length <= 1 || arguments[1] === undefined ? 'all' : arguments[1];

  (0, _assertString2.default)(str);
  var pattern = uuid[version];
  return pattern && pattern.test(str);
}
module.exports = exports['default'];
  })();
});

require.register("validator/lib/util/assertString.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "validator");
  (function() {
    'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = assertString;
function assertString(input) {
  if (typeof input !== 'string') {
    throw new TypeError('This library (validator.js) validates strings only');
  }
}
module.exports = exports['default'];
  })();
});

require.register("wolfy87-eventemitter/EventEmitter.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "wolfy87-eventemitter");
  (function() {
    /*!
 * EventEmitter v5.1.0 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */

;(function (exports) {
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    function EventEmitter() {}

    // Shortcuts to improve speed and size
    var proto = EventEmitter.prototype;
    var originalGlobalValue = exports.EventEmitter;

    /**
     * Finds the index of the listener for the event in its storage array.
     *
     * @param {Function[]} listeners Array of listeners to search through.
     * @param {Function} listener Method to look for.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Alias a method while keeping the context correct, to allow for overwriting of target method.
     *
     * @param {String} name The name of the target method.
     * @return {Function} The aliased method
     * @api private
     */
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    function isValidListener (listener) {
        if (typeof listener === 'function' || listener instanceof RegExp) {
            return true
        } else if (listener && typeof listener === 'object') {
            return isValidListener(listener.listener)
        } else {
            return false
        }
    }

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function addListener(evt, listener) {
        if (!isValidListener(listener)) {
            throw new TypeError('listener must be a function');
        }

        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = alias('addListener');

    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after its first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    /**
     * Alias of addOnceListener.
     */
    proto.once = alias('addOnceListener');

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = alias('removeListener');

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function addListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function removeListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        }
        else if (evt instanceof RegExp) {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        return this;
    };

    /**
     * Alias of removeEvent.
     *
     * Added to mirror the node API.
     */
    proto.removeAllListeners = alias('removeEvent');

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function emitEvent(evt, args) {
        var listenersMap = this.getListenersAsObject(evt);
        var listeners;
        var listener;
        var i;
        var key;
        var response;

        for (key in listenersMap) {
            if (listenersMap.hasOwnProperty(key)) {
                listeners = listenersMap[key].slice(0);

                for (i = 0; i < listeners.length; i++) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = alias('emitEvent');

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    /**
     * Fetches the current value to check against when executing listeners. If
     * the listeners return value matches this one then it should be removed
     * automatically. It will return true by default.
     *
     * @return {*|Boolean} The current value to check for or the default, true.
     * @api private
     */
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        }
        else {
            return true;
        }
    };

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    /**
     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
     *
     * @return {Function} Non conflicting EventEmitter class.
     */
    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return EventEmitter;
        });
    }
    else if (typeof module === 'object' && module.exports){
        module.exports = EventEmitter;
    }
    else {
        exports.EventEmitter = EventEmitter;
    }
}(this || {}));
  })();
});
require.register("build/src/Database.js", function(exports, require, module) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var EventEmitter = require("wolfy87-eventemitter");
var heir = require("heir");
var Event_1 = require("./Event");
var IndexedDb_1 = require("./IndexedDb");
var Environment_1 = require("./Environment");
var AppState_1 = require("./models/AppState");
var Subscription_1 = require("./models/Subscription");
var AppConfig_1 = require("./models/AppConfig");
var ServiceWorkerConfig_1 = require("./models/ServiceWorkerConfig");
var ServiceWorkerState_1 = require("./models/ServiceWorkerState");
var SubscriptionHelper_1 = require("./helpers/SubscriptionHelper");
var Database = (function () {
    function Database() {
    }
    Object.defineProperty(Database, "EVENTS", {
        get: function () {
            return {
                REBUILT: 'dbRebuilt',
                RETRIEVED: 'dbRetrieved',
                SET: 'dbSet',
                REMOVED: 'dbRemoved',
            };
        },
        enumerable: true,
        configurable: true
    });
    Database._getReturnHelper = function (table, key, result) {
        switch (table) {
            case 'Options':
                if (result && key) {
                    return result.value;
                }
                else if (result && !key) {
                    return result;
                }
                else {
                    return null;
                }
                break;
            case 'Ids':
                if (result && key) {
                    return result.id;
                }
                else if (result && !key) {
                    return result;
                }
                else {
                    return null;
                }
                break;
            case 'NotificationOpened':
                if (result && key) {
                    return { data: result.data, timestamp: result.timestamp };
                }
                else if (result && !key) {
                    return result;
                }
                else {
                    return null;
                }
                break;
            default:
                if (result) {
                    return result;
                }
                else {
                    return null;
                }
                break;
        }
    };
    /**
     * Asynchronously retrieves the value of the key at the table (if key is specified), or the entire table (if key is not specified).
     * If on an iFrame or popup environment, retrieves from the correct IndexedDB database using cross-domain messaging.
     * @param table The table to retrieve the value from.
     * @param key The key in the table to retrieve the value of. Leave blank to get the entire table.
     * @returns {Promise} Returns a promise that fulfills when the value(s) are available.
     */
    Database.get = function (table, key) {
        return new Promise(function (resolve) {
            if (!Environment_1.default.isServiceWorker() && SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
                OneSignal.iframePostmam.message(OneSignal.POSTMAM_COMMANDS.REMOTE_DATABASE_GET, [{ table: table, key: key }], function (reply) {
                    var result = reply.data[0];
                    Event_1.default.trigger(Database.EVENTS.RETRIEVED, { table: table, key: key, result: result });
                    resolve(result);
                });
            }
            else {
                return IndexedDb_1.default.get(table, key)
                    .then(function (result) {
                    var cleanResult = Database._getReturnHelper(table, key, result);
                    Event_1.default.trigger(Database.EVENTS.RETRIEVED, { table: table, key: key, result: cleanResult });
                    resolve(cleanResult);
                });
            }
        });
    };
    /**
     * Asynchronously puts the specified value in the specified table.
     * @param table
     * @param keypath
     */
    Database.put = function (table, keypath) {
        return new Promise(function (resolve, reject) {
            if (!Environment_1.default.isServiceWorker() && SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
                OneSignal.iframePostmam.message(OneSignal.POSTMAM_COMMANDS.REMOTE_DATABASE_PUT, [{ table: table, keypath: keypath }], function (reply) {
                    if (reply.data === OneSignal.POSTMAM_COMMANDS.REMOTE_OPERATION_COMPLETE) {
                        Event_1.default.trigger(Database.EVENTS.SET, keypath);
                        resolve();
                    }
                    else {
                        reject("(Database) Attempted remote IndexedDB put(" + table + ", " + keypath + "), but did not get success response.");
                    }
                });
            }
            else {
                return IndexedDb_1.default.put(table, keypath)
                    .then(function () {
                    Event_1.default.trigger(Database.EVENTS.SET, keypath);
                    resolve();
                });
            }
        });
    };
    /**
     * Asynchronously removes the specified key from the table, or if the key is not specified, removes all keys in the table.
     * @returns {Promise} Returns a promise containing a key that is fulfilled when deletion is completed.
     */
    Database.remove = function (table, keypath) {
        return new Promise(function (resolve, reject) {
            if (!Environment_1.default.isServiceWorker() && SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
                OneSignal.iframePostmam.message(OneSignal.POSTMAM_COMMANDS.REMOTE_DATABASE_REMOVE, [{ table: table, keypath: keypath }], function (reply) {
                    if (reply.data === OneSignal.POSTMAM_COMMANDS.REMOTE_OPERATION_COMPLETE) {
                        Event_1.default.trigger(Database.EVENTS.REMOVED, [table, keypath]);
                        resolve();
                    }
                    else {
                        reject("(Database) Attempted remote IndexedDB remove(" + table + ", " + keypath + "), but did not get success response.");
                    }
                });
            }
            else {
                return IndexedDb_1.default.remove(table, keypath)
                    .then(function () {
                    Event_1.default.trigger(Database.EVENTS.REMOVED, [table, keypath]);
                    resolve();
                });
            }
        });
    };
    Database.getAppConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        config = new AppConfig_1.AppConfig();
                        _a = config;
                        return [4 /*yield*/, Database.get('Ids', 'appId')];
                    case 1:
                        _a.appId = _e.sent();
                        _b = config;
                        return [4 /*yield*/, Database.get('Options', 'subdomain')];
                    case 2:
                        _b.subdomain = _e.sent();
                        _c = config;
                        return [4 /*yield*/, Database.get('Options', 'autoRegister')];
                    case 3:
                        _c.autoRegister = _e.sent();
                        _d = config;
                        return [4 /*yield*/, Database.get('Options', 'serviceWorkerConfig')];
                    case 4:
                        _d.serviceWorkerConfig = _e.sent();
                        return [2 /*return*/, config];
                }
            });
        });
    };
    Database.setAppConfig = function (appConfig) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!appConfig.appId)
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, Database.put('Ids', { type: 'appId', id: appConfig.appId })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!appConfig.subdomain)
                            return [3 /*break*/, 4];
                        return [4 /*yield*/, Database.put('Options', { key: 'subdomain', value: appConfig.subdomain })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!appConfig.autoRegister)
                            return [3 /*break*/, 6];
                        return [4 /*yield*/, Database.put('Options', { key: 'autoRegister', value: appConfig.autoRegister })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!appConfig.serviceWorkerConfig)
                            return [3 /*break*/, 8];
                        return [4 /*yield*/, Database.put('Options', { key: 'serviceWorkerConfig', value: appConfig.serviceWorkerConfig })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Database.getAppState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var state, _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        state = new AppState_1.AppState();
                        _a = state;
                        return [4 /*yield*/, Database.get('Options', 'defaultUrl')];
                    case 1:
                        _a.defaultNotificationUrl = _e.sent();
                        _b = state;
                        return [4 /*yield*/, Database.get('Options', 'defaultTitle')];
                    case 2:
                        _b.defaultNotificationTitle = _e.sent();
                        _c = state;
                        return [4 /*yield*/, Database.get('Options', 'isPushEnabled')];
                    case 3:
                        _c.lastKnownPushEnabled = _e.sent();
                        _d = state;
                        return [4 /*yield*/, Database.get('NotificationOpened')];
                    case 4:
                        _d.clickedNotifications = _e.sent();
                        return [2 /*return*/, state];
                }
            });
        });
    };
    Database.setAppState = function (appState) {
        return __awaiter(this, void 0, void 0, function () {
            var clickedNotificationUrls, _i, clickedNotificationUrls_1, url, notificationDetails;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!appState.defaultNotificationUrl)
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, Database.put("Options", { key: "defaultUrl", value: appState.defaultNotificationUrl })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!appState.defaultNotificationTitle)
                            return [3 /*break*/, 4];
                        return [4 /*yield*/, Database.put("Options", { key: "defaultTitle", value: appState.defaultNotificationTitle })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!(appState.lastKnownPushEnabled != null))
                            return [3 /*break*/, 6];
                        return [4 /*yield*/, Database.put('Options', { key: 'isPushEnabled', value: appState.lastKnownPushEnabled })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!appState.clickedNotifications)
                            return [3 /*break*/, 12];
                        clickedNotificationUrls = Object.keys(appState.clickedNotifications);
                        _i = 0, clickedNotificationUrls_1 = clickedNotificationUrls;
                        _a.label = 7;
                    case 7:
                        if (!(_i < clickedNotificationUrls_1.length))
                            return [3 /*break*/, 12];
                        url = clickedNotificationUrls_1[_i];
                        notificationDetails = appState.clickedNotifications[url];
                        if (!notificationDetails)
                            return [3 /*break*/, 9];
                        return [4 /*yield*/, Database.put('NotificationOpened', {
                                url: url,
                                data: notificationDetails.data,
                                timestamp: notificationDetails.timestamp
                            })];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 9:
                        if (!(notificationDetails === null))
                            return [3 /*break*/, 11];
                        // If we get an object like:
                        // { "http://site.com/page": null}
                        // It means we need to remove that entry
                        return [4 /*yield*/, Database.remove('NotificationOpened', url)];
                    case 10:
                        // If we get an object like:
                        // { "http://site.com/page": null}
                        // It means we need to remove that entry
                        _a.sent();
                        _a.label = 11;
                    case 11:
                        _i++;
                        return [3 /*break*/, 7];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    Database.getServiceWorkerConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        config = new ServiceWorkerConfig_1.ServiceWorkerConfig();
                        _a = config;
                        return [4 /*yield*/, Database.get('Options', 'workerScope')];
                    case 1:
                        _a.scope = _e.sent();
                        _b = config;
                        return [4 /*yield*/, Database.get('Options', 'workerName')];
                    case 2:
                        _b.workerName = _e.sent();
                        _c = config;
                        return [4 /*yield*/, Database.get('Options', 'updaterWorkerName')];
                    case 3:
                        _c.updaterWorkerName = _e.sent();
                        _d = config;
                        return [4 /*yield*/, Database.get('Options', 'workerFilePath')];
                    case 4:
                        _d.workerFilePath = _e.sent();
                        return [2 /*return*/, config];
                }
            });
        });
    };
    Database.setServiceWorkerConfig = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!config.scope)
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, Database.put('Options', { key: 'workerScope', value: config.scope })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!config.workerName)
                            return [3 /*break*/, 4];
                        return [4 /*yield*/, Database.put('Options', { key: 'workerName', value: config.workerName })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!config.updaterWorkerName)
                            return [3 /*break*/, 6];
                        return [4 /*yield*/, Database.put('Options', { key: 'updaterWorkerName', value: config.updaterWorkerName })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!config.workerFilePath)
                            return [3 /*break*/, 8];
                        return [4 /*yield*/, Database.put('Options', { key: 'workerFilePath', value: config.workerFilePath })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Database.getServiceWorkerState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var state, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        state = new ServiceWorkerState_1.ServiceWorkerState();
                        _a = state;
                        return [4 /*yield*/, Database.get('Ids', 'WORKER1_ONE_SIGNAL_SW_VERSION')];
                    case 1:
                        _a.workerVersion = _d.sent();
                        _b = state;
                        return [4 /*yield*/, Database.get('Ids', 'WORKER2_ONE_SIGNAL_SW_VERSION')];
                    case 2:
                        _b.updaterWorkerVersion = _d.sent();
                        _c = state;
                        return [4 /*yield*/, Database.get('Ids', 'backupNotification')];
                    case 3:
                        _c.backupNotification = _d.sent();
                        return [2 /*return*/, state];
                }
            });
        });
    };
    Database.setServiceWorkerState = function (state) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!state.workerVersion)
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, Database.put('Ids', { type: 'WORKER1_ONE_SIGNAL_SW_VERSION', id: state.workerVersion })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!state.updaterWorkerVersion)
                            return [3 /*break*/, 4];
                        return [4 /*yield*/, Database.put('Ids', { type: 'WORKER2_ONE_SIGNAL_SW_VERSION', id: state.updaterWorkerVersion })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!state.backupNotification)
                            return [3 /*break*/, 6];
                        return [4 /*yield*/, Database.put('Ids', { type: 'backupNotification', id: state.backupNotification })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Database.getSubscription = function () {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, _a, _b, _c, dbOptedOut, dbNotOptedOut;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        subscription = new Subscription_1.Subscription();
                        _a = subscription;
                        return [4 /*yield*/, Database.get('Ids', 'userId')];
                    case 1:
                        _a.deviceId = _d.sent();
                        _b = subscription;
                        return [4 /*yield*/, Database.get('Options', 'subscriptionEndpoint')];
                    case 2:
                        _b.pushEndpoint = _d.sent();
                        _c = subscription;
                        return [4 /*yield*/, Database.get('Ids', 'registrationId')];
                    case 3:
                        _c.pushToken = _d.sent();
                        return [4 /*yield*/, Database.get('Options', 'optedOut')];
                    case 4:
                        dbOptedOut = _d.sent();
                        return [4 /*yield*/, Database.get('Options', 'subscription')];
                    case 5:
                        dbNotOptedOut = _d.sent();
                        if (dbOptedOut != null) {
                            subscription.optedOut = dbOptedOut;
                        }
                        else {
                            if (dbNotOptedOut == null) {
                                subscription.optedOut = false;
                            }
                            else {
                                subscription.optedOut = !dbNotOptedOut;
                            }
                        }
                        return [2 /*return*/, subscription];
                }
            });
        });
    };
    Database.setSubscription = function (subscription) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!subscription.deviceId)
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, Database.put('Ids', { type: 'userId', id: subscription.deviceId })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!subscription.pushEndpoint)
                            return [3 /*break*/, 4];
                        return [4 /*yield*/, Database.put('Options', { key: 'subscriptionEndpoint', value: subscription.pushEndpoint })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!subscription.pushToken)
                            return [3 /*break*/, 6];
                        return [4 /*yield*/, Database.put('Ids', { type: 'registrationId', id: subscription.pushToken })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!(subscription.optedOut != null))
                            return [3 /*break*/, 8];
                        return [4 /*yield*/, Database.put('Options', { key: 'optedOut', value: subscription.optedOut })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Asynchronously removes the Ids, NotificationOpened, and Options tables from the database and recreates them with blank values.
     * @returns {Promise} Returns a promise that is fulfilled when rebuilding is completed, or rejects with an error.
     */
    Database.rebuild = function () {
        return Promise.all([
            Database.remove('Ids'),
            Database.remove('NotificationOpened'),
            Database.remove('Options'),
        ]);
    };
    Database.printIds = function () {
        return Promise.all([
            Database.get('Ids', 'appId'),
            Database.get('Ids', 'registrationId'),
            Database.get('Ids', 'userId')
        ]).then(function (_a) {
            var appId = _a[0], registrationId = _a[1], userId = _a[2];
            if (console.table) {
                console.table({ 'OneSignal Database IDs': {
                        'App ID': appId,
                        'Registration ID': registrationId,
                        'User ID': userId
                    } });
            }
            else {
                log.info('App ID:', appId);
                log.info('Registration ID:', registrationId);
                log.info('User ID:', userId);
            }
        });
    };
    return Database;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Database;
heir.merge(Database, new EventEmitter());
//# sourceMappingURL=Database.js.map
});

;require.register("build/src/Environment.js", function(exports, require, module) {
"use strict";
var Environment = (function () {
    function Environment() {
    }
    Object.defineProperty(Environment, "SERVICE_WORKER", {
        get: function () {
            return 'ServiceWorker';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Environment, "HOST", {
        get: function () {
            return "host";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Environment, "POPUP", {
        get: function () {
            return "popup";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Environment, "IFRAME", {
        get: function () {
            return "iFrame";
        },
        enumerable: true,
        configurable: true
    });
    Environment.isEs6DebuggingModule = function () {
        return true;
    };
    Environment.getEnv = function () {
        if (typeof window === "undefined") {
            if (typeof WorkerLocation !== "undefined" && location instanceof WorkerLocation)
                return Environment.SERVICE_WORKER;
        }
        else {
            // If the window is the root top-most level
            if (window === window.top) {
                if (location.href.indexOf("initOneSignal") !== -1 ||
                    (location.pathname === '/subscribe' &&
                        location.search === '') &&
                        (location.hostname.endsWith('.onesignal.com') ||
                            (location.hostname.indexOf('.localhost') !== -1 && Environment.isDev())))
                    return Environment.POPUP;
                else
                    return Environment.HOST;
            }
            else if (location.pathname === '/webPushIframe' ||
                location.pathname === '/webPushModal') {
                return Environment.IFRAME;
            }
            else
                return Environment.CUSTOM_SUBDOMAIN;
        }
    };
    Environment.isServiceWorker = function () {
        return Environment.getEnv() === Environment.SERVICE_WORKER;
    };
    /**
     * The main site page.
     */
    Environment.isHost = function () {
        return Environment.getEnv() === Environment.HOST;
    };
    /**
     * The HTTP popup asking users using our subdomain workaround to subscribe,
     */
    Environment.isPopup = function () {
        return Environment.getEnv() === Environment.POPUP;
    };
    Object.defineProperty(Environment, "CUSTOM_SUBDOMAIN", {
        get: function () {
            return "custom_subdomain";
        },
        enumerable: true,
        configurable: true
    });
    /**
     * The HTTPS iFrame we put on HTTP sites to communicate with the service worker and IndexedDB.
     * @returns {boolean}
     */
    Environment.isIframe = function () {
        return Environment.getEnv() === Environment.IFRAME;
    };
    /**
     * True if not in a service worker environment.
     */
    Environment.isBrowser = function () {
        return typeof window !== 'undefined';
    };
    Environment.isStaging = function () {
        return false;
    };
    Environment.isDev = function () {
        return true;
    };
    Environment.version = function () {
        return "120050";
    };
    Environment.isTest = function () {
        return false;
    };
    Environment.isCustomSubdomain = function () {
        return Environment.getEnv() === Environment.CUSTOM_SUBDOMAIN;
    };
    Object.defineProperty(Environment, "TRADITIONAL_CHINESE_LANGUAGE_TAG", {
        get: function () {
            return ['tw', 'hant'];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Environment, "SIMPLIFIED_CHINESE_LANGUAGE_TAG", {
        get: function () {
            return ['cn', 'hans'];
        },
        enumerable: true,
        configurable: true
    });
    /* Specifications: https://tools.ietf.org/html/bcp47 */
    Environment.getLanguage = function (testLanguage) {
        var languageTag = testLanguage || navigator.language;
        if (languageTag) {
            languageTag = languageTag.toLowerCase();
            var languageSubtags = languageTag.split('-');
            if (languageSubtags[0] == 'zh') {
                // The language is zh-?
                // We must categorize the language as either zh-Hans (simplified) or zh-Hant (traditional); OneSignal only supports these two Chinese variants
                for (var _i = 0, _a = Environment.TRADITIONAL_CHINESE_LANGUAGE_TAG; _i < _a.length; _i++) {
                    var traditionalSubtag = _a[_i];
                    if (languageSubtags.indexOf(traditionalSubtag) !== -1) {
                        return 'zh-Hant';
                    }
                }
                for (var _b = 0, _c = Environment.SIMPLIFIED_CHINESE_LANGUAGE_TAG; _b < _c.length; _b++) {
                    var simpleSubtag = _c[_b];
                    if (languageSubtags.indexOf(simpleSubtag) !== -1) {
                        return 'zh-Hans';
                    }
                }
                return 'zh-Hant'; // Return Chinese traditional by default
            }
            else {
                // Return the language subtag (it can be three characters, so truncate it down to 2 just to be sure)
                return languageSubtags[0].substring(0, 2);
            }
        }
        else {
            return 'en';
        }
    };
    Environment.supportsServiceWorkers = function () {
        return 'serviceWorker' in navigator;
    };
    return Environment;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Environment;
//# sourceMappingURL=Environment.js.map
});

;require.register("build/src/Event.js", function(exports, require, module) {
"use strict";
var log = require("loglevel");
var Environment_1 = require("./Environment");
var utils_1 = require("./utils");
var SILENT_EVENTS = [
    'notifyButtonHovering',
    'notifyButtonHover',
    'notifyButtonButtonClick',
    'notifyButtonLauncherClick',
    'animatedElementHiding',
    'aniamtedElementHidden',
    'animatedElementShowing',
    'animatedElementShown',
    'activeAnimatedElementActivating',
    'activeAnimatedElementActive',
    'activeAnimatedElementInactivating',
    'activeAnimatedElementInactive',
    'dbRetrieved',
    'dbSet',
    'testEvent'
];
var RETRIGGER_REMOTE_EVENTS = [
    'onesignal.prompt.custom.clicked',
    'onesignal.prompt.native.permissionchanged',
    'onesignal.subscription.changed',
    'onesignal.internal.subscriptionset',
    'dbRebuilt',
    'initialize',
    'subscriptionSet',
    'sendWelcomeNotification',
    'subscriptionChange',
    'notificationPermissionChange',
    'dbSet',
    'register',
    'notificationDisplay',
    'notificationDismiss',
    'notificationClick',
    'permissionPromptDisplay',
    'testWouldDisplay',
    'testInitOptionDisabled',
    'popupWindowTimeout'
];
var LEGACY_EVENT_MAP = {
    'notificationPermissionChange': 'onesignal.prompt.native.permissionchanged',
    'subscriptionChange': 'onesignal.subscription.changed',
    'customPromptClick': 'onesignal.prompt.custom.clicked',
};
var Event = (function () {
    function Event() {
    }
    /**
     * Triggers the specified event with optional custom data.
     * @param eventName The string event name to be emitted.
     * @param data Any JavaScript variable to be passed with the event.
     * @param remoteTriggerEnv If this method is being called in a different environment (e.g. was triggered in iFrame but now retriggered on main host), this is the string of the original environment for logging purposes.
     */
    Event.trigger = function (eventName, data, remoteTriggerEnv) {
        if (remoteTriggerEnv === void 0) { remoteTriggerEnv = null; }
        if (!utils_1.contains(SILENT_EVENTS, eventName)) {
            var displayData = data;
            if (remoteTriggerEnv) {
                var env = utils_1.capitalize(Environment_1.default.getEnv()) + " \u2B38 " + utils_1.capitalize(remoteTriggerEnv);
            }
            else {
                var env = utils_1.capitalize(Environment_1.default.getEnv());
            }
            if (displayData || displayData === false) {
                log.debug("(" + env + ") \u00BB %c" + eventName + ":", utils_1.getConsoleStyle('event'), displayData);
            }
            else {
                log.debug("(" + env + ") \u00BB %c" + eventName, utils_1.getConsoleStyle('event'));
            }
        }
        // Actually fire the event that can be listened to via OneSignal.on()
        if (Environment_1.default.isBrowser()) {
            if (eventName === OneSignal.EVENTS.SDK_INITIALIZED) {
                if (OneSignal.initialized)
                    return;
                else
                    OneSignal.initialized = true;
            }
            OneSignal.emit(eventName, data);
        }
        if (LEGACY_EVENT_MAP.hasOwnProperty(eventName)) {
            var legacyEventName = LEGACY_EVENT_MAP[eventName];
            Event._triggerLegacy(legacyEventName, data);
        }
        // If this event was triggered in an iFrame or Popup environment, also trigger it on the host page
        if (Environment_1.default.isBrowser() &&
            (Environment_1.default.isPopup() || Environment_1.default.isIframe())) {
            var creator = opener || parent;
            if (!creator) {
                log.error("Could not send event '" + eventName + "' back to host page because no creator (opener or parent) found!");
            }
            else {
                // But only if the event matches certain events
                if (utils_1.contains(RETRIGGER_REMOTE_EVENTS, eventName)) {
                    if (Environment_1.default.isPopup()) {
                        OneSignal.popupPostmam.message(OneSignal.POSTMAM_COMMANDS.REMOTE_RETRIGGER_EVENT, { eventName: eventName, eventData: data });
                    }
                    else {
                        OneSignal.iframePostmam.message(OneSignal.POSTMAM_COMMANDS.REMOTE_RETRIGGER_EVENT, { eventName: eventName, eventData: data });
                    }
                }
            }
        }
    };
    /**
     * Fires the event to be listened to via window.addEventListener().
     * @param eventName The string event name.
     * @param data Any JavaScript variable to be passed with the event.
     * @private
     */
    Event._triggerLegacy = function (eventName, data) {
        var event = new CustomEvent(eventName, {
            bubbles: true, cancelable: true, detail: data
        });
        // Fire the event that listeners can listen to via 'window.addEventListener()'
        window.dispatchEvent(event);
    };
    return Event;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Event;
//# sourceMappingURL=Event.js.map
});

;require.register("build/src/IndexedDb.js", function(exports, require, module) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var log = require("loglevel");
var EventEmitter = require("wolfy87-eventemitter");
var heir = require("heir");
var Event_1 = require("./Event");
var utils_1 = require("./utils");
var Database_1 = require("./Database");
var IndexedDb = (function () {
    function IndexedDb() {
    }
    /**
     * Returns an existing instance or creates a new instances of the database.
     * @returns {Promise} Returns a promise that is fulfilled when the database becomes accessible or rejects when an error occurs.
     */
    IndexedDb.getInstance = function () {
        return new Promise(function (resolve, reject) {
            if (IndexedDb._instance) {
                resolve(IndexedDb._instance);
            }
            else {
                try {
                    var request = indexedDB.open("ONE_SIGNAL_SDK_DB", 1);
                }
                catch (e) {
                }
                request.onsuccess = function (_a) {
                    var target = _a.target;
                    var db = target.result;
                    if (IndexedDb._instance) {
                        db.close();
                        resolve(IndexedDb._instance);
                    }
                    else {
                        IndexedDb._instance = db;
                        resolve(db);
                    }
                };
                request.onerror = function (event) {
                    var error = event.target.error;
                    if (utils_1.contains(error.message, 'The operation failed for reasons unrelated to the database itself and not covered by any other error code')) {
                        log.warn("OneSignal: IndexedDb web storage is not available on this origin since this profile's IndexedDb schema has been upgraded in a newer version of Firefox. See: https://bugzilla.mozilla.org/show_bug.cgi?id=1236557#c6");
                    }
                    else {
                        log.error('OneSignal: Unable to open IndexedDB.', error.name + ': ' + error.message);
                        reject(event);
                    }
                };
                request.onupgradeneeded = function (event) {
                    log.info('OneSignal: IndexedDB is being rebuilt or upgraded.', event);
                    var db = event.target.result;
                    db.createObjectStore("Ids", {
                        keyPath: "type"
                    });
                    db.createObjectStore("NotificationOpened", {
                        keyPath: "url"
                    });
                    db.createObjectStore("Options", {
                        keyPath: "key"
                    });
                    Event_1.default.trigger(Database_1.default.EVENTS.REBUILT, null, null);
                };
                request.onversionchange = function (event) {
                    log.debug('The database is about to be deleted.');
                };
            }
        });
    };
    /**
     * Asynchronously retrieves the value of the key at the table (if key is specified), or the entire table (if key is not specified).
     * @param table The table to retrieve the value from.
     * @param key The key in the table to retrieve the value of. Leave blank to get the entire table.
     * @returns {Promise} Returns a promise that fulfills when the value(s) are available.
     */
    IndexedDb.get = function (table, key) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, IndexedDb.getInstance()];
                    case 1:
                        db = _a.sent();
                        if (key) {
                            // Return a table-key value
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var request = db.transaction(table).objectStore(table).get(key);
                                    request.onsuccess = function () {
                                        resolve(request.result);
                                    };
                                    request.onerror = function () {
                                        reject(request.error);
                                    };
                                })];
                        }
                        else {
                            // Return all values in table
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var jsonResult = {};
                                    var cursor = db.transaction(table).objectStore(table).openCursor();
                                    cursor.onsuccess = function (event) {
                                        var cursorResult = event.target.result;
                                        if (cursorResult) {
                                            var cursorResultKey = cursorResult.key;
                                            jsonResult[cursorResultKey] = cursorResult.value;
                                            cursorResult.continue();
                                        }
                                        else {
                                            resolve(jsonResult);
                                        }
                                    };
                                    cursor.onerror = function (event) {
                                        reject(cursor.error);
                                    };
                                })];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Asynchronously puts the specified value in the specified table.
     * @param table
     * @param key
     */
    IndexedDb.put = function (table, key) {
        return IndexedDb.getInstance().then(function (database) {
            return new Promise(function (resolve, reject) {
                try {
                    var request = database.transaction([table], 'readwrite').objectStore(table).put(key);
                    request.onsuccess = function (event) {
                        resolve(key);
                    };
                    request.onerror = function (e) {
                        log.error('Database PUT Transaction Error:', e);
                        reject(e);
                    };
                }
                catch (e) {
                    log.error('Database PUT Error:', e);
                    reject(e);
                }
            });
        });
    };
    /**
     * Asynchronously removes the specified key from the table, or if the key is not specified, removes all keys in the table.
     * @returns {Promise} Returns a promise containing a key that is fulfilled when deletion is completed.
     */
    IndexedDb.remove = function (table, key) {
        if (key) {
            // Remove a single key from a table
            var method = "delete";
        }
        else {
            // Remove all keys from the table (wipe the table)
            var method = "clear";
        }
        return IndexedDb.getInstance().then(function (database) {
            return new Promise(function (resolve, reject) {
                try {
                    var request = database.transaction([table], 'readwrite').objectStore(table)[method](key);
                    request.onsuccess = function (event) {
                        resolve(key);
                    };
                    request.onerror = function (e) {
                        log.error('Database REMOVE Transaction Error:', e);
                        reject(e);
                    };
                }
                catch (e) {
                    log.error('Database REMOVE Error:', e);
                    reject(e);
                }
            });
        });
    };
    /**
     * Asynchronously removes the Ids, NotificationOpened, and Options tables from the database and recreates them with blank values.
     * @returns {Promise} Returns a promise that is fulfilled when rebuilding is completed, or rejects with an error.
     */
    IndexedDb.rebuild = function () {
        return Promise.all([
            IndexedDb.remove('Ids'),
            IndexedDb.remove('NotificationOpened'),
            IndexedDb.remove('Options'),
        ]);
    };
    return IndexedDb;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IndexedDb;
heir.merge(IndexedDb, new EventEmitter());
//# sourceMappingURL=IndexedDb.js.map
});

;require.register("build/src/LimitStore.js", function(exports, require, module) {
"use strict";
/*
 LimitStore.put('colorado', 'rocky');
 ["rocky"]
 LimitStore.put('colorado', 'mountain');
 ["rocky", "mountain"]
 LimitStore.put('colorado', 'national');
 ["mountain", "national"]
 LimitStore.put('colorado', 'park');
 ["national", "park"]
 */
var LimitStore = (function () {
    function LimitStore() {
    }
    LimitStore.put = function (key, value) {
        if (LimitStore.store[key] === undefined) {
            LimitStore.store[key] = [null, null];
        }
        LimitStore.store[key].push(value);
        if (LimitStore.store[key].length == LimitStore.LIMIT + 1) {
            LimitStore.store[key].shift();
        }
        return LimitStore.store[key];
    };
    LimitStore.get = function (key) {
        if (LimitStore.store[key] === undefined) {
            LimitStore.store[key] = [null, null];
        }
        return LimitStore.store[key];
    };
    LimitStore.getFirst = function (key) {
        return LimitStore.get(key)[0];
    };
    LimitStore.getLast = function (key) {
        return LimitStore.get(key)[1];
    };
    LimitStore.remove = function (key) {
        delete LimitStore.store[key];
    };
    LimitStore.isEmpty = function (key) {
        var values = LimitStore.get(key);
        return values[0] === null && values[1] === null;
    };
    return LimitStore;
}());
LimitStore.store = {};
LimitStore.LIMIT = 2;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LimitStore;
//# sourceMappingURL=LimitStore.js.map
});

;require.register("build/src/OneSignal.js", function(exports, require, module) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var vars_1 = require("./vars");
var Environment_1 = require("./Environment");
var OneSignalApi_1 = require("./OneSignalApi");
var IndexedDb_1 = require("./IndexedDb");
var log = require("loglevel");
var Event_1 = require("./Event");
var Cookie = require("js-cookie");
var Database_1 = require("./Database");
var Browser = require("bowser");
var utils_1 = require("./utils");
var ValidatorUtils_1 = require("./utils/ValidatorUtils");
var objectAssign = require("object-assign");
var EventEmitter = require("wolfy87-eventemitter");
var heir = require("heir");
var swivel = require("swivel");
var EventHelper_1 = require("./helpers/EventHelper");
var MainHelper_1 = require("./helpers/MainHelper");
var Popover_1 = require("./popover/Popover");
var InvalidArgumentError_1 = require("./errors/InvalidArgumentError");
var LimitStore_1 = require("./LimitStore");
var InvalidStateError_1 = require("./errors/InvalidStateError");
var InitHelper_1 = require("./helpers/InitHelper");
var ServiceWorkerHelper_1 = require("./helpers/ServiceWorkerHelper");
var SubscriptionHelper_1 = require("./helpers/SubscriptionHelper");
var HttpHelper_1 = require("./helpers/HttpHelper");
var TestHelper_1 = require("./helpers/TestHelper");
var NotificationPermission_1 = require("./models/NotificationPermission");
var PermissionMessageDismissedError_1 = require("./errors/PermissionMessageDismissedError");
var PushPermissionNotGrantedError_1 = require("./errors/PushPermissionNotGrantedError");
var NotSubscribedError_1 = require("./errors/NotSubscribedError");
var AlreadySubscribedError_1 = require("./errors/AlreadySubscribedError");
var NotSubscribedError_2 = require("./errors/NotSubscribedError");
var PermissionPromptType_1 = require("./models/PermissionPromptType");
var OneSignal = (function () {
    function OneSignal() {
    }
    /**
     * Pass in the full URL of the default page you want to open when a notification is clicked.
     * @PublicApi
     */
    OneSignal.setDefaultNotificationUrl = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var appState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!ValidatorUtils_1.ValidatorUtils.isValidUrl(url, { allowNull: true }))
                            throw new InvalidArgumentError_1.InvalidArgumentError('url', InvalidArgumentError_1.InvalidArgumentReason.Malformed);
                        return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _a.sent();
                        utils_1.logMethodCall('setDefaultNotificationUrl', url);
                        return [4 /*yield*/, Database_1.default.getAppState()];
                    case 2:
                        appState = _a.sent();
                        appState.defaultNotificationUrl = url;
                        return [4 /*yield*/, Database_1.default.setAppState(appState)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets the default title to display on notifications. Will default to the page's document.title if you don't call this.
     * @remarks Either DB value defaultTitle or pageTitle is used when showing a notification title.
     * @PublicApi
     */
    OneSignal.setDefaultTitle = function (title) {
        return __awaiter(this, void 0, void 0, function () {
            var appState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _a.sent();
                        utils_1.logMethodCall('setDefaultTitle', title);
                        return [4 /*yield*/, Database_1.default.getAppState()];
                    case 2:
                        appState = _a.sent();
                        appState.defaultNotificationTitle = title;
                        return [4 /*yield*/, Database_1.default.setAppState(appState)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Hashes the provided email and uploads to OneSignal.
     * @remarks The email is voluntarily provided.
     * @PublicApi
     */
    OneSignal.syncHashedEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var sanitizedEmail, appId, deviceId, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!email)
                            throw new InvalidArgumentError_1.InvalidArgumentError('email', InvalidArgumentError_1.InvalidArgumentReason.Empty);
                        sanitizedEmail = utils_1.prepareEmailForHashing(email);
                        if (!utils_1.isValidEmail(sanitizedEmail))
                            throw new InvalidArgumentError_1.InvalidArgumentError('email', InvalidArgumentError_1.InvalidArgumentReason.Malformed);
                        return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _a.sent();
                        utils_1.logMethodCall('syncHashedEmail', email);
                        return [4 /*yield*/, Database_1.default.getAppConfig()];
                    case 2:
                        appId = (_a.sent()).appId;
                        return [4 /*yield*/, Database_1.default.getSubscription()];
                    case 3:
                        deviceId = (_a.sent()).deviceId;
                        if (!deviceId)
                            throw new NotSubscribedError_1.NotSubscribedError(NotSubscribedError_2.NotSubscribedReason.NoDeviceId);
                        return [4 /*yield*/, OneSignalApi_1.default.updatePlayer(appId, deviceId, {
                                em_m: utils_1.md5(sanitizedEmail),
                                em_s: utils_1.sha1(sanitizedEmail)
                            })];
                    case 4:
                        result = _a.sent();
                        if (result && result.success) {
                            return [2 /*return*/, true];
                        }
                        else {
                            throw result;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns true if the current browser supports web push.
     * @PublicApi
     */
    OneSignal.isPushNotificationsSupported = function () {
        utils_1.logMethodCall('isPushNotificationsSupported');
        return utils_1.isPushNotificationsSupported();
    };
    /**
     * Initializes the SDK, called by the developer.
     * @PublicApi
     */
    OneSignal.init = function (options) {
        utils_1.logMethodCall('init', options);
        ServiceWorkerHelper_1.default.applyServiceWorkerEnvPrefixes();
        if (OneSignal._initCalled) {
            log.error("OneSignal: Please don't call init() more than once. Any extra calls to init() are ignored. The following parameters were not processed: %c" + JSON.stringify(Object.keys(options)), utils_1.getConsoleStyle('code'));
            return 'return';
        }
        OneSignal._initCalled = true;
        OneSignal.config = objectAssign({
            path: '/'
        }, options);
        if (!utils_1.isPushNotificationsSupported()) {
            log.warn('OneSignal: Push notifications are not supported.');
            return;
        }
        if (Browser.safari && !OneSignal.config.safari_web_id) {
            log.warn("OneSignal: Required parameter %csafari_web_id", utils_1.getConsoleStyle('code'), 'was not passed to OneSignal.init(), skipping SDK initialization.');
            return;
        }
        function __init() {
            if (OneSignal.__initAlreadyCalled) {
                // Call from window.addEventListener('DOMContentLoaded', () => {
                // Call from if (document.readyState === 'complete' || document.readyState === 'interactive')
                return;
            }
            else {
                OneSignal.__initAlreadyCalled = true;
            }
            MainHelper_1.default.fixWordpressManifestIfMisplaced();
            if (SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
                if (OneSignal.config.subdomainName) {
                    OneSignal.config.subdomainName = MainHelper_1.default.autoCorrectSubdomain(OneSignal.config.subdomainName);
                }
                else {
                    log.error('OneSignal: Your JavaScript initialization code is missing a required parameter %csubdomainName', utils_1.getConsoleStyle('code'), '. HTTP sites require this parameter to initialize correctly. Please see steps 1.4 and 2 at ' +
                        'https://documentation.onesignal.com/docs/web-push-sdk-setup-http)');
                    return;
                }
                if (Environment_1.default.isDev()) {
                    OneSignal.iframeUrl = vars_1.DEV_FRAME_HOST + "/webPushIframe";
                    OneSignal.popupUrl = vars_1.DEV_FRAME_HOST + "/subscribe";
                }
                else {
                    OneSignal.iframeUrl = "https://" + OneSignal.config.subdomainName + ".onesignal.com/webPushIframe";
                    OneSignal.popupUrl = "https://" + OneSignal.config.subdomainName + ".onesignal.com/subscribe";
                }
            }
            else {
                if (Environment_1.default.isDev()) {
                    OneSignal.modalUrl = vars_1.DEV_FRAME_HOST + "/webPushModal";
                }
                else if (Environment_1.default.isStaging()) {
                    OneSignal.modalUrl = vars_1.STAGING_FRAME_HOST + "/webPushModal";
                }
                else {
                    OneSignal.modalUrl = "https://onesignal.com/webPushModal";
                }
            }
            var subdomainPromise = Promise.resolve();
            if (SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
                subdomainPromise = HttpHelper_1.default.loadSubdomainIFrame()
                    .then(function () { return log.info('Subdomain iFrame loaded'); });
            }
            OneSignal.on(Database_1.default.EVENTS.REBUILT, EventHelper_1.default.onDatabaseRebuilt);
            OneSignal.on(OneSignal.EVENTS.NATIVE_PROMPT_PERMISSIONCHANGED, EventHelper_1.default.onNotificationPermissionChange);
            OneSignal.on(OneSignal.EVENTS.SUBSCRIPTION_CHANGED, EventHelper_1.default._onSubscriptionChanged);
            OneSignal.on(Database_1.default.EVENTS.SET, EventHelper_1.default._onDbValueSet);
            OneSignal.on(OneSignal.EVENTS.SDK_INITIALIZED, InitHelper_1.default.onSdkInitialized);
            subdomainPromise.then(function () {
                window.addEventListener('focus', function (event) {
                    // Checks if permission changed everytime a user focuses on the page, since a user has to click out of and back on the page to check permissions
                    MainHelper_1.default.checkAndTriggerNotificationPermissionChanged();
                });
                // If Safari - add 'fetch' pollyfill if it isn't already added.
                if (Browser.safari && typeof window.fetch == "undefined") {
                    var s = document.createElement('script');
                    s.setAttribute('src', "https://cdnjs.cloudflare.com/ajax/libs/fetch/0.9.0/fetch.js");
                    document.head.appendChild(s);
                }
                if (Environment_1.default.isCustomSubdomain()) {
                    Event_1.default.trigger(OneSignal.EVENTS.SDK_INITIALIZED);
                    return;
                }
                InitHelper_1.default.initSaveState()
                    .then(function () { return InitHelper_1.default.saveInitOptions(); })
                    .then(function () { return InitHelper_1.default.internalInit(); });
            });
        }
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            __init();
        }
        else {
            log.debug('OneSignal: Waiting for DOMContentLoaded or readyStateChange event before continuing' +
                ' initialization...');
            window.addEventListener('DOMContentLoaded', function () {
                __init();
            });
            document.onreadystatechange = function () {
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                    __init();
                }
            };
        }
    };
    /**
     * Shows a sliding modal prompt on the page for users to trigger the HTTP popup window to subscribe.
     * @PublicApi
     */
    OneSignal.showHttpPrompt = function (options) {
        return utils_1.awaitOneSignalInitAndSupported()
            .then(function () {
            /*
             Only show the HTTP popover if:
             - Notifications aren't already enabled
             - The user isn't manually opted out (if the user was manually opted out, we don't want to prompt the user)
             */
            if (OneSignal.__isPopoverShowing) {
                throw new InvalidStateError_1.InvalidStateError(InvalidStateError_1.InvalidStateReason.RedundantPermissionMessage, {
                    permissionPromptType: PermissionPromptType_1.PermissionPromptType.SlidedownPermissionMessage
                });
            }
            return Promise.all([
                OneSignal.getNotificationPermission(),
                OneSignal.isPushNotificationsEnabled(),
                OneSignal.getSubscription(),
                Database_1.default.get('Options', 'popoverDoNotPrompt'),
                OneSignal.httpHelper.isShowingHttpPermissionRequest()
            ])
                .then(function (_a) {
                var permission = _a[0], isEnabled = _a[1], notOptedOut = _a[2], doNotPrompt = _a[3], isShowingHttpPermissionRequest = _a[4];
                if (doNotPrompt === true && (!options || options.force == false)) {
                    throw new PermissionMessageDismissedError_1.default();
                }
                if (permission === NotificationPermission_1.NotificationPermission.Denied) {
                    throw new PushPermissionNotGrantedError_1.default();
                }
                if (isEnabled) {
                    throw new AlreadySubscribedError_1.default();
                }
                if (!notOptedOut) {
                    throw new NotSubscribedError_1.NotSubscribedError(NotSubscribedError_2.NotSubscribedReason.OptedOut);
                }
                if (MainHelper_1.default.isUsingHttpPermissionRequest()) {
                    log.debug('The slidedown permission message cannot be used while the HTTP perm. req. is enabled.');
                    throw new InvalidStateError_1.InvalidStateError(InvalidStateError_1.InvalidStateReason.RedundantPermissionMessage, {
                        permissionPromptType: PermissionPromptType_1.PermissionPromptType.HttpPermissionRequest
                    });
                }
                MainHelper_1.default.markHttpPopoverShown();
                OneSignal.popover = new Popover_1.default(OneSignal.config.promptOptions);
                OneSignal.popover.create();
                log.debug('Showing the HTTP popover.');
                if (OneSignal.notifyButton && OneSignal.notifyButton.launcher.state !== 'hidden') {
                    OneSignal.notifyButton.launcher.waitUntilShown()
                        .then(function () {
                        OneSignal.notifyButton.launcher.hide();
                    });
                }
                OneSignal.once(Popover_1.default.EVENTS.SHOWN, function () {
                    OneSignal.__isPopoverShowing = true;
                });
                OneSignal.once(Popover_1.default.EVENTS.CLOSED, function () {
                    OneSignal.__isPopoverShowing = false;
                    if (OneSignal.notifyButton) {
                        OneSignal.notifyButton.launcher.show();
                    }
                });
                OneSignal.once(Popover_1.default.EVENTS.ALLOW_CLICK, function () {
                    OneSignal.popover.close();
                    OneSignal.registerForPushNotifications({ autoAccept: true });
                });
                OneSignal.once(Popover_1.default.EVENTS.CANCEL_CLICK, function () {
                    log.debug("Setting flag to not show the popover to the user again.");
                    Database_1.default.put('Options', { key: 'popoverDoNotPrompt', value: true });
                });
            });
        });
    };
    /**
     * Prompts the user to subscribe.
     * @PublicApi
     */
    OneSignal.registerForPushNotifications = function (options) {
        if (!utils_1.isPushNotificationsSupported()) {
            log.debug('OneSignal: Push notifications are not supported.');
        }
        // WARNING: Do NOT add callbacks that have to fire to get from here to window.open in _sessionInit.
        //          Otherwise the pop-up to ask for push permission on HTTP connections will be blocked by Chrome.
        function __registerForPushNotifications() {
            if (SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
                HttpHelper_1.default.loadPopup(options);
            }
            else {
                if (!options)
                    options = {};
                options.fromRegisterFor = true;
                InitHelper_1.default.sessionInit(options);
            }
        }
        if (!OneSignal.initialized) {
            OneSignal.once(OneSignal.EVENTS.SDK_INITIALIZED, function () { return __registerForPushNotifications(); });
        }
        else {
            return __registerForPushNotifications();
        }
    };
    /**
     * Prompts the user to subscribe using the remote local notification workaround for HTTP sites.
     * @PublicApi
     */
    OneSignal.showHttpPermissionRequest = function (options) {
        log.debug('Called showHttpPermissionRequest().');
        return utils_1.awaitOneSignalInitAndSupported()
            .then(function () { return new Promise(function (resolve, reject) {
            // Safari's push notifications are one-click Allow and shouldn't support this workaround
            if (Browser.safari) {
                throw new InvalidStateError_1.InvalidStateError(InvalidStateError_1.InvalidStateReason.UnsupportedEnvironment);
            }
            if (OneSignal.__isPopoverShowing) {
                throw new InvalidStateError_1.InvalidStateError(InvalidStateError_1.InvalidStateReason.RedundantPermissionMessage, {
                    permissionPromptType: PermissionPromptType_1.PermissionPromptType.SlidedownPermissionMessage
                });
            }
            if (OneSignal._showingHttpPermissionRequest) {
                throw new InvalidStateError_1.InvalidStateError(InvalidStateError_1.InvalidStateReason.RedundantPermissionMessage, {
                    permissionPromptType: PermissionPromptType_1.PermissionPromptType.HttpPermissionRequest
                });
            }
            if (SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
                OneSignal.iframePostmam.message(OneSignal.POSTMAM_COMMANDS.SHOW_HTTP_PERMISSION_REQUEST, options, function (reply) {
                    var _a = reply.data, status = _a.status, result = _a.result;
                    if (status === 'resolve') {
                        resolve(result);
                    }
                    else {
                        reject(result);
                    }
                });
            }
            else {
                if (!MainHelper_1.default.isUsingHttpPermissionRequest()) {
                    log.debug('Not showing HTTP permission request because its not enabled. Check init option httpPermissionRequest.');
                    Event_1.default.trigger(OneSignal.EVENTS.TEST_INIT_OPTION_DISABLED);
                    return;
                }
                // Default call by our SDK, not forced by user, don't show if the HTTP perm. req. was dismissed by user
                if (MainHelper_1.default.wasHttpsNativePromptDismissed()) {
                    if (options._sdkCall === true) {
                        // TODO: Throw an error; Postmam currently does not serialize errors across cross-domain messaging
                        //       In the future, Postmam should serialize errors so we can throw a PermissionMessageDismissedError
                        log.debug('The HTTP perm. req. permission was dismissed, so we are not showing the request.');
                        return;
                    }
                    else {
                        log.debug('The HTTP perm. req. was previously dismissed, but this call was made explicitly.');
                    }
                }
                log.debug("(" + Environment_1.default.getEnv() + ") Showing HTTP permission request.");
                if (window.Notification.permission === "default") {
                    OneSignal._showingHttpPermissionRequest = true;
                    window.Notification.requestPermission(function (permission) {
                        OneSignal._showingHttpPermissionRequest = false;
                        resolve(permission);
                        log.debug('HTTP Permission Request Result:', permission);
                        if (permission === 'default') {
                            TestHelper_1.default.markHttpsNativePromptDismissed();
                            OneSignal.iframePostmam.message(OneSignal.POSTMAM_COMMANDS.REMOTE_NOTIFICATION_PERMISSION_CHANGED, {
                                permission: permission,
                                forceUpdatePermission: true
                            });
                        }
                    });
                    Event_1.default.trigger(OneSignal.EVENTS.PERMISSION_PROMPT_DISPLAYED);
                }
                else {
                    Event_1.default.trigger(OneSignal.EVENTS.TEST_WOULD_DISPLAY);
                    throw new InvalidStateError_1.InvalidStateError(InvalidStateError_1.InvalidStateReason.PushPermissionAlreadyGranted);
                }
            }
        }); });
    };
    /**
     * Returns a promise that resolves to the browser's current notification permission as 'default', 'granted', or 'denied'.
     * @param callback A callback function that will be called when the browser's current notification permission has been obtained, with one of 'default', 'granted', or 'denied'.
     * @PublicApi
     */
    OneSignal.getNotificationPermission = function (onComplete) {
        return utils_1.awaitOneSignalInitAndSupported()
            .then(function () {
            var safariWebId = null;
            if (OneSignal.config) {
                safariWebId = OneSignal.config.safari_web_id;
            }
            return MainHelper_1.default.getNotificationPermission(safariWebId);
        })
            .then(function (permission) {
            if (onComplete) {
                onComplete(permission);
            }
            return permission;
        });
    };
    /**
     * @PublicApi
     */
    OneSignal.getTags = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var appId, deviceId, tags;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _a.sent();
                        utils_1.logMethodCall('getTags', callback);
                        return [4 /*yield*/, Database_1.default.getAppConfig()];
                    case 2:
                        appId = (_a.sent()).appId;
                        return [4 /*yield*/, Database_1.default.getSubscription()];
                    case 3:
                        deviceId = (_a.sent()).deviceId;
                        if (!deviceId) {
                            // TODO: Throw an error here in future v2; for now it may break existing client implementations.
                            log.info(new NotSubscribedError_1.NotSubscribedError(NotSubscribedError_2.NotSubscribedReason.NoDeviceId));
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, OneSignalApi_1.default.getPlayer(appId, deviceId)];
                    case 4:
                        tags = (_a.sent()).tags;
                        utils_1.executeCallback(callback, tags);
                        return [2 /*return*/, tags];
                }
            });
        });
    };
    /**
     * @PublicApi
     */
    OneSignal.sendTag = function (key, value, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var tag;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tag = {};
                        tag[key] = value;
                        return [4 /*yield*/, OneSignal.sendTags(tag, callback)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @PublicApi
     */
    OneSignal.sendTags = function (tags, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var appId, deviceId, newDeviceId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _a.sent();
                        utils_1.logMethodCall('sendTags', tags, callback);
                        if (!tags || Object.keys(tags).length === 0) {
                            // TODO: Throw an error here in future v2; for now it may break existing client implementations.
                            log.info(new InvalidArgumentError_1.InvalidArgumentError('tags', InvalidArgumentError_1.InvalidArgumentReason.Empty));
                            return [2 /*return*/];
                        }
                        // Our backend considers false as removing a tag, so convert false -> "false" to allow storing as a value
                        Object.keys(tags).forEach(function (key) {
                            if (tags[key] === false)
                                tags[key] = "false";
                        });
                        return [4 /*yield*/, Database_1.default.getAppConfig()];
                    case 2:
                        appId = (_a.sent()).appId;
                        return [4 /*yield*/, Database_1.default.getSubscription()];
                    case 3:
                        deviceId = (_a.sent()).deviceId;
                        if (!!deviceId)
                            return [3 /*break*/, 5];
                        return [4 /*yield*/, utils_1.awaitSdkEvent(OneSignal.EVENTS.REGISTERED)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, Database_1.default.getSubscription()];
                    case 6:
                        newDeviceId = (_a.sent()).deviceId;
                        return [4 /*yield*/, OneSignalApi_1.default.updatePlayer(appId, newDeviceId, {
                                tags: tags
                            })];
                    case 7:
                        _a.sent();
                        utils_1.executeCallback(callback, tags);
                        return [2 /*return*/, tags];
                }
            });
        });
    };
    /**
     * @PublicApi
     */
    OneSignal.deleteTag = function (tag) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, OneSignal.deleteTags([tag])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @PublicApi
     */
    OneSignal.deleteTags = function (tags, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var tagsToSend, _i, tags_1, tag, deletedTags, deletedTagKeys;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _a.sent();
                        utils_1.logMethodCall('deleteTags', tags, callback);
                        if (!ValidatorUtils_1.ValidatorUtils.isValidArray(tags))
                            throw new InvalidArgumentError_1.InvalidArgumentError('tags', InvalidArgumentError_1.InvalidArgumentReason.Malformed);
                        if (tags.length === 0) {
                            // TODO: Throw an error here in future v2; for now it may break existing client implementations.
                            log.info(new InvalidArgumentError_1.InvalidArgumentError('tags', InvalidArgumentError_1.InvalidArgumentReason.Empty));
                        }
                        tagsToSend = {};
                        for (_i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
                            tag = tags_1[_i];
                            tagsToSend[tag] = '';
                        }
                        return [4 /*yield*/, OneSignal.sendTags(tagsToSend)];
                    case 2:
                        deletedTags = _a.sent();
                        deletedTagKeys = Object.keys(deletedTags);
                        utils_1.executeCallback(callback, deletedTagKeys);
                        return [2 /*return*/, deletedTagKeys];
                }
            });
        });
    };
    /**
     * @PublicApi
     */
    OneSignal.addListenerForNotificationOpened = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _a.sent();
                        utils_1.logMethodCall('addListenerForNotificationOpened', callback);
                        OneSignal.once(OneSignal.EVENTS.NOTIFICATION_CLICKED, function (notification) {
                            utils_1.executeCallback(callback, notification);
                        });
                        EventHelper_1.default.fireStoredNotificationClicks(OneSignal.config.pageUrl);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @PublicApi
     * @Deprecated
     */
    OneSignal.getIdsAvailable = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, deviceId, pushToken, bundle;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _b.sent();
                        utils_1.logMethodCall('getIdsAvailable', callback);
                        return [4 /*yield*/, Database_1.default.getSubscription()];
                    case 2:
                        _a = _b.sent(), deviceId = _a.deviceId, pushToken = _a.pushToken;
                        bundle = {
                            userId: deviceId,
                            registrationId: pushToken
                        };
                        utils_1.executeCallback(callback, bundle);
                        return [2 /*return*/, bundle];
                }
            });
        });
    };
    /**
     * Returns a promise that resolves to true if all required conditions for push messaging are met; otherwise resolves to false.
     * @param callback A callback function that will be called when the current subscription status has been obtained.
     * @PublicApi
     */
    OneSignal.isPushNotificationsEnabled = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, deviceId, pushToken, optedOut, notificationPermission, serviceWorkerActive, isPushEnabled;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _b.sent();
                        utils_1.logMethodCall('isPushNotificationsEnabled', callback);
                        return [4 /*yield*/, Database_1.default.getSubscription()];
                    case 2:
                        _a = _b.sent(), deviceId = _a.deviceId, pushToken = _a.pushToken, optedOut = _a.optedOut;
                        return [4 /*yield*/, OneSignal.getNotificationPermission()];
                    case 3:
                        notificationPermission = _b.sent();
                        return [4 /*yield*/, ServiceWorkerHelper_1.default.isServiceWorkerActive()];
                    case 4:
                        serviceWorkerActive = _b.sent();
                        isPushEnabled = false;
                        if (Environment_1.default.supportsServiceWorkers() &&
                            !SubscriptionHelper_1.default.isUsingSubscriptionWorkaround() &&
                            !Environment_1.default.isIframe()) {
                            isPushEnabled = !!(deviceId &&
                                pushToken &&
                                notificationPermission === NotificationPermission_1.NotificationPermission.Granted &&
                                !optedOut &&
                                serviceWorkerActive);
                        }
                        else {
                            isPushEnabled = !!(deviceId &&
                                pushToken &&
                                notificationPermission === NotificationPermission_1.NotificationPermission.Granted &&
                                !optedOut);
                        }
                        utils_1.executeCallback(callback, isPushEnabled);
                        return [2 /*return*/, isPushEnabled];
                }
            });
        });
    };
    /**
     * @PublicApi
     */
    OneSignal.setSubscription = function (newSubscription) {
        return __awaiter(this, void 0, void 0, function () {
            var appConfig, appId, subscription, deviceId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _a.sent();
                        utils_1.logMethodCall('setSubscription', newSubscription);
                        return [4 /*yield*/, Database_1.default.getAppConfig()];
                    case 2:
                        appConfig = _a.sent();
                        appId = appConfig.appId;
                        return [4 /*yield*/, Database_1.default.getSubscription()];
                    case 3:
                        subscription = _a.sent();
                        deviceId = subscription.deviceId;
                        if (!appConfig.appId)
                            throw new InvalidStateError_1.InvalidStateError(InvalidStateError_1.InvalidStateReason.MissingAppId);
                        if (!ValidatorUtils_1.ValidatorUtils.isValidBoolean(newSubscription))
                            throw new InvalidArgumentError_1.InvalidArgumentError('newSubscription', InvalidArgumentError_1.InvalidArgumentReason.Malformed);
                        if (!deviceId) {
                            // TODO: Throw an error here in future v2; for now it may break existing client implementations.
                            log.info(new NotSubscribedError_1.NotSubscribedError(NotSubscribedError_2.NotSubscribedReason.NoDeviceId));
                            return [2 /*return*/];
                        }
                        subscription.optedOut = !newSubscription;
                        return [4 /*yield*/, OneSignalApi_1.default.updatePlayer(appId, deviceId, {
                                notification_types: MainHelper_1.default.getNotificationTypeFromOptIn(newSubscription)
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, Database_1.default.setSubscription(subscription)];
                    case 5:
                        _a.sent();
                        EventHelper_1.default.onInternalSubscriptionSet(subscription.optedOut);
                        EventHelper_1.default.checkAndTriggerSubscriptionChanged();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @PendingPublicApi
     */
    OneSignal.isOptedOut = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var optedOut;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _a.sent();
                        utils_1.logMethodCall('isOptedOut', callback);
                        return [4 /*yield*/, Database_1.default.getSubscription()];
                    case 2:
                        optedOut = (_a.sent()).optedOut;
                        utils_1.executeCallback(callback, optedOut);
                        return [2 /*return*/, optedOut];
                }
            });
        });
    };
    /**
     * Returns a promise that resolves once the manual subscription override has been set.
     * @private
     * @PendingPublicApi
     */
    OneSignal.optOut = function (doOptOut, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _a.sent();
                        utils_1.logMethodCall('optOut', doOptOut, callback);
                        if (!ValidatorUtils_1.ValidatorUtils.isValidBoolean(doOptOut))
                            throw new InvalidArgumentError_1.InvalidArgumentError('doOptOut', InvalidArgumentError_1.InvalidArgumentReason.Malformed);
                        return [4 /*yield*/, OneSignal.setSubscription(!doOptOut)];
                    case 2:
                        _a.sent();
                        utils_1.executeCallback(callback);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns a promise that resolves to the stored OneSignal user ID if one is set; otherwise null.
     * @param callback A function accepting one parameter for the OneSignal user ID.
     * @PublicApi
     */
    OneSignal.getUserId = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, deviceId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _a.sent();
                        utils_1.logMethodCall('getUserId', callback);
                        return [4 /*yield*/, Database_1.default.getSubscription()];
                    case 2:
                        subscription = _a.sent();
                        deviceId = subscription.deviceId;
                        utils_1.executeCallback(callback, deviceId);
                        return [2 /*return*/, deviceId];
                }
            });
        });
    };
    /**
     * Returns a promise that resolves to the stored push token if one is set; otherwise null.
     * @PublicApi
     */
    OneSignal.getRegistrationId = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, pushToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _a.sent();
                        utils_1.logMethodCall('getRegistrationId', callback);
                        return [4 /*yield*/, Database_1.default.getSubscription()];
                    case 2:
                        subscription = _a.sent();
                        pushToken = subscription.pushToken;
                        utils_1.executeCallback(callback, pushToken);
                        return [2 /*return*/, pushToken];
                }
            });
        });
    };
    /**
     * Returns a promise that resolves to false if setSubscription(false) is "in effect". Otherwise returns true.
     * This means a return value of true does not mean the user is subscribed, only that the user did not call
     * setSubcription(false).
     * @private
     * @PublicApi (given to customers)
     */
    OneSignal.getSubscription = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, subscriptionStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _a.sent();
                        utils_1.logMethodCall('getSubscription', callback);
                        return [4 /*yield*/, Database_1.default.getSubscription()];
                    case 2:
                        subscription = _a.sent();
                        subscriptionStatus = !subscription.optedOut;
                        utils_1.executeCallback(callback, subscriptionStatus);
                        return [2 /*return*/, subscriptionStatus];
                }
            });
        });
    };
    /**
     * @PublicApi
     */
    OneSignal.sendSelfNotification = function (title, message, url, icon, data, buttons) {
        if (title === void 0) { title = 'OneSignal Test Message'; }
        if (message === void 0) { message = 'This is an example notification.'; }
        if (url === void 0) { url = new URL(location.href).origin + '?_osp=do_not_open'; }
        return __awaiter(this, void 0, void 0, function () {
            var appConfig, subscription;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.awaitOneSignalInitAndSupported()];
                    case 1:
                        _a.sent();
                        utils_1.logMethodCall('sendSelfNotification', title, message, url, icon, data, buttons);
                        return [4 /*yield*/, Database_1.default.getAppConfig()];
                    case 2:
                        appConfig = _a.sent();
                        return [4 /*yield*/, Database_1.default.getSubscription()];
                    case 3:
                        subscription = _a.sent();
                        if (!appConfig.appId)
                            throw new InvalidStateError_1.InvalidStateError(InvalidStateError_1.InvalidStateReason.MissingAppId);
                        if (!subscription.deviceId)
                            throw new NotSubscribedError_1.NotSubscribedError(NotSubscribedError_2.NotSubscribedReason.NoDeviceId);
                        if (!ValidatorUtils_1.ValidatorUtils.isValidUrl(url))
                            throw new InvalidArgumentError_1.InvalidArgumentError('url', InvalidArgumentError_1.InvalidArgumentReason.Malformed);
                        if (!ValidatorUtils_1.ValidatorUtils.isValidUrl(icon, { allowEmpty: true, requireHttps: true }))
                            throw new InvalidArgumentError_1.InvalidArgumentError('icon', InvalidArgumentError_1.InvalidArgumentReason.Malformed);
                        return [4 /*yield*/, OneSignalApi_1.default.sendNotification(appConfig.appId, [subscription.deviceId], { 'en': title }, { 'en': message }, url, icon, data, buttons)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Used to load OneSignal asynchronously from a webpage.
     * @InternalApi
     */
    OneSignal.push = function (item) {
        if (typeof (item) == "function")
            item();
        else {
            var functionName = item.shift();
            OneSignal[functionName].apply(null, item);
        }
    };
    /** To appease TypeScript, EventEmitter later overrides this */
    OneSignal.on = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    };
    OneSignal.off = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    };
    OneSignal.once = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    };
    return OneSignal;
}());
OneSignal.VERSION = Environment_1.default.version();
OneSignal._VERSION = Environment_1.default.version();
OneSignal._API_URL = vars_1.API_URL;
OneSignal._notificationOpenedCallbacks = [];
OneSignal._idsAvailable_callback = [];
OneSignal._defaultLaunchURL = null;
OneSignal.config = null;
OneSignal._thisIsThePopup = false;
OneSignal.__isPopoverShowing = false;
OneSignal._sessionInitAlreadyRunning = false;
OneSignal._isNotificationEnabledCallback = [];
OneSignal._subscriptionSet = true;
OneSignal.iframeUrl = null;
OneSignal.popupUrl = null;
OneSignal.modalUrl = null;
OneSignal._sessionIframeAdded = false;
OneSignal._windowWidth = 650;
OneSignal._windowHeight = 568;
OneSignal._isNewVisitor = false;
OneSignal._channel = null;
OneSignal.cookie = Cookie;
OneSignal.initialized = false;
OneSignal.notifyButton = null;
OneSignal.store = LimitStore_1.default;
OneSignal.environment = Environment_1.default;
OneSignal.database = Database_1.default;
OneSignal.event = Event_1.default;
OneSignal.browser = Browser;
OneSignal.popover = null;
OneSignal.log = log;
OneSignal.swivel = swivel;
OneSignal.api = OneSignalApi_1.default;
OneSignal.indexedDb = IndexedDb_1.default;
OneSignal.iframePostmam = null;
OneSignal.popupPostmam = null;
OneSignal.mainHelper = MainHelper_1.default;
OneSignal.subscriptionHelper = SubscriptionHelper_1.default;
OneSignal.workerHelper = ServiceWorkerHelper_1.default;
OneSignal.httpHelper = HttpHelper_1.default;
OneSignal.eventHelper = EventHelper_1.default;
OneSignal.testHelper = TestHelper_1.default;
OneSignal.objectAssign = objectAssign;
/**
 * The additional path to the worker file.
 *
 * Usually just the filename (in case the file is named differently), but also supports cases where the folder
 * is different.
 *
 * However, the init options 'path' should be used to specify the folder path instead since service workers will not
 * auto-update correctly on HTTPS site load if the config init options 'path' is not set.
 */
OneSignal.SERVICE_WORKER_UPDATER_PATH = 'OneSignalSDKUpdaterWorker.js';
OneSignal.SERVICE_WORKER_PATH = 'OneSignalSDKWorker.js';
/**
 * By default, the service worker is expected to be accessible at the root scope. If the service worker is only
 * available with in a sub-directory, SERVICE_WORKER_PARAM must be changed to the sub-directory (with a trailing
 * slash). This would allow pages to function correctly as not to block the service worker ready call, which would
 * hang indefinitely if we requested root scope registration but the service was only available in a child scope.
 */
OneSignal.SERVICE_WORKER_PARAM = { scope: '/' };
OneSignal._LOGGING = false;
OneSignal.LOGGING = false;
OneSignal._usingNativePermissionHook = false;
OneSignal._initCalled = false;
OneSignal.__initAlreadyCalled = false;
OneSignal.closeNotifications = ServiceWorkerHelper_1.default.closeNotifications;
OneSignal.isServiceWorkerActive = ServiceWorkerHelper_1.default.isServiceWorkerActive;
OneSignal._showingHttpPermissionRequest = false;
OneSignal.checkAndWipeUserSubscription = SubscriptionHelper_1.default.checkAndWipeUserSubscription;
/**
 * Used by Rails-side HTTP popup. Must keep the same name.
 * @InternalApi
 */
OneSignal._initHttp = HttpHelper_1.default.initHttp;
/**
 * Used by Rails-side HTTP popup. Must keep the same name.
 * @InternalApi
 */
OneSignal._initPopup = HttpHelper_1.default.initPopup;
OneSignal.POSTMAM_COMMANDS = {
    CONNECTED: 'connect',
    REMOTE_NOTIFICATION_PERMISSION: 'postmam.remoteNotificationPermission',
    REMOTE_DATABASE_GET: 'postmam.remoteDatabaseGet',
    REMOTE_DATABASE_PUT: 'postmam.remoteDatabasePut',
    REMOTE_DATABASE_REMOVE: 'postmam.remoteDatabaseRemove',
    REMOTE_OPERATION_COMPLETE: 'postman.operationComplete',
    REMOTE_RETRIGGER_EVENT: 'postmam.remoteRetriggerEvent',
    MODAL_LOADED: 'postmam.modalPrompt.loaded',
    MODAL_PROMPT_ACCEPTED: 'postmam.modalPrompt.accepted',
    MODAL_PROMPT_REJECTED: 'postmam.modalPrompt.canceled',
    POPUP_LOADED: 'postmam.popup.loaded',
    POPUP_ACCEPTED: 'postmam.popup.accepted',
    POPUP_REJECTED: 'postmam.popup.canceled',
    POPUP_CLOSING: 'postman.popup.closing',
    REMOTE_NOTIFICATION_PERMISSION_CHANGED: 'postmam.remoteNotificationPermissionChanged',
    IFRAME_POPUP_INITIALIZE: 'postmam.iframePopupInitialize',
    UNSUBSCRIBE_FROM_PUSH: 'postmam.unsubscribeFromPush',
    BEGIN_BROWSING_SESSION: 'postmam.beginBrowsingSession',
    REQUEST_HOST_URL: 'postmam.requestHostUrl',
    SHOW_HTTP_PERMISSION_REQUEST: 'postmam.showHttpPermissionRequest',
    IS_SHOWING_HTTP_PERMISSION_REQUEST: 'postmam.isShowingHttpPermissionRequest',
    WINDOW_TIMEOUT: 'postmam.windowTimeout',
    FINISH_REMOTE_REGISTRATION: 'postmam.finishRemoteRegistration',
    FINISH_REMOTE_REGISTRATION_IN_PROGRESS: 'postmam.finishRemoteRegistrationInProgress',
    POPUP_BEGIN_MESSAGEPORT_COMMS: 'postmam.beginMessagePortComms'
};
OneSignal.EVENTS = {
    /**
     * Occurs when the user clicks the "Continue" or "No Thanks" button on the HTTP popup or HTTPS modal prompt.
     * For HTTP sites (and HTTPS sites using the modal prompt), this event is fired before the native permission
     * prompt is shown. This event is mostly used for HTTP sites.
     */
    CUSTOM_PROMPT_CLICKED: 'customPromptClick',
    /**
     * Occurs when the user clicks "Allow" or "Block" on the native permission prompt on Chrome, Firefox, or Safari.
     * This event is used for both HTTP and HTTPS sites and occurs after the user actually grants notification
     * permissions for the site. Occurs before the user is actually subscribed to push notifications.
     */
    NATIVE_PROMPT_PERMISSIONCHANGED: 'notificationPermissionChange',
    /**
     * Occurs after the user is officially subscribed to push notifications. The service worker is fully registered
     * and activated and the user is eligible to receive push notifications at any point after this.
     */
    SUBSCRIPTION_CHANGED: 'subscriptionChange',
    /**
     * Occurs after a POST call to OneSignal's server to send the welcome notification has completed. The actual
     * notification arrives shortly after.
     */
    WELCOME_NOTIFICATION_SENT: 'sendWelcomeNotification',
    /**
     * Occurs when a notification is displayed.
     */
    NOTIFICATION_DISPLAYED: 'notificationDisplay',
    /**
     * Occurs when a notification is dismissed by the user either clicking 'X' or clearing all notifications
     * (available in Android). This event is NOT called if the user clicks the notification's body or any of the
     * action buttons.
     */
    NOTIFICATION_DISMISSED: 'notificationDismiss',
    /**
     * New event replacing legacy addNotificationOpenedHandler(). Used when the notification was clicked.
     */
    NOTIFICATION_CLICKED: 'notificationClick',
    /**
     * Occurs after the document ready event fires and, for HTTP sites, the iFrame to subdomain.onesignal.com has
     * loaded.
     * Before this event, IndexedDB access is not possible for HTTP sites.
     */
    SDK_INITIALIZED: 'initialize',
    /**
     * Occurs after the user subscribes to push notifications and a new user entry is created on OneSignal's server,
     * and also occurs when the user begins a new site session and the last_session and last_active is updated on
     * OneSignal's server.
     */
    REGISTERED: 'register',
    /**
     * Occurs as the HTTP popup is closing.
     */
    POPUP_CLOSING: 'popupClose',
    /**
     * Occurs when the native permission prompt is displayed.
     */
    PERMISSION_PROMPT_DISPLAYED: 'permissionPromptDisplay',
    /**
     * For internal testing only. Used for all sorts of things.
     */
    TEST_INIT_OPTION_DISABLED: 'testInitOptionDisabled',
    TEST_WOULD_DISPLAY: 'testWouldDisplay',
    POPUP_WINDOW_TIMEOUT: 'popupWindowTimeout',
};
OneSignal.NOTIFICATION_TYPES = {
    SUBSCRIBED: 1,
    UNSUBSCRIBED: -2
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OneSignal;
Object.defineProperty(OneSignal, 'LOGGING', {
    get: function () {
        return OneSignal._LOGGING;
    },
    set: function (logLevel) {
        if (logLevel) {
            log.setDefaultLevel(log.levels.TRACE);
            OneSignal._LOGGING = true;
        }
        else {
            log.setDefaultLevel(log.levels.WARN);
            OneSignal._LOGGING = false;
        }
    },
    enumerable: true,
    configurable: true
});
heir.merge(OneSignal, new EventEmitter());
if (OneSignal.LOGGING)
    log.setDefaultLevel(log.levels.TRACE);
else
    log.setDefaultLevel(log.levels.WARN);
log.info("%cOneSignal Web SDK loaded (version " + OneSignal._VERSION + ", " + Environment_1.default.getEnv() + " environment).", utils_1.getConsoleStyle('bold'));
if (Environment_1.default.isEs6DebuggingModule()) {
    log.warn('OneSignal: This is a specially built version of the web SDK for debugging ES6 async/await.');
}
log.debug("Current Page URL: " + location.href);
log.debug("Browser Environment: " + Browser.name + " " + Browser.version);
module.exports = OneSignal;
//# sourceMappingURL=OneSignal.js.map
});

;require.register("build/src/OneSignalApi.js", function(exports, require, module) {
"use strict";
var vars_1 = require("./vars");
var log = require("loglevel");
var utils_1 = require("./utils");
var objectAssign = require("object-assign");
var Environment_1 = require("./Environment");
var OneSignalApi = (function () {
    function OneSignalApi() {
    }
    OneSignalApi.get = function (action, data, headers) {
        return OneSignalApi.call('GET', action, data, headers);
    };
    OneSignalApi.post = function (action, data, headers) {
        return OneSignalApi.call('POST', action, data, headers);
    };
    OneSignalApi.put = function (action, data, headers) {
        return OneSignalApi.call('PUT', action, data, headers);
    };
    OneSignalApi.delete = function (action, data, headers) {
        return OneSignalApi.call('DELETE', action, data, headers);
    };
    OneSignalApi.call = function (method, action, data, headers) {
        var callHeaders = new Headers();
        callHeaders.append('SDK-Version', "onesignal/web/" + Environment_1.default.version());
        callHeaders.append('Content-Type', 'application/json;charset=UTF-8');
        if (headers) {
            for (var _i = 0, _a = Object.keys(headers); _i < _a.length; _i++) {
                var key = _a[_i];
                callHeaders.append(key, headers[key]);
            }
        }
        var contents = {
            method: method || 'NO_METHOD_SPECIFIED',
            headers: callHeaders,
            cache: 'no-cache'
        };
        if (data)
            contents.body = JSON.stringify(data);
        var status;
        return fetch(vars_1.API_URL + action, contents)
            .then(function (response) {
            status = response.status;
            return response.json();
        })
            .then(function (json) {
            if (status >= 200 && status < 300)
                return json;
            else {
                var error = OneSignalApi.identifyError(json);
                if (error === 'no-user-id-error') {
                }
                else {
                    return Promise.reject(json);
                }
            }
        });
    };
    OneSignalApi.identifyError = function (error) {
        if (!error || !error.errors) {
            return 'no-error';
        }
        var errors = error.errors;
        if (utils_1.contains(errors, 'No user with this id found') ||
            utils_1.contains(errors, 'Could not find app_id for given player id.')) {
            return 'no-user-id-error';
        }
        return 'unknown-error';
    };
    /**
     * Given a GCM or Firefox subscription endpoint or Safari device token, returns the user ID from OneSignal's server.
     * Used if the user clears his or her IndexedDB database and we need the user ID again.
     */
    OneSignalApi.getUserIdFromSubscriptionIdentifier = function (appId, deviceType, identifier) {
        // Calling POST /players with an existing identifier returns us that player ID
        return OneSignalApi.post('players', {
            app_id: appId,
            device_type: deviceType,
            identifier: identifier
        }).then(function (response) {
            if (response && response.id) {
                return response.id;
            }
            else {
                return null;
            }
        }).catch(function (e) {
            log.debug('Error getting user ID from subscription identifier:', e);
            return null;
        });
    };
    OneSignalApi.getPlayer = function (appId, playerId) {
        return OneSignalApi.get("players/" + playerId + "?app_id=" + appId);
    };
    OneSignalApi.updatePlayer = function (appId, playerId, options) {
        return OneSignalApi.put("players/" + playerId, objectAssign({ app_id: appId }, options));
    };
    OneSignalApi.sendNotification = function (appId, playerIds, titles, contents, url, icon, data, buttons) {
        var params = {
            app_id: appId,
            contents: contents,
            include_player_ids: playerIds,
            isAnyWeb: true,
            data: data,
            web_buttons: buttons
        };
        if (titles) {
            params.headings = titles;
        }
        if (url) {
            params.url = url;
        }
        if (icon) {
            params.chrome_web_icon = icon;
            params.firefox_icon = icon;
        }
        utils_1.trimUndefined(params);
        return OneSignalApi.post('notifications', params);
    };
    return OneSignalApi;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OneSignalApi;
//# sourceMappingURL=OneSignalApi.js.map
});

;require.register("build/src/Postmam.js", function(exports, require, module) {
"use strict";
var utils_1 = require("./utils");
var EventEmitter = require("wolfy87-eventemitter");
var heir = require("heir");
var Environment_1 = require("./Environment");
var vars_1 = require("./vars");
var objectAssign = require("object-assign");
var log = require("loglevel");
/**
 * Establishes a cross-domain MessageChannel between the current browsing context (this page) and another (an iFrame, popup, or parent page).
 */
var Postmam = (function () {
    /**
     * Initializes Postmam with settings but does not establish a channel or set up any message listeners.
     * @param windowReference The window to postMessage() the initial MessageChannel port to.
     * @param sendToOrigin The origin that will receive the initial postMessage with the transferred message channel port object.
     * @param receiveFromOrigin The origin to allow incoming messages from. If messages do not come from this origin they will be discarded. Only affects the initial handshake.
     * @remarks The initiating (client) page must call this after the page has been loaded so that the other page has a chance to receive the initial handshake message. The receiving (server) page must set up a message listener to catch the initial handshake message.
     */
    function Postmam(windowReference, sendToOrigin, receiveFromOrigin) {
        this.windowReference = windowReference;
        this.sendToOrigin = sendToOrigin;
        this.receiveFromOrigin = receiveFromOrigin;
        if (!window || !window.postMessage) {
            throw new Error('Must pass in a valid window reference supporting postMessage():' + windowReference);
        }
        if (!sendToOrigin || !receiveFromOrigin) {
            throw new Error('Invalid origin. Must be set.');
        }
        heir.merge(this, new EventEmitter());
        this.channel = new MessageChannel();
        this.messagePort = null;
        this.isListening = false;
        this.isConnected = false;
        this.replies = {};
    }
    Object.defineProperty(Postmam, "HANDSHAKE_MESSAGE", {
        get: function () {
            return "onesignal.postmam.handshake";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Postmam, "CONNECTED_MESSAGE", {
        get: function () {
            return "onesignal.postmam.connected";
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Opens a message event listener to listen for a Postmam handshake from another browsing context. This listener is closed as soon as the connection is established.
     */
    Postmam.prototype.listen = function () {
        log.trace('(Postmam) Called listen().');
        if (this.isListening) {
            log.debug('(Postmam) Already listening for Postmam connections.');
            return;
        }
        if (!Environment_1.default.isBrowser()) {
            return;
        }
        this.isListening = true;
        log.debug('(Postmam) Listening for Postmam connections.', this);
        // One of the messages will contain our MessageChannel port
        window.addEventListener('message', this.onWindowMessagePostmanConnectReceived.bind(this));
    };
    Postmam.prototype.startPostMessageReceive = function () {
        window.addEventListener('message', this.onWindowPostMessageReceived.bind(this));
    };
    Postmam.prototype.stopPostMessageReceive = function () {
        window.removeEventListener('message', this.onWindowPostMessageReceived);
    };
    Postmam.prototype.destroy = function () {
        this.stopPostMessageReceive();
        this.removeEvent();
    };
    Postmam.prototype.onWindowPostMessageReceived = function (e) {
        // Discard messages from unexpected origins; messages come frequently from other origins
        if (!this.isSafeOrigin(e.origin)) {
            // log.debug(`(Postmam) Discarding message because ${e.origin} is not an allowed origin:`, e.data)
            return;
        }
        //log.debug(`(Postmam) (onWindowPostMessageReceived) (${Environment.getEnv()}):`, e);
        var _a = e.data, messageId = _a.id, messageCommand = _a.command, messageData = _a.data, messageSource = _a.source;
        if (messageCommand === Postmam.CONNECTED_MESSAGE) {
            this.emit('connect');
            this.isConnected = true;
            return;
        }
        var messageBundle = {
            id: messageId,
            command: messageCommand,
            data: messageData,
            source: messageSource
        };
        var messageBundleWithReply = objectAssign({
            reply: this.reply.bind(this, messageBundle)
        }, messageBundle);
        if (this.replies.hasOwnProperty(messageId)) {
            log.info('(Postmam) This message is a reply.');
            var replyFn = this.replies[messageId].bind(window);
            var replyFnReturnValue = replyFn(messageBundleWithReply);
            if (replyFnReturnValue === false) {
                delete this.replies[messageId];
            }
        }
        else {
            this.emit(messageCommand, messageBundleWithReply);
        }
    };
    Postmam.prototype.onWindowMessagePostmanConnectReceived = function (e) {
        log.trace("(Postmam) (" + Environment_1.default.getEnv() + ") Window postmessage for Postman connect received:", e);
        // Discard messages from unexpected origins; messages come frequently from other origins
        if (!this.isSafeOrigin(e.origin)) {
            // log.debug(`(Postmam) Discarding message because ${e.origin} is not an allowed origin:`, e.data)
            return;
        }
        var handshake = e.data.handshake;
        if (handshake !== Postmam.HANDSHAKE_MESSAGE) {
            log.info('(Postmam) Got a postmam message, but not our expected handshake:', e.data);
            // This was not our expected handshake message
            return;
        }
        else {
            log.info('(Postmam) Got our expected Postmam handshake message (and connecting...):', e.data);
            // This was our expected handshake message
            // Remove our message handler so we don't get spammed with cross-domain messages
            window.removeEventListener('message', this.onWindowMessagePostmanConnectReceived);
            // Get the message port
            this.messagePort = e.ports[0];
            this.messagePort.addEventListener('message', this.onMessageReceived.bind(this), false);
            log.info('(Postmam) Removed previous message event listener for handshakes, replaced with main message listener.');
            this.messagePort.start();
            this.isConnected = true;
            log.info("(Postmam) (" + Environment_1.default.getEnv() + ") Connected.");
            this.message(Postmam.CONNECTED_MESSAGE);
            this.emit('connect');
        }
    };
    /**
     * Establishes a message channel with a listening Postmam on another browsing context.
     * @remarks Only call this if listen() is called on another page.
     */
    Postmam.prototype.connect = function () {
        log.info("(Postmam) (" + Environment_1.default.getEnv() + ") Establishing a connection to " + this.sendToOrigin + ".");
        this.messagePort = this.channel.port1;
        this.messagePort.addEventListener('message', this.onMessageReceived.bind(this), false);
        this.messagePort.start();
        this.windowReference.postMessage({
            handshake: Postmam.HANDSHAKE_MESSAGE
        }, this.sendToOrigin, [this.channel.port2]);
    };
    Postmam.prototype.onMessageReceived = function (e) {
        //log.debug(`(Postmam) (${Environment.getEnv()}):`, e.data);
        if (!e.data) {
            log.debug("(" + Environment_1.default.getEnv() + ") Received an empty Postmam message:", e);
            return;
        }
        var _a = e.data, messageId = _a.id, messageCommand = _a.command, messageData = _a.data, messageSource = _a.source;
        if (messageCommand === Postmam.CONNECTED_MESSAGE) {
            this.emit('connect');
            this.isConnected = true;
            return;
        }
        var messageBundle = {
            id: messageId,
            command: messageCommand,
            data: messageData,
            source: messageSource
        };
        var messageBundleWithReply = objectAssign({
            reply: this.reply.bind(this, messageBundle)
        }, messageBundle);
        if (this.replies.hasOwnProperty(messageId)) {
            var replyFn = this.replies[messageId].bind(window);
            var replyFnReturnValue = replyFn(messageBundleWithReply);
            if (replyFnReturnValue === false) {
                delete this.replies[messageId];
            }
        }
        else {
            this.emit(messageCommand, messageBundleWithReply);
        }
    };
    Postmam.prototype.reply = function (originalMessageBundle, data, onReply) {
        var messageBundle = {
            id: originalMessageBundle.id,
            command: originalMessageBundle.command,
            data: data,
            source: Environment_1.default.getEnv(),
            isReply: true
        };
        if (typeof onReply === 'function') {
            this.replies[messageBundle.id] = onReply;
        }
        this.messagePort.postMessage(messageBundle);
    };
    /**
     * Sends via window.postMessage.
     */
    Postmam.prototype.postMessage = function (command, data, onReply) {
        if (!command || command == '') {
            throw new Error("(Postmam) Postmam command must not be empty.");
        }
        if (typeof data === 'function') {
            log.debug('You passed a function to data, did you mean to pass null?');
            return;
        }
        var messageBundle = {
            id: utils_1.guid(),
            command: command,
            data: data,
            source: Environment_1.default.getEnv()
        };
        if (typeof onReply === 'function') {
            this.replies[messageBundle.id] = onReply;
        }
        this.windowReference.postMessage(messageBundle, '*');
    };
    /**
     * Sends via MessageChannel.port.postMessage
     */
    Postmam.prototype.message = function (command, data, onReply) {
        if (!command || command == '') {
            throw new Error("(Postmam) Postmam command must not be empty.");
        }
        if (typeof data === 'function') {
            log.debug('You passed a function to data, did you mean to pass null?');
            return;
        }
        var messageBundle = {
            id: utils_1.guid(),
            command: command,
            data: data,
            source: Environment_1.default.getEnv()
        };
        if (typeof onReply === 'function') {
            this.replies[messageBundle.id] = onReply;
        }
        this.messagePort.postMessage(messageBundle);
    };
    /**
     * If the provided Site URL on the dashboard, which restricts the post message origin, uses the https:// protocol
     * Then relax the postMessage restriction to also allow the http:// protocol for the same domain.
     */
    Postmam.prototype.generateSafeOrigins = function (origin) {
        var otherAllowedOrigins = [origin];
        try {
            var url = new URL(origin);
            var host = url.host.replace('www.', '');
            if (url.protocol === 'https:') {
                otherAllowedOrigins.push("https://" + host);
                otherAllowedOrigins.push("https://www." + host);
            }
            else if (url.protocol === 'http:') {
                otherAllowedOrigins.push("http://" + host);
                otherAllowedOrigins.push("http://www." + host);
                otherAllowedOrigins.push("https://" + host);
                otherAllowedOrigins.push("https://www." + host);
            }
        }
        catch (ex) {
        }
        return otherAllowedOrigins;
    };
    Postmam.prototype.isSafeOrigin = function (messageOrigin) {
        if (!OneSignal.config) {
            var subdomain = "test";
        }
        else {
            var subdomain = OneSignal.config.subdomainName;
        }
        var otherAllowedOrigins = this.generateSafeOrigins(this.receiveFromOrigin);
        return (messageOrigin === 'https://onesignal.com' ||
            messageOrigin === "https://" + (subdomain || '') + ".onesignal.com" ||
            (Environment_1.default.isDev() && messageOrigin === vars_1.DEV_FRAME_HOST) ||
            (Environment_1.default.isStaging() && messageOrigin === vars_1.STAGING_FRAME_HOST) ||
            this.receiveFromOrigin === '*' ||
            utils_1.contains(otherAllowedOrigins, messageOrigin));
    };
    return Postmam;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Postmam;
//# sourceMappingURL=Postmam.js.map
});

;require.register("build/src/bell/ActiveAnimatedElement.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require("../utils");
var log = require("loglevel");
var Event_1 = require("../Event");
var AnimatedElement_1 = require("./AnimatedElement");
var objectAssign = require("object-assign");
var ActiveAnimatedElement = (function (_super) {
    __extends(ActiveAnimatedElement, _super);
    /**
     * Abstracts common DOM operations like hiding and showing transitionable elements into chainable promises.
     * @param selector {string} The CSS selector of the element.
     * @param showClass {string} The CSS class name to add to show the element.
     * @param hideClass {string} The CSS class name to remove to hide the element.
     * @param activeClass {string} The CSS class name to add to activate the element.
     * @param inactiveClass {string} The CSS class name to remove to inactivate the element.
     * @param state {string} The current state of the element, defaults to 'shown'.
     * @param activeState {string} The current state of the element, defaults to 'active'.
     * @param targetTransitionEvents {string} An array of properties (e.g. ['transform', 'opacity']) to look for on transitionend of show() and hide() to know the transition is complete. As long as one matches, the transition is considered complete.
     * @param nestedContentSelector {string} The CSS selector targeting the nested element within the current element. This nested element will be used for content getters and setters.
     */
    function ActiveAnimatedElement(selector, showClass, hideClass, activeClass, inactiveClass, state, activeState, targetTransitionEvents, nestedContentSelector) {
        if (state === void 0) { state = 'shown'; }
        if (activeState === void 0) { activeState = 'active'; }
        if (targetTransitionEvents === void 0) { targetTransitionEvents = ['opacity', 'transform']; }
        if (nestedContentSelector === void 0) { nestedContentSelector = null; }
        var _this = _super.call(this, selector, showClass, hideClass, state, targetTransitionEvents) || this;
        _this.selector = selector;
        _this.showClass = showClass;
        _this.hideClass = hideClass;
        _this.activeClass = activeClass;
        _this.inactiveClass = inactiveClass;
        _this.state = state;
        _this.activeState = activeState;
        _this.targetTransitionEvents = targetTransitionEvents;
        _this.nestedContentSelector = nestedContentSelector;
        return _this;
    }
    /**
     * Asynchronously activates an element by applying its {activeClass} CSS class.
     * @returns {Promise} Returns a promise that is resolved with this element when it has completed its transition.
     */
    ActiveAnimatedElement.prototype.activate = function () {
        var _this = this;
        if (!this.inactive || !this.shown) {
            return Promise.resolve(this);
        }
        else
            return new Promise(function (resolve) {
                _this.activeState = 'activating';
                Event_1.default.trigger(ActiveAnimatedElement.EVENTS.ACTIVATING, _this);
                if (_this.inactiveClass)
                    utils_1.removeCssClass(_this.element, _this.inactiveClass);
                if (_this.activeClass)
                    utils_1.addCssClass(_this.element, _this.activeClass);
                if (_this.shown) {
                    if (_this.targetTransitionEvents.length == 0) {
                        return resolve(_this);
                    }
                    else {
                        var timerId = setTimeout(function () {
                            log.debug("Element did not completely activate (state: " + _this.state + ", activeState: " + _this.activeState + ").");
                        }, _this.transitionCheckTimeout);
                        utils_1.once(_this.element, 'transitionend', function (event, destroyListenerFn) {
                            if (event.target === _this.element &&
                                utils_1.contains(_this.targetTransitionEvents, event.propertyName)) {
                                clearTimeout(timerId);
                                // Uninstall the event listener for transitionend
                                destroyListenerFn();
                                _this.activeState = 'active';
                                Event_1.default.trigger(ActiveAnimatedElement.EVENTS.ACTIVE, _this);
                                return resolve(_this);
                            }
                        }, true);
                    }
                }
                else {
                    log.debug("Ending activate() transition (alternative).");
                    _this.activeState = 'active';
                    Event_1.default.trigger(ActiveAnimatedElement.EVENTS.ACTIVE, _this);
                    return resolve(_this);
                }
            });
    };
    /**
     * Asynchronously activates an element by applying its {activeClass} CSS class.
     * @returns {Promise} Returns a promise that is resolved with this element when it has completed its transition.
     */
    ActiveAnimatedElement.prototype.inactivate = function () {
        var _this = this;
        if (!this.active) {
            return Promise.resolve(this);
        }
        else
            return new Promise(function (resolve) {
                _this.activeState = 'inactivating';
                Event_1.default.trigger(ActiveAnimatedElement.EVENTS.INACTIVATING, _this);
                if (_this.activeClass)
                    utils_1.removeCssClass(_this.element, _this.activeClass);
                if (_this.inactiveClass)
                    utils_1.addCssClass(_this.element, _this.inactiveClass);
                if (_this.shown) {
                    if (_this.targetTransitionEvents.length == 0) {
                        return resolve(_this);
                    }
                    else {
                        var timerId = setTimeout(function () {
                            log.debug("Element did not completely inactivate (state: " + _this.state + ", activeState: " + _this.activeState + ").");
                        }, _this.transitionCheckTimeout);
                        utils_1.once(_this.element, 'transitionend', function (event, destroyListenerFn) {
                            if (event.target === _this.element &&
                                utils_1.contains(_this.targetTransitionEvents, event.propertyName)) {
                                clearTimeout(timerId);
                                // Uninstall the event listener for transitionend
                                destroyListenerFn();
                                _this.activeState = 'inactive';
                                Event_1.default.trigger(ActiveAnimatedElement.EVENTS.INACTIVE, _this);
                                return resolve(_this);
                            }
                        }, true);
                    }
                }
                else {
                    _this.activeState = 'inactive';
                    Event_1.default.trigger(ActiveAnimatedElement.EVENTS.INACTIVE, _this);
                    return resolve(_this);
                }
            });
    };
    /**
     * Asynchronously waits for an element to finish transitioning to being active.
     * @returns {Promise} Returns a promise that is resolved with this element when it has completed its transition.
     */
    ActiveAnimatedElement.prototype.waitUntilActive = function () {
        var _this = this;
        if (this.active)
            return Promise.resolve(this);
        else
            return new Promise(function (resolve) {
                OneSignal.once(ActiveAnimatedElement.EVENTS.ACTIVE, function (event) {
                    if (event === _this) {
                        return resolve(_this);
                    }
                }, true);
            });
    };
    /**
     * Asynchronously waits for an element to finish transitioning to being inactive.
     * @returns {Promise} Returns a promise that is resolved with this element when it has completed its transition.
     */
    ActiveAnimatedElement.prototype.waitUntilInactive = function () {
        var _this = this;
        if (this.inactive)
            return Promise.resolve(this);
        else
            return new Promise(function (resolve) {
                OneSignal.once(ActiveAnimatedElement.EVENTS.INACTIVE, function (event) {
                    if (event === _this) {
                        return resolve(_this);
                    }
                }, true);
            });
    };
    Object.defineProperty(ActiveAnimatedElement, "EVENTS", {
        get: function () {
            return objectAssign({}, AnimatedElement_1.default.EVENTS, {
                ACTIVATING: 'activeAnimatedElementActivating',
                ACTIVE: 'activeAnimatedElementActive',
                INACTIVATING: 'activeAnimatedElementInactivating',
                INACTIVE: 'activeAnimatedElementInactive',
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActiveAnimatedElement.prototype, "activating", {
        /**
         * Synchronously returns the last known state of the element.
         * @returns {boolean} Returns true if the element was last known to be transitioning to being activated.
         */
        get: function () {
            return this.activeState === 'activating';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActiveAnimatedElement.prototype, "active", {
        /**
         * Synchronously returns the last known state of the element.
         * @returns {boolean} Returns true if the element was last known to be already active.
         */
        get: function () {
            return this.activeState === 'active';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActiveAnimatedElement.prototype, "inactivating", {
        /**
         * Synchronously returns the last known state of the element.
         * @returns {boolean} Returns true if the element was last known to be transitioning to inactive.
         */
        get: function () {
            return this.activeState === 'inactivating';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActiveAnimatedElement.prototype, "inactive", {
        /**
         * Synchronously returns the last known state of the element.
         * @returns {boolean} Returns true if the element was last known to be already inactive.
         */
        get: function () {
            return this.activeState === 'inactive';
        },
        enumerable: true,
        configurable: true
    });
    return ActiveAnimatedElement;
}(AnimatedElement_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ActiveAnimatedElement;
//# sourceMappingURL=ActiveAnimatedElement.js.map
});

;require.register("build/src/bell/AnimatedElement.js", function(exports, require, module) {
"use strict";
var utils_1 = require("../utils");
var log = require("loglevel");
var Event_1 = require("../Event");
var AnimatedElement = (function () {
    /**
     * Abstracts common DOM operations like hiding and showing transitionable elements into chainable promises.
     * @param selector {string} The CSS selector of the element.
     * @param showClass {string} The CSS class name to add to show the element.
     * @param hideClass {string} The CSS class name to remove to hide the element.
     * @param state {string} The current state of the element, defaults to 'shown'.
     * @param targetTransitionEvents {string} An array of properties (e.g. ['transform', 'opacity']) to look for on transitionend of show() and hide() to know the transition is complete. As long as one matches, the transition is considered complete.
     * @param nestedContentSelector {string} The CSS selector targeting the nested element within the current element. This nested element will be used for content getters and setters.
     */
    function AnimatedElement(selector, showClass, hideClass, state, targetTransitionEvents, nestedContentSelector, transitionCheckTimeout) {
        if (state === void 0) { state = 'shown'; }
        if (targetTransitionEvents === void 0) { targetTransitionEvents = ['opacity', 'transform']; }
        if (nestedContentSelector === void 0) { nestedContentSelector = null; }
        if (transitionCheckTimeout === void 0) { transitionCheckTimeout = 500; }
        this.selector = selector;
        this.showClass = showClass;
        this.hideClass = hideClass;
        this.state = state;
        this.targetTransitionEvents = targetTransitionEvents;
        this.nestedContentSelector = nestedContentSelector;
        this.transitionCheckTimeout = transitionCheckTimeout;
    }
    /**
     * Asynchronously shows an element by applying its {showClass} CSS class.
     * @returns {Promise} Returns a promise that is resolved with this element when it has completed its transition.
     */
    AnimatedElement.prototype.show = function () {
        var _this = this;
        if (!this.hidden) {
            return Promise.resolve(this);
        }
        else
            return new Promise(function (resolve) {
                var self = _this;
                _this.state = 'showing';
                Event_1.default.trigger(AnimatedElement.EVENTS.SHOWING, _this);
                if (_this.hideClass)
                    utils_1.removeCssClass(_this.element, _this.hideClass);
                if (_this.showClass)
                    utils_1.addCssClass(_this.element, _this.showClass);
                if (_this.targetTransitionEvents.length == 0) {
                    return resolve(_this);
                }
                else {
                    var timerId = setTimeout(function () {
                        log.debug("Element did not completely show (state: " + _this.state + ").");
                    }, _this.transitionCheckTimeout);
                    utils_1.once(_this.element, 'transitionend', function (event, destroyListenerFn) {
                        if (event.target === _this.element &&
                            utils_1.contains(_this.targetTransitionEvents, event.propertyName)) {
                            clearTimeout(timerId);
                            // Uninstall the event listener for transitionend
                            destroyListenerFn();
                            _this.state = 'shown';
                            Event_1.default.trigger(AnimatedElement.EVENTS.SHOWN, _this);
                            return resolve(_this);
                        }
                    }, true);
                }
            });
    };
    /**
     * Asynchronously hides an element by applying its {hideClass} CSS class.
     * @returns {Promise} Returns a promise that is resolved with this element when it has completed its transition.
     */
    AnimatedElement.prototype.hide = function () {
        var _this = this;
        if (!this.shown) {
            return Promise.resolve(this);
        }
        else
            return new Promise(function (resolve) {
                _this.state = 'hiding';
                Event_1.default.trigger(AnimatedElement.EVENTS.HIDING, _this);
                if (_this.showClass)
                    utils_1.removeCssClass(_this.element, _this.showClass);
                if (_this.hideClass)
                    utils_1.addCssClass(_this.element, _this.hideClass);
                if (_this.targetTransitionEvents.length == 0) {
                    return resolve(_this);
                }
                else {
                    utils_1.once(_this.element, 'transitionend', function (event, destroyListenerFn) {
                        var timerId = setTimeout(function () {
                            log.debug("Element did not completely hide (state: " + _this.state + ").");
                        }, _this.transitionCheckTimeout);
                        if (event.target === _this.element &&
                            utils_1.contains(_this.targetTransitionEvents, event.propertyName)) {
                            clearTimeout(timerId);
                            // Uninstall the event listener for transitionend
                            destroyListenerFn();
                            _this.state = 'hidden';
                            Event_1.default.trigger(AnimatedElement.EVENTS.HIDDEN, _this);
                            return resolve(_this);
                        }
                    }, true);
                }
            });
    };
    /**
     * Asynchronously waits for an element to finish transitioning to being shown.
     * @returns {Promise} Returns a promise that is resolved with this element when it has completed its transition.
     */
    AnimatedElement.prototype.waitUntilShown = function () {
        var _this = this;
        if (this.state === 'shown')
            return Promise.resolve(this);
        else
            return new Promise(function (resolve) {
                OneSignal.once(AnimatedElement.EVENTS.SHOWN, function (event) {
                    var self = _this;
                    if (event === _this) {
                        return resolve(_this);
                    }
                }, true);
            });
    };
    /**
     * Asynchronously waits for an element to finish transitioning to being hidden.
     * @returns {Promise} Returns a promise that is resolved with this element when it has completed its transition.
     */
    AnimatedElement.prototype.waitUntilHidden = function () {
        var _this = this;
        if (this.state === 'hidden')
            return Promise.resolve(this);
        else
            return new Promise(function (resolve) {
                OneSignal.once(AnimatedElement.EVENTS.HIDDEN, function (event) {
                    if (event === _this) {
                        return resolve(_this);
                    }
                }, true);
            });
    };
    Object.defineProperty(AnimatedElement, "EVENTS", {
        get: function () {
            return {
                SHOWING: 'animatedElementShowing',
                SHOWN: 'animatedElementShown',
                HIDING: 'animatedElementHiding',
                HIDDEN: 'aniamtedElementHidden',
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimatedElement.prototype, "content", {
        /**
         * Returns the native element's innerHTML property.
         * @returns {string} Returns the native element's innerHTML property.
         */
        get: function () {
            if (this.nestedContentSelector)
                return this.element.querySelector(this.nestedContentSelector).innerHTML;
            else
                return this.element.innerHTML;
        },
        /**
         * Sets the native element's innerHTML property.
         * @param value {string} The HTML to set to the element.
         */
        set: function (value) {
            if (this.nestedContentSelector) {
                this.element.querySelector(this.nestedContentSelector).innerHTML = value;
            }
            else {
                this.element.innerHTML = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimatedElement.prototype, "element", {
        /**
         * Returns the native {Element} via document.querySelector().
         * @returns {Element} Returns the native {Element} via document.querySelector().
         */
        get: function () {
            return document.querySelector(this.selector);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimatedElement.prototype, "showing", {
        /* States an element can be in */
        /**
         * Synchronously returns the last known state of the element.
         * @returns {boolean} Returns true if the element was last known to be transitioning to being shown.
         */
        get: function () {
            return this.state === 'showing';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimatedElement.prototype, "shown", {
        /**
         * Synchronously returns the last known state of the element.
         * @returns {boolean} Returns true if the element was last known to be already shown.
         */
        get: function () {
            return this.state === 'shown';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimatedElement.prototype, "hiding", {
        /**
         * Synchronously returns the last known state of the element.
         * @returns {boolean} Returns true if the element was last known to be transitioning to hiding.
         */
        get: function () {
            return this.state === 'hiding';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimatedElement.prototype, "hidden", {
        /**
         * Synchronously returns the last known state of the element.
         * @returns {boolean} Returns true if the element was last known to be already hidden.
         */
        get: function () {
            return this.state === 'hidden';
        },
        enumerable: true,
        configurable: true
    });
    return AnimatedElement;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AnimatedElement;
//# sourceMappingURL=AnimatedElement.js.map
});

;require.register("build/src/bell/Badge.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ActiveAnimatedElement_1 = require("./ActiveAnimatedElement");
var Badge = (function (_super) {
    __extends(Badge, _super);
    function Badge() {
        return _super.call(this, '.onesignal-bell-launcher-badge', 'onesignal-bell-launcher-badge-opened', null, 'onesignal-bell-launcher-badge-active', null, 'hidden') || this;
    }
    Badge.prototype.increment = function () {
        // If it IS a number (is not not a number)
        if (!isNaN(this.content)) {
            var badgeNumber = +this.content; // Coerce to int
            badgeNumber += 1;
            this.content = badgeNumber.toString();
            return badgeNumber;
        }
    };
    Badge.prototype.decrement = function () {
        // If it IS a number (is not not a number)
        if (!isNaN(this.content)) {
            var badgeNumber = +this.content; // Coerce to int
            badgeNumber -= 1;
            if (badgeNumber > 0)
                this.content = badgeNumber.toString();
            else
                this.content = '';
            return badgeNumber;
        }
    };
    return Badge;
}(ActiveAnimatedElement_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Badge;
//# sourceMappingURL=Badge.js.map
});

;require.register("build/src/bell/Bell.js", function(exports, require, module) {
"use strict";
var utils_1 = require("../utils");
var log = require("loglevel");
var Event_1 = require("../Event");
var Browser = require("bowser");
var Database_1 = require("../Database");
var MainHelper_1 = require("../helpers/MainHelper");
var Launcher_1 = require("./Launcher");
var Badge_1 = require("./Badge");
var Button_1 = require("./Button");
var Dialog_1 = require("./Dialog");
var Message_1 = require("./Message");
var SubscriptionHelper_1 = require("../helpers/SubscriptionHelper");
var logoSvg = "<svg class=\"onesignal-bell-svg\" xmlns=\"http://www.w3.org/2000/svg\" width=\"99.7\" height=\"99.7\" viewBox=\"0 0 99.7 99.7\"><circle class=\"background\" cx=\"49.9\" cy=\"49.9\" r=\"49.9\"/><path class=\"foreground\" d=\"M50.1 66.2H27.7s-2-.2-2-2.1c0-1.9 1.7-2 1.7-2s6.7-3.2 6.7-5.5S33 52.7 33 43.3s6-16.6 13.2-16.6c0 0 1-2.4 3.9-2.4 2.8 0 3.8 2.4 3.8 2.4 7.2 0 13.2 7.2 13.2 16.6s-1 11-1 13.3c0 2.3 6.7 5.5 6.7 5.5s1.7.1 1.7 2c0 1.8-2.1 2.1-2.1 2.1H50.1zm-7.2 2.3h14.5s-1 6.3-7.2 6.3-7.3-6.3-7.3-6.3z\"/><ellipse class=\"stroke\" cx=\"49.9\" cy=\"49.9\" rx=\"37.4\" ry=\"36.9\"/></svg>";
var Bell = (function () {
    function Bell(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.enable, enable = _c === void 0 ? false : _c, _d = _b.size, size = _d === void 0 ? 'medium' : _d, _e = _b.position, position = _e === void 0 ? 'bottom-right' : _e, _f = _b.theme, theme = _f === void 0 ? 'default' : _f, _g = _b.showLauncherAfter, showLauncherAfter = _g === void 0 ? 10 : _g, _h = _b.showBadgeAfter, showBadgeAfter = _h === void 0 ? 300 : _h, _j = _b.text, text = _j === void 0 ? {
            'tip.state.unsubscribed': 'Subscribe to notifications',
            'tip.state.subscribed': "You're subscribed to notifications",
            'tip.state.blocked': "You've blocked notifications",
            'message.prenotify': 'Click to subscribe to notifications',
            'message.action.subscribing': "Click <strong>{{prompt.native.grant}}</strong> to receive notifications",
            'message.action.subscribed': "Thanks for subscribing!",
            'message.action.resubscribed': "You're subscribed to notifications",
            'message.action.unsubscribed': "You won't receive notifications again",
            'dialog.main.title': 'Manage Site Notifications',
            'dialog.main.button.subscribe': 'SUBSCRIBE',
            'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
            'dialog.blocked.title': 'Unblock Notifications',
            'dialog.blocked.message': "Follow these instructions to allow notifications:"
        } : _j, _k = _b.prenotify, prenotify = _k === void 0 ? true : _k, _l = _b.showCredit, showCredit = _l === void 0 ? true : _l, _m = _b.colors, colors = _m === void 0 ? null : _m, _o = _b.offset, offset = _o === void 0 ? null : _o;
        var _this = this;
        this.options = {
            enable: enable,
            size: size,
            position: position,
            theme: theme,
            showLauncherAfter: showLauncherAfter,
            showBadgeAfter: showBadgeAfter,
            text: text,
            prenotify: prenotify,
            showCredit: showCredit,
            colors: colors,
            offset: offset,
        };
        //require('../../../src/bell/bell.scss');
        if (!this.options.enable)
            return;
        if (!utils_1.contains(['small', 'medium', 'large'], this.options.size))
            throw new Error("Invalid size " + this.options.size + " for notify button. Choose among 'small', 'medium', or 'large'.");
        if (!utils_1.contains(['bottom-left', 'bottom-right'], this.options.position))
            throw new Error("Invalid position " + this.options.position + " for notify button. Choose either 'bottom-left', or 'bottom-right'.");
        if (!utils_1.contains(['default', 'inverse'], this.options.theme))
            throw new Error("Invalid theme " + this.options.theme + " for notify button. Choose either 'default', or 'inverse'.");
        if (this.options.showLauncherAfter < 0)
            throw new Error("Invalid delay duration of " + this.options.showLauncherAfter + " for showing the notify button. Choose a value above 0.");
        if (this.options.showBadgeAfter < 0)
            throw new Error("Invalid delay duration of " + this.options.showBadgeAfter + " for showing the notify button's badge. Choose a value above 0.");
        this.size = this.options.size;
        this.position = this.options.position;
        this.text = this.options.text;
        if (!this.text['tip.state.unsubscribed'])
            this.text['tip.state.unsubscribed'] = 'Subscribe to notifications';
        if (!this.text['tip.state.subscribed'])
            this.text['tip.state.subscribed'] = "You're subscribed to notifications";
        if (!this.text['tip.state.blocked'])
            this.text['tip.state.blocked'] = "You've blocked notifications";
        if (!this.text['message.prenotify'])
            this.text['message.prenotify'] = "Click to subscribe to notifications";
        if (!this.text['message.action.subscribed'])
            this.text['message.action.subscribed'] = "Thanks for subscribing!";
        if (!this.text['message.action.resubscribed'])
            this.text['message.action.resubscribed'] = "You're subscribed to notifications";
        if (!this.text['message.action.subscribing'])
            this.text['message.action.subscribing'] = "Click <strong>{{prompt.native.grant}}</strong> to receive notifications";
        if (!this.text['message.action.unsubscribed'])
            this.text['message.action.unsubscribed'] = "You won't receive notifications again";
        if (!this.text['dialog.main.title'])
            this.text['dialog.main.title'] = 'Manage Site Notifications';
        if (!this.text['dialog.main.button.subscribe'])
            this.text['dialog.main.button.subscribe'] = 'SUBSCRIBE';
        if (!this.text['dialog.main.button.unsubscribe'])
            this.text['dialog.main.button.unsubscribe'] = 'UNSUBSCRIBE';
        if (!this.text['dialog.blocked.title'])
            this.text['dialog.blocked.title'] = 'Unblock Notifications';
        if (!this.text['dialog.blocked.message'])
            this.text['dialog.blocked.message'] = 'Follow these instructions to allow notifications:';
        this.substituteText();
        this.state = Bell.STATES.UNINITIALIZED;
        this._ignoreSubscriptionState = false;
        // Install event hooks
        OneSignal.on(Bell.EVENTS.SUBSCRIBE_CLICK, function () {
            _this.dialog.subscribeButton.disabled = true;
            _this._ignoreSubscriptionState = true;
            OneSignal.setSubscription(true)
                .then(function () {
                _this.dialog.subscribeButton.disabled = false;
                return _this.dialog.hide();
            })
                .then(function () {
                return _this.message.display(Message_1.default.TYPES.MESSAGE, _this.text['message.action.resubscribed'], Message_1.default.TIMEOUT);
            })
                .then(function () {
                _this._ignoreSubscriptionState = false;
                _this.launcher.clearIfWasInactive();
                return _this.launcher.inactivate();
            })
                .then(function () {
                return _this.updateState();
            });
        });
        OneSignal.on(Bell.EVENTS.UNSUBSCRIBE_CLICK, function () {
            _this.dialog.unsubscribeButton.disabled = true;
            OneSignal.setSubscription(false)
                .then(function () {
                _this.dialog.unsubscribeButton.disabled = false;
                return _this.dialog.hide();
            })
                .then(function () {
                _this.launcher.clearIfWasInactive();
                return _this.launcher.activate();
            })
                .then(function () {
                return _this.message.display(Message_1.default.TYPES.MESSAGE, _this.text['message.action.unsubscribed'], Message_1.default.TIMEOUT);
            })
                .then(function () {
                return _this.updateState();
            });
        });
        OneSignal.on(Bell.EVENTS.HOVERING, function () {
            _this.hovering = true;
            _this.launcher.activateIfInactive();
            // If there's already a message being force shown, do not override
            if (_this.message.shown || _this.dialog.shown) {
                _this.hovering = false;
                return;
            }
            // If the message is a message and not a tip, don't show it (only show tips)
            // Messages will go away on their own
            if (_this.message.contentType === Message_1.default.TYPES.MESSAGE) {
                _this.hovering = false;
                return;
            }
            new Promise(function (resolve, reject) {
                // If a message is being shown
                if (_this.message.queued.length > 0) {
                    return _this.message.dequeue().then(function (msg) {
                        _this.message.content = msg;
                        _this.message.contentType = Message_1.default.TYPES.QUEUED;
                        resolve();
                    });
                }
                else {
                    _this.message.content = utils_1.decodeHtmlEntities(_this.message.getTipForState());
                    _this.message.contentType = Message_1.default.TYPES.TIP;
                    resolve();
                }
            }).then(function () {
                return _this.message.show();
            })
                .then(function () {
                _this.hovering = false;
            });
        });
        OneSignal.on(Bell.EVENTS.HOVERED, function () {
            // If a message is displayed (and not a tip), don't control it. Visitors have no control over messages
            if (_this.message.contentType === Message_1.default.TYPES.MESSAGE) {
                return;
            }
            if (!_this.dialog.hidden) {
                // If the dialog is being brought up when clicking button, don't shrink
                return;
            }
            if (_this.hovering) {
                _this.hovering = false;
                // Hovering still being true here happens on mobile where the message could still be showing (i.e. animating) when a HOVERED event fires
                // In other words, you tap on mobile, HOVERING fires, and then HOVERED fires immediately after because of the way mobile click events work
                // Basically only happens if HOVERING and HOVERED fire within a few milliseconds of each other
                _this.message.waitUntilShown()
                    .then(function () { return utils_1.delay(Message_1.default.TIMEOUT); })
                    .then(function () { return _this.message.hide(); })
                    .then(function () {
                    if (_this.launcher.wasInactive && _this.dialog.hidden) {
                        _this.launcher.inactivate();
                        _this.launcher.wasInactive = null;
                    }
                });
            }
            if (_this.message.shown) {
                _this.message.hide()
                    .then(function () {
                    if (_this.launcher.wasInactive && _this.dialog.hidden) {
                        _this.launcher.inactivate();
                        _this.launcher.wasInactive = null;
                    }
                });
            }
        });
        OneSignal.on(OneSignal.EVENTS.SUBSCRIPTION_CHANGED, function (isSubscribed) {
            if (isSubscribed == true) {
                if (_this.badge.shown && _this.options.prenotify) {
                    _this.badge.hide();
                }
                if (_this.dialog.notificationIcons === null) {
                    MainHelper_1.default.getNotificationIcons().then(function (icons) {
                        _this.dialog.notificationIcons = icons;
                    });
                }
            }
            OneSignal.getNotificationPermission(function (permission) {
                _this.setState((isSubscribed ?
                    Bell.STATES.SUBSCRIBED :
                    ((permission === 'denied') ? Bell.STATES.BLOCKED : Bell.STATES.UNSUBSCRIBED)), _this._ignoreSubscriptionState);
            });
        });
        OneSignal.on(Bell.EVENTS.STATE_CHANGED, function (state) {
            if (state.to === Bell.STATES.SUBSCRIBED) {
                _this.launcher.inactivate();
            }
            else if (state.to === Bell.STATES.UNSUBSCRIBED ||
                Bell.STATES.BLOCKED) {
                _this.launcher.activate();
            }
        });
        OneSignal.on(OneSignal.EVENTS.NATIVE_PROMPT_PERMISSIONCHANGED, function (from, to) {
            _this.updateState();
        });
        this.updateState();
    }
    Object.defineProperty(Bell, "EVENTS", {
        get: function () {
            return {
                STATE_CHANGED: 'notifyButtonStateChange',
                LAUNCHER_CLICK: 'notifyButtonLauncherClick',
                BELL_CLICK: 'notifyButtonButtonClick',
                SUBSCRIBE_CLICK: 'notifyButtonSubscribeClick',
                UNSUBSCRIBE_CLICK: 'notifyButtonUnsubscribeClick',
                HOVERING: 'notifyButtonHovering',
                HOVERED: 'notifyButtonHover'
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bell, "STATES", {
        get: function () {
            return {
                UNINITIALIZED: 'uninitialized',
                SUBSCRIBED: 'subscribed',
                UNSUBSCRIBED: 'unsubscribed',
                BLOCKED: 'blocked'
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bell, "TEXT_SUBS", {
        get: function () {
            return {
                'prompt.native.grant': {
                    default: 'Allow',
                    chrome: 'Allow',
                    firefox: 'Always Receive Notifications',
                    safari: 'Allow'
                }
            };
        },
        enumerable: true,
        configurable: true
    });
    Bell.prototype.substituteText = function () {
        // key: 'message.action.subscribing'
        // value: 'Click <strong>{{prompt.native.grant}}</strong> to receive notifications'
        for (var key in this.text) {
            if (this.text.hasOwnProperty(key)) {
                var value = this.text[key];
                // browserName could be 'chrome' or 'firefox' or 'safari'
                var browserName = Browser.name.toLowerCase();
                // tKey: 'prompt.native.grant'  (from TEXT_SUBS)
                // tValue: { chrome: 'Allow', firefox: 'Al... }
                // zValue: 'Allow', if browserName === 'chrome'
                for (var tKey in Bell.TEXT_SUBS) {
                    if (Bell.TEXT_SUBS.hasOwnProperty(tKey)) {
                        var tValue = Bell.TEXT_SUBS[tKey];
                        var zValue = tValue[browserName];
                        if (value && utils_1.contains(value, '{{')) {
                            this.text[key] = value.replace("{{" + tKey + "}}", (zValue !== undefined ? zValue : tValue['default']));
                        }
                    }
                }
            }
        }
    };
    Bell.prototype.showDialogProcedure = function () {
        var _this = this;
        if (!this.dialog.shown) {
            this.dialog.show()
                .then(function () {
                utils_1.once(document, 'click', function (e, destroyEventListener) {
                    var wasDialogClicked = _this.dialog.element.contains(e.target);
                    if (wasDialogClicked) {
                    }
                    else {
                        destroyEventListener();
                        if (_this.dialog.shown) {
                            _this.dialog.hide()
                                .then(function (e) {
                                _this.launcher.inactivateIfWasInactive();
                            });
                        }
                    }
                }, true);
            });
        }
    };
    Bell.prototype.create = function () {
        var _this = this;
        if (!utils_1.isPushNotificationsSupported())
            return;
        if (!this.options.enable)
            return;
        // Remove any existing bell
        if (this.container) {
            utils_1.removeDomElement('#onesignal-bell-container');
        }
        // Insert the bell container
        utils_1.addDomElement('body', 'beforeend', '<div id="onesignal-bell-container" class="onesignal-bell-container onesignal-reset"></div>');
        // Insert the bell launcher
        utils_1.addDomElement(this.container, 'beforeend', '<div id="onesignal-bell-launcher" class="onesignal-bell-launcher"></div>');
        // Insert the bell launcher button
        utils_1.addDomElement(this.launcher.selector, 'beforeend', '<div class="onesignal-bell-launcher-button"></div>');
        // Insert the bell launcher badge
        utils_1.addDomElement(this.launcher.selector, 'beforeend', '<div class="onesignal-bell-launcher-badge"></div>');
        // Insert the bell launcher message
        utils_1.addDomElement(this.launcher.selector, 'beforeend', '<div class="onesignal-bell-launcher-message"></div>');
        utils_1.addDomElement(this.message.selector, 'beforeend', '<div class="onesignal-bell-launcher-message-body"></div>');
        // Insert the bell launcher dialog
        utils_1.addDomElement(this.launcher.selector, 'beforeend', '<div class="onesignal-bell-launcher-dialog"></div>');
        utils_1.addDomElement(this.dialog.selector, 'beforeend', '<div class="onesignal-bell-launcher-dialog-body"></div>');
        // Install events
        // Add visual elements
        utils_1.addDomElement(this.button.selector, 'beforeEnd', logoSvg);
        Promise.all([
            OneSignal.isPushNotificationsEnabled(),
            OneSignal.getSubscription(),
            Database_1.default.get('Options', 'popoverDoNotPrompt')
        ])
            .then(function (_a) {
            var isPushEnabled = _a[0], notOptedOut = _a[1], doNotPrompt = _a[2];
            // Resize to small instead of specified size if enabled, otherwise there's a jerking motion where the bell, at a different size than small, jerks sideways to go from large -> small or medium -> small
            var resizeTo = (isPushEnabled ? 'small' : _this.options.size);
            // Add default classes
            _this.launcher.resize(resizeTo).then(function () {
                if (_this.options.position === 'bottom-left') {
                    utils_1.addCssClass(_this.container, 'onesignal-bell-container-bottom-left');
                    utils_1.addCssClass(_this.launcher.selector, 'onesignal-bell-launcher-bottom-left');
                }
                else if (_this.options.position === 'bottom-right') {
                    utils_1.addCssClass(_this.container, 'onesignal-bell-container-bottom-right');
                    utils_1.addCssClass(_this.launcher.selector, 'onesignal-bell-launcher-bottom-right');
                }
                else {
                    throw new Error('Invalid OneSignal notify button position ' + _this.options.position);
                }
                if (_this.options.theme === 'default') {
                    utils_1.addCssClass(_this.launcher.selector, 'onesignal-bell-launcher-theme-default');
                }
                else if (_this.options.theme === 'inverse') {
                    utils_1.addCssClass(_this.launcher.selector, 'onesignal-bell-launcher-theme-inverse');
                }
                else {
                    throw new Error('Invalid OneSignal notify button theme ' + _this.options.theme);
                }
                _this.applyOffsetIfSpecified();
                _this.setCustomColorsIfSpecified();
                _this.patchSafariSvgFilterBug();
                log.info('Showing the notify button.');
                (isPushEnabled ? _this.launcher.inactivate() : utils_1.nothing())
                    .then(function () { return OneSignal.getSubscription(); })
                    .then(function (isNotOptedOut) {
                    if ((isPushEnabled || !isNotOptedOut) && _this.dialog.notificationIcons === null) {
                        return MainHelper_1.default.getNotificationIcons().then(function (icons) {
                            _this.dialog.notificationIcons = icons;
                        });
                    }
                    else
                        return utils_1.nothing();
                })
                    .then(function () { return utils_1.delay(_this.options.showLauncherAfter); })
                    .then(function () {
                    if (SubscriptionHelper_1.default.isUsingSubscriptionWorkaround() &&
                        notOptedOut &&
                        doNotPrompt !== true &&
                        !isPushEnabled &&
                        (OneSignal.config.autoRegister === true) &&
                        !MainHelper_1.default.isHttpPromptAlreadyShown() &&
                        !MainHelper_1.default.isUsingHttpPermissionRequest()) {
                        log.debug('Not showing notify button because popover will be shown.');
                        return utils_1.nothing();
                    }
                    else {
                        return _this.launcher.show();
                    }
                })
                    .then(function () {
                    return utils_1.delay(_this.options.showBadgeAfter);
                })
                    .then(function () {
                    if (_this.options.prenotify && !isPushEnabled && OneSignal._isNewVisitor) {
                        return _this.message.enqueue(_this.text['message.prenotify'])
                            .then(function () { return _this.badge.show(); });
                    }
                    else
                        return utils_1.nothing();
                })
                    .then(function () { return _this.initialized = true; });
            });
        });
    };
    Bell.prototype.patchSafariSvgFilterBug = function () {
        if (!(Browser.safari && Number(Browser.version) >= 9.1)) {
            var bellShadow = "drop-shadow(0 2px 4px rgba(34,36,38,0.35));";
            var badgeShadow = "drop-shadow(0 2px 4px rgba(34,36,38,0));";
            var dialogShadow = "drop-shadow(0px 2px 2px rgba(34,36,38,.15));";
            this.graphic.setAttribute('style', "filter: " + bellShadow + "; -webkit-filter: " + bellShadow + ";");
            this.badge.element.setAttribute('style', "filter: " + badgeShadow + "; -webkit-filter: " + badgeShadow + ";");
            this.dialog.element.setAttribute('style', "filter: " + dialogShadow + "; -webkit-filter: " + dialogShadow + ";");
        }
        if (Browser.safari) {
            this.badge.element.setAttribute('style', "display: none;");
        }
    };
    Bell.prototype.applyOffsetIfSpecified = function () {
        var offset = this.options.offset;
        if (offset) {
            // Reset styles first
            this.launcher.element.style.cssText = '';
            if (offset.bottom) {
                this.launcher.element.style.cssText += "bottom: " + offset.bottom + ";";
            }
            if (this.options.position === 'bottom-right') {
                if (offset.right) {
                    this.launcher.element.style.cssText += "right: " + offset.right + ";";
                }
            }
            else if (this.options.position === 'bottom-left') {
                if (offset.left) {
                    this.launcher.element.style.cssText += "left: " + offset.left + ";";
                }
            }
        }
    };
    Bell.prototype.setCustomColorsIfSpecified = function () {
        // Some common vars first
        var dialogButton = this.dialog.element.querySelector('button.action');
        var pulseRing = this.button.element.querySelector('.pulse-ring');
        // Reset added styles first
        this.graphic.querySelector('.background').style.cssText = '';
        var foregroundElements = this.graphic.querySelectorAll('.foreground');
        for (var i = 0; i < foregroundElements.length; i++) {
            var element = foregroundElements[i];
            element.style.cssText = '';
        }
        this.graphic.querySelector('.stroke').style.cssText = '';
        this.badge.element.style.cssText = '';
        if (dialogButton) {
            dialogButton.style.cssText = '';
            dialogButton.style.cssText = '';
        }
        if (pulseRing) {
            pulseRing.style.cssText = '';
        }
        // Set new styles
        if (this.options.colors) {
            var colors = this.options.colors;
            if (colors['circle.background']) {
                this.graphic.querySelector('.background').style.cssText += "fill: " + colors['circle.background'];
            }
            if (colors['circle.foreground']) {
                var foregroundElements_1 = this.graphic.querySelectorAll('.foreground');
                for (var i = 0; i < foregroundElements_1.length; i++) {
                    var element = foregroundElements_1[i];
                    element.style.cssText += "fill: " + colors['circle.foreground'];
                }
                this.graphic.querySelector('.stroke').style.cssText += "stroke: " + colors['circle.foreground'];
            }
            if (colors['badge.background']) {
                this.badge.element.style.cssText += "background: " + colors['badge.background'];
            }
            if (colors['badge.bordercolor']) {
                this.badge.element.style.cssText += "border-color: " + colors['badge.bordercolor'];
            }
            if (colors['badge.foreground']) {
                this.badge.element.style.cssText += "color: " + colors['badge.foreground'];
            }
            if (dialogButton) {
                if (colors['dialog.button.background']) {
                    this.dialog.element.querySelector('button.action').style.cssText += "background: " + colors['dialog.button.background'];
                }
                if (colors['dialog.button.foreground']) {
                    this.dialog.element.querySelector('button.action').style.cssText += "color: " + colors['dialog.button.foreground'];
                }
                if (colors['dialog.button.background.hovering']) {
                    this.addCssToHead('onesignal-background-hover-style', "#onesignal-bell-container.onesignal-reset .onesignal-bell-launcher .onesignal-bell-launcher-dialog button.action:hover { background: " + colors['dialog.button.background.hovering'] + " !important; }");
                }
                if (colors['dialog.button.background.active']) {
                    this.addCssToHead('onesignal-background-active-style', "#onesignal-bell-container.onesignal-reset .onesignal-bell-launcher .onesignal-bell-launcher-dialog button.action:active { background: " + colors['dialog.button.background.active'] + " !important; }");
                }
            }
            if (pulseRing) {
                if (colors['pulse.color']) {
                    this.button.element.querySelector('.pulse-ring').style.cssText = "border-color: " + colors['pulse.color'];
                }
            }
        }
    };
    Bell.prototype.addCssToHead = function (id, css) {
        var existingStyleDom = document.getElementById(id);
        if (existingStyleDom)
            return;
        var styleDom = document.createElement('style');
        styleDom.id = id;
        styleDom.type = 'text/css';
        styleDom.appendChild(document.createTextNode(css));
        document.head.appendChild(styleDom);
    };
    /**
     * Updates the current state to the correct new current state. Returns a promise.
     */
    Bell.prototype.updateState = function () {
        var _this = this;
        Promise.all([
            OneSignal.isPushNotificationsEnabled(),
            OneSignal.getNotificationPermission()
        ])
            .then(function (_a) {
            var isEnabled = _a[0], permission = _a[1];
            _this.setState(isEnabled ? Bell.STATES.SUBSCRIBED : Bell.STATES.UNSUBSCRIBED);
            if (permission === 'denied') {
                _this.setState(Bell.STATES.BLOCKED);
            }
        });
    };
    /**
     * Updates the current state to the specified new state.
     * @param newState One of ['subscribed', 'unsubscribed'].
     */
    Bell.prototype.setState = function (newState, silent) {
        if (silent === void 0) { silent = false; }
        var lastState = this.state;
        this.state = newState;
        if (lastState !== newState && !silent) {
            Event_1.default.trigger(Bell.EVENTS.STATE_CHANGED, { from: lastState, to: newState });
        }
        // Update anything that should be reset to the same state
    };
    Object.defineProperty(Bell.prototype, "container", {
        get: function () {
            return document.querySelector('#onesignal-bell-container');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bell.prototype, "graphic", {
        get: function () {
            return this.button.element.querySelector('svg');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bell.prototype, "launcher", {
        get: function () {
            if (!this._launcher)
                this._launcher = new Launcher_1.default(this);
            return this._launcher;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bell.prototype, "button", {
        get: function () {
            if (!this._button)
                this._button = new Button_1.default(this);
            return this._button;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bell.prototype, "badge", {
        get: function () {
            if (!this._badge)
                this._badge = new Badge_1.default();
            return this._badge;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bell.prototype, "message", {
        get: function () {
            if (!this._message)
                this._message = new Message_1.default(this);
            return this._message;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bell.prototype, "dialog", {
        get: function () {
            if (!this._dialog)
                this._dialog = new Dialog_1.default(this);
            return this._dialog;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bell.prototype, "subscribed", {
        get: function () {
            return this.state === Bell.STATES.SUBSCRIBED;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bell.prototype, "unsubscribed", {
        get: function () {
            return this.state === Bell.STATES.UNSUBSCRIBED;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bell.prototype, "blocked", {
        get: function () {
            return this.state === Bell.STATES.BLOCKED;
        },
        enumerable: true,
        configurable: true
    });
    return Bell;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Bell;
//# sourceMappingURL=Bell.js.map
});

;require.register("build/src/bell/Button.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require("../utils");
var Event_1 = require("../Event");
var ActiveAnimatedElement_1 = require("./ActiveAnimatedElement");
var Bell_1 = require("./Bell");
var LimitStore_1 = require("../LimitStore");
var Message_1 = require("./Message");
var SubscriptionHelper_1 = require("../helpers/SubscriptionHelper");
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(bell) {
        var _this = _super.call(this, '.onesignal-bell-launcher-button', null, null, 'onesignal-bell-launcher-button-active', null, 'shown', '') || this;
        _this.bell = bell;
        _this.events = {
            mouse: 'bell.launcher.button.mouse'
        };
        _this.element.addEventListener('touchstart', function (e) {
            _this.onHovering(e);
            _this.onTap(e);
        });
        _this.element.addEventListener('mouseenter', function (e) {
            _this.onHovering(e);
        });
        _this.element.addEventListener('mouseleave', function (e) {
            _this.onHovered(e);
        });
        _this.element.addEventListener('touchmove', function (e) {
            _this.onHovered(e);
        });
        _this.element.addEventListener('mousedown', function (e) {
            _this.onTap(e);
        });
        _this.element.addEventListener('mouseup', function (e) {
            _this.onEndTap(e);
        });
        _this.element.addEventListener('click', function (e) {
            _this.onHovered(e);
            _this.onClick(e);
        });
        return _this;
    }
    Button.prototype.onHovering = function (e) {
        if (LimitStore_1.default.isEmpty(this.events.mouse) || LimitStore_1.default.getLast(this.events.mouse) === 'out') {
            Event_1.default.trigger(Bell_1.default.EVENTS.HOVERING);
        }
        LimitStore_1.default.put(this.events.mouse, 'over');
    };
    Button.prototype.onHovered = function (e) {
        LimitStore_1.default.put(this.events.mouse, 'out');
        Event_1.default.trigger(Bell_1.default.EVENTS.HOVERED);
    };
    Button.prototype.onTap = function (e) {
        this.pulse();
        this.activate();
        this.bell.badge.activate();
    };
    Button.prototype.onEndTap = function (e) {
        this.inactivate();
        this.bell.badge.inactivate();
    };
    Button.prototype.onClick = function (e) {
        var _this = this;
        Event_1.default.trigger(Bell_1.default.EVENTS.BELL_CLICK);
        Event_1.default.trigger(Bell_1.default.EVENTS.LAUNCHER_CLICK);
        if (this.bell.message.shown && this.bell.message.contentType == Message_1.default.TYPES.MESSAGE) {
            // A message is being shown, it'll disappear soon
            return;
        }
        var optedOut = LimitStore_1.default.getLast('subscription.optedOut');
        if (this.bell.unsubscribed) {
            if (optedOut) {
                // The user is manually opted out, but still "really" subscribed
                this.bell.launcher.activateIfInactive().then(function () {
                    _this.bell.showDialogProcedure();
                });
            }
            else {
                // The user is actually subscribed, register him for notifications
                OneSignal.registerForPushNotifications();
                //// Show the 'Click Allow to receive notifications' tip, if they haven't already enabled permissions
                //if (OneSignal.getNotificationPermission() === 'default') {
                //  this.bell.message.display(Message.TYPES.MESSAGE, this.bell.text['message.action.subscribing'], Message.TIMEOUT)
                //}
                this.bell._ignoreSubscriptionState = true;
                OneSignal.once(OneSignal.EVENTS.SUBSCRIPTION_CHANGED, function (isSubscribed) {
                    _this.bell.message.display(Message_1.default.TYPES.MESSAGE, _this.bell.text['message.action.subscribed'], Message_1.default.TIMEOUT)
                        .then(function () {
                        _this.bell._ignoreSubscriptionState = false;
                        _this.bell.launcher.inactivate();
                    });
                });
            }
        }
        else if (this.bell.subscribed) {
            this.bell.launcher.activateIfInactive().then(function () {
                _this.bell.showDialogProcedure();
            });
        }
        else if (this.bell.blocked) {
            if (SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
                // Show the HTTP popup so users can re-allow notifications
                OneSignal.registerForPushNotifications();
            }
            else {
                this.bell.launcher.activateIfInactive().then(function () {
                    _this.bell.showDialogProcedure();
                });
            }
        }
        return this.bell.message.hide();
    };
    Button.prototype.pulse = function () {
        utils_1.removeDomElement('.pulse-ring');
        utils_1.addDomElement(this.element, 'beforeend', '<div class="pulse-ring"></div>');
        this.bell.setCustomColorsIfSpecified();
    };
    return Button;
}(ActiveAnimatedElement_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Button;
//# sourceMappingURL=Button.js.map
});

;require.register("build/src/bell/Dialog.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require("../utils");
var Event_1 = require("../Event");
var AnimatedElement_1 = require("./AnimatedElement");
var Browser = require("bowser");
var Bell_1 = require("./Bell");
var vars_1 = require("../vars");
var Dialog = (function (_super) {
    __extends(Dialog, _super);
    function Dialog(bell) {
        var _this = _super.call(this, '.onesignal-bell-launcher-dialog', 'onesignal-bell-launcher-dialog-opened', null, 'hidden', ['opacity', 'transform'], '.onesignal-bell-launcher-dialog-body') || this;
        _this.bell = bell;
        _this.subscribeButtonId = '#onesignal-bell-container .onesignal-bell-launcher #subscribe-button';
        _this.unsubscribeButtonId = '#onesignal-bell-container .onesignal-bell-launcher #unsubscribe-button';
        _this.notificationIcons = null;
        window.addEventListener('click', function (event) {
            if (event.target === document.querySelector(_this.subscribeButtonId))
                Event_1.default.trigger(Bell_1.default.EVENTS.SUBSCRIBE_CLICK);
            else if (event.target === document.querySelector(_this.unsubscribeButtonId))
                Event_1.default.trigger(Bell_1.default.EVENTS.UNSUBSCRIBE_CLICK);
        });
        return _this;
    }
    Dialog.prototype.getPlatformNotificationIcon = function () {
        if (this.notificationIcons) {
            if (Browser.chrome || Browser.firefox) {
                return this.notificationIcons.chrome || this.notificationIcons.safari;
            }
            else if (Browser.safari) {
                return this.notificationIcons.safari || this.notificationIcons.chrome;
            }
        }
        else
            return null;
    };
    Dialog.prototype.show = function () {
        var _this = this;
        return this.updateBellLauncherDialogBody()
            .then(function () { return _super.prototype.show.call(_this); });
    };
    Object.defineProperty(Dialog.prototype, "subscribeButtonSelectorId", {
        get: function () {
            return 'subscribe-button';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dialog.prototype, "unsubscribeButtonSelectorId", {
        get: function () {
            return 'unsubscribe-button';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dialog.prototype, "subscribeButton", {
        get: function () {
            return this.element.querySelector('#' + this.subscribeButtonSelectorId);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dialog.prototype, "unsubscribeButton", {
        get: function () {
            return this.element.querySelector('#' + this.unsubscribeButtonSelectorId);
        },
        enumerable: true,
        configurable: true
    });
    Dialog.prototype.updateBellLauncherDialogBody = function () {
        var _this = this;
        return OneSignal.getSubscription().then(function (currentSetSubscription) {
            utils_1.clearDomElementChildren(document.querySelector(_this.nestedContentSelector));
            var contents = 'Nothing to show.';
            var footer = '';
            if (_this.bell.options.showCredit) {
                footer = "<div class=\"divider\"></div>\n                  <div class=\"kickback\">Powered by <a href=\"https://onesignal.com\" class=\"kickback\" target=\"_blank\">OneSignal</a></div>";
            }
            if (_this.bell.state === Bell_1.default.STATES.SUBSCRIBED && currentSetSubscription === true ||
                _this.bell.state === Bell_1.default.STATES.UNSUBSCRIBED && currentSetSubscription === false) {
                var notificationIconHtml = '';
                var imageUrl = _this.getPlatformNotificationIcon();
                if (imageUrl) {
                    notificationIconHtml = "<div class=\"push-notification-icon\"><img src=\"" + imageUrl + "\"></div>";
                }
                else {
                    notificationIconHtml = "<div class=\"push-notification-icon push-notification-icon-default\"></div>";
                }
                var buttonHtml = '';
                if (_this.bell.state !== Bell_1.default.STATES.SUBSCRIBED)
                    buttonHtml = "<button type=\"button\" class=\"action\" id=\"" + _this.subscribeButtonSelectorId + "\">" + _this.bell.text['dialog.main.button.subscribe'] + "</button>";
                else
                    buttonHtml = "<button type=\"button\" class=\"action\" id=\"" + _this.unsubscribeButtonSelectorId + "\">" + _this.bell.text['dialog.main.button.unsubscribe'] + "</button>";
                contents = "\n                  <h1>" + _this.bell.text['dialog.main.title'] + "</h1>\n                  <div class=\"divider\"></div>\n                  <div class=\"push-notification\">\n                    " + notificationIconHtml + "\n                    <div class=\"push-notification-text-container\">\n                      <div class=\"push-notification-text push-notification-text-short\"></div>\n                      <div class=\"push-notification-text\"></div>\n                      <div class=\"push-notification-text push-notification-text-medium\"></div>\n                      <div class=\"push-notification-text\"></div>\n                      <div class=\"push-notification-text push-notification-text-medium\"></div>\n                    </div>\n                  </div>\n                  <div class=\"action-container\">\n                    " + buttonHtml + "\n                  </div>\n                  " + footer + "\n                ";
            }
            else if (_this.bell.state === Bell_1.default.STATES.BLOCKED) {
                var imageUrl = null;
                if (Browser.chrome) {
                    if (!Browser.mobile && !Browser.tablet) {
                        imageUrl = vars_1.HOST_URL + '/bell/chrome-unblock.jpg';
                    }
                }
                else if (Browser.firefox)
                    imageUrl = vars_1.HOST_URL + '/bell/firefox-unblock.jpg';
                else if (Browser.safari)
                    imageUrl = vars_1.HOST_URL + '/bell/safari-unblock.jpg';
                var instructionsHtml = '';
                if (imageUrl) {
                    instructionsHtml = "\n\n            <a href=\"" + imageUrl + "\" target=\"_blank\"><img src=\"" + imageUrl + "\"></a></div>\n            ";
                }
                if ((Browser.mobile || Browser.tablet) && Browser.chrome) {
                    instructionsHtml = "\n            <ol>\n            <li>Access <strong>Settings</strong> by tapping the three menu dots <strong>\u22EE</strong></li>\n            <li>Click <strong>Site settings</strong> under Advanced.</li>\n            <li>Click <strong>Notifications</strong>.</li>\n            <li>Find and click this entry for this website.</li>\n            <li>Click <strong>Notifications</strong> and set it to <strong>Allow</strong>.</li>\n            </ol>\n          ";
                }
                contents = "\n                  <h1>" + _this.bell.text['dialog.blocked.title'] + "</h1>\n                  <div class=\"divider\"></div>\n                  <div class=\"instructions\">\n                  <p>" + _this.bell.text['dialog.blocked.message'] + "</p>\n                  " + instructionsHtml + "\n                  </div>\n                  " + footer + "\n                ";
            }
            utils_1.addDomElement(document.querySelector(_this.nestedContentSelector), 'beforeend', contents);
            _this.bell.setCustomColorsIfSpecified();
        });
    };
    return Dialog;
}(AnimatedElement_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Dialog;
//# sourceMappingURL=Dialog.js.map
});

;require.register("build/src/bell/Launcher.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require("../utils");
var log = require("loglevel");
var ActiveAnimatedElement_1 = require("./ActiveAnimatedElement");
var Launcher = (function (_super) {
    __extends(Launcher, _super);
    function Launcher(bell) {
        var _this = _super.call(this, '.onesignal-bell-launcher', 'onesignal-bell-launcher-active', null, null, 'onesignal-bell-launcher-inactive', 'hidden', 'active') || this;
        _this.bell = bell;
        _this.wasInactive = false;
        return _this;
    }
    Launcher.prototype.resize = function (size) {
        var _this = this;
        // If the size is the same, do nothing and resolve an empty promise
        if ((size === 'small' && utils_1.hasCssClass(this.element, 'onesignal-bell-launcher-sm')) ||
            (size === 'medium' && utils_1.hasCssClass(this.element, 'onesignal-bell-launcher-md')) ||
            (size === 'large' && utils_1.hasCssClass(this.element, 'onesignal-bell-launcher-lg'))) {
            return Promise.resolve(this);
        }
        utils_1.removeCssClass(this.element, 'onesignal-bell-launcher-sm');
        utils_1.removeCssClass(this.element, 'onesignal-bell-launcher-md');
        utils_1.removeCssClass(this.element, 'onesignal-bell-launcher-lg');
        if (size === 'small') {
            utils_1.addCssClass(this.element, 'onesignal-bell-launcher-sm');
        }
        else if (size === 'medium') {
            utils_1.addCssClass(this.element, 'onesignal-bell-launcher-md');
        }
        else if (size === 'large') {
            utils_1.addCssClass(this.element, 'onesignal-bell-launcher-lg');
        }
        else {
            throw new Error('Invalid OneSignal bell size ' + size);
        }
        if (!this.shown) {
            return Promise.resolve(this);
        }
        else {
            return new Promise(function (resolve) {
                // Once the launcher has finished shrinking down
                if (_this.targetTransitionEvents.length == 0) {
                    return resolve(_this);
                }
                else {
                    var timerId = setTimeout(function () {
                        log.debug("Launcher did not completely resize (state: " + _this.state + ", activeState: " + _this.activeState + ").");
                    }, _this.transitionCheckTimeout);
                    utils_1.once(_this.element, 'transitionend', function (event, destroyListenerFn) {
                        if (event.target === _this.element &&
                            utils_1.contains(_this.targetTransitionEvents, event.propertyName)) {
                            clearTimeout(timerId);
                            // Uninstall the event listener for transitionend
                            destroyListenerFn();
                            return resolve(_this);
                        }
                    }, true);
                }
            });
        }
    };
    Launcher.prototype.activateIfInactive = function () {
        if (this.inactive) {
            this.wasInactive = true;
            return this.activate();
        }
        else
            return utils_1.nothing();
    };
    Launcher.prototype.inactivateIfWasInactive = function () {
        if (this.wasInactive) {
            this.wasInactive = false;
            return this.inactivate();
        }
        else
            return utils_1.nothing();
    };
    Launcher.prototype.clearIfWasInactive = function () {
        this.wasInactive = false;
    };
    Launcher.prototype.inactivate = function () {
        var _this = this;
        return this.bell.message.hide()
            .then(function () {
            if (_this.bell.badge.content.length > 0) {
                return _this.bell.badge.hide()
                    .then(function () { return Promise.all([_super.prototype.inactivate.call(_this), _this.resize('small')]); })
                    .then(function () { return _this.bell.badge.show(); });
            }
            else {
                return Promise.all([_super.prototype.inactivate.call(_this), _this.resize('small')]);
            }
        });
    };
    Launcher.prototype.activate = function () {
        var _this = this;
        if (this.bell.badge.content.length > 0) {
            return this.bell.badge.hide()
                .then(function () { return Promise.all([_super.prototype.activate.call(_this), _this.resize(_this.bell.options.size)]); });
        }
        else {
            return Promise.all([_super.prototype.activate.call(this), this.resize(this.bell.options.size)]);
        }
    };
    return Launcher;
}(ActiveAnimatedElement_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Launcher;
//# sourceMappingURL=Launcher.js.map
});

;require.register("build/src/bell/Message.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require("../utils");
var log = require("loglevel");
var AnimatedElement_1 = require("./AnimatedElement");
var Bell_1 = require("./Bell");
var Message = (function (_super) {
    __extends(Message, _super);
    function Message(bell) {
        var _this = _super.call(this, '.onesignal-bell-launcher-message', 'onesignal-bell-launcher-message-opened', null, 'hidden', ['opacity', 'transform'], '.onesignal-bell-launcher-message-body') || this;
        _this.bell = bell;
        _this.contentType = '';
        _this.queued = [];
        return _this;
    }
    Object.defineProperty(Message, "TIMEOUT", {
        get: function () {
            return 2500;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Message, "TYPES", {
        get: function () {
            return {
                TIP: 'tip',
                MESSAGE: 'message',
                QUEUED: 'queued' // This message was a user-queued message
            };
        },
        enumerable: true,
        configurable: true
    });
    Message.prototype.display = function (type, content, duration) {
        var _this = this;
        if (duration === void 0) { duration = 0; }
        log.debug("Calling %cdisplay(" + type + ", " + content + ", " + duration + ").", utils_1.getConsoleStyle('code'));
        return (this.shown ? this.hide() : utils_1.nothing())
            .then(function () {
            _this.content = utils_1.decodeHtmlEntities(content);
            _this.contentType = type;
        })
            .then(function () {
            return _this.show();
        })
            .then(function () { return utils_1.delay(duration); })
            .then(function () {
            return _this.hide();
        })
            .then(function () {
            // Reset back to normal content type so stuff can show a gain
            _this.content = _this.getTipForState();
            _this.contentType = 'tip';
        });
    };
    Message.prototype.getTipForState = function () {
        if (this.bell.state === Bell_1.default.STATES.UNSUBSCRIBED)
            return this.bell.text['tip.state.unsubscribed'];
        else if (this.bell.state === Bell_1.default.STATES.SUBSCRIBED)
            return this.bell.text['tip.state.subscribed'];
        else if (this.bell.state === Bell_1.default.STATES.BLOCKED)
            return this.bell.text['tip.state.blocked'];
    };
    Message.prototype.enqueue = function (message, notify) {
        var _this = this;
        if (notify === void 0) { notify = false; }
        this.queued.push(utils_1.decodeHtmlEntities(message));
        return new Promise(function (resolve) {
            if (_this.bell.badge.shown) {
                _this.bell.badge.hide()
                    .then(function () { return _this.bell.badge.increment(); })
                    .then(function () { return _this.bell.badge.show(); })
                    .then(resolve);
            }
            else {
                _this.bell.badge.increment();
                if (_this.bell.initialized)
                    _this.bell.badge.show().then(resolve);
                else
                    resolve();
            }
        });
    };
    Message.prototype.dequeue = function (message) {
        var _this = this;
        var dequeuedMessage = this.queued.pop(message);
        return new Promise(function (resolve) {
            if (_this.bell.badge.shown) {
                _this.bell.badge.hide()
                    .then(function () { return _this.bell.badge.decrement(); })
                    .then(function (numMessagesLeft) {
                    if (numMessagesLeft > 0) {
                        return _this.bell.badge.show();
                    }
                    else {
                        return Promise.resolve(_this);
                    }
                })
                    .then(resolve(dequeuedMessage));
            }
            else {
                _this.bell.badge.decrement();
                resolve(dequeuedMessage);
            }
        });
    };
    return Message;
}(AnimatedElement_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Message;
//# sourceMappingURL=Message.js.map
});

;require.register("build/src/entry.js", function(exports, require, module) {
"use strict";
require('es6-promise').polyfill();
var Environment_1 = require("./Environment");
var utils_1 = require("./utils");
var log = require("loglevel");
if (Environment_1.default.isBrowser()) {
    utils_1.incrementSdkLoadCount();
    if (utils_1.getSdkLoadCount() > 1) {
        log.warn("OneSignal: The web push SDK is included more than once. For optimal performance, please include our " +
            "SDK only once on your page.");
        log.debug("OneSignal: Exiting from SDK initialization to prevent double-initialization errors. " +
            ("Occurred " + utils_1.getSdkLoadCount() + " times."));
    }
    else {
        // We're running in the host page, iFrame of the host page, or popup window
        // Load OneSignal's web SDK
        if (typeof OneSignal !== "undefined")
            var predefinedOneSignalPushes = OneSignal;
        var OneSignal = require('./OneSignal');
        window.OneSignal = OneSignal;
        if (predefinedOneSignalPushes)
            for (var i = 0; i < predefinedOneSignalPushes.length; i++)
                OneSignal.push(predefinedOneSignalPushes[i]);
    }
}
else if (Environment_1.default.isServiceWorker()) {
    // We're running as the service worker
    var ServiceWorker = require('./service-worker/ServiceWorker');
    window.ServiceWorker = ServiceWorker;
}
//# sourceMappingURL=entry.js.map
});

;require.register("build/src/errors/AlreadySubscribedError.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OneSignalError_1 = require("./OneSignalError");
var AlreadySubscribedError = (function (_super) {
    __extends(AlreadySubscribedError, _super);
    function AlreadySubscribedError() {
        return _super.call(this, 'This operation can only be performed when the user is not subscribed.') || this;
    }
    return AlreadySubscribedError;
}(OneSignalError_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AlreadySubscribedError;
//# sourceMappingURL=AlreadySubscribedError.js.map
});

;require.register("build/src/errors/InvalidArgumentError.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OneSignalError_1 = require("./OneSignalError");
var InvalidArgumentReason;
(function (InvalidArgumentReason) {
    InvalidArgumentReason[InvalidArgumentReason["Empty"] = 0] = "Empty";
    InvalidArgumentReason[InvalidArgumentReason["Malformed"] = 1] = "Malformed";
})(InvalidArgumentReason = exports.InvalidArgumentReason || (exports.InvalidArgumentReason = {}));
var InvalidArgumentError = (function (_super) {
    __extends(InvalidArgumentError, _super);
    function InvalidArgumentError(argName, reason) {
        var _this;
        switch (reason) {
            case InvalidArgumentReason.Empty:
                _this = _super.call(this, "Supply a non-empty value to '" + argName + "'.") || this;
                break;
            case InvalidArgumentReason.Malformed:
                _this = _super.call(this, "The value for '" + argName + "' was malformed.") || this;
                break;
        }
        _this.argument = argName;
        _this.reason = InvalidArgumentReason[reason];
        return _this;
    }
    return InvalidArgumentError;
}(OneSignalError_1.default));
exports.InvalidArgumentError = InvalidArgumentError;
//# sourceMappingURL=InvalidArgumentError.js.map
});

;require.register("build/src/errors/InvalidStateError.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OneSignalError_1 = require("./OneSignalError");
var PermissionPromptType_1 = require("../models/PermissionPromptType");
var InvalidStateReason;
(function (InvalidStateReason) {
    InvalidStateReason[InvalidStateReason["MissingAppId"] = 0] = "MissingAppId";
    InvalidStateReason[InvalidStateReason["RedundantPermissionMessage"] = 1] = "RedundantPermissionMessage";
    InvalidStateReason[InvalidStateReason["PushPermissionAlreadyGranted"] = 2] = "PushPermissionAlreadyGranted";
    InvalidStateReason[InvalidStateReason["UnsupportedEnvironment"] = 3] = "UnsupportedEnvironment";
})(InvalidStateReason = exports.InvalidStateReason || (exports.InvalidStateReason = {}));
var InvalidStateError = (function (_super) {
    __extends(InvalidStateError, _super);
    function InvalidStateError(reason, extra) {
        var _this;
        switch (reason) {
            case InvalidStateReason.MissingAppId:
                _this = _super.call(this, "Missing required app ID.") || this;
                break;
            case InvalidStateReason.RedundantPermissionMessage:
                var extraInfo = '';
                if (extra.permissionPromptType)
                    extraInfo = "(" + PermissionPromptType_1.PermissionPromptType[extra.permissionPromptType] + ")";
                _this = _super.call(this, "Another permission message " + extraInfo + " is being displayed.") || this;
                break;
            case InvalidStateReason.PushPermissionAlreadyGranted:
                _this = _super.call(this, "Push permission has already been granted.") || this;
                break;
            case InvalidStateReason.UnsupportedEnvironment:
                _this = _super.call(this, "The current environment does not support this operation.") || this;
                break;
        }
        _this.reason = InvalidStateReason[reason];
        return _this;
    }
    return InvalidStateError;
}(OneSignalError_1.default));
exports.InvalidStateError = InvalidStateError;
//# sourceMappingURL=InvalidStateError.js.map
});

;require.register("build/src/errors/InvalidUuidError.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OneSignalError_1 = require("./OneSignalError");
var PushNotSupportedError = (function (_super) {
    __extends(PushNotSupportedError, _super);
    function PushNotSupportedError(uuid) {
        return _super.call(this, "'" + uuid + "' is not a valid UUID") || this;
    }
    return PushNotSupportedError;
}(OneSignalError_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PushNotSupportedError;
//# sourceMappingURL=InvalidUuidError.js.map
});

;require.register("build/src/errors/NotSubscribedError.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OneSignalError_1 = require("./OneSignalError");
var NotSubscribedReason;
(function (NotSubscribedReason) {
    NotSubscribedReason[NotSubscribedReason["Unknown"] = 0] = "Unknown";
    NotSubscribedReason[NotSubscribedReason["NoDeviceId"] = 1] = "NoDeviceId";
    NotSubscribedReason[NotSubscribedReason["OptedOut"] = 2] = "OptedOut";
})(NotSubscribedReason = exports.NotSubscribedReason || (exports.NotSubscribedReason = {}));
var NotSubscribedError = (function (_super) {
    __extends(NotSubscribedError, _super);
    function NotSubscribedError(reason) {
        var _this;
        switch (reason) {
            case NotSubscribedReason.Unknown || NotSubscribedReason.NoDeviceId:
                _this = _super.call(this, 'This operation can only be performed after the user is subscribed.') || this;
                break;
            case NotSubscribedReason.OptedOut:
                _this = _super.call(this, 'The user has manually opted out of receiving of notifications. This operation can only be performed after the user is fully resubscribed.') || this;
                break;
        }
        _this.reason = NotSubscribedReason[reason];
        return _this;
    }
    return NotSubscribedError;
}(OneSignalError_1.default));
exports.NotSubscribedError = NotSubscribedError;
//# sourceMappingURL=NotSubscribedError.js.map
});

;require.register("build/src/errors/OneSignalError.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ExtendableError = require("es6-error");
var OneSignalError = (function (_super) {
    __extends(OneSignalError, _super);
    function OneSignalError(message) {
        return _super.call(this, message) || this;
    }
    return OneSignalError;
}(ExtendableError));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OneSignalError;
//# sourceMappingURL=OneSignalError.js.map
});

;require.register("build/src/errors/PermissionMessageDismissedError.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OneSignalError_1 = require("./OneSignalError");
var PermissionMessageDismissedError = (function (_super) {
    __extends(PermissionMessageDismissedError, _super);
    function PermissionMessageDismissedError() {
        return _super.call(this, 'The permission message was previously dismissed.') || this;
    }
    return PermissionMessageDismissedError;
}(OneSignalError_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PermissionMessageDismissedError;
//# sourceMappingURL=PermissionMessageDismissedError.js.map
});

;require.register("build/src/errors/PushNotSupportedError.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OneSignalError_1 = require("./OneSignalError");
var PushNotSupportedError = (function (_super) {
    __extends(PushNotSupportedError, _super);
    function PushNotSupportedError() {
        return _super.call(this, 'Push notifications are not supported.') || this;
    }
    return PushNotSupportedError;
}(OneSignalError_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PushNotSupportedError;
//# sourceMappingURL=PushNotSupportedError.js.map
});

;require.register("build/src/errors/PushPermissionNotGrantedError.js", function(exports, require, module) {
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OneSignalError_1 = require("./OneSignalError");
var PushPermissionNotGrantedError = (function (_super) {
    __extends(PushPermissionNotGrantedError, _super);
    function PushPermissionNotGrantedError() {
        return _super.call(this, "The push permission was not granted.") || this;
    }
    return PushPermissionNotGrantedError;
}(OneSignalError_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PushPermissionNotGrantedError;
//# sourceMappingURL=PushPermissionNotGrantedError.js.map
});

;require.register("build/src/helpers/EventHelper.js", function(exports, require, module) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var OneSignalApi_1 = require("../OneSignalApi");
var log = require("loglevel");
var LimitStore_1 = require("../LimitStore");
var Event_1 = require("../Event");
var Database_1 = require("../Database");
var utils_1 = require("../utils");
var MainHelper_1 = require("./MainHelper");
var SubscriptionHelper_1 = require("./SubscriptionHelper");
var EventHelper = (function () {
    function EventHelper() {
    }
    EventHelper.onNotificationPermissionChange = function (event) {
        EventHelper.checkAndTriggerSubscriptionChanged();
    };
    EventHelper.onInternalSubscriptionSet = function (optedOut) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                LimitStore_1.default.put('subscription.optedOut', optedOut);
                return [2 /*return*/];
            });
        });
    };
    EventHelper.checkAndTriggerSubscriptionChanged = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pushEnabled, appState, lastKnownPushEnabled, didStateChange;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        utils_1.logMethodCall('checkAndTriggerSubscriptionChanged');
                        return [4 /*yield*/, OneSignal.isPushNotificationsEnabled()];
                    case 1:
                        pushEnabled = _a.sent();
                        return [4 /*yield*/, Database_1.default.getAppState()];
                    case 2:
                        appState = _a.sent();
                        lastKnownPushEnabled = appState.lastKnownPushEnabled;
                        didStateChange = (lastKnownPushEnabled === null || pushEnabled !== lastKnownPushEnabled);
                        if (!didStateChange)
                            return [2 /*return*/];
                        log.info("The user's subscription state changed from " +
                            ((lastKnownPushEnabled === null ? '(not stored)' : lastKnownPushEnabled) + " \u27F6 " + pushEnabled));
                        appState.lastKnownPushEnabled = pushEnabled;
                        return [4 /*yield*/, Database_1.default.setAppState(appState)];
                    case 3:
                        _a.sent();
                        EventHelper.triggerSubscriptionChanged(pushEnabled);
                        return [2 /*return*/];
                }
            });
        });
    };
    EventHelper._onSubscriptionChanged = function (newSubscriptionState) {
        if (OneSignal.__doNotShowWelcomeNotification) {
            log.debug('Not showing welcome notification because user state was reset.');
            return;
        }
        if (newSubscriptionState === true) {
            Promise.all([
                OneSignal.getUserId(),
                MainHelper_1.default.getAppId()
            ])
                .then(function (_a) {
                var userId = _a[0], appId = _a[1];
                var welcome_notification_opts = OneSignal.config['welcomeNotification'];
                var welcome_notification_disabled = ((welcome_notification_opts !== undefined) &&
                    (welcome_notification_opts['disable'] === true));
                var title = ((welcome_notification_opts !== undefined) &&
                    (welcome_notification_opts['title'] !== undefined) &&
                    (welcome_notification_opts['title'] !== null)) ? welcome_notification_opts['title'] : '';
                var message = ((welcome_notification_opts !== undefined) &&
                    (welcome_notification_opts['message'] !== undefined) &&
                    (welcome_notification_opts['message'] !== null) &&
                    (welcome_notification_opts['message'].length > 0)) ?
                    welcome_notification_opts['message'] :
                    'Thanks for subscribing!';
                var unopenableWelcomeNotificationUrl = new URL(location.href).origin + '?_osp=do_not_open';
                var url = (welcome_notification_opts &&
                    welcome_notification_opts['url'] &&
                    (welcome_notification_opts['url'].length > 0)) ?
                    welcome_notification_opts['url'] :
                    unopenableWelcomeNotificationUrl;
                title = utils_1.decodeHtmlEntities(title);
                message = utils_1.decodeHtmlEntities(message);
                if (!welcome_notification_disabled) {
                    log.debug('Sending welcome notification.');
                    OneSignalApi_1.default.sendNotification(appId, [userId], { 'en': title }, { 'en': message }, url, null, { __isOneSignalWelcomeNotification: true }, undefined);
                    Event_1.default.trigger(OneSignal.EVENTS.WELCOME_NOTIFICATION_SENT, { title: title, message: message, url: url });
                }
            });
        }
    };
    EventHelper._onDbValueSet = function (info) {
        /*
         For HTTPS sites, this is how the subscription change event gets fired.
         For HTTP sites, leaving this enabled fires the subscription change event twice. The first event is from Postmam
         remotely re-triggering the db.set event to notify the host page that the popup set the user ID in the db. The second
         event is from Postmam remotely re-triggering the subscription.changed event which is also fired from the popup.
         */
        if (info.type === 'userId' && !SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
            EventHelper.checkAndTriggerSubscriptionChanged();
        }
    };
    EventHelper.onDatabaseRebuilt = function () {
        OneSignal._isNewVisitor = true;
    };
    EventHelper.triggerNotificationPermissionChanged = function (updateIfIdentical) {
        if (updateIfIdentical === void 0) { updateIfIdentical = false; }
        var newPermission, isUpdating;
        return Promise.all([
            OneSignal.getNotificationPermission(),
            Database_1.default.get('Options', 'notificationPermission')
        ])
            .then(function (_a) {
            var currentPermission = _a[0], previousPermission = _a[1];
            newPermission = currentPermission;
            isUpdating = (currentPermission !== previousPermission || updateIfIdentical);
            if (isUpdating) {
                return Database_1.default.put('Options', { key: 'notificationPermission', value: currentPermission });
            }
        })
            .then(function () {
            if (isUpdating) {
                Event_1.default.trigger(OneSignal.EVENTS.NATIVE_PROMPT_PERMISSIONCHANGED, {
                    to: newPermission
                });
            }
        });
    };
    EventHelper.triggerSubscriptionChanged = function (to) {
        Event_1.default.trigger(OneSignal.EVENTS.SUBSCRIPTION_CHANGED, to);
    };
    /**
     * When notifications are clicked, because the site isn't open, the notification is stored in the database. The next
     * time the page opens, the event is triggered if its less than 5 minutes (usually page opens instantly from click).
     *
     * This method is fired for both HTTPS and HTTP sites, so for HTTP sites, the host URL needs to be used, not the
     * subdomain.onesignal.com URL.
     */
    EventHelper.fireStoredNotificationClicks = function (url) {
        if (url === void 0) { url = document.URL; }
        return __awaiter(this, void 0, void 0, function () {
            var appState, pageClickedNotifications, notification, timestamp, minutesSinceNotificationClicked;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Database_1.default.getAppState()];
                    case 1:
                        appState = _a.sent();
                        pageClickedNotifications = appState.clickedNotifications[url];
                        if (pageClickedNotifications) {
                            // Remove the clicked notification; we've processed it now
                            appState.clickedNotifications[url] = null;
                            Database_1.default.setAppState(appState);
                            notification = pageClickedNotifications.data, timestamp = pageClickedNotifications.timestamp;
                            if (timestamp) {
                                minutesSinceNotificationClicked = (Date.now() - timestamp) / 1000 / 60;
                                if (minutesSinceNotificationClicked > 5)
                                    return [2 /*return*/];
                            }
                            Event_1.default.trigger(OneSignal.EVENTS.NOTIFICATION_CLICKED, notification);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return EventHelper;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EventHelper;
//# sourceMappingURL=EventHelper.js.map
});

;require.register("build/src/helpers/HttpHelper.js", function(exports, require, module) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var vars_1 = require("../vars");
var Environment_1 = require("../Environment");
var log = require("loglevel");
var Event_1 = require("../Event");
var Database_1 = require("../Database");
var utils_1 = require("../utils");
var objectAssign = require("object-assign");
var Postmam_1 = require("../Postmam");
var MainHelper_1 = require("./MainHelper");
var ServiceWorkerHelper_1 = require("./ServiceWorkerHelper");
var IndexedDb_1 = require("../IndexedDb");
var InitHelper_1 = require("./InitHelper");
var EventHelper_1 = require("./EventHelper");
var SubscriptionHelper_1 = require("./SubscriptionHelper");
var InvalidStateError_1 = require("../errors/InvalidStateError");
var HttpHelper = (function () {
    function HttpHelper() {
    }
    HttpHelper.isShowingHttpPermissionRequest = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!SubscriptionHelper_1.default.isUsingSubscriptionWorkaround())
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                OneSignal.iframePostmam.message(OneSignal.POSTMAM_COMMANDS.IS_SHOWING_HTTP_PERMISSION_REQUEST, null, function (reply) {
                                    resolve(reply.data);
                                });
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/, OneSignal._showingHttpPermissionRequest];
                }
            });
        });
    };
    // Http only - Only called from iframe's init.js
    HttpHelper.initHttp = function (options) {
        var _this = this;
        log.debug("Called %cinitHttp(" + JSON.stringify(options, null, 4) + ")", utils_1.getConsoleStyle('code'));
        if (!utils_1.isPushNotificationsSupported()) {
            log.warn('OneSignal: Push notifications are not supported.');
            return;
        }
        ServiceWorkerHelper_1.default.applyServiceWorkerEnvPrefixes();
        var creator = window.opener || window.parent;
        if (creator == window) {
            document.write("<span style='font-size: 14px; color: red; font-family: sans-serif;'>OneSignal: This page cannot be directly opened, and \nmust be opened as a result of a subscription call.</span>");
            return;
        }
        // Forgetting this makes all our APIs stall forever because the promises expect this to be true
        OneSignal.config = {};
        OneSignal.initialized = true;
        var sendToOrigin = options.origin;
        var receiveFromOrigin = options.origin;
        var shouldWipeData = utils_1.getUrlQueryParam('dangerouslyWipeData') || (window.__POSTDATA && window.__POSTDATA['dangerouslyWipeData'] === true);
        var preinitializePromise = Promise.resolve();
        if (shouldWipeData && Environment_1.default.isIframe()) {
            OneSignal.LOGGING = true;
            // Wipe IndexedDB and unsubscribe from push/unregister the service worker for testing.
            log.warn('Wiping away previous HTTP data (called from HTTP iFrame).');
            preinitializePromise = utils_1.wipeLocalIndexedDb()
                .then(function () { return utils_1.unsubscribeFromPush(); })
                .then(function () { return IndexedDb_1.default.put('Ids', { type: 'appId', id: options.appId }); });
        }
        OneSignal._thisIsThePopup = options.isPopup;
        if (Environment_1.default.isPopup() || OneSignal._thisIsThePopup) {
            OneSignal.popupPostmam = new Postmam_1.default(window.opener, sendToOrigin, receiveFromOrigin);
            // The host page will receive this event, and then call connect()
            OneSignal.popupPostmam.postMessage(OneSignal.POSTMAM_COMMANDS.POPUP_BEGIN_MESSAGEPORT_COMMS, null);
            OneSignal.popupPostmam.listen();
            OneSignal.popupPostmam.on('connect', function (e) {
                log.debug("(" + Environment_1.default.getEnv() + ") The host page is now ready to receive commands from the HTTP popup.");
                Event_1.default.trigger('httpInitialize');
            });
        }
        OneSignal._thisIsTheModal = options.isModal;
        if (OneSignal._thisIsTheModal) {
            OneSignal.modalPostmam = new Postmam_1.default(window.parent, sendToOrigin, receiveFromOrigin);
        }
        OneSignal.iframePostmam = new Postmam_1.default(window, sendToOrigin, receiveFromOrigin);
        OneSignal.iframePostmam.listen();
        OneSignal.iframePostmam.on(OneSignal.POSTMAM_COMMANDS.CONNECTED, function (e) {
            log.debug("(" + Environment_1.default.getEnv() + ") Fired Postmam connect event!");
        });
        OneSignal.iframePostmam.on(OneSignal.POSTMAM_COMMANDS.REMOTE_NOTIFICATION_PERMISSION, function (message) {
            OneSignal.getNotificationPermission()
                .then(function (permission) { return message.reply(permission); });
            return false;
        });
        OneSignal.iframePostmam.on(OneSignal.POSTMAM_COMMANDS.REMOTE_DATABASE_GET, function (message) {
            // retrievals is an array of key-value pairs e.g. [{table: 'Ids', keys: 'userId'}, {table: 'Ids', keys: 'registrationId'}]
            var retrievals = message.data;
            var retrievalOpPromises = [];
            for (var _i = 0, retrievals_1 = retrievals; _i < retrievals_1.length; _i++) {
                var retrieval = retrievals_1[_i];
                var table = retrieval.table, key = retrieval.key;
                retrievalOpPromises.push(Database_1.default.get(table, key));
            }
            Promise.all(retrievalOpPromises)
                .then(function (results) { return message.reply(results); });
            return false;
        });
        OneSignal.iframePostmam.on(OneSignal.POSTMAM_COMMANDS.REMOTE_DATABASE_PUT, function (message) {
            // insertions is an array of key-value pairs e.g. [table: {'Options': keypath: {key: persistNotification, value: '...'}}, {table: 'Ids', keypath: {type: 'userId', id: '...'}]
            // It's formatted that way because our IndexedDB database is formatted that way
            var insertions = message.data;
            var insertionOpPromises = [];
            for (var _i = 0, insertions_1 = insertions; _i < insertions_1.length; _i++) {
                var insertion = insertions_1[_i];
                var table = insertion.table, keypath = insertion.keypath;
                insertionOpPromises.push(Database_1.default.put(table, keypath));
            }
            Promise.all(insertionOpPromises)
                .then(function (results) { return message.reply(OneSignal.POSTMAM_COMMANDS.REMOTE_OPERATION_COMPLETE); });
            return false;
        });
        OneSignal.iframePostmam.on(OneSignal.POSTMAM_COMMANDS.REMOTE_DATABASE_REMOVE, function (message) {
            // removals is an array of key-value pairs e.g. [table: {'Options': keypath: {key: persistNotification, value: '...'}}, {table: 'Ids', keypath: {type: 'userId', id: '...'}]
            // It's formatted that way because our IndexedDB database is formatted that way
            var removals = message.data;
            var removalOpPromises = [];
            for (var _i = 0, removals_1 = removals; _i < removals_1.length; _i++) {
                var removal = removals_1[_i];
                var table = removal.table, keypath = removal.keypath;
                removalOpPromises.push(Database_1.default.remove(table, keypath));
            }
            Promise.all(removalOpPromises)
                .then(function (results) { return message.reply(OneSignal.POSTMAM_COMMANDS.REMOTE_OPERATION_COMPLETE); });
            return false;
        });
        OneSignal.iframePostmam.on(OneSignal.POSTMAM_COMMANDS.IFRAME_POPUP_INITIALIZE, function (message) {
            log.info("(" + Environment_1.default.getEnv() + ") The iFrame has just received initOptions from the host page!");
            preinitializePromise.then(function () {
                OneSignal.config = objectAssign(message.data.hostInitOptions, options, {
                    defaultUrl: message.data.defaultUrl,
                    pageUrl: message.data.pageUrl,
                    pageTitle: message.data.pageTitle
                });
                InitHelper_1.default.installNativePromptPermissionChangedHook();
                var opPromises = [];
                if (options.continuePressed) {
                    opPromises.push(OneSignal.setSubscription(true));
                }
                // 3/30/16: For HTTP sites, put the host page URL as default URL if one doesn't exist already
                opPromises.push(Database_1.default.get('Options', 'defaultUrl').then(function (defaultUrl) {
                    if (!defaultUrl) {
                        return Database_1.default.put('Options', { key: 'defaultUrl', value: new URL(OneSignal.config.defaultUrl).origin });
                    }
                }));
                /**
                 * When a user is on http://example.com and receives a notification, we want to open a new window only if the
                 * notification's URL is different from http://example.com. The service worker, which only controls
                 * subdomain.onesignal.com, doesn't know that the host URL is http://example.com. Although defaultUrl above
                 * sets the HTTP's origin, this can be modified if users call setDefaultTitle(). lastKnownHostUrl therefore
                 * stores the last visited full page URL.
                 */
                opPromises.push(Database_1.default.put('Options', { key: 'lastKnownHostUrl', value: OneSignal.config.pageUrl }));
                opPromises.push(InitHelper_1.default.initSaveState());
                opPromises.push(InitHelper_1.default.storeInitialValues());
                opPromises.push(InitHelper_1.default.saveInitOptions());
                Promise.all(opPromises)
                    .then(function () {
                    /* 3/20/16: In the future, if navigator.serviceWorker.ready is unusable inside of an insecure iFrame host, adding a message event listener will still work. */
                    //if (navigator.serviceWorker) {
                    //log.info('We have added an event listener for service worker messages.', Environment.getEnv());
                    //navigator.serviceWorker.addEventListener('message', function(event) {
                    //  log.info('Wow! We got a message!', event);
                    //});
                    //}
                    if (navigator.serviceWorker && window.location.protocol === 'https:') {
                        try {
                            MainHelper_1.default.establishServiceWorkerChannel();
                        }
                        catch (e) {
                            log.error("Error interacting with Service Worker inside an HTTP-hosted iFrame:", e);
                        }
                    }
                    message.reply(OneSignal.POSTMAM_COMMANDS.REMOTE_OPERATION_COMPLETE);
                });
            });
        });
        OneSignal.iframePostmam.on(OneSignal.POSTMAM_COMMANDS.UNSUBSCRIBE_FROM_PUSH, function (message) {
            log.debug(Environment_1.default.getEnv() + " (Expected iFrame) has received the unsubscribe from push method.");
            utils_1.unsubscribeFromPush()
                .then(function () { return message.reply(OneSignal.POSTMAM_COMMANDS.REMOTE_OPERATION_COMPLETE); })
                .catch(function (e) { return log.debug('Failed to unsubscribe from push remotely.', e); });
        });
        OneSignal.iframePostmam.on(OneSignal.POSTMAM_COMMANDS.SHOW_HTTP_PERMISSION_REQUEST, function (message) {
            log.debug(Environment_1.default.getEnv() + " Calling showHttpPermissionRequest() inside the iFrame, proxied from host.");
            var options = {};
            if (message.data) {
                options = message.data;
            }
            log.debug(Environment_1.default.getEnv() + 'HTTP permission request showing, message data:', message);
            OneSignal.showHttpPermissionRequest(options)
                .then(function (result) {
                message.reply({ status: 'resolve', result: result });
            })
                .catch(function (e) {
                if (e && e.reason === InvalidStateError_1.InvalidStateReason[InvalidStateError_1.InvalidStateReason.PushPermissionAlreadyGranted]) {
                }
                else {
                    message.reply({ status: 'reject', result: e });
                }
            });
        });
        OneSignal.iframePostmam.on(OneSignal.POSTMAM_COMMANDS.IS_SHOWING_HTTP_PERMISSION_REQUEST, function (message) { return __awaiter(_this, void 0, void 0, function () {
            var isShowingHttpPermReq;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, HttpHelper.isShowingHttpPermissionRequest()];
                    case 1:
                        isShowingHttpPermReq = _a.sent();
                        message.reply(isShowingHttpPermReq);
                        return [2 /*return*/, false];
                }
            });
        }); });
        if (Environment_1.default.isIframe()) {
            Event_1.default.trigger('httpInitialize');
        }
    };
    HttpHelper.initPopup = function () {
        OneSignal.config = {};
        OneSignal.initialized = true;
        ServiceWorkerHelper_1.default.applyServiceWorkerEnvPrefixes();
        // Do not register OneSignalSDKUpdaterWorker.js for HTTP popup sites; the file does not exist
        OneSignal.isPushNotificationsEnabled(function (isEnabled) {
            if (!isEnabled) {
                navigator.serviceWorker.register(OneSignal.SERVICE_WORKER_PATH, OneSignal.SERVICE_WORKER_PARAM).then(SubscriptionHelper_1.default.enableNotifications, ServiceWorkerHelper_1.default.registerError);
            }
            else {
                window.close();
            }
        });
    };
    /**
     * Loads the iFrame with the OneSignal subdomain on the page so that subsequent SDK tasks can run on the service-worker-controlled origin.
     */
    HttpHelper.loadSubdomainIFrame = function () {
        var subdomainLoadPromise = new Promise(function (resolve, reject) {
            log.debug("Called %cloadSubdomainIFrame()", utils_1.getConsoleStyle('code'));
            var dangerouslyWipeData = OneSignal.config.dangerouslyWipeData;
            if (dangerouslyWipeData) {
                OneSignal.iframeUrl += '?&dangerouslyWipeData=true';
            }
            log.debug('Loading subdomain iFrame:', OneSignal.iframeUrl);
            var iframe = MainHelper_1.default.createHiddenDomIFrame(OneSignal.iframeUrl);
            iframe.onload = function () {
                log.info('iFrame onload event was called for:', iframe.src);
                var sendToOrigin = "https://" + OneSignal.config.subdomainName + ".onesignal.com";
                if (Environment_1.default.isDev()) {
                    sendToOrigin = vars_1.DEV_FRAME_HOST;
                }
                else if (Environment_1.default.isStaging()) {
                    sendToOrigin = vars_1.STAGING_FRAME_HOST;
                }
                var receiveFromOrigin = sendToOrigin;
                OneSignal.iframePostmam = new Postmam_1.default(iframe.contentWindow, sendToOrigin, receiveFromOrigin);
                OneSignal.iframePostmam.connect();
                OneSignal.iframePostmam.on('connect', function (e) {
                    log.debug("(" + Environment_1.default.getEnv() + ") Fired Postmam connect event!");
                    Promise.all([
                        Database_1.default.get('Options', 'defaultUrl'),
                        Database_1.default.get('Options', 'defaultTitle')
                    ])
                        .then(function (_a) {
                        var defaultUrlResult = _a[0], defaultTitleResult = _a[1];
                        if (!defaultUrlResult) {
                            var defaultUrl = location.href;
                        }
                        else {
                            var defaultUrl = defaultUrlResult;
                        }
                        if (!defaultTitleResult) {
                            var defaultTitle = document.title;
                        }
                        else {
                            var defaultTitle = defaultTitleResult;
                        }
                        OneSignal.iframePostmam.message(OneSignal.POSTMAM_COMMANDS.IFRAME_POPUP_INITIALIZE, {
                            hostInitOptions: JSON.parse(JSON.stringify(OneSignal.config)),
                            defaultUrl: defaultUrl,
                            pageUrl: window.location.href,
                            pageTitle: defaultTitle,
                        }, function (reply) {
                            if (reply.data === OneSignal.POSTMAM_COMMANDS.REMOTE_OPERATION_COMPLETE) {
                                resolve();
                                Event_1.default.trigger(OneSignal.EVENTS.SDK_INITIALIZED);
                            }
                            return false;
                        });
                    });
                });
                OneSignal.iframePostmam.on(OneSignal.POSTMAM_COMMANDS.REMOTE_RETRIGGER_EVENT, function (message) {
                    // e.g. { eventName: 'subscriptionChange', eventData: true}
                    var _a = message.data, eventName = _a.eventName, eventData = _a.eventData;
                    Event_1.default.trigger(eventName, eventData, message.source);
                    return false;
                });
                OneSignal.iframePostmam.on(OneSignal.POSTMAM_COMMANDS.REMOTE_NOTIFICATION_PERMISSION_CHANGED, function (message) {
                    var forceUpdatePermission = message.data.forceUpdatePermission;
                    EventHelper_1.default.triggerNotificationPermissionChanged(forceUpdatePermission);
                    return false;
                });
                OneSignal.iframePostmam.on(OneSignal.POSTMAM_COMMANDS.REQUEST_HOST_URL, function (message) {
                    message.reply(location.href);
                    return false;
                });
            };
            OneSignal._sessionIframeAdded = true;
        });
        return utils_1.executeAndTimeoutPromiseAfter(subdomainLoadPromise, 15000)
            .catch(function () { return log.warn("OneSignal: Could not load iFrame with URL " + OneSignal.iframeUrl + ". Please check that your 'subdomainName' matches that on your OneSignal Chrome platform settings. Also please check that your Site URL on your Chrome platform settings is a valid reachable URL pointing to your site."); });
    };
    HttpHelper.loadPopup = function (options) {
        // Important: Don't use any promises until the window is opened, otherwise the popup will be blocked
        var sendToOrigin = "https://" + OneSignal.config.subdomainName + ".onesignal.com";
        if (Environment_1.default.isDev()) {
            sendToOrigin = vars_1.DEV_FRAME_HOST;
        }
        var receiveFromOrigin = sendToOrigin;
        var dangerouslyWipeData = OneSignal.config.dangerouslyWipeData;
        var postData = objectAssign({}, MainHelper_1.default.getPromptOptionsPostHash(), {
            promptType: 'popup',
            parentHostname: encodeURIComponent(location.hostname)
        });
        if (options && options.autoAccept) {
            postData['autoAccept'] = true;
        }
        log.info('loadPopup(options):', options);
        if (options && options.httpPermissionRequest) {
            postData['httpPermissionRequest'] = true;
            var overrides = {
                childWidth: 250,
                childHeight: 150,
                left: -99999999,
                top: 9999999,
            };
        }
        if (dangerouslyWipeData) {
            postData['dangerouslyWipeData'] = true;
        }
        log.info("Opening popup window to " + OneSignal.popupUrl + " with POST data:", OneSignal.popupUrl);
        var subdomainPopup = MainHelper_1.default.openSubdomainPopup(OneSignal.popupUrl, postData, overrides);
        if (subdomainPopup) {
            subdomainPopup.blur();
            window.focus();
        }
        OneSignal.popupPostmam = new Postmam_1.default(subdomainPopup, sendToOrigin, receiveFromOrigin);
        OneSignal.popupPostmam.startPostMessageReceive();
        OneSignal.popupPostmam.on(OneSignal.POSTMAM_COMMANDS.POPUP_BEGIN_MESSAGEPORT_COMMS, function (message) {
            // e.g. { eventName: 'subscriptionChange', eventData: true}
            log.debug("(Popup Postmam) (" + Environment_1.default.getEnv() + ") Got direct postMessage() event from popup event to begin MessagePort comms.");
            OneSignal.popupPostmam.connect();
            return false;
        });
        OneSignal.popupPostmam.once(OneSignal.POSTMAM_COMMANDS.POPUP_LOADED, function (message) {
            Event_1.default.trigger('popupLoad');
        });
        OneSignal.popupPostmam.once(OneSignal.POSTMAM_COMMANDS.POPUP_ACCEPTED, function (message) {
            MainHelper_1.default.triggerCustomPromptClicked('granted');
        });
        OneSignal.popupPostmam.once(OneSignal.POSTMAM_COMMANDS.POPUP_REJECTED, function (message) {
            MainHelper_1.default.triggerCustomPromptClicked('denied');
        });
        OneSignal.popupPostmam.once(OneSignal.POSTMAM_COMMANDS.POPUP_CLOSING, function (message) {
            log.info('Detected popup is closing.');
            Event_1.default.trigger(OneSignal.EVENTS.POPUP_CLOSING);
            OneSignal.popupPostmam.destroy();
        });
        OneSignal.popupPostmam.once(OneSignal.POSTMAM_COMMANDS.BEGIN_BROWSING_SESSION, function (message) {
            log.debug(Environment_1.default.getEnv() + " Marking current session as a continuing browsing session.");
            MainHelper_1.default.beginTemporaryBrowserSession();
        });
        OneSignal.popupPostmam.once(OneSignal.POSTMAM_COMMANDS.WINDOW_TIMEOUT, function (message) {
            log.debug(Environment_1.default.getEnv() + " Popup window timed out and was closed.");
            Event_1.default.trigger(OneSignal.EVENTS.POPUP_WINDOW_TIMEOUT);
        });
        OneSignal.popupPostmam.once(OneSignal.POSTMAM_COMMANDS.FINISH_REMOTE_REGISTRATION, function (message) {
            log.debug(Environment_1.default.getEnv() + " Finishing HTTP popup registration inside the iFrame, sent from popup.");
            message.reply({ progress: true });
            MainHelper_1.default.getAppId()
                .then(function (appId) {
                EventHelper_1.default.triggerNotificationPermissionChanged(window.Notification.permission);
                OneSignal.popupPostmam.stopPostMessageReceive();
                MainHelper_1.default.registerWithOneSignal(appId, message.data.subscriptionInfo)
                    .then(function () { return EventHelper_1.default.checkAndTriggerSubscriptionChanged(); });
            });
        });
    };
    return HttpHelper;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HttpHelper;
//# sourceMappingURL=HttpHelper.js.map
});

;require.register("build/src/helpers/InitHelper.js", function(exports, require, module) {
"use strict";
var vars_1 = require("../vars");
var Environment_1 = require("../Environment");
var log = require("loglevel");
var LimitStore_1 = require("../LimitStore");
var Event_1 = require("../Event");
var Database_1 = require("../Database");
var Browser = require("bowser");
var utils_1 = require("../utils");
var Postmam_1 = require("../Postmam");
var MainHelper_1 = require("./MainHelper");
var ServiceWorkerHelper_1 = require("./ServiceWorkerHelper");
var SubscriptionHelper_1 = require("./SubscriptionHelper");
var EventHelper_1 = require("./EventHelper");
var InvalidStateError_1 = require("../errors/InvalidStateError");
var AlreadySubscribedError_1 = require("../errors/AlreadySubscribedError");
var InitHelper = (function () {
    function InitHelper() {
    }
    InitHelper.storeInitialValues = function () {
        return Promise.all([
            OneSignal.isPushNotificationsEnabled(),
            OneSignal.getNotificationPermission(),
            OneSignal.getUserId(),
            OneSignal.isOptedOut()
        ])
            .then(function (_a) {
            var isPushEnabled = _a[0], notificationPermission = _a[1], userId = _a[2], isOptedOut = _a[3];
            LimitStore_1.default.put('subscription.optedOut', isOptedOut);
            return Promise.all([
                Database_1.default.put('Options', { key: 'isPushEnabled', value: isPushEnabled }),
                Database_1.default.put('Options', {
                    key: 'notificationPermission',
                    value: notificationPermission
                })
            ]);
        });
    };
    /**
     * This event occurs after init.
     * For HTTPS sites, this event is called after init.
     * For HTTP sites, this event is called after the iFrame is created, and a message is received from the iFrame signaling cross-origin messaging is ready.
     * @private
     */
    InitHelper.onSdkInitialized = function () {
        // Store initial values of notification permission, user ID, and manual subscription status
        // This is done so that the values can be later compared to see if anything changed
        // This is done here for HTTPS, it is done after the call to _addSessionIframe in sessionInit for HTTP sites, since the iframe is needed for communication
        InitHelper.storeInitialValues();
        InitHelper.installNativePromptPermissionChangedHook();
        if (navigator.serviceWorker && window.location.protocol === 'https:') {
            navigator.serviceWorker.getRegistration()
                .then(function (registration) {
                if (registration && registration.active) {
                    MainHelper_1.default.establishServiceWorkerChannel(registration);
                }
            })
                .catch(function (e) {
                if (e.code === 9) {
                    if (location.protocol === 'http:' || Environment_1.default.isIframe()) {
                        // This site is an HTTP site with an <iframe>
                        // We can no longer register service workers since Chrome 42
                        log.debug("Expected error getting service worker registration on " + location.href + ":", e);
                    }
                }
                else {
                    log.error("Error getting Service Worker registration on " + location.href + ":", e);
                }
            });
        }
        MainHelper_1.default.showNotifyButton();
        if (Browser.safari && OneSignal.config.autoRegister === false) {
            OneSignal.isPushNotificationsEnabled(function (enabled) {
                if (enabled) {
                    /*  The user is on Safari and *specifically* set autoRegister to false.
                     The normal case for a user on Safari is to not set anything related to autoRegister.
                     With autoRegister false, we don't automatically show the permission prompt on Safari.
                     However, if push notifications are already enabled, we're actually going to make the same
                     subscribe call and register the device token, because this will return the same device
                     token and allow us to update the user's session count and last active.
                     For sites that omit autoRegister, autoRegister is assumed to be true. For Safari, the session count
                     and last active is updated from this registration call.
                     */
                    InitHelper.sessionInit({ __sdkCall: true });
                }
            });
        }
        if (SubscriptionHelper_1.default.isUsingSubscriptionWorkaround() && !MainHelper_1.default.isContinuingBrowserSession()) {
            /*
             The user is on an HTTP site and they accessed this site by opening a new window or tab (starting a new
             session). This means we should increment their session_count and last_active by calling
             registerWithOneSignal(). Without this call, the user's session and last_active is not updated. We only
             do this if the user is actually registered with OneSignal though.
             */
            log.debug("(" + Environment_1.default.getEnv() + ") Updating session info for HTTP site.");
            OneSignal.isPushNotificationsEnabled(function (isPushEnabled) {
                if (isPushEnabled) {
                    return MainHelper_1.default.getAppId()
                        .then(function (appId) { return MainHelper_1.default.registerWithOneSignal(appId, null); });
                }
            });
        }
        SubscriptionHelper_1.default.checkAndWipeUserSubscription();
        MainHelper_1.default.checkAndDoHttpPermissionRequest();
    };
    InitHelper.installNativePromptPermissionChangedHook = function () {
        if (navigator.permissions && !(Browser.firefox && Number(Browser.version) <= 45)) {
            OneSignal._usingNativePermissionHook = true;
            // If the browser natively supports hooking the subscription prompt permission change event
            //     use it instead of our SDK method
            navigator.permissions.query({ name: 'notifications' }).then(function (permissionStatus) {
                permissionStatus.onchange = function () {
                    EventHelper_1.default.triggerNotificationPermissionChanged();
                };
            });
        }
    };
    InitHelper.saveInitOptions = function () {
        var opPromises = [];
        if (OneSignal.config.persistNotification === false) {
            opPromises.push(Database_1.default.put('Options', { key: 'persistNotification', value: false }));
        }
        else {
            opPromises.push(Database_1.default.put('Options', { key: 'persistNotification', value: true }));
        }
        var webhookOptions = OneSignal.config.webhooks;
        ['notification.displayed', 'notification.clicked', 'notification.dismissed'].forEach(function (event) {
            if (webhookOptions && webhookOptions[event]) {
                opPromises.push(Database_1.default.put('Options', { key: "webhooks." + event, value: webhookOptions[event] }));
            }
            else {
                opPromises.push(Database_1.default.put('Options', { key: "webhooks." + event, value: false }));
            }
        });
        if (webhookOptions && webhookOptions.cors) {
            opPromises.push(Database_1.default.put('Options', { key: "webhooks.cors", value: true }));
        }
        else {
            opPromises.push(Database_1.default.put('Options', { key: "webhooks.cors", value: false }));
        }
        if (OneSignal.config.notificationClickHandlerMatch) {
            opPromises.push(Database_1.default.put('Options', {
                key: 'notificationClickHandlerMatch',
                value: OneSignal.config.notificationClickHandlerMatch
            }));
        }
        else {
            opPromises.push(Database_1.default.put('Options', { key: 'notificationClickHandlerMatch', value: 'exact' }));
        }
        if (OneSignal.config.serviceWorkerRefetchRequests === false) {
            opPromises.push(Database_1.default.put('Options', { key: 'serviceWorkerRefetchRequests', value: false }));
        }
        else {
            opPromises.push(Database_1.default.put('Options', { key: 'serviceWorkerRefetchRequests', value: true }));
        }
        return Promise.all(opPromises);
    };
    InitHelper.internalInit = function () {
        log.debug('Called %cinternalInit()', utils_1.getConsoleStyle('code'));
        Database_1.default.get('Ids', 'appId')
            .then(function (appId) {
            // HTTPS - Only register for push notifications once per session or if the user changes notification permission to Ask or Allow.
            if (sessionStorage.getItem("ONE_SIGNAL_SESSION")
                && !OneSignal.config.subdomainName
                && (window.Notification.permission == "denied"
                    || sessionStorage.getItem("ONE_SIGNAL_NOTIFICATION_PERMISSION") == window.Notification.permission)) {
                Event_1.default.trigger(OneSignal.EVENTS.SDK_INITIALIZED);
                return;
            }
            sessionStorage.setItem("ONE_SIGNAL_NOTIFICATION_PERMISSION", window.Notification.permission);
            if (Browser.safari && OneSignal.config.autoRegister === false) {
                log.debug('On Safari and autoregister is false, skipping sessionInit().');
                // This *seems* to trigger on either Safari's autoregister false or Chrome HTTP
                // Chrome HTTP gets an SDK_INITIALIZED event from the iFrame postMessage, so don't call it here
                if (!SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
                    Event_1.default.trigger(OneSignal.EVENTS.SDK_INITIALIZED);
                }
                return;
            }
            if (OneSignal.config.autoRegister === false && !OneSignal.config.subdomainName) {
                log.debug('Skipping internal init. Not auto-registering and no subdomain.');
                /* 3/25: If a user is already registered, re-register them in case the clicked Blocked and then Allow (which immediately invalidates the GCM token as soon as you click Blocked) */
                OneSignal.isPushNotificationsEnabled().then(function (isPushEnabled) {
                    if (isPushEnabled && !SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
                        log.info('Because the user is already subscribed and has enabled notifications, we will re-register their GCM token.');
                        // Resubscribes them, and in case their GCM registration token was invalid, gets a new one
                        SubscriptionHelper_1.default.registerForW3CPush({});
                    }
                    else {
                        ServiceWorkerHelper_1.default.updateServiceWorker();
                    }
                });
                Event_1.default.trigger(OneSignal.EVENTS.SDK_INITIALIZED);
                return;
            }
            if (document.visibilityState !== "visible") {
                utils_1.once(document, 'visibilitychange', function (e, destroyEventListener) {
                    if (document.visibilityState === 'visible') {
                        destroyEventListener();
                        InitHelper.sessionInit({ __sdkCall: true });
                    }
                }, true);
                return;
            }
            InitHelper.sessionInit({ __sdkCall: true });
        });
    };
    InitHelper.initSaveState = function () {
        return MainHelper_1.default.getAppId()
            .then(function (appId) {
            return Promise.all([
                Database_1.default.put("Ids", { type: "appId", id: appId }),
                Database_1.default.put("Options", { key: "pageTitle", value: document.title })
            ]).then(function () {
                log.info("OneSignal: Set pageTitle to be '" + document.title + "'.");
            });
        });
    };
    InitHelper.sessionInit = function (options) {
        log.debug("Called %csessionInit(" + JSON.stringify(options) + ")", utils_1.getConsoleStyle('code'));
        if (OneSignal._sessionInitAlreadyRunning) {
            log.debug('Returning from sessionInit because it has already been called.');
            return;
        }
        else {
            OneSignal._sessionInitAlreadyRunning = true;
        }
        var hostPageProtocol = location.protocol + "//";
        if (Browser.safari) {
            if (OneSignal.config.safari_web_id) {
                MainHelper_1.default.getAppId()
                    .then(function (appId) {
                    window.safari.pushNotification.requestPermission(OneSignal._API_URL + "safari", OneSignal.config.safari_web_id, { app_id: appId }, function (pushResponse) {
                        log.info('Safari Registration Result:', pushResponse);
                        if (pushResponse.deviceToken) {
                            var subscriptionInfo = {
                                // Safari's subscription returns a device token (e.g. 03D5D4A2EBCE1EE2AED68E12B72B1B995C2BFB811AB7DBF973C84FED66C6D1D5)
                                endpointOrToken: pushResponse.deviceToken.toLowerCase()
                            };
                            MainHelper_1.default.registerWithOneSignal(appId, subscriptionInfo);
                        }
                        else {
                            MainHelper_1.default.beginTemporaryBrowserSession();
                        }
                        EventHelper_1.default.triggerNotificationPermissionChanged();
                    });
                });
            }
        }
        else if (options.modalPrompt && options.fromRegisterFor) {
            Promise.all([
                MainHelper_1.default.getAppId(),
                OneSignal.isPushNotificationsEnabled(),
                OneSignal.getNotificationPermission()
            ])
                .then(function (_a) {
                var appId = _a[0], isPushEnabled = _a[1], notificationPermission = _a[2];
                var modalUrl = OneSignal.modalUrl + "?" + MainHelper_1.default.getPromptOptionsQueryString() + "&id=" + appId + "&httpsPrompt=true&pushEnabled=" + isPushEnabled + "&permissionBlocked=" + (notificationPermission === 'denied') + "&promptType=modal";
                log.info('Opening HTTPS modal prompt:', modalUrl);
                var modal = MainHelper_1.default.createHiddenSubscriptionDomModal(modalUrl);
                var sendToOrigin = "https://onesignal.com";
                if (Environment_1.default.isDev()) {
                    sendToOrigin = vars_1.DEV_FRAME_HOST;
                }
                var receiveFromOrigin = sendToOrigin;
                OneSignal.modalPostmam = new Postmam_1.default(modal, sendToOrigin, receiveFromOrigin);
                OneSignal.modalPostmam.startPostMessageReceive();
                OneSignal.modalPostmam.once(OneSignal.POSTMAM_COMMANDS.MODAL_LOADED, function (message) {
                    MainHelper_1.default.showSubscriptionDomModal();
                    Event_1.default.trigger('modalLoaded');
                });
                OneSignal.modalPostmam.once(OneSignal.POSTMAM_COMMANDS.MODAL_PROMPT_ACCEPTED, function (message) {
                    log.debug('User accepted the HTTPS modal prompt.');
                    OneSignal._sessionInitAlreadyRunning = false;
                    var iframeModalDom = document.getElementById('OneSignal-iframe-modal');
                    iframeModalDom.parentNode.removeChild(iframeModalDom);
                    OneSignal.modalPostmam.destroy();
                    MainHelper_1.default.triggerCustomPromptClicked('granted');
                    log.debug('Calling setSubscription(true)');
                    OneSignal.setSubscription(true)
                        .then(function () { return SubscriptionHelper_1.default.registerForW3CPush(options); });
                });
                OneSignal.modalPostmam.once(OneSignal.POSTMAM_COMMANDS.MODAL_PROMPT_REJECTED, function (message) {
                    log.debug('User rejected the HTTPS modal prompt.');
                    OneSignal._sessionInitAlreadyRunning = false;
                    var iframeModalDom = document.getElementById('OneSignal-iframe-modal');
                    iframeModalDom.parentNode.removeChild(iframeModalDom);
                    OneSignal.modalPostmam.destroy();
                    MainHelper_1.default.triggerCustomPromptClicked('denied');
                });
                OneSignal.modalPostmam.once(OneSignal.POSTMAM_COMMANDS.POPUP_CLOSING, function (message) {
                    log.info('Detected modal is closing.');
                    OneSignal.modalPostmam.destroy();
                });
            });
        }
        else if ('serviceWorker' in navigator && !SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
            if (options.__sdkCall && !MainHelper_1.default.wasHttpsNativePromptDismissed()) {
                SubscriptionHelper_1.default.registerForW3CPush(options);
            }
            else if (options.__sdkCall && MainHelper_1.default.wasHttpsNativePromptDismissed()) {
                log.debug('OneSignal: Not automatically showing native HTTPS prompt because the user previously dismissed it.');
                OneSignal._sessionInitAlreadyRunning = false;
            }
            else {
                SubscriptionHelper_1.default.registerForW3CPush(options);
            }
        }
        else {
            if (OneSignal.config.autoRegister !== true) {
                log.debug('OneSignal: Not automatically showing popover because autoRegister is not specifically true.');
            }
            if (MainHelper_1.default.isHttpPromptAlreadyShown()) {
                log.debug('OneSignal: Not automatically showing popover because it was previously shown in the same session.');
            }
            if ((OneSignal.config.autoRegister === true) && !MainHelper_1.default.isHttpPromptAlreadyShown()) {
                OneSignal.showHttpPrompt().catch(function (e) {
                    if (e instanceof InvalidStateError_1.InvalidStateError && e.reason === InvalidStateError_1.InvalidStateReason[InvalidStateError_1.InvalidStateReason.RedundantPermissionMessage] ||
                        e instanceof AlreadySubscribedError_1.default) {
                    }
                    else
                        throw e;
                });
            }
        }
        Event_1.default.trigger(OneSignal.EVENTS.SDK_INITIALIZED);
    };
    return InitHelper;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InitHelper;
//# sourceMappingURL=InitHelper.js.map
});

;require.register("build/src/helpers/MainHelper.js", function(exports, require, module) {
"use strict";
var vars_1 = require("../vars");
var Environment_1 = require("../Environment");
var OneSignalApi_1 = require("../OneSignalApi");
var log = require("loglevel");
var Event_1 = require("../Event");
var Database_1 = require("../Database");
var Browser = require("bowser");
var utils_1 = require("../utils");
var objectAssign = require("object-assign");
var swivel = require("swivel");
var Cookie = require("js-cookie");
var HttpModal_1 = require("../http-modal/HttpModal");
var Bell_1 = require("../bell/Bell");
var SubscriptionHelper_1 = require("./SubscriptionHelper");
var EventHelper_1 = require("./EventHelper");
var MainHelper = (function () {
    function MainHelper() {
    }
    /**
     * If there are multiple manifests, and one of them is our OneSignal manifest, we move it to the top of <head> to ensure our manifest is used for push subscription (manifests after the first are ignored as part of the spec).
     */
    MainHelper.fixWordpressManifestIfMisplaced = function () {
        var manifests = document.querySelectorAll('link[rel=manifest]');
        if (!manifests || manifests.length <= 1) {
            // Multiple manifests do not exist on this webpage; there is no issue
            return;
        }
        for (var i = 0; i < manifests.length; i++) {
            var manifest = manifests[i];
            var url = manifest.href;
            if (utils_1.contains(url, 'gcm_sender_id')) {
                // Move the <manifest> to the first thing in <head>
                document.querySelector('head').insertBefore(manifest, document.querySelector('head').children[0]);
                log.info('OneSignal: Moved the WordPress push <manifest> to the first element in <head>.');
            }
        }
    };
    /**
     * If the user has manually opted out of notifications (OneSignal.setSubscription), returns -2; otherwise returns 1.
     * @param isOptedIn The result of OneSignal.getSubscription().
     */
    MainHelper.getNotificationTypeFromOptIn = function (isOptedIn) {
        if (isOptedIn == true || isOptedIn == null) {
            return 1;
        }
        else {
            return -2;
        }
    };
    /*
     Returns the current browser-agnostic notification permission as "default", "granted", "denied".
     safariWebId: Used only to get the current notification permission state in Safari (required as part of the spec).
     */
    MainHelper.getNotificationPermission = function (safariWebId) {
        return utils_1.awaitOneSignalInitAndSupported()
            .then(function () {
            return new Promise(function (resolve, reject) {
                if (SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
                    // User is using our subscription workaround
                    OneSignal.iframePostmam.message(OneSignal.POSTMAM_COMMANDS.REMOTE_NOTIFICATION_PERMISSION, { safariWebId: safariWebId }, function (reply) {
                        var remoteNotificationPermission = reply.data;
                        resolve(remoteNotificationPermission);
                    });
                }
                else {
                    if (Browser.safari) {
                        // The user is on Safari
                        // A web ID is required to determine the current notificiation permission
                        if (safariWebId) {
                            resolve(window.safari.pushNotification.permission(safariWebId).permission);
                        }
                        else {
                            // The user didn't set up Safari web push properly; notifications are unlikely to be enabled
                            log.debug("OneSignal: Invalid init option safari_web_id %c" + safariWebId, utils_1.getConsoleStyle('code'), '. Please pass in a valid safari_web_id to OneSignal init.');
                        }
                    }
                    else {
                        // Identical API on Firefox and Chrome
                        resolve(window.Notification.permission);
                    }
                }
            });
        });
    };
    /**
     * Assigns a variable into sessionStorage to represent the beginning of a OneSignal session. A session is
     * initiated by opening a new tab or window to a OneSignal active page. While the same session lasts, refreshes to
     * the same page won't re-subscribe the user to OneSignal or update the last_active or session_count property.
     *
     * This method ensures that the sessionStorage is appropriately set for HTTP sites by communicating with the host
     * page.
     *
     * The only time we do start a browsing session on HTTP is after we register, so we get the popupPostman and post
     * a message back to the host to also start a browsing session.
     */
    MainHelper.beginTemporaryBrowserSession = function () {
        log.debug('OneSignal: Marking browser session as continuing.');
        sessionStorage.setItem("ONE_SIGNAL_SESSION", "true");
        if (Environment_1.default.isPopup()) {
            // If we're setting sessionStorage and we're in an Popup, we need to also set sessionStorage on the
            // main page
            if (!OneSignal.popupPostmam) {
                return;
            }
            OneSignal.popupPostmam.message(OneSignal.POSTMAM_COMMANDS.BEGIN_BROWSING_SESSION);
        }
    };
    /**
     * Returns true if the experimental HTTP permission request is being used to prompt the user.
     */
    MainHelper.isUsingHttpPermissionRequest = function () {
        return OneSignal.config.httpPermissionRequest &&
            OneSignal.config.httpPermissionRequest.enable == true &&
            (Environment_1.default.isIframe() ||
                Environment_1.default.isHost() && SubscriptionHelper_1.default.isUsingSubscriptionWorkaround());
    };
    /**
     * Returns true if the site using the HTTP permission request is supplying its own modal prompt to the user.
     */
    MainHelper.isUsingCustomHttpPermissionRequestPostModal = function () {
        return (OneSignal.config.httpPermissionRequest &&
            OneSignal.config.httpPermissionRequest.useCustomModal == true);
    };
    /**
     * Returns true if a session cookie exists for noting the user dismissed the native prompt.
     */
    MainHelper.wasHttpsNativePromptDismissed = function () {
        return Cookie.get('onesignal-notification-prompt') === 'dismissed';
    };
    /**
     * Stores a flag in sessionStorage that we've already shown the HTTP popover to this user and that we should not
     * show it again until they open a new window or tab to the site.
     */
    MainHelper.markHttpPopoverShown = function () {
        sessionStorage.setItem("ONESIGNAL_HTTP_PROMPT_SHOWN", "true");
    };
    /**
     * Returns true if the HTTP popover was already shown inside the same session.
     */
    MainHelper.isHttpPromptAlreadyShown = function () {
        return sessionStorage.getItem("ONESIGNAL_HTTP_PROMPT_SHOWN") == "true";
    };
    /**
     * Returns true if this current window session is continuing and not a newly opened tab or window.
     */
    MainHelper.isContinuingBrowserSession = function () {
        /*
         We don't need to communicate with any iFrames for HTTP sites because the same sessionStorage is set on all
         frames of the window.
         */
        return sessionStorage.getItem("ONE_SIGNAL_SESSION") == "true";
    };
    /**
     * Creates a new or updates an existing OneSignal user (player) on the server.
     *
     * @param appId The app ID passed to init.
     *        subscriptionInfo A hash containing 'endpointOrToken', 'auth', and 'p256dh'.
     *
     * @remarks Called from both the host page and HTTP popup.
     *          If a user already exists and is subscribed, updates the session count by calling /players/:id/on_session; otherwise, a new player is registered via the /players endpoint.
     *          Saves the user ID and registration ID to the local web database after the response from OneSignal.
     */
    MainHelper.registerWithOneSignal = function (appId, subscriptionInfo) {
        var deviceType = utils_1.getDeviceTypeForBrowser();
        return Promise.all([
            OneSignal.getUserId(),
            OneSignal.getSubscription()
        ])
            .then(function (_a) {
            var userId = _a[0], subscription = _a[1];
            var requestUrl = userId ?
                "players/" + userId + "/on_session" :
                "players";
            var requestData = {
                app_id: appId,
                device_type: deviceType,
                language: Environment_1.default.getLanguage(),
                timezone: new Date().getTimezoneOffset() * -60,
                device_model: navigator.platform + " " + Browser.name,
                device_os: Browser.version,
                sdk: OneSignal._VERSION,
                notification_types: MainHelper.getNotificationTypeFromOptIn(subscription)
            };
            if (subscriptionInfo) {
                requestData.identifier = subscriptionInfo.endpointOrToken;
                // Although we're passing the full endpoint to OneSignal, we still need to store only the registration ID for our SDK API getRegistrationId()
                // Parse out the registration ID from the full endpoint URL and save it to our database
                var registrationId = subscriptionInfo.endpointOrToken.replace(new RegExp("^(https://android.googleapis.com/gcm/send/|https://updates.push.services.mozilla.com/push/)"), "");
                Database_1.default.put("Ids", { type: "registrationId", id: registrationId });
                // New web push standard in Firefox 46+ and Chrome 50+ includes 'auth' and 'p256dh' in PushSubscription
                if (subscriptionInfo.auth) {
                    requestData.web_auth = subscriptionInfo.auth;
                }
                if (subscriptionInfo.p256dh) {
                    requestData.web_p256 = subscriptionInfo.p256dh;
                }
            }
            return OneSignalApi_1.default.post(requestUrl, requestData);
        })
            .then(function (response) {
            var userId = response.id;
            MainHelper.beginTemporaryBrowserSession();
            if (userId) {
                return Database_1.default.put("Ids", { type: "userId", id: userId });
            }
        })
            .then(function () {
            // We've finished registering with OneSignal, our session_count and last_active has been updated
            Event_1.default.trigger(OneSignal.EVENTS.REGISTERED);
        });
    };
    MainHelper.checkAndTriggerNotificationPermissionChanged = function () {
        Promise.all([
            Database_1.default.get('Options', 'notificationPermission'),
            OneSignal.getNotificationPermission()
        ])
            .then(function (_a) {
            var previousPermission = _a[0], currentPermission = _a[1];
            if (previousPermission !== currentPermission) {
                EventHelper_1.default.triggerNotificationPermissionChanged()
                    .then(function () { return Database_1.default.put('Options', {
                    key: 'notificationPermission',
                    value: currentPermission
                }); });
            }
        });
    };
    /**
     * Calls Notification.requestPermission(), but returns a Promise instead of accepting a callback like the a ctual
     * Notification.requestPermission();
     */
    MainHelper.requestNotificationPermissionPromise = function () {
        return new Promise(function (resolve) { return window.Notification.requestPermission(resolve); });
    };
    MainHelper.showNotifyButton = function () {
        if (Environment_1.default.isBrowser() && !OneSignal.notifyButton) {
            OneSignal.config.notifyButton = OneSignal.config.notifyButton || {};
            if (OneSignal.config.bell) {
                // If both bell and notifyButton, notifyButton's options take precedence
                objectAssign(OneSignal.config.bell, OneSignal.config.notifyButton);
                objectAssign(OneSignal.config.notifyButton, OneSignal.config.bell);
            }
            if (OneSignal.config.notifyButton.displayPredicate &&
                typeof OneSignal.config.notifyButton.displayPredicate === "function") {
                Promise.resolve(OneSignal.config.notifyButton.displayPredicate())
                    .then(function (predicateValue) {
                    if (predicateValue !== false) {
                        OneSignal.notifyButton = new Bell_1.default(OneSignal.config.notifyButton);
                        OneSignal.notifyButton.create();
                    }
                    else {
                        log.debug('Notify button display predicate returned false so not showing the notify button.');
                    }
                });
            }
            else {
                OneSignal.notifyButton = new Bell_1.default(OneSignal.config.notifyButton);
                OneSignal.notifyButton.create();
            }
        }
    };
    MainHelper.getPrefixedServiceWorkerNameForEnv = function () {
        if (Environment_1.default.isDev()) {
            OneSignal.SERVICE_WORKER_PATH = vars_1.DEV_PREFIX + 'OneSignalSDKWorker.js';
            OneSignal.SERVICE_WORKER_UPDATER_PATH = vars_1.DEV_PREFIX + 'OneSignalSDKUpdaterWorker.js';
        }
        else if (Environment_1.default.isStaging()) {
            OneSignal.SERVICE_WORKER_PATH = vars_1.STAGING_PREFIX + 'OneSignalSDKWorker.js';
            OneSignal.SERVICE_WORKER_UPDATER_PATH = vars_1.STAGING_PREFIX + 'OneSignalSDKUpdaterWorker.js';
        }
    };
    MainHelper.checkAndDoHttpPermissionRequest = function () {
        var _this = this;
        log.debug('Called %ccheckAndDoHttpPermissionRequest()', utils_1.getConsoleStyle('code'));
        if (this.isUsingHttpPermissionRequest()) {
            if (OneSignal.config.autoRegister) {
                OneSignal.showHttpPermissionRequest({ _sdkCall: true })
                    .then(function (result) {
                    if (result === 'granted' && !_this.isUsingCustomHttpPermissionRequestPostModal()) {
                        log.debug('Showing built-in post HTTP permission request in-page modal because permission is granted and not using custom modal.');
                        _this.showHttpPermissionRequestPostModal(OneSignal.config.httpPermissionRequest);
                    }
                });
            }
            else {
                Event_1.default.trigger(OneSignal.EVENTS.TEST_INIT_OPTION_DISABLED);
            }
        }
    };
    MainHelper.getNotificationIcons = function () {
        var url = '';
        return MainHelper.getAppId()
            .then(function (appId) {
            if (!appId) {
                return Promise.reject(null);
            }
            else {
                url = OneSignal._API_URL + "apps/" + appId + "/icon";
                return url;
            }
        }, function () {
            log.debug('No app ID, not getting notification icon for notify button.');
            return;
        })
            .then(function (url) { return fetch(url); })
            .then(function (response) { return response.json(); })
            .then(function (data) {
            if (data.errors) {
                log.error("API call %c" + url, utils_1.getConsoleStyle('code'), 'failed with:', data.errors);
                throw new Error('Failed to get notification icons.');
            }
            return data;
        });
    };
    MainHelper.establishServiceWorkerChannel = function (serviceWorkerRegistration) {
        if (OneSignal._channel) {
            OneSignal._channel.off('data');
            OneSignal._channel.off('notification.displayed');
            OneSignal._channel.off('notification.clicked');
        }
        OneSignal._channel = swivel.at(serviceWorkerRegistration ? serviceWorkerRegistration.active : null);
        OneSignal._channel.on('data', function handler(context, data) {
            log.debug("%c" + utils_1.capitalize(Environment_1.default.getEnv()) + " \u2B38 ServiceWorker:", utils_1.getConsoleStyle('serviceworkermessage'), data, context);
        });
        OneSignal._channel.on('notification.displayed', function handler(context, data) {
            Event_1.default.trigger(OneSignal.EVENTS.NOTIFICATION_DISPLAYED, data);
        });
        OneSignal._channel.on('notification.clicked', function handler(context, data) {
            Event_1.default.trigger(OneSignal.EVENTS.NOTIFICATION_CLICKED, data);
        });
        OneSignal._channel.on('notification.dismissed', function handler(context, data) {
            Event_1.default.trigger(OneSignal.EVENTS.NOTIFICATION_DISMISSED, data);
        });
    };
    MainHelper.getNormalizedSubdomain = function (subdomain) {
        if (subdomain) {
            return utils_1.normalizeSubdomain(subdomain);
        }
    };
    MainHelper.getPromptOptionsQueryString = function () {
        var promptOptions = OneSignal.config['promptOptions'];
        var promptOptionsStr = '';
        if (promptOptions) {
            var hash = MainHelper.getPromptOptionsPostHash();
            for (var _i = 0, _a = Object.keys(hash); _i < _a.length; _i++) {
                var key = _a[_i];
                var value = hash[key];
                promptOptionsStr += '&' + key + '=' + value;
            }
        }
        return promptOptionsStr;
    };
    /**
     * Shows the modal on the page users must click on after the local notification prompt to trigger the standard
     * HTTP popup window.
     */
    MainHelper.showHttpPermissionRequestPostModal = function (options) {
        OneSignal.httpPermissionRequestPostModal = new HttpModal_1.default(options);
        OneSignal.httpPermissionRequestPostModal.create();
    };
    MainHelper.getPromptOptionsPostHash = function () {
        var promptOptions = OneSignal.config['promptOptions'];
        if (promptOptions) {
            var legacyParams = {
                'exampleNotificationTitleDesktop': 'exampleNotificationTitle',
                'exampleNotificationMessageDesktop': 'exampleNotificationMessage',
                'exampleNotificationTitleMobile': 'exampleNotificationTitle',
                'exampleNotificationMessageMobile': 'exampleNotificationMessage',
            };
            for (var _i = 0, _a = Object.keys(legacyParams); _i < _a.length; _i++) {
                var legacyParamKey = _a[_i];
                var legacyParamValue = legacyParams[legacyParamKey];
                if (promptOptions[legacyParamKey]) {
                    promptOptions[legacyParamValue] = promptOptions[legacyParamKey];
                }
            }
            var allowedPromptOptions = [
                'autoAcceptTitle',
                'siteName',
                'autoAcceptTitle',
                'subscribeText',
                'showGraphic',
                'actionMessage',
                'exampleNotificationTitle',
                'exampleNotificationMessage',
                'exampleNotificationCaption',
                'acceptButtonText',
                'cancelButtonText',
                'timeout',
            ];
            var hash = {};
            for (var i = 0; i < allowedPromptOptions.length; i++) {
                var key = allowedPromptOptions[i];
                var value = promptOptions[key];
                var encoded_value = encodeURIComponent(value);
                if (value || value === false || value === '') {
                    hash[key] = encoded_value;
                }
            }
        }
        return hash;
    };
    MainHelper.triggerCustomPromptClicked = function (clickResult) {
        Event_1.default.trigger(OneSignal.EVENTS.CUSTOM_PROMPT_CLICKED, {
            result: clickResult
        });
    };
    MainHelper.autoCorrectSubdomain = function (inputSubdomain) {
        var normalizedSubdomain = MainHelper.getNormalizedSubdomain(inputSubdomain);
        if (normalizedSubdomain !== inputSubdomain) {
            log.info("Auto-corrected subdomain '" + inputSubdomain + "' to '" + normalizedSubdomain + "'.");
        }
        return normalizedSubdomain;
    };
    MainHelper.createHiddenDomIFrame = function (url, name) {
        var node = document.createElement("iframe");
        node.style.display = "none";
        if (!url) {
            url = 'about:blank';
        }
        node.src = url;
        if (name) {
            node.name = name;
        }
        document.body.appendChild(node);
        return node;
    };
    MainHelper.createHiddenSubscriptionDomModal = function (url) {
        var iframeContainer = document.createElement('div');
        iframeContainer.setAttribute('id', 'OneSignal-iframe-modal');
        iframeContainer.setAttribute('style', 'display:none !important');
        iframeContainer.innerHTML = '<div id="notif-permission" style="background: rgba(0, 0, 0, 0.7); position: fixed;' +
            ' top: 0; left: 0; right: 0; bottom: 0; z-index: 3000000000; display: flex;' +
            ' align-items: center; justify-content: center;"></div>';
        document.body.appendChild(iframeContainer);
        var iframeContainerStyle = document.createElement('style');
        iframeContainerStyle.innerHTML = "@media (max-width: 560px) { .OneSignal-permission-iframe { width: 100%; height: 100%;} }";
        document.getElementsByTagName('head')[0].appendChild(iframeContainerStyle);
        var iframe = document.createElement("iframe");
        iframe.className = "OneSignal-permission-iframe";
        iframe.setAttribute('frameborder', '0');
        iframe.width = OneSignal._windowWidth.toString();
        iframe.height = OneSignal._windowHeight.toString();
        iframe.src = url;
        document.getElementById("notif-permission").appendChild(iframe);
        return iframe;
    };
    MainHelper.showSubscriptionDomModal = function () {
        var iframeContainer = document.getElementById('OneSignal-iframe-modal');
        iframeContainer.setAttribute('style', '');
    };
    // Arguments :
    //  verb : 'GET'|'POST'
    //  target : an optional opening target (a name, or "_blank"), defaults to "_self"
    MainHelper.openWindowViaPost = function (url, data, overrides) {
        var form = document.createElement("form");
        form.action = url;
        form.method = 'POST';
        form.target = "onesignal-http-popup";
        var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
        var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
        var thisWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        var thisHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
        var childWidth = OneSignal._windowWidth;
        var childHeight = OneSignal._windowHeight;
        var left = ((thisWidth / 2) - (childWidth / 2)) + dualScreenLeft;
        var top = ((thisHeight / 2) - (childHeight / 2)) + dualScreenTop;
        if (overrides) {
            if (overrides.childWidth) {
                childWidth = overrides.childWidth;
            }
            if (overrides.childHeight) {
                childHeight = overrides.childHeight;
            }
            if (overrides.left) {
                left = overrides.left;
            }
            if (overrides.top) {
                top = overrides.top;
            }
        }
        var windowRef = window.open('about:blank', "onesignal-http-popup", "'scrollbars=yes, width=" + childWidth + ", height=" + childHeight + ", top=" + top + ", left=" + left);
        if (data) {
            for (var key in data) {
                var input = document.createElement("textarea");
                input.name = key;
                input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
                form.appendChild(input);
            }
        }
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        return windowRef;
    };
    ;
    MainHelper.openSubdomainPopup = function (url, data, overrides) {
        return MainHelper.openWindowViaPost(url, data, overrides);
    };
    MainHelper.getAppId = function () {
        if (OneSignal.config.appId) {
            return Promise.resolve(OneSignal.config.appId);
        }
        else
            return Database_1.default.get('Ids', 'appId');
    };
    return MainHelper;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MainHelper;
//# sourceMappingURL=MainHelper.js.map
});

;require.register("build/src/helpers/ServiceWorkerHelper.js", function(exports, require, module) {
"use strict";
var vars_1 = require("../vars");
var Environment_1 = require("../Environment");
var log = require("loglevel");
var Database_1 = require("../Database");
var utils_1 = require("../utils");
var SubscriptionHelper_1 = require("./SubscriptionHelper");
var ServiceWorkerHelper = (function () {
    function ServiceWorkerHelper() {
    }
    ServiceWorkerHelper.applyServiceWorkerEnvPrefixes = function () {
        if (Environment_1.default.isDev()) {
            OneSignal.SERVICE_WORKER_PATH = vars_1.DEV_PREFIX + 'OneSignalSDKWorker.js';
            OneSignal.SERVICE_WORKER_UPDATER_PATH = vars_1.DEV_PREFIX + 'OneSignalSDKUpdaterWorker.js';
        }
        else if (Environment_1.default.isStaging()) {
            OneSignal.SERVICE_WORKER_PATH = vars_1.STAGING_PREFIX + 'OneSignalSDKWorker.js';
            OneSignal.SERVICE_WORKER_UPDATER_PATH = vars_1.STAGING_PREFIX + 'OneSignalSDKUpdaterWorker.js';
        }
    };
    ServiceWorkerHelper.closeNotifications = function () {
        if (navigator.serviceWorker && !SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
            navigator.serviceWorker.getRegistration()
                .then(function (registration) {
                if (registration === undefined || !registration.active) {
                    throw new Error('There is no active service worker.');
                }
                else if (OneSignal._channel) {
                    OneSignal._channel.emit('data', 'notification.closeall');
                }
            });
        }
    };
    /*
     Updates an existing OneSignal-only service worker if an older version exists. Does not install a new service worker if none is available or overwrite other service workers.
     This also differs from the original update code we have below in that we do not subscribe for push after.
     Because we're overwriting a service worker, the push token seems to "carry over" (this is good), whereas if we unregistered and registered a new service worker, the push token would be lost (this is bad).
     By not subscribing for push after we register the SW, we don't have to care if notification permissions are granted or not, since users will not be prompted; this update process will be transparent.
     This way we can update the service worker even for autoRegister: false users.
     */
    ServiceWorkerHelper.updateServiceWorker = function () {
        var updateCheckAlreadyRan = sessionStorage.getItem('onesignal-update-serviceworker-completed');
        if (!navigator.serviceWorker || !Environment_1.default.isHost() || location.protocol !== 'https:' || updateCheckAlreadyRan == "true") {
            log.debug('Skipping service worker update for existing session.');
            return;
        }
        try {
            sessionStorage.setItem('onesignal-update-serviceworker-completed', "true");
        }
        catch (e) {
            log.error(e);
        }
        return navigator.serviceWorker.getRegistration().then(function (serviceWorkerRegistration) {
            var sw_path = "";
            if (OneSignal.config.path)
                sw_path = OneSignal.config.path;
            if (serviceWorkerRegistration && serviceWorkerRegistration.active) {
                // An existing service worker
                var previousWorkerUrl = serviceWorkerRegistration.active.scriptURL;
                if (utils_1.contains(previousWorkerUrl, sw_path + OneSignal.SERVICE_WORKER_PATH)) {
                    // OneSignalSDKWorker.js was installed
                    log.debug('(Service Worker Update)', 'The main service worker is active.');
                    return Database_1.default.get('Ids', 'WORKER1_ONE_SIGNAL_SW_VERSION')
                        .then(function (version) {
                        // Get version of installed worker saved to IndexedDB
                        if (version) {
                            // If a version exists
                            log.debug('(Service Worker Update)', "Stored service worker version v" + version + ".");
                            if (version != OneSignal._VERSION) {
                                // If there is a different version
                                log.debug('(Service Worker Update)', 'New service worker version exists:', OneSignal._VERSION);
                                log.info("Upgrading service worker (v" + version + " -> v" + OneSignal._VERSION + ")");
                                return navigator.serviceWorker.register(sw_path + OneSignal.SERVICE_WORKER_UPDATER_PATH, OneSignal.SERVICE_WORKER_PARAM);
                            }
                            else {
                                // No changed service worker version
                                log.debug('(Service Worker Update)', 'You already have the latest service worker version.');
                                return null;
                            }
                        }
                        else {
                            // No version was saved; somehow this got overwritten
                            // Reinstall the alternate service worker
                            log.debug('(Service Worker Update)', 'No stored service worker version. Reinstalling the service worker.');
                            return navigator.serviceWorker.register(sw_path + OneSignal.SERVICE_WORKER_UPDATER_PATH, OneSignal.SERVICE_WORKER_PARAM);
                        }
                    });
                }
                else if (utils_1.contains(previousWorkerUrl, sw_path + OneSignal.SERVICE_WORKER_UPDATER_PATH)) {
                    // OneSignalSDKUpdaterWorker.js was installed
                    log.debug('(Service Worker Update)', 'The alternate service worker is active.');
                    return Database_1.default.get('Ids', 'WORKER2_ONE_SIGNAL_SW_VERSION')
                        .then(function (version) {
                        // Get version of installed worker saved to IndexedDB
                        if (version) {
                            // If a version exists
                            log.debug('(Service Worker Update)', "Stored service worker version v" + version + ".");
                            if (version != OneSignal._VERSION) {
                                // If there is a different version
                                log.debug('(Service Worker Update)', 'New service worker version exists:', OneSignal._VERSION);
                                log.info("Upgrading new service worker (v" + version + " -> v" + OneSignal._VERSION + ")");
                                return navigator.serviceWorker.register(sw_path + OneSignal.SERVICE_WORKER_PATH, OneSignal.SERVICE_WORKER_PARAM);
                            }
                            else {
                                // No changed service worker version
                                log.debug('(Service Worker Update)', 'You already have the latest service worker version.');
                                return null;
                            }
                        }
                        else {
                            // No version was saved; somehow this got overwritten
                            // Reinstall the alternate service worker
                            log.debug('(Service Worker Update)', 'No stored service worker version. Reinstalling the service worker.');
                            return navigator.serviceWorker.register(sw_path + OneSignal.SERVICE_WORKER_PATH, OneSignal.SERVICE_WORKER_PARAM);
                        }
                    });
                }
                else {
                }
            }
        });
    };
    ServiceWorkerHelper.registerServiceWorker = function (full_sw_and_path) {
        log.debug("Called %cregisterServiceWorker(" + JSON.stringify(full_sw_and_path, null, 4) + ")", utils_1.getConsoleStyle('code'));
        navigator.serviceWorker.register(full_sw_and_path, OneSignal.SERVICE_WORKER_PARAM).then(SubscriptionHelper_1.default.enableNotifications, ServiceWorkerHelper.registerError);
    };
    ServiceWorkerHelper.registerError = function (err) {
        log.error("ServiceWorker registration", err);
    };
    ServiceWorkerHelper.isServiceWorkerActive = function (callback) {
        if (!utils_1.isPushNotificationsSupported()) {
            return;
        }
        if (!('serviceWorker' in navigator)) {
            return false;
        }
        function isServiceWorkerRegistrationActive(serviceWorkerRegistration) {
            return serviceWorkerRegistration.active &&
                serviceWorkerRegistration.active.state === 'activated' &&
                (utils_1.contains(serviceWorkerRegistration.active.scriptURL, 'OneSignalSDKWorker') ||
                    utils_1.contains(serviceWorkerRegistration.active.scriptURL, 'OneSignalSDKUpdaterWorker'));
        }
        return new Promise(function (resolve, reject) {
            if (!SubscriptionHelper_1.default.isUsingSubscriptionWorkaround() && !Environment_1.default.isIframe()) {
                var isServiceWorkerActive_1 = false;
                if (navigator.serviceWorker.getRegistrations) {
                    navigator.serviceWorker.getRegistrations().then(function (serviceWorkerRegistrations) {
                        for (var _i = 0, serviceWorkerRegistrations_1 = serviceWorkerRegistrations; _i < serviceWorkerRegistrations_1.length; _i++) {
                            var serviceWorkerRegistration = serviceWorkerRegistrations_1[_i];
                            if (isServiceWorkerRegistrationActive(serviceWorkerRegistration)) {
                                isServiceWorkerActive_1 = true;
                            }
                        }
                        if (callback) {
                            callback(isServiceWorkerActive_1);
                        }
                        resolve(isServiceWorkerActive_1);
                    });
                }
                else {
                    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                        if (isServiceWorkerRegistrationActive(serviceWorkerRegistration)) {
                            isServiceWorkerActive_1 = true;
                        }
                        if (callback) {
                            callback(isServiceWorkerActive_1);
                        }
                        resolve(isServiceWorkerActive_1);
                    });
                }
            }
            else {
                if (callback) {
                    callback(false);
                }
                resolve(false);
            }
        });
    };
    return ServiceWorkerHelper;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ServiceWorkerHelper;
//# sourceMappingURL=ServiceWorkerHelper.js.map
});

;require.register("build/src/helpers/SubscriptionHelper.js", function(exports, require, module) {
"use strict";
var Environment_1 = require("../Environment");
var log = require("loglevel");
var Event_1 = require("../Event");
var Database_1 = require("../Database");
var Browser = require("bowser");
var utils_1 = require("../utils");
var MainHelper_1 = require("./MainHelper");
var ServiceWorkerHelper_1 = require("./ServiceWorkerHelper");
var EventHelper_1 = require("./EventHelper");
var PushPermissionNotGrantedError_1 = require("../errors/PushPermissionNotGrantedError");
var TestHelper_1 = require("./TestHelper");
var SubscriptionHelper = (function () {
    function SubscriptionHelper() {
    }
    /**
     * Returns a Promise resolving to whether user subscriptions should be reset. This means clearing all of IndexedDB
     * and actually unsubscribing from push notifications.
     *
     * Subscriptions are only wiped if the following conditions are met:
     *   - The flag dangerouslyResetUserSubscriptions is set to any string  (used to name the "reset session")
     *   - This user wasn't already reset (does this "reset session name" exist already)
     *   - The site is using an HTTPS native integration  (HTTP sites can only reset subscriptions when the popup is open)
     */
    SubscriptionHelper.shouldResetUserSubscription = function () {
        return Promise.all([
            OneSignal.config.dangerouslyResetUserSubscriptions,
            Database_1.default.get('Options', 'userSubscriptionResetToken'),
            SubscriptionHelper.isUsingSubscriptionWorkaround()
        ]).then(function (_a) {
            var isFlagPresent = _a[0], resetToken = _a[1], isUsingWorkaround = _a[2];
            return (isFlagPresent &&
                resetToken !== OneSignal.config.dangerouslyResetUserSubscriptions && !isUsingWorkaround);
        });
    };
    SubscriptionHelper.checkAndWipeUserSubscription = function () {
        return Promise.all([
            OneSignal.isPushNotificationsEnabled(),
            SubscriptionHelper.shouldResetUserSubscription()
        ]).then(function (_a) {
            var wasPushOriginallyEnabled = _a[0], shouldResetSubscription = _a[1];
            if (shouldResetSubscription) {
                log.warn("OneSignal: Resetting user subscription. Wiping IndexedDB, unsubscribing from, " +
                    "and resubscribing to push...");
                sessionStorage.clear();
                return Database_1.default.rebuild()
                    .then(function () { return Database_1.default.put('Options', { key: 'pageTitle', value: document.title }); })
                    .then(function () { return utils_1.unsubscribeFromPush(); })
                    .then(function () { return Database_1.default.put('Options', {
                    key: 'userSubscriptionResetToken',
                    value: OneSignal.config.dangerouslyResetUserSubscriptions
                }); })
                    .then(function () {
                    if (wasPushOriginallyEnabled) {
                        OneSignal.__doNotShowWelcomeNotification = true;
                        log.warn('Wiped subscription and attempting to resubscribe.');
                        return Database_1.default.put('Ids', { type: 'appId', id: OneSignal.config.appId });
                    }
                    else {
                        Promise.reject('Wiped subscription, but not resubscribing because user was not originally subscribed.');
                    }
                })
                    .then(function () {
                    OneSignal.registerForPushNotifications();
                });
            }
        });
    };
    SubscriptionHelper.registerForW3CPush = function (options) {
        log.debug("Called %cregisterForW3CPush(" + JSON.stringify(options) + ")", utils_1.getConsoleStyle('code'));
        return Database_1.default.get('Ids', 'registrationId')
            .then(function _registerForW3CPush_GotRegistrationId(registrationIdResult) {
            if (!registrationIdResult || !options.fromRegisterFor || window.Notification.permission != "granted" || navigator.serviceWorker.controller == null) {
                navigator.serviceWorker.getRegistration().then(function (serviceWorkerRegistration) {
                    var sw_path = "";
                    if (OneSignal.config.path)
                        sw_path = OneSignal.config.path;
                    if (typeof serviceWorkerRegistration === "undefined")
                        ServiceWorkerHelper_1.default.registerServiceWorker(sw_path + OneSignal.SERVICE_WORKER_PATH);
                    else {
                        if (serviceWorkerRegistration.active) {
                            var previousWorkerUrl = serviceWorkerRegistration.active.scriptURL;
                            if (utils_1.contains(previousWorkerUrl, sw_path + OneSignal.SERVICE_WORKER_PATH)) {
                                // OneSignalSDKWorker.js was installed
                                Database_1.default.get('Ids', 'WORKER1_ONE_SIGNAL_SW_VERSION')
                                    .then(function (version) {
                                    if (version) {
                                        if (version != OneSignal._VERSION) {
                                            log.info("Installing new service worker (" + version + " -> " + OneSignal._VERSION + ")");
                                            ServiceWorkerHelper_1.default.registerServiceWorker(sw_path + OneSignal.SERVICE_WORKER_UPDATER_PATH);
                                        }
                                        else
                                            ServiceWorkerHelper_1.default.registerServiceWorker(sw_path + OneSignal.SERVICE_WORKER_PATH);
                                    }
                                    else
                                        ServiceWorkerHelper_1.default.registerServiceWorker(sw_path + OneSignal.SERVICE_WORKER_UPDATER_PATH);
                                });
                            }
                            else if (utils_1.contains(previousWorkerUrl, sw_path + OneSignal.SERVICE_WORKER_UPDATER_PATH)) {
                                // OneSignalSDKUpdaterWorker.js was installed
                                Database_1.default.get('Ids', 'WORKER2_ONE_SIGNAL_SW_VERSION')
                                    .then(function (version) {
                                    if (version) {
                                        if (version != OneSignal._VERSION) {
                                            log.info("Installing new service worker (" + version + " -> " + OneSignal._VERSION + ")");
                                            ServiceWorkerHelper_1.default.registerServiceWorker(sw_path + OneSignal.SERVICE_WORKER_PATH);
                                        }
                                        else
                                            ServiceWorkerHelper_1.default.registerServiceWorker(sw_path + OneSignal.SERVICE_WORKER_UPDATER_PATH);
                                    }
                                    else
                                        ServiceWorkerHelper_1.default.registerServiceWorker(sw_path + OneSignal.SERVICE_WORKER_PATH);
                                });
                            }
                            else {
                                // Some other service worker not belonging to us was installed
                                // Install ours over it after unregistering theirs to get a different registration token and avoid mismatchsenderid error
                                log.info('Unregistering previous service worker:', serviceWorkerRegistration);
                                serviceWorkerRegistration.unregister().then(function (unregistrationSuccessful) {
                                    log.info('Result of unregistering:', unregistrationSuccessful);
                                    ServiceWorkerHelper_1.default.registerServiceWorker(sw_path + OneSignal.SERVICE_WORKER_PATH);
                                });
                            }
                        }
                        else if (serviceWorkerRegistration.installing == null)
                            ServiceWorkerHelper_1.default.registerServiceWorker(sw_path + OneSignal.SERVICE_WORKER_PATH);
                    }
                });
            }
        });
    };
    SubscriptionHelper.enableNotifications = function (existingServiceWorkerRegistration) {
        log.debug("Called %cenableNotifications()", utils_1.getConsoleStyle('code'));
        if (!('PushManager' in window)) {
            log.info("Push messaging is not supported. No PushManager.");
            MainHelper_1.default.beginTemporaryBrowserSession();
            return;
        }
        if (window.Notification.permission === 'denied') {
            log.warn("The user has blocked notifications.");
            return;
        }
        log.debug("Calling %cnavigator.serviceWorker.ready() ...", utils_1.getConsoleStyle('code'));
        navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
            log.debug('Finished calling %cnavigator.serviceWorker.ready', utils_1.getConsoleStyle('code'));
            MainHelper_1.default.establishServiceWorkerChannel(serviceWorkerRegistration);
            SubscriptionHelper.subscribeForPush(serviceWorkerRegistration);
        });
    };
    /**
     * Returns true if web push subscription occurs on a subdomain of OneSignal.
     * If true, our main IndexedDB is stored on the subdomain of onesignal.com, and not the user's site.
     * @remarks
     *   This method returns true if:
     *     - The browser is not Safari
     *         - Safari uses a different method of subscription and does not require our workaround
     *     - The init parameters contain a subdomain (even if the protocol is HTTPS)
     *         - HTTPS users using our subdomain workaround still have the main IndexedDB stored on our subdomain
     *        - The protocol of the current webpage is http:
     *   Exceptions are:
     *     - Safe hostnames like localhost and 127.0.0.1
     *          - Because we don't want users to get the wrong idea when testing on localhost that direct permission is supported on HTTP, we'll ignore these exceptions. HTTPS will always be required for direct permission
     *        - We are already in popup or iFrame mode, or this is called from the service worker
     */
    SubscriptionHelper.isUsingSubscriptionWorkaround = function () {
        if (!OneSignal.config) {
            throw new Error("(" + Environment_1.default.getEnv() + ") isUsingSubscriptionWorkaround() cannot be called until OneSignal.config exists.");
        }
        if (Browser.safari) {
            return false;
        }
        if (SubscriptionHelper.isLocalhostAllowedAsSecureOrigin() &&
            location.hostname === 'localhost' ||
            location.hostname === '127.0.0.1') {
            return false;
        }
        return (Environment_1.default.isHost() &&
            (!!OneSignal.config.subdomainName || location.protocol === 'http:'));
    };
    SubscriptionHelper.isLocalhostAllowedAsSecureOrigin = function () {
        return OneSignal.config && OneSignal.config.allowLocalhostAsSecureOrigin === true;
    };
    SubscriptionHelper.subscribeForPush = function (serviceWorkerRegistration) {
        log.debug("Called %c_subscribeForPush()", utils_1.getConsoleStyle('code'));
        var notificationPermissionBeforeRequest = '';
        OneSignal.getNotificationPermission().then(function (permission) {
            notificationPermissionBeforeRequest = permission;
        })
            .then(function () {
            log.debug("Calling %cServiceWorkerRegistration.pushManager.subscribe()", utils_1.getConsoleStyle('code'));
            Event_1.default.trigger(OneSignal.EVENTS.PERMISSION_PROMPT_DISPLAYED);
            /*
             7/29/16: If the user dismisses the prompt, the prompt cannot be shown again via pushManager.subscribe()
             See: https://bugs.chromium.org/p/chromium/issues/detail?id=621461
             Our solution is to call Notification.requestPermission(), and then call
             pushManager.subscribe(). Because notification and push permissions are shared, the subesequent call to
             pushManager.subscribe() will go through successfully.
             */
            return MainHelper_1.default.requestNotificationPermissionPromise();
        })
            .then(function (permission) {
            if (permission !== "granted") {
                throw new PushPermissionNotGrantedError_1.default();
            }
            else {
                return utils_1.executeAndTimeoutPromiseAfter(serviceWorkerRegistration.pushManager.subscribe({ userVisibleOnly: true }), 15000, "A possible Chrome bug (https://bugs.chromium.org/p/chromium/issues/detail?id=623062) is preventing this subscription from completing.");
            }
        })
            .then(function (subscription) {
            /*
             7/29/16: New bug, even if the user dismisses the prompt, they'll be given a subscription
             See: https://bugs.chromium.org/p/chromium/issues/detail?id=621461
             Our solution is simply to check the permission before actually subscribing the user.
             */
            log.debug("Finished calling %cServiceWorkerRegistration.pushManager.subscribe()", utils_1.getConsoleStyle('code'));
            log.debug('Subscription details:', subscription);
            // The user allowed the notification permission prompt, or it was already allowed; set sessionInit flag to false
            OneSignal._sessionInitAlreadyRunning = false;
            sessionStorage.setItem("ONE_SIGNAL_NOTIFICATION_PERMISSION", window.Notification.permission);
            MainHelper_1.default.getAppId()
                .then(function (appId) {
                log.debug("Finished subscribing for push via pushManager.subscribe().");
                var subscriptionInfo = {};
                if (subscription) {
                    if (typeof (subscription).subscriptionId != "undefined") {
                        // Chrome 43 & 42
                        subscriptionInfo.endpointOrToken = subscription.subscriptionId;
                    }
                    else {
                        // Chrome 44+ and FireFox
                        // 4/13/16: We now store the full endpoint instead of just the registration token
                        subscriptionInfo.endpointOrToken = subscription.endpoint;
                    }
                    // 4/13/16: Retrieve p256dh and auth for new encrypted web push protocol in Chrome 50
                    if (subscription.getKey) {
                        // p256dh and auth are both ArrayBuffer
                        var p256dh = null;
                        try {
                            p256dh = subscription.getKey('p256dh');
                        }
                        catch (e) {
                        }
                        var auth = null;
                        try {
                            auth = subscription.getKey('auth');
                        }
                        catch (e) {
                        }
                        if (p256dh) {
                            // Base64 encode the ArrayBuffer (not URL-Safe, using standard Base64)
                            var p256dh_base64encoded = btoa(String.fromCharCode.apply(null, new Uint8Array(p256dh)));
                            subscriptionInfo.p256dh = p256dh_base64encoded;
                        }
                        if (auth) {
                            // Base64 encode the ArrayBuffer (not URL-Safe, using standard Base64)
                            var auth_base64encoded = btoa(String.fromCharCode.apply(null, new Uint8Array(auth)));
                            subscriptionInfo.auth = auth_base64encoded;
                        }
                    }
                }
                else
                    log.warn('Could not subscribe your browser for push notifications.');
                if (OneSignal._thisIsThePopup) {
                    // 12/16/2015 -- At this point, the user has just clicked Allow on the HTTP popup!!
                    // 11/22/2016 - HTTP popup should move non-essential subscription parts to the iframe
                    OneSignal.popupPostmam.message(OneSignal.POSTMAM_COMMANDS.FINISH_REMOTE_REGISTRATION, {
                        subscriptionInfo: subscriptionInfo
                    }, function (message) {
                        if (message.data.progress === true) {
                            log.debug('Got message from host page that remote reg. is in progress, closing popup.');
                            var creator = opener || parent;
                            if (opener) {
                                /* Note: This is hard to find, but this is actually the code that closes the HTTP popup window */
                                window.close();
                            }
                        }
                        else {
                            log.debug('Got message from host page that remote reg. could not be finished.');
                        }
                    });
                }
                else {
                    // If we are not doing HTTP subscription, continue finish subscribing by registering with OneSignal
                    MainHelper_1.default.registerWithOneSignal(appId, subscriptionInfo);
                }
            });
        })
            .catch(function (e) {
            OneSignal._sessionInitAlreadyRunning = false;
            if (e.message === 'Registration failed - no sender id provided' || e.message === 'Registration failed - manifest empty or missing') {
                var manifestDom = document.querySelector('link[rel=manifest]');
                if (manifestDom) {
                    var manifestParentTagname = document.querySelector('link[rel=manifest]').parentNode.tagName.toLowerCase();
                    var manifestHtml = document.querySelector('link[rel=manifest]').outerHTML;
                    var manifestLocation = document.querySelector('link[rel=manifest]').href;
                    if (manifestParentTagname !== 'head') {
                        log.warn("OneSignal: Your manifest %c" + manifestHtml, utils_1.getConsoleStyle('code'), 'must be referenced in the <head> tag to be detected properly. It is currently referenced ' +
                            'in <${manifestParentTagname}>. Please see step 3.1 at ' +
                            'https://documentation.onesignal.com/docs/web-push-sdk-setup-https.');
                    }
                    else {
                        var manifestLocationOrigin = new URL(manifestLocation).origin;
                        var currentOrigin = location.origin;
                        if (currentOrigin !== manifestLocationOrigin) {
                            log.warn("OneSignal: Your manifest is being served from " + manifestLocationOrigin + ", which is " +
                                ("different from the current page's origin of " + currentOrigin + ". Please serve your ") +
                                "manifest from the same origin as your page's. If you are using a content delivery " +
                                "network (CDN), please add an exception so that the manifest is not served by your CDN. " +
                                "WordPress users, please see " +
                                "https://documentation.onesignal.com/docs/troubleshooting-web-push#section-wordpress-cdn-support.");
                        }
                        else {
                            log.warn("OneSignal: Please check your manifest at " + manifestLocation + ". The %cgcm_sender_id", utils_1.getConsoleStyle('code'), "field is missing or invalid, and a valid value is required. Please see step 2 at " +
                                "https://documentation.onesignal.com/docs/web-push-sdk-setup-https.");
                        }
                    }
                }
                else if (location.protocol === 'https:') {
                    log.warn("OneSignal: You must reference a %cmanifest.json", utils_1.getConsoleStyle('code'), "in the <head> of your page. Please see step 2 at " +
                        "https://documentation.onesignal.com/docs/web-push-sdk-setup-https.");
                }
            }
            else {
                log.error('Error while subscribing for push:', e);
            }
            // In Chrome, closing a tab while the prompt is displayed is the same as dismissing the prompt by clicking X
            // Our SDK receives the same event as if the user clicked X, when in fact the user just closed the tab. If
            // we had some code that prevented showing the prompt for 8 hours, the user would accidentally not be able
            // to subscribe.
            // New addition (12/22/2015), adding support for detecting the cancel 'X'
            // Chrome doesn't show when the user clicked 'X' for cancel
            // We get the same error as if the user had clicked denied, but we can check Notification.permission to see if it is still 'default'
            OneSignal.getNotificationPermission().then(function (permission) {
                if (permission === 'default') {
                    // The user clicked 'X'
                    EventHelper_1.default.triggerNotificationPermissionChanged(true);
                    TestHelper_1.default.markHttpsNativePromptDismissed();
                }
                if (!OneSignal._usingNativePermissionHook)
                    EventHelper_1.default.triggerNotificationPermissionChanged();
                if (opener && OneSignal._thisIsThePopup)
                    window.close();
            });
            // If there was an error subscribing like the timeout bug, close the popup anyways
            if (opener && OneSignal._thisIsThePopup)
                window.close();
        });
    };
    return SubscriptionHelper;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SubscriptionHelper;
//# sourceMappingURL=SubscriptionHelper.js.map
});

;require.register("build/src/helpers/TestHelper.js", function(exports, require, module) {
"use strict";
var log = require("loglevel");
var Cookie = require("js-cookie");
var TestHelper = (function () {
    function TestHelper() {
    }
    /**
     * Just for debugging purposes, removes the coookie from hiding the native prompt.
     * @returns {*}
     */
    TestHelper.unmarkHttpsNativePromptDismissed = function () {
        if (Cookie.remove('onesignal-notification-prompt')) {
            log.debug('OneSignal: Removed the native notification prompt dismissed cookie.');
        }
        else {
            log.debug('OneSignal: Cookie not marked.');
        }
    };
    /**
     * Creates a session cookie to note that the user does not want to be disturbed for the rest of the browser session.
     */
    TestHelper.markHttpsNativePromptDismissed = function () {
        log.debug('OneSignal: User dismissed the native notification prompt; storing flag.');
        return Cookie.set('onesignal-notification-prompt', 'dismissed', {
            // In 8 hours, or 1/3 of the day
            expires: 0.333
        });
    };
    return TestHelper;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TestHelper;
//# sourceMappingURL=TestHelper.js.map
});

;require.register("build/src/http-modal/HttpModal.js", function(exports, require, module) {
"use strict";
var utils_1 = require("../utils");
var log = require("loglevel");
var Event_1 = require("../Event");
var objectAssign = require("object-assign");
var HttpModal = (function () {
    function HttpModal(options) {
        if (!options) {
            this.options = {};
        }
        else {
            this.options = objectAssign({}, options);
        }
        if (!this.options['modalTitle'] || typeof this.options['modalTitle'] !== "string")
            this.options['modalTitle'] = "Thanks for subscribing";
        if (!this.options['modalMessage'] || typeof this.options['modalMessage'] !== "string")
            this.options['modalMessage'] = "You're now subscribed to notifications. You can unsubscribe at any time.";
        if (!this.options['modalButtonText'] || typeof this.options['modalButtonText'] !== "string")
            this.options['modalButtonText'] = "Close";
        this.options['modalTitle'] = this.options['modalTitle'].substring(0, 50);
        this.options['modalMessage'] = this.options['modalMessage'].substring(0, 90);
        this.options['modalButtonText'] = this.options['modalButtonText'].substring(0, 35);
        //require("../../../src/http-modal/httpModal.scss");
    }
    Object.defineProperty(HttpModal, "EVENTS", {
        get: function () {
            return {
                FINISH_CLICK: 'httpModalFinishClick',
                SHOWN: 'httpModalShown',
                CLOSED: 'httpModalClosed',
            };
        },
        enumerable: true,
        configurable: true
    });
    HttpModal.prototype.create = function () {
        try {
            // Remove any existing container
            if (this.container) {
                utils_1.removeDomElement('#onesignal-modal-container');
            }
            var dialogHtml = "\n                        <div id=\"onesignal-modal-dialog\">\n                            <div class=\"modal-exit\">&times;</div>\n                            <div class=\"modal-body\">\n                                <div class=\"modal-body-title\">\n                                    " + this.options['modalTitle'] + "                                      \n                                </div>\n                                <div class=\"modal-body-message\">\n                                    " + this.options['modalMessage'] + "                \n                                </div>\n                                <div class=\"clearfix\"></div>\n                            </div>\n                            <div class=\"modal-footer\">\n                                <button id=\"onesignal-modal-finish-button\" class=\"primary modal-button\">\n                                " + this.options['modalButtonText'] + "</button>\n                                <div class=\"clearfix\"></div>\n                            </div>\n                        </div>                   \n                    ";
            // Insert the container
            utils_1.addDomElement('body', 'beforeend', '<div id="onesignal-modal-container" class="onesignal-modal-container onesignal-reset"></div>');
            // Insert the dialog
            utils_1.addDomElement(this.container, 'beforeend', dialogHtml);
            // Add click event handlers
            this.container.addEventListener('click', this.onHttpModalFinished.bind(this));
            Event_1.default.trigger(HttpModal.EVENTS.SHOWN);
        }
        catch (e) {
            log.error(e);
        }
    };
    HttpModal.prototype.onHttpModalFinished = function (e) {
        OneSignal.registerForPushNotifications({ httpPermissionRequest: true });
        Event_1.default.trigger(HttpModal.EVENTS.FINISH_CLICK);
        this.close();
    };
    HttpModal.prototype.close = function () {
        utils_1.addCssClass(this.container, 'close-modal');
        utils_1.removeDomElement('#onesignal-modal-container');
        Event_1.default.trigger(HttpModal.EVENTS.CLOSED);
    };
    Object.defineProperty(HttpModal.prototype, "container", {
        get: function () {
            return document.querySelector('#onesignal-modal-container');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpModal.prototype, "dialog", {
        get: function () {
            return document.querySelector('#onesignal-modal-dialog');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpModal.prototype, "finishButton", {
        get: function () {
            return document.querySelector('#onesignal-modal-finish-button');
        },
        enumerable: true,
        configurable: true
    });
    return HttpModal;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HttpModal;
//# sourceMappingURL=HttpModal.js.map
});

;require.register("build/src/models/Action.js", function(exports, require, module) {
//# sourceMappingURL=Action.js.map
});

;require.register("build/src/models/AppConfig.js", function(exports, require, module) {
"use strict";
var AppConfig = (function () {
    function AppConfig() {
    }
    return AppConfig;
}());
exports.AppConfig = AppConfig;
//# sourceMappingURL=AppConfig.js.map
});

;require.register("build/src/models/AppState.js", function(exports, require, module) {
"use strict";
var AppState = (function () {
    function AppState() {
    }
    return AppState;
}());
exports.AppState = AppState;
//# sourceMappingURL=AppState.js.map
});

;require.register("build/src/models/Func.js", function(exports, require, module) {
//# sourceMappingURL=Func.js.map
});

;require.register("build/src/models/Notification.js", function(exports, require, module) {
"use strict";
//# sourceMappingURL=Notification.js.map
});

;require.register("build/src/models/NotificationActionButton.js", function(exports, require, module) {
"use strict";
//# sourceMappingURL=NotificationActionButton.js.map
});

;require.register("build/src/models/NotificationPermission.js", function(exports, require, module) {
"use strict";
var NotificationPermission;
(function (NotificationPermission) {
    /**
     * The user has not granted notification permissions and may have just dismissed the notification permission prompt.
     */
    NotificationPermission[NotificationPermission["Default"] = "default"] = "Default";
    /**
     * The user has granted notification permissions.
     */
    NotificationPermission[NotificationPermission["Granted"] = "granted"] = "Granted";
    /**
     * The user has blocked notifications.
     */
    NotificationPermission[NotificationPermission["Denied"] = "denied"] = "Denied";
})(NotificationPermission || (NotificationPermission = {}));
exports.NotificationPermission = NotificationPermission;
//# sourceMappingURL=NotificationPermission.js.map
});

;require.register("build/src/models/PermissionPromptType.js", function(exports, require, module) {
"use strict";
var PermissionPromptType;
(function (PermissionPromptType) {
    /**
     * Local notification hack for HTTP sites triggered by prompting for local notification permissions.
     */
    PermissionPromptType[PermissionPromptType["HttpPermissionRequest"] = 'HTTP permission request'] = "HttpPermissionRequest";
    /**
     * The "main" browser native permission request dialog when prompting for local or push notification permissions.
     */
    PermissionPromptType[PermissionPromptType["HttpsPermissionRequest"] = 'HTTPS permission request'] = "HttpsPermissionRequest";
    /**
     * The "popup" to subdomain.onesignal.com.
     */
    PermissionPromptType[PermissionPromptType["FullscreenHttpPermissionMessage"] = 'fullscreen HTTP permission message'] = "FullscreenHttpPermissionMessage";
    /**
     * The full-screen HTTPS modal with a dimmed backdrop.
     */
    PermissionPromptType[PermissionPromptType["FullscreenHttpsPermissionMessage"] = 'fullscreen HTTPS permission message'] = "FullscreenHttpsPermissionMessage";
    /**
     * The "sliding down" prompt.
     */
    PermissionPromptType[PermissionPromptType["SlidedownPermissionMessage"] = 'slidedown permission message'] = "SlidedownPermissionMessage";
    /**
     * The "notify button".
     */
    PermissionPromptType[PermissionPromptType["SubscriptionBell"] = 'subscription bell'] = "SubscriptionBell";
})(PermissionPromptType = exports.PermissionPromptType || (exports.PermissionPromptType = {}));
//# sourceMappingURL=PermissionPromptType.js.map
});

;require.register("build/src/models/ServiceWorkerConfig.js", function(exports, require, module) {
"use strict";
/**
 * Contains the SDK initialization options that configure future installations of our service worker.
 */
var ServiceWorkerConfig = (function () {
    function ServiceWorkerConfig() {
    }
    return ServiceWorkerConfig;
}());
exports.ServiceWorkerConfig = ServiceWorkerConfig;
//# sourceMappingURL=ServiceWorkerConfig.js.map
});

;require.register("build/src/models/ServiceWorkerState.js", function(exports, require, module) {
"use strict";
var ServiceWorkerState = (function () {
    function ServiceWorkerState() {
    }
    return ServiceWorkerState;
}());
exports.ServiceWorkerState = ServiceWorkerState;
//# sourceMappingURL=ServiceWorkerState.js.map
});

;require.register("build/src/models/Subscription.js", function(exports, require, module) {
"use strict";
var Subscription = (function () {
    function Subscription() {
    }
    return Subscription;
}());
exports.Subscription = Subscription;
//# sourceMappingURL=Subscription.js.map
});

;require.register("build/src/models/Timestamp.js", function(exports, require, module) {
"use strict";
var Timestamp = (function () {
    function Timestamp(timestamp) {
        this.timestamp = timestamp;
    }
    return Timestamp;
}());
exports.Timestamp = Timestamp;
//# sourceMappingURL=Timestamp.js.map
});

;require.register("build/src/models/Uuid.js", function(exports, require, module) {
"use strict";
var isUuid = require("validator/lib/isUUID");
var InvalidUuidError_1 = require("../errors/InvalidUuidError");
var Uuid = (function () {
    function Uuid(uuid) {
        if (isUuid(uuid)) {
            this.uuid = uuid;
        }
        else {
            throw new InvalidUuidError_1.default(uuid);
        }
    }
    return Uuid;
}());
exports.Uuid = Uuid;
//# sourceMappingURL=Uuid.js.map
});

;require.register("build/src/popover/Popover.js", function(exports, require, module) {
"use strict";
var utils_1 = require("../utils");
var log = require("loglevel");
var Event_1 = require("../Event");
var MainHelper_1 = require("../helpers/MainHelper");
var Browser = require("bowser");
var objectAssign = require("object-assign");
var Popover = (function () {
    function Popover(options) {
        //require("../../../src/popover/popover.scss");
        if (!options) {
            this.options = {};
        }
        else {
            this.options = objectAssign({}, options);
        }
        if (!this.options['actionMessage'] || typeof this.options['actionMessage'] !== "string")
            this.options['actionMessage'] = "We'd like to show you notifications for the latest news and updates.";
        if (!this.options['acceptButtonText'] || typeof this.options['acceptButtonText'] !== "string")
            this.options['acceptButtonText'] = "Allow";
        if (!this.options['cancelButtonText'] || typeof this.options['cancelButtonText'] !== "string")
            this.options['cancelButtonText'] = "No Thanks";
        this.options['actionMessage'] = this.options['actionMessage'].substring(0, 90);
        this.options['acceptButtonText'] = this.options['acceptButtonText'].substring(0, 15);
        this.options['cancelButtonText'] = this.options['cancelButtonText'].substring(0, 15);
        this.notificationIcons = null;
    }
    Object.defineProperty(Popover, "EVENTS", {
        get: function () {
            return {
                ALLOW_CLICK: 'popoverAllowClick',
                CANCEL_CLICK: 'popoverCancelClick',
                SHOWN: 'popoverShown',
                CLOSED: 'popoverClosed',
            };
        },
        enumerable: true,
        configurable: true
    });
    Popover.prototype.create = function () {
        var _this = this;
        try {
            if (this.notificationIcons === null) {
                MainHelper_1.default.getNotificationIcons().then(function (icons) {
                    _this.notificationIcons = icons;
                    // Remove any existing container
                    if (_this.container) {
                        utils_1.removeDomElement('#onesignal-popover-container');
                    }
                    var icon = _this.getPlatformNotificationIcon();
                    var defaultIcon = "data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2239.5%22%20height%3D%2240.5%22%20viewBox%3D%220%200%2079%2081%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EOneSignal-Bell%3C%2Ftitle%3E%3Cg%20fill%3D%22%23BBB%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M39.96%2067.12H4.12s-3.2-.32-3.2-3.36%202.72-3.2%202.72-3.2%2010.72-5.12%2010.72-8.8c0-3.68-1.76-6.24-1.76-21.28%200-15.04%209.6-26.56%2021.12-26.56%200%200%201.6-3.84%206.24-3.84%204.48%200%206.08%203.84%206.08%203.84%2011.52%200%2021.12%2011.52%2021.12%2026.56s-1.6%2017.6-1.6%2021.28c0%203.68%2010.72%208.8%2010.72%208.8s2.72.16%202.72%203.2c0%202.88-3.36%203.36-3.36%203.36H39.96zM27%2070.8h24s-1.655%2010.08-11.917%2010.08S27%2070.8%2027%2070.8z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";
                    var dialogHtml = "\n                    <div id=\"normal-popover\">\n                        <div class=\"popover-body\">\n                            <div class=\"popover-body-icon " + (icon === 'default-icon' ? 'default-icon' : '') + "\" style=\"background-image: url('" + (icon === 'default-icon' ? defaultIcon : icon) + "');\">\n                            </div>\n                            <div class=\"popover-body-message\">\n                                " + _this.options['actionMessage'] + "                \n                            </div>\n                            <div class=\"clearfix\"></div>\n                        </div>\n                        <div class=\"popover-footer\">\n                            <button id=\"onesignal-popover-allow-button\" class=\"align-right primary popover-button\">\n                            " + _this.options['acceptButtonText'] + "</button>\n                            <button id=\"onesignal-popover-cancel-button\" class=\"align-right secondary popover-button\">\n                            " + _this.options['cancelButtonText'] + "</button>\n                            <div class=\"clearfix\"></div>\n                        </div>\n                    </div>                   \n                ";
                    // Insert the container
                    utils_1.addDomElement('body', 'beforeend', '<div id="onesignal-popover-container" class="onesignal-popover-container onesignal-reset"></div>');
                    // Insert the dialog
                    utils_1.addDomElement(_this.container, 'beforeend', "<div id=\"onesignal-popover-dialog\" class=\"onesignal-popover-dialog\">" + dialogHtml + "</div>");
                    // Animate it in depending on environment
                    utils_1.addCssClass(_this.container, Browser.mobile ? 'slide-up' : 'slide-down');
                    // Add click event handlers
                    _this.allowButton.addEventListener('click', _this.onPopoverAllowed.bind(_this));
                    _this.cancelButton.addEventListener('click', _this.onPopoverCanceled.bind(_this));
                    Event_1.default.trigger(Popover.EVENTS.SHOWN);
                });
            }
        }
        catch (e) {
            log.error(e);
        }
    };
    Popover.prototype.onPopoverAllowed = function (e) {
        Event_1.default.trigger(Popover.EVENTS.ALLOW_CLICK);
    };
    Popover.prototype.onPopoverCanceled = function (e) {
        Event_1.default.trigger(Popover.EVENTS.CANCEL_CLICK);
        this.close();
    };
    Popover.prototype.close = function () {
        var _this = this;
        utils_1.addCssClass(this.container, 'close-popover');
        utils_1.once(this.dialog, 'animationend', function (event, destroyListenerFn) {
            if (event.target === _this.dialog &&
                (event.animationName === 'slideDownExit' || event.animationName === 'slideUpExit')) {
                // Uninstall the event listener for animationend
                utils_1.removeDomElement('#onesignal-popover-container');
                destroyListenerFn();
                Event_1.default.trigger(Popover.EVENTS.CLOSED);
            }
        }, true);
    };
    Popover.prototype.getPlatformNotificationIcon = function () {
        if (this.notificationIcons) {
            if (Browser.chrome || Browser.firefox) {
                if (this.notificationIcons.chrome) {
                    return this.notificationIcons.chrome;
                }
                else if (this.notificationIcons.firefox) {
                    return this.notificationIcons.firefox;
                }
                else {
                    return 'default-icon';
                }
            }
            else if (Browser.safari) {
                if (this.notificationIcons.safari) {
                    return this.notificationIcons.safari;
                }
                else if (this.notificationIcons.chrome) {
                    return this.notificationIcons.chrome;
                }
                else {
                    return 'default-icon';
                }
            }
        }
        else
            return 'default-icon';
    };
    Object.defineProperty(Popover.prototype, "container", {
        get: function () {
            return document.querySelector('#onesignal-popover-container');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popover.prototype, "dialog", {
        get: function () {
            return document.querySelector('#onesignal-popover-dialog');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popover.prototype, "allowButton", {
        get: function () {
            return document.querySelector('#onesignal-popover-allow-button');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popover.prototype, "cancelButton", {
        get: function () {
            return document.querySelector('#onesignal-popover-cancel-button');
        },
        enumerable: true,
        configurable: true
    });
    return Popover;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Popover;
//# sourceMappingURL=Popover.js.map
});

;require.register("build/src/service-worker/ServiceWorker.js", function(exports, require, module) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
///<reference path="../../typings/globals/service_worker_api/index.d.ts"/>
var vars_1 = require("../vars");
var Environment_1 = require("../Environment");
var OneSignalApi_1 = require("../OneSignalApi");
var log = require("loglevel");
var Database_1 = require("../Database");
var utils_1 = require("../utils");
var objectAssign = require("object-assign");
var swivel = require("swivel");
var Browser = require("bowser");
/**
 * The main service worker script fetching and displaying notifications to users in the background even when the client
 * site is not running. The worker is registered via the navigator.serviceWorker.register() call after the user first
 * allows notification permissions, and is a pre-requisite to subscribing for push notifications.
 *
 * For HTTPS sites, the service worker is registered site-wide at the top-level scope. For HTTP sites, the service
 * worker is registered to the iFrame pointing to subdomain.onesignal.com.
 */
var ServiceWorker = (function () {
    function ServiceWorker() {
    }
    Object.defineProperty(ServiceWorker, "VERSION", {
        /**
         * An incrementing integer defined in package.json. Value doesn't matter as long as it's different from the
         * previous version.
         */
        get: function () {
            return Environment_1.default.version();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceWorker, "environment", {
        /**
         * Describes what context the JavaScript code is running in and whether we're running in local development mode.
         */
        get: function () {
            return Environment_1.default;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceWorker, "log", {
        get: function () {
            return log;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceWorker, "swivel", {
        /**
         * Allows message passing between this service worker and its controlled clients, or webpages. Controlled
         * clients include any HTTPS site page, or the nested iFrame pointing to OneSignal on any HTTP site. This allows
         * events like notification dismissed, clicked, and displayed to be fired on the clients. It also allows the
         * clients to communicate with the service worker to close all active notifications.
         */
        get: function () {
            return swivel;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceWorker, "database", {
        /**
         * An interface to the browser's IndexedDB.
         */
        get: function () {
            return Database_1.default;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceWorker, "apiUrl", {
        get: function () {
            return vars_1.API_URL;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceWorker, "browser", {
        /**
         * Describes the current browser name and version.
         */
        get: function () {
            return Browser;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Service worker entry point.
     */
    ServiceWorker.run = function () {
        self.addEventListener('push', ServiceWorker.onPushReceived);
        self.addEventListener('notificationclose', ServiceWorker.onNotificationClosed);
        self.addEventListener('notificationclick', function (event) { return event.waitUntil(ServiceWorker.onNotificationClicked(event)); });
        self.addEventListener('install', ServiceWorker.onServiceWorkerInstalled);
        self.addEventListener('activate', ServiceWorker.onServiceWorkerActivated);
        self.addEventListener('pushsubscriptionchange', ServiceWorker.onPushSubscriptionChange);
        // Install messaging event handlers for page <-> service worker communication
        swivel.on('data', ServiceWorker.onMessageReceived);
        // 3/2/16: Firefox does not send the Origin header when making CORS request through service workers, which breaks some sites that depend on the Origin header being present (https://bugzilla.mozilla.org/show_bug.cgi?id=1248463)
        // Fix: If the browser is Firefox and is v44, use the following workaround:
        if (Browser.firefox && Browser.version && utils_1.contains(Browser.version, '44')) {
            Database_1.default.get('Options', 'serviceWorkerRefetchRequests')
                .then(function (refetchRequests) {
                if (refetchRequests == true) {
                    log.info('Detected Firefox v44; installing fetch handler to refetch all requests.');
                    ServiceWorker.REFETCH_REQUESTS = true;
                    self.addEventListener('fetch', ServiceWorker.onFetch);
                }
                else {
                    ServiceWorker.SKIP_REFETCH_REQUESTS = true;
                    log.info('Detected Firefox v44 but not refetching requests because option is set to false.');
                }
            })
                .catch(function (e) {
                log.error(e);
                ServiceWorker.REFETCH_REQUESTS = true;
                self.addEventListener('fetch', ServiceWorker.onFetch);
            });
        }
    };
    /**
     * Occurs when a control message is received from the host page. Not related to the actual push message event.
     * @param context Used to reply to the host page.
     * @param data The message contents.
     */
    ServiceWorker.onMessageReceived = function (context, data) {
        log.debug("%c" + utils_1.capitalize(Environment_1.default.getEnv()) + " \u2B38 Host:", utils_1.getConsoleStyle('serviceworkermessage'), data, context);
        if (!data) {
            log.debug('Returning from empty data message.');
            return;
        }
        if (data === 'notification.closeall') {
            // Used for testing; the host page can close active notifications
            self.registration.getNotifications(null).then(function (notifications) {
                for (var _i = 0, notifications_1 = notifications; _i < notifications_1.length; _i++) {
                    var notification = notifications_1[_i];
                    notification.close();
                }
            });
        }
        else if (data.query) {
            ServiceWorker.processQuery(data.query, data.response);
        }
    };
    ServiceWorker.processQuery = function (queryType, response) {
        if (!ServiceWorker.queries) {
            log.debug("queryClient() was not called before processQuery(). ServiceWorker.queries is empty.");
        }
        if (!ServiceWorker.queries[queryType]) {
            log.debug("Received query " + queryType + " response " + response + ". Expected ServiceWorker.queries to be preset to a hash.");
            return;
        }
        else {
            if (!ServiceWorker.queries[queryType].promise) {
                log.debug("Expected ServiceWorker.queries[" + queryType + "].promise value to be a Promise: " + ServiceWorker.queries[queryType]);
                return;
            }
            ServiceWorker.queries[queryType].promiseResolve(response);
        }
    };
    /**
     * Messages the service worker client the specified queryString via postMessage(), and returns a Promise that
     * resolves to the client's response.
     * @param serviceWorkerClient A service worker client.
     * @param queryType The message to send to the client.
       */
    ServiceWorker.queryClient = function (serviceWorkerClient, queryType) {
        if (!ServiceWorker.queries) {
            ServiceWorker.queries = {};
        }
        if (!ServiceWorker.queries[queryType]) {
            ServiceWorker.queries[queryType] = {};
        }
        ServiceWorker.queries[queryType].promise = new Promise(function (resolve, reject) {
            ServiceWorker.queries[queryType].promiseResolve = resolve;
            ServiceWorker.queries[queryType].promiseReject = reject;
            swivel.emit(serviceWorkerClient.id, queryType);
        });
        return ServiceWorker.queries[queryType].promise;
    };
    /**
     * Occurs when a push message is received.
     * This method handles the receipt of a push signal on all web browsers except Safari, which uses the OS to handle
     * notifications.
     */
    ServiceWorker.onPushReceived = function (event) {
        log.debug("Called %conPushReceived(" + JSON.stringify(event, null, 4) + "):", utils_1.getConsoleStyle('code'), event);
        event.waitUntil(ServiceWorker.parseOrFetchNotifications(event)
            .then(function (notifications) {
            if (!notifications || notifications.length == 0) {
                log.debug("Because no notifications were retrieved, we'll display the last known notification, so" +
                    " long as it isn't the welcome notification.");
                return ServiceWorker.displayBackupNotification();
            }
            //Display push notifications in the order we received them
            var notificationEventPromiseFns = [];
            for (var _i = 0, notifications_2 = notifications; _i < notifications_2.length; _i++) {
                var rawNotification = notifications_2[_i];
                log.debug('Raw Notification from OneSignal:', rawNotification);
                var notification = ServiceWorker.buildStructuredNotificationObject(rawNotification);
                // Never nest the following line in a callback from the point of entering from retrieveNotifications
                notificationEventPromiseFns.push((function (notif) {
                    return ServiceWorker.displayNotification(notif)
                        .then(function () { return ServiceWorker.updateBackupNotification(notif).catch(function (e) { return log.error(e); }); })
                        .then(function () { swivel.broadcast('notification.displayed', notif); })
                        .then(function () { return ServiceWorker.executeWebhooks('notification.displayed', notif).catch(function (e) { return log.error(e); }); });
                }).bind(null, notification));
            }
            return notificationEventPromiseFns.reduce(function (p, fn) {
                return p = p.then(fn);
            }, Promise.resolve());
        })
            .catch(function (e) {
            log.debug('Failed to display a notification:', e);
            if (ServiceWorker.UNSUBSCRIBED_FROM_NOTIFICATIONS) {
                log.debug('Because we have just unsubscribed from notifications, we will not show anything.');
            }
            else {
                log.debug("Because a notification failed to display, we'll display the last known notification, so long as it isn't the welcome notification.");
                return ServiceWorker.displayBackupNotification();
            }
        }));
    };
    /**
     * Makes a POST call to a specified URL to forward certain events.
     * @param event The name of the webhook event. Affects the DB key pulled for settings and the final event the user
     *              consumes.
     * @param notification A JSON object containing notification details the user consumes.
     * @returns {Promise}
     */
    ServiceWorker.executeWebhooks = function (event, notification) {
        return __awaiter(this, void 0, void 0, function () {
            var deviceId, isServerCorsEnabled, webhookTargetUrl, postData, fetchOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Database_1.default.getSubscription()];
                    case 1:
                        deviceId = (_a.sent()).deviceId;
                        return [4 /*yield*/, Database_1.default.get('Options', 'webhooks.cors')];
                    case 2:
                        isServerCorsEnabled = _a.sent();
                        return [4 /*yield*/, Database_1.default.get('Options', "webhooks." + event)];
                    case 3:
                        webhookTargetUrl = _a.sent();
                        if (!webhookTargetUrl)
                            return [3 /*break*/, 5];
                        postData = {
                            event: event,
                            id: notification.id,
                            userId: deviceId,
                            action: notification.action,
                            buttons: notification.buttons,
                            heading: notification.heading,
                            content: notification.content,
                            url: notification.url,
                            icon: notification.icon,
                            data: notification.data
                        };
                        fetchOptions = {
                            method: 'post',
                            mode: 'no-cors',
                            body: JSON.stringify(postData),
                        };
                        if (isServerCorsEnabled) {
                            fetchOptions.mode = 'cors';
                            fetchOptions.headers = {
                                'X-OneSignal-Event': event,
                                'Content-Type': 'application/json'
                            };
                        }
                        log.debug("Executing " + event + " webhook " + (isServerCorsEnabled ? 'with' : 'without') + " CORS %cPOST " + webhookTargetUrl, utils_1.getConsoleStyle('code'), ':', postData);
                        return [4 /*yield*/, fetch(webhookTargetUrl, fetchOptions)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets an array of active window clients along with whether each window client is the HTTP site's iFrame or an
     * HTTPS site page.
     * An active window client is a browser tab that is controlled by the service worker.
     * Technically, this list should only ever contain clients that are iFrames, or clients that are HTTPS site pages,
     * and not both. This doesn't really matter though.
     * @returns {Promise}
     */
    ServiceWorker.getActiveClients = function () {
        return __awaiter(this, void 0, void 0, function () {
            var windowClients, activeClients, _i, windowClients_1, client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, self.clients.matchAll({ type: 'window', includeUncontrolled: true })];
                    case 1:
                        windowClients = _a.sent();
                        activeClients = [];
                        for (_i = 0, windowClients_1 = windowClients; _i < windowClients_1.length; _i++) {
                            client = windowClients_1[_i];
                            // Test if this window client is the HTTP subdomain iFrame pointing to subdomain.onesignal.com
                            if (client.frameType && client.frameType === 'nested') {
                                // Subdomain iFrames point to 'https://subdomain.onesignal.com...'
                                if ((Environment_1.default.isDev() && !utils_1.contains(client.url, vars_1.DEV_FRAME_HOST)) ||
                                    !Environment_1.default.isDev() && !utils_1.contains(client.url, '.onesignal.com') ||
                                    Environment_1.default.isStaging() && !utils_1.contains(client.url, vars_1.STAGING_FRAME_HOST)) {
                                    continue;
                                }
                                // Indicates this window client is an HTTP subdomain iFrame
                                client.isSubdomainIframe = true;
                            }
                            activeClients.push(client);
                        }
                        return [2 /*return*/, activeClients];
                }
            });
        });
    };
    /**
     * Constructs a structured notification object from the raw notification fetched from OneSignal's server. This
     * object is passed around from event to event, and is also returned to the host page for notification event details.
     * Constructed in onPushReceived, and passed along to other event handlers.
     * @param rawNotification The raw notification JSON returned from OneSignal's server.
     */
    ServiceWorker.buildStructuredNotificationObject = function (rawNotification) {
        var notification = {
            id: rawNotification.custom.i,
            heading: rawNotification.title,
            content: rawNotification.alert,
            data: rawNotification.custom.a,
            url: rawNotification.custom.u,
            icon: rawNotification.icon
        };
        // Add action buttons
        if (rawNotification.o) {
            notification.buttons = [];
            for (var _i = 0, _a = rawNotification.o; _i < _a.length; _i++) {
                var rawButton = _a[_i];
                notification.buttons.push({
                    action: rawButton.i,
                    title: rawButton.n,
                    icon: rawButton.p,
                    url: rawButton.u
                });
            }
        }
        return utils_1.trimUndefined(notification);
    };
    /**
     * Given an image URL, returns a proxied HTTPS image using the https://images.weserv.nl service.
     * For a null image, returns null so that no icon is displayed.
     * If the image protocol is HTTPS, or origin contains localhost or starts with 192.168.*.*, we do not proxy the image.
     * @param imageUrl An HTTP or HTTPS image URL.
     */
    ServiceWorker.ensureImageResourceHttps = function (imageUrl) {
        if (imageUrl) {
            try {
                var parsedImageUrl = new URL(imageUrl);
                if (parsedImageUrl.hostname === 'localhost' ||
                    parsedImageUrl.hostname.indexOf('192.168') !== -1 ||
                    parsedImageUrl.hostname === '127.0.0.1' ||
                    parsedImageUrl.protocol === 'https:') {
                    return imageUrl;
                }
                if (parsedImageUrl.hostname === 'i0.wp.com' ||
                    parsedImageUrl.hostname === 'i1.wp.com' ||
                    parsedImageUrl.hostname === 'i2.wp.com' ||
                    parsedImageUrl.hostname === 'i3.wp.com') {
                    /* Their site already uses Jetpack, just make sure Jetpack is HTTPS */
                    return "https://" + parsedImageUrl.hostname + parsedImageUrl.pathname;
                }
                /* HTTPS origin hosts can be used by prefixing the hostname with ssl: */
                var replacedImageUrl = parsedImageUrl.host + parsedImageUrl.pathname;
                return "https://i0.wp.com/" + replacedImageUrl;
            }
            catch (e) { }
        }
        else
            return null;
    };
    /**
     * Given a structured notification object, HTTPS-ifies the notification icon and action button icons, if they exist.
     */
    ServiceWorker.ensureNotificationResourcesHttps = function (notification) {
        if (notification) {
            if (notification.icon) {
                notification.icon = ServiceWorker.ensureImageResourceHttps(notification.icon);
            }
            if (notification.buttons && notification.buttons.length > 0) {
                for (var _i = 0, _a = notification.buttons; _i < _a.length; _i++) {
                    var button = _a[_i];
                    if (button.icon) {
                        button.icon = ServiceWorker.ensureImageResourceHttps(button.icon);
                    }
                }
            }
        }
    };
    /**
     * Actually displays a visible notification to the user.
     * Any event needing to display a notification calls this so that all the display options can be centralized here.
     * @param notification A structured notification object.
     */
    ServiceWorker.displayNotification = function (notification, overrides) {
        log.debug("Called %cdisplayNotification(" + JSON.stringify(notification, null, 4) + "):", utils_1.getConsoleStyle('code'), notification);
        return Promise.all([
            // Use the default title if one isn't provided
            ServiceWorker._getTitle(),
            // Use the default icon if one isn't provided
            Database_1.default.get('Options', 'defaultIcon'),
            // Get option of whether we should leave notification displaying indefinitely
            Database_1.default.get('Options', 'persistNotification'),
            // Get app ID for tag value
            Database_1.default.get('Ids', 'appId')
        ])
            .then(function (_a) {
            var defaultTitle = _a[0], defaultIcon = _a[1], persistNotification = _a[2], appId = _a[3];
            notification.heading = notification.heading ? notification.heading : defaultTitle;
            notification.icon = notification.icon ? notification.icon : (defaultIcon ? defaultIcon : undefined);
            var extra = {};
            extra.tag = "" + appId;
            extra.persistNotification = persistNotification;
            // Allow overriding some values
            if (!overrides)
                overrides = {};
            notification = objectAssign(notification, overrides);
            ServiceWorker.ensureNotificationResourcesHttps(notification);
            var notificationOptions = {
                body: notification.content,
                icon: notification.icon,
                /*
                 On Chrome 44+, use this property to store extra information which you can read back when the
                 notification gets invoked from a notification click or dismissed event. We serialize the
                 notification in the 'data' field and read it back in other events. See:
                 https://developers.google.com/web/updates/2015/05/notifying-you-of-changes-to-notifications?hl=en
                 */
                data: notification,
                /*
                 On Chrome 48+, action buttons show below the message body of the notification. Clicking either
                 button takes the user to a link. See:
                 https://developers.google.com/web/updates/2016/01/notification-actions
                 */
                actions: notification.buttons,
                /*
                 Tags are any string value that groups notifications together. Two or notifications sharing a tag
                 replace each other.
                 */
                tag: extra.tag,
                /*
                 On Chrome 47+ (desktop), notifications will be dismissed after 20 seconds unless requireInteraction
                 is set to true. See:
                 https://developers.google.com/web/updates/2015/10/notification-requireInteractiom
                 */
                requireInteraction: extra.persistNotification,
                /*
                 On Chrome 50+, by default notifications replacing identically-tagged notifications no longer
                 vibrate/signal the user that a new notification has come in. This flag allows subsequent
                 notifications to re-alert the user. See:
                 https://developers.google.com/web/updates/2016/03/notifications
                 */
                renotify: true
            };
            return self.registration.showNotification(notification.heading, notificationOptions);
        });
    };
    /**
     * Stores the most recent notification into IndexedDB so that it can be shown as a backup if a notification fails
     * to be displayed. This is to avoid Chrome's forced "This site has been updated in the background" message. See
     * this post for more details: http://stackoverflow.com/a/35045513/555547.
     * This is called every time is a push message is received so that the most recent message can be used as the
     * backup notification.
     * @param notification The most recent notification as a structured notification object.
     */
    ServiceWorker.updateBackupNotification = function (notification) {
        return __awaiter(this, void 0, void 0, function () {
            var isWelcomeNotification;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isWelcomeNotification = notification.data && notification.data.__isOneSignalWelcomeNotification;
                        // Don't save the welcome notification, that just looks broken
                        if (isWelcomeNotification)
                            return [2 /*return*/];
                        return [4 /*yield*/, Database_1.default.put('Ids', { type: 'backupNotification', id: notification })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Displays a fail-safe notification during a push event in case notification contents could not be retrieved.
     * This is to avoid Chrome's forced "This site has been updated in the background" message. See this post for
     * more details: http://stackoverflow.com/a/35045513/555547.
     */
    ServiceWorker.displayBackupNotification = function () {
        return Database_1.default.get('Ids', 'backupNotification')
            .then(function (backupNotification) {
            var overrides = {
                // Don't persist our backup notification; users should ideally not see them
                persistNotification: false,
                data: { __isOneSignalBackupNotification: true }
            };
            if (backupNotification) {
                return ServiceWorker.displayNotification(backupNotification, overrides);
            }
            else {
                return ServiceWorker.displayNotification({
                    content: 'You have new updates.'
                }, overrides);
            }
        });
    };
    /**
     * Returns false if the given URL matches a few special URLs designed to skip opening a URL when clicking a
     * notification. Otherwise returns true and the link will be opened.
     * @param url
       */
    ServiceWorker.shouldOpenNotificationUrl = function (url) {
        return (url !== 'javascript:void(0);' &&
            url !== 'do_not_open' &&
            !utils_1.contains(url, '_osp=do_not_open'));
    };
    /**
     * Occurs when a notification is dismissed by the user (clicking the 'X') or all notifications are cleared.
     * Supported on: Chrome 50+ only
     */
    ServiceWorker.onNotificationClosed = function (event) {
        log.debug("Called %conNotificationClosed(" + JSON.stringify(event, null, 4) + "):", utils_1.getConsoleStyle('code'), event);
        var notification = event.notification.data;
        swivel.broadcast('notification.dismissed', notification);
        event.waitUntil(ServiceWorker.executeWebhooks('notification.dismissed', notification));
    };
    /**
     * After clicking a notification, determines the URL to open based on whether an action button was clicked or the
     * notification body was clicked.
     */
    ServiceWorker.getNotificationUrlToOpen = function (notification) {
        return __awaiter(this, void 0, void 0, function () {
            var launchUrl, dbDefaultNotificationUrl, _i, _a, button;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        launchUrl = self.registration.scope;
                        return [4 /*yield*/, Database_1.default.getAppState()];
                    case 1:
                        dbDefaultNotificationUrl = (_b.sent()).defaultNotificationUrl;
                        if (dbDefaultNotificationUrl)
                            launchUrl = dbDefaultNotificationUrl;
                        // If the user clicked an action button, use the URL provided by the action button
                        // Unless the action button URL is null
                        if (notification.action) {
                            // Find the URL tied to the action button that was clicked
                            for (_i = 0, _a = notification.buttons; _i < _a.length; _i++) {
                                button = _a[_i];
                                if (button.action === notification.action &&
                                    button.url &&
                                    button.url !== '') {
                                    launchUrl = button.url;
                                }
                            }
                        }
                        else if (notification.url &&
                            notification.url !== '') {
                            // The user clicked the notification body instead of an action button
                            launchUrl = notification.url;
                        }
                        return [2 /*return*/, launchUrl];
                }
            });
        });
    };
    /**
     * Occurs when the notification's body or action buttons are clicked. Does not occur if the notification is
     * dismissed by clicking the 'X' icon. See the notification close event for the dismissal event.
     */
    ServiceWorker.onNotificationClicked = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var notification, notificationClickHandlerMatch, matchPreference, activeClients, launchUrl, notificationOpensLink, doNotOpenLink, _i, activeClients_1, client, clientUrl, lastKnownHostUrl, clientOrigin, launchOrigin, appId, deviceId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug("Called %conNotificationClicked(" + JSON.stringify(event, null, 4) + "):", utils_1.getConsoleStyle('code'), event);
                        // Close the notification first here, before we do anything that might fail
                        event.notification.close();
                        notification = event.notification.data;
                        // Chrome 48+: Get the action button that was clicked
                        if (event.action)
                            notification.action = event.action;
                        notificationClickHandlerMatch = 'exact';
                        return [4 /*yield*/, Database_1.default.get('Options', 'notificationClickHandlerMatch')];
                    case 1:
                        matchPreference = _a.sent();
                        if (matchPreference)
                            notificationClickHandlerMatch = matchPreference;
                        return [4 /*yield*/, ServiceWorker.getActiveClients()];
                    case 2:
                        activeClients = _a.sent();
                        return [4 /*yield*/, ServiceWorker.getNotificationUrlToOpen(notification)];
                    case 3:
                        launchUrl = _a.sent();
                        notificationOpensLink = ServiceWorker.shouldOpenNotificationUrl(launchUrl);
                        doNotOpenLink = false;
                        _i = 0, activeClients_1 = activeClients;
                        _a.label = 4;
                    case 4:
                        if (!(_i < activeClients_1.length))
                            return [3 /*break*/, 9];
                        client = activeClients_1[_i];
                        clientUrl = client.url;
                        if (!client.isSubdomainIframe)
                            return [3 /*break*/, 7];
                        return [4 /*yield*/, Database_1.default.get('Options', 'lastKnownHostUrl')];
                    case 5:
                        lastKnownHostUrl = _a.sent();
                        clientUrl = lastKnownHostUrl;
                        if (!!lastKnownHostUrl)
                            return [3 /*break*/, 7];
                        return [4 /*yield*/, Database_1.default.get('Options', 'defaultUrl')];
                    case 6:
                        clientUrl = _a.sent();
                        _a.label = 7;
                    case 7:
                        clientOrigin = '';
                        try {
                            clientOrigin = new URL(clientUrl).origin;
                        }
                        catch (e) {
                            log.error("Failed to get the HTTP site's actual origin:", e);
                        }
                        launchOrigin = null;
                        try {
                            // Check if the launchUrl is valid; it can be null
                            launchOrigin = new URL(launchUrl).origin;
                        }
                        catch (e) {
                        }
                        if ((notificationClickHandlerMatch === 'exact' && clientUrl === launchUrl) ||
                            (notificationClickHandlerMatch === 'origin' && clientOrigin === launchOrigin)) {
                            client.focus();
                            swivel.emit(client.id, 'notification.clicked', notification);
                            doNotOpenLink = true;
                        }
                        _a.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 4];
                    case 9: return [4 /*yield*/, Database_1.default.put("NotificationOpened", { url: launchUrl, data: notification, timestamp: Date.now() })];
                    case 10:
                        _a.sent();
                        if (!(notificationOpensLink && !doNotOpenLink))
                            return [3 /*break*/, 12];
                        return [4 /*yield*/, ServiceWorker.openUrl(launchUrl)];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12: return [4 /*yield*/, Database_1.default.getAppConfig()];
                    case 13:
                        appId = (_a.sent()).appId;
                        return [4 /*yield*/, Database_1.default.getSubscription()];
                    case 14:
                        deviceId = (_a.sent()).deviceId;
                        if (!(appId && deviceId))
                            return [3 /*break*/, 16];
                        return [4 /*yield*/, OneSignalApi_1.default.put('notifications/' + notification.id, {
                                app_id: appId,
                                player_id: deviceId,
                                opened: true
                            })];
                    case 15: return [2 /*return*/, _a.sent()];
                    case 16: return [4 /*yield*/, ServiceWorker.executeWebhooks('notification.clicked', notification)];
                    case 17: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Attempts to open the given url in a new browser tab. Called when a notification is clicked.
     * @param url May not be well-formed.
     */
    ServiceWorker.openUrl = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('Opening notification URL:', url);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, self.clients.openWindow(url)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        e_1 = _a.sent();
                        log.warn("Failed to open the URL '" + url + "':", e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ServiceWorker.onServiceWorkerInstalled = function (event) {
        // At this point, the old service worker is still in control
        log.debug("Called %conServiceWorkerInstalled(" + JSON.stringify(event, null, 4) + "):", utils_1.getConsoleStyle('code'), event);
        log.info("Installing service worker: %c" + self.location.pathname, utils_1.getConsoleStyle('code'), "(version " + Environment_1.default.version() + ")");
        if (utils_1.contains(self.location.pathname, "OneSignalSDKWorker.js"))
            var serviceWorkerVersionType = 'WORKER1_ONE_SIGNAL_SW_VERSION';
        else
            var serviceWorkerVersionType = 'WORKER2_ONE_SIGNAL_SW_VERSION';
        event.waitUntil(Database_1.default.put("Ids", { type: serviceWorkerVersionType, id: Environment_1.default.version() })
            .then(function () { return self.skipWaiting(); }));
    };
    /*
     1/11/16: Enable the waiting service worker to immediately become the active service worker: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
     */
    ServiceWorker.onServiceWorkerActivated = function (event) {
        // The old service worker is gone now
        log.debug("Called %conServiceWorkerActivated(" + JSON.stringify(event, null, 4) + "):", utils_1.getConsoleStyle('code'), event);
        var activationPromise = self.clients.claim()
            .then(function () { return Database_1.default.get('Ids', 'userId'); })
            .then(function (userId) {
            if (self.registration && userId) {
                return ServiceWorker._subscribeForPush(self.registration).catch(function (e) { return log.error(e); });
            }
        });
        event.waitUntil(activationPromise);
    };
    ServiceWorker.onFetch = function (event) {
        event.respondWith(fetch(event.request));
    };
    ServiceWorker.onPushSubscriptionChange = function (event) {
        // Subscription expired
        log.debug("Called %conPushSubscriptionChange(" + JSON.stringify(event, null, 4) + "):", utils_1.getConsoleStyle('code'), event);
        event.waitUntil(ServiceWorker._subscribeForPush(self.registration));
    };
    /**
     * Simulates a service worker event.
     * @param eventName An event name like 'pushsubscriptionchange'.
     */
    ServiceWorker.simulateEvent = function (eventName) {
        self.dispatchEvent(new ExtendableEvent(eventName));
    };
    ServiceWorker._subscribeForPush = function (serviceWorkerRegistration) {
        log.debug("Called %c_subscribeForPush()", utils_1.getConsoleStyle('code'));
        var appId = null;
        return Database_1.default.get('Ids', 'appId')
            .then(function (retrievedAppId) {
            appId = retrievedAppId;
            return serviceWorkerRegistration.pushManager.getSubscription();
        }).then(function (oldSubscription) {
            log.debug("Resubscribing old subscription", oldSubscription, "within the service worker ...");
            // Only re-subscribe if there was an existing subscription and we are on Chrome 54+ wth PushSubscriptionOptions
            // Otherwise there's really no way to resubscribe since we don't have the manifest.json sender ID
            if (oldSubscription && oldSubscription.options) {
                return serviceWorkerRegistration.pushManager.subscribe(oldSubscription.options);
            }
            else {
                return Promise.resolve();
            }
        }).then(function (subscription) {
            var subscriptionInfo = null;
            if (subscription) {
                subscriptionInfo = {};
                log.debug("Finished resubscribing for push:", subscription);
                if (typeof subscription.subscriptionId != "undefined") {
                    // Chrome 43 & 42
                    subscriptionInfo.endpointOrToken = subscription.subscriptionId;
                }
                else {
                    // Chrome 44+ and FireFox
                    // 4/13/16: We now store the full endpoint instead of just the registration token
                    subscriptionInfo.endpointOrToken = subscription.endpoint;
                }
                // 4/13/16: Retrieve p256dh and auth for new encrypted web push protocol in Chrome 50
                if (subscription.getKey) {
                    // p256dh and auth are both ArrayBuffer
                    var p256dh = null;
                    try {
                        p256dh = subscription.getKey('p256dh');
                    }
                    catch (e) {
                    }
                    var auth = null;
                    try {
                        auth = subscription.getKey('auth');
                    }
                    catch (e) {
                    }
                    if (p256dh) {
                        // Base64 encode the ArrayBuffer (not URL-Safe, using standard Base64)
                        var p256dh_base64encoded = btoa(String.fromCharCode.apply(null, new Uint8Array(p256dh)));
                        subscriptionInfo.p256dh = p256dh_base64encoded;
                    }
                    if (auth) {
                        // Base64 encode the ArrayBuffer (not URL-Safe, using standard Base64)
                        var auth_base64encoded = btoa(String.fromCharCode.apply(null, new Uint8Array(auth)));
                        subscriptionInfo.auth = auth_base64encoded;
                    }
                }
            }
            else {
                log.info('Could not subscribe your browser for push notifications.');
            }
            return ServiceWorker.registerWithOneSignal(appId, subscriptionInfo);
        });
    };
    /**
     * Creates a new or updates an existing OneSignal user (player) on the server.
     *
     * @param appId The app ID passed to init.
     *        subscriptionInfo A hash containing 'endpointOrToken', 'auth', and 'p256dh'.
     *
     * @remarks Called from both the host page and HTTP popup.
     *          If a user already exists and is subscribed, updates the session count by calling /players/:id/on_session; otherwise, a new player is registered via the /players endpoint.
     *          Saves the user ID and registration ID to the local web database after the response from OneSignal.
     */
    ServiceWorker.registerWithOneSignal = function (appId, subscriptionInfo) {
        var deviceType = utils_1.getDeviceTypeForBrowser();
        return Promise.all([
            Database_1.default.get('Ids', 'userId'),
        ])
            .then(function (_a) {
            var userId = _a[0], subscription = _a[1];
            if (!userId) {
                return Promise.reject('No user ID found; cannot update existing player info');
            }
            var requestUrl = "players/" + userId;
            var requestData = {
                app_id: appId,
                device_type: deviceType,
                language: Environment_1.default.getLanguage(),
                timezone: new Date().getTimezoneOffset() * -60,
                device_model: navigator.platform + " " + Browser.name,
                device_os: Browser.version,
                sdk: ServiceWorker.VERSION,
            };
            if (subscriptionInfo) {
                requestData.identifier = subscriptionInfo.endpointOrToken;
                // Although we're passing the full endpoint to OneSignal, we still need to store only the registration ID for our SDK API getRegistrationId()
                // Parse out the registration ID from the full endpoint URL and save it to our database
                var registrationId = subscriptionInfo.endpointOrToken.replace(new RegExp("^(https://android.googleapis.com/gcm/send/|https://updates.push.services.mozilla.com/push/)"), "");
                Database_1.default.put("Ids", { type: "registrationId", id: registrationId });
                // New web push standard in Firefox 46+ and Chrome 50+ includes 'auth' and 'p256dh' in PushSubscription
                if (subscriptionInfo.auth) {
                    requestData.web_auth = subscriptionInfo.auth;
                }
                if (subscriptionInfo.p256dh) {
                    requestData.web_p256 = subscriptionInfo.p256dh;
                }
            }
            return OneSignalApi_1.default.put(requestUrl, requestData);
        })
            .then(function (response) {
            if (response) {
                if (!response.success) {
                    log.error('Resubscription registration with OneSignal failed:', response);
                }
                var userId = response.id;
                if (userId) {
                    Database_1.default.put("Ids", { type: "userId", id: userId });
                }
            }
            else {
                // No user ID found, this returns undefined
                log.debug('Resubscription registration failed because no user ID found.');
            }
        });
    };
    /**
     * Returns a promise that is fulfilled with either the default title from the database (first priority) or the page title from the database (alternate result).
     */
    ServiceWorker._getTitle = function () {
        return new Promise(function (resolve, reject) {
            Promise.all([Database_1.default.get('Options', 'defaultTitle'), Database_1.default.get('Options', 'pageTitle')])
                .then(function (_a) {
                var defaultTitle = _a[0], pageTitle = _a[1];
                if (defaultTitle !== null) {
                    resolve(defaultTitle);
                }
                else if (pageTitle != null) {
                    resolve(pageTitle);
                }
                else {
                    resolve('');
                }
            });
        });
    };
    /**
     * Returns an array of raw notification objects, either fetched from the server (as from legacy GCM push), or read
     * from the event.data.payload property (as from the new web push protocol).
     * @param event
     * @returns An array of notifications. The new web push protocol will only ever contain one notification, however
     * an array is returned for backwards compatibility with the rest of the service worker plumbing.
       */
    ServiceWorker.parseOrFetchNotifications = function (event) {
        if (event.data) {
            var isValidPayload = ServiceWorker.isValidPushPayload(event.data);
            if (isValidPayload) {
                log.debug('Received a valid encrypted push payload.');
                return Promise.resolve([event.data.json()]);
            }
            else {
                return Promise.reject('Unexpected push message payload received: ' + event.data.text());
            }
        }
        else
            return ServiceWorker.retrieveNotifications();
    };
    /**
     * Returns true if the raw data payload is a OneSignal push message in the format of the new web push protocol.
     * Otherwise returns false.
     * @param rawData The raw PushMessageData from the push event's event.data, not already parsed to JSON.
     */
    ServiceWorker.isValidPushPayload = function (rawData) {
        try {
            var payload = rawData.json();
            if (payload &&
                payload.custom &&
                payload.custom.i &&
                utils_1.isValidUuid(payload.custom.i)) {
                return true;
            }
            else {
                log.debug('isValidPushPayload: Valid JSON but missing notification UUID:', payload);
                return false;
            }
        }
        catch (e) {
            log.debug('isValidPushPayload: Parsing to JSON failed with:', e);
            return false;
        }
    };
    /**
     * Retrieves unread notifications from OneSignal's servers. For Chrome and Firefox's legacy web push protocol,
     * a push signal is sent to the service worker without any message contents, and the service worker must retrieve
     * the contents from OneSignal's servers. In Chrome and Firefox's new web push protocols involving payloads, the
     * notification contents will arrive with the push signal. The legacy format must be supported for a while.
     */
    ServiceWorker.retrieveNotifications = function () {
        return new Promise(function (resolve, reject) {
            var notifications = [];
            // Each entry is like:
            /*
             Object {custom: Object, icon: "https://onesignal.com/images/notification_logo.png", alert: "asd", title: "ss"}
             alert: "asd"
             custom: Object
             i: "6d7ec82f-bc56-494f-b73a-3a3b48baa2d8"
             __proto__: Object
             icon: "https://onesignal.com/images/notification_logo.png"
             title: "ss"
             __proto__: Object
             */
            Database_1.default.get('Ids', 'userId')
                .then(function (userId) {
                if (userId) {
                    log.debug("Legacy push signal received, retrieving contents from players/" + userId + "/chromeweb_notification");
                    return OneSignalApi_1.default.get("players/" + userId + "/chromeweb_notification");
                }
                else {
                    log.debug('Tried to get notification contents, but IndexedDB is missing user ID info.');
                    return Promise.all([
                        Database_1.default.get('Ids', 'appId'),
                        self.registration.pushManager.getSubscription().then(function (subscription) { return subscription.endpoint; })
                    ])
                        .then(function (_a) {
                        var appId = _a[0], identifier = _a[1];
                        var deviceType = utils_1.getDeviceTypeForBrowser();
                        // Get the user ID from OneSignal
                        return OneSignalApi_1.default.getUserIdFromSubscriptionIdentifier(appId, deviceType, identifier).then(function (recoveredUserId) {
                            if (recoveredUserId) {
                                log.debug('Recovered OneSignal user ID:', recoveredUserId);
                                // We now have our OneSignal user ID again
                                return Promise.all([
                                    Database_1.default.put('Ids', { type: 'userId', id: recoveredUserId }),
                                    Database_1.default.put('Ids', {
                                        type: 'registrationId',
                                        id: identifier.replace(new RegExp("^(https://android.googleapis.com/gcm/send/|https://updates.push.services.mozilla.com/push/)"), "")
                                    }),
                                ]).then(function () {
                                    // Try getting the notification again
                                    log.debug('Attempting to retrieve the notification again now with a recovered user ID.');
                                    return OneSignalApi_1.default.get("players/" + recoveredUserId + "/chromeweb_notification");
                                });
                            }
                            else {
                                return Promise.reject('Recovered user ID was null. Unsubscribing from push notifications.');
                            }
                        });
                    })
                        .catch(function (error) {
                        log.debug('Unsuccessfully attempted to recover OneSignal user ID:', error);
                        // Actually unsubscribe from push so this user doesn't get bothered again
                        return self.registration.pushManager.getSubscription()
                            .then(function (subscription) {
                            return subscription.unsubscribe();
                        })
                            .then(function (unsubscriptionResult) {
                            log.debug('Unsubscribed from push notifications result:', unsubscriptionResult);
                            ServiceWorker.UNSUBSCRIBED_FROM_NOTIFICATIONS = true;
                        });
                    });
                }
            })
                .then(function (response) {
                // The response is an array literal -- response.json() has been called by apiCall()
                // The result looks like this:
                // OneSignalApi.get('players/7442a553-5f61-4b3e-aedd-bb574ef6946f/chromeweb_notification').then(function(response) { log.debug(response); });
                // ["{"custom":{"i":"6d7ec82f-bc56-494f-b73a-3a3b48baa2d8"},"icon":"https://onesignal.com/images/notification_logo.png","alert":"asd","title":"ss"}"]
                // ^ Notice this is an array literal with JSON data inside
                for (var i = 0; i < response.length; i++) {
                    notifications.push(JSON.parse(response[i]));
                }
                if (notifications.length == 0) {
                    log.warn('OneSignal Worker: Received a GCM push signal, but there were no messages to retrieve. Are you' +
                        ' using the wrong API URL?', vars_1.API_URL);
                }
                resolve(notifications);
            });
        });
    };
    return ServiceWorker;
}());
// Expose this class to the global scope
self.OneSignalWorker = ServiceWorker;
// Set logging to the appropriate level
log.setDefaultLevel(Environment_1.default.isDev() ? log.levels.TRACE : log.levels.ERROR);
// Print it's happy time!
log.info("%cOneSignal Service Worker loaded (version " + Environment_1.default.version() + ", " + Environment_1.default.getEnv() + " environment).", utils_1.getConsoleStyle('bold'));
// Run our main file
ServiceWorker.run();
//# sourceMappingURL=ServiceWorker.js.map
});

;require.register("build/src/utils.js", function(exports, require, module) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
///<reference path="models/Action.ts"/>
var log = require("loglevel");
var Browser = require("bowser");
var Environment_1 = require("./Environment");
var IndexedDb_1 = require("./IndexedDb");
var Database_1 = require("./Database");
var PushNotSupportedError_1 = require("./errors/PushNotSupportedError");
var SubscriptionHelper_1 = require("./helpers/SubscriptionHelper");
function isArray(variable) {
    return Object.prototype.toString.call(variable) === '[object Array]';
}
exports.isArray = isArray;
var decodeTextArea = null;
function decodeHtmlEntities(text) {
    if (Environment_1.default.isBrowser()) {
        if (!decodeTextArea) {
            decodeTextArea = document.createElement("textarea");
        }
    }
    if (decodeTextArea) {
        decodeTextArea.innerHTML = text;
        return decodeTextArea.value;
    }
    else {
        // Not running in a browser environment, text cannot be decoded
        return text;
    }
}
exports.decodeHtmlEntities = decodeHtmlEntities;
function isPushNotificationsSupported() {
    if (Browser.ios || Browser.ipod || Browser.iphone || Browser.ipad)
        return false;
    if (Browser.msedge || Browser.msie)
        return false;
    /* Firefox on Android push notifications not supported until at least 48: https://bugzilla.mozilla.org/show_bug.cgi?id=1206207#c6 */
    if (Browser.firefox && Number(Browser.version) < 48 && (Browser.mobile || Browser.tablet)) {
        return false;
    }
    if (Browser.firefox && Number(Browser.version) >= 44)
        return true;
    if (Browser.safari && Number(Browser.version) >= 7.1)
        return true;
    // Android Chrome WebView
    if (navigator.appVersion.match(/ wv/))
        return false;
    if (Browser.chrome && Number(Browser.version) >= 42)
        return true;
    if (Browser.yandexbrowser && Number(Browser.version) >= 15.12)
        return true;
    // https://www.chromestatus.com/feature/5416033485586432
    if (Browser.opera && Browser.mobile && Number(Browser.version) >= 37)
        return true;
    return false;
}
exports.isPushNotificationsSupported = isPushNotificationsSupported;
function removeDomElement(selector) {
    var els = document.querySelectorAll(selector);
    if (els.length > 0) {
        for (var i = 0; i < els.length; i++)
            els[i].parentNode.removeChild(els[i]);
    }
}
exports.removeDomElement = removeDomElement;
/**
 * Helper method for public APIs that waits until OneSignal is initialized, rejects if push notifications are
 * not supported, and wraps these tasks in a Promise.
 */
function awaitOneSignalInitAndSupported() {
    return new Promise(function (resolve, reject) {
        if (!isPushNotificationsSupported()) {
            throw new PushNotSupportedError_1.default();
        }
        if (!OneSignal.initialized) {
            OneSignal.once(OneSignal.EVENTS.SDK_INITIALIZED, resolve);
        }
        else {
            resolve();
        }
    });
}
exports.awaitOneSignalInitAndSupported = awaitOneSignalInitAndSupported;
/**
 * JSON.stringify() but converts functions to "[Function]" so they aren't lost.
 * Helps when logging method calls.
 */
function stringify(obj) {
    return JSON.stringify(obj, function (key, value) {
        if (typeof value === 'function') {
            return "[Function]";
        }
        else {
            return value;
        }
    }, 4);
}
exports.stringify = stringify;
function executeCallback(callback) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (callback) {
        return callback.apply(null, args);
    }
}
exports.executeCallback = executeCallback;
function logMethodCall(methodName) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return log.debug("Called %c" + methodName + "(" + args.map(stringify).join(', ') + ")", getConsoleStyle('code'), '.');
}
exports.logMethodCall = logMethodCall;
function isValidEmail(email) {
    return !!email &&
        !!email.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);
}
exports.isValidEmail = isValidEmail;
function addDomElement(targetSelectorOrElement, addOrder, elementHtml) {
    if (typeof targetSelectorOrElement === 'string')
        document.querySelector(targetSelectorOrElement).insertAdjacentHTML(addOrder, elementHtml);
    else if (typeof targetSelectorOrElement === 'object')
        targetSelectorOrElement.insertAdjacentHTML(addOrder, elementHtml);
    else
        throw new Error(targetSelectorOrElement + " must be a CSS selector string or DOM Element object.");
}
exports.addDomElement = addDomElement;
function clearDomElementChildren(targetSelectorOrElement) {
    if (typeof targetSelectorOrElement === 'string') {
        var element = document.querySelector(targetSelectorOrElement);
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
    else if (typeof targetSelectorOrElement === 'object') {
        while (targetSelectorOrElement.firstChild) {
            targetSelectorOrElement.removeChild(targetSelectorOrElement.firstChild);
        }
    }
    else
        throw new Error(targetSelectorOrElement + " must be a CSS selector string or DOM Element object.");
}
exports.clearDomElementChildren = clearDomElementChildren;
function addCssClass(targetSelectorOrElement, cssClass) {
    if (typeof targetSelectorOrElement === 'string')
        document.querySelector(targetSelectorOrElement).classList.add(cssClass);
    else if (typeof targetSelectorOrElement === 'object')
        targetSelectorOrElement.classList.add(cssClass);
    else
        throw new Error(targetSelectorOrElement + " must be a CSS selector string or DOM Element object.");
}
exports.addCssClass = addCssClass;
function removeCssClass(targetSelectorOrElement, cssClass) {
    if (typeof targetSelectorOrElement === 'string')
        document.querySelector(targetSelectorOrElement).classList.remove(cssClass);
    else if (typeof targetSelectorOrElement === 'object')
        targetSelectorOrElement.classList.remove(cssClass);
    else
        throw new Error(targetSelectorOrElement + " must be a CSS selector string or DOM Element object.");
}
exports.removeCssClass = removeCssClass;
function hasCssClass(targetSelectorOrElement, cssClass) {
    if (typeof targetSelectorOrElement === 'string')
        return document.querySelector(targetSelectorOrElement).classList.contains(cssClass);
    else if (typeof targetSelectorOrElement === 'object')
        return targetSelectorOrElement.classList.contains(cssClass);
    else
        throw new Error(targetSelectorOrElement + " must be a CSS selector string or DOM Element object.");
}
exports.hasCssClass = hasCssClass;
var DEVICE_TYPES = {
    CHROME: 5,
    SAFARI: 7,
    FIREFOX: 8,
};
function getDeviceTypeForBrowser() {
    if (Browser.chrome || Browser.yandexbrowser || Browser.opera) {
        return DEVICE_TYPES.CHROME;
    }
    else if (Browser.firefox) {
        return DEVICE_TYPES.FIREFOX;
    }
    else if (Browser.safari) {
        return DEVICE_TYPES.SAFARI;
    }
}
exports.getDeviceTypeForBrowser = getDeviceTypeForBrowser;
function getConsoleStyle(style) {
    if (style == 'code') {
        return "\n    padding: 0 1px 1px 5px;\n    border: 1px solid #ddd;\n    border-radius: 3px;\n    font-family: Monaco,\"DejaVu Sans Mono\",\"Courier New\",monospace;\n    color: #444;\n    ";
    }
    else if (style == 'bold') {
        return "\n      font-weight: 600;\n    color: rgb(51, 51, 51);\n    ";
    }
    else if (style == 'alert') {
        return "\n      font-weight: 600;\n    color: red;\n    ";
    }
    else if (style == 'event') {
        return "\n    color: green;\n    ";
    }
    else if (style == 'postmessage') {
        return "\n    color: orange;\n    ";
    }
    else if (style == 'serviceworkermessage') {
        return "\n    color: purple;\n    ";
    }
}
exports.getConsoleStyle = getConsoleStyle;
/**
 * Returns a promise for the setTimeout() method.
 * @param durationMs
 * @returns {Promise} Returns a promise that resolves when the timeout is complete.
 */
function delay(durationMs) {
    return new Promise(function (resolve) {
        setTimeout(resolve, durationMs);
    });
}
exports.delay = delay;
function nothing() {
    return Promise.resolve();
}
exports.nothing = nothing;
function executeAndTimeoutPromiseAfter(promise, milliseconds, displayError) {
    var timeoutPromise = new Promise(function (resolve) { return setTimeout(function () { return resolve('promise-timed-out'); }, milliseconds); });
    return Promise.race([promise, timeoutPromise]).then(function (value) {
        if (value === 'promise-timed-out') {
            log.info(displayError || "Promise " + promise + " timed out after " + milliseconds + " ms.");
            return Promise.reject(displayError || "Promise " + promise + " timed out after " + milliseconds + " ms.");
        }
        else
            return value;
    });
}
exports.executeAndTimeoutPromiseAfter = executeAndTimeoutPromiseAfter;
function when(condition, promiseIfTrue, promiseIfFalse) {
    if (promiseIfTrue === undefined)
        promiseIfTrue = nothing();
    if (promiseIfFalse === undefined)
        promiseIfFalse = nothing();
    return (condition ? promiseIfTrue : promiseIfFalse);
}
exports.when = when;
function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var crypto = window.crypto || window.msCrypto;
        if (crypto) {
            var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }
        else {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    });
}
exports.guid = guid;
/**
 * Returns true if match is in string; otherwise, returns false.
 */
function contains(indexOfAble, match) {
    if (!indexOfAble)
        return false;
    return indexOfAble.indexOf(match) !== -1;
}
exports.contains = contains;
/**
 * Returns the current object without keys that have undefined values.
 * Regardless of whether the return result is used, the passed-in object is destructively modified.
 * Only affects keys that the object directly contains (i.e. not those inherited via the object's prototype).
 * @param object
 */
function trimUndefined(object) {
    for (var property in object) {
        if (object.hasOwnProperty(property)) {
            if (object[property] === undefined) {
                delete object[property];
            }
        }
    }
    return object;
}
exports.trimUndefined = trimUndefined;
/**
 * Returns true if the UUID is a string of 36 characters;
 * @param uuid
 * @returns {*|boolean}
 */
function isValidUuid(uuid) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid);
}
exports.isValidUuid = isValidUuid;
/**
 * Returns the correct subdomain if 'https://subdomain.onesignal.com' or something similar is passed.
 */
function normalizeSubdomain(subdomain) {
    subdomain = subdomain.trim();
    var removeSubstrings = [
        'http://www.',
        'https://www.',
        'http://',
        'https://',
        '.onesignal.com/',
        '.onesignal.com'
    ];
    for (var _i = 0, removeSubstrings_1 = removeSubstrings; _i < removeSubstrings_1.length; _i++) {
        var removeSubstring = removeSubstrings_1[_i];
        subdomain = subdomain.replace(removeSubstring, '');
    }
    return subdomain.toLowerCase();
}
exports.normalizeSubdomain = normalizeSubdomain;
function getUrlQueryParam(name) {
    var url = window.location.href;
    url = url.toLowerCase(); // This is just to avoid case sensitiveness
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase(); // This is just to avoid case sensitiveness for query parameter name
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
exports.getUrlQueryParam = getUrlQueryParam;
/**
 * Wipe OneSignal-related IndexedDB data on the current origin. OneSignal does not have to be initialized to use this.
 */
function wipeLocalIndexedDb() {
    log.warn('OneSignal: Wiping local IndexedDB data.');
    return Promise.all([
        IndexedDb_1.default.remove('Ids'),
        IndexedDb_1.default.remove('NotificationOpened'),
        IndexedDb_1.default.remove('Options')
    ]);
}
exports.wipeLocalIndexedDb = wipeLocalIndexedDb;
/**
 * Wipe OneSignal-related IndexedDB data on the "correct" computed origin, but OneSignal must be initialized first to use.
 */
function wipeIndexedDb() {
    log.warn('OneSignal: Wiping IndexedDB data.');
    return Promise.all([
        Database_1.default.remove('Ids'),
        Database_1.default.remove('NotificationOpened'),
        Database_1.default.remove('Options')
    ]);
}
exports.wipeIndexedDb = wipeIndexedDb;
/**
 * Capitalizes the first letter of the string.
 * @returns {string} The string with the first letter capitalized.
 */
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
exports.capitalize = capitalize;
/**
 * Unsubscribe from push notifications without removing the active service worker.
 */
function unsubscribeFromPush() {
    log.warn('OneSignal: Unsubscribing from push.');
    if (Environment_1.default.isServiceWorker()) {
        return self.registration.pushManager.getSubscription()
            .then(function (subscription) {
            if (subscription) {
                return subscription.unsubscribe();
            }
            else
                throw new Error('Cannot unsubscribe because not subscribed.');
        });
    }
    else {
        if (SubscriptionHelper_1.default.isUsingSubscriptionWorkaround()) {
            return new Promise(function (resolve, reject) {
                log.debug("Unsubscribe from push got called, and we're going to remotely execute it in HTTPS iFrame.");
                OneSignal.iframePostmam.message(OneSignal.POSTMAM_COMMANDS.UNSUBSCRIBE_FROM_PUSH, null, function (reply) {
                    log.debug("Unsubscribe from push succesfully remotely executed.");
                    if (reply.data === OneSignal.POSTMAM_COMMANDS.REMOTE_OPERATION_COMPLETE) {
                        resolve();
                    }
                    else {
                        reject('Failed to remotely unsubscribe from push.');
                    }
                });
            });
        }
        else {
            if (!navigator.serviceWorker || !navigator.serviceWorker.controller)
                return Promise.resolve();
            return navigator.serviceWorker.ready
                .then(function (registration) { return registration.pushManager; })
                .then(function (pushManager) { return pushManager.getSubscription(); })
                .then(function (subscription) {
                if (subscription) {
                    return subscription.unsubscribe();
                }
            });
        }
    }
}
exports.unsubscribeFromPush = unsubscribeFromPush;
/**
 * Unregisters the active service worker.
 */
function wipeServiceWorker() {
    log.warn('OneSignal: Unregistering service worker.');
    if (Environment_1.default.isIframe()) {
        return;
    }
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller)
        return Promise.resolve();
    return navigator.serviceWorker.ready
        .then(function (registration) { return registration.unregister(); });
}
exports.wipeServiceWorker = wipeServiceWorker;
/**
 * Unsubscribe from push notifications and remove any active service worker.
 */
function wipeServiceWorkerAndUnsubscribe() {
    return Promise.all([
        unsubscribeFromPush(),
        wipeServiceWorker()
    ]);
}
exports.wipeServiceWorkerAndUnsubscribe = wipeServiceWorkerAndUnsubscribe;
function wait(milliseconds) {
    return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); });
}
exports.wait = wait;
/**
 * Returns the part of the string after the first occurence of the specified search.
 * @param string The entire string.
 * @param search The text returned will be everything *after* search.
 * e.g. substringAfter('A white fox', 'white') => ' fox'
 */
function substringAfter(string, search) {
    return string.substr(string.indexOf(search) + search.length);
}
exports.substringAfter = substringAfter;
function once(targetSelectorOrElement, event, task, manualDestroy) {
    if (manualDestroy === void 0) { manualDestroy = false; }
    if (!event) {
        log.error('Cannot call on() with no event: ', event);
    }
    if (!task) {
        log.error('Cannot call on() with no task: ', task);
    }
    if (typeof targetSelectorOrElement === 'string') {
        var els = document.querySelectorAll(targetSelectorOrElement);
        if (els.length > 0) {
            for (var i = 0; i < els.length; i++)
                once(els[i], event, task);
        }
    }
    else if (isArray(targetSelectorOrElement)) {
        for (var i = 0; i < targetSelectorOrElement.length; i++)
            once(targetSelectorOrElement[i], event, task);
    }
    else if (typeof targetSelectorOrElement === 'object') {
        var taskWrapper = (function () {
            var internalTaskFunction = function (e) {
                var destroyEventListener = function () {
                    targetSelectorOrElement.removeEventListener(e.type, taskWrapper);
                };
                if (!manualDestroy) {
                    destroyEventListener();
                }
                task(e, destroyEventListener);
            };
            return internalTaskFunction;
        })();
        targetSelectorOrElement.addEventListener(event, taskWrapper);
    }
    else
        throw new Error(targetSelectorOrElement + " must be a CSS selector string or DOM Element object.");
}
exports.once = once;
/**
 * Returns the number of times the SDK has been loaded into the browser.
 * Expects a browser environment, otherwise this call will fail.
 */
function getSdkLoadCount() {
    return window.__oneSignalSdkLoadCount || 0;
}
exports.getSdkLoadCount = getSdkLoadCount;
function awaitSdkEvent(eventName, predicate) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                        OneSignal.once(eventName, function (event) {
                            if (predicate) {
                                var predicateResult = predicate(event);
                                if (predicateResult)
                                    resolve(event);
                            }
                            else
                                resolve(event);
                        });
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.awaitSdkEvent = awaitSdkEvent;
/**
 * Increments the counter describing the number of times the SDK has been loaded into the browser.
 * Expects a browser environment, otherwise this call will fail.
 */
function incrementSdkLoadCount() {
    window.__oneSignalSdkLoadCount = getSdkLoadCount() + 1;
}
exports.incrementSdkLoadCount = incrementSdkLoadCount;
/**
 * Returns the email with all whitespace removed and converted to lower case.
 */
function prepareEmailForHashing(email) {
    return email.replace(/\s/g, '').toLowerCase();
}
exports.prepareEmailForHashing = prepareEmailForHashing;
/**
 * Taken from: http://lig-membres.imag.fr/donsez/cours/exemplescourstechnoweb/js_securehash/
 */
function md5(str) {
    /*
     * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
     * Digest Algorithm, as defined in RFC 1321.
     * Copyright (C) Paul Johnston 1999 - 2000.
     * Updated by Greg Holt 2000 - 2001.
     * See http://pajhome.org.uk/site/legal.html for details.
     */
    /*
     * Convert a 32-bit number to a hex string with ls-byte first
     */
    var hex_chr = "0123456789abcdef";
    function rhex(num) {
        var str = "";
        for (var j = 0; j <= 3; j++)
            str += hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) +
                hex_chr.charAt((num >> (j * 8)) & 0x0F);
        return str;
    }
    /*
     * Convert a string to a sequence of 16-word blocks, stored as an array.
     * Append padding bits and the length, as described in the MD5 standard.
     */
    function str2blks_MD5(str) {
        var nblk = ((str.length + 8) >> 6) + 1;
        var blks = new Array(nblk * 16);
        for (var i = 0; i < nblk * 16; i++)
            blks[i] = 0;
        for (var i = 0; i < str.length; i++)
            blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
        blks[i >> 2] |= 0x80 << ((i % 4) * 8);
        blks[nblk * 16 - 2] = str.length * 8;
        return blks;
    }
    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    /*
     * Bitwise rotate a 32-bit number to the left
     */
    function rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }
    /*
     * These functions implement the basic operation for each round of the
     * algorithm.
     */
    function cmn(q, a, b, x, s, t) {
        return add(rol(add(add(a, q), add(x, t)), s), b);
    }
    function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function hh(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function ii(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }
    /*
     * Take a string and return the hex representation of its MD5.
     */
    function calcMD5(str) {
        var x = str2blks_MD5(str);
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            a = ff(a, b, c, d, x[i + 0], 7, -680876936);
            d = ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = ff(c, d, a, b, x[i + 10], 17, -42063);
            b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
            a = gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = gg(b, c, d, a, x[i + 0], 20, -373897302);
            a = gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
            a = hh(a, b, c, d, x[i + 5], 4, -378558);
            d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = hh(d, a, b, c, x[i + 0], 11, -358537222);
            c = hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = hh(b, c, d, a, x[i + 2], 23, -995338651);
            a = ii(a, b, c, d, x[i + 0], 6, -198630844);
            d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = ii(b, c, d, a, x[i + 9], 21, -343485551);
            a = add(a, olda);
            b = add(b, oldb);
            c = add(c, oldc);
            d = add(d, oldd);
        }
        return rhex(a) + rhex(b) + rhex(c) + rhex(d);
    }
    return calcMD5(str);
}
exports.md5 = md5;
/**
 * Taken from: http://lig-membres.imag.fr/donsez/cours/exemplescourstechnoweb/js_securehash/sha1src.html
 */
function sha1(str) {
    /*
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
     * in FIPS PUB 180-1
     * Copyright (C) Paul Johnston 2000.
     * See http://pajhome.org.uk/site/legal.html for details.
     */
    /*
     * Convert a 32-bit number to a hex string with ms-byte first
     */
    var hex_chr = "0123456789abcdef";
    function hex(num) {
        var str = "";
        for (var j = 7; j >= 0; j--)
            str += hex_chr.charAt((num >> (j * 4)) & 0x0F);
        return str;
    }
    /*
     * Convert a string to a sequence of 16-word blocks, stored as an array.
     * Append padding bits and the length, as described in the SHA1 standard.
     */
    function str2blks_SHA1(str) {
        var nblk = ((str.length + 8) >> 6) + 1;
        var blks = new Array(nblk * 16);
        for (var i = 0; i < nblk * 16; i++)
            blks[i] = 0;
        for (i = 0; i < str.length; i++)
            blks[i >> 2] |= str.charCodeAt(i) << (24 - (i % 4) * 8);
        blks[i >> 2] |= 0x80 << (24 - (i % 4) * 8);
        blks[nblk * 16 - 1] = str.length * 8;
        return blks;
    }
    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    /*
     * Bitwise rotate a 32-bit number to the left
     */
    function rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }
    /*
     * Perform the appropriate triplet combination function for the current
     * iteration
     */
    function ft(t, b, c, d) {
        if (t < 20)
            return (b & c) | ((~b) & d);
        if (t < 40)
            return b ^ c ^ d;
        if (t < 60)
            return (b & c) | (b & d) | (c & d);
        return b ^ c ^ d;
    }
    /*
     * Determine the appropriate additive constant for the current iteration
     */
    function kt(t) {
        return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
            (t < 60) ? -1894007588 : -899497514;
    }
    /*
     * Take a string and return the hex representation of its SHA-1.
     */
    function calcSHA1(str) {
        var x = str2blks_SHA1(str);
        var w = new Array(80);
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        var e = -1009589776;
        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            var olde = e;
            for (var j = 0; j < 80; j++) {
                if (j < 16)
                    w[j] = x[i + j];
                else
                    w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                var t = add(add(rol(a, 5), ft(j, b, c, d)), add(add(e, w[j]), kt(j)));
                e = d;
                d = c;
                c = rol(b, 30);
                b = a;
                a = t;
            }
            a = add(a, olda);
            b = add(b, oldb);
            c = add(c, oldc);
            d = add(d, oldd);
            e = add(e, olde);
        }
        return hex(a) + hex(b) + hex(c) + hex(d) + hex(e);
    }
    return calcSHA1(str);
}
exports.sha1 = sha1;
//# sourceMappingURL=utils.js.map
});

;require.register("build/src/utils/ValidatorUtils.js", function(exports, require, module) {
"use strict";
var ValidatorUtils = (function () {
    function ValidatorUtils() {
    }
    ValidatorUtils.isValidUrl = function (url, options) {
        if (options && options.allowNull && url === null)
            return true;
        else if (options && options.allowEmpty && (url === null || url === undefined))
            return true;
        else {
            try {
                var parsedUrl = new URL(url);
                if (options && options.requireHttps) {
                    return parsedUrl.protocol === 'https:';
                }
                else
                    return true;
            }
            catch (e) {
                return false;
            }
        }
    };
    ValidatorUtils.isValidBoolean = function (bool, options) {
        if (options && options.allowNull && bool === null)
            return true;
        else
            return bool === true || bool === false;
    };
    ValidatorUtils.isValidArray = function (array, options) {
        if (options && options.allowNull && array === null)
            return true;
        else if (options && options.allowEmpty && (array === null || array === undefined))
            return true;
        else
            return array instanceof Array;
    };
    return ValidatorUtils;
}());
exports.ValidatorUtils = ValidatorUtils;
//# sourceMappingURL=ValidatorUtils.js.map
});

;require.register("build/src/vars.js", function(exports, require, module) {
"use strict";
var Environment_1 = require("./Environment");
exports.DEV_HOST = 'https://oregon:3001';
exports.DEV_FRAME_HOST = 'https://washington.localhost:3001';
exports.DEV_PREFIX = 'Dev-';
exports.PROD_HOST = 'https://onesignal.com';
exports.STAGING_HOST = 'https://onesignal-staging.pw';
exports.STAGING_FRAME_HOST = 'https://washington.onesignal-staging.pw';
exports.STAGING_PREFIX = 'Staging-';
var HOST_URL;
exports.HOST_URL = HOST_URL;
var API_URL;
exports.API_URL = API_URL;
if (Environment_1.default.isDev()) {
    exports.HOST_URL = HOST_URL = exports.DEV_HOST;
    exports.API_URL = API_URL = exports.DEV_HOST + '/api/v1/';
}
else if (Environment_1.default.isStaging()) {
    exports.HOST_URL = HOST_URL = exports.STAGING_HOST;
    exports.API_URL = API_URL = exports.STAGING_HOST + '/api/v1/';
}
else {
    exports.HOST_URL = HOST_URL = exports.PROD_HOST;
    exports.API_URL = API_URL = exports.PROD_HOST + '/api/v1/';
}
//# sourceMappingURL=vars.js.map
});

;require.alias("atoa/atoa.js", "atoa");
require.alias("bowser/src/bowser.js", "bowser");
require.alias("es6-error/lib/index.js", "es6-error");
require.alias("es6-promise/dist/es6-promise.js", "es6-promise");
require.alias("heir/heir.js", "heir");
require.alias("js-cookie/src/js.cookie.js", "js-cookie");
require.alias("loglevel/lib/loglevel.js", "loglevel");
require.alias("brunch/node_modules/process/browser.js", "process");
require.alias("swivel/swivel.js", "swivel");
require.alias("ticky/ticky-browser.js", "ticky");
require.alias("wolfy87-eventemitter/EventEmitter.js", "wolfy87-eventemitter");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

require('build/src/entry');
//# sourceMappingURL=app.js.map
