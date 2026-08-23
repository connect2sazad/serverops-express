import bcrypt from "bcryptjs";

import AppException from "../exceptions/exception.js";
import HTTP_STATUS from "../exceptions/status_codes.js";
import User from "../models/user.model.js";
import { UserCreateSchema } from "../schemas/user.schema.js";

export class AuthController{

    async register(req, res, next) {

        try {

            const {
                userid,
                name,
                email,
                password,
                confirm_password
            } = req.body;

            const existingEmailUser = await User.findOne({
                where: {
                    email,
                }
            });

            const existingUseridUser = await User.findOne({
                where: {
                    userid,
                }
            });

            if(existingEmailUser){
                throw new AppException(
                    'Email already exists!',
                    HTTP_STATUS.HTTP_409_CONFLICT
                );
            }

            if(existingUseridUser){
                throw new AppException(
                    'Userid already exists!',
                    HTTP_STATUS.HTTP_409_CONFLICT
                );
            }

            var hashed_password = await bcrypt.hash(password, 12);

            const user = await User.create({
                userid,
                email,
                name,
                password: hashed_password
            });

            return res.status(
                HTTP_STATUS.HTTP_201_CREATED.status_code
            ).json({
                status: true,
                message: `${User.name} registered successfully.`,
                data: UserCreateSchema.parse(user.toJSON()),
            })

        } catch (error) {
            next(error);
        }

    }

    async login(req, res, next){
        
        const {
            userid,
            password
        } = req.body;

        if(!userid || !password){
            throw new AppException(
                'Userid and Password are required to login.',
                HTTP_STATUS.HTTP_400_BAD_REQUEST
            )
        }

        const user = await User.findOne({
            where: {
                userid,
                deleted_at: null
            }
        });

        if(!user){
            throw new AppException(
                `No such user with userid '${userid}' found!`,
                HTTP_STATUS.HTTP_404_NOT_FOUND
            )
        }

        if(!user.status){
            throw new AppException(
                `Userid '${userid}' has been disabled!`,
                HTTP_STATUS.HTTP_401_UNAUTHORIZED,
            )
        }

        const login = await bcrypt.compare(password, user.password);

        if(!login){

        }

    }

}

const auth_controller = new AuthController();

export default auth_controller;