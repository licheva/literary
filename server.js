// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// Отваряне на SQLite базата данни (файл mydb.db трябва да съдържа таблиците "authors" и "questions")
const db = new sqlite3.Database(path.join(__dirname, 'mydb.db'), (err) => {
  if (err) {
    console.error('Не може да се отвори базата данни:', err.message);
  } else {
    console.log('SQLite базата данни е успешно отворена.');
  }
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
}));

// CORS заглавки (за разработка)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/* ---------------------- API Endpoint за въпроси ---------------------- */
app.get('/api/questions', (req, res) => {
  let authorName = req.query.author;
  console.log("Получена заявка за въпроси за автор:", authorName);
  if (!authorName) {
    return res.status(400).json({ error: 'Author parameter required.' });
  }
  let sql, params;
  if (authorName.trim().toLowerCase() === 'obobshtenie' || authorName.trim().toLowerCase() === 'обобщение') {
    sql = `
      SELECT question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, type
      FROM questions
      ORDER BY RANDOM()
      LIMIT 5
    `;
    params = [];
  } else {
    sql = `
      SELECT question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, type
      FROM questions 
      WHERE author_id = (SELECT id FROM authors WHERE name = ?)
      ORDER BY RANDOM()
      LIMIT 5
    `;
    params = [authorName];
  }
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("Error fetching questions:", err);
      return res.status(500).json({ error: 'Error fetching questions.' });
    }
    console.log("Намерени въпроси:", rows);
    res.json(rows);
  });
});

// Обслужване на статични файлове – клиентските файлове са в папката public/
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
