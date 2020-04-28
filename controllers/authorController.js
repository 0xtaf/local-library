let Author = require('../models/author');
let Book = require('../models/book');

const async = require('async');

//author list
exports.author_list = function (req, res, next) {
  Author.find()
    // .populate('author')
    .sort([['family_name', 'ascending']])
    .exec((err, authorResult) => {
      if (err) {
        next(err);
      } else {
        res.render('author_list', {
          title: 'Author List',
          authorData: authorResult,
        });
      }
    });
};

exports.author_detail = function (req, res, next) {
  async.parallel(
    {
      author: (callback) => {
        Author.findById(req.params.id).exec(callback);
      },
      books: (callback) => {
        Book.find({ author: req.params.id }, 'title summary').exec(callback)
      } 
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.author === null) {
        let err = new Error('Author not found');
        err.status = 404;
        return next(err);
      } else {
        res.render('author_detail', {title: 'author detail', author:results.author, books:results.books})
      }
      console.log(results.books)
    }
  );
};

exports.author_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED: author create get');
};

exports.author_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED: author create post');
};

exports.author_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: author delete get');
};

exports.author_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: author delete post');
};

exports.author_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: author update get');
};

exports.author_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: author update post');
};
