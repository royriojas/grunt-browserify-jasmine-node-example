/* global jasmine:false */
//var Utils = require("./Utils");
//var _ = Utils.requireOrGlobal("underscore", "_");
var _ = require( "underscore" );
console.log( jasmine.version );
exports.hello = function hello() {
  return "hello";
};

exports.helloUnderscore = function helloUnderscore() {
  return _.escape( 'hello & hi' );
};
