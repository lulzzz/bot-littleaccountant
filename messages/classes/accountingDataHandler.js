

// Require database interface class.
var DocumentDBInterface = require('./documentDBInterface');

// Require crypto functionality to create hashes.
var crypto = require('crypto');

// Require custom user objects, as defined in the structure.
var UserObject = require('../structures/userObject.js');

/**
 * This class provides functionality to handle the accounting actions.
 *
 * @class
 */
class AccountingDataHandler {
	/**
	 * Constructor.
	 *
	 * @constructor
	 */
	constructor() {
		// Connect to database and provide a class wide reference.
		this.documentDBInterface = new DocumentDBInterface(process.env['DocumentDBHost'], process.env['DocumentDBMasterKey'], process.env['DocumentDBDatabase'], process.env['DocumentDBCollection']);

		// Will contain the hashed user name as the bot framework delivers it.
		this.userHash = '';

		// This will contain all the data assigned to the current user.
		// This is based on the structure defined in /structures/userObject.js.
		this.userData = {};
	}


	/**
	 * Initialise the object for the current user.
	 *
	 * Promised.
	 *
	 * @param {String} userId Id of the user currently registered with the bot.
     * @returns {Promise.Boolean|String} A promise for the database write.
	 * Resolve: Returns true if the user exists or has been created successfully.
	 * Reject: Returns the error message.
	 */
	init(userId) {
		// Initialise the promise.
		return new Promise((resolve, reject) => {
			// Create a hash for the current user based on the given user id.
			this.userHash = crypto.createHash('sha256')
				.update(userId, 'utf8')
				.digest('hex');

			// Try to get an existing user object from the DocumentDB.
			// This will usually work and only fail if this is the first time
			// the user is using the bot.
			this.documentDBInterface.readDocument(this.userHash)
				.then(document => {
					// Document with user data exists. Store it in the class var
					// and continue.
					this.userData = document;
					return resolve(true);
				})
				.catch(err => {
					// The user does not exist in the database yet.
					// Create a new empty object for the user.
					var newUserObject = new UserObject();

					// Store the newly created user object in the database.
					this.documentDBInterface.createDocument(this.userHash, newUserObject)
						.then(document => {
							this.userData = document;
							return resolve(true);
						})
						.catch(err => {
							return reject('Could not create user object in database.');
						})
				})
		});
	}


	/**
	 * Create a new spending for the current user.
	 *
	 * Promised.
	 *
	 * @param {object} spendingObject An object of type spending (see /structures).
	 * @returns {Promise.Boolean|String} A promise for the database write.
	 * Resolve: Returns true if the entry has been created successfully.
	 * Reject: Returns the error message.
	 */
	logSpending(spendingObject) {
		// Initialise the promise.
		return new Promise((resolve, reject) => {
			// Check if the document is actually a JS object.
			// Note that we only want JS objects in the DocumentDB.
			if ((typeof spendingObject !== 'object') || ((typeof spendingObject.type !== 'undefined') && (spendingObject.type != 'SpendingObject'))) {
				// If not, reject the object.
				return reject('Could not log spending: Spending not of acceptable type.');
			}

			// extend user object
			this.userData.spendings.push(spendingObject);

			// replace user object
			// Store the newly created user object in the database.
			this.documentDBInterface.replaceDocument(this.userHash, this.userData)
				.then(document => {
					this.userData = document;
					return resolve(true);
				})
				.catch(err => {
					return reject(err);
				})
		});
	}
}

// Export default new AccountingDataHandler();
module.exports = AccountingDataHandler;