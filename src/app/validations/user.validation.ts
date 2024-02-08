import Joi from "joi";
import { UserRole } from "src/utils/type";

export const createSchema = Joi.object({
    username: Joi.string().min(1).max(64).required(),
    password: Joi.string().min(8).max(24).required(),
    role: Joi.string().valid(Object.values(UserRole)),
});

export const updateSchema = Joi.object({
    username: Joi.string().min(1).max(64).optional(),
    password: Joi.string().min(8).max(24).optional(),
});

export const deleteSchema = Joi.object({
    password: Joi.string().min(8).max(24).required(),
});