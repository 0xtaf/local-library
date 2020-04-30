let Author = require('../models/author');
let Book = require('../models/book');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

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
        Book.find({ author: req.params.id }, 'title summary').exec(callback);
      },
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
        res.render('author_detail', {
          title: 'author detail',
          author: results.author,
          books: results.books,
        });
      }
      console.log(results.books);
    }
  );
};

exports.author_create_get = function (req, res) {
  res.render('author_form', { title: 'author create' });
};

exports.author_create_post = [
  //validate fields
  body('first_name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('first name must be specified')
    .isAlphanumeric()
    .withMessage('first name has non alphanumerical chars'),
  body('family_name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('family name must be specified')
    .isAlphanumeric()
    .withMessage('family name has non alphanumerical chars'),
  body('date_of_birth', 'invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601(),
  body('date_of_death', 'invalid date of death')
    .optional({ checkFalsy: true })
    .isISO8601(),

  //sanitize
  sanitizeBody('first_name').escape(),
  sanitizeBody('family_name').escape(),
  sanitizeBody('date_of_birth').toDate(),
  sanitizeBody('date_of_death').toDate(),

  //process the req
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'crete author (again)',
        errors: errors.array(),
        author: req.body,
      });
      return;
    } else {
      let author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
      });
      author.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect(author.url);
      });
    }
  },
];

exports.author_delete_get = function (req, res, next) {
  async.parallel(
    {
      author: (callback) => {
        Author.findById(req.params.id).exec(callback);
      },
      author_books: (callback) => {
        Book.find({ author: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.author === null) {
        res.redirect('/catalog/authors');
      } else {
        res.render('author_delete', {
          title: 'Delete Author',
          author: results.author,
          author_books: results.author_books,
        });
      }
    }
  );
};

exports.author_delete_post = function (req, res, next) {
  async.parallel(
    {
      author: (callback) => {
        Author.findById(req.body.authorid).exec(callback);
      },
      authors_books: (callback) => {
        Book.find({ author: req.body.authorid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.authors_books.length > 0) {
        //author has books.
        res.render('author_delete', {
          title: 'Delete Author',
          author: results.author,
          author_books: results.authors_books,
        });
      } else {
        //author has no books. delete and redirect to liist of authors
        Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
          if (err) {
            return next(err);
          }
          res.redirect('/catalog/authors');
        });
      }
    }
  );
};

exports.author_update_get = function (req, res, next) {
  Author.findById(req.params.id).exec((err, foundAuthors) => {
    if (err) {
      return next(err);
    }
    if (foundAuthors === null) {
      let err = new Error('no author found');
      err.status = 404;
      return next(err);
    } else {
      res.render('author_form', {
        title: 'update author',
        author: foundAuthors,
      });
    }
  });
};

exports.author_update_post = [
  //validate fields
  body('first_name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('first name must be specified')
    .isAlphanumeric()
    .withMessage('first name has non alphanumerical chars'),
  body('family_name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('family name must be specified')
    .isAlphanumeric()
    .withMessage('family name has non alphanumerical chars'),
  body('date_of_birth', 'invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601(),
  body('date_of_death', 'invalid date of death')
    .optional({ checkFalsy: true })
    .isISO8601(),

  //sanitize
  sanitizeBody('first_name').escape(),
  sanitizeBody('family_name').escape(),
  sanitizeBody('date_of_birth').toDate(),
  sanitizeBody('date_of_death').toDate(),

  //process the req
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'crete author (again)',
        errors: errors.array(),
        author: req.body,
      });
      return;
    } else {
      let author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id: req.params.id,
      });
      // form is valid. Update author.
      Author.findByIdAndUpdate(req.params.id, author, {}, function (
        err,
        theauthor
      ) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to genre detail page.
        res.redirect(theauthor.url);
      });
    }
  },
];
