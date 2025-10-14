import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import db from '../src/config/db.js';

describe('GET /platillos', () => {
  let token;

  beforeAll(async () => {
    // Generamos un token JWT para un usuario con rol 'admin' para usar en las pruebas
    const payload = { id: 99, rol: 'admin', nombre: 'Test Admin' };
    token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Limpiar la tabla para un estado de prueba limpio
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 0');
    await db.promise().query('TRUNCATE TABLE platillos');
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 1');
  });

  afterAll(async () => {
    // La conexión a la base de datos se gestiona de forma global
    db.end();
  });

  it('debería responder con un código de estado 200 y un array de platillos', async () => {
    const response = await request(app)
      .get('/platillos')
      .set('Authorization', `Bearer ${token}`); // Adjuntamos el token

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('debería responder con 401 si no se proporciona un token', async () => {
    const response = await request(app).get('/platillos').send();
    expect(response.statusCode).toBe(401); // O 403 dependiendo de la implementación del middleware
  });

  describe('POST /platillos', () => {
    it('debería crear un nuevo platillo y responder con 201', async () => {
      const nuevoPlatillo = {
        nombre: 'Platillo de Prueba',
        precio: 12.34,
        categoria_id: 1, // Asume que la categoría 1 existe
      };

      const response = await request(app)
        .post('/platillos')
        .set('Authorization', `Bearer ${token}`)
        .send(nuevoPlatillo);

      expect(response.statusCode).toBe(201);
      expect(response.body.platillo).toHaveProperty('id');
      expect(response.body.platillo.nombre).toBe(nuevoPlatillo.nombre);
    });

    it('debería responder con 400 si los datos son inválidos', async () => {
      const response = await request(app)
        .post('/platillos')
        .set('Authorization', `Bearer ${token}`)
        .send({}); // Enviamos un cuerpo vacío para que falle la validación
      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /platillos/:id', () => {
    it('debería eliminar un platillo existente y responder con 200', async () => {
      // 1. Crear un platillo para obtener un ID
      const platilloCreado = await request(app)
        .post('/platillos')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Platillo a Eliminar', precio: 5.0, categoria_id: 1 });
      
      const platilloId = platilloCreado.body.platillo.id;

      // 2. Eliminar el platillo
      const deleteResponse = await request(app)
        .delete(`/platillos/${platilloId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.body.message).toContain('eliminado');

      // 3. Verificar que el platillo ya no existe
      const getResponse = await request(app)
        .get(`/platillos/${platilloId}`).set('Authorization', `Bearer ${token}`);
      
      expect(getResponse.statusCode).toBe(404);
    });

    it('debería responder con 404 si el platillo a eliminar no existe', async () => {
      const response = await request(app)
        .delete('/platillos/99999')
        .set('Authorization', `Bearer ${token}`);
      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /platillos/:id', () => {
    it('debería actualizar un platillo existente y responder con 200', async () => {
      // 1. Crear un platillo para obtener un ID
      const platilloCreado = await request(app)
        .post('/platillos')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Platillo Original', precio: 10.0, categoria_id: 1 });
      
      const platilloId = platilloCreado.body.platillo.id;

      // 2. Actualizar el platillo
      const response = await request(app)
        .put(`/platillos/${platilloId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Platillo Actualizado' });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toContain('actualizado');
    });

    it('debería responder con 404 si el platillo a actualizar no existe', async () => {
      const response = await request(app)
        .put('/platillos/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Nuevo Nombre' });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /platillos/:id', () => {
    it('debería responder con 200 y el platillo correcto si el ID existe', async () => {
      // 1. Crear un platillo para obtener un ID
      const platilloCreado = await request(app)
        .post('/platillos')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Platillo para GET', precio: 20.0, categoria_id: 1 });
      
      const platilloId = platilloCreado.body.platillo.id;

      // 2. Obtener el platillo por su ID
      const response = await request(app)
        .get(`/platillos/${platilloId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', platilloId);
      expect(response.body).toHaveProperty('nombre', 'Platillo para GET');
    });

    it('debería responder con 404 si el platillo no existe', async () => {
      const response = await request(app)
        .get('/platillos/99999') // Un ID que probablemente no exista
        .set('Authorization', `Bearer ${token}`);
      expect(response.statusCode).toBe(404);
    });
  });

  it('debería responder con 403 si el token es inválido', async () => {
    const response = await request(app)
      .get('/platillos')
      .set('Authorization', 'Bearer tokeninvalido');
    expect(response.statusCode).toBe(403);
  });
});
