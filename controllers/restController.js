const helpers = require('../_helpers')
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10
const Sequelize = require('sequelize')

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
          categoryName: r.Category.name,
          isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
          //藉由passport的反序列化取出like的餐廳
          isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
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
    Restaurant.findByPk(req.params.id, {
      // raw: true,
      // nest: true,
      include: [Category, { model: User, as: 'FavoritedUsers' }, { model: User, as: 'LikedUsers' }, { model: Comment, include: [User] }]
    })
      .then(restaurant => {
        const userId = helpers.getUser(req).id
        const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(userId)
        const isLiked = restaurant.LikedUsers.map(d => d.id).includes(userId)
        return res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked })
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

  getRestaurantDashboard: async (req, res) => {
    try {
      const comment = await Comment.findAndCountAll({ raw: true, nest: true, include: [Restaurant], where: { RestaurantId: req.params.id } })
      const restaurant = await Restaurant.findByPk(req.params.id, { raw: true, nest: true, include: [Category] })
      res.render('dashboard', { count: comment.count, restaurant })
    }
    catch (err) {
      console.log(err)
    }
  },

  getRestaurantCount: (req, res, next) => {
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        const viewCounts = restaurant.viewCounts + 1
        restaurant.update({
          viewCounts: viewCounts
        })
      })
    return next()
  },

  getTopRestaurant: (req, res) => {
    Restaurant.findAll({
      include: [{
        model: User, as: 'FavoritedUsers'
      }]
    })
      .then(restaurants => {
        const userId = helpers.getUser(req).id
        restaurants = restaurants.map(restaurant => ({
          ...restaurant.dataValues,
          description: restaurant.description.substring(0, 50),
          favoritedCount: restaurant.FavoritedUsers.length,
          isFavorited: restaurant.FavoritedUsers.map(d => d.id).includes(userId)
        }))
        restaurants = restaurants.sort((a, b) => b.favoritedCount - a.favoritedCount)
        restaurants = restaurants.slice(0, 10)
        res.render('topRestaurant', { restaurants })
      })
  }
}

module.exports = restController