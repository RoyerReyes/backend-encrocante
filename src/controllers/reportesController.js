import { getPlatillosMasVendidos } from "../models/reporte.js";

/**
 * Controlador para obtener el reporte de los platillos más vendidos.
 */
export const getReportePlatillos = async (req, res, next) => {
  try {
    const platillos = await getPlatillosMasVendidos();
    res.json(platillos);
  } catch (error) {
    next(error);
  }
};
