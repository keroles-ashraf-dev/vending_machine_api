import Joi from "joi";

export const buySchema = Joi.object({
    product_id: Joi.number().required(),
    amount: Joi.number().integer().positive().required(),
});