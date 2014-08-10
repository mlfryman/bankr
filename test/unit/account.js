/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect = require('chai').expect;
var Account = require('../../app/models/account');
//var Transfer = require('../../app/models/transfer');
var Mongo = require('mongodb');
var dbConnect = require('../../app/lib/mongodb');
var db = 'bankr-test';
var cp = require('child_process');

var snowballId = '100000000000000000000001';
//var gingerId = '100000000000000000000002';
//var fluffyId = '100000000000000000000003';

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
      var a = new Account({name:'Snowball', color:'blue', photo:'url', pin:'1234', type:'checking', deposit:'950'});
      expect(a).to.be.instanceof(Account);
      expect(a.name).to.equal('Snowball');
      expect(a.dateCreated).to.respondTo('getDay');
      expect(a.color).to.equal('blue');
      expect(a.photo).to.equal('url');
      expect(a.pin).to.equal('1234');
      expect(a.type).to.equal('checking');
      expect(a.balance).to.be.closeTo(950, 0.1);
      expect(a.numTransacts).to.equal(0);
      expect(a.transactions).to.have.length(0);
      expect(a.transferIds).to.have.length(0);
    });
  });

  describe('.create', function(){
    it('should create a new account in database', function(done){
      Account.create({name:'Snowball', color:'blue', photo:'url', pin:'1234', type:'checking', deposit:'950'}, function(err, a){
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
      Account.findById(snowballId, function(a){
        expect(a.name).to.equal('Snowball');
        expect(a.transfers).to.have.length(4);
        done();
      });
    });
  });

  describe('.findByIdLite', function(){
    it('should return name, type, & _id for one account from database', function(done){
      Account.findByIdLite(snowballId, function(a){
        expect(a.name).to.equal('Snowball');
        expect(a.type).to.equal('checking');
        expect(Object.keys(a)).to.have.length(3);
        done();
      });
    });
  });
  // Last Bracket
});

