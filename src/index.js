import browserHistory from 'react-router/lib/browserHistory'
import {
  routerMiddleware,
  syncHistoryWithStore,
  routerReducer as routing
} from 'react-router-redux'

import create from './create'

console.log(create)

export default create({
  initialReducer: {
    routing
  },
  defaultHistory: browserHistory,
  routerMiddleware: routerMiddleware,
  setupHistory(history) {
    this._history = syncHistoryWithStore(history, this._store)
  }
})
