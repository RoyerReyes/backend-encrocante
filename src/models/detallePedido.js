import db from "../config/db.js";

// Obtener todos los detalles de un pedido
export const getDetallesByPedido = (pedido_id, callback) => {
  const sql = `
    SELECT d.id, d.pedido_id, d.platillo_id, p.nombre AS platillo,
           d.cantidad, d.precio_unitario, d.subtotal, d.nota
    FROM detalle_pedido d
    INNER JOIN platillos p ON d.platillo_id = p.id
    WHERE d.pedido_id = ?
  `;
  db.query(sql, [pedido_id], callback);
};

// Crear un detalle (agregar platillo al pedido)
export const createDetalle = (detalle, callback) => {
  const { pedido_id, platillo_id, cantidad, precio_unitario, subtotal, nota } = detalle;
  const sql = `
    INSERT INTO detalle_pedido (pedido_id, platillo_id, cantidad, precio_unitario, subtotal, nota)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [pedido_id, platillo_id, cantidad, precio_unitario, subtotal, nota], callback);
};

// Eliminar un detalle específico
export const deleteDetalle = (id, callback) => {
  const sql = `DELETE FROM detalle_pedido WHERE id = ?`;
  db.query(sql, [id], callback);
};
