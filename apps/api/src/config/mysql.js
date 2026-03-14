import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "coreinventory",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = pool;

export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

export const getConnection = () => pool.getConnection();

export const testMySQLConnection = async () => {
  const rows = await query("SELECT DATABASE() AS db, NOW() AS ts");
  console.log(`✅ MySQL connected (${rows[0].db})`);
};