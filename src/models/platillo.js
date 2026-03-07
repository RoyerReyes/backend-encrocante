import db from "../config/db.js";

// Obtener todos los platillos
export const getAllPlatillos = async () => {
  const query = `
    SELECT p.*, c.nombre as categoria_nombre 
    FROM platillos p 
    JOIN categorias c ON p.categoria_id = c.id
  `;
  const [rows] = await db.promise().query(query);

  return rows.map(row => ({
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion, // Added
    precio: row.precio,
    imagen_url: row.imagen_url, // Added
    activo: row.activo,
    categoria_id: row.categoria_id,
    categoria: {
      id: row.categoria_id,
      nombre: row.categoria_nombre
    }
  }));
};

// Obtener platillo por ID
export const getPlatilloById = async (id) => {
  const query = `
    SELECT p.*, c.nombre as categoria_nombre 
    FROM platillos p 
    JOIN categorias c ON p.categoria_id = c.id
    WHERE p.id = ?
  `;
  const [rows] = await db.promise().query(query, [id]);

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion, // Added
    precio: row.precio,
    imagen_url: row.imagen_url, // Added
    activo: row.activo,
    categoria_id: row.categoria_id,
    categoria: {
      id: row.categoria_id,
      nombre: row.categoria_nombre
    }
  };
};

// Crear platillo
export const createPlatillo = async ({ nombre, descripcion, precio, imagen_url, categoria_id, activo }) => {
  const [result] = await db.promise().query(
    "INSERT INTO platillos (nombre, descripcion, precio, imagen_url, categoria_id, activo) VALUES (?, ?, ?, ?, ?, ?)",
    [nombre, descripcion, precio, imagen_url, categoria_id, activo]
  );
  return { id: result.insertId, nombre, descripcion, precio, imagen_url, categoria_id, activo };
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
