const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

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

exports.book_create_get = function (req, res, next) {
  async.parallel(
    {
      authors: (callback) => {
        Author.find(callback);
      },
      genres: (callback) => {
        Genre.find().exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render('book_form', {
        title: 'create book',
        authors: results.authors,
        genres: results.genres,
      });
    }
  );
};

exports.book_create_post = [
  //convert genre to an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },
  // Validate fields.
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }),

  // Sanitize fields (using wildcard).
  sanitizeBody('*').escape(),

  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          authors: function (callback) {
            Author.find(callback);
          },
          genres: function (callback) {
            Genre.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = 'true';
            }
          }
          res.render('book_form', {
            title: 'Create Book',
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Save book.
      book.save(function (err) {
        if (err) {
          return next(err);
        }
        //successful - redirect to new book record.
        res.redirect(book.url);
      });
    }
  },
];
exports.book_delete_get = function (req, res, next) {
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.params.id).exec(callback);
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
        res.redirect('/catalog/books');
      } else {
        res.render('book_delete', {
          title: 'Delete the book',
          book: results.book,
          book_instance: results.book_instance,
        });
      }
    }
  );
};

exports.book_delete_post = function (req, res, next) {
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.body.bookid).exec(callback);
      },
      book_bookinstances: (callback) => {
        BookInstance.find({ book: req.body.authorid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.book_bookinstances.length > 0) {
        //author has books.
        res.render('book_delete', {
          title: 'Delete Book',
          book: results.book,
          book_bookinstances: results.book_bookinstances,
        });
      } else {
        //author has no books. delete and redirect to liist of books
        Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
          if (err) {
            return next(err);
          }
          res.redirect('/catalog/books');
        });
      }
    }
  );
};
exports.book_update_get = function (req, res, next) {
  // Get book, authors and genres for form.
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.params.id)
          .populate('author')
          .populate('genre')
          .exec(callback);
      },
      authors: (callback) => {
        Author.find({}, callback); //this and the one below and exec one are all the same. I guess...
      },
      genres: (callback) => {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.book === null) {
        let err = new Error('book not found');
        err.status = 404;
        return next(err);
      }
      //not empty and successful so mark our selected genre as checked
      for (
        let all_g_iter = 0;
        all_g_iter < results.genres.length;
        all_g_iter++
      ) {
        for (
          let book_g_iter = 0;
          book_g_iter < results.book.genre.length;
          book_g_iter++
        ) {
          if (
            results.genres[all_g_iter]._id.toString() ===
            results.book.genre[book_g_iter]._id.toString()
          ) {
            results.genres[all_g_iter].checked = 'true';
          }
        }
      }
      res.render('book_form', {
        title: 'Book Update',
        book: results.book,
        authors: results.authors,
        genres: results.genres,
      });
    }
  );
};

exports.book_update_post = [
  // convert the genre to an array, again
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },
  //validate of course
  body('title', "title can't be empty").trim().isLength({ min: 1 }),
  body('author', 'author cant be empty').trim().isLength({ min: 2 }),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }),

  //sanitize again
  sanitizeBody('*').escape(),

  //process the rest
  (req, res, next) => {
    //extract the validation errors
    const errors = validationResult(req);

    //create the book with the escaped and validated results
    let book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === 'undefined' ? [] : req.body.genre,
      _id: req.params.id, // !!!!!!!!! this is a must. OTHERWISE A NEW ID WILL BE ASSIGNED!!!!!
    });

    if (!errors.isEmpty()) {
      //means there are errors and handle them by rendering the form again with the sanitized values

      async.parallel(
        {
          authors: (callback) => {
            Author.find(callback);
          },
          genres: (callback) => {
            Genre.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          //mark our selected genres again
          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = 'true';
            }
          }
          res.render('book_form', {
            title: 'update book',
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors: errors.array(),
          });
          return;
        }
      );
    } else {
      // form is valid. update
      Book.findByIdAndUpdate(req.params.id, book, {}, function (err, thebook){
        if (err){return next(err)}
        res.redirect(thebook.url)
      })
    }
  },
];
