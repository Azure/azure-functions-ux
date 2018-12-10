const resx2js = require('resx/resx2js');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var Buffer = require('buffer').Buffer;
var through2 = require('through2');
const PLUGIN_NAME = 'gulp-resx';
module.exports = function(opt) {
  opt = opt || {};

  // Convert XML to JSON
  var doConvert = async function(file) {
    var xml = file.contents.toString('utf8');
    return new Promise((resolve, reject) => {
      resx2js(xml, (err, res) => {
        if (!err) {
          resolve(JSON.stringify(res));
        } else {
          reject(err);
        }
      });
    });
  };

  var throughCallback = function(file, enc, cb) {
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return cb();
    }

    if (file.isBuffer()) {
      return doConvert(file).then(json => {
        file.contents = new Buffer(json);
        this.push(file);
        return cb();
      });
    } else {
      this.push(file);
      return cb();
    }
  };

  return through2.obj(throughCallback);
};
