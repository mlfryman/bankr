'use strict';

var Mongo = require('mongodb');
var _ = require('lodash');
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

Account.create = function(o, cb){
  var a = new Account(o);
  Account.collection.save(a, cb);
};

Account.findAll = function(cb){
  Account.collection.find().toArray(cb);
};

Account.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Account.collection.findOne({_id:_id}, function(err, obj){
    var account = changePrototype(obj);
    cb(account);
  });
};



module.exports = Account;

// PRIVATE HELPER FUNCTION //

function changePrototype(obj){
  return _.create(Account.prototype, obj);
}
