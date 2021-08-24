const express = require('express')
const exhbs = require('express-handlebars')
const app = express()
const port = 3000

app.engine('hbs', exhbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

require('./routes')(app)


//導入自動化測試以後，由於測試環境會用到 app，所以需要在文件最下方輸出 app。
module.exports = app
