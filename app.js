const express = require('express')
const exhbs = require('express-handlebars')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const db = require('./models')
const passport = require('./config/passport')
const app = express()
const port = 3000

app.engine('hbs', exhbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
//passport的session要在flash前，flash才能傳遞user資訊
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user
  next()
})
app.use(methodOverride('_method'))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


// 引入 routes 並將 app 傳進去，讓 routes 可以用 app 這個物件來指定路由(要放在後面讓前面的設定透過app一起傳過去)
require('./routes')(app, passport)

//導入自動化測試以後，由於測試環境會用到 app，所以需要在文件最下方輸出 app。
module.exports = app
