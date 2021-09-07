const db = require('../models')
const user = require('../models/user')
const Category = db.Category

const categoryService = require('../services/categoryService')

const categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, data => {
      return res.render('admin/categories', data)
    })
  },

  postCategory: (req, res) => {
    categoryService.postCategory(req, res, data => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      } else {
        req.flash('success_messages', data['message'])
        res.redirect('/admin/categories')
      }
    })
    // if (!req.body.name) {
    //   req.flash('error_messages', '名稱不得為空')
    //   return res.redirect('back')
    // } else {
    //   Category.create({
    //     name: req.body.name
    //   })
    //     .then(category => {
    //       return res.redirect('/admin/categories')
    //     })
    // }
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