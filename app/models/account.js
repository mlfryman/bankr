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

Account.deposit = function(o, cb){
  var id = makeOid(o.id);
  var query = {_id:id};
  //return listed fields only
  var fields = {fields:{balance:1, pin:1, numTransacts:1}};
  //clone transaction object b/c will change it
  var deposit = _.cloneDeep(o);
  deposit.amount *= 1;
  Account.collection.findOne(query, fields, function(err, a){
    // console.log(err, dbObj, deposit);
    // if the pin matches, perform deposit and update record in dbase
    if(o.pin === a.pin){
      a.balance += deposit.amount;
      deposit.id = a.numTransacts + 1;
      deposit.fee = '';
      deposit.date = new Date();
      delete deposit.pin;
      Account.collection.update(query, {$set:{balance:a.balance}, $inc:{numTransacts:1}, $push:{transactions:deposit}}, function(){
        if(cb){cb();}
      });
    }else{
      if(cb){cb();}
    }
  });
};

Account.withdraw = function(o, cb){
  var id = makeOid(o.id);
  var query = {_id:id}, fields = {fields:{balance:1, pin:1, numTransacts:1}};
  var withdraw = _.cloneDeep(o);
  withdraw.amount *= 1;
  Account.collection.findOne(query, fields, function(err, a){
    //console.log(err, a, withdraw);

    if(o.pin === a.pin){
      a.balance -= withdraw.amount;
      a.balance -= (a.balance < 0) ? 50 : 0;
      withdraw.id = a.numTransacts + 1;
      withdraw.fee = (a.balance < 0) ? 50 : '';
      withdraw.date = new Date();
      delete withdraw.pin;
      //console.log(withdraw);
      Account.collection.update(query, {$set:{balance:a.balance}, $inc:{numTransacts:1}, $push:{transactions:withdraw}}, function(){
        if(cb){cb();}
      });
    }else{
      if(cb){cb();}
    }
  });
};

Account.transaction = function(o, cb){
  // type of transaction switch to move logic from controller into model
  if(o.type === 'deposit'){
    Account.deposit(o, cb);
  }else{
    Account.withdraw(o, cb);
  }
};

Account.transfer = function(o, cb){
  o.fromId = makeOid(o.fromId);
  o.toId = makeOid(o.toId);
  o.amount *= 1;
  var total = o.amount + 25;
  module.exports = Account;
  // return the balance & pin of the transferor from dbase
  Account.collection.findOne({_id:o.fromId}, {fields:{balance:1, pin:1}}, function(err, a){
    //console.log(a);
    // if pin matches and sufficient funds, perform transfer
    if(o.pin === a.pin && a.balance >= total){
      a.balance -= total;
      // get the to name for the to property
      Account.collection.findOne({_id:o.toId}, {fields:{name:1}}, function(err, acct){
        //console.log(err, acct);
        o.to = acct.name;
        // create new transfer object
        Transfer.save(o, function(err, t){
          //console.log(t);
          // update both the transferor & transferee in dbase with adjusted balance and new transferId
         Account.collection.update({_id:a._id}, {$set:{balance:a.balance}, $push:{transferIds:t._id}}, function(){
            Account.collection.update({_id:o.toId}, {$inc:{balance:o.amount}, $push:{transferIds:t._id}}, function(){
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
