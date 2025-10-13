import { 
  getAllPlatillos, 
  getPlatilloById, 
  createPlatillo, 
  updatePlatillo, 
  deletePlatillo 
} from "../models/platillo.js";

// GET todos los platillos
export const listarPlatillos = async (req, res) => {
  try {
    const platillos = await getAllPlatillos();
    res.json(platillos);
  } catch (error) {
    console.error("Error al obtener platillos:", error);
    res.status(500).json({ error: "Error al obtener los platillos" });
  }
};

// GET platillo por ID
export const obtenerPlatillo = async (req, res) => {
  try {
    const { id } = req.params;
    const platillo = await getPlatilloById(id);
    if (!platillo) {
      return res.status(404).json({ message: "Platillo no encontrado" });
    }
    res.json(platillo);
  } catch (error) {
    console.error("Error al obtener platillo:", error);
    res.status(500).json({ error: "Error al obtener el platillo" });
  }
};

// POST crear platillo
export const crearPlatillo = async (req, res) => {
  try {
    const { nombre, precio, categoria_id, activo } = req.body;

    const nuevoPlatillo = await createPlatillo({ nombre, precio, categoria_id, activo: activo ?? true });
    res.status(201).json({
      message: "Platillo creado 🚀",
      platillo: nuevoPlatillo
    });
  } catch (error) {
    console.error("Error al crear platillo:", error);
    res.status(500).json({ error: "Error al crear platillo" });
  }
};

// PUT actualizar platillo
export const actualizarPlatillo = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await updatePlatillo(id, data);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Platillo no encontrado" });
    }
    res.json({ message: "Platillo actualizado ✅" });
  } catch (error) {
    console.error("Error al actualizar platillo:", error);
    res.status(500).json({ error: "Error al actualizar platillo" });
  }
};

// DELETE eliminar platillo
export const eliminarPlatillo = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deletePlatillo(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Platillo no encontrado" });
    }
    res.json({ message: "Platillo eliminado 🗑️" });
  } catch (error) {
    console.error("Error al eliminar platillo:", error);
    res.status(500).json({ error: "Error al eliminar platillo" });
  }
};
