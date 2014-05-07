'use strict';

var HelloFileSystem = require( '../../../src/node/HelloFileSystem' );

describe( "HelloWorld HelloFileSystem", function () {
  it( "hello() should say hello from file when called", function () {
    expect( HelloFileSystem.hello() ).toEqual( "hello" );
  } );
} );
