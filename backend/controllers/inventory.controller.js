import BaseController from './base.controller.js';
import { Inventory } from '../models/index.js';
import { InventoryCreateSchema, InventorySchema, InventoryUpdateSchema } from '../schemas/inventory.schema.js';

export class InventoryController extends BaseController{

    constructor(){

        super(Inventory, {
            schema: InventorySchema,
            createSchema: InventoryCreateSchema,
            updateSchema: InventoryUpdateSchema,
            creator: true,
        });
    }

}

const inventory_controller = new InventoryController();

export default inventory_controller;