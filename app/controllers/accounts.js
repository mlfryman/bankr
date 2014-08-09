'use strict';

var Account = require('../models/accunt');

exports.transfer = function(req, res){
  Account.findByIdAndPin(req.params.id, req.body.pin, function(err, result){
    result.transferMoney(req.body.differentAccount, function(err, count){
      Account.findById(req.params.id, function(err, account){
        res.render('account/' + req.params.id, {account:account});
      });
    });
  });
};
