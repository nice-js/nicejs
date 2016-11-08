import isPlainObject from 'is-plain-object'
import invariant from 'invariant'

/**
 * 组件插件处理
 */
class Plugin {
  /**
   * 构造函数
   */
  constructor() {
    this.hooks = {
      onError: [],
      onStateChange: [],
      onAction: [],
      onReducer: [],
      onHmr: [],
      extraReducers: []
    }
  }

  /**
   * 应用hook对象
   * @param {Object} hook
   * @returns {void}
   */
  use(plugin) {
    invariant(isPlainObject(plugin), 'plugin.use plugin should be plain object')
    const hooks = this.hooks

    for (const key in plugin) {
      invariant(hooks[key], `plugin.use unknow plugin property:${key}`)
      hooks[key].push(plugin[key])
    }
  }

  /**
   * 调用中间件
   * @param {String}  key
   * @param {Func}    defaultHandler
   * @returns {void}
   */
  apply(key, defaultHandler) {
    const hooks = this.hooks
    const validApplyHooks = ['onError', 'onHmr']

    /** check not allow call hooks*/
    invariant(validApplyHooks.indexOf(key) > -1, `plugin.apply: hook ${key} can't be applied`)

    /** get hooks*/
    const funcs = hooks[key]

    return (...args) => {
      if (funcs.length) {
        for (const func of funcs) {
          func.apply(null, args)
        }
        return
      }

      /** can't found use default handler*/
      if (defaultHandler) {
        defaultHandler.apply(null, args)
      }
    }
  }

  /**
   * 获取hooks
   * @param {String} key the hooks key
   */
  get(key) {
    const hooks = this.hooks
    invariant(key in hooks, `plugin.get: hook ${key} can't found`)

    /** process extraReducers*/
    if (key === 'extraReducers') {
      let ret = {}
      for (const reducerObject of hooks[key]) {
        ret = {...ret,
          ...reducerObject
        }
      }
      return ret
    }

    /** process onReducer*/
    if (key === 'onReducer') {
      return (reducer) => {
        for (const reducerEnhancer of hooks[key]) {
          reducer = reducerEnhancer(reducer)
        }
        return reducer
      }
    }

    /**default*/
    return hooks[key]
  }
}

export default Plugin
