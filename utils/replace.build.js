require('colors');
const replace = require('replace-in-file');

const options = { timeZone: "America/New_York" };
const estTime = new Date();

const buildDate = `'{${estTime.toLocaleString("en-US", options)}}'`;

const fileLocations = [
  'src/environments/buildTime.ts',
];

function updateFileWithDate(fileLocation) {
  const options = {
    files: fileLocation,
    from: /'{.*}'/g,
    to: buildDate,
    allowEmptyPaths: false,
  };

  try {
    let changedFiles = replace.sync(options);

    console.log(`Build date set to: ${buildDate}`.green);
  }
  catch (error) {
    console.error(`Error occurred: ${error}`.red);
  }
}

fileLocations.forEach((fileLocation) => {
  updateFileWithDate(fileLocation)
});
