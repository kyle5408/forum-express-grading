const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  //瀏覽所有餐廳
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true, nest: true })
      .then(restaurants => {
        return res.render('admin/restaurants', { restaurants })
      })
  },

  //瀏覽單筆餐廳
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true, nest: true })
      .then(restaurant => {
        return res.render('admin/restaurant', { restaurant })
      })
  },

  //新增餐廳
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },
  postRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!req.body.name) {
      req.flash('error_messages', '請輸入餐廳名稱')
      return res.redirect('back')
    }
    return Restaurant.create({
      name, tel, address, opening_hours, description
    })
      .then(restaurant => {
        req.flash('success_messages', '餐廳建立成功')
        res.redirect('/admin/restaurants')
      })
  },

  //編輯餐廳
  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true, nest: true })
      .then(restaurant => {
        return res.render('admin/create', { restaurant })
      })
  },
  putRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!req.body.name) {
      req.flash('error_messages', '請輸入餐廳名稱')
      return res.redirect('back')
    }
    //update和destroy不用把資料拆解
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.update({
          name, tel, address, opening_hours, description
        })
          .then(restaurant => {
            req.flash('success_messages', '餐廳編輯成功')
            res.redirect('/admin/restaurants')
          })
      })
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