import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';

class BaseController {

    constructor(model, {schema= null, createSchema= null, updateSchema= null, creator= false} = {}) {
        this.model = model;
        this.schema = schema;
        this.createSchema = createSchema;
        this.updateSchema = updateSchema;
        this.creator = creator;
    }

    serialize(record, schema = this.schema) {

        if(!record) return null;
        
        const data = record.toJSON ? record.toJSON() : record;

        if(!schema) return data;

        return schema.parse(data);

    }

    serializeMany(records){

        return records.map(
            record => this.serialize(record)
        );

    }

    // get records
    async get(req, res, next) {

        try {

            const {
                id
            } = req.params;

            // get single record
            if (id) {

                const record = await this.model.findByPk(id);

                if (!record) {

                    throw new AppException(
                        `${this.model.name} not found!`,
                        HTTP_STATUS.HTTP_404_NOT_FOUND
                    );

                }

                return res.status(
                    HTTP_STATUS.HTTP_200_OK.status_code
                ).json(
                    {
                        success: true,
                        message: `${this.model.name} retrieved successfully.`,
                        data: this.serialize(record),
                    }
                );

            }

            // get all the records
            const records = await this.model.findAll({
                order: [
                    ['id', 'DESC']
                ],
            });

            return res.status(
                HTTP_STATUS.HTTP_200_OK.status_code
            ).json({
                success: true,
                message: `${this.model.name}s retrieved successfully.`,
                data: this.serializeMany(records),
            })

        } catch (error) {
            next(error);
        }

    }

    // get a record to use internally in other functions
    async getRecord(req) {
        const { id } = req.params;

        const record = await this.model.findByPk(id);

        if (!record) {
            throw new AppException(
                `${this.model.name} not found!`,
                HTTP_STATUS.HTTP_404_NOT_FOUND
            );
        }

        return record;
    }

    // create a new record
    async create(req, res, next) {

        try {

            const data = { ...req.body };

            if (this.creator) {
                data.creator_id = req.auth.id;
            }

            const record = await this.model.create(data);

            return res.status(
                HTTP_STATUS.HTTP_201_CREATED.status_code
            ).json({
                status: true,
                message: `${this.model.name} created successfully.`,
                data: this.serialize(record, this.createSchema),
            })

        } catch (error) {
            next(error);
        }

    }

    // update a record
    async update(req, res, next) {

        try {

            const record = await this.getRecord(req);

            const data = { ...req.body };

            if (this.creator) {
                data.creator_id = req.auth.id;
            }

            await record.update(data);

            return res.status(
                HTTP_STATUS.HTTP_200_OK.status_code
            ).json({
                status: true,
                message: `${this.model.name} updated successfully.`,
                data: this.serialize(record),
            });

        } catch (e) {
            next(e);
        }

    }

    // delete a record - soft delete
    async delete(req, res, next) {

        try {

            const record = await this.getRecord(req);

            // await record.update({
            //     deleted_at: new Date().toISOString()
            // })
            await record.destroy();

            res.status(
                HTTP_STATUS.HTTP_200_OK.status_code
            ).json({
                status: true,
                message: `${this.model.name} deleted successfully!`,
                // data: this.serialize(record), // do not return deleted user data
            });

        } catch (e) {
            next(e);
        }

    }

    // set status to true or false
    async setStatus(req, res, next) {

        try {

            const {
                status
            } = req.body

            const record = await this.getRecord(req);

            await record.update({
                status,
            })


            return res.status(
                HTTP_STATUS.HTTP_200_OK.status_code
            ).json({
                success: true,
                message: 'Status updated successfully.',
                data: this.serialize(record),
            });

        } catch (error) {

            next(error);

        }
    }

    // set remarks
    async setRemarks(req, res, next) {

        try {

            const {
                remarks
            } = req.body

            const record = await this.getRecord(req);

            await record.update({
                remarks,
            })


            return res.status(
                HTTP_STATUS.HTTP_200_OK.status_code
            ).json({
                success: true,
                message: 'Remarks updated successfully.',
                data: this.serialize(record),
            });

        } catch (error) {

            next(error);

        }
    }

    // set tags
    async setTags(req, res, next) {

        try {

            const {
                tags
            } = req.body

            const record = await this.getRecord(req);

            await record.update({
                tags,
            })


            return res.status(
                HTTP_STATUS.HTTP_200_OK.status_code
            ).json({
                success: true,
                message: 'Tags updated successfully.',
                data: this.serialize(record),
            });

        } catch (error) {

            next(error);

        }
    }

    // remove remarks
    async removeRemarks(req, res, next) {

        try {

            const {
                remarks
            } = req.body

            const record = await this.getRecord(req);

            await record.update({
                remarks: null,
            })


            return res.status(
                HTTP_STATUS.HTTP_200_OK.status_code
            ).json({
                success: true,
                message: 'Remarks updated successfully.',
                data: this.serialize(record),
            });

        } catch (error) {

            next(error);

        }
    }

    // remove tags
    async removeTags(req, res, next) {

        try {

            const record = await this.getRecord(req);

            await record.update({
                tags: null,
            })


            return res.status(
                HTTP_STATUS.HTTP_200_OK.status_code
            ).json({
                success: true,
                message: 'Tags updated successfully.',
                data: this.serialize(record),
            });

        } catch (error) {

            next(error);

        }
    }

}

export default BaseController;