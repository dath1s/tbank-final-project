const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const APP_PORT = 9998;
const pagesDir = 'src/pages/'

app.use(express.static(path.join(__dirname, 'src/')));
app.use(
    cors({
        origin: 'http://localhost:9998',
        credentials: true
    })
)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, pagesDir, "main.html"))
});

app.get('/sign', (req, res) => {
    res.sendFile(path.join(__dirname, pagesDir, 'sign.html'));
});

app.listen(APP_PORT, () => {
    console.log('Client start on http://localhost:9998');
});