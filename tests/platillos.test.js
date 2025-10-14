import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import db from '../src/config/db.js';

describe('GET /platillos', () => {
  let token;

  beforeAll(() => {
    // Generamos un token JWT para un usuario con rol 'admin' para usar en las pruebas
    const payload = { id: 99, rol: 'admin', nombre: 'Test Admin' };
    token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll((done) => {
    // Cierra la conexión a la base de datos después de todas las pruebas
    db.end((err) => {
      if (err) {
        console.error('Error closing the database connection:', err);
        return done(err);
      }
      done();
    });
  });

  it('debería responder con un código de estado 200 y un array de platillos', async () => {
    const response = await request(app)
      .get('/platillos')
      .set('Authorization', `Bearer ${token}`) // Adjuntamos el token
      .send();

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('debería responder con 401 si no se proporciona un token', async () => {
    const response = await request(app).get('/platillos').send();
    expect(response.statusCode).toBe(401);
  });

  it('debería responder con 403 si el token es inválido', async () => {
    const response = await request(app)
      .get('/platillos')
      .set('Authorization', 'Bearer tokeninvalido')
      .send();
    expect(response.statusCode).toBe(403);
  });
});
