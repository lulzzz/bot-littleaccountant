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
            // Theoretically there can be an unlimited amount of topics identified by LUIS
            // that can be used as filters.
            let filterTopics = [];
            var entityTopics = builder.EntityRecognizer.findAllEntities(args.entities, 'topics');
            let spendingTopicMessage = '';
            if (entityTopics.length > 0) {
                spendingTopicMessage += ' on ';
                for (i = 0; i < entityTopics.length; i++) {
                    filterTopics.push(entityTopics[i].entity);
                    spendingTopicMessage += entityTopics[i].entity + ', ';
                }

                // Remove trailing comma.
                spendingTopicMessage = spendingTopicMessage.substr(0, (spendingTopicMessage.length - 2));
            }

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
                    // Start creating the answer.
                    let spendingSummaryMessage = 'You spent ';
                    let totalSpendings = 0.0;

                    // Iterate through all spending entries and aggregate accordingly.
                    for (i = 0; i < spendings.length; i++) {
                        totalSpendings += parseFloat(spendings[i].amount);
                    }

                    // Send final message to the user.
                    totalSpendings = totalSpendings.toFixed(2);
                    spendingSummaryMessage += totalSpendings;

                    // Add the date restriction.
                    if ((dateEntitiesArray) && (dateEntitiesArray.length > 0)) {
                        spendingSummaryMessage += ' ' + dateEntitiesArray[0].entity;
                    } else {
                        spendingSummaryMessage += ' so far'
                    }
                    spendingSummaryMessage += '.'

                    // Add the topic.
                    spendingSummaryMessage += spendingTopicMessage;

                    // Send message.
                    session.send(spendingSummaryMessage);
                })
                .catch(err => {
                    // Something went wrong with the database query. Inform the user the summary can not be shown.
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