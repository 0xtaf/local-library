const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

const async = require('async');

exports.index = function (req, res) {
  async.parallel(
    {
      book_count: function (callback) {
        Book.countDocuments({}, callback);
      },
      book_instance_count: function (callback) {
        BookInstance.countDocuments({}, callback);
      },
      book_instance_available_count: function (callback) {
        BookInstance.countDocuments({ status: 'Available' }, callback);
      },
      author_count: function (callback) {
        Author.countDocuments({}, callback);
      },
      genre_count: function (callback) {
        Genre.countDocuments({}, callback);
      },
    },
    function (err, results) {
      res.render('index', {
        title: 'Local Library Home',
        error: err,
        data: results,
      });
    }
  );
};

exports.book_list = function (req, res, next) {
  Book.find({}, 'title')
    .populate('author')
    .exec((err, bookListResult) => {
      if (err) {
        return next(err);
      } else {
        res.render('book_list', {
          title: 'Book List',
          bookListData: bookListResult,
        });
      }
    });
};

exports.book_detail = function (req, res, next) {
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.params.id)
          .populate('author')
          .populate('genre')
          .exec(callback);
      },
      book_instance: (callback) => {
        BookInstance.find({ book: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.book === null) {
        let err = new Error('Book not found');
        err.status = 404;
        return next(err);
      } else {
        res.render('book_detail', {
          title: 'Book Details',
          book: results.book,
          book_instance: results.book_instance,
        });
      }
    }
  );
};

exports.book_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED: book create get');
};

exports.book_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED: book create post');
};
exports.book_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: book delete get');
};

exports.book_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: book delete post');
};
exports.book_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: book update get');
};

exports.book_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: book update post');
};
