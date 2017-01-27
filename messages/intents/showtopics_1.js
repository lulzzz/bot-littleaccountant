/* ---------------------------------------------------- */
// Recognised ShowTopics intent.
// This is trained to listen to requests for a
// of your spending by topic.
// Examples are "What did I buy this month?", "What did
// I spend my money on?""
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
            // Note: It does not make sense to filter by topics as this is exactly
            // what the user wants to know. So filterTopics should always be empty.
            let filterTopics = [];

            // Get identified date time and create a date object from it to use in the query.
            let startDate = '';
            let endDate = '';
            var dateEntitiesArray = builder.EntityRecognizer.findAllEntities(args.entities, 'builtin.datetime.date');
            if ((dateEntitiesArray) && (dateEntitiesArray.length > 0)) {
                // This means that at least one date time information was found.
                // Pick the first one and analyze it.
                let tempDate = dateEntitiesArray[0].resolution.date;

                // We need to mind some edge cases here. For example LUIS treats week information
                // as "2017-W03" or similar, meaning it will not give you always an information that
                // new Date() will recognize.
                if (tempDate.indexOf("-W") > -1) {
                    // We test for this week edge case first.
                    // Extract the information from the date.
                    let tempYear = tempDate.substr(0, tempDate.indexOf("-W"));
                    let tempWeeks = tempDate.substr(tempDate.indexOf("-W") + 2);
                    // Calculate the number of days in the year and create a new date from it.
                    let daysSinceYearStart = (1 + (tempWeeks - 1) * 7);
                    startDate = new Date(tempYear, 0, daysSinceYearStart);
                    endDate = new Date(tempYear, 0, (daysSinceYearStart + 7));
                } else {
                    // Otherwise it's a standard date case that new Date() can handle.
                    startDate = new Date(tempDate);
                }
            }

            // Get all spendings from the database.
            accountingDataHandler.getSpendings(filterTopics, startDate, endDate)
                .then(spendings => {
                    // Iterate through all spending entries and aggregate based on topics.
                    let topicSpendingArray = [];
                    for (i = 0; i < spendings.length; i++) {
                        if (spendings[i].topics.length > 0) {
                            if (!topicSpendingArray[spendings[i].topics[0]]) topicSpendingArray[spendings[i].topics[0]] = 0.0;
                            topicSpendingArray[spendings[i].topics[0]] += parseFloat(spendings[i].amount);
                        } else {
                            topicSpendingArray['other spendings'] += spendings[i].amount;
                        }
                    }

                    // Iterate through all found topics and aggregated spendings.
                    let spendingTopicMessage = "You spent:\n";
                    for (property in topicSpendingArray) {
                        spendingTopicMessage += '* ' + topicSpendingArray[property] + ' on ' + property + "\n";
                    }

                    // Send final message to the user.
                    session.send(spendingTopicMessage);
                })
                .catch(err => {
                    // Something went wrong with the database query. Inform the user the summary can not be shown.
                    session.send('Unfortunately I could not show your spendings overview because of an accounting issue. Could you please try again? If this happens frequently, please contact the administrator. Thank you.');
                })

        })
        .catch(err => {
            // Something went wrong with the initialisation. Inform the user the summary can not be shown.
            session.send('Unfortunately I could not show your spendings overview because of a user session issue. Could you please try again? If this happens frequently, please contact the administrator. Thank you.');
        })

    // Done.
    // Note that this returns true prematurely as the actual work is done asynchronously.
    // The response is sent when the respective tasks have been completed.
    return true;
};

module.exports = run;