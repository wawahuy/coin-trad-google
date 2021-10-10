const archiver = require('archiver');
const rimraf = require('rimraf');
const path = require('path');
const fs = require('fs');

const resourceBuild = path.join(__dirname, 'resource/build');
if (fs.existsSync(resourceBuild)) {
  rimraf.sync(resourceBuild);
}

fs.mkdirSync(resourceBuild);

// zip
const output = fs.createWriteStream(path.join(resourceBuild, 'tool-coin.zip'));
const archive = archiver('zip');

output.on('close', () => {
  console.log('zip success');
});

archive.on('error', function(e){
  console.log(e);
});

console.log(path.join(__dirname, '../tool-coin'));
archive.pipe(output);
archive.directory(path.join(__dirname, '../tool-coin'), 'tool-coin');
archive.finalize();
