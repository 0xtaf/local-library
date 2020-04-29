const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

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

exports.bookinstance_create_get = function (req, res, next) {
  Book.find({}, 'title').exec(function (err, books) {
    if (err) {
      return next(err);
    }
    // Successful, so render.
    res.render('bookinstance_form', {
      title: 'Create BookInstance',
      book_list: books,
    });
  });
};
exports.bookinstance_create_post = [
  // Validate fields.
  body('book', 'Book must be specified').trim().isLength({ min: 1 }),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  sanitizeBody('book').escape(),
  sanitizeBody('imprint').escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    var bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, 'title').exec(function (err, books) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render('bookinstance_form', {
          title: 'Create BookInstance',
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance,
        });
      });
      return;
    } else {
      // Data from form is valid.
      bookinstance.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new record.
        res.redirect(bookinstance.url);
      });
    }
  },
];
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
