/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect = require('chai').expect;
var Account = require('../../app/models/account');
//var Transaction = require('../../app/models/transaction');
//var Transfer = require('../../app/models/transfer');
var Mongo = require('mongodb');
var dbConnect = require('../../app/lib/mongodb');
var db = 'account-test';
var cp = require('child_process');

describe('Account', function(){
  before(function(done){
    dbConnect(db, function(){
      done();
    });
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/freshdb.sh', [db], {cwd:__dirname + '/../scripts'}, function(){
      done();
    });
  });
  describe('constructor', function(){
    it('should create a new Account object', function(){
      var o = ;
      var a = new Account(o);
      expect(a._id).to.be.instanceof(Mongo.ObjectID);
      expect(a).to.be.instanceof(Account);
      expect(a.name).to.equal('Snowball');
      expect(a.photo).to.equal('photo.jpg');
      expect(a.type).to.equal('Checking');
      expect(a.color).to.equal('blue');
      expect(a.date).to.be.instanceof(Date);
      expect(a.initDeposit).to.equal('500.00');
      expect(a.balance).to.equal('500.00');
    });
  });

  // Last Bracket
});

