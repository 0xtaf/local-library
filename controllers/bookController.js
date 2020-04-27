let Book = require('../models/book');

exports.index = function(req,res){
  res.send('NOT IMPLEMENTED: site home page')
}

exports.book_list = function(req,res){
  res.send('NOT IMPLEMENTED: all books')
}

exports.book_detail =function(req,res){
  res.send('NOT IMPLEMENTED: detail: '+req.params.id)
}

exports.book_create_get = function(req,res){
  res.send('NOT IMPLEMENTED: book create get')
}

exports.book_create_post = function(req,res){
  res.send('NOT IMPLEMENTED: book create post')
}
exports.book_delete_get = function(req,res){
  res.send('NOT IMPLEMENTED: book delete get')
}

exports.book_delete_post = function(req,res){
  res.send('NOT IMPLEMENTED: book delete post')
}
exports.book_update_get = function(req,res){
  res.send('NOT IMPLEMENTED: book update get')
}

exports.book_update_post = function(req,res){
  res.send('NOT IMPLEMENTED: book update post')
}
