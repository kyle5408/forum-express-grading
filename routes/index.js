//for test
const helpers = require('../_helpers')
const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController')
const commentController = require('../controllers/commentController')
const passport = require('passport')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

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


module.exports = (app) => {

  app.get('/', authenticated, (req, res) => {
    res.redirect('/restaurants')
  })
  app.get('/admin', authenticatedAdmin, (req, res) => {
    res.redirect('/admin/restaurants')
  })

  //使用者顯示所有餐廳
  app.get('/restaurants', authenticated, restController.getRestaurants)
  app.get('/restaurants/feeds', authenticated, restController.getFeeds)
//使用者顯示最受歡迎餐廳
  app.get('/restaurants/top', authenticated, restController.getTopRestaurant)
  //使用者顯示某間餐廳
  app.get('/restaurants/:id', authenticated, restController.getRestaurantCount, restController.getRestaurant)
  //使用者顯示某間餐廳Dashboard
  app.get('/restaurants/:id/dashboard', authenticated, restController.getRestaurantDashboard)
  //使用者顯示美食達人(要放在 GET /users/:id 的前面，不然 /users/top 會被優先用 /users/:id 的結構來解析)
  app.get('/users/top', authenticated, userController.getTopUser)
  //使用者顯示個人頁面
  app.get('/users/:id', authenticated, userController.getUser)
  //使用者編輯個人頁面
  app.get('/users/:id/edit', authenticated, userController.editUser)
  app.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

  //使用者加入最愛
  app.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
  //使用者移除最愛
  app.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

  //使用者加入Like
  app.post('/like/:restaurantId', authenticated, userController.addLike)
  //使用者移除Like
  app.delete('/like/:restaurantId', authenticated, userController.removeLike)
  //使用者追蹤
  app.post('/following/:userId', authenticated, userController.addFollowing)
  //使用者取消追蹤
  app.delete('/following/:userId', authenticated, userController.removeFollowing)

  //使用者新增評論
  app.post('/comments', authenticated, commentController.postComment)
  //管理者刪除評論
  app.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

  //管理者編輯某間餐廳
  app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
  app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)

  //管理者新建某間餐廳
  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
  app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)

  //管理者刪除餐廳
  app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)

  //管理者顯示所有餐廳
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
  //管理者顯示指定餐廳
  app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)

  //管理者顯示所有使用者
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  //管理者編輯使用者權限
  app.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)

  //管理者顯示所有分類
  app.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
  //管理者新增分類
  app.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)
  //管理者編輯分類
  app.get('/admin/categories/:id/edit', authenticatedAdmin, categoryController.getCategories)
  app.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
  //管理者刪除分類
  app.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

  //註冊
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  //登入
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  //登出
  app.get('/logout', userController.logout)
}
