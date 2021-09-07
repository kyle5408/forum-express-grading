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
  },

  putCategory: (req, res) => {
    categoryService.putCategory(req, res, data => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      } else {
        req.flash('success_messages', data['message'])
        res.redirect('/admin/categories')
      }
    })



  },

  deleteCategory: (req, res) => {
    categoryService.deleteCategory(req, res, data => {
      if (data['status'] !== 'success') {
        req.flash('error_messages', '類別刪除失敗')
        return res.redirect('back')
      } else {
        req.flash('success_messages', '類別刪除成功')
        res.redirect('/admin/categories')
      }
    })
    // return Category.findByPk(req.params.id)
    //   .then(category => {
    //     category.destroy()
    //       .then(() => {
    //         res.redirect('/admin/categories')
    //       })
    //   })
  }
}
module.exports = categoryController