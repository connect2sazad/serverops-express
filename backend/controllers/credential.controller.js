import BaseController from './base.controller.js';
import { Credential, User, Inventory } from '../models/index.js';
import { CredentialSchema, CredentialCreateSchema, CredentialUpdateSchema } from '../schemas/credential.schema.js';
import HTTP_STATUS from '../exceptions/status_codes.js';
import AppException from '../exceptions/exception.js';

class CredentialController extends BaseController {

    constructor() {

        const settings = {
            schema: CredentialSchema,
            createSchema: CredentialCreateSchema,
            updateSchema: CredentialUpdateSchema,
            creator: true,
            includes: [
                {
                    model: User,
                    as: 'creator',
                },
                {
                    model: Inventory,
                    as: 'inventory',
                }
            ],
        }

        super(Credential, settings);
    }

    async create(req, res, next) {

        try {

            const data = this.createSchema.parse(req.body);

            if (data.type === 'private-key' && !req.file) {
                throw new AppException(
                    'Private Key file is required for private-key credentials.',
                    HTTP_STATUS.HTTP_400_BAD_REQUEST
                );
            }

            if (data.type === 'password' && req.file) {
                throw new AppException(
                    'Private Key file is not allowed for password credentials.',
                    HTTP_STATUS.HTTP_400_BAD_REQUEST
                );
            }

            let secret = data.secret ?? null;

            if (data.type === 'private-key') {
                secret = req.file.buffer.toString('utf8');
            }

            const credential = await Credential.create({
                inventory_id: data.inventory_id,
                username: data.username,
                type: data.type,
                secret,
                passphrase: data.passphrase ?? null,
                creator_id: req.auth.id
            });

            await credential.reload({
                include: this.includes,
            });

            return res.status(HTTP_STATUS.HTTP_201_CREATED.status_code).json({
                success: true,
                message: 'Credential created successfully!',
                data: this.schema.parse(credential.toJSON()),
            });

        } catch (e) {
            next(e);
        }

    }

    // update credential
    async update(req, res, next) {

        try {

            const data = this.updateSchema.parse(req.body);

            const credential = await Credential.findOne({
                where: {
                    id: req.params.id,
                    deleted_at: null
                }
            });

            if (!credential) {
                throw new AppException(
                    'Credential not found!',
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            const updated_credential = await credential.update(data);

            await updated_credential.reload({
                include: this.includes,
            });

            return res.status(HTTP_STATUS.HTTP_200_OK.status_code).json({
                success: true,
                message: 'Credential updated successfully!',
                data: this.schema.parse(updated_credential.toJSON()),
            });

        } catch (e) {
            next(e);
        }

    }

}

const credential_controller = new CredentialController();

export default credential_controller;