import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });

    console.log('Connected successfully!');

    const [rows] = await connection.query('SELECT * FROM admin_users LIMIT 1');
    console.log('Admin users:', rows);

    await connection.end();
  } catch (error) {
    console.error('Connection error:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
