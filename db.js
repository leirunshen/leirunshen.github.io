const mysql = require('mysql2');
require('dotenv').config();

// 创建数据库连接
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// 连接数据库
db.connect((err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('数据库连接成功');
});

// 初始化数据库表结构
function initDatabase() {
    const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY IDENTITY(1,1),
        username NVARCHAR(50) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL,
        fullname NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) NOT NULL,
        role NVARCHAR(20) DEFAULT 'user',
        created_at DATETIME DEFAULT GETDATE()
    );
    `;

    db.query(createUsersTable, (err) => {
        if (err) {
            console.error('创建用户表失败:', err);
            return;
        }
        console.log('用户表创建成功');
        
        // 检查是否存在管理员用户
        const checkAdmin = 'SELECT * FROM users WHERE username = ?';
        db.query(checkAdmin, ['admin'], (err, results) => {
            if (err) {
                console.error('检查管理员用户失败:', err);
                return;
            }
            
            if (results.length === 0) {
                // 创建默认管理员用户
                const bcrypt = require('bcrypt');
                const saltRounds = 10;
                const password = bcrypt.hashSync('lrs123456', saltRounds);
                
                const createAdmin = 'INSERT INTO users (username, password, fullname, email, role) VALUES (?, ?, ?, ?, ?)';
                db.query(createAdmin, ['admin', password, '管理员', 'leirunshen@aliyun.com', 'admin'], (err) => {
                    if (err) {
                        console.error('创建管理员用户失败:', err);
                        return;
                    }
                    console.log('默认管理员用户创建成功');
                });
            }
        });
    });
}

module.exports = {
    db,
    initDatabase
};