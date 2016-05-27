'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var jwt = require("jsonwebtoken");
var debug = require('debug')('jwt-session');

module.exports = function (app, cookiesOptions) {

  var SECRET = cookiesOptions.secret;

  var options = {
    expiresIn: cookiesOptions.expiresIn
  };

  var SESSIONS_KEYS = cookiesOptions.session_keys;

  if (!app || typeof app.use !== 'function') {
    throw new TypeError('app instance required');
  }

  function JWTSession(ctx) {
    this._sessData = {};
    this._ctx = ctx;
  }

  JWTSession.prototype.get = function () {
    return this._sessData;
  };

  JWTSession.prototype.set = function (data) {
    this._sessData = data;
  };

  JWTSession.prototype.generate = function (payload) {
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
      throw new Error('Error while creating the session data: ', e.message);
    }
    return true;
  };

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
      var token, session;
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
                session = jwt.verify(token, SECRET);

                ctx.JWTSession.set(session);
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