/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect = require('chai').expect;
var Transaction = require('../../app/models/transaction');
var Mongo = require('mongodb');
var dbConnect = require('../../app/lib/mongodb');
var db = 'bankr-test';
var cp = require('child_process');

describe('Transaction', function(){
  before(function(done){
    dbConnect(db, function(){
      done();
    });
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/freshdb.sh', [db], {cwd: __dirname + '/../scripts'}, function(err, stdout, stderr){
      console.log(stdout, stderr);
      done();
    });
  });
  describe('constructor', function(){
    it('should create a new Transaction object', function(){
      var o = {type:'withdraw', accountId:'000000000000000000000001', date:'2014-08-11', amount:'50.00'};
      var t = new Transaction(o);
      console.log(t);
      expect(t).to.be.instanceof(Transaction);
      expect(t.type).to.equal('withdraw');
      expect(t.accountId).to.be.instanceof(Mongo.ObjectID);
      expect(t.amount).to.equal(50.00);
    });
  });
  describe('.create', function(){
    it('should save a new Transaction object', function(done){
      Transaction.create({'_id':'53e596422e13be436066f732', 'accountId':'00000000000000000000001', 'type':'deposit', 'date':'2014-07-01', 'amount':100.00}, function(err, transaction){
        console.log(transaction);
        expect(transaction._id).to.be.instanceof(Mongo.ObjectID);
        expect(transaction).to.be.instanceof(Transaction);
        expect(transaction.accountId).to.be.instanceof(Mongo.ObjectID);
        expect(transaction.type).to.equal('deposit');
        expect(transaction.amount).to.equal(100.00);
        done();
      });
    });
  });
  describe('.findByAccountId', function(){
    it('should find all transactions from Snowball\'s account', function(done){
      Transaction.findByAccountId('00000000000000000000001', function(err, transactions){
        expect(transactions.length).to.equal(2);
        expect(transactions[1].type).to.equal('withdraw');
        expect(transactions[1].amount).to.equal(50);
        done();
      });
    });
  });
});
