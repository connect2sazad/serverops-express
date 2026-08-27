import BaseController from './base.controller.js';
import { Credential, User, Inventory } from '../models/index.js';
import { CredentialSchema, CredentialCreateSchema, CredentialUpdateSchema } from '../schemas/credential.schema.js';
import HTTP_STATUS from '../exceptions/status_codes.js';
import AppException from '../exceptions/exception.js';
import encryptor_service from '../services/encryption.service.js';

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

            let secret = data.secret ?? null;
            let passphrase = data.passphrase ?? null;

            // if type is password, then encrypt the password before storing it in db
            if (data.type === 'password') {
                if (!data.secret) {
                    throw new AppException(
                        'Password is required!',
                        HTTP_STATUS.HTTP_400_BAD_REQUEST
                    );
                }

                secret = encryptor_service.encrypt(data.secret);
            }

            // if type is private-key, then store the private-key path
            if (data.type === 'private-key') {

                if (!req.file) {
                    throw new AppException(
                        'Private Key file is required!',
                        HTTP_STATUS.HTTP_400_BAD_REQUEST
                    );
                }

                secret = req.file.path;

                // encrypt the passphrase
                if (data.passphrase) {
                    passphrase = encryptor_service.encrypt(data.passphrase);
                }
            }

            const credential = await Credential.create({
                inventory_id: data.inventory_id,
                username: data.username,
                type: data.type,
                secret,
                passphrase,
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

            const updateData = {
                ...data,
            };

            console.log("data.type: ", data.type);
            

            // if type is not provided in data, get it from existing credential data
            if(!data.type){
                data.type = credential.type;
            }

            // if type is password, then encrypt the password before storing it in db
            if (data.type === 'password') {
                if (!data.secret) {
                    throw new AppException(
                        'Password is required!',
                        HTTP_STATUS.HTTP_400_BAD_REQUEST
                    );
                }

                updateData.secret = encryptor_service.encrypt(data.secret);
                // set the passphrase to null
                updateData.passphrase = null;
            }

            // If a new private key file is uploaded,
            // replace the secret with the new file path.
            if (data.type === 'private-key') {

                if (req.file) {
                    updateData.secret = req.file.path;
                }

                // encrypt the passphrase
                if (data.passphrase) {
                    updateData.passphrase = encryptor_service.encrypt(data.passphrase);
                }

            }

            // update the current data in db
            const updated_credential = await credential.update(updateData);

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