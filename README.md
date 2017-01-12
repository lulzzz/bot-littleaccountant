# Little Accountant Bot

A Skype bot that helps you collect and manage your daily spendings, bills etc. It's a sideproject to
keep track of what I am spending and for what.

# Abilities
*


# Requirements (local)
* Node.js server
* Registered bot: http://www.botframework.com


# Requirements (server)
* I used the Azure Bot Service for easy setup (https://azure.microsoft.com/en-gb/services/bot-service/),
but you should be able to host it anywhere just as you would run it locally.


# How to run locally
* Clone this repo
* Run "npm install" (most importantly botframework and restify)
* Run "node ./index.js" in the messages folder
* Note that you need to set process.env.NODE_ENV to true to run it locally
* Get and run the emulator: http://docs.botframework.com/connector/tools/bot-framework-emulator


## Privacy statement
The bot will store the financial data you provide in a database hosted in the Microsoft
Azure Cloud infrastructure. That information is bound to a hashed version of your Skype ID.
In other words: Your Skype ID is not stored directly, but replaced by a randomized ID.

Also, the bot uses the Microsoft Bot Framework and LUIS, which in turn collect and analyse
your message and message content (including your ID). Please see the Microsoft Privacy
Statement for more information regarding their data security and privacy.
Link: https://privacy.microsoft.com/en-gb/privacystatement


## Bot App links:
* The bot is hosted on an Azure Bot Service instance: https://littleaccountant.azurewebsites.net/
* The source code lives here: https://github.com/DirkSonguer/bot-littleaccountant


## LUIS app links
* The bot uses a LUIS app to analyse the input, see https://www.luis.ai/
