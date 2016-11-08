import React from 'react'
import {createStore, applyMiddleware, compose, combineReducers} from 'redux'
import {Provider} from 'react-redux'
import window from 'global/window'
import document from 'global/document'
import invariant from 'invariant'

import Plugin from './Plugin'

export default(opts) => {
  const {initialReducer, defaultHistory, routerMiddleware, setupHistory} = opts
  /**
   * create a app
   * @param  {function} hooks
   * @returns nice instance
   */
  return (hooks = {}) => {
    const history = hooks.history || defaultHistory
    const initalState = hooks.initalState || {}

    delete hooks.history
    delete hooks.initalState

    const plugin = new Plugin()
    plugin.use(hooks)

    /** ======================================
     * Methods
     =======================================*/
    function use(hooks) {
      plugin.use(hooks)
    }

    function router(router) {
      invariant(typeof router === 'function', 'router should be function')
      this._router = router
    }

    function start(container) {
      if (document.querySelector) {
        if (typeof container === 'string') {
          container = document.querySelector(container)
        } else {
          container = undefined
        }
      }

      invariant(this._router, 'router should be defined')

      // reducers
      let reducers = {
        ...initialReducer
      }

      // extra reducers
      const extraReducers = plugin.get('extraReducers')
      invariant(Object.keys(extraReducers).every(key => !(key in reducers)), 'conflict with other reducers')

      // create store
      const extraMiddlewares = plugin.get('onAction')
      const reducerEnhancer = plugin.get('onReducer')

      let middlewares = [...extraMiddlewares]

      if (routerMiddleware) {
        middlewares = [
          routerMiddleware(history), ...middlewares
        ]
      }

      const devtools = window.devToolsExtension || (() => noop => noop)
      const enhancers = [
        applyMiddleware(...middlewares),
        devtools()
      ]

      function createReducer(asyncReducers) {
        return reducerEnhancer(combineReducers({
          ...reducers,
          ...extraReducers,
          ...asyncReducers
        }))
      }

      const store = this._store = createStore(createReducer(), initalState, compose(...enhancers))

      // setup history
      if (setupHistory) {
        setupHistory.call(this, history)
      }

      // If has container, render; else, return react component
      if (container) {
        render(container, store, this, this._router)
        plugin.apply('onHmr')(render.bind(this, container, store, this))
      } else {
        return getProvider(store, this, this._router)
      }
    }

    /** ======================================
     * Helpers
     =======================================*/
    function getProvider(store, app, router) {
      return () => (
        <Provider store={store}>
          {router({app, history: app._history})}
        </Provider>
      )
    }

    function render(container, store, app, router) {
      const ReactDOM = require('react-dom')
      ReactDOM.render(React.createElement(getProvider(store, app, router)), container)
    }

    return {
      // properties
      _router: null,
      _store: null,
      _history: null,
      _plugin: plugin,

      // methods
      use,
      router,
      start
    }
  }
}
