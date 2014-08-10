/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect = require('chai').expect;
var Account = require('../../app/models/account');
//var Transaction = require('../../app/models/transaction');
//var Transfer = require('../../app/models/transfer');
var Mongo = require('mongodb');
var dbConnect = require('../../app/lib/mongodb');
var db = 'bankr-test';
var cp = require('child_process');

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

  describe('constructor', function(){
    it('should create a new Account object', function(){
      var a = new Account({_id: '00000000000000000000001',name:'Snowball',photo:'http://images.forwallpaper.com/files/thumbs/preview/57/571198__white-kitten_p.jpg',type:'Checking',color:'blue',dateCreated:'2011-08-05T00:00:00.000-0500',pin:'1234',initDeposit:'500.00',balance:'500.00'});
      expect(a).to.be.okay;
      expect(a).to.be.instanceof(Account);
      expect(a.name).to.equal('Snowball');
      expect(a.photo).to.equal('http://images.forwallpaper.com/files/thumbs/preview/57/571198__white-kitten_p.jpg');
      expect(a.type).to.equal('Checking');
      expect(a.color).to.equal('blue');
      expect(a.pin).to.equal(1234);
      expect(a.dateCreated).to.be.instanceof(Date);
      expect(a.initDeposit).to.equal(500.00);
      expect(a.balance).to.equal(500.00);
    });
  });
  describe('.create', function(){
    it('should create a new account in database', function(done){
      Account.create({'_id':'00000000000000000000001','name':'Snowball','photo':'http://images.forwallpaper.com/files/thumbs/preview/57/571198__white-kitten_p.jpg',type:'Checking',color:'blue',dateCreated:'2011-08-05T00:00:00.000-0500',pin:'1234',initDeposit:'500.00',balance:'500.00'}, function(err, a){
        expect(a._id).to.be.instanceof(Mongo.ObjectID);
        done();
        });
    });
  });

  describe('.findAll', function(){
    it('should return all accounts in database', function(done){
      Account.findAll(function(err, accounts){
        expect(accounts).to.have.length(6);
        done();
      });
    });
  });
  // Last Bracket
});

