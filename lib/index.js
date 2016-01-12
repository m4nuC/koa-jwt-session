'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var jwt = require("jsonwebtoken");
var debug = require('debug')('jwt-session');

var SECRET = "Shhhhh";

var options = {
  expiresIn: 10000
};

var SESSION_KEY = ['im a newer secret', 'i like turtle'];

var cookiesOptions = {
  signed: false,
  httpOnly: false,
  domain: process.env.DOMAIN
};

module.exports = function (app) {

  if (!app || typeof app.use !== 'function') {
    throw new TypeError('app instance required');
  }

  app.context.sessionKey = SESSION_KEY;

  function JWTSession(ctx) {
    this._sessData = {};
    this._ctx = ctx;
  }

  JWTSession.prototype.get = function () {
    //console.log(this)
    return this._sessData;
  };

  JWTSession.prototype.set = function (data) {
    this._sessData = data;
  };

  JWTSession.prototype.generate = function (payload) {
    try {
      var token = jwt.sign(payload, SECRET, options);
      this._ctx.cookies.set('jwt', token, cookiesOptions);
      this._ctx.cookies.set('session_data', JSON.stringify(payload), cookiesOptions);
      this._sessData = payload;
      return payload;
    } catch (e) {
      throw new Error('Error while creating the session data: ', e.message);
    }
    return true;
  };

  // For now jsut chekcing if the session object as stuff in it
  // will suffice to check auth
  JWTSession.prototype.authed = function () {
    return this._sessData && Object.keys(this._sessData).length > 0;
  };

  JWTSession.prototype.clear = function () {
    this._ctx.cookies.set('jwt', null, cookiesOptions);
    this._ctx.cookies.set('session_data', null, cookiesOptions);
    this._sessData = {};
  };

  Object.defineProperty(app.context, 'JWTSession', {
    get: function get() {
      var sess = this._sess;
      // already retrieved
      if (sess) return sess;
      sess = this._sess = new JWTSession(this);
      return sess;
    }
  });

  return function () {
    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, next) {
      var token;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              token = ctx.cookies.get('jwt');

              if (token) {
                _context.next = 6;
                break;
              }

              ctx.JWTSession.clear();
              _context.next = 5;
              return next();

            case 5:
              return _context.abrupt('return', _context.sent);

            case 6:
              try {
                ctx.JWTSession.set(jwt.verify(token, SECRET));
              } catch (e) {
                if (e.name === 'TokenExpiredError') {
                  ctx.JWTSession.clear();
                }
              }
              _context.next = 9;
              return next();

            case 9:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x, _x2) {
      return ref.apply(this, arguments);
    };
  }();
};