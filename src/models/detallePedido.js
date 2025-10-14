import db from "../config/db.js";

// Obtener todos los detalles de un pedido
export const getDetallesByPedido = async (pedido_id) => {
  const sql = `
    SELECT d.id, d.pedido_id, d.platillo_id, p.nombre AS platillo,
           d.cantidad, d.precio_unitario, d.subtotal, d.nota
    FROM detalle_pedido d
    INNER JOIN platillos p ON d.platillo_id = p.id
    WHERE d.pedido_id = ?
  `;
  const [rows] = await db.promise().query(sql, [pedido_id]);
  return rows;
};

// Crear un detalle (agregar platillo al pedido)
export const createDetalle = async (detalle) => {
  const { pedido_id, platillo_id, cantidad, precio_unitario, subtotal, nota } = detalle;
  const sql = `
    INSERT INTO detalle_pedido (pedido_id, platillo_id, cantidad, precio_unitario, subtotal, nota)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await db.promise().query(sql, [pedido_id, platillo_id, cantidad, precio_unitario, subtotal, nota]);
  const [[nuevoDetalle]] = await db.promise().query('SELECT * FROM detalle_pedido WHERE id = ?', [result.insertId]);
  return nuevoDetalle;
};

// Actualizar un detalle (cantidad y nota)
export const updateDetalle = async (id, detalleData) => {
  const { cantidad, nota } = detalleData;

  // Obtener el precio unitario para recalcular el subtotal
  const [[detalleExistente]] = await db.promise().query('SELECT precio_unitario FROM detalle_pedido WHERE id = ?', [id]);
  if (!detalleExistente) {
    return { affectedRows: 0 };
  }

  const subtotal = cantidad * detalleExistente.precio_unitario;

  const fieldsToUpdate = [];
  const values = [];

  if (cantidad !== undefined) {
    fieldsToUpdate.push('cantidad = ?', 'subtotal = ?');
    values.push(cantidad, subtotal);
  }
  if (nota !== undefined) {
    fieldsToUpdate.push('nota = ?');
    values.push(nota);
  }

  const sql = `UPDATE detalle_pedido SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
  const [result] = await db.promise().query(sql, [...values, id]);
  return result;
};

// Eliminar un detalle específico
export const deleteDetalle = async (id) => {
  const sql = `DELETE FROM detalle_pedido WHERE id = ?`;
  const [result] = await db.promise().query(sql, [id]);
  return result;
};
