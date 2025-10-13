import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import db from "../config/db.js";

// =============================
// 📌 Registrar usuario
// =============================
export const register = async (req, res) => {
  const { nombre, usuario, password, rol } = req.body;

  try {
    // Verificar si el usuario ya existe
    const [rows] = await db.promise().query(
      "SELECT * FROM usuarios WHERE usuario = ?",
      [usuario]
    );

    if (rows.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar en DB
    await db.promise().query(
      "INSERT INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)",
      [nombre, usuario, hashedPassword, rol]
    );

    res.status(201).json({ message: "Usuario registrado con éxito 🚀" });
  } catch (error) {
    console.error("❌ Error en registro:", error);
    res.status(500).json({ message: "Error en el registro" });
  }
};

// =============================
// 📌 Login usuario
// =============================
export const login = async (req, res) => {
  const { usuario, password } = req.body;

  try {
    // Buscar usuario
    const [rows] = await db.promise().query(
      "SELECT * FROM usuarios WHERE usuario = ?",
      [usuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = generateToken(user);

    res.json({
      message: "Login exitoso ✅",
      token,
      usuario: { id: user.id, nombre: user.nombre, rol: user.rol },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error en el login" });
  }
};
