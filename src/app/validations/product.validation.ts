import Joi from "joi";

export const createSchema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    cost: Joi.number().max(10).required(),
    amount_available: Joi.number().max(10).required(),
});

export const getSchema = Joi.object({
    product_id: Joi.number().required(),
});

export const updateSchema = Joi.object({
    product_id: Joi.number().required(),
    name: Joi.string().min(1).max(255).optional(),
    cost: Joi.number().max(10).optional(),
    amount_available: Joi.number().max(10).optional(),
});

export const deleteSchema = Joi.object({
    product_id: Joi.number().required(),
});