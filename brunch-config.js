module.exports = {
  paths: {
    // Build directory output path
    public: 'dist-brunch',
    // Paths watched by brunch
    watched: ['build/src']
  },
  files: {
    javascripts: {
      joinTo: 'app.js'
    },
    stylesheets: {
      joinTo: 'app.css'
    }
  },
  modules: {
    autoRequire: {
      'javascripts/app.js': ['OneSignal']
    }
  },
  plugins: {
    on: ['javascript-brunch', 'sass-brunch', 'jscc-brunch'],
    jscc: {
      values: {
        _DEV: true,
        _TEST: false,
        _STAGING: false,
        _IS_ES6: true,
        _VERSION: JSON.stringify(require("./package.json").sdkVersion),
      }
    }
  }
};