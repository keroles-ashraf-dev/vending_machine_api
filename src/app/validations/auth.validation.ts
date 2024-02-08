import Joi from "joi";

export const loginSchema = Joi.object({
    username: Joi.string().min(1).max(64).required(),
    password: Joi.string().min(8).max(24).required(),
});

export const refreshTokenSchema = Joi.object({
    refresh_token: Joi.string().min(24).max(64),
});