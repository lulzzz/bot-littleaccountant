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
    session.send('Hello there, I\'m your little accountant bot! I can help you keep track of your daily spendings, bills etc. - you tell me what you bought and what you spend your money on and I will show you summaries and infographics to help you make better choices in the future.');

    // Done.
    return true;
};

module.exports = run;