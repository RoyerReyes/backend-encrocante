import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import * as UserModel from "../models/usuario.js";

class AuthService {

    async register(data) {
        const { nombre, usuario, password, rol } = data;

        // Verificar si existe
        const existingUser = await UserModel.findByUsername(usuario);
        if (existingUser) {
            throw { statusCode: 400, message: "El usuario ya existe" };
        }

        // Crear
        await UserModel.create({ nombre, usuario, password, rol });
        return { message: "Usuario registrado con éxito 🚀" };
    }

    async login(credentials) {
        const { usuario, password } = credentials;

        // Buscar y verificar
        const user = await UserModel.findByUsername(usuario);
        const isMatch = user ? await bcrypt.compare(password, user.password) : false;

        if (!user || !isMatch) {
            throw { statusCode: 401, message: "Usuario o contraseña incorrectos" };
        }

        // Token
        const token = generateToken(user);

        return {
            message: "Login exitoso ✅",
            token,
            usuario: { id: user.id, nombre: user.nombre, usuario: user.usuario, rol: user.rol }
        };
    }
}

export default new AuthService();
