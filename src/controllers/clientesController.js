import clienteService from "../services/clienteService.js";

export const buscarClientes = async (req, res, next) => {
    try {
        const { q } = req.query;
        const clientes = await clienteService.buscarCliente(q);
        res.json(clientes);
    } catch (error) {
        next(error);
    }
};

export const crearCliente = async (req, res, next) => {
    try {
        const nuevoCliente = await clienteService.registrarCliente(req.body);
        res.status(201).json(nuevoCliente);
    } catch (error) {
        if (error.statusCode) return res.status(error.statusCode).json(error);
        next(error);
    }
};
