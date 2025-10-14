import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import * as UserModel from "../models/usuario.js";

// =============================
// 📌 Registrar usuario
// =============================
export const register = async (req, res, next) => {
  try {
    const { nombre, usuario, password, rol } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findByUsername(usuario);
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Crear usuario
    await UserModel.create({ nombre, usuario, password, rol });

    res.status(201).json({ message: "Usuario registrado con éxito 🚀" });
  } catch (error) {
    next(error);
  }
};

// =============================
// 📌 Login usuario
// =============================
export const login = async (req, res, next) => {
  try {
    const { usuario, password } = req.body;

    // Buscar usuario y verificar contraseña
    const user = await UserModel.findByUsername(usuario);
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isMatch) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    // Generar token JWT
    const token = generateToken(user);

    res.json({
      message: "Login exitoso ✅",
      token,
      usuario: { id: user.id, nombre: user.nombre, usuario: user.usuario, rol: user.rol },
    });
  } catch (error) {
    next(error);
  }
};
