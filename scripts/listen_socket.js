
import io from 'socket.io-client';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:3000';

async function listen() {
    console.log('🎧 Connecting to socket...');
    const uniqueUser = `listener_${Date.now()}`;

    // Interact with Auth
    let token;
    try {
        await axios.post(`${BASE_URL}/auth/register`, {
            nombre: 'Listener',
            usuario: uniqueUser,
            password: '123456',
            rol: 'admin'
        });
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            usuario: uniqueUser,
            password: '123456'
        });
        token = loginRes.data.token;
    } catch (e) {
        console.error('Auth failed', e.response?.data || e.message);
        return;
    }

    const socket = io(BASE_URL, {
        auth: { token },
        transports: ['websocket']
    });

    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
    });

    socket.on('pedido_item_actualizado', (data) => {
        console.log('🔔 EVENT RECEIVED [pedido_item_actualizado]:', JSON.stringify(data, null, 2));
    });

    socket.on('estado_actualizado', (data) => {
        console.log('♻️ EVENT RECEIVED [estado_actualizado]:', JSON.stringify(data, null, 2));
    });

    socket.on('disconnect', () => console.log('❌ Socket disconnected'));

    // Keep alive
    setInterval(() => { }, 1000);
}

listen();
