import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import db from '../src/config/db.js';

describe('Detalle Pedido API', () => {
  let adminToken;
  let pedidoId;
  let platilloId;
  let detalleId;

  beforeAll(async () => {
    // 1. Generar token de admin
    const adminPayload = { id: 1, rol: 'admin', nombre: 'Test Admin' };
    adminToken = jwt.sign(adminPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 2. Limpiar tablas
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 0');
    await db.promise().query('TRUNCATE TABLE detalle_pedido');
    await db.promise().query('TRUNCATE TABLE pedidos');
    await db.promise().query('TRUNCATE TABLE platillos');
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 1');

    // 3. Crear datos de prueba (un platillo y un pedido)
    const [platilloResult] = await db.promise().query(
      "INSERT INTO platillos (nombre, precio, categoria_id) VALUES ('Platillo de Prueba', 10.00, 1)"
    );
    platilloId = platilloResult.insertId;

    const [pedidoResult] = await db.promise().query(
      "INSERT INTO pedidos (tipo, total, usuario_id, mesa_id, cliente_id) VALUES ('mesa', 0, 1, 1, 1)"
    );
    pedidoId = pedidoResult.insertId;
  });

  afterAll(async () => {
    // La conexión a la base de datos se gestiona de forma global
    db.end();
  });

  describe('POST /detalle-pedido/:pedido_id', () => {
    it('debería agregar un detalle a un pedido, calcular el subtotal en el backend y responder con 201', async () => {
      const nuevoDetalle = {
        platillo_id: platilloId,
        cantidad: 2,
        nota: 'Sin cebolla'
      };

      const response = await request(app)
        .post(`/detalle-pedido/${pedidoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevoDetalle);

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('Detalle agregado 🚀');
      expect(response.body.detalle).toHaveProperty('id');
      expect(response.body.detalle.cantidad).toBe(2);
      // Verificar que el subtotal fue calculado por el backend (2 * 10.00)
      expect(response.body.detalle.subtotal).toBe('20.00'); 
      detalleId = response.body.detalle.id; // Guardamos para pruebas futuras
    });

    it('debería responder con 400 si faltan datos requeridos (cantidad)', async () => {
        const response = await request(app)
          .post(`/detalle-pedido/${pedidoId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ platillo_id: platilloId, nota: 'test' }); // Falta cantidad
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Datos de entrada inválidos');
        expect(response.body.errors[0].field).toBe('cantidad');
    });
  });

  describe('GET /detalle-pedido/:pedido_id', () => {
    it('debería listar los detalles de un pedido específico', async () => {
      const response = await request(app)
        .get(`/detalle-pedido/${pedidoId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].platillo).toBe('Platillo de Prueba');
    });
  });

  describe('PUT /detalle-pedido/:id', () => {
    it('debería actualizar la cantidad, recalcular el subtotal y responder con 200', async () => {
      const updateData = { cantidad: 3, nota: 'Extra picante' };
      
      const response = await request(app)
        .put(`/detalle-pedido/${detalleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Detalle actualizado ✅');

      // Verificar que el subtotal se recalculó en la base de datos
      const [updatedDetalle] = await db.promise().query('SELECT subtotal FROM detalle_pedido WHERE id = ?', [detalleId]);
      expect(updatedDetalle[0].subtotal).toBe('30.00'); // 3 * 10.00
    });

    it('debería responder con 404 si el detalle no existe', async () => {
        const response = await request(app)
          .put('/detalle-pedido/9999')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ cantidad: 1 });
        expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /detalle-pedido/:id', () => {
    it('debería eliminar un detalle de pedido', async () => {
      const response = await request(app)
        .delete(`/detalle-pedido/${detalleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Detalle eliminado 🗑️');
    });

    it('debería responder con 404 si el detalle a eliminar no existe', async () => {
        const response = await request(app)
          .delete('/detalle-pedido/9999')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(404);
    });
  });
});