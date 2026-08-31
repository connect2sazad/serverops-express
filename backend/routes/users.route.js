import express from 'express';

import user_controller from '../controllers/user.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/authorize.middleware.js';
import { UserUpdateSchema } from '../schemas/user.schema.js';

const router = express.Router();
const PREFIX = '/users';

// string routes
const USERS = PREFIX;
const USER_ID = PREFIX + '/:id';
const USER_SELF = PREFIX + '/self';
const USER_ID_ENABLE = PREFIX + '/:id/enable';
const USER_ID_DISABLE = PREFIX + '/:id/disable';
const USER_ID_REMARKS = PREFIX + '/:id/remarks';
const USER_ID_TAGS = PREFIX + '/:id/tags';
const USER_ID_REMOVE_REMARKS = PREFIX + '/:id/remarks/remove';
const USER_ID_REMOVE_TAGS = PREFIX + '/:id/tags/remove';

// get all users
router.get(USERS, authenticate, authorizeRoles('admin'), async (req, res, next) => {

  await user_controller.get(req, res, next);

});

// get current user details
router.get(USER_SELF, authenticate, async (req, res, next) => {

  await user_controller.self(req, res, next);

});

// get a single user details by id
router.get(USER_ID, authenticate, authorizeRoles('admin'), async (req, res, next) => {

  await user_controller.get(req, res, next);

});

// update user route
router.put(USER_ID, authenticate, authorizeRoles('admin'), validate(UserUpdateSchema), async (req, res, next) => {

  await user_controller.update(req, res, next);

});

// delete user
router.delete(USER_ID, authenticate, authorizeRoles('admin'), async (req, res, next) => {

  await user_controller.delete(req, res, next);

});

router.put(USER_ID_ENABLE, authenticate, authorizeRoles('admin'), async (req, res, next) => {
  req.body = {
    status: true
  };
  await user_controller.setStatus(req, res, next);
});

router.put(USER_ID_DISABLE, authenticate, authorizeRoles('admin'), async (req, res, next) => {
  req.body = {
    status: false
  };
  await user_controller.setStatus(req, res, next);
});

router.put(USER_ID_REMARKS, authenticate, authorizeRoles('admin'), async (req, res, next) => {

  await user_controller.setRemarks(req, res, next);

});

router.put(USER_ID_TAGS, authenticate, authorizeRoles('admin'), async (req, res, next) => {

  await user_controller.setTags(req, res, next);

});

router.delete(USER_ID_REMOVE_REMARKS, authenticate, authorizeRoles('admin'), async (req, res, next) => {

  await user_controller.removeRemarks(req, res, next);

});

router.delete(USER_ID_REMOVE_TAGS, authenticate, authorizeRoles('admin'), async (req, res, next) => {

  await user_controller.removeTags(req, res, next);

});

export default router;
