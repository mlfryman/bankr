'use strict';

var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('express-method-override');
var home = require('../controllers/home');
var priorities = require('../controllers/priorities');
var tasks = require('../controllers/tasks');

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

  app.get('/accounts/:id', accounts.overview);
  app.get('/accounts/:id/transaction', accounts.trans-init);
  app.get('/accounts/:id/transfer', accounts.xfer-init);

  app.post('/accounts/:id/transaction', accounts.trans-create);
  app.post('/accounts/:id/transfer', accounts.xfer-create);

console.log('Pipeline Configured');
};
