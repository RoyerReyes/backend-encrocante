const express = require('express');
const router = express.Router();

// Importamos los usuarios del mock para que las rutas operen sobre los mismos datos
let { users } = require('./auth.js');

/**
 * GET /api/usuarios
 * Lista todos los usuarios.
 */
router.get('/', (req, res) => {
    const usersWithoutPasswords = users.map(u => {
        const { password, ...userResponse } = u;
        return userResponse;
    });
    res.json(usersWithoutPasswords);
});

/**
 * GET /api/usuarios/:id
 * Obtiene un usuario por ID.
 */
router.get('/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const user = users.find(u => u.id === userId);

    if (user) {
        const { password, ...userResponse } = user;
        res.json(userResponse);
    } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
    }
});

/**
 * PATCH /api/usuarios/:id
 * Actualiza un usuario (implementación corregida).
 */
router.patch('/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Aplicar actualización parcial
    const originalUser = users[userIndex];
    const updatedUser = { ...originalUser, ...req.body };
    users[userIndex] = updatedUser;

    const { password, ...userResponse } = updatedUser;
    res.status(200).json(userResponse);
});

/**
 * DELETE /api/usuarios/:id
 * Elimina un usuario (implementación corregida).
 */
router.delete('/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        // Devuelve 404 si el usuario no existe, como se documenta.
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Elimina al usuario
    users.splice(userIndex, 1);

    // Devuelve 204 No Content, como se solicitó.
    res.status(204).send();
});


module.exports = router;