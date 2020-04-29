const Genre = require('../models/genre');
const Book = require('../models/book');

const validator = require('express-validator');

const async = require('async');

exports.genre_list = function (req, res, next) {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec((err, genreResults) => {
      if (err) {
        next(err);
      } else {
        res.render('genre_list', {
          title: 'Genre List',
          genreData: genreResults,
        });
      }
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res, next) {
  async.parallel(
    {
      genre: (callback) => {
        Genre.findById(req.params.id).exec(callback);
      },
      genre_books: (callback) => {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      if (results.genre === null) {
        let err = new Error('Genre not found');
        err.status = 404;
        return next(err);
      } else {
        res.render('genre_detail', {
          title: 'Genre Details',
          genre: results.genre,
          genre_books: results.genre_books,
        });
      }
    }
  );
};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res) {
  res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
// I won't make different middewares and instead use and array in which they get triggered in order.
exports.genre_create_post = [
  //trim first and then check if the field has a letter at least
  validator.body('name', 'genre name required').trim().isLength({ min: 1 }),
  //if it does, sanitize
  validator.sanitizeBody('name').escape(),
  //process the request
  (req, res, next) => {
    //extract the validation errors from the req
    const errors = validator.validationResult(req);
    //create a sanitized and validated object
    let genre = new Genre({
      name: req.body.name,
    });

    //check if any errors occured
    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'create genre (again)',
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      //which means the form is valid now
      //check if genre with the same name exists already
      Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
        if (err) {
          return next(err);
        }
        if (found_genre) {
          //genre exists, redirect to its detail page
          res.redirect(found_genre.url);
        } else {
          genre.save(function (err) {
            if (err) {
              return next(err);
            }
            //now genre saved
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res, next) {
  async.parallel(
    {
      genre: (callback) => {
        Genre.findById(req.params.id).exec(callback);
      },
      genre_books: (callback) => {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genre === null) {
        res.redirect('/catalog/genres');
      } else {
        res.render('genre_delete', {
          title: 'Genre delete',
          genre: results.genre,
          genre_books: results.genre_books,
        });
      }
    }
  );
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res, next) {
  async.parallel(
    {
      genre: (callback) => {
        Genre.findById(req.body.genreid).exec(callback);
      },
      genre_books: (callback) => {
        Book.find({ genre: req.body.genreid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genre_books.length > 0) {
        //has genre
        res.render('genre_delete', {
          title: 'genre delete',
          genre: results.genre,
          genre_books: results.genre_books,
        });
      } else {
        //has no genre ready to be deleted
        Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
          if (err) {
            return next(err);
          }
          res.redirect('/catalog/genres');
        });
      }
    }
  );
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre update POST');
};
