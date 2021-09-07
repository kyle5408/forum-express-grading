const db = require('../../models')
const user = require('../../models/user')
const Category = db.Category

const categoryService = require('../../services/categoryService')

const categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, data => {
      return res.json(data)
    })
  },

  postCategory: (req, res) => {
    categoryService.postCategory(req, res, data => {
      return res.json(data)
    })
  },

  putCategory: (req, res) => {
    categoryService.putCategory(req, res, data => {
      return res.json(data)
    })
  },

  // deleteCategory: (req, res) => {
  //   return Category.findByPk(req.params.id)
  //     .then(category => {
  //       category.destroy()
  //         .then(() => {
  //           res.redirect('/admin/categories')
  //         })
  //     })
  // }
}
module.exports = categoryController