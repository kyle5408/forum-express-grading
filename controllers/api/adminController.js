
const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category
const adminService = require('../../services/adminService')


const adminController = {
  //瀏覽所有餐廳
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, data => {
      return res.json(data)
    })
  },

  //瀏覽單筆餐廳
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, data => {
      return res.json(data)
    })
  },

  //刪除餐廳
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, data => {
      return res.json(data)
    })
  },

  //建立餐廳
  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, data => {
      return res.json(data)
    })
  },

  //編輯餐廳
  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, data => {
      return res.json(data)
    })
  }
}

module.exports = adminController
