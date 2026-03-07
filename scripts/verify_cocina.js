
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:3000';
const SECRET = process.env.JWT_SECRET;
const ADMIN_USER = { id: 1, usuario: 'admin', rol: 'admin' };

const run = async () => {
    // Generate Admin Token
    const token = jwt.sign(ADMIN_USER, SECRET, { expiresIn: '1h' });
    console.log('🔑 Generated Admin Token');

    // 1. Create User with Role 'cocina'
    const newUser = {
        nombre: 'Test Cocina',
        usuario: `cocina_test_${Date.now()}`,
        password: 'password123',
        rol: 'cocina'
    };

    console.log('1. Trying to create user with role "cocina"...', newUser.usuario);

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newUser)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
        }
        console.log('✅ User Created Status:', res.status, data);
    } catch (e) {
        console.error('❌ Creation Failed:', e.message);
        process.exit(1);
    }

    // 2. Login as new user to verify role in token
    console.log('2. Trying to login as new user...');
    try {
        const resLogin = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario: newUser.usuario,
                password: newUser.password
            })
        });

        const dataLogin = await resLogin.json();

        if (!resLogin.ok) {
            throw new Error(`Login Status ${resLogin.status}: ${JSON.stringify(dataLogin)}`);
        }

        console.log('✅ Login Successful. Role in response:', dataLogin.usuario.rol);

        if (dataLogin.usuario.rol !== 'cocina') {
            console.error('❌ Role Mismatch! Expected "cocina", got:', dataLogin.usuario.rol);
            process.exit(1);
        }

        console.log('✨ VERIFICATION SUCCESS: User created with role "cocina" and logged in successfully.');

    } catch (e) {
        console.error('❌ Login Failed:', e.message);
        process.exit(1);
    }
};

run();
