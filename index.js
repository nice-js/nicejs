var App = require('./lib').default

console.log(App)
const app = App({})

app.start('#root')
