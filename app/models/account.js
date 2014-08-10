'use strict';

var Mongo = require('mongodb');
var bcrypt = require('bcrypt');
//var _ = require('lodash');
//var Transaction = require('./transaction');
//var Transfer = require('./transfer');

function Account(a){
  this.name = a.name;
  this.photo = a.photo;
  this.type = a.type;
  this.color = a.color;
  this.dateCreated = new Date(a.dateCreated);
  this.pin = a.pin * 1;
  this.initDeposit = parseFloat(a.initDeposit);
  this.balance = parseFloat(a.balance);
}

Object.defineProperty(Account, 'collection', {
  get: function(){return global.mongodb.collection('accounts');}
});

Account.prototype.create = function(cb){
  var account = this;
  hashPin(account.pin, function(hashedPin){
    account.pin = hashedPin;
    Account.collection.save(account, cb);
  });
};

function findByIdAndPin(id, pin, cb){
  var _id = Mongo.ObjectID(id);
  Account.collection.findOne({_id:_id}, function(err, obj){
    if(obj){
      bcrypt.compare(pin, _id.pin, function(err, result){
        if(result){
          cb(result);
        }else{
          cb(null);
        }
        cb(null);
      });
    }
  });
}

function hashPin(pin, cb){
  bcrypt.hash(pin, 8, function(err, hash){
    cb(hash);
  });
}

module.exports = Account;

// PRIVATE HELPER FUNCTION //

//function changePrototype(obj){
//  return _.create(Account.prototype, obj);
//}
