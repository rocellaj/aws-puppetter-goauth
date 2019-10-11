const launchChrome = require('@serverless-chrome/lambda');
const request = require('request-promise');
const log = console.log;


const getChrome = async () => {
  let chrome = await launchChrome();

  const options = {
    method: 'GET',
    url: `${chrome.url}/json/version`,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await request.get(options).then(res => JSON.parse(res));
  const endpoint = response.webSocketDebuggerUrl;

  log('Successfully retrieved socked endpoint url');
  return  {
    endpoint,
    instance: chrome,
  };
};

module.exports = getChrome;
