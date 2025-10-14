import { getDetallesByPedido, createDetalle, deleteDetalle } from "../models/detallePedido.js";

// Listar detalles de un pedido
export const listarDetalles = (req, res) => {
  const { pedido_id } = req.params;

  getDetallesByPedido(pedido_id, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener detalles" });
    res.json(results);
  });
};

// Crear detalle (agregar platillo al pedido)
export const agregarDetalle = (req, res) => {
  const { pedido_id } = req.params;
  const { platillo_id, cantidad, precio_unitario, nota } = req.body;

  if (!platillo_id || !cantidad || !precio_unitario) {
    return res.status(400).json({ error: "platillo_id, cantidad y precio_unitario son requeridos" });
  }

  const subtotal = cantidad * precio_unitario;

  createDetalle({ pedido_id, platillo_id, cantidad, precio_unitario, subtotal, nota }, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al agregar detalle" });
    res.status(201).json({ message: "Detalle agregado 🚀", id: results.insertId });
  });
};

// Eliminar detalle
export const eliminarDetalle = (req, res) => {
  const { id } = req.params;

  deleteDetalle(id, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al eliminar detalle" });
    if (results.affectedRows === 0) return res.status(404).json({ message: "Detalle no encontrado" });
    res.json({ message: "Detalle eliminado 🗑️" });
  });
};
