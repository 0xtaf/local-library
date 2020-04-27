let Author = require('../models/author');

//author list
exports.author_list = function (req, res) {
  res.send('NOT IMPLEMENTED: author list');
};

exports.author_detail = function (req, res) {
  res.send('NOT IMPLEMENTED: author detail:' + req.params.id);
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
