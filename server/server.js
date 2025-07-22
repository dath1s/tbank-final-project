// Инклюды
const express = require("express");
const bcrypt = require("bcrypt");
const {v4: uuidv4} = require("uuid");
const {Faker, ru} = require('@faker-js/faker'); // ДЛЯ ТЕСТА

const cookieParser = require("cookie-parser");

// Инициализация приложения
const app = express();
const APP_PORT = 9999;

// Настройка middleware для ограничения запросов к сторонним API с сайта, типам запросов и содержанием запросов
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9998');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
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

const faker = new Faker({locale: [ru]}); // ДЛЯ ТЕСТА

/**
 * Создает тестовых пользователей и посты для них.
 * @param {number} userCount - Количество пользователей для создания.
 * @param {number} postsPerUser - Количество постов для каждого пользователя.
 */
const createTestData = async (userCount, postsPerUser) => {
    console.log(`🤖 Генерация тестовых данных: ${userCount} пользователей и ${postsPerUser} постов для каждого...`);

    for (let i = 0; i < userCount; i++) {
        const username = faker.internet.userName().toLowerCase();
        const name = faker.person.fullName();
        const password = 'password123';
        const passwordHash = await bcrypt.hash(password, 10);

        if (users.has(username)) continue;

        users.set(username, {
            passwordHash,
            name,
            description: faker.lorem.sentence(),
            photoUrl: '',
            likedPosts: new Set(),
        });

        for (let j = 0; j < postsPerUser; j++) {
            const postId = uuidv4();
            posts.set(postId, {
                id: postId,
                content: faker.lorem.paragraph(),
                author: username,
                authorName: name,
                likes: new Set(),
                comments: [],
                createdAt: faker.date.past().toISOString(),
            });
        }
    }
    console.log('✅ Тестовые данные успешно созданы!');
    console.log(`Всего пользователей: ${users.size}, Всего постов: ${posts.size}`);
};

createTestData(5, 3);

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
        photoUrl: ``,
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

    if (req.cookies.sessionId) {
        sessions.delete(req.cookies.sessionId);
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
    const {sessionId} = req.cookies;
    if (!sessionId)
        return res.status(401).json({message: 'Требуется авторизация'});

    const session = sessions.get(sessionId);
    if (!session || new Date().getTime() > session.expires) {
        if (session) sessions.delete(sessionId);
        res.clearCookie('sessionId');
        return res.status(401).json({message: 'Сессия больше не действительна'});
    }

    req.user = users.get(session.userId);
    req.user.username = session.userId;

    if (!req.user) {
        return res.status(401).json({message: 'Пользователя не найдено'});
    }

    next();
}

const postMiddleware = (req, res, next) => {
    const {sessionId} = req.cookies;
    if (!sessionId)
        req.user = null;
    else {
        const session = sessions.get(sessionId);
        if (!session || new Date().getTime() > session.expires) {
            if (session) sessions.delete(sessionId);
            res.clearCookie('sessionId');
            return res.status(401).json({message: 'Сессия больше не действительна'});
        }

        req.user = users.get(session.userId);
        req.user.username = session.userId;

        if (!req.user) {
            req.user = null;
        }
    }

    next();
}

app.post('/', authMiddleware, (req, res) => {
    return res.status(200).json({message: "Пользователь авторизирован"});
});

app.post('/api/profile/:username', (req, res) => {

});

app.post('/api/posts', authMiddleware, (req, res) => {

});

app.get('/api/posts', postMiddleware, (req, res) => {
    const allPosts = Array.from(posts.values()).map(post => {
        const postData = {
            id: post.id,
            content: post.content,
            author: post.author,
            authorName: post.authorName,
            createdAt: post.createdAt,
            comments: post.comments,
            likesCount: post.likes.size
        };

        if (req.user) {
            postData.isLiked = post.likes.has(req.user.username);
        }

        return postData;
    });
    allPosts.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.status(200).json(allPosts);
});

app.get('/api/posts/user/:username', (req, res) => {

});

app.post('/api/posts/:postId/like', authMiddleware, (req, res) => {
    const {postId} = req.params;
    const post = posts.get(postId);

    if (!post) return res.status(404).json({message: 'Пост не найден'});

    const userLikes = post.likes;
    if (userLikes.has(req.user.username)) {
        userLikes.delete(req.user.username);
        req.user.likedPosts.delete(postId);
        return res.status(200).json({likesCount: userLikes.size, showLike: false});
    }

    userLikes.add(req.user.username);
    req.user.likedPosts.add(postId);

    return res.status(200).json({likesCount: userLikes.size, showLike: true});
});

app.get('/api/posts/:postId/like', postMiddleware, (req, res) => {
    const {postId} = req.params;
    const post = posts.get(postId);

    if (!post) return res.status(404).json({message: 'Пост не найден'});

    const userLikes = post.likes;

    if (req.user) {
        if (userLikes.has(req.user.username)) {
            return res.status(200).json({likesCount: userLikes.size, showLike: true});
        }
    }
    return res.status(200).json({likesCount: userLikes.size, showLike: false});
});


app.post('/api/posts/:postId/comments', authMiddleware, (req, res) => {

});

app.delete('/api/posts/:postId/comments/:commentId', authMiddleware, (req, res) => {

});

app.get('/api/search', (req, res) => {

});

// Запуск сервера
app.listen(APP_PORT, () => {
    console.log(`Server start on: http://localhost:${APP_PORT}`)
})
