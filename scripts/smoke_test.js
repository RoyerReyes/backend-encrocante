import jwt from 'jsonwebtoken';

const baseUrl = 'http://127.0.0.1:3000/pedidos'; // Removed /api
const SECRET = 'encrocante_super_secret_key'; // Hardcoded for test convenience or process.env.JWT_SECRET

const runSmokeTest = async () => {
    try {
        console.log('🔥 Starting Smoke Test...');

        // GENERATE TOKEN
        const token = jwt.sign({ id: 1, rol: 'admin' }, SECRET, { expiresIn: '1h' });
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        console.log('🔑 Generated Admin Token');

        // 1. Health Check (Get Pedidos) 
        console.log('1. Fetching Orders...'); // Checking /pedidos as /pedidos/activos doesn't exist
        const resGet = await fetch(`${baseUrl}`, { headers });
        if (!resGet.ok) throw new Error(`GET /pedidos failed: ${resGet.status}`);
        const pedidos = await resGet.json();
        console.log(`✅ Fetched ${pedidos.length} orders.`);

        // 2. Create Order
        console.log('2. Creating New Order...');
        const newOrder = {
            mesa_id: 1,
            tipo: 'mesa',
            // usuario_id removed/ignored if middleware sets it from token, but schema might require it? 
            // Controller usually gets usuario_id from req.user.id. 
            // But let's check creating payload. PedidosController usually overrides or uses req.user.
            // We'll keep it if schema validation needs it, but "usuario_id" in body is often redundant.
            // Let's assume controller handles it or takes from body. 
            nombre_cliente: 'Smoke Test Client',
            detalles: [
                { platillo_id: 1, cantidad: 2, precio: 15.00, nota: 'Sin cebolla' }
            ]
        };
        // Need to add mesa_id if not present? Seeding has mesa 1.

        const resPost = await fetch(`${baseUrl}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(newOrder)
        });

        if (!resPost.ok) {
            const err = await resPost.text();
            throw new Error(`POST /pedidos failed: ${resPost.status} - ${err}`);
        }
        const created = await resPost.json();
        const orderId = created.pedido.id;
        console.log(`✅ Order Created! ID: ${orderId}`);

        // 3. Update to En Preparacion
        console.log('3. Updating to "en_preparacion"...');
        const resUp1 = await fetch(`${baseUrl}/${orderId}/estado`, {
            method: 'PATCH', // Changed to PATCH
            headers,
            body: JSON.stringify({ estado: 'en_preparacion' })
        });
        if (!resUp1.ok) throw new Error(`PATCH en_preparacion failed: ${await resUp1.text()}`);
        console.log('✅ State updated to en_preparacion');

        // 4. Update to Listo
        console.log('4. Updating to "listo"...');
        const resUp2 = await fetch(`${baseUrl}/${orderId}/estado`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ estado: 'listo' })
        });
        if (!resUp2.ok) throw new Error(`PATCH listo failed: ${await resUp2.text()}`);
        console.log('✅ State updated to listo');

        // 5. Update to Entregado
        console.log('5. Updating to "entregado"...');
        const resUp3 = await fetch(`${baseUrl}/${orderId}/estado`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ estado: 'entregado' })
        });
        if (!resUp3.ok) throw new Error(`PATCH entregado failed: ${await resUp3.text()}`);
        console.log('✅ State updated to entregado');

        // 6. Update to Pagado (Finalize)
        console.log('6. Updating to "pagado"...');
        const resUp4 = await fetch(`${baseUrl}/${orderId}/estado`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                estado: 'pagado',
                metodo_pago: 'Efectivo',
                monto_recibido: 100,
                vuelto: 10
            })
        });
        if (!resUp4.ok) throw new Error(`PATCH pagado failed: ${await resUp4.text()}`);
        console.log('✅ State updated to pagado');

        console.log('✨ SMOOTH SMOKE TEST PASSED ✨');
        process.exit(0);
    } catch (e) {
        console.error('❌ SMOKE TEST FAILED:', e.message);
        process.exit(1);
    }
};

runSmokeTest();
