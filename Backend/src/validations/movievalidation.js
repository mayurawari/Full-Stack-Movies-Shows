import Joi from "joi";

const movieschema = Joi.object({
  title: Joi.string().required(),
  type: Joi.string().valid("Movie", "TV Show").required(),
  director: Joi.string().required(),
  budget: Joi.string().required(),
  location: Joi.string().required(),
  duration: Joi.string().required(),
  year: Joi.string().required(),
});

export default movieschema;