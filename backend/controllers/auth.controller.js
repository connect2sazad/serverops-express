import bcrypt from "bcryptjs";

import AppException from "../exceptions/exception.js";
import HTTP_STATUS from "../exceptions/status_codes.js";
import User from "../models/user.model.js";
import { UserCreateSchema, UserSchema } from "../schemas/user.schema.js";
import { loginSchema } from "../schemas/auth.schema.js";
import { generate } from "../middlewares/auth.middleware.js";
import TokenBlacklist from "../models/token-blacklist.model.js";

export class AuthController {

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

            if (existingEmailUser) {
                throw new AppException(
                    'Email already exists!',
                    HTTP_STATUS.HTTP_409_CONFLICT
                );
            }

            if (existingUseridUser) {
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

    async login(req, res, next) {

        try {


            const {
                userid,
                password
            } = loginSchema.parse(req.body);

            // find user record by userid such that it is not deleted
            const user = await User.findOne({
                where: {
                    userid,
                    deleted_at: null
                }
            });

            // user not found
            if (!user) {
                throw new AppException(
                    `No such user with userid '${userid}' found!`,
                    HTTP_STATUS.HTTP_404_NOT_FOUND
                );
            }

            // check whether user is disabled
            if (!user.status) {
                throw new AppException(
                    `Userid '${userid}' has been disabled!`,
                    HTTP_STATUS.HTTP_401_UNAUTHORIZED,
                );
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                throw new AppException(
                    `Invalid Userid or Password.`,
                    HTTP_STATUS.HTTP_401_UNAUTHORIZED,
                );
            }

            const userData = UserSchema.parse(user.toJSON());

            const tokend = generate({
                id: userData.id,
                userid: userData.userid,
                email: userData.email
            });

            return res.status(
                HTTP_STATUS.HTTP_200_OK.status_code
            ).json({
                status: true,
                message: 'Login successful',
                data: userData,
                token: tokend
            });

        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {

        try {

            // get token
            const token = req.token;

            // if token is not present throw error
            if (!token) {
                throw new AppException(
                    'Authentication token is required.',
                    HTTP_STATUS.HTTP_401_UNAUTHORIZED
                );
            }

            // check if same token is avaialbe in black list
            const existingToken = await TokenBlacklist.findOne({
                where: {
                    token,
                },
            });

            if(!existingToken){

                // jwt expiration timestamp
                const expiresAt = new Date(
                    req.auth.exp * 1000
                );

                await TokenBlacklist.create({
                    token,
                    user_id: req.auth.id,
                    expires_at: expiresAt,
                });

                return res.status(
                    HTTP_STATUS.HTTP_200_OK.status_code
                ).json({
                    status: true,
                    message: "Logout Successful!"
                });
            }

        } catch (e) {
            next(e);
        }

    }

}

const auth_controller = new AuthController();

export default auth_controller;