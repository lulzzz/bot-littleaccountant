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
    accountingDataHandler.init(session.message.address.user.name)
        .then(document => {
            let filterTopics = [];

            // Theoretically there can be an unlimited amount of topics identified by LUIS
            // that can be used as filters.
            var entityTopics = builder.EntityRecognizer.findAllEntities(args.entities, 'topics');
            let spendingTopicMessage = '';
            if (entityTopics) {
                spendingTopicMessage += ' on ';
                for (i = 0; i < entityTopics.length; i++) {
                    filterTopics.push(entityTopics[i].entity);
                    spendingTopicMessage += entityTopics[i].entity + ', ';
                }

                // Remove trailing comma.
                spendingTopicMessage = spendingTopicMessage.substr(0, (spendingTopicMessage.length - 2));
            }

//            startedOn >= 2015-03-24 AND startedOn < 2015-03-25

            accountingDataHandler.getSpendings(filterTopics, '2017-01-18T16:00:01.197Z')
                .then(spendings => {
                    let totalSpendings = 0.0;
                    // Iterate through all spending entries and aggregate accordingly.
                    for (i = 0; i < spendings.length; i++) {
                        totalSpendings += parseFloat(spendings[i].amount);
                    }

                    totalSpendings = totalSpendings.toFixed(2);
                    session.send('You spent ' + totalSpendings + ' so far' + spendingTopicMessage + '.');
                })
                .catch(err => {
                    // Something went wrong with the initialisation. Inform the user the summary can not be shown.
                    session.send('Unfortunately I could not show your summary because of an accounting issue. Could you please try again? If this happens frequently, please contact the administrator. Thank you.');
                })

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