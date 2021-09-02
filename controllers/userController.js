const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const fs = require('fs')
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

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
    let edit = (Number(req.params.id) === Number(helpers.getUser(req).id)) ? true : false
    User.findByPk(req.params.id)
      .then(user => {
        Comment.findAndCountAll({ raw: true, nest: true, include: [Restaurant], where: { UserId: user.id } })
          .then(result => {
            //運用展開運算子把Restaurant的資料和comment組合傳給前端(要result.rows[i].Restaurant才能讀到資料，否則會是undefined)
            const commentRestaurant = result.rows.map(comment => ({
              ...comment,
              restaurantName: comment.Restaurant.name,
              restaurantImage: comment.Restaurant.image
            }))
            return res.render('profile', { user: user.toJSON(), edit, count: result.count, comments: commentRestaurant })
          })
      })


  },

  editUser: (req, res) => {
    let edit = (Number(req.params.id) === Number(helpers.getUser(req).id)) ? true : false
    if (!edit) {
      req.flash('error_messages', '無修改此使用者權限')
      return res.redirect('back')
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          res.render('editProfile', { user: user.toJSON() })
        })
    }
  },

  putUser: (req, res) => {
    let edit = (Number(req.params.id) === Number(helpers.getUser(req).id)) ? true : false
    if (!edit) {
      req.flash('error_messages', '無修改此使用者權限')
      return res.redirect('back')
    } else {
      const { file } = req
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        imgur.upload(file.path, (err, img) => {
          if (err) console.log('Error:', err)
          // fs.writeFile(`upload/${file.originalname}`, data, () => {
            return User.findByPk(req.params.id)
              .then(user => {
                user.update({
                  name: req.body.name,
                  email: req.body.email,
                  image: file ? img.data.link : user.image
                  // image: file ? `/upload/${file.originalname}` : user.image
                })
                  .then(() => {
                    req.flash('success_messages', '個人資料更新成功')
                    return res.redirect(`/users/${req.params.id}`)
                  })
              // })
          })
        })
      } else {
        return User.findByPk(req.params.id)
          .then(user => {
            user.update({
              name: req.body.name,
              email: req.body.email,
              image: user.image
            })
              .then(user => {
                req.flash('success_messages', '個人資料更新成功')
                return res.redirect(`/users/${helpers.getUser(req).id}`)
              })
          })

      }
    }
  }
}

module.exports = userController