import db from "../config/db.js";

/**
 * Crea los detalles de un pedido dentro de una transacción.
 * @param {Array} detalles - Un array de objetos, cada uno con { platillo_id, cantidad, precio_unitario, subtotal }.
 * @param {number} pedido_id - El ID del pedido al que pertenecen estos detalles.
 * @param {object} connection - La conexión de base de datos para la transacción.
 */
export const createDetallesPedido = async (detalles, pedido_id, connection) => {
  const sql = `
    INSERT INTO detalle_pedido (pedido_id, platillo_id, cantidad, precio_unitario, subtotal)
    VALUES ?
  `;

  // Mapeamos el array de detalles al formato que necesita la consulta de inserción masiva
  const values = detalles.map(item => [
    pedido_id,
    item.platillo_id,
    item.cantidad,
    item.precio_unitario,
    item.subtotal
  ]);

  // Usamos la conexión de la transacción para ejecutar la consulta
  const [result] = await connection.query(sql, [values]);
  return result;
};