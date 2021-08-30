const express = require('express')
const exhbs = require('express-handlebars')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
//for test
const helpers = require('./_helpers')
const session = require('express-session')
const methodOverride = require('method-override')
const db = require('./models')
const passport = require('./config/passport')
const app = express()
const port = process.env.PORT || 3000

app.engine('hbs', exhbs({
  defaultLayout: 'main',
  extname: '.hbs',
  //載入自訂helper
  helpers: require('./config/handlebar-helpers')
}))
app.set('view engine', 'hbs')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
//passport的session要在flash前，flash才能傳遞user資訊
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  // res.locals.user = req.user
  // for test 用helpers.getUser(req)取代req.user，因為執行測試時，不能直接在測試設定檔裡呼叫第三方套件的函式，只能呼叫自己定義的函式。
  res.locals.user = helpers.getUser(req)
  next()
})
app.use(methodOverride('_method'))
//提供__dirname絕對路徑，一般node.js都是相對路徑
app.use('/upload', express.static(__dirname + '/upload'))


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


// 引入 routes 並將 app 傳進去，讓 routes 可以用 app 這個物件來指定路由(要放在後面讓前面的設定透過app一起傳過去)
require('./routes')(app, passport)

//導入自動化測試以後，由於測試環境會用到 app，所以需要在文件最下方輸出 app。
module.exports = app
