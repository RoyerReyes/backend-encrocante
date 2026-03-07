import reporteService from "../services/reporteService.js";

/**
 * Top Platillos
 */
export const getReportePlatillos = async (req, res, next) => {
  try {
    const { startDate, endDate, metodoPago } = req.query;
    const data = await reporteService.getTopPlatillos(startDate, endDate, metodoPago);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Ventas Diarias
 */
export const getVentasDiarias = async (req, res, next) => {
  try {
    const { startDate, endDate, metodoPago, preset } = req.query;
    console.log('getVentasDiarias REQUEST:', { startDate, endDate, metodoPago, preset });
    const data = await reporteService.getVentasDiarias(startDate, endDate, metodoPago, preset);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Rendimiento Mozos
 */
export const getRendimientoMozos = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await reporteService.getRendimientoMozos(startDate, endDate);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * System Stats
 */
export const getSystemStats = async (req, res, next) => {
  try {
    const data = await reporteService.getSystemStats();
    res.json(data);
  } catch (error) {
    next(error);
  }
};
