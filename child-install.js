var fs = require('fs');
var resolve = require('path').resolve;
var join = require('path').join;
var cp = require('child_process');

// get library path
var lib = resolve(__dirname);

fs.readdirSync(lib).forEach(function(mod) {
  var modPath = join(lib, mod);
  // ensure path has package.json
  if (!fs.existsSync(join(modPath, 'package.json'))) return;

  // Determine OS and set command accordingly
  const cmd = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';

  // install folder
  cp.spawn(cmd, ['ci'], { env: process.env, cwd: modPath, stdio: 'inherit' });
});
