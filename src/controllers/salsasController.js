import db from '../config/db.js';

export const getSalsas = async (req, res, next) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM salsas ORDER BY nombre ASC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const toggleSalsa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;
    await db.promise().query('UPDATE salsas SET activo = ? WHERE id = ?', [activo ? 1 : 0, id]);
    res.json({ message: 'Salsa actualizada correctamente' });
  } catch (error) {
    next(error);
  }
};
