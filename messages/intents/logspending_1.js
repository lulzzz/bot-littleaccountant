/* ---------------------------------------------------- */
// Recognised LogSpending intent.
// This is trained to listen to all kinds of spending
// information. Examples are "I spent $45 on new headphones",
// "Paid 1.99€ for apples", "Oranges 2.99"
/* ---------------------------------------------------- */

// Botbuilder is the official module that provides interfaces and
// functionality around the MS Bot Framework for node.
// See https://github.com/Microsoft/BotBuilder
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

// Account data handler provides the interface to log spendings.
var AccountingDataHandler = require('../classes/accountingDataHandler');

// Require custom spending objects, as defined in the structure.
// This will be handed over to the accounting data handler.
var SpendingObject = require('../structures/spendingObject.js');

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
        .then(userobject => {
            // Create a new spendings object. This will be filled with data
            // from the chat message and handed over to the account data handler
            // for storage.
            let spendingObject = new SpendingObject();

            // Initialise the response string.
            // This will be extended as more and more data is extracted.
            let logSpendingAnswer = 'I will log';

            // Check for an amount the user wants to log.
            var entityAmount = builder.EntityRecognizer.findEntity(args.entities, 'amount');
            if (entityAmount) {
                // Remove white spaces from the amount. They are automatically added
                // by LUIS if some kind of decimal separator is added ('.' or ',').
                // Also, we normalise the decimal separator to '.'.
                let spendingAmount = entityAmount.entity.replace(/\s/g, '');
                spendingAmount = spendingAmount.replace(',', '.');
                logSpendingAnswer += ' an amount of ' + spendingAmount;
                spendingObject.amount = spendingAmount;
            } else {
                // This is a required information as it does not make sense to log anything without an amount.
                session.send('I am sorry, I could not understand how much you spent on what. Please try again.');
                return false;
            }

            var entityCurrency = builder.EntityRecognizer.findEntity(args.entities, 'currency');
            if (entityCurrency) {
                logSpendingAnswer += ' with ' + entityCurrency.entity + ' as currency';
                spendingObject.currency = entityCurrency.entity;
            }

            // Check if a location could be found.
            // For now, a location is just another topic added to the spending.
            var entityLocation = builder.EntityRecognizer.findEntity(args.entities, 'location');
            if (entityLocation) {
                spendingObject.topics.push(entityLocation.entity);
            }

            // Theoretically there can be an unlimited amount of topics identified by LUIS.
            // We search all and store them in the array.
            var entityTopics = builder.EntityRecognizer.findAllEntities(args.entities, 'topics');
            if (entityTopics) {
                logSpendingAnswer += ' and I will add ';
                for (let i = 0; i < entityTopics.length; i++) {
                    spendingObject.topics.push(entityTopics[i].entity);
                    if (i > 0) logSpendingAnswer += ', ';
                    logSpendingAnswer += entityTopics[i].entity;
                }
            }

            // Finish the response string.
            logSpendingAnswer += '.';

            // Log the spending object into the database, associated with the current user.
            accountingDataHandler.logSpending(spendingObject)
                .then(spending => {
                    // Show the response string as confirmation.
                    session.send(logSpendingAnswer);
                    session.send("If this was wrong, please say 'undo' or 'remove'.");
                    return true;
                })
                .catch(err => {
                    // Something went wrong with the logging. Inform the user the entry was not logged.
                    session.send('Unfortunately I could not log your entry because of a database issue. Could you please try again? If this happens frequently, please contact the administrator. Thank you.');
                    return false;
                })

        })
        .catch(err => {
            // Something went wrong with the initialisation. Inform the user the entry was not logged.
            session.send('Unfortunately I could not log your entry because of a user session issue. Could you please try again? If this happens frequently, please contact the administrator. Thank you.');
        })

    // Done.
    // Note that this returns true prematurely as the actual work is done asynchronously.
    // The response is sent when the respective tasks have been completed.
    return true;
};

module.exports = run;