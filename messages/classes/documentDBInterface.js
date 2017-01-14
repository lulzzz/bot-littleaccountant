
// DocumentDB is the official implementation of the database by Microsoft.
// See https://github.com/Azure/azure-documentdb-node
var DocumentDBClient = require('documentdb').DocumentClient;

/**
 * This class provides an interface for a DocumentDB.
 *
 * @class
 */
class DocumentDBInterface {
	/**
	 * Constructor.
	 *
	 * @constructor
	 * @param {string} databaseHost The title of the book.
	 * @param {string} databaseKey The author of the book.
	 * @param {string} databaseId The title of the book.
	 * @param {string} collectionId The author of the book.
	 */
	constructor(databaseHost, databaseKey, databaseId, collectionId) {
		// Create a new database connection
		var documentDBClient = new DocumentDBClient(databaseHost, {
			masterKey: databaseKey
		});

		// Store the connections for local use
		this.client = documentDBClient;
		this.databaseId = databaseId;
		this.collectionId = collectionId;

		// Store the database and collection links
		this.databaseLink = 'dbs/' + databaseId;
		this.collectionLink = this.databaseLink + '/colls/' + collectionId;
	}


	/**
	 * Create a new document in the database. Note that this will fail if an object with this ID
	 * already exists in the dabatase collection.
	 *
	 * Promised.
	 *
	 * @param {string} documentId The ID of the object that will be used to identify it in the database.
	 * @param {object} documentItem The document itself.
     * @returns {Promise.Object|String} A promise for the database write.
	 * Resolve: Returns the created document including its meta data.
	 * Reject: Returns the error message as given by the DocumentDB.
	 */
	createDocument(documentId, documentItem) {
		// Initialise the promise.
		return new Promise((resolve, reject) => {
			// Check if the document is actually a JS object.
			// Note that we only want JS objects in the DocumentDB.
			if (typeof documentItem !== 'object') {
				// If not, reject the object.
				return reject('Could not create document: Document not of type object.');
			}

			// Add the id to the document.
			// This will override any ID that was previously given to the object.
			documentItem.id = documentId;

			// Create the document in the DocumentDB.
			this.client.createDocument(this.collectionLink, documentItem, (err, createdDocument) => {
				// Check if there was an error.
				if (err) {
					// If so, reject the promise with the given error message.
					return reject(err);
				}

				// If the object could be created, resolve the promise and hand back the DB object.
				return resolve(createdDocument);
			})
		});
	}


	/**
	 * Get an exiting document from the database.
	 *
	 * Promised.
	 *
	 * @param {string} documentId The ID of the object that will be used to identify it in the database.
     * @returns {Promise.Object|String} A promise for the database read.
	 * Resolve: Returns the document including its meta data.
	 * Reject: Returns the error message as given by the DocumentDB.
	 */
	readDocument(documentId) {
		// Initialise the promise.
		return new Promise((resolve, reject) => {
			// Create a link for the document
			var documentLink = this.collectionLink + '/docs/' + documentId;

			// Retrieve the document from the DocumentDB.
			this.client.readDocument(documentLink, (err, foundDocument) => {
				// Check if there was an error.
				if (err) {
					// If so, reject the promise with the given error message.
					return reject(err);
				}

				// If the object could be found, resolve the promise and hand back the DB object.
				return resolve(foundDocument);
			})
		});
	}

	/**
	 * Replace an existing document in the database. Note that this will fail if no object with this ID
	 * exists in the dabatase collection.
	 *
	 * Promised.
	 *
	 * @param {string} documentId The ID of the object that will be used to identify it in the database.
	 * @param {object} documentItem The document itself.
     * @returns {Promise.Object|String} A promise for the database write.
	 * Resolve: Returns the updated document including its meta data.
	 * Reject: Returns the error message as given by the DocumentDB.
	 */
	replaceDocument(documentId, documentItem) {
		// Initialise the promise.
		return new Promise((resolve, reject) => {
			// Check if the document is actually a JS object.
			// Note that we only want JS objects in the DocumentDB.
			if (typeof documentItem !== 'object') {
				// If not, reject the object.
				return reject('Document not of type object');
			}

			// Add the id to the document.
			// This will override any ID that was previously given to the object.
			documentItem.id = documentId;
			var documentLink = this.collectionLink + '/docs/' + documentId;

			// Create the document in the DocumentDB.
			this.client.replaceDocument(documentLink, documentItem, (err, replacedDocument) => {
				// Check if there was an error.
				if (err) {
					// If so, reject the promise with the given error message.
					return reject(err);
				}

				// If the object could be updated, resolve the promise and hand back the DB object.
				return resolve(replacedDocument);
			})
		});
	}


	/**
	 * Delete an exiting document from the database.
	 *
	 * Promised.
	 *
	 * @param {string} documentId The ID of the object that will be used to identify it in the database.
     * @returns {Promise.Boolean|String} A promise for the database delete.
	 * Resolve: Returns the document including its meta data.
	 * Reject: Returns the error message as given by the DocumentDB.
	 */
	deleteDocument(documentId) {
		// Initialise the promise.
		return new Promise((resolve, reject) => {
			// Create a link for the document
			var documentLink = this.collectionLink + '/docs/' + documentId;

			// Retrieve the document from the DocumentDB.
			this.client.deleteDocument(documentLink, (err) => {
				// Check if there was an error.
				if (err) {
					// If so, reject the promise with the given error message.
					return reject(err);
				}

				// If the object could be deleted, resolve the promise.
				return resolve(true);
			})
		});
	}
}

// export default new DocumentDBInterface();
module.exports = DocumentDBInterface;