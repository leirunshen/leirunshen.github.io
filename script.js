// JavaScript 功能实现

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取页面元素
    const loginPage = document.getElementById('login-page');
    const mainPage = document.getElementById('main-page');
    const loginForm = document.getElementById('login-form');
    const reportBtn = document.getElementById('report-btn');
    const powerbiContainer = document.getElementById('powerbi-container');
    const backBtn = document.getElementById('back-btn');
    const powerbiIframe = document.getElementById('powerbi-iframe');
    
    // 检查URL参数，如果包含page=main，则直接显示主页面
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('page') === 'main') {
        loginPage.style.display = 'none';
        mainPage.style.display = 'block';
    }
    
    // Power BI 报表链接
    const powerbiUrl = 'https://app.powerbi.com/view?r=eyJrIjoiYTcwOGRhMjMtZjEwMC00NmE3LWIyZmItZjEyYzNiYjE0ODQzIiwidCI6IjNiYzczNjFkLTgyNWUtNDUxMy04ZjYyLTI5NmU0ZDg5NzBjMSIsImMiOjEwfQ%3D%3D';
    
    // 初始化用户数据
    function initUsers() {
        const users = localStorage.getItem('users');
        if (!users) {
            // 默认管理员用户
            const defaultUsers = [
                {
                    id: 1,
                    username: 'admin',
                    password: 'lrs123456',
                    fullname: '管理员',
                    email: 'leirunshen@aliyun.com',
                    role: 'admin',
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    username: 'user',
                    password: 'password123',
                    fullname: '普通用户',
                    email: 'user@example.com',
                    role: 'user',
                    created_at: new Date().toISOString()
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }
    }
    
    // 获取用户列表
    function getUsers() {
        initUsers();
        return JSON.parse(localStorage.getItem('users'));
    }
    
    // 登录表单提交事件
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 获取表单数据
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // 验证用户名和密码
        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }
        
        // 检查用户名和密码是否匹配
        const users = getUsers();
        const isValidUser = users.some(user => 
            user.username === username && user.password === password
        );
        
        if (isValidUser) {
            // 登录成功，获取用户信息
            const user = users.find(user => 
                user.username === username && user.password === password
            );
            // 存储当前用户信息到localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            // 切换到主页面
            loginPage.style.display = 'none';
            mainPage.style.display = 'block';
        } else {
            // 登录失败，显示错误提示
            alert('用户名或密码错误，请重新输入');
        }
    });
    
    // 获取header元素
    const header = document.querySelector('.header');
    
    // 获取所有仪表盘按钮
    const dashboardBtns = document.querySelectorAll('.dashboard-btn');
    
    // 为每个按钮添加点击事件
    dashboardBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 如果是查看报表按钮
            if (this.id === 'report-btn') {
                // 显示 Power BI 容器
                powerbiContainer.style.display = 'block';
                // 设置 Power BI iframe 源
                powerbiIframe.src = powerbiUrl;
                // 隐藏所有仪表盘按钮
                document.querySelector('.dashboard-buttons').style.display = 'none';
                // 隐藏header
                header.style.display = 'none';
            } else if (this.classList.contains('user-btn')) {
                // 用户管理按钮，跳转到用户管理页面
                window.location.href = 'user-management.html';
            } else {
                // 其他按钮的功能（可以根据需要扩展）
                alert('功能开发中：' + this.textContent);
            }
        });
    });
    
    // 返回按钮点击事件
    backBtn.addEventListener('click', function() {
        // 隐藏 Power BI 容器
        powerbiContainer.style.display = 'none';
        // 清空 iframe 源
        powerbiIframe.src = '';
        // 显示所有仪表盘按钮
        document.querySelector('.dashboard-buttons').style.display = 'flex';
        // 显示header
        header.style.display = 'block';
    });
});

// 数据库连接逻辑（实际项目中应该在后端实现）
// 这里提供数据库表结构设计
/*
-- 用户登录表设计
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Password NVARCHAR(100) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedDate DATETIME DEFAULT GETDATE()
);

-- 插入默认管理员用户
INSERT INTO Users (Username, Password, FullName, Email)
VALUES ('admin', 'lrs123456', '管理员', 'leirunshen@aliyun.com');
*/

// 注意：实际项目中，数据库连接和验证应该在后端实现
// 前端应该通过 API 与后端通信，而不是直接连接数据库