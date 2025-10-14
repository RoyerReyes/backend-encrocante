import db from "../config/db.js";
import bcrypt from "bcrypt";

// Encontrar un usuario por su nombre de usuario
export const findByUsername = async (username) => {
  const [rows] = await db.promise().query(
    "SELECT * FROM usuarios WHERE usuario = ?",
    [username]
  );
  return rows[0];
};

// Encontrar un usuario por su ID
export const findById = async (id) => {
  const [rows] = await db.promise().query(
    "SELECT id, nombre, usuario, rol FROM usuarios WHERE id = ?",
    [id]
  );
  return rows[0];
};

// Obtener todos los usuarios
export const getAll = async () => {
  const [rows] = await db.promise().query("SELECT id, nombre, usuario, rol FROM usuarios");
  return rows;
};

// Crear un nuevo usuario
export const create = async (user) => {
  const { nombre, usuario, password, rol } = user;
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.promise().query(
    "INSERT INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)",
    [nombre, usuario, hashedPassword, rol]
  );
  return { id: result.insertId, ...user };
};

// Actualizar un usuario
export const update = async (id, user) => {
  const { nombre, usuario, rol } = user;
  // Nota: No actualizamos la contraseña aquí por simplicidad.
  // Se podría implementar una ruta específica para cambiar contraseña.
  const [result] = await db.promise().query(
    "UPDATE usuarios SET nombre = ?, usuario = ?, rol = ? WHERE id = ?",
    [nombre, usuario, rol, id]
  );
  return result;
};

// Eliminar un usuario
export const remove = async (id) => {
  const [result] = await db.promise().query("DELETE FROM usuarios WHERE id = ?", [id]);
  return result;
};
