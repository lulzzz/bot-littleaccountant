/* ---------------------------------------------------- */
// Recognised Undo intent.
// This is trained to listen to all kinds of requests to
// undo the last entry.
/* ---------------------------------------------------- */

// Botbuilder is the official module that provides interfaces and
// functionality around the MS Bot Framework for node.
// See https://github.com/Microsoft/BotBuilder
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");


// Account data handler provides the interface to log spendings.
var AccountingDataHandler = require('../classes/accountingDataHandler');

// Main method that will be exported.
var run = function (session, args, next) {
    // Check if the current session has a user name attached to it.
    // This is needed as only identified users can log spendings.
    if (!session.message.address.user.name) return false;

    // If the user did not confirm there is no need to continue.
    if (!args.response) {
        session.send('Ok, I didn\'t delete or change anything.');
        return true;
    }

    // Create and initialise the accounting data handler.
    // Note that this will use the current user as identifier. The handler will tie all data
    // to the users account.
    accountingDataHandler = new AccountingDataHandler();
    accountingDataHandler.init(session.message.address.user.name)
        .then(document => {
            // Delete the last spending from the database.
            accountingDataHandler.deleteLastSpending()
                .then(spendings => {
                    session.send('Ok, I deleted that entry.');
                })
                .catch(err => {
                    // Something went wrong with the database query. Inform the user the summary can not be shown.
                    session.send('Unfortunately I could not delete your last entry: ' + err + ' Could you please try again? If this happens frequently, please contact the administrator. Thank you.');
                })
        })
        .catch(err => {
            // Something went wrong with the initialisation. Inform the user the entry was not logged.
            session.send('Unfortunately I could not undo anything because of a user session issue. Could you please try again? If this happens frequently, please contact the administrator. Thank you.');
        })

    // Done.
    // Note that this returns true prematurely as the actual work is done asynchronously.
    // The response is sent when the respective tasks have been completed.
    return true;
};

module.exports = run;