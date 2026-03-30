import db from '../config/db.js';

export const getPresas = async (req, res, next) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM presas ORDER BY nombre ASC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const togglePresa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;
    await db.promise().query('UPDATE presas SET activo = ? WHERE id = ?', [activo ? 1 : 0, id]);
    res.json({ message: 'Presa actualizada correctamente' });
  } catch (error) {
    next(error);
  }
};

// CRUD COMPLETO
export const addPresa = async (req, res, next) => {
  try {
    const { nombre, activo } = req.body;
    const isActivo = activo !== undefined ? (activo ? 1 : 0) : 1;
    await db.promise().query('INSERT INTO presas (nombre, activo) VALUES (?, ?)', [nombre, isActivo]);
    res.status(201).json({ message: 'Presa agregada correctamente' });
  } catch (error) {
    next(error);
  }
};

export const updatePresa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, activo } = req.body;
    let query = 'UPDATE presas SET ';
    const params = [];
    if (nombre !== undefined) {
      query += 'nombre = ?, ';
      params.push(nombre);
    }
    if (activo !== undefined) {
      query += 'activo = ?, ';
      params.push(activo ? 1 : 0);
    }
    query = query.slice(0, -2) + ' WHERE id = ?';
    params.push(id);
    
    await db.promise().query(query, params);
    res.json({ message: 'Presa editada correctamente' });
  } catch (error) {
    next(error);
  }
};

export const deletePresa = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.promise().query('DELETE FROM presas WHERE id = ?', [id]);
    res.json({ message: 'Presa eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};
