const {google} = require('googleapis');
const {googleCredentials} = require('../credentials');
const getChrome = require('../chrome');
const puppeteer = require('puppeteer');
const log = console.log;

/**
 * Create an OAuth2 client with the given credentials
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(callback) {
  log('Starting google authorization...');
  const {client_secret, client_id, redirect_uris} = googleCredentials;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const authUrl = generateAuthnUrl(oAuth2Client);
  log('Successfully generated authentication url');
  const code = await getCode(authUrl);
  log('Successfully generated authentication code');
  const token = await getAccessToken(oAuth2Client, code);
  log('Successfully generated authentication token');

  oAuth2Client.setCredentials(token);
  return callback(oAuth2Client);
}

/**
 * Generate authentication url
 *
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
function generateAuthnUrl(oAuth2Client) {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: googleCredentials.scopes,
  });
}

/**
 * Execute consent flow to retrieve authorization code
 *
 * @param url
 * @returns {Promise<string>} - authorization code
 */
async function getCode(url) {
  const waitTime = 2000;
  const chrome = await getChrome();
  const browser = await puppeteer.connect({
    browserWSEndpoint: chrome.endpoint,
  });

  const page = await browser.newPage();
  await page.setUserAgent('\'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36');
  await page.setCacheEnabled(false);

  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.goto(url);
  await page.waitFor('#identifierId');
  await page.type('#identifierId', googleCredentials.username);
  await page.evaluate(() =>
    document.querySelector('#view_container > div > div > div.pwWryf.bxPAYd > div > div.WEQkZc > div > form > span > section > div > div > div:nth-child(3) > button').innerHTML);
  await page.click('#identifierNext > span > span');
  await page.waitFor(4000);
  await page.waitForSelector('#forgotPassword > span > span');
  await page.evaluate(() =>
    document.querySelector('#forgotPassword > span > span').innerHTML);
  await page.type('#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input', googleCredentials.password);
  await page.click('#passwordNext > span > span');
  await page.waitFor(waitTime);
  await page.click('#yDmH0d > div.JhUD8d.HWKDRd > div.gvYJzb > a');
  await page.waitFor(waitTime);
  await page.click('#yDmH0d > div.JhUD8d.HWKDRd > div:nth-child(6) > p:nth-child(2) > a');
  await page.waitFor(waitTime);
  await page.click('#oauthScopeDialog > div.XfpsVe.J9fJmf > div.U26fgb.O0WRkf.oG5Srb.C0oVfc.kHssdc.M9Bg4d > span > span');
  await page.waitFor(waitTime);
  await page.click('#oauthScopeDialog > div.XfpsVe.J9fJmf > div.U26fgb.O0WRkf.oG5Srb.C0oVfc.kHssdc.M9Bg4d > span > span');
  await page.waitFor(waitTime);
  await page.click('#submit_approve_access > span > span');
  await page.waitFor(waitTime);
  const code = await page.evaluate(() =>
    document.querySelector('#view_container > div > div > div.pwWryf.bxPAYd > div > div > div > form > span > section > div > div > div > div > div > textarea').innerHTML);

  browser.close();
  return code;
}

/**
 * Get access token by exchanging authorization code
 *
 * @param oAuth2Client
 * @param code
 * @returns {Promise<string>} - access token
 */

async function getAccessToken(oAuth2Client, code) {
  return (await oAuth2Client.getToken(code)).tokens;
}

module.exports = authorize;
