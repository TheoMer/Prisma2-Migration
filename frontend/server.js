const variables_path = 'variables.env';
require('dotenv').config({ path: variables_path });

const cacheableResponse = require('cacheable-response')
const express = require('express');
const server = express();
const next = require('next');
const helmet = require('helmet');
const csp = require('./csp');

const PORT = parseInt(process.env.PORT, 10) || 7777;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });

const handle = app.getRequestHandler();

const path = require('path');
const absolutePublicPath = path.resolve('public'); // will return your absolute path for `public` directory
const absoluteStaticPath = path.resolve('public/static');
const absoluteNextStaticPath = path.resolve('_next/static');
const absoluteDotNextStaticPath = path.resolve('.next/static');

server.use(express.static(absolutePublicPath));
server.use(express.static(absoluteStaticPath));
server.use(express.static(absoluteNextStaticPath));
server.use(express.static(absoluteDotNextStaticPath));

// Set Cache-Control Header to prevent styled-components v4.2.1 from continually
// reloading fonts on every route request.
server.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, must-revalidate, max-age: 86400, s-maxage=86400, stale-while-revalidate=86400');
  next()
});

csp(server);

// Header security. See: https://observatory.mozilla.org/
server.use(helmet());

// Sets "Referrer-Policy: same-origin".
server.use(helmet.referrerPolicy({ policy: 'same-origin' }));

//Set noSniff
//server.use(helmet.noSniff());

// Sets Feature-policy
server.use(helmet.featurePolicy({
    features: {
      fullscreen: ["'self'"],
      vibrate: ["'none'"],
      payment: ['https://*.stripe.com'],
      syncXhr: ["'self'"],
      geolocation: ["'self'"]
    }
}));

const ssrCache = cacheableResponse({
  ttl: 1000 * 60 * 60, // 1hour
  get: async ({ req, res }) => {
    const data = await app.render(req, res, req.path, {
      ...req.query,
      ...req.params,
    })

    // Add here custom logic for when you do not want to cache the page, for
    // example when the page returns a 404 status code:
    if (res.statusCode === 404) {
      res.end(data)
      return
    }

    return { data }
  },
  send: ({ data, res }) => res.send(data),
})

app.prepare().then(() => {
  // Taken from: https://stackoverflow.com/questions/7185074/heroku-nodejs-http-to-https-ssl-forced-redirect
  server.get('*', function(req,res,next) {
    if(req.headers['x-forwarded-proto'] != 'https' && process.env.NODE_ENV === 'production')
    res.redirect('https://'+req.hostname+req.url)
    else
    next() /* Continue to other routes if we're not redirecting */
  });

  /* The following code is required when using strict CSP because some of the bundling script */
  /* files have been defined without a content-type */

  if (process.env.NODE_ENV === 'production') {

    server.get('/_next/static/:uid/pages/:name', (req, res, next) => {
      var fileName = req.params.name;
      var absoluteUrl = '/.next/static/' + req.params.uid + '/pages/';

      var options = {
        root: path.join(__dirname, absoluteUrl),
        //dotfiles: 'deny',
        headers: {
          'content-type': 'application/javascript',
          'x-sent': true
        }
      }

      if (!req.get('Content-Type')) {
        res.sendFile(fileName, options, (err) => {
          if (err) {
            next(err)
          }
        })
      }
    });

    server.get('/_next/static/runtime/:name', (req, res, next) => {
      var options = {
        root: path.join(__dirname, '/.next/static/runtime/'),
        //dotfiles: 'deny',
        headers: {
          'content-type': 'application/javascript',
          'x-sent': true
        }
      }

      var fileName = req.params.name

      if (!req.get('Content-Type')) {
        res.sendFile(fileName, options, (err) => {
          if (err) {
            next(err)
          }
        })
      }
    });

    server.get('/_next/static/chunks/:name', (req, res, next) => {
      var options = {
        root: path.join(__dirname, '/.next/static/chunks/'),
        //dotfiles: 'deny',
        headers: {
          'content-type': 'application/javascript',
          'x-sent': true
        }
      }

      var fileName = req.params.name

      if (!req.get('Content-Type')) {
        res.sendFile(fileName, options, (err) => {
          if (err) {
            next(err)
          }
        })
      }
    });

  }

  // ssr cachiing taken from: https://github.com/zeit/next.js/tree/master/examples/ssr-caching
  server.get('/', (req, res) => ssrCache({ req, res }))

  server.get('/item?id=:id', (req, res) => {
    return ssrCache({ req, res })
  })

  server.get('/order?id=:id', (req, res) => {
    return ssrCache({ req, res })
  })
  
  server.get('*', (req, res) => handle(req, res));

  server.listen(PORT, err => {
    if (err) throw err
    console.log(`🚀 Server ready at ${process.env.NODE_ENV === 'development'? `http://${process.env.LOCAL_DOMAIN}` : `https://${process.env.APP_DOMAIN}`}:${PORT}`)
  });
});
