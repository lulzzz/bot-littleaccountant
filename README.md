# Little Accountant Bot

A Skype bot that helps you collect and manage your daily spendings, bills etc. It's a sideproject to
keep track of what I am spending and for what.

# Abilities
* You can log individual spendings. Optionally you can describe what you spent the money on to be able to search, filter and group your spendings later on.
 * "Went shopping in New York and bought new clothes for 199"
 * "I spent $45 on new headphones"
 * "Paid 1.99€ for apples"
 * "Bought oranges for 2.99 yesterday"
 * "Oranges 2.99"
* You can get a summary of your spendings, filtered by time or topic. If you don't specify a period or topic, the bot will aggregate everything.
 * "How much did I spent this month?"
 * "How much did I spent on clothes?"
 * "How much did I spent?"


# Requirements (local)
* Node.js server


# Requirements (server)
* I used the Azure Bot Service for easy setup (https://azure.microsoft.com/en-gb/services/bot-service/),
but you should be able to host it anywhere just as you would run it locally.
* A DocumentDB as database, see https://azure.microsoft.com/en-gb/services/documentdb/. MongoDB should be also fine with some fiddling.
* A registered bot, see http://www.botframework.com.
* The bot uses a LUIS app to analyse the input, see https://www.luis.ai/.


# How to run locally
* Clone this repo
* Run "npm install" (most importantly botframework and restify)
* Note that you need a LUIS app to analyse the user input. You can create a new one at https://www.luis.ai/ and import the training data from /LUIS.
* Note the environment variables:
 * In general 'NODE_ENV' defines your node environment, indicating where you run the bot. Usually 'development' for local use
 * LUIS needs 'LuisAppId' and 'LuisAPIKey'
 * The database needs 'DocumentDBHost', 'DocumentDBMasterKey', 'DocumentDBDatabase' and 'DocumentDBCollection' as access credentials
 * If you run it live, you also need to set the MS Bot Framework IDs: 'MicrosoftAppId', 'MicrosoftAppPassword', 'BotStateEndpoint', 'BotOpenIdMetadata'
* Run "node ./index.js" in the messages folder
* Get and run the emulator: http://docs.botframework.com/connector/tools/bot-framework-emulator


# How to run tests
* Get mocha with "npm install -g mocha"
* Run "mocha" from the root folder
* Depending on your internet connection, you might want to increase the timeout


## Privacy statements
The bot will store the financial data you provide in a database hosted in the Microsoft
Azure Cloud infrastructure. That information is bound to a hashed version of your Skype ID.
In other words: Your Skype ID is not stored directly, but replaced by a randomized ID.
Granted, it's not really anonymous, but at least we don't store your Skype ID in the database.

Also, the bot uses the Microsoft Bot Framework and LUIS, which in turn collect and analyse
your message and message content (including your ID). Please see the Microsoft Privacy
Statement for more information regarding their data security and privacy.
Link: https://privacy.microsoft.com/en-gb/privacystatement

We don't do anything with your data. We don't sell it, we don't analyse it, we usually don't
look at it except for bugfixing / operations. Since this is an open source and publicily
available project we don't really suggest you should trust us, but host the thing yourself if
you're paranoid.


## Bot App links:
* The bot is hosted on an Azure Bot Service instance: https://littleaccountant.azurewebsites.net/
* The source code lives here: https://github.com/DirkSonguer/bot-littleaccountant
* Skype link: https://join.skype.com/bot/1230f766-004e-4ad3-aecb-2a4820fa32e9
