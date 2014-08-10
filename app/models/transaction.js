'use strict';

var Mongo = require('mongodb');

var Transaction = function(t) {
  this.accountId = Mongo.ObjectID(t.accountId);
  this.date = new Date(t.date);
  this.type = t.type;
  this.amount = t.amount * 1;
};

Object.defineProperty(Transaction, 'collection', {
  get: function(){
    return global.mongodb.collection('transactions');
  }
});

Transaction.create = function(o, cb) {
  var transaction = new Transaction(o);
  Transaction.collection.save(transaction, function(){
    cb(transaction);
  });
};

Transaction.findByAccountId = function(accountId, cb) {
  Transaction.collection.find({
    accountId: Mongo.ObjectID(accountId)
  }).toArray(cb);
};

module.exports = Transaction;
