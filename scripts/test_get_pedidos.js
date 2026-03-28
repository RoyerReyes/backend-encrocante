import jwt from 'jsonwebtoken';

const baseUrl = 'https://backend-encrocante.onrender.com/pedidos'; 
const SECRET = 'encrocante_super_secret_key'; 

const runGetOrdersTest = async () => {
    try {
        console.log('📝 Starting Get Orders Test...');

        // GENERATE TOKEN
        const token = jwt.sign({ id: 1, rol: 'admin' }, SECRET, { expiresIn: '1h' });
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        console.log('1. Fetching /pedidos...');
        const resAll = await fetch(`${baseUrl}`, { method: 'GET', headers });
        if (!resAll.ok) {
            console.error(`❌ GET /pedidos failed: ${resAll.status}`);
            console.error(await resAll.text());
        } else {
            console.log('✅ GET /pedidos OK');
        }

        console.log('2. Fetching /pedidos/activos...');
        const resActivos = await fetch(`${baseUrl}/activos`, { method: 'GET', headers });
        if (!resActivos.ok) {
            console.error(`❌ GET /pedidos/activos failed: ${resActivos.status}`);
            console.error(await resActivos.text());
        } else {
            console.log('✅ GET /pedidos/activos OK');
        }

        process.exit(0);
    } catch (e) {
        console.error('❌ GET ORDERS TEST FAILED:', e.message);
        process.exit(1);
    }
};

runGetOrdersTest();
