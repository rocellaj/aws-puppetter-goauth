const {google} = require('googleapis');
const base64 = require('js-base64').Base64;
const log = console.log;

/**
 * Retrieve all messages by user Id
 * and query in inbox and unread
 *
 * @param auth
 * @returns {Promise<void>}
 */

async function getMessageId(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  const messageId = (await gmail.users.messages.list({
    userId: 'me',
    q: 'in:inbox is:unread',
  })).data.messages[0].id;

  log(`Successfully retrieved recent mail ${messageId}`);
  return messageId;
}

/**
 * Retrieve html email and decode
 *
 * @param auth
 * @returns {Promise<string>}
 */

async function getEmail(auth) {
  const id = await getMessageId(auth);
  const gmail = google.gmail({version: 'v1', auth});
  const email = (await gmail.users.messages.get({
    userId: 'me',
    id,
  })).data.payload.parts[1].body.data;
  log('Successfully retrieved email');
  return decodeEmail(email);
}

/**
 * Remove mail from inbox to another label
 *
 * @param auth
 * @returns {Promise<void>}
 */

async function updateEmailLabel(auth) {
  const id = await getMessageId(auth);
  const gmail = google.gmail({version: 'v1', auth});
  await gmail.users.messages.modify({
    userId: 'me',
    id,
    resource: {
      addLabelIds: ['Label_787158154522137975'],
      removeLabelIds: ['INBOX'],
    },
  });
  log(`Successfully moved ${id} from inbox to unsubscribe label`);
}

/**
 * Decode email
 *
 * @param email
 * @returns {*|Promise<void>|string}
 */
function decodeEmail(email) {
  return base64.decode(email);
}


module.exports = {
  getMessageId,
  getEmail,
  updateEmailLabel
};
