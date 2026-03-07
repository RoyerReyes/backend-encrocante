import pedidoService from "../services/pedidoService.js";

/**
 * Listar pedidos
 */
export const listarPedidos = async (req, res, next) => {
  try {
    const pedidos = await pedidoService.listarPedidos(req.user, req.user.rol);
    res.json(pedidos);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un pedido por ID
 */
export const obtenerPedido = async (req, res, next) => {
  const { id } = req.params;
  try {
    const pedido = await pedidoService.obtenerPedido(id);
    res.json(pedido);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(error);
    }
    next(error);
  }
};

/**
 * Crear pedido
 */
export const crearPedido = async (req, res, next) => {
  try {
    const nuevoPedido = await pedidoService.crearPedido(req.body, req.user);
    res.status(201).json({
      message: "Pedido creado exitosamente",
      pedido: nuevoPedido
    });
  } catch (error) {
    // Si el error viene de lanzamientos manuales en el servicio (throw {statusCode...})
    if (error.statusCode) {
      return res.status(error.statusCode).json(error);
    }
    next(error);
  }
};

/**
 * Actualizar estado del pedido
 */
export const actualizarEstado = async (req, res, next) => {
  const { id } = req.params;
  const { estado: nuevoEstado, metodo_pago, monto_recibido, vuelto, descuento, puntos_canjeados } = req.body;

  try {
    const pedidoActualizado = await pedidoService.actualizarEstado(id, nuevoEstado, req.user, req.user.rol, metodo_pago, monto_recibido, vuelto, descuento, puntos_canjeados);
    res.json({
      message: `Estado del pedido actualizado a "${nuevoEstado}"`,
      pedido: pedidoActualizado
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(error);
    }
    next(error);
  }
};

/**
 * Eliminar pedido (solo admin)
 */
export const eliminarPedido = async (req, res, next) => {
  const { id } = req.params;
  try {
    await pedidoService.eliminarPedido(id);
    res.json({ message: "Pedido eliminado exitosamente" });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(error);
    }
    next(error);
  }
};

/**
 * Toggle estado de detalle (item)
 */
export const toggleDetalle = async (req, res, next) => {
  try {
    const { id } = req.params; // This is detalleId
    const result = await pedidoService.toggleDetalle(parseInt(id));
    res.json(result);
  } catch (error) {
    next(error);
  }
};

