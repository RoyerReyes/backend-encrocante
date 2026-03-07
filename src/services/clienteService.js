import * as ClienteModel from "../models/cliente.js";
import { CONFIG_PUNTOS } from "../constants/appConfig.js";

class ClienteService {

    async buscarCliente(termino) {
        if (!termino) return [];
        return await ClienteModel.searchClientes(termino);
    }

    async registrarCliente(data) {
        const { dni } = data;
        const existing = await ClienteModel.findByDni(dni);
        if (existing) {
            throw { statusCode: 400, message: "El cliente con este DNI ya existe" };
        }
        return await ClienteModel.createCliente(data);
    }

    async sumarPuntos(clienteId, montoCompra) {
        // Lógica de lealtad: Puntos configurables
        const puntosGanados = Math.floor(montoCompra / CONFIG_PUNTOS.SOLES_POR_PUNTO);
        if (puntosGanados > 0) {
            await ClienteModel.updatePuntos(clienteId, puntosGanados);
        }
        return puntosGanados;
    }
}

export default new ClienteService();
