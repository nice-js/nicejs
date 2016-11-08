'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 组件插件处理
 */

var Plugin = (function () {
  /**
   * 构造函数
   */

  function Plugin() {
    _classCallCheck(this, Plugin);

    this.hooks = {
      onError: [],
      onStateChange: [],
      onAction: [],
      onReducer: [],
      onHmr: [],
      extraReducers: []
    };
  }

  /**
   * 应用hook对象
   * @param {Object} hook
   * @returns {void}
   */

  _createClass(Plugin, [{
    key: 'use',
    value: function use(plugin) {
      (0, _invariant2.default)((0, _isPlainObject2.default)(plugin), 'plugin.use plugin should be plain object');
      var hooks = this.hooks;

      for (var key in plugin) {
        (0, _invariant2.default)(hooks[key], 'plugin.use unknow plugin property:' + key);
        hooks[key].push(plugin[key]);
      }
    }

    /**
     * 调用中间件
     * @param {String}  key
     * @param {Func}    defaultHandler
     * @returns {void}
     */

  }, {
    key: 'apply',
    value: function apply(key, defaultHandler) {
      var hooks = this.hooks;
      var validApplyHooks = ['onError', 'onHmr'];

      /** check not allow call hooks*/
      (0, _invariant2.default)(validApplyHooks.indexOf(key) > -1, 'plugin.apply: hook ' + key + ' can\'t be applied');

      /** get hooks*/
      var funcs = hooks[key];

      return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        if (funcs.length) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = funcs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var func = _step.value;

              func.apply(null, args);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          return;
        }

        /** can't found use default handler*/
        if (defaultHandler) {
          defaultHandler.apply(null, args);
        }
      };
    }

    /**
     * 获取hooks
     * @param {String} key the hooks key
     */

  }, {
    key: 'get',
    value: function get(key) {
      var hooks = this.hooks;
      (0, _invariant2.default)(key in hooks, 'plugin.get: hook ' + key + ' can\'t found');

      /** process extraReducers*/
      if (key === 'extraReducers') {
        var ret = {};
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = hooks[key][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var reducerObject = _step2.value;

            ret = _extends({}, ret, reducerObject);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        return ret;
      }

      /** process onReducer*/
      if (key === 'onReducer') {
        return function (reducer) {
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = hooks[key][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var reducerEnhancer = _step3.value;

              reducer = reducerEnhancer(reducer);
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }

          return reducer;
        };
      }

      /**default*/
      return hooks[key];
    }
  }]);

  return Plugin;
})();

exports.default = Plugin;