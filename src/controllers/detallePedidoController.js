import detallePedidoService from "../services/detallePedidoService.js";

export const listarDetalles = async (req, res, next) => {
  const { pedido_id } = req.params;
  const { id: usuario_id, rol } = req.user;
  try {
    const detalles = await detallePedidoService.listarDetalles(pedido_id, usuario_id, rol);
    res.json(detalles);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json(error);
    next(error);
  }
};

export const agregarDetalle = async (req, res, next) => {
  const { pedido_id } = req.params;
  const { id: usuario_id, rol } = req.user;
  try {
    const result = await detallePedidoService.agregarDetalle(pedido_id, req.body, usuario_id, rol);
    res.status(201).json({ message: "Detalle agregado", ...result });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json(error);
    next(error);
  }
};

export const actualizarDetalle = async (req, res, next) => {
  const { id } = req.params;
  const { id: usuario_id, rol } = req.user;
  try {
    const result = await detallePedidoService.actualizarDetalle(id, req.body, usuario_id, rol);
    res.json({ message: "Detalle actualizado", ...result });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json(error);
    next(error);
  }
};

export const eliminarDetalle = async (req, res, next) => {
  const { id } = req.params;
  const { id: usuario_id, rol } = req.user;
  try {
    const result = await detallePedidoService.eliminarDetalle(id, usuario_id, rol);
    res.json({ message: "Detalle eliminado", ...result });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json(error);
    next(error);
  }
};
