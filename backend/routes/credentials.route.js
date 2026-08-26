import express from 'express';

import credential_controller from '../controllers/credential.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import { CredentialCreateSchema } from '../schemas/credential.schema.js';

const router = express.Router();
const PREFIX = '/credentials';

// string routes
const CREDENTIALS = PREFIX;
const CREDENTIAL_ID = PREFIX + '/:id';

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

export default router;