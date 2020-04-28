let BookInstance = require('../models/bookinstance');

exports.bookinstance_list = function (req, res, next) {
  BookInstance.find()
    .populate('book')
    .exec((err, bookInstancesResult) => {
      if (err){
        return next(err)
      } else {
        res.render('bookinstance_list' , {title: 'book instance list', bookInstanceListData: bookInstancesResult})
      }
    })
};

exports.bookinstance_detail = function (req, res) {
  res.send('not implemented bookinstance detail');
};

exports.bookinstance_create_get = function (req, res) {
  res.send('not implemented bookinstance create get');
};
exports.bookinstance_create_post = function (req, res) {
  res.send('not implemented bookinstance create post');
};
exports.bookinstance_delete_get = function (req, res) {
  res.send('not implemented bookinstance delete get');
};
exports.bookinstance_delete_post = function (req, res) {
  res.send('not implemented bookinstance delete post');
};
exports.bookinstance_update_get = function (req, res) {
  res.send('not implemented bookinstance update get');
};
exports.bookinstance_update_post = function (req, res) {
  res.send('not implemented bookinstance update post');
};
