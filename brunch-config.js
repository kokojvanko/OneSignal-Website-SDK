module.exports = {
  paths: {
    // Build directory output path
    public: 'build/bundler',
    // Paths watched by brunch
    watched: ['build/javascript']
  },
  files: {
    javascripts: {
      entryPoints: {
        'build/javascript/src/entry.js': 'bundle-sdk.js',
        'build/javascript/test/integration/entry.js': 'bundle-integration-tests.js'
      }
    },
    stylesheets: {
      joinTo: 'bundle.css'
    }
  },
  modules: {
    autoRequire: {
      'app.js': ['build/javascript/src/entry']
    }
  },
  /**
   * WARNING: For now, Brunch pipeline execution order is defined by the brunch plugins in the package.
   *
   * This means that, for example, sass-brunch in package.json should come before uglify-js.
   */
  plugins: {
    on: [
      'javascript-brunch',
      'sass-brunch',
      'jscc-brunch',
      'clean-css-brunch',
      'uglify-js-brunch'
    ],
    /**
     * Replaces $_VAR preprocessor variables for things like $_VERSION and $_DEV.
     *
     * Source map generation not necessary because we're just replacing very few strings.
     */
    jscc: {
      /**
       * Only pre-process the final bundle.js (one large file vs. many smaller files).
       */
      pattern: /^bundle\.js$/,
      values: {
        _DEV: true,
        _TEST: false,
        _STAGING: false,
        _IS_ES6: true,
        _VERSION: JSON.stringify(require("./package.json").sdkVersion),
      }
    },
    cleancss: {
      keepSpecialComments: 0,
      removeEmpty: true
    },
    uglify: {
      sourceMap: true,
      compress: {
        sequences: true,
        properties: true,
        dead_code: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        hoist_funs: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        collapse_vars: true,
        drop_console: false,
        drop_debugger: false,
        warnings: false,
        negate_iife: true,
      },
      mangle: {
        enable: true,
        except: [
          'AlreadySubscribedError',
          'InvalidArgumentError',
          'InvalidStateError',
          'InvalidUuidError',
          'NotSubscribedError',
          'PermissionMessageDismissedError',
          'PushNotSupportedError',
          'PushPermissionNotGrantedError'
        ]
      },
      output: {
        comments: false
      }
    }
  }
};