
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    const { name, email, password, passwordCheck } = req.body
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '確認密碼不相符!')
      return res.render('signup', { name, email, password, passwordCheck })
    } else {
      User.findOne({ where: { email: req.body.email } })
        .then(user => {
          if (user) {
            req.flash('error_messages', '此信箱已被註冊')
            return res.render('signup', { name, email, password, passwordCheck })
          } else {
            User.create({
              name: req.body.name,
              email: req.body.email,
              password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
            })
              .then(
                user => {
                  return res.redirect('/signin')
                }
              )
          }
        })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入!')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功!')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    let id = req.params.id || req.user.id
    let edit = (Number(req.params.id) === req.user.id) ? true : false
    User.findByPk(id)
      .then(user => {
        return res.render('profile', { user: user.toJSON(), edit })
      })
  }
}

module.exports = userController