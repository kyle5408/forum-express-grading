const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  getRestaurants: (req, res) => {
    //利用where: { attribute: value } 查詢的方法
    //要傳給 findAll 的參數，需要包裝成物件格式
    const whereQuery = {}
    let categoryId = ''
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.categoryId = categoryId
    }

    Restaurant.findAll({ raw: true, nest: true, include: Category, where: whereQuery })
      .then(restaurants => {
        const data = restaurants.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          categoryName: r.Category.name
        }))
        Category.findAll({
          raw: true,
          nest: true,
        })
          .then(categories => {
            return res.render('restaurants', { restaurants: data, categories, categoryId })
          })
      })
  },

  getRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id, { include: [Category] })
      .then(restaurant => {
        return res.render('restaurant', { restaurant: restaurant.toJSON() })
      })
  }
}

// const restController = {
//   getRestaurants: (req, res) => {
//     Restaurant.findAll({ include: [Category] }).then(restaurants => {
//       const data = restaurants.map(r => ({
//         ...r.dataValues,
//         description: r.dataValues.description.substring(0, 50),
//         categoryName: r.Category.name
//       }))
//       return res.render('restaurants', {
//         restaurants: data
//       })
//     })
//   }
// }

module.exports = restController