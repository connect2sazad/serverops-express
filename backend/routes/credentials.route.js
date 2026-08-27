import express from 'express';

import credential_controller from '../controllers/credential.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import { CredentialCreateSchema, CredentialUpdateSchema } from '../schemas/credential.schema.js';

const router = express.Router();
const PREFIX = '/credentials';

// string routes
const CREDENTIALS = PREFIX;
const CREDENTIAL_ID = PREFIX + '/:id';
const CREDENTIAL_ID_ENABLE = PREFIX + '/:id/enable';
const CREDENTIAL_ID_DISABLE = PREFIX + '/:id/disable';
const CREDENTIAL_ID_REMARKS = PREFIX + '/:id/remarks';
const CREDENTIAL_ID_TAGS = PREFIX + '/:id/tags';
const CREDENTIAL_ID_REMOVE_REMARKS = PREFIX + '/:id/remarks/remove';
const CREDENTIAL_ID_REMOVE_TAGS = PREFIX + '/:id/tags/remove';

// get all credentials
router.get(CREDENTIALS, authenticate, async (req, res, next) => {

  await credential_controller.get(req, res, next);

});

// get a single credential details by id
router.get(CREDENTIAL_ID, authenticate, async (req, res, next) => {

  await credential_controller.get(req, res, next);

});

// create a credential
router.post(CREDENTIALS, authenticate, upload.single('private_key'), validate(CredentialCreateSchema), async (req, res, next) => {

  await credential_controller.create(req, res, next);

});

// update a credential
router.put(CREDENTIAL_ID, authenticate, upload.single('private_key'), validate(CredentialUpdateSchema), async (req, res, next) => {

  await credential_controller.update(req, res, next);

});

// enable credential
router.put(CREDENTIAL_ID_ENABLE, authenticate, async (req, res, next) => {
  req.body = {
    status: true
  };
  await credential_controller.setStatus(req, res, next);
});

// disable credential
router.put(CREDENTIAL_ID_DISABLE, authenticate, async (req, res, next) => {
  req.body = {
    status: false
  };
  await credential_controller.setStatus(req, res, next);
});

// delete credential
router.delete(CREDENTIAL_ID, authenticate, async (req, res, next) => {

  await credential_controller.delete(req, res, next);

});

// update credential remarks
router.put(CREDENTIAL_ID_REMARKS, authenticate, async (req, res, next) => {

    await credential_controller.setRemarks(req, res, next);

});

// update user role tags
router.put(CREDENTIAL_ID_TAGS, authenticate, async (req, res, next) => {

    await credential_controller.setTags(req, res, next);

});

// remove credential remarks
router.delete(CREDENTIAL_ID_REMOVE_REMARKS, authenticate, async (req, res, next) => {

    await credential_controller.removeRemarks(req, res, next);

});

// remove credential tags
router.delete(CREDENTIAL_ID_REMOVE_TAGS, authenticate, async (req, res, next) => {

    await credential_controller.removeTags(req, res, next);

});

export default router;