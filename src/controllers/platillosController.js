import platilloService from "../services/platilloService.js";

// GET todos los platillos
export const listarPlatillos = async (req, res, next) => {
  try {
    const platillos = await platilloService.listarPlatillos();
    res.json(platillos);
  } catch (error) {
    next(error);
  }
};

// GET platillo por ID
export const obtenerPlatillo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const platillo = await platilloService.obtenerPlatillo(id);
    res.json(platillo);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json(error);
    next(error);
  }
};

// POST crear platillo
export const crearPlatillo = async (req, res, next) => {
  try {
    console.log('crearPlatillo Request Body:', req.body);
    console.log('crearPlatillo Request File:', req.file);

    // Si se subió un archivo, req.file tendrá los datos
    if (req.file) {
      // Construir URL pública: /uploads/platillos/nombre_archivo.jpg
      req.body.imagen_url = `/uploads/platillos/${req.file.filename}`;
      console.log('crearPlatillo: Added imagen_url to req.body:', req.body.imagen_url);
    } else {
      console.log('crearPlatillo: No file uploaded');
    }

    console.log('crearPlatillo: Calling service with:', req.body);
    const nuevoPlatillo = await platilloService.crearPlatillo(req.body);
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

    // Si se subió un archivo, actualizar imagen_url
    if (req.file) {
      req.body.imagen_url = `/uploads/platillos/${req.file.filename}`;
    }

    await platilloService.actualizarPlatillo(id, req.body);
    res.json({ message: "Platillo actualizado ✅" });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json(error);
    next(error);
  }
};

// DELETE eliminar platillo
export const eliminarPlatillo = async (req, res, next) => {
  try {
    const { id } = req.params;
    await platilloService.eliminarPlatillo(id);
    res.json({ message: "Platillo eliminado 🗑️" });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json(error);
    next(error);
  }
};