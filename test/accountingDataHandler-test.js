
// Require class to test.
var AccountingDataHandler = require('../messages/classes/accountingDataHandler');

// Require custom user objects, as defined in the structure.
var UserObject = require('../messages/structures/userObject.js');

// Require custom spending objects, as defined in the structure.
var SpendingObject = require('../messages/structures/spendingObject.js');

// Require database class for additional verification.
var DocumentDBInterface = require('../messages/classes/documentDBInterface');

// Require crypto class for additional verification.
var crypto = require('crypto');

// Require node.js assert functionality.
var assert = require('assert');

// Test data cache storage.
var testUserId = 'test-' + (Math.random().toString(36) + '00000000000000000').slice(2, 10 + 2);
var testHashedUserID = '';
var testSpendingAmount = Math.round((Math.random() * 1000) * 100) / 100;

describe('init', function () {
    it('There should be not entry in the database initially', function (done) {
        let userHash = crypto.createHash('sha256')
            .update(testUserId, 'utf8')
            .digest('hex');

        documentDBInterface.readDocument(userHash)
            .then(document => {
                done('This should have failed');
            })
            .catch(err => {
                done();
            })
    });

    it('Should correctly hash the user ID', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(document => {
                assert.notEqual(testUserId, accountingDataHandler.userHash);
                testHashedUserID = accountingDataHandler.userHash;
                done();
            })
            .catch(err => {
                done(err);
            })
    });

    it('The second hashed ID should be the same as the first time', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(document => {
                accountingDataHandler = new AccountingDataHandler();
                accountingDataHandler.init(testUserId);
                assert.notEqual(testUserId, accountingDataHandler.userHash);
                assert.equal(testHashedUserID, accountingDataHandler.userHash);
                done();
            })
            .catch(err => {
                done(err);
            })
    });

    it('There should be an entry in the database now', function (done) {
        documentDBInterface.readDocument(testHashedUserID)
            .then(document => {
                assert.equal(document.id, testHashedUserID);
                done();
            })
            .catch(err => {
                done(err);
            })
    });
});


describe('logSpending', function () {
    it('Should fail as the data is not an object', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(document => {
                accountingDataHandler.logSpending(testUserId)
                    .then(document => {
                        done('This should have failed');
                    })
                    .catch(err => {
                        done();
                    })
            })
            .catch(err => {
                assert.fail(err);
                done(err);
            })
    });

    it('Should fail as the data is not a SpendingData object', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(document => {
                let testObject = {};
                testObject.type = 'WrongObject';
                accountingDataHandler.logSpending(testObject)
                    .then(document => {
                        done('This should have failed');
                    })
                    .catch(err => {
                        done();
                    })
            })
            .catch(err => {
                done(err);
            })
    });

    it('This should work and create an empty spending for the current user', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(document => {
                let testSpendingObject = new SpendingObject();
                testSpendingObject.amount = testSpendingAmount;
                accountingDataHandler.logSpending(testSpendingObject)
                    .then(document => {
                        done();
                    })
                    .catch(err => {
                        assert.fail(err);
                        done();
                    })
            })
            .catch(err => {
                done(err);
            })
    });

    it('There should be an entry in the database with the spending now', function (done) {
        documentDBInterface.readDocument(testHashedUserID)
            .then(document => {
                assert.equal(document.spendings.length, 1);
                assert.equal(document.spendings[0].amount, testSpendingAmount);
                done();
            })
            .catch(err => {
                done(err);
            })
    });
});

describe('cleanup', function () {
    it('Clean up and delete the user again', function (done) {
        documentDBInterface.deleteDocument(testHashedUserID)
            .then(document => {
                done();
            })
            .catch(err => {
                done(err);
            })
    });
});
