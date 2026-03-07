import request from "supertest";
import { io as Client } from "socket.io-client";
import { app, server } from "../src/app.js"; // Importar app y server
import db from "../src/config/db.js";

// Aumentar timeout para pruebas de integración


describe("Integración REST -> Socket.IO", () => {
  let clientSocket;
  let token;
  let usuarioId;
  const testUser = {
    nombre: "Test Mesero",
    usuario: `mesero_test_${Date.now()}`,
    password: "password123",
    rol: "mesero",
  };
  let port;
  let categoriaId;
  let platilloId;
  let mesaId;

  beforeAll(async () => {
    // 1. Iniciar servidor en puerto aleatorio
    console.log("Iniciando servidor para pruebas...");
    await new Promise((resolve) => {
      // Usar puerto 0 para que asigne uno libre
      server.listen(0, () => {
        port = server.address().port;
        console.log(`Servidor de prueba escuchando en puerto ${port}`);
        resolve();
      });
    });

    // 1.5. Seed de datos (Categoria, Platillo, Mesa)
    console.log("Sembrando datos de prueba...");
    const [catResult] = await db.promise().query("INSERT INTO categorias (nombre) VALUES (?)", ["Categoria Test"]);
    categoriaId = catResult.insertId;

    const [platResult] = await db.promise().query("INSERT INTO platillos (nombre, precio, categoria_id, activo) VALUES (?, ?, ?, ?)", ["Platillo Test", 20.00, categoriaId, 1]);
    platilloId = platResult.insertId;

    const [mesaResult] = await db.promise().query("INSERT INTO mesas (numero, capacidad) VALUES (?, ?)", ["Mesa Test", 4]);
    mesaId = mesaResult.insertId;
    console.log(`Datos sembrados: Cat=${categoriaId}, Plat=${platilloId}, Mesa=${mesaId}`);

    // 2. Registrar usuario de prueba
    console.log("Registrando usuario de prueba...", testUser);
    try {
      await request(app).post("/auth/register").send(testUser);
      console.log("Usuario registrado.");
    } catch (e) {
      console.log("Error registrando usuario (puede que ya exista):", e.message);
    }

    // 3. Login para obtener token
    console.log("Iniciando sesión...");
    const res = await request(app).post("/auth/login").send({
      usuario: testUser.usuario,
      password: testUser.password,
    });
    console.log("Respuesta login status:", res.statusCode);
    if (res.statusCode !== 200) {
      console.error("Login fallido:", res.body);
      throw new Error("No se pudo loguear para el test");
    }
    token = res.body.token;
    usuarioId = res.body.usuario.id;
    console.log("Token obtenido. Usuario ID:", usuarioId);

    // 4. Conectar cliente Socket.IO
    console.log("Conectando cliente Socket.IO...");
    clientSocket = Client(`http://localhost:${port}`, {
      auth: { token },
      transports: ["websocket"],
      reconnectionDelay: 100, // Rápido para tests
    });

    // Esperar conexión
    await new Promise((resolve) => {
      clientSocket.on("connect", () => {
        console.log("Cliente Socket conectado ✅");
        resolve();
      });
      clientSocket.on("connect_error", (err) => {
        console.log("Error conexión socket:", err.message);
      });
    });
  });

  afterAll(async () => {
    // Limpieza
    // Limpiar BD
    if (clientSocket) clientSocket.close();
    server.close(); // Cerrar servidor HTTP

    console.log("Limpiando recursos...");
    if (usuarioId) await db.promise().query("DELETE FROM detalle_pedido WHERE pedido_id IN (SELECT id FROM pedidos WHERE usuario_id = ?)", [usuarioId]);
    if (usuarioId) await db.promise().query("DELETE FROM pedidos WHERE usuario_id = ?", [usuarioId]);
    if (platilloId) await db.promise().query("DELETE FROM platillos WHERE id = ?", [platilloId]);
    if (categoriaId) await db.promise().query("DELETE FROM categorias WHERE id = ?", [categoriaId]);
    if (mesaId) await db.promise().query("DELETE FROM mesas WHERE id = ?", [mesaId]);
    if (usuarioId) await db.promise().query("DELETE FROM usuarios WHERE id = ?", [usuarioId]);

    db.end(); // Cerrar conexión pool
  });

  test("Debe recibir evento 'pedido_creado' al crear pedido vía REST", (done) => {
    // Datos del pedido
    const nuevoPedido = {
      mesa_id: mesaId, // Usamos ID real
      tipo: "mesa",
      observaciones: "Test de integración",
      detalles: [
        { platillo_id: platilloId, cantidad: 2, nota: "Sin cebolla" } // Usamos ID real
      ]
    };

    // Para que el test sea robusto, deberíamos usar IDs reales. 
    // Como no sabemos los IDs de platillos, este test podría fallar si la BD está vacía.
    // Asumiremos que hay datos semilla o mockearemos si la lógica lo permite.
    // PERO, la prueba es de integración.

    // Escuchar evento
    clientSocket.on("pedido_creado", (pedido) => {
      try {
        expect(pedido).toHaveProperty("id");
        expect(pedido.observaciones).toBe(nuevoPedido.observaciones);
        done();
      } catch (error) {
        done(error);
      }
    });

    // Enviar petición REST
    // Nota: Necesitamos un platillo válido. Si falla por FK, el test fallará correctamente indicando "Datos inválidos".
    // Para este ejemplo, intentaremos crear con datos dummy, esperando que el usuario tenga DB poblada.
    request(app)
      .post("/pedidos")
      .set("Authorization", `Bearer ${token}`)
      .send(nuevoPedido)
      .expect(201)
      .catch(err => {
        // Si falla la creación (ej: platillo no existe), fallamos el test
        done(err);
      });
  });
});
