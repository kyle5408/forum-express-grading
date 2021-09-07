const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController.js')

router.get('/admin/restaurants/:id', adminController.getRestaurant)
router.get('/admin/restaurants', adminController.getRestaurants)
router.get('/admin/categories', categoryController.getCategories)
//刪除餐廳
router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)
//建立餐廳
router.post('/admin/restaurants', upload.single('image'), adminController.postRestaurant)
//管理者編輯某間餐廳
router.put('/admin/restaurants/:id', upload.single('image'), adminController.putRestaurant)
//管理者新增分類
router.post('/admin/categories', categoryController.postCategory)

module.exports = router