/* ---------------------------------------------------- */
// Recognised Help intent.
// This is trained to listen to all kinds of help requests
// from "help" to "what can you do?".
/* ---------------------------------------------------- */

// Botbuilder is the official module that provides interfaces and
// functionality around the MS Bot Framework for node.
// See https://github.com/Microsoft/BotBuilder
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

// Main method that will be exported.
var run = function (session, args, next) {
    // Show a simple answer.
    session.send('Hello there, I\'m your little accountant bot! I can help you keep track of your daily spendings, bills etc.');
    session.send('You can tell me what you bought and how much money you spent. In turn, I can show you summaries and infographics, so you can use me for keeping track of your private or company expenses.');
    session.send('You can log expenses by saying things like: \'I bought some apples for 2.99\' or in short \'Apples for 2.99\'. In both cases I will remember the amount and the topic (apples).');
    session.send('If I did not understand correctly or logged something wrong you can correct me by saying \'Undo\' or \'Remove\'.');
    session.send('Later you can ask \'What did I buy this week?\' to get an overview or \'How much did I spent on apples?\' for a more specific summary. You can play around with topics and times to get only a subset of data.');

    // Done.
    return true;
};

module.exports = run;