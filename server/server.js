// Инклюды
const express = require("express");
const bcrypt = require("bcrypt");
const {v4: uuidv4} = require("uuid");
const cookieParser = require("cookie-parser");

// Инициализация приложения
const app = express();
const APP_PORT = 9999;

// Настройка middleware для ограничения запросов к сторонним API с сайта, типам запросов и содержанием запросов
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Middleware - промежуточный обработчик для входящих JSON и Cookie
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Хранилища данных
const users = new Map();
const sessions = new Map();
const posts = new Map();

// Сессия будет активна 30 минут
const SESSION_DURATION_MS = 30 * 60 * 1000;

// Регистрация
app.post('/api/register', async (req, res) => {
    const {username, password} = req.body;

    if (users.has(username)) {
        return res.status(409).json({message: 'Пользователь с таким логином уже существует'});
    }

    // Хэширование пароля
    const saltRound = 10;
    const passwordHash = await bcrypt.hash(password, saltRound);

    users.set(username, {
        passwordHash,
        name: "New User",
        description: '',
        photoUrl: `/std_logo.png`,
        likedPosts: new Set(),
    });

    console.log('Зарегистрирован новый пользователь:', username);
    console.log('Текущие пользователи:')
    console.table(users);
    console.log('---------------------------------------\n\n');

    return res.status(201).json({message: 'Пользователь зарегистрирован'});
});

// Авторизация
app.post('/api/login', async (req, res) => {
    const {username, password} = req.body;
    const user = users.get(username);

    if (!user) {
        return res.status(401).json({message: 'Неверный логин или пароль'});
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
        return res.status(401).json({message: 'Неверное имя пользователя или пароль'});
    }

    // Удачная аутентификация. Создание сессии.
    const sessionId = uuidv4();
    const expires = new Date().getTime() + SESSION_DURATION_MS;

    sessions.set(sessionId, {userId: username, expires: expires})

    console.log('Создана сессия для пользователя:', username);
    console.log('Текущие сессии:');
    console.table(sessions);
    console.log('---------------------------------------\n\n');

    // Установка Cookie
    res.cookie('sessionId', sessionId, {
        httpOnly: true, // Недоступны через JS на клиенте,
        expires: new Date(expires)
    });

    return res.status(200).json({message: 'Успех'});
});

// Выход
app.post('/api/logout', (req, res) => {
    const {sessionId} = req.cookies;
    if (sessionId) sessions.delete(sessionId);
    req.cookies.clear('sessionId');
    res.status(200).json({message: 'Выход выполнен успешно'});
});


// MIDDLEWARE для проверки пользователя на авторизованность для запросов только для авторизированных пользователей
const authMiddleware = (req, res, next) => {
    const {sessionId} = req.cookie;
    if (!sessionId)
        return res.status(401).json({message: 'Требуется авторизация'});

    const session = sessions.get(sessionId);
    if (!session || new Date().getTime() > session.expires) {
        if (session) session.delete(sessionId);
        res.clear.cookie('sessionId');
        return res.status(401).json({message: 'Сессия больше не действительна'});
    }

    req.user = users.get(session.userId);
    req.user.username = session.userId;

    if (!req.user) {
        return res.status(401).json({message: 'Пользователя не найдено'});
    }

    next();
}

// Запуск сервера
app.listen(APP_PORT, () => {
    console.log(`Server start on: http://localhost:${APP_PORT}`)
})
