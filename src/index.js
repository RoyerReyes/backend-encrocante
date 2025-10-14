//comentario de prueba para github
//comentario de prueba 2 para github
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import platillosRoutes from "./routes/platillos.js";
import authRoutes from "./routes/auth.js";
import pedidosRoutes from "./routes/pedidos.js"; // <-- agregado
import { errorHandler } from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // parse JSON bodies

// Rutas (montadas)
app.use("/auth", authRoutes);
app.use("/platillos", platillosRoutes);
app.use("/pedidos", pedidosRoutes); // <-- montamos router de pedidos

// Crear servidor HTTP + socket.io
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN, // Lee la URL permitida desde .env
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Ejemplo de conexión socket
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);
  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Ruta raíz
// Ruta raíz de prueba
app.get("/", (req, res) => {
  res.send("Bienvenido a la API Encrocante 🚀");
});

// Manejador de errores centralizado (DEBE SER EL ÚLTIMO MIDDLEWARE)
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});
