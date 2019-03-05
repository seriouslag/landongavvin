const replace = require('replace-in-file');
const d = new Date().setSeconds(new Date().getSeconds() - (new Date().getTimezoneOffset() * 60));
const date = new Date(d).toISOString()
  .replace(/T/, ' ')      // replace T with a space
  .replace(/\..+/, '')     // delete the dot and everything after
  .replace(/-/g,'/');
console.log(date);
const buildDate = `'{${date}}'`;

const fileLocations = [
  'src/environments/buildTIme.ts',
];

function updateFileWithDate(fileLocation) {
  const options = {
    files: fileLocation,
    from: /'{.*}'/,
    to: buildDate,
    allowEmptyPaths: false,
  };

  try {
    let changedFiles = replace.sync(options);
    console.log('Build date set to: ' + buildDate);
  }
  catch (error) {
    console.error('Error occurred:', error);
  }
}

fileLocations.forEach((fileLocation) => {
  updateFileWithDate(fileLocation)
});
