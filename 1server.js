// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Отваряне на SQLite базата данни
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
  
  let sql, params;
  if (!authorName || authorName.trim().toLowerCase() === 'all' ||
      authorName.trim().toLowerCase() === 'obobshtenie' ||
      authorName.trim().toLowerCase() === 'обобщение') {
    // Ако е обобщение, връщаме всички въпроси от всички автори
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
    // Връщаме въпросите за конкретния автор
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
    // if (questions.length > 5) {
    //   questions = questions.sort(() => 0.5 - Math.random()).slice(0, 5);
    // }
    console.log("Намерени въпроси:", questions);
    res.json(questions);
  });
});

// Статични файлове (index.html, script.js, styles.css) са в public/
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
