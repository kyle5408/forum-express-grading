const helpers = require('../_helpers')
const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const { Op } = require("sequelize")

const adminService = {
  //瀏覽所有餐廳
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] })
      .then(restaurants => {
        callback({ restaurants })
      })
  },


  //瀏覽單筆餐廳
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { raw: true, nest: true, include: [Category] })
      .then(restaurant => {
        callback({ restaurant })
      })
  },

  //刪除餐廳
  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy()
          .then(restaurant => {
            callback({ status: 'success', message: '' })
          })
      })
  },

  //建立餐廳
  postRestaurant: (req, res, callback) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!req.body.name) {
      callback({ status: 'error', message: '請輸入餐廳名稱' })
      // req.flash('error_messages', '請輸入餐廳名稱')
      // return res.redirect('back')
    }
    //增加圖片上傳
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name,
          tel,
          address,
          opening_hours,
          description,
          //條件運算子(條件 ? 值1 : 值2)，如果條件(file)為true，回傳值1(`upload/${file.originalname}`)，否則回傳值2(null)
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        })
          .then(restaurant => {
            callback({ status: 'success', message: '餐廳建立成功' })
            // req.flash('success_messages', '餐廳建立成功')
            // res.redirect('/admin/restaurants')
          })

      })
    } else {
      return Restaurant.create({
        name,
        tel,
        address,
        opening_hours,
        description,
        image: null,
        CategoryId: req.body.categoryId
      })
        .then(restaurant => {
          callback({ status: 'success', message: '餐廳建立成功' })
          // req.flash('success_messages', '餐廳建立成功')
          // res.redirect('/admin/restaurants')
        })
    }
  },

  //編輯餐廳
  putRestaurant: (req, res, callback) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!req.body.name) {
      return callback({ status: 'error', message: '請輸入餐廳名稱' })
      // req.flash('error_messages', '請輸入餐廳名稱')
      // return res.redirect('back')
    }
    //增加圖片上傳
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then(restaurant => {
            restaurant.update({
              name,
              tel,
              address,
              opening_hours,
              description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: req.body.categoryId
            })
              .then(restaurant => {
                return callback({ status: 'success', message: '餐廳編輯成功' })
                // req.flash('success_messages', '餐廳編輯成功')
                // res.redirect('/admin/restaurants')
              })
          })
      })

    } else {
      //update和destroy不用把資料拆解
      return Restaurant.findByPk(req.params.id)
        .then(restaurant => {
          restaurant.update({
            name,
            tel,
            address,
            opening_hours,
            description,
            image: restaurant.image,
            CategoryId: req.body.categoryId
          })
            .then(restaurant => {
              return callback({ status: 'success', message: '餐廳編輯成功' })
              // req.flash('success_messages', '餐廳編輯成功')
              // res.redirect('/admin/restaurants')
            })
        })
    }
  },

  //瀏覽所有使用者
  getUsers: (req, res, callback) => {
    return User.findAll({ raw: true, nest: true })
      .then(users => {
        callback({ users })
      })
  },

  //管理員權限(需保留一位)
  toggleAdmin: async (req, res, callback) => {
    //判斷目前管理員數量
    const adminVol = await
      User.count({
        where: {
          isAdmin: {
            [Op.eq]: true
          }
        }
      })
    const user = await User.findByPk(req.params.id)
    if (adminVol === 1 && user.isAdmin) {
      return callback({ status: 'error', message: '已為最後一位管理者' })
      // req.flash('error_messages', '已為最後一位管理者')
      // return res.redirect('/admin/users')
    } else {
      //移除自己權限
      if (Number(req.params.id) === helpers.getUser(req).id && user.isAdmin === true) {
        await user.update({
          isAdmin: false
        })
        return callback({ status: 'success', message: '您已成功自管理者移除' })
        // req.flash('success_messages', '您已成功自管理者移除')
        // return res.redirect('/restaurants')
      } else {
        isAdmin = !user.isAdmin ? true : false
        await user.update({
          isAdmin
        })
        return callback({ status: 'success', message: '已成功更新管理者權限' })
        // return res.render('admin/users', { users })
      }
    }
  },

  //   editRestaurant: (req, res) => {
  //   Category.findAll({ raw: true, nest: true })
  //     .then(categories => {
  //       return Restaurant.findByPk(req.params.id)
  //         .then(restaurant => {
  //           return res.render('admin/create', { restaurant: restaurant.toJSON(), categories })
  //         })
  //     })
  // },







  // //新增餐廳
  // createRestaurant: (req, res) => {
  //   Category.findAll({
  //     raw: true,
  //     nest: true
  //   })
  //     .then(categories => {
  //       return res.render('admin/create', { categories })
  //     })

  // },


}

module.exports = adminService