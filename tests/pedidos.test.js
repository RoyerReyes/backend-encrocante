import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import db from '../src/config/db.js';

describe('Pedidos API', () => {
  let adminToken;
  let meseroToken;
  let platilloId;

  beforeAll(() => {
    // Generar tokens para admin y mesero una sola vez
    const adminPayload = { id: 1, rol: 'admin', nombre: 'Test Admin' };
    adminToken = jwt.sign(adminPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    const meseroPayload = { id: 2, rol: 'mesero', nombre: 'Test Mesero' };
    meseroToken = jwt.sign(meseroPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  beforeEach(async () => {
    // Usar una única conexión para asegurar que SET FOREIGN_KEY_CHECKS afecte a los TRUNCATE
    const connection = await db.promise().getConnection();
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      await connection.query('TRUNCATE TABLE detalle_pedido');
      await connection.query('TRUNCATE TABLE pagos');
      await connection.query('TRUNCATE TABLE pedidos');
      await connection.query('TRUNCATE TABLE usuarios'); // Truncate Users
      await connection.query('TRUNCATE TABLE platillos');
      await connection.query('TRUNCATE TABLE categorias');
      await connection.query('TRUNCATE TABLE mesas');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');

      // Crear usuarios de prueba (Admin y Mesero)
      await connection.query("INSERT IGNORE INTO usuarios (id, nombre, usuario, password, rol, activo) VALUES (1, 'Test Admin', 'admin', 'hashedpass', 'admin', 1)");
      await connection.query("INSERT IGNORE INTO usuarios (id, nombre, usuario, password, rol, activo) VALUES (2, 'Test Mesero', 'mesero', 'hashedpass', 'mesero', 1)");

      // Crear data de prueba
      await connection.query("INSERT IGNORE INTO categorias (id, nombre) VALUES (1, 'Entradas Test')");

      const [platilloResult] = await connection.query(
        "INSERT INTO platillos (nombre, precio, categoria_id, activo) VALUES ('Platillo para Pedido Test', 15.00, 1, 1)"
      );
      platilloId = platilloResult.insertId;

      await connection.query("INSERT IGNORE INTO mesas (id, numero, capacidad) VALUES (1, '1', 4)");
    } finally {
      connection.release();
    }
  });

  afterAll(async () => {
    // Limpieza final y cierre de la conexión
    const connection = await db.promise().getConnection();
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      await connection.query('TRUNCATE TABLE detalle_pedido');
      await connection.query('TRUNCATE TABLE pagos');
      await connection.query('TRUNCATE TABLE pedidos');
      await connection.query('TRUNCATE TABLE platillos');
      await connection.query('TRUNCATE TABLE mesas');
      await connection.query('TRUNCATE TABLE categorias');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
      connection.release();
      db.end();
    }
  });

  describe('GET /pedidos', () => {
    it('debería obtener una lista de pedidos con rol admin', async () => {
      // Crear un pedido para asegurar que la lista no esté vacía
      await request(app)
        .post('/pedidos')
        .set('Authorization', `Bearer ${meseroToken}`)
        .send({
          tipo: 'mesa',
          mesa_id: 1, // Enviar ID explícito
          cliente_id: null,
          nombre_cliente: 'Test Client',
          detalles: [{ platillo_id: platilloId, cantidad: 1 }]
        });

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

  describe('PATCH /pedidos/:id/estado', () => {
    it('debería actualizar el estado de un pedido con rol admin y responder con 200', async () => {
      // 1. Crear un pedido para actualizar
      const nuevoPedidoRes = await request(app)
        .post('/pedidos')
        .set('Authorization', `Bearer ${meseroToken}`)
        .send({
          tipo: 'mesa',
          mesa_id: 1,
          cliente_id: null,
          nombre_cliente: 'Test Client',
          detalles: [{ platillo_id: platilloId, cantidad: 1 }]
        });

      // Check validation helper or controller logic if this fails (e.g. mesa not found)
      if (nuevoPedidoRes.statusCode !== 201) {
        console.error('Error creando pedido en test:', nuevoPedidoRes.body);
      }
      expect(nuevoPedidoRes.statusCode).toBe(201);

      const pedidoCreadoId = nuevoPedidoRes.body.pedido.id;

      // 2. Actualizar el pedido
      const response = await request(app)
        .patch(`/pedidos/${pedidoCreadoId}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado: 'en_preparacion' });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Estado del pedido actualizado a "en_preparacion"');
    });

    it('debería responder con 403 si un mesero intenta actualizar el estado', async () => {
      // 1. Crear un pedido
      const nuevoPedidoRes = await request(app)
        .post('/pedidos')
        .set('Authorization', `Bearer ${meseroToken}`)
        .send({
          tipo: 'mesa',
          mesa_id: 1,
          cliente_id: null,
          nombre_cliente: 'Test Client',
          detalles: [{ platillo_id: platilloId, cantidad: 1 }]
        });
      const pedidoCreadoId = nuevoPedidoRes.body.pedido.id;

      // 2. Intentar actualizar con mesero
      const response = await request(app)
        .patch(`/pedidos/${pedidoCreadoId}/estado`)
        .set('Authorization', `Bearer ${meseroToken}`)
        .send({ estado: 'entregado' });

      expect(response.statusCode).toBe(403);
    });

    it('debería responder con 404 si el pedido a actualizar no existe', async () => {
      const response = await request(app)
        .patch('/pedidos/99999/estado')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado: 'pagado' });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /pedidos/:id', () => {
    it('debería responder con 403 si un mesero intenta eliminar un pedido', async () => {
      // 1. Crear un pedido
      const nuevoPedidoRes = await request(app)
        .post('/pedidos')
        .set('Authorization', `Bearer ${meseroToken}`)
        .send({
          tipo: 'mesa',
          mesa_id: 1,
          cliente_id: null,
          nombre_cliente: 'Test Client',
          detalles: [{ platillo_id: platilloId, cantidad: 1 }]
        });
      const pedidoCreadoId = nuevoPedidoRes.body.pedido.id;

      // 2. Intentar eliminar con mesero
      const response = await request(app)
        .delete(`/pedidos/${pedidoCreadoId}`)
        .set('Authorization', `Bearer ${meseroToken}`);

      expect(response.statusCode).toBe(403);
    });

    it('debería eliminar un pedido con rol admin y responder con 200', async () => {
      // 1. Crear un pedido para eliminar
      const nuevoPedidoRes = await request(app)
        .post('/pedidos')
        .set('Authorization', `Bearer ${meseroToken}`)
        .send({
          tipo: 'mesa',
          mesa_id: 1,
          cliente_id: null,
          nombre_cliente: 'Test Client',
          detalles: [{ platillo_id: platilloId, cantidad: 1 }]
        });
      const pedidoCreadoId = nuevoPedidoRes.body.pedido.id;

      // 2. Eliminar el pedido
      const response = await request(app)
        .delete(`/pedidos/${pedidoCreadoId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Pedido eliminado exitosamente');
    });

    it('debería responder con 404 si el pedido a eliminar no existe', async () => {
      const response = await request(app)
        .delete('/pedidos/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(404);
    });
  });
});