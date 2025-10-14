import request from 'supertest';
import { app } from '../src/app.js';
import db from '../src/config/db.js';

describe('Auth API', () => {

  beforeAll(async () => {
    // Limpiar la tabla de usuarios antes de todas las pruebas de autenticación
    await db.promise().query('DELETE FROM usuarios WHERE usuario LIKE "test.auth%"');
  });

  afterAll(async () => {
    // Limpiar después de las pruebas
    await db.promise().query('DELETE FROM usuarios WHERE usuario LIKE "test.auth%"');
    db.end();
  });

  // Pruebas para el registro de usuarios
  describe('POST /auth/register', () => {
    it('debería registrar un nuevo usuario correctamente y responder con 201', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nombre: 'Test Auth User',
          usuario: 'test.auth.user',
          password: 'password123',
          rol: 'mesero'
        });
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('Usuario registrado con éxito 🚀');
    });

    it('debería fallar si el usuario ya existe y responder con 400', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nombre: 'Test Auth User',
          usuario: 'test.auth.user',
          password: 'password123',
          rol: 'mesero'
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('El usuario ya existe');
    });

    it('debería fallar si los datos son inválidos (contraseña corta) y responder con 400', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nombre: 'Another User',
          usuario: 'test.auth.another',
          password: '123', // Contraseña corta
          rol: 'mesero'
        });
      expect(response.statusCode).toBe(400);
      // El mensaje exacto puede variar dependiendo de la implementación del validador
      expect(response.body.errors).toBeDefined();
    });
  });

  // Pruebas para el login de usuarios
  describe('POST /auth/login', () => {
    it('debería iniciar sesión correctamente con credenciales válidas y responder con 200', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: 'test.auth.user',
          password: 'password123'
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Login exitoso ✅');
      expect(response.body).toHaveProperty('token');
      expect(response.body.usuario.usuario).toBe('test.auth.user');
    });

    it('debería fallar con un usuario que no existe y responder con 401', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: 'nonexistent.user',
          password: 'password123'
        });
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Usuario o contraseña incorrectos');
    });

    it('debería fallar con una contraseña incorrecta y responder con 401', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          usuario: 'test.auth.user',
          password: 'wrongpassword'
        });
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Usuario o contraseña incorrectos');
    });
  });
});