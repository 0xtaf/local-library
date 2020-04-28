const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

const async = require('async');

exports.bookinstance_list = function (req, res, next) {
  BookInstance.find()
    .populate('book')
    .exec((err, bookInstancesResult) => {
      if (err) {
        return next(err);
      } else {
        res.render('bookinstance_list', {
          title: 'book instance list',
          bookInstanceListData: bookInstancesResult,
        });
      }
    });
};

exports.bookinstance_detail = function (req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, bookinstance) => {
      if (err) {
        return next(err);
      }
      if (bookinstance === null) {
        let err = new Error('this book has no instances');
        err.status = 404;
        return next(err);
      } else {
        res.render('bookinstance_detail', {
          title: 'Book Instance Detail',
          bookinstance: bookinstance,
        });
      }
    });
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
