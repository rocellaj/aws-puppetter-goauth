const authorize = require('./src/googleTokens');
const {getEmail} = require('./src/gmailApis');

module.exports.hello = async (event) => {
  const emailBody = await authorize(getEmail);
  console.log(emailBody);
};
