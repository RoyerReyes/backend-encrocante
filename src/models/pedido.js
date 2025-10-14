import db from "../config/db.js";
import { createDetallesPedido } from "./detallePedido.js";

export const getPedidoById = async (id) => {
  const sql = `
    SELECT p.id, p.fecha, p.estado, p.tipo, p.total, p.observaciones,
           u.id AS usuario_id, u.nombre AS mesero, m.id AS mesa_id, m.numero AS mesa, c.id AS cliente_id, c.nombre AS cliente
    FROM pedidos p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN mesas m ON p.mesa_id = m.id
    LEFT JOIN clientes c ON p.cliente_id = c.id
    WHERE p.id = ?
  `;
  const [rows] = await db.promise().query(sql, [id]);
  return rows[0];
};

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

// Crear pedido y sus detalles en una transacción
export const createPedido = async (pedidoData) => {
  const { mesa_id, cliente_id, tipo, usuario_id, total, observaciones, detalles } = pedidoData;
  const estado = 'pendiente'; // Estado por defecto

  let connection;
  try {
    // 1. Obtener una conexión del pool
    connection = await db.promise().getConnection();

    // 2. Iniciar la transacción
    await connection.beginTransaction();

    // 3. Insertar el pedido principal
    const pedidoSql = `
      INSERT INTO pedidos (mesa_id, cliente_id, tipo, usuario_id, total, observaciones, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [pedidoResult] = await connection.query(pedidoSql, [mesa_id, cliente_id, tipo, usuario_id, total, observaciones, estado]);
    const pedido_id = pedidoResult.insertId;

    // 4. Insertar los detalles del pedido
    await createDetallesPedido(detalles, pedido_id, connection);

    // 5. Confirmar la transacción
    await connection.commit();

    // 6. Devolver el pedido completo
    return { id: pedido_id, ...pedidoData, estado };

  } catch (error) {
    // Si hay un error, revertir la transacción
    if (connection) {
      await connection.rollback();
    }
    // Propagar el error para que el controlador lo maneje
    throw error;

  } finally {
    // 7. Liberar la conexión en cualquier caso
    if (connection) {
      connection.release();
    }
  }
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