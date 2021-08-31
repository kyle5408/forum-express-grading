const db = require('../models')
const user = require('../models/user')
const Category = db.Category

let categoryController = {
  getCategories: (req, res) => {
    return Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id)
          .then(category => {
            return res.render('admin/categories', { categories, category: category.toJSON() })
          })
      } else {
        return res.render('admin/categories', { categories })
      }
    })
  },

  postCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '名稱不得為空')
      return res.redirect('back')
    } else {
      Category.create({
        name: req.body.name
      })
        .then(category => {
          return res.redirect('/admin/categories')
        })
    }
  },

  putCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '名稱不得為空')
      return res.redirect('back')
    } else {
      Category.findByPk(req.params.id)
        .then(category => {
          category.update({
            name: req.body.name
          })
            .then(category => {
              res.redirect('/admin/categories')
            })
        })
    }
  },

  deleteCategory: (req, res) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        category.destroy()
          .then(() => {
            res.redirect('/admin/categories')
          })
      })
  }
}
module.exports = categoryController