import {
  getAllPedidos,
  getPedidosByUsuario,
  createPedido,
  updateEstadoPedido,
  deletePedido
} from "../models/pedido.js";

/**
 * Listar pedidos:
 * - admin => todos
 * - mesero => solo los del usuario (req.user.id)
 */
export const listarPedidos = async (req, res) => {
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
    console.error(`❌ Error obtener pedidos (${rol}):`, error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

/**
 * Crear pedido (mesero o admin)
 * Request body: { mesa_id, cliente_id, tipo, total, observaciones }
 */
export const crearPedido = async (req, res) => {
  const { rol, id: usuario_id } = req.user;
  if (rol !== "mesero" && rol !== "admin") {
    return res.status(403).json({ message: "Solo meseros o admins pueden crear pedidos" });
  }

  try {
    let { mesa_id = null, cliente_id = null, tipo, total, observaciones = null } = req.body;

    const nuevoPedido = await createPedido({
      mesa_id: mesa_id || null,
      cliente_id: cliente_id || null,
      tipo,
      usuario_id,
      total: parseFloat(total),
      observaciones
    });

    res.status(201).json({
      message: "Pedido creado 🚀",
      pedido: nuevoPedido
    });

  } catch (error) {
    console.error("❌ Error al crear pedido:", error);
    res.status(500).json({ error: "Error al crear pedido" });
  }
};

/**
 * Actualizar estado del pedido (solo admin)
 * Body: { estado }
 */
export const actualizarEstado = async (req, res) => {
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
    res.json({ message: "Estado actualizado ✅" });
  } catch (error) {
    console.error("❌ Error al actualizar estado:", error);
    res.status(500).json({ error: "Error al actualizar pedido" });
  }
};

/**
 * Eliminar pedido (solo admin)
 */
export const eliminarPedido = async (req, res) => {
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
    console.error("❌ Error al eliminar pedido:", error);
    res.status(500).json({ error: "Error al eliminar pedido" });
  }
};
