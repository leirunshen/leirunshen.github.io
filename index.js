const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 导入数据库连接
const { db, initDatabase } = require('./db');

// 中间件
app.use(cors());
app.use(express.json());

// 初始化数据库
initDatabase();

// 登录接口
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: '请输入用户名和密码' });
    }
    
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('登录查询失败:', err);
            return res.status(500).json({ message: '服务器错误' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }
        
        const user = results[0];
        const passwordMatch = bcrypt.compareSync(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }
        
        // 生成JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        res.json({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                role: user.role
            }
        });
    });
});

// 验证token的中间件
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: '未授权' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: '无效的token' });
        }
        req.user = user;
        next();
    });
}

// 验证管理员权限的中间件
function authorizeAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '权限不足' });
    }
    next();
}

// 获取用户列表（需要管理员权限）
app.get('/api/users', authenticateToken, authorizeAdmin, (req, res) => {
    const sql = 'SELECT id, username, fullname, email, role, created_at FROM users';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('获取用户列表失败:', err);
            return res.status(500).json({ message: '服务器错误' });
        }
        res.json(results);
    });
});

// 添加新用户（需要管理员权限）
app.post('/api/users', authenticateToken, authorizeAdmin, (req, res) => {
    const { username, password, fullname, email, role } = req.body;
    
    if (!username || !password || !fullname || !email) {
        return res.status(400).json({ message: '请填写所有必填字段' });
    }
    
    // 检查用户名是否已存在
    const checkUsername = 'SELECT * FROM users WHERE username = ?';
    db.query(checkUsername, [username], (err, results) => {
        if (err) {
            console.error('检查用户名失败:', err);
            return res.status(500).json({ message: '服务器错误' });
        }
        
        if (results.length > 0) {
            return res.status(400).json({ message: '用户名已存在' });
        }
        
        // 加密密码
        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        
        const sql = 'INSERT INTO users (username, password, fullname, email, role) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [username, hashedPassword, fullname, email, role || 'user'], (err) => {
            if (err) {
                console.error('添加用户失败:', err);
                return res.status(500).json({ message: '服务器错误' });
            }
            res.json({ message: '用户添加成功' });
        });
    });
});

// 更新用户信息（需要管理员权限）
app.put('/api/users/:id', authenticateToken, authorizeAdmin, (req, res) => {
    const { id } = req.params;
    const { username, password, fullname, email, role } = req.body;
    
    const userData = {};
    if (username) userData.username = username;
    if (fullname) userData.fullname = fullname;
    if (email) userData.email = email;
    if (role) userData.role = role;
    
    // 如果更新密码，需要加密
    if (password) {
        const saltRounds = 10;
        userData.password = bcrypt.hashSync(password, saltRounds);
    }
    
    const sql = 'UPDATE users SET ? WHERE id = ?';
    db.query(sql, [userData, id], (err) => {
        if (err) {
            console.error('更新用户失败:', err);
            return res.status(500).json({ message: '服务器错误' });
        }
        res.json({ message: '用户更新成功' });
    });
});

// 删除用户（需要管理员权限）
app.delete('/api/users/:id', authenticateToken, authorizeAdmin, (req, res) => {
    const { id } = req.params;
    
    // 不允许删除自己
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ message: '不能删除自己的账户' });
    }
    
    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [id], (err) => {
        if (err) {
            console.error('删除用户失败:', err);
            return res.status(500).json({ message: '服务器错误' });
        }
        res.json({ message: '用户删除成功' });
    });
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});
