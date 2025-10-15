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
    // Limpiar y preparar la BD antes de cada prueba
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 0');
    await db.promise().query('TRUNCATE TABLE detalle_pedido');
    await db.promise().query('TRUNCATE TABLE pagos');
    await db.promise().query('TRUNCATE TABLE pedidos');
    await db.promise().query('TRUNCATE TABLE platillos');
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 1');

    // Crear un platillo de prueba para usar en los pedidos
    const [platilloResult] = await db.promise().query(
      "INSERT INTO platillos (nombre, precio, categoria_id, activo) VALUES ('Platillo para Pedido Test', 15.00, 1, 1)"
    );
    platilloId = platilloResult.insertId;
  });

  afterAll(async () => {
    // Limpieza final y cierre de la conexión
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 0');
    await db.promise().query('TRUNCATE TABLE detalle_pedido');
    await db.promise().query('TRUNCATE TABLE pagos');
    await db.promise().query('TRUNCATE TABLE pedidos');
    await db.promise().query('TRUNCATE TABLE platillos');
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 1');
    db.end();
  });

  describe('GET /pedidos', () => {
    it('debería obtener una lista de pedidos con rol admin', async () => {
      // Crear un pedido para asegurar que la lista no esté vacía
      await request(app)
        .post('/pedidos')
        .set('Authorization', `Bearer ${meseroToken}`)
        .send({ tipo: 'mesa', mesa_id: 1, cliente_id: 1, detalles: [{ platillo_id: platilloId, cantidad: 1 }] });

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
        .send({ tipo: 'mesa', mesa_id: 1, cliente_id: 1, detalles: [{ platillo_id: platilloId, cantidad: 1 }] });
      const pedidoCreadoId = nuevoPedidoRes.body.pedido.id;

      // 2. Actualizar el pedido
      const response = await request(app)
        .patch(`/pedidos/${pedidoCreadoId}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado: 'en cocina' });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Estado actualizado ✅');
    });

    it('debería responder con 403 si un mesero intenta actualizar el estado', async () => {
      // 1. Crear un pedido
      const nuevoPedidoRes = await request(app)
        .post('/pedidos')
        .set('Authorization', `Bearer ${meseroToken}`)
        .send({ tipo: 'mesa', mesa_id: 1, cliente_id: 1, detalles: [{ platillo_id: platilloId, cantidad: 1 }] });
      const pedidoCreadoId = nuevoPedidoRes.body.pedido.id;

      // 2. Intentar actualizar con mesero
      const response = await request(app)
        .patch(`/pedidos/${pedidoCreadoId}/estado`)
        .set('Authorization', `Bearer ${meseroToken}`)
        .send({ estado: 'servido' });
      
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
        .send({ tipo: 'mesa', mesa_id: 1, cliente_id: 1, detalles: [{ platillo_id: platilloId, cantidad: 1 }] });
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
        .send({ tipo: 'mesa', mesa_id: 1, cliente_id: 1, detalles: [{ platillo_id: platilloId, cantidad: 1 }] });
      const pedidoCreadoId = nuevoPedidoRes.body.pedido.id;

      // 2. Eliminar el pedido
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