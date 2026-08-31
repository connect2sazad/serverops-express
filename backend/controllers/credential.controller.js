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
            let passphrase = null;

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

                if (data.secret !== undefined) {
                    throw new AppException(
                        'Please upload a private_key instead of supplying secret!',
                        HTTP_STATUS.HTTP_400_BAD_REQUEST
                    );
                }

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


            // if type is not provided in data, get it from existing credential data
            if (!data.type) {
                data.type = credential.type;
            }

            // if type is password, then encrypt the password before storing it in db
            if (data.type === 'password') {

                // if secret is not provided but the type is changed to password
                if (credential.type !== 'password' && !data.secret) {
                    throw new AppException(
                        'Password is required when switching credential type!',
                        HTTP_STATUS.HTTP_400_BAD_REQUEST
                    );
                }

                // replace existing password
                if(data.secret !== undefined){
                    updateData.secret = encryptor_service.encrypt(data.secret);
                }
                // set the passphrase to null
                updateData.passphrase = null;
            }

            // If a new private key file is uploaded,
            // replace the secret with the new file path.
            if (data.type === 'private-key') {

                //  provide a private key file instead of secret
                if (data.secret !== undefined) {
                    throw new AppException(
                        'Please upload a private_key instead of supplying secret!',
                        HTTP_STATUS.HTTP_400_BAD_REQUEST
                    );
                }

                // checking if there is a private key file not uploaded and db has type password
                if(credential.type !== 'private-key' && !req.file){
                    throw new AppException(
                        'A private key file is required when switching credential type.',
                        HTTP_STATUS.HTTP_400_BAD_REQUEST
                    );
                }

                // delete secret to store the private key path
                delete updateData.secret;

                if (req.file) {
                    updateData.secret = req.file.path;
                }

                // encrypt the passphrase
                if (data.passphrase !== undefined) {
                    updateData.passphrase = data.passphrase
                        ? encryptor_service.encrypt(data.passphrase)
                        : null;
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