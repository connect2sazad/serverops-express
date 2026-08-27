import express from 'express';

import inventory_controller from '../controllers/inventory.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { InventoryCreateSchema, InventoryUpdateSchema } from '../schemas/inventory.schema.js';

const router = express.Router();
const PREFIX = '/inventories';

// string routes
const INVENTORIES = PREFIX;
const INVENTORY_ID = PREFIX + '/:id';
const INVENTORY_ID_ENABLE = PREFIX + '/:id/enable';
const INVENTORY_ID_DISABLE = PREFIX + '/:id/disable';
const INVENTORY_ID_REMARKS = PREFIX + '/:id/remarks';
const INVENTORY_ID_TAGS = PREFIX + '/:id/tags';
const INVENTORY_ID_REMOVE_REMARKS = PREFIX + '/:id/remarks/remove';
const INVENTORY_ID_REMOVE_TAGS = PREFIX + '/:id/tags/remove';

// string routes fore credentials
const INVENTORY_ID_CREDENTIALS = PREFIX + '/:id/credentials';

// string routes for ssh
const INVENTORY_ID_HOST_KEY = PREFIX + '/:id/host-key';
const INVENTORY_ID_HOST_KEY_TRUST = PREFIX + '/:id/host-key/trust';
const INVENTORY_ID_TEST_CONNECTION = PREFIX + '/:id/test-connection';
const INVENTORY_ID_DISCOVER = PREFIX + '/:id/discover';

// get all inventories
router.get(INVENTORIES, authenticate, async (req, res, next) => {

  await inventory_controller.get(req, res, next);

});

// get a single inventory details by id
router.get(INVENTORY_ID, authenticate, async (req, res, next) => {

  await inventory_controller.get(req, res, next);

});

// create a inventory
router.post(INVENTORIES, authenticate, validate(InventoryCreateSchema), async (req, res, next) => {

  await inventory_controller.create(req, res, next);

});

// update a inventory
router.put(INVENTORY_ID, authenticate, validate(InventoryUpdateSchema), async (req, res, next) => {

  await inventory_controller.update(req, res, next);

});

// delete user role
router.delete(INVENTORY_ID, authenticate, async (req, res, next) => {

  await inventory_controller.delete(req, res, next);

});

// enable user role
router.put(INVENTORY_ID_ENABLE, authenticate, async (req, res, next) => {
  req.body = {
    status: true
  };
  await inventory_controller.setStatus(req, res, next);
});

// disable user role
router.put(INVENTORY_ID_DISABLE, authenticate, async (req, res, next) => {
  req.body = {
    status: false
  };
  await inventory_controller.setStatus(req, res, next);
});

// update user role remarks
router.put(INVENTORY_ID_REMARKS, authenticate, async (req, res, next) => {

    await inventory_controller.setRemarks(req, res, next);

});

// update user role tags
router.put(INVENTORY_ID_TAGS, authenticate, async (req, res, next) => {

    await inventory_controller.setTags(req, res, next);

});

// remove user role remarks
router.delete(INVENTORY_ID_REMOVE_REMARKS, authenticate, async (req, res, next) => {

    await inventory_controller.removeRemarks(req, res, next);

});

// remove user role tags
router.delete(INVENTORY_ID_REMOVE_TAGS, authenticate, async (req, res, next) => {

    await inventory_controller.removeTags(req, res, next);

});

// ================================Credentials================================
// show all associated credentials
router.get(INVENTORY_ID_CREDENTIALS, authenticate, async (req, res, next) => {
  await inventory_controller.inventoryCredentials(req, res, next);
});

// ================================SSH================================
// host key
router.get(INVENTORY_ID_HOST_KEY, authenticate, async (req, res, next) => {
  await inventory_controller.hostKey(req, res, next);
});

// host key trust
router.get(INVENTORY_ID_HOST_KEY_TRUST, authenticate, async (req, res, next) => {
  await inventory_controller.hostKeyTrust(req, res, next);
});

// test ssh connection
router.get(INVENTORY_ID_TEST_CONNECTION, authenticate, async (req, res, next) => {
  await inventory_controller.testConnection(req, res, next);
});

// discovery
router.get(INVENTORY_ID_DISCOVER, authenticate, async (req, res, next) => {
  await inventory_controller.discover(req, res, next);
});

export default router;