import db from "../config/db.js";

// Buscar por DNI
export const findByDni = async (dni) => {
    const [rows] = await db.promise().query("SELECT * FROM clientes WHERE dni = ?", [dni]);
    return rows[0];
};

// Crear cliente
export const createCliente = async (clienteData) => {
    const { nombre, dni, telefono, email } = clienteData;
    const [result] = await db.promise().query(
        "INSERT INTO clientes (nombre, dni, telefono, email) VALUES (?, ?, ?, ?)",
        [nombre, dni, telefono, email]
    );
    return { id: result.insertId, ...clienteData, puntos: 0 };
};

// Listar clientes (búsqueda parcial por nombre o dni)
export const searchClientes = async (term) => {
    const searchTerm = `%${term}%`;
    const [rows] = await db.promise().query(
        "SELECT * FROM clientes WHERE nombre LIKE ? OR dni LIKE ? LIMIT 10",
        [searchTerm, searchTerm]
    );
    return rows;
};

// Actualizar puntos
export const updatePuntos = async (id, puntos) => {
    const [result] = await db.promise().query(
        "UPDATE clientes SET puntos = puntos + ? WHERE id = ?",
        [puntos, id]
    );
    return result;
};
