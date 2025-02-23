// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Отваряне на SQLite базата данни (mydb.db)
const db = new sqlite3.Database(path.join(__dirname, 'mydb.db'), (err) => {
  if (err) {
    console.error('Не може да се отвори базата данни:', err.message);
  } else {
    console.log('SQLite базата данни е успешно отворена.');
  }
});

// Създаваме таблица за потребители, ако не съществува
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) console.error('Грешка при създаване на таблицата за потребители:', err.message);
  else console.log('Таблицата за потребители е готова.');
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
  res.header("Access-Control-Allow-Origin", "*"); // За разработка
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/* ---------------------- API Endpoint за въпроси ---------------------- */
app.get('/api/questions', (req, res) => {
  let authorName = req.query.author;
  console.log("Получена заявка за въпроси за автор:", authorName);
  
  let sql, params;
  if (!authorName || authorName.trim().toLowerCase() === 'all' ||
      authorName.trim().toLowerCase() === 'obobshtenie' ||
      authorName.trim().toLowerCase() === 'обобщение') {
    sql = `
      SELECT q.id AS question_id, q.question, q.explanation, q.type,
             COALESCE(qo.label, '') AS label,
             COALESCE(qo.option_text, '') AS option_text,
             COALESCE(qo.is_correct, 0) AS is_correct,
             COALESCE(qo.matching_key, '') AS matching_key
      FROM questions q
      LEFT JOIN question_options qo ON q.id = qo.question_id
      ORDER BY q.id, qo.id
    `;
    params = [];
  } else {
    sql = `
      SELECT q.id AS question_id, q.question, q.explanation, q.type,
             COALESCE(qo.label, '') AS label,
             COALESCE(qo.option_text, '') AS option_text,
             COALESCE(qo.is_correct, 0) AS is_correct,
             COALESCE(qo.matching_key, '') AS matching_key
      FROM questions q
      INNER JOIN authors a ON q.author_id = a.id
      LEFT JOIN question_options qo ON q.id = qo.question_id
      WHERE a.name = ?
      ORDER BY q.id, qo.id
    `;
    params = [authorName];
  }
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("Error fetching questions:", err);
      return res.status(500).json({ error: err.message });
    }
    const questionsMap = {};
    rows.forEach(row => {
      if (!questionsMap[row.question_id]) {
        questionsMap[row.question_id] = {
          id: row.question_id,
          question: row.question,
          explanation: row.explanation,
          type: row.type,
          options: []
        };
      }
      if (row.label !== '' || row.option_text !== '' || row.matching_key !== '') {
        questionsMap[row.question_id].options.push({
          label: row.label,
          option_text: row.option_text,
          matching_key: row.matching_key,
          is_correct: row.is_correct == 1
        });
      }
    });
    let questions = Object.values(questionsMap);
    console.log("Намерени въпроси:", questions);
    res.json(questions);
  });
});

/* ---------------------- API Endpoint за регистрация ---------------------- */
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).send("Моля, попълнете всички полета.");
  }
  
  // Проверка дали потребителят вече съществува
  db.get("SELECT * FROM users WHERE username = ? OR email = ?", [username, email], (err, row) => {
    if (err) {
      console.error("Грешка при проверка на потребителските данни:", err.message);
      return res.status(500).send("Възникна грешка при проверка на потребителските данни.");
    }
    if (row) {
      return res.status(400).send("Потребител с това потребителско име или имейл вече съществува.");
    }
    
    // За простота записваме паролата като plain text (В продукция използвайте хеширане, напр. с bcrypt)
    db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, password], function(err) {
      if (err) {
        console.error("Грешка при регистрирането:", err.message);
        return res.status(500).send("Възникна грешка при регистрирането.");
      }
      res.status(200).send("Регистрацията е успешна!");
    });
  });
});

// Сервиране на статични файлове (register.html, register.js, styles.css и други)
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Endpoint за вход
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).send("Моля, попълнете всички полета.");
    }
    
    // Търсим потребителя в базата данни
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
      if (err) {
        console.error("Грешка при проверка на потребителските данни:", err.message);
        return res.status(500).send("Възникна грешка при проверка на потребителските данни.");
      }
      
      if (!user) {
        return res.status(400).send("Потребителското име не съществува.");
      }
      
      // В този пример паролата се съхранява като plain text (за демонстрационни цели)
      if (password !== user.password) {
        return res.status(400).send("Невалидна парола.");
      }
      
      // Ако данните са верни, създаваме сесия
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email
      };
      
      res.status(200).send("Входът е успешен!");
    });
  });
  