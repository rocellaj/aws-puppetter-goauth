const authorize = require('./src/googleTokens');
const {getEmail} = require('./src/gmailApis');

module.exports.getEmail = async (event) => {
  await authorize(getEmail);
};
