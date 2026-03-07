import db from "../config/db.js";

class ReporteService {

  // Top 10 Platillos más vendidos (con filtro de fecha y pago)
  async getTopPlatillos(startDate, endDate, metodoPago) {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (startDate && endDate) {
      whereClause += ' AND p_pedido.fecha BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (metodoPago && metodoPago !== 'Todos') {
      // Si es "Yape - Plin", buscamos parciales o exactos. El pedido guarda "Yape - Plin" o "Efectivo"
      if (metodoPago.includes('Yape')) {
        whereClause += ' AND (p_pedido.metodo_pago LIKE ? OR p_pedido.metodo_pago LIKE ?)';
        params.push('%Yape%', '%Plin%');
      } else {
        whereClause += ' AND p_pedido.metodo_pago = ?';
        params.push(metodoPago);
      }
    }

    const sql = `
      SELECT
        p.id AS platillo_id,
        p.nombre,
        COALESCE(SUM(dp.cantidad), 0) AS total_vendido
      FROM platillos p
      LEFT JOIN detalle_pedido dp ON p.id = dp.platillo_id
      LEFT JOIN pedidos p_pedido ON dp.pedido_id = p_pedido.id
      ${whereClause}
      GROUP BY p.id, p.nombre
      ORDER BY total_vendido DESC
      LIMIT 10;
    `;
    const [rows] = await db.promise().query(sql, params);
    return rows;
  }

  // Ventas diarias (con filtro de fecha y pago)
  async getVentasDiarias(startDate, endDate, metodoPago, preset) {
    let whereClause = "WHERE estado != 'cancelado'";
    const params = [];

    // Fechas
    if (preset === 'today') {
      // Force Database 'Today' regardless of what frontend sent
      whereClause += " AND DATE(fecha) = CURDATE()";
    } else if (startDate && endDate) {
      whereClause += " AND fecha BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else {
      whereClause += " AND fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
    }

    // Metodo de Pago
    if (metodoPago && metodoPago !== 'Todos') {
      if (metodoPago.includes('Yape')) {
        whereClause += ' AND (metodo_pago LIKE ? OR metodo_pago LIKE ?)';
        params.push('%Yape%', '%Plin%');
      } else {
        whereClause += ' AND metodo_pago = ?';
        params.push(metodoPago);
      }
    }

    const sql = `
      SELECT 
        DATE(fecha) as fecha, 
        SUM(total) as total_ventas,
        COUNT(id) as cantidad_pedidos
      FROM pedidos
      ${whereClause}
      GROUP BY DATE(fecha)
      ORDER BY fecha ASC;
    `;
    console.log('getVentasDiarias SQL:', sql);
    console.log('getVentasDiarias PARAMS:', params);
    const [rows] = await db.promise().query(sql, params);
    console.log('getVentasDiarias RESULT ROWS:', rows.length);
    return rows;
  }

  // Rendimiento Mozos (con filtro de fecha)
  async getRendimientoMozos(startDate, endDate) {
    let dateFilter = '';
    const params = [];

    // Filtramos los pedidos por fecha antes de unir con usuarios
    if (startDate && endDate) {
      dateFilter = 'AND p.fecha BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const sql = `
      SELECT 
        u.nombre, 
        u.usuario,
        COUNT(p.id) as pedidos_tomados,
        COALESCE(SUM(p.total), 0) as total_generado
      FROM usuarios u
      LEFT JOIN pedidos p ON u.id = p.usuario_id ${dateFilter}
      WHERE u.rol = 'mesero'
      GROUP BY u.id
      ORDER BY total_generado DESC
    `;
    const [rows] = await db.promise().query(sql, params);
    return rows;
  }

  // Estadísticas Generales del Sistema
  async getSystemStats() {
    // 1. Total Órdenes Históricas
    const [rowsTotal] = await db.promise().query('SELECT COUNT(*) as total FROM pedidos');
    const totalOrdenes = rowsTotal[0].total;

    // 2. Eficiencia (Pedidos Entregados/Pagados vs Cancelados)
    const sqlEficiencia = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado IN ('entregado', 'pagado', 'listo') THEN 1 ELSE 0 END) as exitosos
      FROM pedidos
    `;
    const [rowsEficiencia] = await db.promise().query(sqlEficiencia);
    const totalEventos = rowsEficiencia[0].total;
    const exitosos = rowsEficiencia[0].exitosos || 0;

    const eficiencia = totalEventos > 0
      ? ((exitosos / totalEventos) * 100).toFixed(1)
      : '100.0';

    // 3. Uptime simulado (o real si tuviéramos tabla de logs de server start)
    // Retornamos "En línea" por simplicidad

    return {
      total_ordenes: totalOrdenes,
      rendimiento: `${eficiencia}%`,
      tiempo_actividad: 'Activo'
    };
  }
}

export default new ReporteService();
