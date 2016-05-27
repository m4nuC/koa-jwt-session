# JWT (JSON Web Token) Session Middleware for Koa

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/koa-jwt-session.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-jwt-session
[travis-image]: https://img.shields.io/travis/m4nuC/koa-jwt-session.svg?style=flat-square
[travis-url]: https://travis-ci.org/m4nuC/koa-jwt-session
[codecov-image]: https://codecov.io/github/m4nuC/koa-jwt-session/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/m4nuC/koa-jwt-session?branch=master
[download-image]: https://img.shields.io/npm/dm/koa-jwt-session.svg?style=flat-square
[download-url]: https://npmjs.org/package/koa-jwt-session


Barebone [JWT](https://www.npmjs.com/package/jsonwebtoken) based session for Koa 2.
Tests and configurable options comming soon.

The API is exposed on the context object (`this`) inside downstream middlewares.

## Getting started

```js
import JWTSession from 'koa-jwt-session';
import Koa from 'koa';
const app = new Koa();
app.use(jwtAuth(app, {
  secret: "Shhhha",
  signed: false, // Default to false
  httpOnly: false, // Default to false
  domain: process.env.SESSIONS_SCOPE // Cookie scope. Must be set
}));

// Generate a Session from a controller (route handler)
async function(ctx, next) {
  const formFields = await parse(ctx)
  // store session
  const data = ctx.JWTSession.generate({_id: formFields._id, nickname: formFields.nickname});
}

// Validating a session from a controller (route handler)
async function(ctx, next) {
  const authed = ctx.JWTSession.authed();
  if ( authed ) {
    // Do something that requires auth
  } else {
    // Handle error
  }
```

## API
- generate(payload)
- get()
- set()
- clear()
- authed()