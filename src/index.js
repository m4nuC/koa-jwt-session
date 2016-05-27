'use strict';
var jwt = require("jsonwebtoken");
var debug = require('debug')('jwt-session');

module.exports = function(app, cookiesOptions) {

  var SECRET = cookiesOptions.secret;

  var options = {
    expiresIn: cookiesOptions.expiresIn
  };

  var SESSIONS_KEYS =  cookiesOptions.session_keys;

  if (!app || typeof app.use !== 'function') {
    throw new TypeError('app instance required');
  }

  function JWTSession(ctx) {
    this._sessData= {};
    this._ctx = ctx;
  }

  JWTSession.prototype.get = function() {
    return this._sessData;
  }

  JWTSession.prototype.set = function(data) {
    this._sessData = data;
  }

  JWTSession.prototype.generate = function( payload ) {
    try {
      debug('Enctrypting JWT with secret: ', SECRET);
      var token = jwt.sign(payload, SECRET, {
        expiresIn: options.expiresIn
      });
      this._ctx.cookies.set('jwt', token, cookiesOptions);
      this._ctx.cookies.set('session_data', JSON.stringify(payload), cookiesOptions);
      this._sessData = payload;
      return payload;
    } catch (e) {
      throw new Error('Error while creating the session data: ', e.message)
    }
    return true;
  }

  JWTSession.prototype.authed = function() {
    return this._sessData && Object.keys(this._sessData).length > 0;
  }

  JWTSession.prototype.clear = function() {
    this._ctx.cookies.set('jwt', null, cookiesOptions);
    this._ctx.cookies.set('session_data', null, cookiesOptions);
    this._sessData = {};
  }

  Object.defineProperty(app.context, 'JWTSession', {
    get: function() {
      var sess = this._sess;
      // already retrieved
      if (sess) return sess;
      sess = this._sess = new JWTSession(this);
      return sess;
    }
  });

  return async function (ctx, next) {
    var token = ctx.cookies.get('jwt');
    if ( ! token ) {
      ctx.JWTSession.clear();
      return await next();
    }
    try {
      var session = jwt.verify(token, SECRET);
      ctx.JWTSession.set(session);
    } catch(e) {
      if (e.name === 'TokenExpiredError') {
        ctx.JWTSession.clear();
      }
    }
    await next();
  }
}