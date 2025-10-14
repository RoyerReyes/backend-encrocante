import * as UserModel from '../models/usuario.js';

// Listar todos los usuarios
export const listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await UserModel.getAll();
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

// Obtener un usuario por ID
export const obtenerUsuario = async (req, res, next) => {
  try {
    const usuario = await UserModel.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

// Actualizar un usuario
export const actualizarUsuario = async (req, res, next) => {
  try {
    const { nombre, usuario, rol } = req.body;
    const result = await UserModel.update(req.params.id, { nombre, usuario, rol });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado correctamente ✅' });
  } catch (error) {
    next(error);
  }
};

// Eliminar un usuario
export const eliminarUsuario = async (req, res, next) => {
  try {
    const result = await UserModel.remove(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente 🗑️' });
  } catch (error) {
    next(error);
  }
};
