/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const url = '/api/issues/test';

chai.use(chaiHttp);

suiteSetup((done) => {
  server.on('ready', () => {
    done();
  });
});

suite('Functional Tests', function () {
  suite('POST /api/issues/{project} => object with issue data', function () {
    test('Every field filled in', function (done) {
      chai
        .request(server)
        .post(url)
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(
            res.body.created_by,
            'Functional Test - Every field filled in'
          );
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          assert.isNumber(new Date(res.body.created_on).getTime());
          assert.isNumber(new Date(res.body.updated_on).getTime());
          done();
        });
    });

    test('Required fields filled in', function (done) {
      chai
        .request(server)
        .post(url)
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Required fields filled in',
          assigned_to: '',
          status_text: '',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(
            res.body.created_by,
            'Functional Test - Required fields filled in'
          );
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.isNumber(new Date(res.body.created_on).getTime());
          assert.isNumber(new Date(res.body.updated_on).getTime());
          done();
        });
    });

    test('Missing required fields', function (done) {
      chai
        .request(server)
        .post(url)
        .send({
          issue_title: '',
          issue_text: '',
          created_by: '',
          assigned_to: 'Mocha and Chai',
          status_text: '',
        })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.body.error, 'Missing required fields');
          done();
        });
    });
  });

  suite('PUT /api/issues/{project} => text', function () {
    test('No body', function (done) {
      chai
        .request(server)
        .put(url)
        .send({
          _id: '5ef4ae49777dfd8beca80bfd',
          issue_title: '',
          issue_text: '',
          created_by: '',
          assigned_to: '',
          status_text: '',
          closed: '',
        })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.body.error, 'no updated field sent');
          done();
        });
    });

    test('One field to update', function (done) {
      chai
        .request(server)
        .put(url)
        .send({
          _id: '5ef4ae49777dfd8beca80bfd',
          issue_title: '',
          issue_text: 'One field to update',
          created_by: '',
          assigned_to: '',
          status_text: '',
          closed: '',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.status, 'successfully updated');
          done();
        });
    });

    test('Multiple fields to update', function (done) {
      chai
        .request(server)
        .put(url)
        .send({
          _id: '5ef4ae49777dfd8beca80bfd',
          issue_title: '',
          issue_text: 'Multiple fields to update',
          created_by: '',
          assigned_to: 'Mocha and Chai',
          status_text: 'Updated',
          closed: '',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.status, 'successfully updated');
          done();
        });
    });

    test('Wrong _id - could not update _id', (done) => {
      chai
        .request(server)
        .put(url)
        .send({
          _id: '5ef4ab9c0bdfbc8b7d44a138',
          issue_title: '',
          issue_text: '',
          created_by: '',
          assigned_to: '',
          status_text: '',
          closed: 'true',
        })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(
            res.body.error,
            'could not update 5ef4ab9c0bdfbc8b7d44a138'
          );
          done();
        });
    });
  });

  suite(
    'GET /api/issues/{project} => Array of objects with issue data',
    function () {
      test('No filter', function (done) {
        chai
          .request(server)
          .get(url)
          .query({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach((obj) => {
              assert.property(obj, 'issue_title');
              assert.property(obj, 'issue_text');
              assert.property(obj, 'created_on');
              assert.property(obj, 'updated_on');
              assert.property(obj, 'created_by');
              assert.property(obj, 'assigned_to');
              assert.property(obj, 'open');
              assert.property(obj, 'status_text');
              assert.property(obj, '_id');
            });
            done();
          });
      });

      test('One filter', function (done) {
        chai
          .request(server)
          .get(url)
          .query({ assigned_to: 'Chai and Mocha' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach((obj) => {
              assert.property(obj, 'issue_title');
              assert.property(obj, 'issue_text');
              assert.property(obj, 'created_on');
              assert.property(obj, 'updated_on');
              assert.property(obj, 'created_by');
              assert.property(obj, 'assigned_to');
              assert.property(obj, 'open');
              assert.property(obj, 'status_text');
              assert.property(obj, '_id');
              assert.propertyVal(obj, 'assigned_to', 'Chai and Mocha');
            });
            done();
          });
      });

      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function (done) {
        chai
          .request(server)
          .get(url)
          .query({ assigned_to: 'Chai and Mocha', open: false })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach((obj) => {
              assert.property(obj, 'issue_title');
              assert.property(obj, 'issue_text');
              assert.property(obj, 'created_on');
              assert.property(obj, 'updated_on');
              assert.property(obj, 'created_by');
              assert.property(obj, 'assigned_to');
              assert.property(obj, 'open');
              assert.property(obj, 'status_text');
              assert.property(obj, '_id');
              assert.propertyVal(obj, 'assigned_to', 'Chai and Mocha');
              assert.propertyVal(obj, 'open', false);
            });
            done();
          });
      });
    }
  );

  suite('DELETE /api/issues/{project} => text', function () {
    test('No _id', function (done) {
      chai
        .request(server)
        .delete(url)
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.body.error, '_id error');
          done();
        });
    });

    test('Valid _id', function (done) {
      chai
        .request(server)
        .delete(url)
        .send({
          _id: '5ef60f4db2b3ddabafa5f3ff',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.success, 'deleted 5ef60f4db2b3ddabafa5f3ff');
          done();
        });
    });

    test('Wrong _id - could not delete _id', (done) => {
      chai
        .request(server)
        .delete(url)
        .send({
          _id: '5aa0ae49777dfd8beca80bfe',
        })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(
            res.body.error,
            'could not delete 5aa0ae49777dfd8beca80bfe'
          );
          done();
        });
    });
  });
});
