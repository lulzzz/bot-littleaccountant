
// Include file system functions
var fileSystem = require('fs');
var filePath = require('path');

/**
 * Simple front controller.
 * The intent given by LUIS is mapped to a js file in the folder "intents" and the
 * intent name. The file will be included and run based on the exported function.
// Example: The "Welcome" intent would be routet to the "intents/welcome.js" file.
 *
 * @class
 */
class FrontController {
	/**
	 * Constructor.
	 *
	 * @constructor
	 */
    constructor() {
        this.currentIntent = '';
    }

	/**
	 * Run the current intent.
	 *
	 * @param {Object} session Session object as handed over by the bot framework.
	 * @param {Object} args Arguments object as handed over by the bot framework.
	 * @param {Object} next Next object as handed over by the bot framework.
	 * @param {Int} level Levels down from the root intent.
     * @returns {Void} Nothing.
	 */
    runIntent(session, args, next, level) {
        // Check the current level.
        // Note that waterfall intents will not hand down the actual intent name,
        // but only the results. So we store it for later use.
        if (level == 1) {
            this.currentIntent = args.intent;
        }

        // Build path to intent source file
        var intentSourcePath = filePath.join(__dirname, '/../intents/' + this.currentIntent.toLowerCase() + '_' + level + '.js');
        var intentFileValid = true;

        // Check if the intent actually exists in the file system.
        try {
            // Check on the file system by trying to get stats for the file.
            var stat = fileSystem.statSync(intentSourcePath);

            if (!stat.isFile()) {
                // If the received stats are not for a file, throw an error.
                intentFileValid = false;
                console.log('Intent is not available: ' + intentSourcePath + ' not found (Not a file)');
            }
        } catch (e) {
            // If no stats have been received, then throw an error.
            intentFileValid = false;
            console.log('Intent is not available: ' + intentSourcePath + ' not found (' + e.code + ')');
        }

        // If it exist, try to run it.
        if (intentFileValid) {
            // Require file and run action.
            var intentAction = require(intentSourcePath);
            if (!intentAction(session, args, next)) {
                // If something went wrong executing the intent, send a negative response.
                session.send('Sorry, something went wrong handling \'%s\'.', session.message.text);
            }
        } else {
            // If no mapping intent file could be found, send a negative response.
            session.send('Sorry, I did not understand \'%s\'.', session.message.text);
        }
    }
}

// Export default new FrontController();
module.exports = FrontController;