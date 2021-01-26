
const withCSS = require('@zeit/next-css');
const withSass = require('@zeit/next-sass');
//const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const uuidv4 = require('uuid/v4');
const Buffer = require('buffer/').Buffer;

// Next exposes some options that give you some control over how the server 
// will dispose or keep in memories pages built
// Taken from: https://github.com/zeit/next.js#configuring-the-ondemandentries
module.exports = withCSS({
    reactStrictMode: true,
    onDemandEntries: {
        // period (in ms) where the server will keep pages in the buffer
        maxInactiveAge: 25 * 1000,
        // number of pages that should be kept simultaneously without being disposed
        pagesBufferLength: 6
    },
    // Taken from: https://github.com/akiran/react-slick/issues/842#issuecomment-385378629
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {

        /*config.plugins.push(new webpack.DefinePlugin({
          __webpack_nonce__: nonce,
        }));*/
        
        config.module.rules.push({
          test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 100000,
              fallback: "file-loader",
              name: '[name].[ext]',
            }
          }
        });

        return config;
    },
    images: {
      deviceSizes: [320, 420, 768, 1024, 1200],
      iconSizes: [],
      loader: "cloudinary",
      path: "https://res.cloudinary.com/theomer/image/upload",
    },
});
