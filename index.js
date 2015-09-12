var jwt = require("jsonwebtoken");
var debug = require('debug')('jwt-session');

var SECRET = "Shhhhh";
var options = {
	expiresInSeconds:100
};

var SESSION_KEY =  ['im a newer secret', 'i like turtle'];

var cookiesOptions = {
	signed: false,
	httpOnly: false,
	domain: ".bw.dev"
}

module.exports = function(app) {

	if (!app || typeof app.use !== 'function') {
		throw new TypeError('app instance required');
	}

	app.context.sessionKey = SESSION_KEY;

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
			var token = jwt.sign(payload, SECRET, options);
			this._ctx.cookies.set('jwt', token, cookiesOptions);
			this._ctx.cookies.set('session_data', JSON.stringify(payload), cookiesOptions);
			this._sessData = payload;
			return payload;
		} catch (e) {
			throw new Error('Error while creating the session data: ', e.message)
		}
		return true;
	}

	// For now jsut chekcing if the session object as stuff in it
	// will suffice to check auth
	JWTSession.prototype.authed = function() {
		return this._sessData && Object.keys(this._sessData).length > 0;
	}

	JWTSession.prototype.clear = function() {
		this._ctx.cookies.set('jwt', null, cookiesOptions);
		this._ctx.cookies.set('session_data', null, cookiesOptions);
		this._sessData = {};
	}

	Object.defineProperty(app.context, 'JWTSession', {
		//configurable: true,
		// Not exaclty sure what is happening here with this and _ctx..
		// Note: apprently ctx is bound to the middleware when call()ing
		// Note: the context if being built for every upcoming request
		get: function() {
			var sess = this._sess;
			// already retrieved
			if (sess) return sess;
			sess = this._sess = new JWTSession(this);
			return sess;
		}
	});



	return function * (next) {
		var token = this.cookies.get('jwt');
		if ( ! token ) {
			this.JWTSession.clear();
			return yield* next;
		}

		try {
			this.JWTSession.set( jwt.verify(token, SECRET) );
		} catch(e) {
			if (e.name === 'TokenExpiredError') {
				this.JWTSession.clear();
			}
		}
		yield* next;
	}
}