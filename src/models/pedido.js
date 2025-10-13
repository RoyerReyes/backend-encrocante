import db from "../config/db.js";

// Obtener todos los pedidos (con JOIN a usuarios, mesas y clientes)
export const getAllPedidos = async () => {
  const sql = `
    SELECT p.id, p.fecha, p.estado, p.tipo, p.total, p.observaciones,
           u.id AS usuario_id, u.nombre AS mesero, m.id AS mesa_id, m.numero AS mesa, c.id AS cliente_id, c.nombre AS cliente
    FROM pedidos p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN mesas m ON p.mesa_id = m.id
    LEFT JOIN clientes c ON p.cliente_id = c.id
    ORDER BY p.fecha DESC
  `;
  const [rows] = await db.promise().query(sql);
  return rows;
};

// Obtener pedidos de un usuario específico (ej. mesero)
export const getPedidosByUsuario = async (usuario_id) => {
  const sql = `
    SELECT p.id, p.fecha, p.estado, p.tipo, p.total, p.observaciones,
           m.id AS mesa_id, m.numero AS mesa, c.id AS cliente_id, c.nombre AS cliente
    FROM pedidos p
    LEFT JOIN mesas m ON p.mesa_id = m.id
    LEFT JOIN clientes c ON p.cliente_id = c.id
    WHERE p.usuario_id = ?
    ORDER BY p.fecha DESC
  `;
  const [rows] = await db.promise().query(sql, [usuario_id]);
  return rows;
};

// Crear pedido
export const createPedido = async (pedido) => {
  const { mesa_id = null, cliente_id = null, tipo, usuario_id, total, observaciones = null } = pedido;
  const sql = `
    INSERT INTO pedidos (mesa_id, cliente_id, tipo, usuario_id, total, observaciones)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await db.promise().query(sql, [mesa_id, cliente_id, tipo, usuario_id, total, observaciones]);
  return { id: result.insertId, ...pedido };
};

// Actualizar estado de pedido
export const updateEstadoPedido = async (id, estado) => {
  const sql = `UPDATE pedidos SET estado = ? WHERE id = ?`;
  const [result] = await db.promise().query(sql, [estado, id]);
  return result;
};

// Eliminar pedido
export const deletePedido = async (id) => {
  const sql = `DELETE FROM pedidos WHERE id = ?`;
  const [result] = await db.promise().query(sql, [id]);
  return result;
};
