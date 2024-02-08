import Joi from "joi";
import { UserRole } from "src/utils/type";

export const depositSchema = Joi.object({
    username: Joi.string().min(1).max(64).required(),
    password: Joi.string().min(8).max(24).required(),
    role: Joi.string().valid(Object.values(UserRole)),
});
