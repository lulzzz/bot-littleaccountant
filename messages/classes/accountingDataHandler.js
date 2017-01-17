
// Require database interface class.
var DocumentDBInterface = require('./documentDBInterface');

// Require crypto functionality to create hashes.
var crypto = require('crypto');

const uuidV1 = require('uuid/v1');

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
					// Check integrity of the user data.
					if ((typeof document !== 'object') || ((typeof document.type !== 'undefined') && (document.type != 'UserObject'))) {
						// If not, reject the object.
						return reject('Could not initialise accounting data: User not of acceptable type.');
					}

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
				});
		});
	}


	/**
	 * Create a new spending for the current user.
	 *
	 * Promised.
	 *
	 * @param {object} spendingObject An object of type spending (see /structures).
	 * @returns {Promise.Boolean|String} A promise for the database write.
	 * Resolve: Returns the spending document if the entry has been created successfully.
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

			// Extend user object with the current user hash.
			// This means users can only log spendings for themselves.
			spendingObject.user = this.userHash;

			// Issue a uuid ID for the document in the database;
			spendingObject.id = uuidV1();

			// Store the newly created spending object in the database.
			this.documentDBInterface.createDocument(spendingObject.id, spendingObject)
				.then(spending => {
					return resolve(spending);
				})
				.catch(err => {
					return reject(err);
				});
		});
	}


	/**
	 * Get the spendings for a user.
	 *
	 * Promised.
	 *
	 * @param {array} topics An array of topics as strings.
	 * @param {date} periodStart Start of the time period to search.
	 * @param {date} periodEnd Start of the time period to search.
	 * @returns {Promise.Array|String} A promise for the database write.
	 * Resolve: Returns an array of spendingObjects.
	 * Reject: Returns the error message.
	 */
	getSpendings(topics, periodStart, periodEnd) {
		// Initialise the promise.
		return new Promise((resolve, reject) => {
			// Initialise query string. This will be extended as we go along.
			let queryString = 'SELECT * FROM data d WHERE ';

			// Include topic filters in the query.
			if ((topics) && (typeof topics === 'object')) {
				// each topic is added as individual ARRAY_CONTAINS clause.
				queryString += '( ';
				for (let i = 0; i < topics.length; i++) {
					queryString += 'ARRAY_CONTAINS(d.topics, "' + topics[i] + '") ';
					if (i < (topics.length - 1)) queryString += 'OR ';
				}
				queryString += ') AND ';
			}

			// Query string is complete. Add the clause to only search for entries
			// associated with the current user. Also, only documents of type
			// SpendingObject are relevant.
			queryString += 'd.type = "SpendingObject" AND d.user = @hashedUserId';
			let querySpec = {
				query: queryString,
				parameters: [
					{
						name: '@hashedUserId',
						value: this.userHash,
					}
				]
			};

			// Execute the query and return all found spending documents.
			documentDBInterface.queryDocuments(querySpec)
				.then(spendings => {
					return resolve(spendings);
				})
				.catch(err => {
					return reject(err);
				});
		});
	}
}

// Export default new AccountingDataHandler();
module.exports = AccountingDataHandler;