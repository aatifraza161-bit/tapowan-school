const serverless = require('serverless-http');
const app = require('../../server.js');

module.exports.handler = serverless(app, {
  binary: [
    'image/*',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/octet-stream'
  ]
});
