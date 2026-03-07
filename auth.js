const express = require('express');
const router = express.Router();

// --- Mock de la Base de Datos y Funciones ---
// En un backend real, esto interactuaría con una base de datos.
let users = [
    { id: 1, nombre: "Usuario Admin", email: "admin@example.com", rol: "admin", password: "hashed_password_1" },
    { id: 2, nombre: "Usuario Mesero", email: "mesero@example.com", rol: "mesero", password: "hashed_password_2" }
];
let nextUserId = 3;
// ---------------------------------------------

/**
 * POST /api/auth/register
 * Registra (Crea) un nuevo usuario.
 */
router.post('/register', (req, res) => {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    if (users.some(u => u.email === email)) {
        return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
    }

    const newUser = {
        id: nextUserId++,
        nombre,
        email,
        rol,
        password: `hashed_${password}` // Simula el hash de la contraseña
    };

    users.push(newUser);
    const { password: _, ...userResponse } = newUser; // No devolver la contraseña
    res.status(201).json(userResponse);
});

module.exports = { router, users };