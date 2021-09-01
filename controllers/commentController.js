const db = require('../models')
const Comment = db.Comment

const commentController = {
  postComment: (req, res) => {
    if (req.body.text) {
      return Comment.create({
        text: req.body.text,
        RestaurantId: req.body.restaurantId,
        UserId: req.user.id
      })
        .then(comment => {
          res.redirect(`/restaurants/${req.body.restaurantId}`)
        })

    } else {
      req.flash('error_messages', '請輸入評論內容')
      return res.redirect('back')
    }
  }

}

module.exports = commentController