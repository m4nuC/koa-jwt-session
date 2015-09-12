# JWT (JSON Web Token) Session Middleware for Koa

Very barebone session management middleware that stores [JWT](https://www.npmjs.com/package/jsonwebtoken) in cookies.

The API is exposed on the context object (`this`) inside downstream middlewares.

## API
- generate(payload)
- get()
- set()
- clear()
- authed()