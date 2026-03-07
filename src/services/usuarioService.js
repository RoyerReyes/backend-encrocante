import * as UserModel from '../models/usuario.js';

class UsuarioService {

    async listarUsuarios() {
        return await UserModel.getAll();
    }

    async obtenerUsuario(id) {
        const usuario = await UserModel.findById(id);
        if (!usuario) {
            throw { statusCode: 404, message: 'Usuario no encontrado' };
        }
        return usuario;
    }

    async actualizarUsuario(id, data) {
        const { nombre, usuario, rol } = data;
        const result = await UserModel.update(id, { nombre, usuario, rol });

        if (result.affectedRows === 0) {
            throw { statusCode: 404, message: 'Usuario no encontrado' };
        }
        return { message: 'Usuario actualizado correctamente ✅' };
    }

    async eliminarUsuario(id) {
        const result = await UserModel.remove(id);
        if (result.affectedRows === 0) {
            throw { statusCode: 404, message: 'Usuario no encontrado' };
        }
        return { message: 'Usuario eliminado correctamente 🗑️' };
    }
}

export default new UsuarioService();
