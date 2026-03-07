import {
    getAllPlatillos,
    getPlatilloById,
    createPlatillo,
    updatePlatillo,
    deletePlatillo
} from "../models/platillo.js";

class PlatilloService {

    async listarPlatillos() {
        return await getAllPlatillos();
    }

    async obtenerPlatillo(id) {
        const platillo = await getPlatilloById(id);
        if (!platillo) {
            throw { statusCode: 404, message: "Platillo no encontrado" };
        }
        return platillo;
    }

    async crearPlatillo(data) {
        const { nombre, descripcion, precio, imagen_url, categoria_id, activo } = data;

        // Podríamos añadir validaciones aquí (precio > 0, nombre único, etc.)
        const result = await createPlatillo({ nombre, descripcion, precio, imagen_url, categoria_id, activo: activo ?? true });
        return await this.obtenerPlatillo(result.id);
    }

    async actualizarPlatillo(id, data) {
        const result = await updatePlatillo(id, data);
        if (result.affectedRows === 0) {
            throw { statusCode: 404, message: "Platillo no encontrado" };
        }
        return result;
    }

    async eliminarPlatillo(id) {
        try {
            const result = await deletePlatillo(id);
            if (result.affectedRows === 0) {
                throw { statusCode: 404, message: "Platillo no encontrado" };
            }
            return result;
        } catch (error) {
            // Check for MySQL Foreign Key Constraint error (Error 1451)
            if (error.errno === 1451) {
                throw {
                    statusCode: 409,
                    message: "No se puede eliminar el platillo porque tiene pedidos asociados. Te recomendamos desactivarlo en su lugar."
                };
            }
            throw error;
        }
    }
}

export default new PlatilloService();
