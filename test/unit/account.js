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
      var o1 = {name:'Billy Jones', photo: 'photo.jpg', type: 'checking', color: 'pink', balance: '500', date:'3/11/2004'};
      var a1 = new Account(o1);
      expect(a1).to.be.instanceof(Account);
      expect(a1.name).to.equal('Billy Jones');
      expect(a1.photo).to.equal('photo.jpg');
      expect(a1.type).to.equal('checking');
      expect(a1.color).to.equal('pink');
      expect(a1.balance).to.equal('500');
      expect(a1.date).to.be.instanceof(Date);
    });
  });

  // Last Bracket
});

