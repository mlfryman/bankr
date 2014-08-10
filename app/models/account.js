'use strict';

//var _ = require('lodash');
var async = require('async');
var Transfer = require('./transfer');
var Mongo = require('mongodb');

Object.defineProperty(Account, 'collection', {
  get: function(){return global.mongodb.collection('accounts');}
});

function Account(o){
  this.name = o.name;
  this.dateCreated = new Date();
  this.color = o.color;
  this.photo = o.photo;
  this.type = o.type;
  this.pin = o.pin;
  this.balance = o.deposit * 1;
  this.numTransacts = 0;
  this.transactions = [];
  this.transferIds = [];
}

Account.create = function(o, cb){
  var a = new Account(o);
  Account.collection.save(a, cb);
};

Account.findAll = function(cb){
  Account.collection.find({}, {sort:{name:1}, fields:{name:1, color:1, balance:1, type:1, opened:1}}).toArray(function(err, accounts){
    cb(err, accounts);
  });
};

Account.findById = function(id, cb){
  id = makeOid(id);
  Account.collection.findOne({_id:id}, function(err, account){
    async.map(account.transferIds, function(tId, done){
      makeTransfer(tId, done, account.name);}, function(err, transfers){
        account.transfers = transfers;
        cb(account);
      });
  });
};

Account.findByIdLite = function(id, cb){
  id = makeOid(id);
  //console.log(id);
  Account.collection.findOne({_id:id}, {fields:{name:1, type:1}}, function(err, account){
    //console.log(err, account);
    cb(account);
  });
};



module.exports = Account;

// PRIVATE HELPER FUNCTION //

function makeOid(id){
  return (typeof id === 'string') ? Mongo.ObjectID(id) : id;
}
function makeTransfer(tId, cb, name){
  Transfer.findById(tId, function(err, transfer){
    if(transfer.from === name){
      transfer.from = '';
    }else{
      transfer.to = '';
      transfer.fee = '';
    }
    //console.log(name, transfer);
    cb(null, transfer);
  });
}
