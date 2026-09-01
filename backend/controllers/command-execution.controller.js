import BaseController from './base.controller.js';
import { Inventory, User, Credential, CommandExecution, ManagedCommand } from '../models/index.js';
import AppException from '../exceptions/exception.js';
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
                },
                {
                    model: ManagedCommand,
                    as: 'managed_command',
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
            inventory.last_connected_at = new Date(connection.metadata.startedAt);

            const message = `command executed${connection.commandStatus === "success" ? ' successfully' : ''}`

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

    async executeManagedCommand(req, res, next) {
        try {

            const { id, managed_command_id } = req.params;

            const inventory = await Inventory.findOne({
                where: {
                    id,
                    deleted_at: null,
                }
            });

            if (!inventory) {
                throw new AppException(
                    'Inventory not found!',
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            if (!inventory.status) {
                throw new AppException(
                    'Inventory has been disabled',
                    HTTP_STATUS.HTTP_403_FORBIDDEN
                );
            }

            const credential = await Credential.findOne({
                where: {
                    id,
                    deleted_at: null,
                }
            });

            if (!credential) {
                throw new AppException(
                    'Credential not found!',
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            if (!credential.status) {
                throw new AppException(
                    'Credential has been disabled',
                    HTTP_STATUS.HTTP_403_FORBIDDEN
                );
            }

            const managedCommand = await ManagedCommand.findOne({
                where: {
                    id: managed_command_id,
                    inventory_id: inventory.id,
                    deleted_at: null,
                }
            });

            if (!managedCommand) {
                throw new AppException(
                    'Credential not found!',
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            if (!managedCommand.status) {
                throw new AppException(
                    'Credential has been disabled',
                    HTTP_STATUS.HTTP_403_FORBIDDEN
                );
            }

            const connection = await command_service.execute(
                inventory, credential, managedCommand.command, managedCommand.timeout_seconds
            );

            inventory.connection_status = 'disconnected';
            inventory.last_connected_at = new Date(connection.metadata.startedAt);
            await inventory.save();

            const messages = {
                success: 'Managed Command executed successfully.',
                failed: 'Managed Command execution failed.',
                timeout: 'Managed Command execution timed out.',
            }

            const message = messages[connection.commandStatus] ?? 'Managed Command execution finished.';

            const execution = await CommandExecution.create({
                inventory_id: inventory.id,
                credential_id: credential.id,
                managed_command_id: managedCommand.id,
                creator_id: req.auth.id,

                command: managedCommand.command,

                stdout: connection.stdout,
                stderr: connection.stderr,
                exit_code: connection.exitCode,
                command_status: connection.commandStatus,

                duration: connection.metadata.duration,
                started_at: new Date(connection.metadata.startedAt),
                finished_at: new Date(connection.metadata.startedAt + connection.metadata.duration),
                remarks: message,
                tags: [
                    'managed-command',
                    managedCommand.name,
                    managedCommand.command,
                    inventory.hostname,
                    credential.username,
                    connection.commandStatus
                ],
            });

            await execution.reload({
                include: this.includes,
            });

            return res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                success: true,
                message,
                data: {
                    connection,
                    execution: this.serialize(execution),
                }
            });

        } catch (e) {

            next(e);

        }
    }

}

const command_controller = new CommandController();

export default command_controller;