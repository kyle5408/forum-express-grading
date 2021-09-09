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
      return res.render('admin/restaurants', data)
    })
  },

  //瀏覽單筆餐廳
  getRestaurant: (req, res, callback) => {
    adminService.getRestaurant(req, res, data => {
      return res.render('admin/restaurant', data)
    })
  },

  //瀏覽所有使用者
  getUsers: (req, res) => {
    adminService.getUsers(req, res, data => {
      return res.render('admin/users', data)
    })
  },


  //編輯管理員權限(需保留一位)
  toggleAdmin: (req, res) => {
    adminService.toggleAdmin(req, res, data => {
      if(data['status'] === 'error'){
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      } else {
        req.flash('success_messages', data['message'])
        return res.redirect('/admin/users')
      }
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
    adminService.postRestaurant(req, res, data => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      } else {
        req.flash('success_messages', data['message'])
        res.redirect('/admin/restaurants')
      }
    })
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
    adminService.putRestaurant(req, res, data => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      } else {
        req.flash('success_messages', data['message'])
        res.redirect('/admin/restaurants')
      }
    })
  },

  //刪除餐廳
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, data => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  }
}

module.exports = adminController