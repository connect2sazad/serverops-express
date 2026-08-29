import BaseController from './base.controller.js';
import { Inventory, User, Credential, CommandExecution } from '../models/index.js';
import HTTP_STATUS from '../exceptions/status_codes.js';
import command_service from '../services/command.service.js';
import { CommandExecutionResponseSchema, CommandExecutionSchema } from '../schemas/command.schema.js';

export class CommandController extends BaseController {

    constructor() {

        super(CommandExecution, {
            schema: CommandExecutionResponseSchema,
            createSchema: CommandExecutionSchema,
            creator: true,
            includes: [
                {
                    model: User,
                    as: 'creator',
                },
                {
                    model: Credential,
                    as: 'credential',
                },
                {
                    model: Inventory,
                    as: 'inventory',
                }
            ],
        });
    }

    async execute(req, res, next) {
        try {

            const { id } = req.params
            const { command } = req.body;

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

            const connection = await command_service.execute(
                inventory, credential, command
            );

            // get the connection details
            inventory.connection_status = 'disconnected';
            inventory.last_connected_at = connection.metadata.startedAt;

            const message = `command executed${connection.commandStatus==="success" ? ' successfully' : '' }`

            // save the details in db
            await inventory.save();

            await CommandExecution.create({
                inventory_id: inventory.id,
                credential_id: credential.id,
                creator_id: req.auth.id,

                command,

                stdout: connection.stdout,
                stderr: connection.stderr,

                exit_code: connection.exitCode,
                command_status: connection.commandStatus,

                duration: connection.metadata.duration,

                remarks: message,
                tags: ["command", inventory.hostname, credential.username, message],

                started_at: new Date(connection.metadata.startedAt),
                finished_at: new Date(
                    connection.metadata.startedAt + connection.metadata.duration
                )
            });

            res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                success: true,
                message,
                data: {
                    connection
                }
            });

        } catch (e) {
            next(e);
        }
    }

}

const command_controller = new CommandController();

export default command_controller;