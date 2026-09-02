import express from 'express';

import user_role_controller from '../controllers/user_role.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { authorizePermissions, authorizeRoles } from '../middlewares/authorize.middleware.js';
import { UserRoleCreateSchema, UserRoleUpdateSchema } from '../schemas/user-role.schema.js';
import { PERMISSIONS } from '../config/permissions.js';

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
router.get(USERROLES, authenticate, authorizePermissions(PERMISSIONS.USER_ROLES_LIST), async (req, res, next) => {

  await user_role_controller.get(req, res, next);

});

// get a single user role details by id
router.get(USERROLE_ID, authenticate, authorizePermissions(PERMISSIONS.USER_ROLES_READ), async (req, res, next) => {

  await user_role_controller.get(req, res, next);

});

// create a user role
router.post(USERROLES, authenticate, authorizeRoles('admin'), authorizePermissions(PERMISSIONS.USER_ROLES_CREATE), validate(UserRoleCreateSchema), async (req, res, next) => {

  await user_role_controller.create(req, res, next);

});

// update user role route
router.put(USERROLE_ID, authenticate, authorizeRoles('admin'), authorizePermissions(PERMISSIONS.USER_ROLES_UPDATE), validate(UserRoleUpdateSchema), async (req, res, next) => {

  await user_role_controller.update(req, res, next);

});

// ==================================
// delete user role
router.delete(USERROLE_ID, authenticate, authorizeRoles('admin'), authorizePermissions(PERMISSIONS.USER_ROLES_DELETE), async (req, res, next) => {

  await user_role_controller.delete(req, res, next);

});

// enable user role
router.put(USERROLE_ID_ENABLE, authenticate, authorizeRoles('admin'), authorizePermissions(PERMISSIONS.USER_ROLES_STATUS), async (req, res, next) => {
  req.body = {
    status: true
  };
  await user_role_controller.setStatus(req, res, next);
});

// disable user role
router.put(USERROLE_ID_DISABLE, authenticate, authorizeRoles('admin'), authorizePermissions(PERMISSIONS.USER_ROLES_STATUS), async (req, res, next) => {
  req.body = {
    status: false
  };
  await user_role_controller.setStatus(req, res, next);
});

// update user role remarks
router.put(USERROLE_ID_REMARKS, authenticate, authorizeRoles('admin'), authorizePermissions(PERMISSIONS.USER_ROLES_UPDATE), async (req, res, next) => {

  await user_role_controller.setRemarks(req, res, next);

});

// update user role tags
router.put(USERROLE_ID_TAGS, authenticate, authorizeRoles('admin'), authorizePermissions(PERMISSIONS.USER_ROLES_UPDATE), async (req, res, next) => {

  await user_role_controller.setTags(req, res, next);

});

// remove user role remarks
router.delete(USERROLE_ID_REMOVE_REMARKS, authenticate, authorizeRoles('admin'), authorizePermissions(PERMISSIONS.USER_ROLES_UPDATE), async (req, res, next) => {

  await user_role_controller.removeRemarks(req, res, next);

});

// remove user role tags
router.delete(USERROLE_ID_REMOVE_TAGS, authenticate, authorizeRoles('admin'), authorizePermissions(PERMISSIONS.USER_ROLES_UPDATE), async (req, res, next) => {

  await user_role_controller.removeTags(req, res, next);

});

export default router;