import AppException from "../exceptions/exception.js";
import HTTP_STATUS from "../exceptions/status_codes.js";
import { Inventory, Credential, CommandExecution } from "../models/index.js";
import service_service from "../services/service.service.js";

class ServiceController {

    async init(req) {

        const { id } = req.params;

        const inventory = await Inventory.findOne({
            where: {
                id,
                deleted_at: null,
            },
        });

        if (!inventory) {
            throw new AppException(
                "No inventory found!",
                HTTP_STATUS.HTTP_404_NOT_FOUND
            );
        }

        const credential = await Credential.findOne({
            where: {
                inventory_id: id,
                deleted_at: null
            }
        });

        if (!credential) {
            throw new AppException(
                "No credential found for the inventory!",
                HTTP_STATUS.HTTP_404_NOT_FOUND
            );
        };

        return {
            inventory,
            credential
        }

    }

    async getAll(req, res, next) {

        try {

            const { inventory, credential } = await this.init(req);

            const services = await service_service.getServices(inventory, credential);

            // get the connection details and save in inventory
            inventory.connection_status = 'disconnected';
            inventory.last_connected_at = services.metadata.startedAt;
            await inventory.save();

            return res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                message: "Services retrieved successfully!",
                status: true,
                data: services
            });

        } catch (e) {

            next(e);

        }

    }

    async get(req, res, next) {

        try {

            const { inventory, credential } = await this.init(req);
            const { service } = req.params;

            const service_response = await service_service.getService(inventory, credential, service);

            // get the connection details and save in inventory
            inventory.connection_status = 'disconnected';
            inventory.last_connected_at = service_response.metadata.startedAt;
            await inventory.save();

            return res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                message: "Service retrieved successfully!",
                status: true,
                data: service_response
            });

        } catch (e) {

            next(e);

        }

    }

    async service_action(req, res, next, action) {

        try {

            const { id, service } = req.params;
            const { inventory, credential } = await this.init(req);

            const result = await service_service.service_action(
                inventory,
                credential,
                service,
                action
            );

            // get the connection details and save in inventory
            inventory.connection_status = 'disconnected';
            inventory.last_connected_at = result.metadata.startedAt;
            
            const message =
                    result.commandStatus === 'success'
                        ? `Service ${action}-ed successfully!`
                        : `Service ${action} failed!`;


            // save the command
            await CommandExecution.create({
                inventory_id: inventory.id,
                credential_id: credential.id,
                creator_id: req.auth.id,

                command: result.command,

                stdout: result.stdout,
                stderr: result.stderr,

                exit_code: result.exitCode,
                command_status: result.commandStatus,

                duration: result.metadata.duration,

                remarks: message,
                tags: [service, inventory.hostname, credential.username, message],

                started_at: new Date(result.metadata.startedAt),
                finished_at: new Date(
                    result.metadata.startedAt + result.metadata.duration
                ),
            });

            return res.status(
                HTTP_STATUS.HTTP_200_OK.status_code
            ).json({
                success: result.commandStatus === 'success',
                message,
                data: result,
            });

        } catch (e) {

            next(e);

        }

    }

}

const service_controller = new ServiceController();
export default service_controller;