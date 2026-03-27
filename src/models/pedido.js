import db from "../config/db.js";
import { createDetallesPedido } from "./detallePedido.js";

export const getPedidoById = async (id) => {
  // 1. Obtener el pedido principal
  const sqlPedido = `
    SELECT p.id, p.fecha, p.estado, p.tipo, p.total, p.costo_delivery, p.observaciones, p.nombre_cliente, p.metodo_pago, p.monto_recibido, p.vuelto,
           u.id AS usuario_id, u.nombre AS mesero,
           m.id AS mesa_id, m.numero AS mesa,
           c.id AS cliente_id, c.nombre AS cliente
    FROM pedidos p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN mesas m ON p.mesa_id = m.id
    LEFT JOIN clientes c ON p.cliente_id = c.id
    WHERE p.id = ?
  `;
  const [pedidos] = await db.promise().query(sqlPedido, [id]);

  if (pedidos.length === 0) {
    return null;
  }

  const pedido = pedidos[0];

  // 2. Obtener los detalles del pedido
  const sqlDetalles = `
    SELECT dp.id, dp.platillo_id, dp.cantidad, dp.precio_unitario, dp.subtotal, dp.nota, dp.listo,
           pl.nombre AS platillo_nombre
    FROM detalle_pedido dp
    INNER JOIN platillos pl ON dp.platillo_id = pl.id
    WHERE dp.pedido_id = ?
  `;
  const [detalles] = await db.promise().query(sqlDetalles, [id]);

  // 3. Combinar pedido con sus detalles
  return {
    ...pedido,
    detalles: detalles
  };
};

// Obtener todos los pedidos (con JOIN a usuarios, mesas y clientes)
export const getAllPedidos = async () => {
  // 1. Obtener todos los pedidos
  const sqlPedidos = `
    SELECT p.id, p.fecha, p.estado, p.tipo, p.total, p.costo_delivery, p.observaciones, p.nombre_cliente, p.metodo_pago, p.monto_recibido, p.vuelto,
           u.id AS usuario_id, u.nombre AS mesero,
           m.id AS mesa_id, m.numero AS mesa,
           c.id AS cliente_id, c.nombre AS cliente
    FROM pedidos p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN mesas m ON p.mesa_id = m.id
    LEFT JOIN clientes c ON p.cliente_id = c.id
    ORDER BY p.fecha DESC
  `;
  const [pedidos] = await db.promise().query(sqlPedidos);

  if (pedidos.length === 0) {
    return [];
  }

  // 2. Obtener todos los IDs de pedidos
  const pedidoIds = pedidos.map(p => p.id);

  // 3. Obtener todos los detalles en una sola query (optimizado)
  const sqlDetalles = `
    SELECT dp.id, dp.pedido_id, dp.platillo_id, dp.cantidad, dp.precio_unitario, dp.subtotal, dp.nota, dp.listo,
           pl.nombre AS platillo_nombre
    FROM detalle_pedido dp
    INNER JOIN platillos pl ON dp.platillo_id = pl.id
    WHERE dp.pedido_id IN (?)
  `;
  const [detalles] = await db.promise().query(sqlDetalles, [pedidoIds]);

  // 4. Agrupar detalles por pedido_id
  const detallesPorPedido = {};
  detalles.forEach(detalle => {
    if (!detallesPorPedido[detalle.pedido_id]) {
      detallesPorPedido[detalle.pedido_id] = [];
    }
    detallesPorPedido[detalle.pedido_id].push(detalle);
  });

  // 5. Combinar pedidos con sus detalles
  return pedidos.map(pedido => ({
    ...pedido,
    detalles: detallesPorPedido[pedido.id] || []
  }));
};

// Obtener pedidos de un usuario específico (ej. mesero)
export const getPedidosByUsuario = async (usuario_id) => {
  // 1. Obtener pedidos del usuario
  const sqlPedidos = `
    SELECT p.id, p.fecha, p.estado, p.tipo, p.total, p.costo_delivery, p.observaciones, p.nombre_cliente, p.metodo_pago, p.monto_recibido, p.vuelto,
           m.id AS mesa_id, m.numero AS mesa,
           c.id AS cliente_id, c.nombre AS cliente,
           u.nombre AS mesero
    FROM pedidos p
    LEFT JOIN mesas m ON p.mesa_id = m.id
    LEFT JOIN clientes c ON p.cliente_id = c.id
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.usuario_id = ?
    ORDER BY p.fecha DESC
  `;
  const [pedidos] = await db.promise().query(sqlPedidos, [usuario_id]);

  if (pedidos.length === 0) {
    return [];
  }

  // 2. Obtener todos los IDs de pedidos
  const pedidoIds = pedidos.map(p => p.id);

  // 3. Obtener todos los detalles en una sola query
  const sqlDetalles = `
    SELECT dp.id, dp.pedido_id, dp.platillo_id, dp.cantidad, dp.precio_unitario, dp.subtotal, dp.nota, dp.listo,
    pl.nombre AS platillo_nombre
    FROM detalle_pedido dp
    INNER JOIN platillos pl ON dp.platillo_id = pl.id
    WHERE dp.pedido_id IN(?)
  `;
  const [detalles] = await db.promise().query(sqlDetalles, [pedidoIds]);

  // 4. Agrupar detalles por pedido_id
  const detallesPorPedido = {};
  detalles.forEach(detalle => {
    if (!detallesPorPedido[detalle.pedido_id]) {
      detallesPorPedido[detalle.pedido_id] = [];
    }
    detallesPorPedido[detalle.pedido_id].push(detalle);
  });

  // 5. Combinar pedidos con sus detalles
  return pedidos.map(pedido => ({
    ...pedido,
    detalles: detallesPorPedido[pedido.id] || []
  }));
};

// Crear pedido y sus detalles en una transacción
export const createPedido = async (pedidoData) => {
  const { mesa_id, cliente_id, usuario_id, nombre_cliente, total, observaciones, tipo, costo_delivery } = pedidoData;

  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insertar Pedido
    // Para bases de datos en la nube (Aiven) donde NOW() es UTC (+0), forzamos -5 HORAS local (Perú/Colombia/Ecuador) con DATE_SUB
    const [result] = await connection.query(
      `INSERT INTO pedidos(mesa_id, cliente_id, usuario_id, nombre_cliente, total, observaciones, tipo, estado, costo_delivery, fecha)
  VALUES(?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, DATE_SUB(NOW(), INTERVAL 5 HOUR))`,
      [mesa_id, cliente_id, usuario_id, nombre_cliente, total, observaciones, tipo, costo_delivery || 0.00]
    );
    const pedidoId = result.insertId;

    // 2. Insertar Detalles
    // optimización: batch insert
    if (pedidoData.detalles && pedidoData.detalles.length > 0) {
      const valoresDetalles = pedidoData.detalles.map(d => [
        pedidoId,
        d.platillo_id,
        d.cantidad,
        d.precio_unitario, // aseguramos guardar el precio histórico
        d.subtotal,
        d.nota || d.notas || d.observaciones || null
      ]);

      await connection.query(
        `INSERT INTO detalle_pedido(pedido_id, platillo_id, cantidad, precio_unitario, subtotal, nota)
  VALUES ? `,
        [valoresDetalles]
      );
    }

    await connection.commit();
    return await getPedidoById(pedidoId, connection); // Reusamos la conexión
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Actualizar pedido COMPLETO (editar items)
export const updatePedidoCompleto = async (pedidoId, pedidoData) => {
  const { mesa_id, cliente_id, nombre_cliente, total, observaciones, tipo, costo_delivery, detalles } = pedidoData;
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    // 1. Obtener detalles existentes para preservar su estado 'listo'
    const [existingDetails] = await connection.query("SELECT platillo_id, listo FROM detalle_pedido WHERE pedido_id = ?", [pedidoId]);
    const mapListoStatus = new Map(existingDetails.map(d => [d.platillo_id, d.listo]));

    // 2. Actualizar tabla pedidos
    await connection.query(
      `UPDATE pedidos SET mesa_id = ?, cliente_id = ?, nombre_cliente = ?, total = ?, observaciones = ?, tipo = ?, costo_delivery = ? WHERE id = ?`,
      [mesa_id, cliente_id, nombre_cliente, total, observaciones, tipo, costo_delivery || 0.00, pedidoId]
    );

    // 3. Eliminar items anteriores
    await connection.query("DELETE FROM detalle_pedido WHERE pedido_id = ?", [pedidoId]);

    // 4. Insertar nuevos items y preservar 'listo'
    if (detalles && detalles.length > 0) {
      const valoresDetalles = detalles.map(d => [
        pedidoId,
        d.platillo_id,
        d.cantidad,
        d.precio_unitario,
        d.subtotal,
        d.nota || d.notas || null,
        mapListoStatus.get(d.platillo_id) ? 1 : 0 // Conserva true/false dependiendo de si ya estaba listo
      ]);

      await connection.query(
        `INSERT INTO detalle_pedido(pedido_id, platillo_id, cantidad, precio_unitario, subtotal, nota, listo) VALUES ?`,
        [valoresDetalles]
      );
    }

    // 5. Verificar si el cambio de items hace que TODO el pedido esté listo automáticamente
    // Si metieron ítems nuevos, probablemente regrese a 'en_preparacion'
    const [currentStatus] = await connection.query("SELECT estado FROM pedidos WHERE id = ?", [pedidoId]);
    let currentEstado = currentStatus[0]?.estado;
    
    // Solo modificar estado automáticamente si está en_preparacion o listo
    if (currentEstado === 'en_preparacion' || currentEstado === 'listo') {
        const [allDetalles] = await connection.query("SELECT listo FROM detalle_pedido WHERE pedido_id = ?", [pedidoId]);
        const todoListo = allDetalles.length > 0 && allDetalles.every(d => d.listo === 1);
        
        if (todoListo && currentEstado !== 'listo') {
            await connection.query("UPDATE pedidos SET estado = 'listo' WHERE id = ?", [pedidoId]);
        } else if (!todoListo && currentEstado === 'listo') {
            await connection.query("UPDATE pedidos SET estado = 'en_preparacion' WHERE id = ?", [pedidoId]);
        }
    }

    await connection.commit();
    return await getPedidoById(pedidoId, connection);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};


// Actualizar estado de pedido
export const updateEstadoPedido = async (id, estado, metodo_pago = null, monto_recibido = null, vuelto = null, descuento = null, puntos_canjeados = null) => {
  let sql = `UPDATE pedidos SET estado = ? `;
  const params = [estado];

  if (metodo_pago) {
    sql += `, metodo_pago = ? `;
    params.push(metodo_pago);
  }

  if (monto_recibido !== null) {
    sql += `, monto_recibido = ? `;
    params.push(monto_recibido);
  }

  if (vuelto !== null) {
    sql += `, vuelto = ? `;
    params.push(vuelto);
  }

  if (descuento !== null) {
    sql += `, descuento = ? `;
    params.push(descuento);
  }

  if (puntos_canjeados !== null) {
    sql += `, puntos_canjeados = ? `;
    params.push(puntos_canjeados);
  }

  sql += ` WHERE id = ? `;
  params.push(id);

  const [result] = await db.promise().query(sql, params);
  return result;
};

// Eliminar pedido
export const deletePedido = async (id) => {
  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    // 1. Eliminar los detalles del pedido
    await connection.query("DELETE FROM detalle_pedido WHERE pedido_id = ?", [id]);

    // 2. Eliminar el pedido
    const [result] = await connection.query("DELETE FROM pedidos WHERE id = ?", [id]);

    await connection.commit();
    return result;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Obtener pedidos activos para pantalla de cocina/cliente (solo en preparación y listos)
export const getActivePedidos = async () => {
  // 1. Obtener pedidos filtrados por estado
  const sqlPedidos = `
      SELECT p.id, p.fecha, p.estado, p.tipo, p.total, p.costo_delivery, p.observaciones, p.nombre_cliente, p.metodo_pago,
    u.id AS usuario_id, u.nombre AS mesero,
      m.id AS mesa_id, m.numero AS mesa
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN mesas m ON p.mesa_id = m.id
      WHERE p.estado IN('en_preparacion', 'listo')
      ORDER BY p.fecha ASC
    `;
  const [pedidos] = await db.promise().query(sqlPedidos);

  if (pedidos.length === 0) {
    return [];
  }

  // 2. Obtener IDs
  const pedidoIds = pedidos.map(p => p.id);

  // 3. Obtener detalles
  const sqlDetalles = `
      SELECT dp.id, dp.pedido_id, dp.platillo_id, dp.cantidad, dp.nota, dp.listo,
    pl.nombre AS platillo_nombre
      FROM detalle_pedido dp
      INNER JOIN platillos pl ON dp.platillo_id = pl.id
      WHERE dp.pedido_id IN(?)
    `;
  const [detalles] = await db.promise().query(sqlDetalles, [pedidoIds]);

  // 4. Map
  const detallesPorPedido = {};
  detalles.forEach(d => {
    if (!detallesPorPedido[d.pedido_id]) detallesPorPedido[d.pedido_id] = [];
    detallesPorPedido[d.pedido_id].push(d);
  });

  return pedidos.map(p => ({
    ...p,
    detalles: detallesPorPedido[p.id] || []
  }));
};