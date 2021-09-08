const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User

//JWT
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const user = require('../../models/user')
const restController = require('../restController')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const userController = {
  signIn: async (req, res) => {
    //檢查資料不得為空
    if (!req.body.email || !req.body.password) {
      return res.json({ status: 'error', message: '帳號或密碼不得為空' })
    }
    //比對帳密
    let username = req.body.email
    let password = req.body.password

    //找出使用者
    const user = await User.findOne({ where: { email: username } })
    //比對帳號
    if (!user) {
      return res.status(401).json({ status: 'error', message: '此email尚未註冊' })
    }
    //比對密碼
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ status: 'error', message: '密碼錯誤' })
    }
    //核發token
    const payload = { id: user.id }
    const token = jwt.sign(payload, process.env.JWT_SECRET)
    return res.json({
      status: 'success',
      message: 'ok',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    })
  },
}

module.exports = userController
