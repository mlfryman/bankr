'use strict';

exports.typeColor = function(type){
  if(type === 'withdraw'){return 'blue';}
  else{return 'pink';}
};

exports.transColor = function(from){
  if(from !== ''){return 'red';}
  else{return 'green';}
};

exports.tFrom = function(accounts, id){
  var index = accounts.map(function(o){return o._id.toString();}).indexOf(id);
  return accounts[index].name;
};

exports.tOptions = function(accounts, id){
  var index = accounts.map(function(o){return o._id.toString();}).indexOf(id);
  accounts.splice(index, 1);
  var options = accounts.map(function(a){return '<option value="' + a._id.toString() + '">' + a.name + '</option>';});
  //console.log(options.join(''));
  return options.join('');
};

exports.currencyFormat = function (currency) {
  return '$' + currency.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};
