import express from 'express';

import user_role_controller from '../controllers/user_role.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { UserRoleCreateSchema, UserRoleUpdateSchema } from '../schemas/user-role.schema.js';

const router = express.Router();
const PREFIX = '/user-roles';

// string routes
const USERROLES = PREFIX;
const USERROLE_ID = PREFIX + '/:id';
const USERROLE_ID_ENABLE = PREFIX + '/:id/enable';
const USERROLE_ID_DISABLE = PREFIX + '/:id/disable';
const USERROLE_ID_REMARKS = PREFIX + '/:id/remarks';
const USERROLE_ID_TAGS = PREFIX + '/:id/tags';
const USERROLE_ID_REMOVE_REMARKS = PREFIX + '/:id/remarks/remove';
const USERROLE_ID_REMOVE_TAGS = PREFIX + '/:id/tags/remove';

// get all user roles
router.get(USERROLES, authenticate, async (req, res, next) => {

  await user_role_controller.get(req, res, next);

});

// get a single user role details by id
router.get(USERROLE_ID, authenticate, async (req, res, next) => {

  await user_role_controller.get(req, res, next);

});

// create a user role
router.post(USERROLES, authenticate, validate(UserRoleCreateSchema), async (req, res, next) => {

  await user_role_controller.create(req, res, next);

});

// update user role route
router.put(USERROLE_ID, authenticate, validate(UserRoleUpdateSchema), async (req, res, next) => {

  await user_role_controller.update(req, res, next);

});

// ==================================
// delete user role
router.delete(USERROLE_ID, authenticate, async (req, res, next) => {

  await user_role_controller.delete(req, res, next);

});

// enable user role
router.put(USERROLE_ID_ENABLE, authenticate, async (req, res, next) => {
  req.body = {
    status: true
  };
  await user_role_controller.setStatus(req, res, next);
});

// disable user role
router.put(USERROLE_ID_DISABLE, authenticate, async (req, res, next) => {
  req.body = {
    status: false
  };
  await user_role_controller.setStatus(req, res, next);
});

// update user role remarks
router.put(USERROLE_ID_REMARKS, authenticate, async (req, res, next) => {

  await user_role_controller.setRemarks(req, res, next);

});

// update user role tags
router.put(USERROLE_ID_TAGS, authenticate, async (req, res, next) => {

  await user_role_controller.setTags(req, res, next);

});

// remove user role remarks
router.delete(USERROLE_ID_REMOVE_REMARKS, authenticate, async (req, res, next) => {

  await user_role_controller.removeRemarks(req, res, next);

});

// remove user role tags
router.delete(USERROLE_ID_REMOVE_TAGS, authenticate, async (req, res, next) => {

  await user_role_controller.removeTags(req, res, next);

});

export default router;