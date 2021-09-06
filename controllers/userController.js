const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
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

  getUser: async (req, res) => {
    const userId = helpers.getUser(req).id
    let edit = (Number(req.params.id) === Number(userId)) ? true : false
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Followers', attributes: ['image', 'id'] },
        { model: User, as: 'Followings', attributes: ['image', 'id'] },
        { model: Restaurant, as: 'FavoritedRestaurants', attributes: ['image', 'id'] }
      ]
    })
    const result = await Comment.findAndCountAll({ raw: true, nest: true, include: [Restaurant], where: { UserId: user.id } })
    const commentCount = result.count
    const followingCount = user.Followings.length
    const followerCount = user.Followers.length
    const favoritedRestaurantCount = user.FavoritedRestaurants.length

    //運用展開運算子把Restaurant的資料和comment組合傳給前端(要result.rows[i].Restaurant才能讀到資料，否則會是undefined)
    const commentRestaurant = result.rows.map(comment => ({
      ...comment,
      restaurantName: comment.Restaurant.name,
      restaurantImage: comment.Restaurant.image,
      restaurantId: comment.Restaurant.id
    }))
    //運用set和filter去除陣列重複物件
    const restaurantSet = new Set()
    const commentRestaurantFilter = commentRestaurant.filter(item => {
      return restaurantSet.has(item.restaurantId) ? false : restaurantSet.add(item.restaurantId)
    })
    return res.render('profile', { user: user.toJSON(), edit, comments: commentRestaurantFilter, commentCount, followingCount, followerCount, favoritedRestaurantCount })
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
                image: file ? img.data.link : null
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
  },

  addFavorite: async (req, res) => {
    try {
      const userId = helpers.getUser(req).id
      await Favorite.create({
        UserId: userId,
        RestaurantId: req.params.restaurantId
      })
      req.flash('success_messages', '已成功加入最愛')
      return res.redirect('back')

    }
    catch (err) {
      console.log(err)
    }
  },

  removeFavorite: async (req, res) => {
    try {
      const userId = helpers.getUser(req).id
      const favorite = await Favorite.findOne({
        where: {
          UserId: userId,
          RestaurantId: req.params.restaurantId
        }
      })
      await favorite.destroy()
      req.flash('error_messages', '已移除最愛')
      return res.redirect('back')

    }
    catch (err) {
      console.log(err)
    }
  },

  addLike: async (req, res) => {
    try {
      const userId = helpers.getUser(req).id
      await Like.create({
        UserId: userId,
        RestaurantId: req.params.restaurantId
      })
      req.flash('success_messages', '已成功Like')
      return res.redirect('back')
    }
    catch (err) {
      console.log(err)
    }
  },

  removeLike: async (req, res) => {
    try {
      const userId = helpers.getUser(req).id
      const like = await Like.findOne({
        where: {
          UserId: userId,
          RestaurantId: req.params.restaurantId
        }
      })
      await like.destroy()
      req.flash('error_messages', '已Unlike')
      return res.redirect('back')
    }
    catch (err) {
      console.log(err)
    }
  },

  getTopUser: (req, res) => {
    User.findAll({ include: [{ model: User, as: 'Followers' }] })
      .then(users => {
        const userId = helpers.getUser(req).id
        users = users.map(user => ({
          ...user.dataValues,
          FollowerCount: user.Followers.length,
          //這邊的user已經用展開運算子，所以可以直接抓user.id
          isFollowed: req.user.Followings.map(d => d.id).includes(user.id),
          isUser: user.id === userId
        }))
        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
        return res.render('topUser', { users })
      })
  },

  addFollowing: async (req, res) => {
    try {
      const userId = helpers.getUser(req).id
      await Followship.create({
        followerId: userId,
        followingId: req.params.userId,
      })
      req.flash('success_messages', '已成功追蹤')
      return res.redirect('back')
    }
    catch (err) {
      console.log(err)
    }
  },

  removeFollowing: async (req, res) => {
    try {
      const userId = helpers.getUser(req).id
      const followShip = await Followship.findOne({
        where: {
          followerId: userId,
          followingId: req.params.userId
        }
      })
      await followShip.destroy()
      req.flash('error_messages', '已取消追蹤')
      return res.redirect('back')
    }
    catch (err) {
      console.log(err)
    }
  },
}

module.exports = userController