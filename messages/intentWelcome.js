/* ---------------------------------------------------- */
// Recognised Welcome intent.
// This is trained to listen to all kinds of welcome and
// salutation requests from "hi" to "whats up?".
// The answer is a simple and straight up ssalutation
// response.
/* ---------------------------------------------------- */

// Botbuilder is the official module that provides interfaces and
// functionality around the MS Bot Framework for node.
// See https://github.com/Microsoft/BotBuilder
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

// Main method that will be exported.
var run = function (session, args, next) {
    // Show a simple answer.
    session.send("Oh, hello! Nice to see you!");

    // Done.
    return true;
};

module.exports = run;