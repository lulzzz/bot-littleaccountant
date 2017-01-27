/*-----------------------------------------------------------------------------
This is LittleAccountant, a Skype bot that helps you collect and manage your
daily spendings, bills etc.
It's a sideproject to keep track of what I am spending and for what.

The bot is hosted here: https://littleaccountant.azurewebsites.net/
The source code lives here: https://github.com/DirkSonguer/bot-littleaccountant
-----------------------------------------------------------------------------*/

// Use strict for ES6 and other things.
"use strict";

// Botbuilder is the official module that provides interfaces and
// functionality around the MS Bot Framework for node.
// See https://github.com/Microsoft/BotBuilder
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

// Check if the bot should run in development mode.
// This is used for local development and will for example create a
// restify server, which is not needed if you host it on an Azure Bot Service
// instance. You might need a restify server if you host it on another
// service, though.
var useEmulator = process.env.NODE_ENV == 'development';

// A live bot needs an app id and the corresponding password to be able
// to communicate with the Bot Framework middleware.
// Usually this will be defined in the app settings of your server and NOT
// in the actual code for security reasons.
// Note that for the testing locally with the Bot Framework Channel
// Emulator you should not enter id and password.
var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

// Create the actual bot.
// A universal bot is responsible for managing all of the conversations
// your bot has with a user while the bot framework middleware will do
// the actual communication with the chat platforms.
// So it's bot -> connector -> bot framework mw -> skype || slack || ..
// See https://docs.botframework.com/en-us/node/builder/chat/UniversalBot/
var bot = new builder.UniversalBot(connector);

// You need a registered LUIS app on https://www.luis.ai/applicationlist
// The app url is the one you will get if you publish your LUIS app.
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';
var luisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// This creates a connection to the LUIS app.
var recognizer = new builder.LuisRecognizer(luisModelUrl);

var FrontController = require("./classes/frontController");
var frontController = new FrontController();
var functionsArray = [];

// Instead of dialogs, LUIS works with intents
// you define these within your LUIS app, which will then used
// as triggers for your app when LUIS identifies them.
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('None', (session, args) => {
        session.send('Hi! This is the None intent handler. You said: \'%s\'.', session.message.text);
    })
    // Default intent for all intents / requests.
    // This will be handed off to the front controller.
    // Note that the bot only deals with dialogs 3 levels down.
    // Yes, this is lazy and stupid, but I don't care for this PoC.
    .onDefault([
        function (session, args, next) {
            frontController.runIntent(session, args, next, 1);
        },
        function (session, args, next) {
            frontController.runIntent(session, args, next, 2);
        },
        function (session, args, next) {
            frontController.runIntent(session, args, next, 3);
        }
    ]);

// Bind all dialogs to intents
bot.dialog('/', intents);

if (useEmulator) {
    // Restify provides a REST server. Essentially a bot is just a web
    // application providing a REST endpoint the bot framework middleware
    // can communicate with.
    // See https://github.com/restify/node-restify
    var restify = require('restify');

    // Create a new server and make it listen on port 3798.
    // Note that this is the standard port for the bot framework v3.
    // Show a console message on startup.
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('DEVELOPMENT MODE! Test bot endpoint at http://localhost:3978/api/messages.');
    });

    // Set the endpoint your bot is listening at.
    // Note while /api/messages is the default, it can be changed in the
    // management page of your bot.
    server.post('/api/messages', connector.listen());
} else {
    // The Azure Bot Service provides the REST server, so no need to provide
    // one manually.
    module.exports = { default: connector.listen() }
}

