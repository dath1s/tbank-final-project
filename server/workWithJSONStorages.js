const fs = require("fs");
const path = require("path");


const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");

// Хранилища данных
const users = new Map();
const sessions = new Map();
const posts = new Map();

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR);
    }
}

function loadFromFile(filename) {
    try {
        if (fs.existsSync(filename)) {
            return JSON.parse(fs.readFileSync(filename, "utf8"));
        }
    } catch (error) {
        console.error(`Ошибка загрузки ${filename}:`, error);
    }
    return {};
}

function saveToFile(filename, data) {
    try {
        ensureDataDir();
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Ошибка сохранения ${filename}:`, error);
    }
}

const loadData = () => {
    ensureDataDir();

    const usersData = loadFromFile(USERS_FILE);
    for (const [username, user] of Object.entries(usersData)) {
        users.set(username, {
            ...user,
            likedPosts: new Set(user.likedPosts || []),
        });
    }

    const sessionsData = loadFromFile(SESSIONS_FILE);
    for (const [sessionId, session] of Object.entries(sessionsData)) {
        sessions.set(sessionId, session);
    }

    const postsData = loadFromFile(POSTS_FILE);
    for (const [postId, post] of Object.entries(postsData)) {
        posts.set(postId, {
            ...post,
            likes: new Set(post.likes || []),
            comments: post.comments || [],
        });
    }
};

function saveUsers() {
    const usersData = {};
    users.forEach((user, username) => {
        usersData[username] = {
            ...user,
            likedPosts: Array.from(user.likedPosts),
        };
    });
    saveToFile(USERS_FILE, usersData);
}

function saveSessions() {
    saveToFile(SESSIONS_FILE, Object.fromEntries(sessions));
}

function savePosts() {
    const postsData = {};
    posts.forEach((post, postId) => {
        postsData[postId] = {
            ...post,
            likes: Array.from(post.likes),
        };
    });
    saveToFile(POSTS_FILE, postsData);
}


module.exports = {
    loadData,
    saveUsers,
    saveSessions,
    savePosts,
    sessions,
    users,
    posts
}