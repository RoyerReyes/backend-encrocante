import authService from "../services/authService.js";

// 📌 Registrar usuario
export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json(error);
    next(error);
  }
};

// 📌 Login usuario
export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json(error);
    next(error);
  }
};
