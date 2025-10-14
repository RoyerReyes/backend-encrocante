import db from "../config/db.js";

/**
 * Obtiene los platillos más vendidos, ordenados por la cantidad total vendida.
 */
export const getPlatillosMasVendidos = async () => {
  const sql = `
    SELECT
      p.id AS platillo_id,
      p.nombre,
      SUM(dp.cantidad) AS total_vendido
    FROM detalle_pedido dp
    JOIN platillos p ON dp.platillo_id = p.id
    GROUP BY p.id, p.nombre
    ORDER BY total_vendido DESC
    LIMIT 10; -- Limitar a los 10 más vendidos
  `;

  const [rows] = await db.promise().query(sql);
  return rows;
};
