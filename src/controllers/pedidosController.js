import { io } from "../app.js";
import {
  getAllPedidos,
  getPedidosByUsuario,
  createPedido,
  updateEstadoPedido,
  deletePedido,
  getPedidoById
} from "../models/pedido.js";
import { getPlatilloById } from "../models/platillo.js";

/**
 * Listar pedidos:
 * - admin => todos
 * - mesero => solo los del usuario (req.user.id)
 */
export const listarPedidos = async (req, res, next) => {
  const { rol, id: usuario_id } = req.user; // viene del JWT

  try {
    let pedidos;
    if (rol === "admin") {
      pedidos = await getAllPedidos();
    } else if (rol === "mesero") {
      pedidos = await getPedidosByUsuario(usuario_id);
    } else {
      return res.status(403).json({ message: "No tienes permisos para ver pedidos" });
    }
    res.json(pedidos);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear pedido (mesero o admin)
 * Request body: { mesa_id, cliente_id, tipo, observaciones, detalles: [{ platillo_id, cantidad, nota }] }
 */
export const crearPedido = async (req, res, next) => {
  const { rol, id: usuario_id } = req.user;
  if (rol !== "mesero" && rol !== "admin") {
    return res.status(403).json({ message: "Solo meseros o admins pueden crear pedidos" });
  }

  try {
    const { mesa_id, cliente_id, tipo, observaciones, detalles } = req.body;

    // 1. Validar platillos y calcular total
    let total = 0;
    const detallesConPrecio = [];

    for (const item of detalles) {
      const platillo = await getPlatilloById(item.platillo_id);

      if (!platillo) {
        return res.status(400).json({ message: `El platillo con ID ${item.platillo_id} no existe.` });
      }
      if (!platillo.activo) {
        return res.status(400).json({ message: `El platillo '${platillo.nombre}' no está disponible.` });
      }

      const subtotal = platillo.precio * item.cantidad;
      total += subtotal;

      detallesConPrecio.push({
        ...item,
        precio_unitario: platillo.precio,
        subtotal
      });
    }

    // 2. Crear el objeto del pedido
    const pedidoData = {
      mesa_id: mesa_id || null,
      cliente_id: cliente_id || null,
      tipo,
      usuario_id,
      total,
      observaciones,
      detalles: detallesConPrecio
    };

    // 3. Llamar al modelo para la transacción
    const nuevoPedido = await createPedido(pedidoData);

    res.status(201).json({
      message: "Pedido creado 🚀",
      pedido: nuevoPedido
    });

  } catch (error) {
    next(error);
  }
};


/**
 * Actualizar estado del pedido (solo admin)
 * Body: { estado }
 */
export const actualizarEstado = async (req, res, next) => {
  const { rol } = req.user;
  if (rol !== "admin") {
    return res.status(403).json({ message: "Solo admin puede actualizar pedidos" });
  }

  try {
    const { id } = req.params;
    const { estado } = req.body;

    const result = await updateEstadoPedido(id, estado);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Obtener el pedido actualizado para emitirlo
    const pedidoActualizado = await getPedidoById(id);

    // Emitir evento de socket.io
    io.emit("pedido_actualizado", pedidoActualizado);

    res.json({ message: "Estado actualizado ✅" });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar pedido (solo admin)
 */
export const eliminarPedido = async (req, res, next) => {
  const { rol } = req.user;
  if (rol !== "admin") {
    return res.status(403).json({ message: "Solo admin puede eliminar pedidos" });
  }

  try {
    const { id } = req.params;
    const result = await deletePedido(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    res.json({ message: "Pedido eliminado 🗑️" });
  } catch (error) {
    next(error);
  }
};