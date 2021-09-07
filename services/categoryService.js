const db = require('../models')
const user = require('../models/user')
const Category = db.Category

const categoryService = {
  getCategories: (req, res, callback) => {
    return Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id)
          .then(category => {
            callback({ categories, category: category.toJSON() })
          })
      } else {
        callback({ categories })
      }
    })
  },

  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: '名稱不得為空' })
      // req.flash('error_messages', '名稱不得為空')
      // return res.redirect('back')
    } else {
      Category.create({
        name: req.body.name
      })
        .then(category => {
          callback({ status: 'success', message: '類別建立成功' })
          // return res.redirect('/admin/categories')
        })
    }
  },

  putCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: '名稱不得為空' })
      // req.flash('error_messages', '名稱不得為空')
      // return res.redirect('back')
    } else {
      Category.findByPk(req.params.id)
        .then(category => {
          category.update({
            name: req.body.name
          })
            .then(category => {
              callback({ status: 'success', message: '類別更新成功' })
              // res.redirect('/admin/categories')
            })
        })
    }
  },

  deleteCategory: (req, res, callback) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        category.destroy()
          .then(() => {
            callback({ status: 'success', message: '類別刪除成功' })
            // res.redirect('/admin/categories')
          })
      })
  }
}
module.exports = categoryService