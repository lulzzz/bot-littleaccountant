
// Require class to test.
var DocumentDBInterface = require('../messages/classes/documentDBInterface');

// Require node.js assert functionality.
var assert = require('assert');

// Connect to database.
documentDBInterface = new DocumentDBInterface(process.env['DocumentDBHost'], process.env['DocumentDBMasterKey'], process.env['DocumentDBDatabase'], process.env['DocumentDBCollection']);

// Create a new random string, which is used as random test data.
var testDocumentId = 'test-' + (Math.random().toString(36) + '00000000000000000').slice(2, 10 + 2);

describe('createDocument', function () {
    it('Should create the first document without error', function (done) {
        documentDBInterface.createDocument(testDocumentId, { 'test': testDocumentId })
            .then(document => {
                assert.equal(document.id, testDocumentId);
                done();
            })
            .catch(err => {
                done(err);
            })
    });

    it('Should fail if another document with the same id is created', function (done) {
        documentDBInterface.createDocument(testDocumentId, { 'test': testDocumentId })
            .then(document => {
                done('This should have failed');
            })
            .catch(err => {
                done();
            })
    });
});


describe('readDocument', function () {
    it('Should be able to read an existing document without error', function (done) {
        documentDBInterface.readDocument(testDocumentId)
            .then(document => {
                assert.equal(document.id, testDocumentId);
                done();
            })
            .catch(err => {
                done(err);
            })
    });

    it('Should fail to read a document that does not exist', function (done) {
        documentDBInterface.readDocument(testDocumentId + '1')
            .then(document => {
                done('This should have failed');
            })
            .catch(err => {
                done();
            })
    });
});


describe('replaceDocument', function () {
    it('Should be able to replace an existing document without error', function (done) {
        documentDBInterface.replaceDocument(testDocumentId, { 'test_1': testDocumentId })
            .then(document => {
                assert.equal(document.id, testDocumentId);
                assert.equal(document.test_1, testDocumentId);
                done();
            })
            .catch(err => {
                done(err);
            })
    });

    it('Should fail to replace a document that does not exist', function (done) {
        documentDBInterface.replaceDocument(testDocumentId + '1', { 'test_1': testDocumentId })
            .then(document => {
                done('This should have failed');
            })
            .catch(err => {
                done();
            })
    });
});


describe('deleteDocument', function () {
    it('Should be able to delete an existing document without error', function (done) {
        documentDBInterface.deleteDocument(testDocumentId)
            .then(document => {
                done();
            })
            .catch(err => {
                done(err);
            })
    });

    it('Should fail to delete a document that does not exist', function (done) {
        documentDBInterface.deleteDocument(testDocumentId + '1')
            .then(document => {
                done('This should have failed');
            })
            .catch(err => {
                done();
            })
    });
});
