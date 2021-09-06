//for test
const helpers = require('../_helpers')
const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController')
const commentController = require('../controllers/commentController')
// const passport = require('passport')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })


const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const authenticated = (req, res, next) => {
  // if (req.isAuthenticated()) {
  //for test(因測試環境無法使用第三方套件函式)
  if (helpers.ensureAuthenticated(req)) {
    return next()
  }
  res.redirect('/signin')
}

const authenticatedAdmin = (req, res, next) => {
  // if (req.isAuthenticated()) {
  //   if (req.user.isAdmin) {
  //for test(因測試環境無法使用第三方套件函式)
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) {
      return next()
    }
    return res.redirect('/')
  }
  res.redirect('/signin')
}




router.get('/', authenticated, (req, res) => {
  res.redirect('/restaurants')
})
router.get('/admin', authenticatedAdmin, (req, res) => {
  res.redirect('/admin/restaurants')
})

//使用者顯示所有餐廳
router.get('/restaurants', authenticated, restController.getRestaurants)
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
//使用者顯示最受歡迎餐廳
router.get('/restaurants/top', authenticated, restController.getTopRestaurant)
//使用者顯示某間餐廳
router.get('/restaurants/:id', authenticated, restController.getRestaurantCount, restController.getRestaurant)
//使用者顯示某間餐廳Dashboard
router.get('/restaurants/:id/dashboard', authenticated, restController.getRestaurantDashboard)
//使用者顯示美食達人(要放在 GET /users/:id 的前面，不然 /users/top 會被優先用 /users/:id 的結構來解析)
router.get('/users/top', authenticated, userController.getTopUser)
//使用者顯示個人頁面
router.get('/users/:id', authenticated, userController.getUser)
//使用者編輯個人頁面
router.get('/users/:id/edit', authenticated, userController.editUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

//使用者加入最愛
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
//使用者移除最愛
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

//使用者加入Like
router.post('/like/:restaurantId', authenticated, userController.addLike)
//使用者移除Like
router.delete('/like/:restaurantId', authenticated, userController.removeLike)
//使用者追蹤
router.post('/following/:userId', authenticated, userController.addFollowing)
//使用者取消追蹤
router.delete('/following/:userId', authenticated, userController.removeFollowing)

//使用者新增評論
router.post('/comments', authenticated, commentController.postComment)
//管理者刪除評論
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

//管理者編輯某間餐廳
router.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
router.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)

//管理者新建某間餐廳
router.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
router.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)

//管理者刪除餐廳
router.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)

//管理者顯示所有餐廳
router.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
//管理者顯示指定餐廳
router.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)

//管理者顯示所有使用者
router.get('/admin/users', authenticatedAdmin, adminController.getUsers)
//管理者編輯使用者權限
router.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)

//管理者顯示所有分類
router.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
//管理者新增分類
router.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)
//管理者編輯分類
router.get('/admin/categories/:id/edit', authenticatedAdmin, categoryController.getCategories)
router.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
//管理者刪除分類
router.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

//註冊
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
//登入
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
//登出
router.get('/logout', userController.logout)


module.exports = router