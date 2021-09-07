const helpers = require('../_helpers')
const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const { Op } = require("sequelize")

const adminService = require('../services/adminService')

const adminController = {
  //瀏覽所有餐廳
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, data => {
      return res.render('admin/restaurants',  data )
    })
  },

  //瀏覽所有使用者
  getUsers: (req, res) => {
    return User.findAll({ raw: true, nest: true })
      .then(users => {
        return res.render('admin/users', { users })
      })
  },


  //管理員權限(需保留一位)
  toggleAdmin: async (req, res) => {
    //判斷目前管理員數量
    const adminVol = await
      User.count({
        where: {
          isAdmin: {
            [Op.eq]: true
          }
        }
      })

    return User.findByPk(req.params.id)
      .then((user) => {
        if (adminVol === 1 && user.isAdmin) {
          req.flash('error_messages', '已為最後一位管理者')
          return res.redirect('/admin/users')
        } else {
          //移除自己權限
          if (Number(req.params.id) === helpers.getUser(req).id && user.isAdmin === true) {
            user.update({
              isAdmin: false
            })
            req.flash('success_messages', '您已成功自管理者移除')
            return res.redirect('/restaurants')
          } else {
            isAdmin = !user.isAdmin ? true : false
            return user.update({
              isAdmin
            })
              .then(() => {
                User.findAll({ raw: true, nest: true })
                  .then(users => {
                    return res.render('admin/users', { users })
                  })
              })
          }
        }
      }
      )
  },

  //瀏覽單筆餐廳
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] })
      .then(restaurant => {
        console.log(restaurant.toJSON())
        return res.render('admin/restaurant', { restaurant: restaurant.toJSON() })
      })
  },

  //新增餐廳
  createRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        return res.render('admin/create', { categories })
      })

  },
  postRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!req.body.name) {
      req.flash('error_messages', '請輸入餐廳名稱')
      return res.redirect('back')
    }
    //增加圖片上傳
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.readFile(file.path, (err, img) => {
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
            req.flash('success_messages', '餐廳建立成功')
            res.redirect('/admin/restaurants')
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
          req.flash('success_messages', '餐廳建立成功')
          res.redirect('/admin/restaurants')
        })
    }
  },

  //編輯餐廳
  editRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return Restaurant.findByPk(req.params.id)
          .then(restaurant => {
            return res.render('admin/create', { restaurant: restaurant.toJSON(), categories })
          })
      })
  },
  putRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!req.body.name) {
      req.flash('error_messages', '請輸入餐廳名稱')
      return res.redirect('back')
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
                req.flash('success_messages', '餐廳編輯成功')
                res.redirect('/admin/restaurants')
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
              req.flash('success_messages', '餐廳編輯成功')
              res.redirect('/admin/restaurants')
            })
        })
    }
  },

  //刪除餐廳
  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy()
          .then(restaurant => {
            res.redirect('/admin/restaurants')
          })
      })
  }
}

module.exports = adminController