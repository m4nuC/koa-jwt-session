require("babel-core/register");
require("babel-polyfill");
const koa = require('koa');
const expect = require('expect')
const session = require('./src');

describe('Koa JWT Session', function(){
  it('should work', function(){
    expect(true).toBe(true);
  })
})