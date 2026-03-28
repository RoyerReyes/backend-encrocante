import jwt from 'jsonwebtoken';

const baseUrl = 'http://localhost:3000/pedidos'; 
const SECRET = 'encrocante_super_secret_key'; 

const runEditOrderTest = async () => {
    try {
        console.log('📝 Starting Edit Order Test...');

        // GENERATE TOKEN
        const token = jwt.sign({ id: 1, rol: 'admin' }, SECRET, { expiresIn: '1h' });
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        console.log('🔑 Generated Waiter Token');

        // 1. Create Order
        console.log('1. Creating New Order...');
        const newOrder = {
            mesa_id: 1,
            tipo: 'mesa',
            nombre_cliente: 'Test Client Edit',
            detalles: [
                { platillo_id: 1, cantidad: 1, precio: 15.00, nota: 'Sin cebolla' }
            ]
        };

        const resPost = await fetch(`${baseUrl}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(newOrder)
        });

        if (!resPost.ok) {
            throw new Error(`POST /pedidos failed: ${resPost.status} - ${await resPost.text()}`);
        }
        const created = await resPost.json();
        const orderId = created.pedido.id;
        console.log(`✅ Order Created! ID: ${orderId}`);

        // 2. Edit Order
        console.log(`2. Editing Order ID: ${orderId}...`);
        const editOrderPayload = {
            mesa_id: 5,
            tipo: 'mesa',
            nombre_cliente: 'Test Client Edit Modified',
            detalles: [
                { platillo_id: 1, cantidad: 2, precio: 15.00, nota: 'Con extra queso' }, // Modified existing item
                { platillo_id: 2, cantidad: 1, precio: 20.00, nota: '' } // Added new item
            ]
        };

        const resPut = await fetch(`${baseUrl}/${orderId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(editOrderPayload)
        });

        if (!resPut.ok) {
            throw new Error(`PUT /pedidos/${orderId} failed: ${resPut.status} - ${await resPut.text()}`);
        }
        const updated = await resPut.json();
        console.log(`✅ Order Edited! Message: ${updated.message}`);

        console.log('✨ EDIT ORDER TEST PASSED ✨');
        process.exit(0);
    } catch (e) {
        console.error('❌ EDIT ORDER TEST FAILED:', e.message);
        process.exit(1);
    }
};

runEditOrderTest();
