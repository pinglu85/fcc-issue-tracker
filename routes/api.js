/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const ObjectId = require('mongodb').ObjectID;

module.exports = (app, db) => {
  app
    .route('/api/issues/:project')
    // Get all issues
    .get((req, res, next) => {
      const project = req.params.project;
      const query = {};

      // Convert open value from string to boolean
      for (let key in req.query) {
        if (key === 'open') {
          query.open = req.query.open === 'true' ? true : false;
        } else {
          query[key] = req.query[key];
        }
      }

      db.collection(project)
        .find(query)
        .toArray()
        .then((response) => {
          res.json(response);
        })
        .catch((err) => {
          next(err);
        });
    })
    // Post a issue
    .post((req, res, next) => {
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        return next({
          status: 400,
          message: 'Missing required fields',
        });
      }
      const project = req.params.project;
      const currentDate = new Date();
      db.collection(project)
        .insertOne(
          {
            _id: ObjectId(),
            issue_title: issue_title,
            issue_text: issue_text,
            created_on: currentDate,
            updated_on: currentDate,
            created_by: created_by,
            assigned_to: assigned_to,
            open: true,
            status_text: status_text,
          },
          {
            writeConcern: {
              w: 'majority',
              j: true,
              wtimeout: 1000,
            },
          }
        )
        .then((result) => {
          res.json(result.ops[0]);
        })
        .catch((err) => {
          next(err);
        });
    })
    // Update a issue
    .put((req, res, next) => {
      const id = req.body._id;
      if (!id) {
        return next({
          status: 400,
          message: 'Missing required fields',
        });
      }

      const update = {};
      let isEmpty = true;

      // Add field as key value pair to the update object if it is not left blank
      for (let key in req.body) {
        if (key !== '_id' && req.body[key] !== '') {
          isEmpty = false;
          if (key === 'closed') {
            update.open = false;
          } else {
            update[key] = req.body[key];
          }
        }
      }

      // Check if all fields are left blank
      if (isEmpty) {
        return next({
          status: 400,
          message: 'no updated field sent',
        });
      }

      update.updated_on = new Date();

      const project = req.params.project;
      const filter = { _id: ObjectId(id) };

      db.collection(project)
        .updateOne(
          filter,
          { $set: { ...update } },
          {
            writeConcern: {
              w: 'majority',
              j: true,
              wtimeout: 1000,
            },
          }
        )
        .then((result) => {
          const { matchedCount, modifiedCount } = result;
          // Check if the id is found
          if (matchedCount && modifiedCount) {
            res.json({ status: 'successfully updated' });
          } else {
            throw new Error();
          }
        })
        .catch((err) => {
          return next({ status: 400, message: `could not update ${id}` });
        });
    })
    // Delete a issue
    .delete(async (req, res, next) => {
      const id = req.body._id;
      if (!id) {
        return next({ status: 400, message: '_id error' });
      }

      const project = req.params.project;

      try {
        const { deletedCount } = await db.collection(project).deleteOne(
          { _id: ObjectId(id) },
          {
            writeConcern: {
              w: 'majority',
              j: true,
              wtimeout: 1000,
            },
          }
        );
        // Check if the id is found
        if (deletedCount) {
          res.json({ success: `deleted ${id}` });
        } else {
          throw new Error();
        }
      } catch (err) {
        next({ status: 400, message: `could not delete ${id}` });
      }
    });
};
