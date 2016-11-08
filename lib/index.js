'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _browserHistory = require('react-router/lib/browserHistory');

var _browserHistory2 = _interopRequireDefault(_browserHistory);

var _reactRouterRedux = require('react-router-redux');

var _create = require('./create');

var _create2 = _interopRequireDefault(_create);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(_create2.default);

exports.default = (0, _create2.default)({
  initialReducer: {
    routing: _reactRouterRedux.routerReducer
  },
  defaultHistory: _browserHistory2.default,
  routerMiddleware: _reactRouterRedux.routerMiddleware,
  setupHistory: function setupHistory(history) {
    this._history = (0, _reactRouterRedux.syncHistoryWithStore)(history, this._store);
  }
});