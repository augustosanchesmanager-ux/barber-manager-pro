/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
    const url = process.env.DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error('DATABASE_URL and TURSO_AUTH_TOKEN must be set');
        return;
    }

    const client = createClient({ url, authToken });

    try {
        console.log('🔧 Criando SUPER_ADMIN via CJS...');

        const barbershopId = 'admin-bsh-id-' + Date.now();
        const userId = 'admin-usr-id-' + Date.now();
        const email = 'admin@barberpro.com';
        const password = 'Admin@123456';
        const hashedPassword = await bcrypt.hash(password, 10);
        const now = new Date().toISOString();

        await client.batch([
            {
                sql: `INSERT INTO "Barbershop" (id, name, slug, isActive, planType, billingCycle, maxBarbers, createdAt, updatedAt) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [barbershopId, 'Sistema Administrativo', 'admin-system', 1, 'ENTERPRISE', 'ANNUAL', 30, now, now]
            },
            {
                sql: `INSERT INTO "User" (id, name, email, password, role, status, barbershopId, createdAt, updatedAt) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [userId, 'Super Administrador', email, hashedPassword, 'SUPER_ADMIN', 'ACTIVE', barbershopId, now, now]
            }
        ], "write");

        console.log('✅ SUPER_ADMIN criado com sucesso no Turso (CJS)!');
        console.log('📧 Email:', email);
        console.log('🔑 Senha:', password);

    } catch (e) {
        if (e.message && e.message.includes('UNIQUE constraint failed')) {
            console.log('⚠️  Admin já existe ou conflito de ID. Continuando...');
        } else {
            console.error('❌ Erro SQL:', e);
        }
    } finally {
        client.close();
    }
}

main();
