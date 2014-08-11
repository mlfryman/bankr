'use strict';

var accounts = require('../controllers/accounts');
var home = require('../controllers/home');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('express-method-override');

module.exports = function(app, express){
  app.use(morgan('dev'));
  app.use(express.static(__dirname + '/../static'));
  app.use(bodyParser.urlencoded({extended:true}));
  app.use(methodOverride());

  app.get('/', home.index);

  app.get('/accounts/new', accounts.init);
  app.post('/accounts', accounts.create);
  app.get('/accounts', accounts.index);
  app.get('/accounts/:id', accounts.show);

  app.get('/accounts/:id/transaction', accounts.transactionInit);
  app.post('/accounts/:id/transaction', accounts.transaction);

  app.get('/accounts/:id/transfer', accounts.transferInit);
  app.post('/accounts/:id/transfer', accounts.transfer);

console.log('Pipeline Configured');
};
