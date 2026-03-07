import db from '../src/config/db.js';
import * as UserModel from '../src/models/usuario.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const createAdmin = async () => {
  try {
    console.log('Iniciando creación de superusuario...');

    const adminUser = {
      nombre: 'Administrador',
      usuario: 'admin',
      password: 'admin', // La función create se encargará de hashearla
      rol: 'admin'
    };

    // Verificar si el usuario 'admin' ya existe
    const existingAdmin = await UserModel.findByUsername(adminUser.usuario);
    if (existingAdmin) {
      console.log('El usuario "admin" ya existe. Actualizando contraseña...');
      // Hashear la contraseña nueva
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.default.hash(adminUser.password, 10);

      await db.promise().query("UPDATE usuarios SET password = ? WHERE usuario = ?", [hashedPassword, adminUser.usuario]);
      console.log('Contraseña de admin actualizada a: admin');
      return;
    }

    // Crear el usuario admin
    const createdUser = await UserModel.create(adminUser);
    console.log('Superusuario creado exitosamente: 🚀');
    console.log(`  ID: ${createdUser.id}`);
    console.log(`  Usuario: ${createdUser.usuario}`);
    console.log('  Rol: admin');

  } catch (error) {
    console.error('Error al crear el superusuario:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    await db.end();
    console.log('Conexión a la base de datos cerrada.');
  }
};

createAdmin();
