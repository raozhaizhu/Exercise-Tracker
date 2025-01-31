const express = require('express');
const app = express();
const cors = require('cors');
const shortid = require('shortid');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = {};
const logs = {};

app.post('/api/users', (req, res) => {
    console.log(req.body); // 打印请求体，检查是否正确
    const { username } = req.body;
    const _id = shortid.generate();
    users[_id] = { username, _id };
    logs[_id] = [];
    console.log(username);
    res.json({ username, _id });
});

// 从api/users可以get到一个数组, 里面的元素都是对象,包含对应的username和_id
app.get('/api/users', (req, res) => {
    const userList = Object.values(users);
    res.json(userList);
});

app.post('/api/users/:_id/exercises', (req, res) => {
    const { _id } = req.params;
    const { description, duration, date } = req.body;

    // 首先判断用户是否存在, 如果不存在就报错
    if (!users[_id]) {
        return res.status(404).json({ error: 'User not found' });
    }

    // 获取用户名
    const username = users[_id].username;

    // 判断并格式化日期
    const formattedDate = date ? new Date(date).toISOString() : new Date().toISOString();
    console.log(formattedDate); // 打印格式化后的日期

    // 添加用户的锻炼记录
    const exercises = { description, duration, date: formattedDate };

    // 确保 logs[_id] 数组存在
    if (!logs[_id]) {
        logs[_id] = []; // 如果没有初始化，创建空数组
    }
    logs[_id].push(exercises);

    // 返回数据
    res.json({ username, count: logs[_id].length, _id, log: logs[_id] });
});
//从/api/users/:_id/logs可以GET到完整的用户的训练记录
app.get('/api/users/:_id/logs', (req, res) => {
    const { _id } = req.params;
    const { username } = users[_id];
    const log = logs[_id] || [];
    const { from, to, limit } = req.query;
    if (from) {
        log = log.filter((exercise) => new Date(exercise.date) >= new Date(from));
    }
    if (to) {
        log = log.filter((exercise) => new Date(exercise.date) <= new Date(to));
    }
    if (limit) {
        log = log.slice(0, limit);
    }
    res.json({ username, count: log.length, _id, log });
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});

//{"username":"rzz","count":1,"_id":"h7Nq9H24m","log":[{"description":"33","duration":"44","date":"2025-01-05T00:00:00.000Z"}]}

