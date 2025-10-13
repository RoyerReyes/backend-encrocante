import db from "../config/db.js";

// Obtener todos los platillos
export const getAllPlatillos = async () => {
  const [rows] = await db.promise().query("SELECT * FROM platillos");
  return rows;
};

// Obtener platillo por ID
export const getPlatilloById = async (id) => {
  const [rows] = await db.promise().query("SELECT * FROM platillos WHERE id = ?", [id]);
  return rows[0];
};

// Crear platillo
export const createPlatillo = async ({ nombre, precio, categoria_id, activo }) => {
  const [result] = await db.promise().query(
    "INSERT INTO platillos (nombre, precio, categoria_id, activo) VALUES (?, ?, ?, ?)",
    [nombre, precio, categoria_id, activo]
  );
  // Devolvemos el objeto creado con su ID
  return { id: result.insertId, nombre, precio, categoria_id, activo };
};

// Actualizar platillo
export const updatePlatillo = async (id, data) => {
  const [result] = await db.promise().query("UPDATE platillos SET ? WHERE id = ?", [data, id]);
  return result;
};

// Eliminar platillo
export const deletePlatillo = async (id) => {
  const [result] = await db.promise().query("DELETE FROM platillos WHERE id = ?", [id]);
  return result;
};
