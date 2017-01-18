
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
var testSpendingUUID = '';
var testDateNow = '';
var testDateYesterday = '';
var testDateDayBeforeYesterday = '';
var createdDatabaseDocuments = [];

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
            });
    });

    it('Should correctly hash the user ID', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(document => {
                assert.notEqual(testUserId, accountingDataHandler.userHash);
                testHashedUserID = accountingDataHandler.userHash;
                createdDatabaseDocuments.push(testHashedUserID);
                done();
            })
            .catch(err => {
                done(err);
            });
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
            });
    });

    it('There should be an entry in the database now', function (done) {
        documentDBInterface.readDocument(testHashedUserID)
            .then(document => {
                assert.equal(document.id, testHashedUserID);
                done();
            })
            .catch(err => {
                done(err);
            });
    });
});


describe('logSpending', function () {
    it('Should fail as the data is not an object', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(document => {
                accountingDataHandler.logSpending(testUserId)
                    .then(spending => {
                        done('This should have failed');
                    })
                    .catch(err => {
                        done();
                    })
            })
            .catch(err => {
                assert.fail(err);
                done(err);
            });
    });

    it('Should fail as the data is not a SpendingData object', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(document => {
                let testObject = {};
                testObject.type = 'WrongObject';
                accountingDataHandler.logSpending(testObject)
                    .then(spending => {
                        done('This should have failed');
                    })
                    .catch(err => {
                        done();
                    })
            })
            .catch(err => {
                done(err);
            });
    });

    it('This should work and create an empty spending for the current user', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(userobject => {
                let testSpendingObject = new SpendingObject();
                testSpendingObject.amount = testSpendingAmount;
                testDateNow = new Date();
                testSpendingObject.date = testDateNow;

                accountingDataHandler.logSpending(testSpendingObject)
                    .then(spending => {
                        testSpendingUUID = spending.id;
                        createdDatabaseDocuments.push(spending.id);
                        done();
                    })
                    .catch(err => {
                        assert.fail(err);
                        done();
                    })
            })
            .catch(err => {
                done(err);
            });
    });

    it('There should be an entry in the database with the spending now', function (done) {
        documentDBInterface.readDocument(testSpendingUUID)
            .then(spending => {
                testSpendingAmount = spending.amount;
                done();
            })
            .catch(err => {
                done(err);
            });
    });
});


describe('getSpendings', function () {
    it('There should be one previously generated spending in the database', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(userobject => {
                accountingDataHandler.getSpendings()
                    .then(spendings => {
                        assert.equal(spendings.length, 1);
                        assert.equal(spendings[0].amount, testSpendingAmount);
                        done();
                    })
                    .catch(err => {
                        done(err);
                    })
            })
            .catch(err => {
                assert.fail(err);
                done(err);
            });
    });

    it('Now there should be two spendings in the database', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(userobject => {
                let testSpendingObject = new SpendingObject();
                testSpendingObject.amount = testSpendingAmount + 1;
                testSpendingObject.topics.push(testUserId);
                testDateYesterday = new Date(testDateNow);
                testDateYesterday.setDate(testDateNow.getDate() - 1);
                testSpendingObject.date = testDateYesterday;

                accountingDataHandler.logSpending(testSpendingObject)
                    .then(spending => {
                        createdDatabaseDocuments.push(spending.id);
                        accountingDataHandler.getSpendings()
                            .then(spendings => {
                                assert.equal(spendings.length, 2);
                                assert.equal(spendings[0].amount, testSpendingAmount);
                                assert.equal(spendings[1].amount, testSpendingAmount + 1);
                                assert.equal(spendings[1].topics[0], testUserId);
                                let dateTest = new Date(spendings[1].date);
                                assert.equal(dateTest, testDateYesterday.toString());
                                done();
                            })
                            .catch(err => {
                                done(err);
                            })
                    })
                    .catch(err => {
                        assert.fail(err);
                        done();
                    })
            })
            .catch(err => {
                assert.fail(err);
                done(err);
            });
    });

    it('There should be only one spending in the database with a topic', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(userobject => {
                let spendingArray = [];
                spendingArray.push(testUserId);
                accountingDataHandler.getSpendings(spendingArray)
                    .then(spendings => {
                        assert.equal(spendings.length, 1);
                        assert.equal(spendings[0].amount, testSpendingAmount + 1);
                        assert.equal(spendings[0].topics[0], testUserId);
                        done();
                    })
                    .catch(err => {
                        done(err);
                    })
            })
            .catch(err => {
                assert.fail(err);
                done(err);
            });
    });


    it('Now there should be three spendings in the database', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(userobject => {
                let testSpendingObject = new SpendingObject();
                testSpendingObject.amount = testSpendingAmount + 2;
                testSpendingObject.topics.push(testUserId + "1");
                testDateDayBeforeYesterday = new Date(testDateNow);
                testDateDayBeforeYesterday.setDate(testDateNow.getDate() - 2);
                testSpendingObject.date = testDateDayBeforeYesterday;
                accountingDataHandler.logSpending(testSpendingObject)
                    .then(spending => {
                        createdDatabaseDocuments.push(spending.id);
                        accountingDataHandler.getSpendings()
                            .then(spendings => {
                                assert.equal(spendings.length, 3);
                                done();
                            })
                            .catch(err => {
                                done(err);
                            })
                    })
                    .catch(err => {
                        assert.fail(err);
                        done();
                    })
            })
            .catch(err => {
                assert.fail(err);
                done(err);
            });
    });

    it('There should now be two spending in the database with a topic', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(userobject => {
                let spendingArray = [];
                spendingArray.push(testUserId);
                spendingArray.push(testUserId + "1");
                accountingDataHandler.getSpendings(spendingArray)
                    .then(spendings => {
                        assert.equal(spendings.length, 2);
                        done();
                    })
                    .catch(err => {
                        done(err);
                    })
            })
            .catch(err => {
                assert.fail(err);
                done(err);
            });
    });

    it('We can get spendings since a specific start date', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(userobject => {
                accountingDataHandler.getSpendings(false, testDateYesterday)
                    .then(spendings => {
                        assert.equal(spendings.length, 2);
                        done();
                    })
                    .catch(err => {
                        done(err);
                    })
            })
            .catch(err => {
                assert.fail(err);
                done(err);
            });
    });

    it('We can get spendings before a specific end date', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(userobject => {
                accountingDataHandler.getSpendings(false, false, testDateYesterday)
                    .then(spendings => {
                        assert.equal(spendings.length, 2);
                        done();
                    })
                    .catch(err => {
                        done(err);
                    })
            })
            .catch(err => {
                assert.fail(err);
                done(err);
            });
    });

        it('We can get spendings between a specific start and end date', function (done) {
        accountingDataHandler = new AccountingDataHandler();
        accountingDataHandler.init(testUserId)
            .then(userobject => {
                accountingDataHandler.getSpendings(false, testDateDayBeforeYesterday, testDateYesterday)
                    .then(spendings => {
                        assert.equal(spendings.length, 2);
                        done();
                    })
                    .catch(err => {
                        done(err);
                    })
            })
            .catch(err => {
                assert.fail(err);
                done(err);
            });
    });
});


describe('cleanup', function () {
    it('Clean up and delete the user again', function (done) {
        for (i = 0; i < createdDatabaseDocuments.length; i++) {
            documentDBInterface.deleteDocument(createdDatabaseDocuments[i])
                .then(document => {
                })
                .catch(err => {
                });
        }
        done();
    });
});
