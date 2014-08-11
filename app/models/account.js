'use strict';

var _ = require('lodash');
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
  this.numTract = 0;
  this.transactions = [];
  this.xferIds = [];
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
    async.map(account.xferIds, function(tId, done){
      makeTransfer(tId, done, account.name);}, function(err, transfers){
        account.transfers = transfers;
        cb(account);
      });
  });
};

Account.findByIdLite = function(id, cb){
  id = makeOid(id);
  Account.collection.findOne({_id:id}, {fields:{name:1, type:1}}, function(err, account){
    cb(account);
  });
};
Account.deposit = function(obj, cb){
  var id = makeOid(obj.id);
  var query = {_id:id};
  var fields = {fields:{balance:1, pin:1, numTract:1}};
  var deposit = _.cloneDeep(obj);
  deposit.amount *= 1;
  Account.collection.findOne(query, fields, function(err, a){
    if(obj.pin === a.pin){
      a.balance += deposit.amount;
      deposit.id = a.numTract + 1;
      deposit.fee = '';
      deposit.date = new Date();
      delete deposit.pin;
      Account.collection.update(query, {$set:{balance:a.balance}, $inc:{numTract:1}, $push:{transactions:deposit}}, function(){
        if(cb){cb();}
      });
    }else{
      if(cb){cb();}
    }
  });
};

Account.withdraw = function(obj, cb){
  var id = makeOid(obj.id);
  var query = {_id:id}, fields = {fields:{balance:1, pin:1, numTract:1}};
  var withdraw = _.cloneDeep(obj);
  withdraw.amount *= 1;
  Account.collection.findOne(query, fields, function(err, a){
    console.log(err, a, withdraw);
    if(obj.pin === a.pin){
      a.balance -= withdraw.amount;
      a.balance -= (a.balance < 0) ? 50 : 0;
      withdraw.id = a.numTract + 1;
      withdraw.fee = (a.balance < 0) ? 50 : '';
      withdraw.date = new Date();
      delete withdraw.pin;
      console.log(withdraw);
      Account.collection.update(query, {$set:{balance:a.balance}, $inc:{numTract:1}, $push:{transactions:withdraw}}, function(){
        if(cb){cb();}
      });
    }else{
      if(cb){cb();}
    }
  });
};

Account.transaction = function(obj, cb){
  if(obj.type === 'deposit'){
    Account.deposit(obj, cb);
  }else{
    Account.withdraw(obj, cb);
  }
};

Account.transfer = function(obj, cb){
  obj.fromId = makeOid(obj.fromId);
  obj.toId = makeOid(obj.toId);
  obj.amount *= 1;
  var total = obj.amount + 25;
  Account.collection.findOne({_id:obj.fromId}, {fields:{balance:1, pin:1}}, function(err, a){
    if(obj.pin === a.pin && a.balance >= total){
      a.balance -= total;
      Account.collection.findOne({_id:obj.toId}, {fields:{name:1}}, function(err, acct){
        obj.to = acct.name;
        Transfer.save(obj, function(err, t){
          Account.collection.update({_id:a._id}, {$set:{balance:a.balance}, $push:{xferIds:t._id}}, function(){
            Account.collection.update({_id:obj.toId}, {$inc:{balance:obj.amount}, $push:{xferIds:t._id}}, function(){
              if(cb){cb();}
            });
          });
        });
      });
    }else{
      if(cb){cb();}
    }
  });
};

module.exports = Account;

// PRIVATE HELPER FUNCTION

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
    cb(null, transfer);
  });
}
