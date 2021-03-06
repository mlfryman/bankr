/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect = require('chai').expect;
var Account = require('../../app/models/account');
var Mongo = require('mongodb');
var dbConnect = require('../../app/lib/mongodb');
var db = 'bankr-test';
var cp = require('child_process');

var snowball = '100000000000000000000001';
var ginger = '100000000000000000000002';

describe('Account', function(){
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

  describe('Constructor', function(){
    it('Should create a new account with correct properties', function(){
      var a = new Account({name:'Snowball', color:'blue', photo:'url', pin:'1234', type:'checking', deposit:'500.00'});
      expect(a).to.be.instanceof(Account);
      expect(a.name).to.equal('Snowball');
      expect(a.dateCreated).to.respondTo('getDay');
      expect(a.color).to.equal('blue');
      expect(a.photo).to.equal('url');
      expect(a.pin).to.equal('1234');
      expect(a.type).to.equal('checking');
      expect(a.balance).to.be.closeTo(500.00, 0.1);
      expect(a.numTract).to.equal(0);
      expect(a.transactions).to.have.length(0);
      expect(a.xferIds).to.have.length(0);
    });
  });

  describe('.create', function(){
    it('should create a new account in database', function(done){
      Account.create({name:'Snowball', color:'blue', photo:'url', pin:'1234', type:'checking', deposit:'500.00'}, function(err, a){
        expect(a._id).to.be.instanceof(Mongo.ObjectID);
        done();
      });
    });
  });

  describe('.findAll', function(){
    it('should return all accounts in database', function(done){
      Account.findAll(function(err, accounts){
        expect(accounts).to.have.length(3);
        done();
      });
    });
  });

  describe('.findById', function(){
    it('should return one account from database', function(done){
      Account.findById(snowball, function(a){
        expect(a.name).to.equal('Snowball');
        expect(a.transfers).to.have.length(4);
        done();
      });
    });
  });

  describe('.findByIdLite', function(){
    it('should return name, type, & _id for one account from database', function(done){
      Account.findByIdLite(snowball, function(a){
        expect(Object.keys(a)).to.have.length(3);
        expect(a.name).to.equal('Snowball');
        expect(a.type).to.equal('checking');
        done();
      });
    });
  });

  describe('.deposit', function(){
    it('should increase account balance', function(done){
      Account.deposit({id:snowball, type:'deposit', pin:'1234', amount:'500.00'}, function(){
        Account.findById(snowball, function(a){
          expect(a.balance).to.be.closeTo(1000.00, 0.1);
          expect(a.numTract).to.equal(3);
          expect(a.transactions).to.have.length(3);
          expect(a.transactions[2].id).to.equal(3);
          expect(a.transactions[2].date).to.respondTo('getDay');
          done();
        });
      });
    });
    it('should not increase account balance - invalid PIN', function(done){
      Account.deposit({id:snowball, type:'deposit', pin:'1236', amount:'500.00'}, function(){
        Account.findById(snowball, function(a){
          expect(a.balance).to.be.closeTo(500.00, 0.1);
          expect(a.numTract).to.equal(2);
          expect(a.transactions).to.have.length(2);
          done();
        });
      });
    });
  });

  describe('withdraw', function(){
    it('should reduce balance by amount', function(done){
      Account.withdraw({id:snowball, type:'withdraw', pin:'1234', amount:'250.00'}, function(){
        Account.findById(snowball, function(a){
          expect(a.balance).to.be.closeTo(250.00, 0.1);
          expect(a.numTract).to.equal(3);
          expect(a.transactions).to.have.length(3);
          expect(a.transactions[2].id).to.equal(3);
          expect(a.transactions[2].date).to.respondTo('getDay');
          expect(a.transactions[2].fee).to.equal('');
          done();
        });
      });
    });
    it('should not reduce balance by amount - invalid PIN', function(done){
      Account.withdraw({id:snowball, type:'withdraw', pin:'1235', amount:'250.00'}, function(){
        Account.findById(snowball, function(a){
          expect(a.balance).to.be.closeTo(500.00, 0.1);
          expect(a.numTract).to.equal(2);
          expect(a.transactions).to.have.length(2);
          done();
        });
      });
    });
    it('should reduce balance by amount & charge 50 overdraft', function(done){
      Account.withdraw({id:snowball, type:'withdraw', pin:'1234', amount:'550.00'}, function(){
        Account.findById(snowball, function(a){
          expect(a.balance).to.be.closeTo(-100.00, 0.1);
          expect(a.numTract).to.equal(3);
          expect(a.transactions).to.have.length(3);
          expect(a.transactions[2].id).to.equal(3);
          expect(a.transactions[2].date).to.respondTo('getDay');
          expect(a.transactions[2].fee).to.equal(50);
          done();
        });
      });
    });
  });

  describe('.transaction', function(){
    it('should perform a deposit', function(done){
      Account.transaction({id:snowball, type:'deposit', pin:'1234', amount:'500.00'}, function(){
        Account.findById(snowball, function(a){
          expect(a.balance).to.be.closeTo(1000.00, 0.1);
          expect(a.numTract).to.equal(3);
          expect(a.transactions).to.have.length(3);
          expect(a.transactions[2].id).to.equal(3);
          expect(a.transactions[2].date).to.respondTo('getDay');
          done();
        });
      });
    });
    it('should perform a withdrawal', function(done){
      Account.transaction({id:snowball, type:'withdraw', pin:'1234', amount:'250'}, function(){
        Account.findById(snowball, function(a){
          expect(a.balance).to.be.closeTo(250, 0.1);
          expect(a.numTract).to.equal(3);
          expect(a.transactions).to.have.length(3);
          expect(a.transactions[2].id).to.equal(3);
          expect(a.transactions[2].date).to.respondTo('getDay');
          expect(a.transactions[2].fee).to.equal('');
          done();
        });
      });
    });
  });

  describe('.transfer', function(){
    it('should transfer funds from one account to another', function(done){
      Account.transfer({from:'Snowball', to:'Ginger', pin:'1234', fromId:snowball, toId:ginger, amount:'250'}, function(){
        Account.findById(snowball, function(a){
          expect(a.balance).to.be.closeTo(225, 0.1);
          expect(a.xferIds).to.have.length(5);
          Account.findById(ginger, function(a2){
            expect(a2.balance).to.be.closeTo(350, 0.1);
            expect(a2.xferIds).to.have.length(5);
            done();
          });
        });
      });
    });
    it('should not transfer funds from one account to another - invalid PIN)', function(done){
      Account.transfer({from:'Snowball', to:'Ginger', pin:'1264', fromId:snowball, toId:ginger, amount:'250.00'}, function(){
        Account.findById(snowball, function(a){
          expect(a.balance).to.be.closeTo(500, 0.1);
          expect(a.xferIds).to.have.length(4);
          Account.findById(ginger, function(a2){
            expect(a2.balance).to.be.closeTo(100, 0.1);
            expect(a2.xferIds).to.have.length(4);
            done();
          });
        });
      });
    });
    it('should not transfer funds from one account to another - insufficient funds', function(done){
      Account.transfer({from:'Snowball', to:'Ginger', pin:'1234', fromId:snowball, toId:ginger, amount:'1000.00'}, function(){
        Account.findById(snowball, function(a){
          expect(a.balance).to.be.closeTo(500, 0.1);
          expect(a.xferIds).to.have.length(4);
          Account.findById(ginger, function(a2){
            expect(a2.balance).to.be.closeTo(100, 0.1);
            expect(a2.xferIds).to.have.length(4);
            done();
          });
        });
      });
    });
  });

  // Last Bracket
});
