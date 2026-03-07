import usuarioService from "../services/usuarioService.js";

// Listar todos los usuarios
export const listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

// Obtener un usuario por ID
export const obtenerUsuario = async (req, res, next) => {
  try {
    const usuario = await usuarioService.obtenerUsuario(req.params.id);
    res.json(usuario);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json(error);
    next(error);
  }
};

// Actualizar un usuario
export const actualizarUsuario = async (req, res, next) => {
  try {
    const result = await usuarioService.actualizarUsuario(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json(error);
    next(error);
  }
};

// Eliminar un usuario
export const eliminarUsuario = async (req, res, next) => {
  try {
    const result = await usuarioService.eliminarUsuario(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json(error);
    next(error);
  }
};
