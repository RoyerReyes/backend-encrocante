
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import db from '../src/config/db.js';

describe('Pedidos API', () => {
  let adminToken;
  let meseroToken;
  let pedidoCreadoId;

  beforeAll(async () => {
    // Generar tokens para admin y mesero
    const adminPayload = { id: 1, rol: 'admin', nombre: 'Test Admin' };
    adminToken = jwt.sign(adminPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    const meseroPayload = { id: 2, rol: 'mesero', nombre: 'Test Mesero' };
    meseroToken = jwt.sign(meseroPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Limpiar las tablas relacionadas antes de empezar
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 0');
    await db.promise().query('TRUNCATE TABLE detalle_pedido');
    await db.promise().query('TRUNCATE TABLE pagos');
    await db.promise().query('TRUNCATE TABLE pedidos');
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 1');
  });

  afterAll(async () => {
    await db.promise().end();
  });

  describe('POST /pedidos', () => {
    it('debería crear un nuevo pedido con rol mesero y responder con 201', async () => {
      const nuevoPedido = {
        tipo: 'mesa',
        total: 50.00,
        // Asumimos que existen mesa_id: 1 y cliente_id: 1 en la BD de prueba
        mesa_id: 1, 
        cliente_id: 1
      };

      const response = await request(app)
        .post('/pedidos')
        .set('Authorization', `Bearer ${meseroToken}`)
        .send(nuevoPedido);

      expect(response.statusCode).toBe(201);
      expect(response.body.pedido).toHaveProperty('id');
      expect(response.body.message).toBe('Pedido creado 🚀');
      pedidoCreadoId = response.body.pedido.id; // Guardamos el ID para pruebas futuras
    });

    it('debería responder con 400 si los datos para crear el pedido son inválidos', async () => {
      const response = await request(app)
        .post('/pedidos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ total: 'esto no es un numero' }); // Datos inválidos
      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /pedidos', () => {
    it('debería obtener una lista de pedidos con rol admin', async () => {
      const response = await request(app)
        .get('/pedidos')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('debería responder con 401 si no se proporciona token', async () => {
      const response = await request(app).get('/pedidos');
      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /pedidos/:id', () => {
    it('debería actualizar el estado de un pedido con rol admin y responder con 200', async () => {
      const response = await request(app)
        .put(`/pedidos/${pedidoCreadoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado: 'en cocina' });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Estado actualizado ✅');
    });

    it('debería responder con 403 si un mesero intenta actualizar el estado', async () => {
      const response = await request(app)
        .put(`/pedidos/${pedidoCreadoId}`)
        .set('Authorization', `Bearer ${meseroToken}`)
        .send({ estado: 'servido' });
      
      expect(response.statusCode).toBe(403);
    });

    it('debería responder con 404 si el pedido a actualizar no existe', async () => {
      const response = await request(app)
        .put('/pedidos/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado: 'pagado' });
      
      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /pedidos/:id', () => {
    it('debería responder con 403 si un mesero intenta eliminar un pedido', async () => {
      const response = await request(app)
        .delete(`/pedidos/${pedidoCreadoId}`)
        .set('Authorization', `Bearer ${meseroToken}`);
      
      expect(response.statusCode).toBe(403);
    });

    it('debería eliminar un pedido con rol admin y responder con 200', async () => {
      const response = await request(app)
        .delete(`/pedidos/${pedidoCreadoId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Pedido eliminado 🗑️');
    });

    it('debería responder con 404 si el pedido a eliminar no existe', async () => {
      const response = await request(app)
        .delete('/pedidos/99999')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.statusCode).toBe(404);
    });
  });
});
