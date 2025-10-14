import { getDetallesByPedido, createDetalle, deleteDetalle, updateDetalle } from "../models/detallePedido.js";
import { getPlatilloById } from "../models/platillo.js";

// Listar detalles de un pedido
export const listarDetalles = async (req, res, next) => {
  try {
    const { pedido_id } = req.params;
    const detalles = await getDetallesByPedido(pedido_id);
    res.json(detalles);
  } catch (error) {
    next(error);
  }
};

// Crear detalle (agregar platillo al pedido)
export const agregarDetalle = async (req, res, next) => {
  try {
    const { pedido_id } = req.params;
    const { platillo_id, cantidad, nota } = req.body;

    // 1. Obtener el precio del platillo desde la BD para seguridad
    const platillo = await getPlatilloById(platillo_id);
    if (!platillo) {
      return res.status(404).json({ error: "Platillo no encontrado" });
    }

    // 2. Calcular el subtotal con el precio de la BD
    const subtotal = cantidad * platillo.precio;

    // 3. Crear el detalle del pedido
    const nuevoDetalle = await createDetalle({
      pedido_id,
      platillo_id,
      cantidad,
      precio_unitario: platillo.precio, // Usar el precio de la BD
      subtotal,
      nota,
    });

    res.status(201).json({ message: "Detalle agregado 🚀", detalle: nuevoDetalle });
  } catch (error) {
    next(error);
  }
};

// Actualizar detalle (cantidad o nota)
export const actualizarDetalle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cantidad, nota } = req.body;

    const result = await updateDetalle(id, { cantidad, nota });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Detalle no encontrado" });
    }
    res.json({ message: "Detalle actualizado ✅" });
  } catch (error) {
    next(error);
  }
};

// Eliminar detalle
export const eliminarDetalle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteDetalle(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Detalle no encontrado" });
    }
    res.json({ message: "Detalle eliminado 🗑️" });
  } catch (error) {
    next(error);
  }
};
