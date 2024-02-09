import Joi from "joi";

export const createSchema = Joi.object({
    coin: Joi.number().positive().optional(),
    coins: Joi.array().items(Joi.number().positive()).unique().optional(),
});