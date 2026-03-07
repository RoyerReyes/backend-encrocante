
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:3000';

async function trigger() {
    try {
        console.log('🔫 Triggering Toggle...');
        const uniqueUser = `trigger_${Date.now()}`;

        await axios.post(`${BASE_URL}/auth/register`, {
            nombre: 'Trigger',
            usuario: uniqueUser,
            password: '123456',
            rol: 'admin'
        });

        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            usuario: uniqueUser,
            password: '123456'
        });
        const token = loginRes.data.token;

        // Get an active order or create one
        let pedidoId, detalleId;

        const activeRes = await axios.get(`${BASE_URL}/pedidos/activos`, { headers: { Authorization: `Bearer ${token}` } });
        if (activeRes.data.length > 0) {
            const pedido = activeRes.data[0];
            pedidoId = pedido.id;
            detalleId = pedido.detalles[0].id;
        } else {
            console.log('No active orders, creating one...');
            // Get generic data
            const platillosRes = await axios.get(`${BASE_URL}/platillos`, { headers: { Authorization: `Bearer ${token}` } });
            const platillo = platillosRes.data[0];

            const createRes = await axios.post(`${BASE_URL}/pedidos`, {
                tipo: 'mesa',
                numero_mesa: 5,
                nombre_cliente: 'Trigger Test',
                detalles: [{ platillo_id: platillo.id, cantidad: 1 }]
            }, { headers: { Authorization: `Bearer ${token}` } });
            pedidoId = createRes.data.pedido.id;
            // Move to prep
            await axios.patch(`${BASE_URL}/pedidos/${pedidoId}/estado`, { estado: 'en_preparacion' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Get detail id
            const fullOrder = await axios.get(`${BASE_URL}/pedidos/${pedidoId}`, { headers: { Authorization: `Bearer ${token}` } });
            detalleId = fullOrder.data.detalles[0].id;
        }

        console.log(`Checking Item ${detalleId} in Order ${pedidoId}...`);

        // Toggle
        await axios.patch(`${BASE_URL}/pedidos/detalle/${detalleId}/toggle`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Toggle Request Sent.');

    } catch (e) {
        console.error('❌ Trigger Failed:', e.response?.data || e.message);
    }
}

trigger();
