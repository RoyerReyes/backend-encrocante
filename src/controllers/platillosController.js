import { 
  getAllPlatillos, 
  getPlatilloById, 
  createPlatillo, 
  updatePlatillo, 
  deletePlatillo 
} from "../models/platillo.js";

// GET todos los platillos
export const listarPlatillos = async (req, res, next) => {
  try {
    const platillos = await getAllPlatillos();
    res.json(platillos);
  } catch (error) {
    next(error);
  }
};

// GET platillo por ID
export const obtenerPlatillo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const platillo = await getPlatilloById(id);
    if (!platillo) {
      return res.status(404).json({ message: "Platillo no encontrado" });
    }
    res.json(platillo);
  } catch (error) {
    next(error);
  }
};

// POST crear platillo
export const crearPlatillo = async (req, res, next) => {
  try {
    const { nombre, precio, categoria_id, activo } = req.body;

    const nuevoPlatillo = await createPlatillo({ nombre, precio, categoria_id, activo: activo ?? true });
    res.status(201).json({
      message: "Platillo creado 🚀",
      platillo: nuevoPlatillo
    });
  } catch (error) {
    next(error);
  }
};

// PUT actualizar platillo
export const actualizarPlatillo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await updatePlatillo(id, data);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Platillo no encontrado" });
    }
    res.json({ message: "Platillo actualizado ✅" });
  } catch (error) {
    next(error);
  }
};

// DELETE eliminar platillo
export const eliminarPlatillo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deletePlatillo(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Platillo no encontrado" });
    }
    res.json({ message: "Platillo eliminado 🗑️" });
  } catch (error) {
    next(error);
  }
};