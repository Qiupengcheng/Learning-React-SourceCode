/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');
var flatten = require('gulp-flatten');
var del = require('del');
var merge = require('merge-stream');

var babelPluginModules = require('fbjs-scripts/babel-6/rewrite-modules');
var stripProvidesModule = require('fbjs-scripts/gulp/strip-provides-module');
var extractErrors = require('./scripts/error-codes/gulp-extract-errors');
var devExpressionWithCodes = require('./scripts/error-codes/dev-expression-with-codes');

// Load all of the Gulp plugins.
var plugins = require('gulp-load-plugins')();

function getTask(name) {
  return require(`./gulp/tasks/${name}`)(gulp, plugins);
}

var paths = {
  react: {
    src: [
      'src/umd/ReactUMDEntry.js',
      'src/umd/ReactWithAddonsUMDEntry.js',
      'src/umd/shims/**/*.js',

      'src/isomorphic/**/*.js',
      'src/addons/**/*.js',

      'src/ReactVersion.js',
      'src/shared/**/*.js',
      '!src/shared/vendor/**/*.js',
      '!src/**/__benchmarks__/**/*.js',
      '!src/**/__tests__/**/*.js',
      '!src/**/__mocks__/**/*.js',
    ],
    lib: 'build/node_modules/react/lib',
  },
  reactDOM: {
    src: [
      'src/umd/ReactDOMUMDEntry.js',
      'src/umd/ReactDOMServerUMDEntry.js',

      'src/renderers/dom/**/*.js',
      'src/renderers/shared/**/*.js',
      'src/test/**/*.js', // ReactTestUtils is currently very coupled to DOM.

      // ReactShallowRenderer was moved from ReactTestUtils to ReactTestRenderer but a pointer was left.
      'src/renderers/testing/ReactShallowRenderer.js',
      'src/renderers/testing/ReactTestReconcileTransaction.js',

      'src/ReactVersion.js',
      'src/shared/**/*.js',
      '!src/shared/vendor/**/*.js',
      '!src/**/__benchmarks__/**/*.js',
      '!src/**/__tests__/**/*.js',
      '!src/**/__mocks__/**/*.js',
    ],
    lib: 'build/node_modules/react-dom/lib',
  },
  reactNative: {
    src: [
      'src/renderers/native/**/*.js',
      'src/renderers/shared/**/*.js',

      'src/ReactVersion.js',
      'src/shared/**/*.js',
      '!src/shared/vendor/**/*.js',
      '!src/**/__benchmarks__/**/*.js',
      '!src/**/__tests__/**/*.js',
      '!src/**/__mocks__/**/*.js',
    ],
    lib: 'build/node_modules/react-native/lib',
  },
  reactShallowRenderer: {
    src: [
      // Shallow renderer reuses some DOM code
      'src/renderers/dom/**/*.js',
      'src/renderers/testing/**/*.js',
      'src/renderers/shared/**/*.js',

      'src/ReactVersion.js',
      'src/shared/**/*.js',
      '!src/shared/vendor/**/*.js',
      '!src/**/__benchmarks__/**/*.js',
      '!src/**/__tests__/**/*.js',
      '!src/**/__mocks__/**/*.js',
    ],
    // We put it into a subfolder of test renderer but
    // with a separate copy of the reconciler.
    lib: 'build/node_modules/react-test-renderer/lib/shallow/',
  },
  reactTestRenderer: {
    src: [
      'src/renderers/testing/**/*.js',
      'src/renderers/shared/**/*.js',

      'src/ReactVersion.js',
      'src/shared/**/*.js',
      '!src/shared/vendor/**/*.js',
      '!src/**/__benchmarks__/**/*.js',
      '!src/**/__tests__/**/*.js',
      '!src/**/__mocks__/**/*.js',
    ],
    lib: 'build/node_modules/react-test-renderer/lib',
  },
};

var moduleMapBase = Object.assign(
  {
    'object-assign': 'object-assign',
    'create-react-class': 'create-react-class',
    'create-react-class/factory': 'create-react-class/factory',
    'prop-types': 'prop-types',
    'prop-types/factory': 'prop-types/factory',
  },
  require('fbjs/module-map')
);

var moduleMapReact = Object.assign(
  {
    // Addons needs to reach into DOM internals
    ReactDOM: 'react-dom/lib/ReactDOM',
    ReactInstanceMap: 'react-dom/lib/ReactInstanceMap',
    ReactTestUtils: 'react-dom/lib/ReactTestUtils',
    ReactPerf: 'react-dom/lib/ReactPerf',
    getVendorPrefixedEventName: 'react-dom/lib/getVendorPrefixedEventName',
  },
  moduleMapBase
);

var rendererSharedState = {
  // Alias
  React: 'react/lib/React',
  // Shared state
  ReactCurrentOwner: 'react/lib/ReactCurrentOwner',
  ReactComponentTreeHook: 'react/lib/ReactComponentTreeHook',
  getNextDebugID: 'react/lib/getNextDebugID',
};

var moduleMapReactDOM = Object.assign(
  {},
  rendererSharedState,
  moduleMapBase
);

var moduleMapReactNative = Object.assign(
  {
    // React Native Hooks
    deepDiffer: 'react-native/lib/deepDiffer',
    deepFreezeAndThrowOnMutationInDev: 'react-native/lib/deepFreezeAndThrowOnMutationInDev',
    flattenStyle: 'react-native/lib/flattenStyle',
    InitializeJavaScriptAppEngine: 'react-native/lib/InitializeJavaScriptAppEngine',
    RCTEventEmitter: 'react-native/lib/RCTEventEmitter',
    TextInputState: 'react-native/lib/TextInputState',
    UIManager: 'react-native/lib/UIManager',
    UIManagerStatTracker: 'react-native/lib/UIManagerStatTracker',
    View: 'react-native/lib/View',
  },
  rendererSharedState,
  moduleMapBase
);

var moduleMapReactShallowRenderer = Object.assign(
  {},
  rendererSharedState,
  moduleMapBase
);

var moduleMapReactTestRenderer = Object.assign(
  {},
  rendererSharedState,
  moduleMapBase
);

var errorCodeOpts = {
  errorMapFilePath: 'scripts/error-codes/codes.json',
};

var babelOptsReact = {
  plugins: [
    devExpressionWithCodes, // this pass has to run before `rewrite-modules`
    [babelPluginModules, {map: moduleMapReact}],
  ],
};

var babelOptsReactDOM = {
  plugins: [
    devExpressionWithCodes, // this pass has to run before `rewrite-modules`
    [babelPluginModules, {map: moduleMapReactDOM}],
  ],
};

var babelOptsReactNative = {
  plugins: [
    devExpressionWithCodes, // this pass has to run before `rewrite-modules`
    [babelPluginModules, {map: moduleMapReactNative}],
  ],
};

var babelOptsReactShallowRenderer = {
  plugins: [
    devExpressionWithCodes, // this pass has to run before `rewrite-modules`
    [babelPluginModules, {map: moduleMapReactShallowRenderer}],
  ],
};

var babelOptsReactTestRenderer = {
  plugins: [
    devExpressionWithCodes, // this pass has to run before `rewrite-modules`
    [babelPluginModules, {map: moduleMapReactTestRenderer}],
  ],
};

gulp.task('eslint', getTask('eslint'));

gulp.task('lint', ['eslint']);

gulp.task('flow', getTask('flow'));

gulp.task('version-check', getTask('version-check'));

gulp.task('react:clean', function() {
  return del([
    paths.react.lib,
    paths.reactDOM.lib,
    paths.reactNative.lib,
    paths.reactShallowRenderer.lib,
    paths.reactTestRenderer.lib,
  ]);
});

gulp.task('react:modules', function() {
  return merge(
    gulp
      .src(paths.react.src)
      .pipe(babel(babelOptsReact))
      .pipe(stripProvidesModule())
      .pipe(flatten())
      .pipe(gulp.dest(paths.react.lib)),

    gulp
      .src(paths.reactDOM.src)
      .pipe(babel(babelOptsReactDOM))
      .pipe(stripProvidesModule())
      .pipe(flatten())
      .pipe(gulp.dest(paths.reactDOM.lib)),

    gulp
      .src(paths.reactNative.src)
      .pipe(babel(babelOptsReactNative))
      .pipe(stripProvidesModule())
      .pipe(flatten())
      .pipe(gulp.dest(paths.reactNative.lib)),

    gulp
      .src(paths.reactShallowRenderer.src)
      .pipe(stripProvidesModule())
      .pipe(babel(babelOptsReactShallowRenderer))
      .pipe(flatten())
      .pipe(gulp.dest(paths.reactShallowRenderer.lib)),

    gulp
      .src(paths.reactTestRenderer.src)
      .pipe(stripProvidesModule())
      .pipe(babel(babelOptsReactTestRenderer))
      .pipe(flatten())
      .pipe(gulp.dest(paths.reactTestRenderer.lib))
  );
});

gulp.task('react:extract-errors', function() {
  return gulp.src([].concat(
    paths.react.src,
    paths.reactDOM.src,
    paths.reactNative.src,
    paths.reactShallowRenderer.src,
    paths.reactTestRenderer.src
  )).pipe(extractErrors(errorCodeOpts));
});

gulp.task('default', ['react:modules']);
