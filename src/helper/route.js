const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const promisify = require('util').promisify;
const mimeType = require('../helper/mime');
const config = require('../config/defaultConfig');
const compress = require('../helper/compress');
const range = require('../helper/range');

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const tplPath = path.join(__dirname, '../temple/dir.tpl');
const source = fs.readFileSync(tplPath, 'utf8');
const compile = handlebars.compile(source);

module.exports = async (req, res, filePath) => {
  try {
    const stats = await stat(filePath);
    if (stats.isFile()) {
      let rs;
      const { code, start, end } = range(stats.size, req, res);
      res.statusCode = code;
      res.setHeader('Context-Type', 'text/plain');
      if (code === 200) {
        rs = fs.createReadStream(filePath);
      } else {
        rs = fs.createReadStream(filePath, { start, end });
      }

      if (filePath.match(config.compress)) {
        rs = compress(rs, req, res);
      }

      rs.pipe(res);
    } else if (stats.isDirectory()) {
      const files = await readdir(filePath);
      const dir = path.relative(config.root, filePath);
      const data = {
        title: path.basename(filePath),
        dir: dir ? `/${dir}` : '',
        files
      };

      res.statusCode = 200;
      res.setHeader('Context-Type', `${mimeType(filePath)}`);
      res.end(compile(data));
    }
  } catch(ex) {
    res.statusCode = 404;
    res.setHeader('Context-Type', 'text/plain');
    res.end(`${filePath} is not a directory or file`);
    return;
  }
};
