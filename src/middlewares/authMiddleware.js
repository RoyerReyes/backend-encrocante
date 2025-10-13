import jwt from "jsonwebtoken";

/**
 * Middleware para verificar si el usuario está autenticado mediante JWT
 */
export const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
  }

  try {
    // Verificamos el token con la clave secreta de .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos la info del usuario en la request
    req.user = decoded;

    next(); // Pasamos al siguiente middleware/controlador
  } catch (err) {
    return res.status(403).json({ message: "Token inválido o expirado." });
  }
};

/**
 * Middleware para validar el rol del usuario
 * @param {...string} rolesPermitidos → Ejemplo: ["admin", "mesero"]
 */
export const checkRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ message: "Acceso denegado. No tienes permisos suficientes." });
    }
    next();
  };
};
