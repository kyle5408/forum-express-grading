//for test
const helpers = require('../_helpers')
const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
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

  //註冊
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  //登入
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  //登出
  app.get('/logout', userController.logout)



}
