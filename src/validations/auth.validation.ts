import Joi from "joi";

const register = Joi.object({
  password: Joi.string().required(),
  device: Joi.string().required(),
});

const login = Joi.object({
  id: Joi.string().required(),
  password: Joi.string().required(),
  device: Joi.string().required(),
});

const refreshToken = Joi.object({
  refreshToken: Joi.string().required(),
});

const logout = Joi.object({
  device: Joi.string().required(),
});

export default {
  register,
  login,
  refreshToken,
  logout,
};
