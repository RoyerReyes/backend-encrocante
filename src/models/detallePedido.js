import db from "../config/db.js";

/**
 * Crea los detalles de un pedido dentro de una transacción.
 * @param {Array} detalles - Un array de objetos, cada uno con { platillo_id, cantidad, precio_unitario, subtotal }.
 * @param {number} pedido_id - El ID del pedido al que pertenecen estos detalles.
 * @param {object} connection - La conexión de base de datos para la transacción.
 */
export const createDetallesPedido = async (detalles, pedido_id, connection) => {
  const sql = `
    INSERT INTO detalle_pedido (pedido_id, platillo_id, cantidad, precio_unitario, subtotal, nota)
    VALUES ?
  `;

  // Mapeamos el array de detalles al formato que necesita la consulta de inserción masiva
  const values = detalles.map(item => [
    pedido_id,
    item.platillo_id,
    item.cantidad,
    item.precio_unitario,
    item.subtotal,
    item.nota || null
  ]);

  // Usamos la conexión de la transacción para ejecutar la consulta
  const [result] = await connection.query(sql, [values]);
  return result;
};

export const createDetalle = async (detalle) => {
  const { pedido_id, platillo_id, cantidad, precio_unitario, subtotal, nota } = detalle;
  const sql = `
    INSERT INTO detalle_pedido (pedido_id, platillo_id, cantidad, precio_unitario, subtotal, nota)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await db.promise().query(sql, [pedido_id, platillo_id, cantidad, precio_unitario, subtotal, nota]);
  // After inserting, get the newly created detail
  const [rows] = await db.promise().query('SELECT * FROM detalle_pedido WHERE id = ?', [result.insertId]);
  return rows[0];
};

export const getDetallesByPedido = async (pedido_id) => {
  const sql = `
    SELECT dp.*, p.nombre as platillo
    FROM detalle_pedido dp
    JOIN platillos p ON dp.platillo_id = p.id
    WHERE dp.pedido_id = ?
  `;
  const [rows] = await db.promise().query(sql, [pedido_id]);
  return rows;
};

export const updateDetalle = async (id, data) => {
  const { cantidad, nota } = data;

  // First, get the current detail to get the platillo_id
  const [rows] = await db.promise().query('SELECT platillo_id FROM detalle_pedido WHERE id = ?', [id]);
  if (rows.length === 0) {
    // Return a result that looks like the one from a failed update
    return { affectedRows: 0 };
  }
  const detalle = rows[0];

  // Get the price of the platillo
  const [platilloRows] = await db.promise().query('SELECT precio FROM platillos WHERE id = ?', [detalle.platillo_id]);
  if (platilloRows.length === 0) {
    // This should not happen if the data is consistent
    throw new Error('Platillo no encontrado');
  }
  const platillo = platilloRows[0];

  const newSubtotal = cantidad * platillo.precio;

  const sql = `
        UPDATE detalle_pedido
        SET cantidad = ?, nota = ?, subtotal = ?
        WHERE id = ?
    `;
  const [result] = await db.promise().query(sql, [cantidad, nota, newSubtotal, id]);
  return result;
};

export const deleteDetalle = async (id) => {
  const sql = "DELETE FROM detalle_pedido WHERE id = ?";
  const [result] = await db.promise().query(sql, [id]);
  return result;
};

export const getDetalleById = async (id) => {
  const sql = "SELECT * FROM detalle_pedido WHERE id = ?";
  const [rows] = await db.promise().query(sql, [id]);
  return rows[0];
};

export const toggleItemStatus = async (detalleId) => {
  // 1. Get current status
  const current = await getDetalleById(detalleId);
  if (!current) throw new Error('Detalle no encontrado');

  const newStatus = !current.listo; // Toggle boolean

  // 2. Update status
  await db.promise().query('UPDATE detalle_pedido SET listo = ? WHERE id = ?', [newStatus, detalleId]);

  // 3. Check parent Order status
  const pedidoId = current.pedido_id;

  // Count items NOT ready
  const [rows] = await db.promise().query(
    'SELECT COUNT(*) as pending_count FROM detalle_pedido WHERE pedido_id = ? AND listo = 0',
    [pedidoId]
  );

  const pendingCount = rows[0].pending_count;
  let orderStatusChanged = false;
  let newOrderStatus = null;

  // 4. Logic: If 0 pending -> Order is 'listo'. If > 0 and was 'listo' -> Order back to 'en_preparacion'
  // First get current order status
  const [orderRows] = await db.promise().query('SELECT estado FROM pedidos WHERE id = ?', [pedidoId]);
  const currentOrderStatus = orderRows[0]?.estado;

  if (pendingCount === 0 && currentOrderStatus === 'en_preparacion') {
    // Auto-complete!
    await db.promise().query("UPDATE pedidos SET estado = 'listo' WHERE id = ?", [pedidoId]);
    orderStatusChanged = true;
    newOrderStatus = 'listo';
  } else if (pendingCount > 0 && currentOrderStatus === 'listo') {
    // Revert to prep if un-checked
    await db.promise().query("UPDATE pedidos SET estado = 'en_preparacion' WHERE id = ?", [pedidoId]);
    orderStatusChanged = true;
    newOrderStatus = 'en_preparacion';
  }

  return {
    detalleId,
    listo: newStatus,
    pedidoId,
    orderStatusChanged,
    newOrderStatus
  };
};
