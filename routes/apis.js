const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController.js')
const userController = require('../controllers/api/userController')
const passport = require('../config/passport')

const authenticated = passport.authenticate('jwt', { session: false })

const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) { return next() }
    return res.json({ status: 'error', message: 'permission denied' })
  } else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}

router.get('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.getRestaurant)
//使用者顯示所有餐廳
router.get('/admin/restaurants', authenticated, authenticatedAdmin,  adminController.getRestaurants)

//管理者刪除餐廳
router.delete('/admin/restaurants/:id', authenticated, authenticatedAdmin,  adminController.deleteRestaurant)
//管理者新建某間餐廳
router.post('/admin/restaurants', authenticated, authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
//管理者編輯某間餐廳
router.put('/admin/restaurants/:id', authenticated, authenticatedAdmin, upload.single('image'), adminController.putRestaurant)

//管理者顯示所有使用者
router.get('/admin/users', authenticated, authenticatedAdmin, adminController.getUsers)

//管理者顯示所有分類
router.get('/admin/categories', authenticated, authenticatedAdmin, categoryController.getCategories)
//管理者新增分類
router.post('/admin/categories', authenticated, authenticatedAdmin,  categoryController.postCategory)
//管理者編輯分類
router.put('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.putCategory)
//管理者刪除分類
router.delete('/admin/categories/:id', authenticated, authenticatedAdmin,  categoryController.deleteCategory)

//JWT signin
router.post('/signin', userController.signIn)
//jwt signUp
router.post('/signup', userController.signUp)

module.exports = router