import BaseController from './base.controller.js';
import { Inventory, User, Credential } from '../models/index.js';
import { InventoryCreateSchema, InventorySchema, InventoryUpdateSchema } from '../schemas/inventory.schema.js';
import HTTP_STATUS from '../exceptions/status_codes.js';
import ssh_service from '../services/ssh.service.js';

export class InventoryController extends BaseController {

    constructor() {

        super(Inventory, {
            schema: InventorySchema,
            createSchema: InventoryCreateSchema,
            updateSchema: InventoryUpdateSchema,
            creator: true,
            includes: [
                {
                    model: User,
                    as: 'creator',
                }
            ],
        });
    }

    async testConnection(req, res, next) {

        try {

            const { id } = req.params

            const inventory = await Inventory.findOne({
                where: {
                    id,
                    deleted_at: null
                }
            });

            const credential = await Credential.findOne({
                where: {
                    inventory_id: inventory.id,
                    deleted_at: null
                }
            });

            const connection = await ssh_service.testConnection(
                inventory, credential
            );

            res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                success: true,
                message: "connection successfull",
                data: {
                    connection,
                    inventory,
                    credential
                }
            });

        } catch (e) {
            next(e);
        }

    }

}

const inventory_controller = new InventoryController();

export default inventory_controller;