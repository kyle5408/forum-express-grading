const { raw } = require('body-parser')
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    let pageOffset = 0
    if (req.query.page) {
      pageOffset = (req.query.page - 1) * pageLimit
    }

    //利用where: { attribute: value } 查詢的方法
    //要傳給 findAll 的參數，需要包裝成物件格式
    const whereQuery = {}
    let categoryId = ''
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.categoryId = categoryId
    }

    Restaurant.findAndCountAll({ raw: true, nest: true, include: Category, where: whereQuery, offset: pageOffset, limit: pageLimit })
      .then(results => {
        const pageNow = Number(req.query.page) || 1
        const pages = Math.ceil(results.count / pageLimit)
        //將頁數轉成陣列傳到views用
        const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
        const pagePre = (pageNow - 1 < 1) ? pageNow : pageNow - 1
        //findAndCountAll中有count(資料個數)和rows(資料)
        const pageNext = (pageNow + 1 > results.count) ? pageNow : pageNow + 1
        const data = results.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          categoryName: r.Category.name
        }))
        Category.findAll({
          raw: true,
          nest: true,
        })
          .then(categories => {
            return res.render('restaurants', { restaurants: data, categories, categoryId, pageNow, totalPage, pagePre, pageNext })
          })
      })
  },

  getRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id, { include: [Category, { model: Comment, include: [User] }] })
      .then(restaurant => {
        return res.render('restaurant', { restaurant: restaurant.toJSON() })
      })
  },

  getFeeds: async (req, res) => {
    try {
      restaurants = await Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      })
      comments = await Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
      return res.render('feeds', { restaurants, comments })
    }
    catch (err) {
      console.log('catch', err)
    }
  },

  getRestaurantDashboard: (req, res) => {
    Comment.findAndCountAll({ raw: true, nest: true, include: [Restaurant], where: { RestaurantId: req.params.id } })
      .then(result => {
        res.render('dashboard', { count: result.count })
      })

  }

  //Promise寫法
  // getFeeds: (req, res) => {
  //   return Promise.all([
  //     Restaurant.findAll({
  //     limit: 10,
  //     raw: true,
  //     nest: true,
  //     order: [['createdAt', 'DESC']],
  //     include: [Category]
  //   }), 
  //   Comment.findAll({
  //     limit: 10,
  //     raw: true,
  //     nest: true,
  //     order: [['createdAt', 'DESC']],
  //     include: [User, Restaurant]
  //   })
  // ])
  //     .then(([restaurants,comments]) => {
  //           return res.render('feeds', { restaurants, comments })
  //     })
  // }

  // callback寫法
  // getFeeds: (req, res) => {
  //   return Restaurant.findAll({
  //     limit: 10,
  //     raw: true,
  //     nest: true,
  //     order: [['createdAt', 'DESC']],
  //     include: [Category]
  //   })
  //     .then(restaurants => {
  //       Comment.findAll({
  //         limit: 10,
  //         raw: true,
  //         nest: true,
  //         order: [['createdAt', 'DESC']],
  //         include: [User, Restaurant]
  //       })
  //         .then(comments => {
  //           return res.render('feeds', { restaurants, comments })
  //         })
  //     })
  // }
}

module.exports = restController