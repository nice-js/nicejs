'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _window = require('global/window');

var _window2 = _interopRequireDefault(_window);

var _document = require('global/document');

var _document2 = _interopRequireDefault(_document);

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _Plugin = require('./Plugin');

var _Plugin2 = _interopRequireDefault(_Plugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

exports.default = function (opts) {
  var initialReducer = opts.initialReducer,
      defaultHistory = opts.defaultHistory,
      routerMiddleware = opts.routerMiddleware,
      setupHistory = opts.setupHistory;
  /**
   * create a app
   * @param  {function} hooks
   * @returns nice instance
   */

  return function () {
    var hooks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var history = hooks.history || defaultHistory;
    var initalState = hooks.initalState || {};

    delete hooks.history;
    delete hooks.initalState;

    var plugin = new _Plugin2.default();
    plugin.use(hooks);

    /** ======================================
     * Methods
     =======================================*/
    function use(hooks) {
      plugin.use(hooks);
    }

    function router(router) {
      (0, _invariant2.default)(typeof router === 'function', 'router should be function');
      this._router = router;
    }

    function start(container) {
      if (_document2.default.querySelector) {
        if (typeof container === 'string') {
          container = _document2.default.querySelector(container);
        } else {
          container = undefined;
        }
      }

      (0, _invariant2.default)(this._router, 'router should be defined');

      // reducers
      var reducers = _extends({}, initialReducer);

      // extra reducers
      var extraReducers = plugin.get('extraReducers');
      (0, _invariant2.default)(Object.keys(extraReducers).every(function (key) {
        return !(key in reducers);
      }), 'conflict with other reducers');

      // create store
      var extraMiddlewares = plugin.get('onAction');
      var reducerEnhancer = plugin.get('onReducer');

      var middlewares = [].concat(_toConsumableArray(extraMiddlewares));

      if (routerMiddleware) {
        middlewares = [routerMiddleware(history)].concat(_toConsumableArray(middlewares));
      }

      var devtools = _window2.default.devToolsExtension || function () {
        return function (noop) {
          return noop;
        };
      };
      var enhancers = [_redux.applyMiddleware.apply(undefined, _toConsumableArray(middlewares)), devtools()];

      function createReducer(asyncReducers) {
        return reducerEnhancer((0, _redux.combineReducers)(_extends({}, reducers, extraReducers, asyncReducers)));
      }

      var store = this._store = (0, _redux.createStore)(createReducer(), initalState, _redux.compose.apply(undefined, enhancers));

      // setup history
      if (setupHistory) {
        setupHistory.call(this, history);
      }

      // If has container, render; else, return react component
      if (container) {
        render(container, store, this, this._router);
        plugin.apply('onHmr')(render.bind(this, container, store, this));
      } else {
        return getProvider(store, this, this._router);
      }
    }

    /** ======================================
     * Helpers
     =======================================*/
    function getProvider(store, app, router) {
      return function () {
        return _react2.default.createElement(
          _reactRedux.Provider,
          { store: store },
          router({ app: app, history: app._history })
        );
      };
    }

    function render(container, store, app, router) {
      var ReactDOM = require('react-dom');
      ReactDOM.render(_react2.default.createElement(getProvider(store, app, router)), container);
    }

    return {
      // properties
      _router: null,
      _store: null,
      _history: null,
      _plugin: plugin,

      // methods
      use: use,
      router: router,
      start: start
    };
  };
};