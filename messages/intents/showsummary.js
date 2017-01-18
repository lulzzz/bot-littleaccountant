/* ---------------------------------------------------- */
// Recognised ShowSummary intent.
// This is trained to listen to requests for a summary or
// a subtotal for a given timeframe.
// Examples are "What did I spent this month?", "What's my
// total for the week?", "How much did I spent?"
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

    // Create and initialise the accounting data handler.
    // Note that this will use the current user as identifier. The handler will tie all data
    // to the users account.
    accountingDataHandler = new AccountingDataHandler();
    console.log(session.message.address.user.name);
    accountingDataHandler.init(session.message.address.user.name)
        .then(document => {

/*
            // Theoretically there can be an unlimited amount of topics identified by LUIS
            // that can be used as filters.
            var entityTopics = builder.EntityRecognizer.findAllEntities(args.entities, 'topics');
            if (entityTopics) {
                for (i = 0; i < entityTopics.length; i++) {
                    spendingObject.topics.push(entityTopics[i].entity);
                    logSpendingAnswer += entityTopics[i].entity + ', ';
                }

                // Remove trailing comma.
                logSpendingAnswer = logSpendingAnswer.substr(0, (logSpendingAnswer.length - 2)) + ' as topic';
            }
*/

            console.log(args.entities);

            let totalSpendings = 0.0;

            console.log(JSON.stringify(accountingDataHandler.userData));

            // At this stage all user data should be available in accountingDataHandler.userData.
            // All spendings should be available in accountingDataHandler.userData.spendings[].
            // Iterate through all spending entries and aggregate accordingly.
            for (i = 0; i < accountingDataHandler.userData.spendings.length; i++) {
                console.log(i);
                totalSpendings += parseFloat(accountingDataHandler.userData.spendings[i].amount);
            }

            session.send('You spent ' + totalSpendings + ' so far.');

        })
        .catch(err => {
            // Something went wrong with the initialisation. Inform the user the summary can not be shown.
            session.send('Unfortunately I could not show your summary because of a user session issue. Could you please try again? If this happens frequently, please contact the administrator. Thank you.');
        })

    // Done.
    // Note that this returns true prematurely as the actual work is done asynchronously.
    // The response is sent when the respective tasks have been completed.
    return true;
};

module.exports = run;