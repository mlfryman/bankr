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
  this.pin = a.pin;
  this.balance = a.balance;
  this.date = new Date(a.date);
}

Object.defineProperty(Account, 'collection', {
  get: function(){return global.mongodb.collection('accounts');}
});

Account.prototype.create = function(cb){
  var self = this;
  hashPin(self.pin, function(hashedPin){
    self.pin = hashedPin;
    Account.collection.save(self, cb);
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
