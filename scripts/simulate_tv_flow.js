
import io from 'socket.io-client';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:3000';
const SOCKET_URL = 'http://localhost:3000';
const ADMIN_USER = { id: 1, usuario: 'admin', rol: 'admin' };
const SECRET = process.env.JWT_SECRET;
const token = jwt.sign(ADMIN_USER, SECRET);

const socket = io(SOCKET_URL);

let pedidoId = null;

socket.on('connect', async () => {
    console.log('🔌 Connected to Socket.IO');

    // 1. Create Order
    try {
        console.log('1. Creating Order...');
        const res = await axios.post(`${API_URL}/pedidos`, {
            tipo: 'mesa',
            numero_mesa: 5,
            nombre_cliente: 'Cliente TV Test',
            detalles: [{ platillo_id: 1, cantidad: 1 }]
        }, { headers: { Authorization: `Bearer ${token}` } });

        pedidoId = res.data.pedido.id;
        console.log(`✅ Order Created: ID ${pedidoId}`);
    } catch (e) {
        console.error('❌ Error creating order:', e.message);
        process.exit(1);
    }
});

socket.on('pedido_creado', (pedido) => {
    console.log(`📡 Event Received: pedido_creado (ID: ${pedido.id})`);

    // 2. Move to 'en_preparacion'
    if (pedido.id === pedidoId) {
        setTimeout(async () => {
            console.log("2. Updating state to 'en_preparacion'...");
            await axios.patch(`${API_URL}/pedidos/${pedidoId}/estado`,
                { estado: 'en_preparacion' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        }, 1000);
    }
});

socket.on('estado_actualizado', async ({ id, estado }) => {
    console.log(`📡 Event Received: estado_actualizado (ID: ${id} -> ${estado})`);

    if (id === pedidoId) {
        if (estado === 'en_preparacion') {
            console.log("   -> TV should show in 'Cooking' column");
            setTimeout(async () => {
                console.log("3. Updating state to 'listo'...");
                await axios.patch(`${API_URL}/pedidos/${pedidoId}/estado`,
                    { estado: 'listo' },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }, 1000);
        } else if (estado === 'listo') {
            console.log("   -> TV should show in 'Ready' column");
            console.log("✨ TEST SUCCESSFUL");
            socket.disconnect();
            process.exit(0);
        }
    }
});

// Timeout fail safe
setTimeout(() => {
    console.error('❌ Test Timed Out');
    process.exit(1);
}, 10000);
