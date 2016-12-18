module.exports = {
  paths: {
    // Build directory output path
    public: 'build/bundler',
    // Paths watched by brunch
    watched: ['build/typescript/src']
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
      'app.js': ['build/typescript/src/entry']
    }
  },
  plugins: {
    on: ['typescript-brunch', 'javascript-brunch', 'sass-brunch', 'jscc-brunch'],
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