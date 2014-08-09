'use strict';

var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('express-method-override');
var home = require('../controllers/home');
var accounts = require('../controllers/accounts');

module.exports = function(app, express){
  app.use(morgan('dev'));
  app.use(express.static(__dirname + '/../static'));
  app.use(bodyParser.urlencoded({extended:true}));
  app.use(methodOverride());

  app.get('/', home.index);
  app.get('/about', home.about);
  app.get('/faq', home.faq);
  app.get('/contact', home.contact);

  app.get('/accounts/new', accounts.init);
  app.post('/accounts/new', accounts.create);

  app.get('/accounts', accounts.showAll);
  app.get('/accounts/:id', accounts.overview);
  app.get('/accounts/:id/transaction', accounts.transInit);
  app.get('/accounts/:id/transfer', accounts.xferInit);

  app.post('/accounts/:id/transaction', accounts.transCreate);
  app.post('/accounts/:id/transfer', accounts.xferCreate);

console.log('Pipeline Configured');
};
