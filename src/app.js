const http = require('http');
const chalk = require('chalk');
const path = require('path');
const route = require('./helper/route');
const conf = require('./config/defaultConfig');

const server = http.createServer((req, res) => {
  const filePath = path.join(conf.root, req.url);
  route(req, res, filePath);
});

server.listen(conf.port, conf.hostname, () => {
  const addr = `http://${conf.hostname}:${conf.port}`;
  console.log(`Server started at ${chalk.green(addr)}`);
});
