
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import db from '../src/config/db.js';

describe('Usuarios API', () => {
  let adminToken;
  let meseroToken;
  let usuarioCreadoId;

  beforeAll(async () => {
    // Generar tokens
    adminToken = jwt.sign({ id: 1, rol: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    meseroToken = jwt.sign({ id: 2, rol: 'mesero' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Limpiar y crear un usuario de prueba
    await db.promise().query('DELETE FROM usuarios WHERE usuario LIKE "test.user%"');
    const [result] = await db.promise().query(
      'INSERT INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)',
      ['Test User', 'test.user.todelete', 'password123', 'mesero']
    );
    usuarioCreadoId = result.insertId;
  });

  afterAll(async () => {
    await db.promise().end();
  });

  describe('GET /usuarios', () => {
    it('debería devolver una lista de usuarios para un admin', async () => {
      const res = await request(app)
        .get('/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('debería denegar el acceso a un mesero', async () => {
      const res = await request(app)
        .get('/usuarios')
        .set('Authorization', `Bearer ${meseroToken}`);
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('GET /usuarios/:id', () => {
    it('debería devolver un usuario específico para un admin', async () => {
      const res = await request(app)
        .get(`/usuarios/${usuarioCreadoId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', usuarioCreadoId);
    });

    it('debería devolver 404 si el usuario no existe', async () => {
      const res = await request(app)
        .get('/usuarios/999999')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /usuarios/:id', () => {
    it('debería actualizar un usuario para un admin', async () => {
      const res = await request(app)
        .put(`/usuarios/${usuarioCreadoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Test User Updated', usuario: 'test.user.updated', rol: 'mesero' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('actualizado');
    });

    it('debería devolver 400 por datos inválidos', async () => {
      const res = await request(app)
        .put(`/usuarios/${usuarioCreadoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rol: 'rol_invalido' });
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('DELETE /usuarios/:id', () => {
    it('debería eliminar un usuario para un admin', async () => {
      const res = await request(app)
        .delete(`/usuarios/${usuarioCreadoId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('eliminado');
    });

    it('debería devolver 404 si el usuario a eliminar no existe', async () => {
      // Usamos un ID que es muy improbable que exista para asegurar que la prueba es independiente.
      const res = await request(app)
        .delete('/usuarios/999999')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });
  });
});
