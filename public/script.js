// public/script.js
// Клиентски код за работа с API, визуализация на лабиринта и въпросите

// Функция за извличане на въпроси за даден автор (зарежда ги от API)
function getQuestionsForAuthor(authorName, callback) {
  // fetch(`http://localhost:3000/api/questions?author=${encodeURIComponent(authorName)}`)
  fetch("https://literary-5zo2.onrender.com/api/questions?author=" + encodeURIComponent(authorName))
    .then(response => response.json())
    .then(data => callback(data))
    .catch(error => {
      console.error("Грешка при извличането на въпроси:", error);
    });
}

// (Допълнителна функция displayQuestions за тестове)
function displayQuestions(questions) {
  const container = document.getElementById('questions-container');
  if (!container) return;
  container.innerHTML = "";
  questions.forEach(q => {
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');
    questionDiv.innerHTML = `
      <p class="question-text">${q.question}</p>
      <button class="answer-btn" data-answer="${q.answer_a}">${q.answer_a}</button>
      <button class="answer-btn" data-answer="${q.answer_b}">${q.answer_b}</button>
      <button class="answer-btn" data-answer="${q.answer_c}">${q.answer_c}</button>
      <button class="answer-btn" data-answer="${q.answer_d}">${q.answer_d}</button>
    `;
    container.appendChild(questionDiv);
    const buttons = questionDiv.querySelectorAll('.answer-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', function() {
        const selectedAnswer = btn.getAttribute('data-answer');
        if (selectedAnswer === q.correct_answer) {
          alert("Правилен отговор!");
        } else {
          alert("Грешен отговор!");
        }
      });
    });
  });
}

// Глобални променливи за играта
let currentUser = null;
let currentLevel = 1;
let score = 0;
let timerInterval = null;
let currentMaze = [];       // Матрицата на лабиринта
let revealedMaze = [];      // Статус на клетките (0 - видима, 1 - скрита)
let playerPos = { row: 0, col: 0 };
let currentAuthor = null;   // Избран автор
let gameQuestions = [];     // Ще бъдат заредени от API
let wrongCellQuestion = {};
const MAX_LEVEL = 5;

// Примерни лабиринти (демонстрационни данни)
const labyrinths = {
  vazov: {
    name: "Иван Вазов",
    levels: {
      1: [
        [
          [3, 0, 1, 0, 0, 0, 1],
          [1, 0, 1, 0, 1, 0, 1],
          [1, 0, 0, 0, 1, 0, 0],
          [1, 1, 1, 0, 1, 1, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 1, 4]
        ]
      ],
      2: [
        [
          [3, 0, 1, 0, 1, 0, 1],
          [1, 0, 0, 0, 1, 0, 1],
          [1, 1, 1, 0, 1, 0, 0],
          [1, 0, 0, 0, 0, 1, 0],
          [0, 0, 1, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 1, 4]
        ]
      ]
    }
  },
  aleko: {
    name: "Алеко Константинов",
    levels: {
      1: [
        [
          [3, 0, 1, 0],
          [1, 0, 1, 4]
        ]
      ]
    }
  },
  pelin: {
    name: "Елин Пелин",
    levels: {
      1: [
        [
          [3, 0, 0, 1, 0, 0, 1],
          [1, 0, 1, 0, 1, 0, 0],
          [1, 0, 1, 0, 1, 1, 0],
          [1, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1, 0, 1],
          [0, 0, 0, 0, 0, 0, 4]
        ]
      ],
      2: [
        [
          [3, 0, 0, 1, 0, 0, 1],
          [1, 0, 0, 0, 1, 0, 0],
          [1, 0, 1, 0, 1, 1, 0],
          [1, 0, 0, 0, 0, 0, 0],
          [1, 1, 1, 0, 1, 0, 1],
          [0, 0, 0, 0, 0, 0, 4]
        ]
      ]
    }
  },
  yordan: {
    name: "Йордан Йовков",
    levels: {
      1: [
        [
          [3, 0, 1],
          [1, 0, 4]
        ]
      ]
    }
  },
  peyo: {
    name: "Пейо Яворов",
    levels: {
      1: [
        [
          [3, 0, 0],
          [1, 1, 4]
        ]
      ]
    }
  },
  pencho: {
    name: "Пенчо Славейков",
    levels: {
      1: [
        [
          [3, 0, 1, 0],
          [1, 1, 1, 4]
        ]
      ]
    }
  },
  hristo: {
    name: "Христо Ботев",
    levels: {
      1: [
        [
          [3, 0, 0, 1],
          [1, 0, 1, 4]
        ]
      ]
    }
  },
  dobri: {
    name: "Добри Чинтулов",
    levels: {
      1: [
        [
          [3, 0, 1],
          [1, 0, 4]
        ]
      ]
    }
  },
  obobshtenie: {
    name: "Обобщение",
    levels: {
      1: [
        [
          [3, 0, 0, 0, 0, 0, 4]
        ]
      ]
    }
  }
};

// Зареждането на въпросите става изцяло чрез API, така че локалните въпроси тук не се използват.

// Функция за инициализиране на revealedMaze – само вход (3) и изход (4) са видими, останалите са скрити
function initRevealedMaze() {
  revealedMaze = [];
  const rows = currentMaze.length;
  const cols = currentMaze[0].length;
  for (let i = 0; i < rows; i++) {
    revealedMaze[i] = [];
    for (let j = 0; j < cols; j++) {
      revealedMaze[i][j] = (currentMaze[i][j] === 3 || currentMaze[i][j] === 4) ? 0 : 1;
    }
  }
}

// Функция за инициализиране на лабиринта за избрания автор и ниво
function initMazeFromAuthor() {
  if (!currentAuthor) {
    console.log("Няма избран автор. Не мога да генерирам лабиринт.");
    return;
  }
  console.log("Инициализирам лабиринт за автор:", currentAuthor, "Ниво:", currentLevel);
  if (!labyrinths[currentAuthor]) {
    console.error("Лабиринтът за избрания автор (" + currentAuthor + ") не е дефиниран.");
    return;
  }
  wrongCellQuestion = {};
  const levelMazes = labyrinths[currentAuthor].levels[currentLevel];
  if (!levelMazes || levelMazes.length === 0) {
    alert("Няма лабиринт за това ниво.");
    return;
  }
  currentMaze = JSON.parse(JSON.stringify(levelMazes[0]));
  initRevealedMaze();
  // Намиране на стартова позиция (вход – стойност 3)
  for (let r = 0; r < currentMaze.length; r++) {
    for (let c = 0; c < currentMaze[r].length; c++) {
      if (currentMaze[r][c] === 3) {
        playerPos = { row: r, col: c };
      }
    }
  }
  renderMaze();
}

// Функция за визуализиране на лабиринта
function renderMaze() {
  const mazeDiv = document.getElementById('maze-active');
  mazeDiv.innerHTML = "";
  const rows = currentMaze.length;
  const cols = currentMaze[0].length;
  mazeDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  mazeDiv.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cellDiv = document.createElement('div');
      cellDiv.classList.add('cell');
      cellDiv.dataset.row = i;
      cellDiv.dataset.col = j;
      
      if (revealedMaze[i][j] === 0) {
        cellDiv.classList.add('path');
      }
      if (currentMaze[i][j] === 3) {
        cellDiv.classList.add('entrance');
        const hint = getNextStepDirection(currentMaze, playerPos);
        if (hint) {
          cellDiv.dataset.hint = hint.name;
          cellDiv.classList.add('hint');
        }
      }
      if (currentMaze[i][j] === 4) {
        cellDiv.classList.add('exit');
      }
      if (i === playerPos.row && j === playerPos.col) {
        cellDiv.classList.add('player');
        cellDiv.textContent = "🙂";
      }
      
      cellDiv.addEventListener('click', () => {
        handleCellClick(i, j);
      });
      mazeDiv.appendChild(cellDiv);
    }
  }
}

function updateScore(points) {
  score += points;
  document.getElementById('score').textContent = score;
}

function movePlayer(newRow, newCol) {
  console.log("Премествам героя от", playerPos, "до", { row: newRow, col: newCol });
  playerPos = { row: newRow, col: newCol };
  renderMaze();
  if (currentMaze[newRow][newCol] === 4) {
    alert("Поздравления! Излязохте от лабиринта!");
    updateScore(100);
    document.getElementById('next-level').classList.remove('hidden');
  }
}

function isAdjacent(r1, c1, r2, c2) {
  return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
}

function handleCellClick(row, col) {
  if (!isAdjacent(playerPos.row, playerPos.col, row, col)) {
    alert("Можете да се движите само към съседни клетки!");
    return;
  }
  if (currentMaze[row][col] === 1) {
    alert("Това е стена!");
    return;
  }
  showQuestion(row, col, function(success) {
    if (success) {
      revealedMaze[row][col] = 0;
      updateScore(10);
      const oldDistance = getShortestPathDistance(currentMaze, playerPos);
      movePlayer(row, col);
      const newDistance = getShortestPathDistance(currentMaze, playerPos);
      if (newDistance > oldDistance) {
        const bonus = (newDistance - oldDistance) * 5;
        updateScore(bonus);
        alert("Избрахте по-дълъг път, получавате бонус " + bonus + " точки!");
      }
    }
  });
}

function showQuestion(row, col, callback) {
  const questionContainer = document.getElementById('question-container');
  const questionText = document.getElementById('question-text');
  const answersDiv = document.getElementById('answers');
  const cellKey = row + "_" + col;
  // Използваме API за зареждане на въпрос за текущия автор
  getQuestionsForAuthor(currentAuthor, function(questions) {
    if (!questions || questions.length === 0) {
      alert("Няма въпроси за избрания автор.");
      return;
    }
    // Избираме произволен въпрос
    const randomIndex = Math.floor(Math.random() * questions.length);
    const q = questions[randomIndex];
    // Запазваме въпроса за клетката
    wrongCellQuestion[cellKey] = q;
    questionText.textContent = q.question;
    answersDiv.innerHTML = "";
    if (q.answer_a) answersDiv.insertAdjacentHTML('beforeend', `<button class="answer-btn" data-answer="${q.answer_a}">${q.answer_a}</button>`);
    if (q.answer_b) answersDiv.insertAdjacentHTML('beforeend', `<button class="answer-btn" data-answer="${q.answer_b}">${q.answer_b}</button>`);
    if (q.answer_c) answersDiv.insertAdjacentHTML('beforeend', `<button class="answer-btn" data-answer="${q.answer_c}">${q.answer_c}</button>`);
    if (q.answer_d) answersDiv.insertAdjacentHTML('beforeend', `<button class="answer-btn" data-answer="${q.answer_d}">${q.answer_d}</button>`);
    const buttons = answersDiv.querySelectorAll('.answer-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', function() {
        clearInterval(timerInterval);
        if (btn.getAttribute('data-answer') === q.correct_answer) {
          alert("Правилен отговор!");
          const nextStep = getNextStepDirection(currentMaze, playerPos);
          if (nextStep) {
            alert("Подсказка: продължете " + nextStep.name + ".");
          }
          questionContainer.classList.add('hidden');
          delete wrongCellQuestion[cellKey];
          callback(true);
        } else {
          currentMaze[row][col] = -1;
          renderMaze();
          questionContainer.classList.add('hidden');
          openExplanationWindow(q.explanation, function() {
            questionContainer.classList.remove('hidden');
            callback(false);
          });
        }
      });
    });
    questionContainer.classList.remove('hidden');
  });
}

function startTimer(duration, display, onTimeUp) {
  let timer = duration;
  clearInterval(timerInterval);
  timerInterval = setInterval(function() {
    display.textContent = timer;
    if (--timer < 0) {
      clearInterval(timerInterval);
      onTimeUp();
    }
  }, 1000);
}

function getShortestPathDistance(maze, startPos) {
  const rows = maze.length;
  const cols = maze[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue = [];
  queue.push({ row: startPos.row, col: startPos.col, distance: 0 });
  visited[startPos.row][startPos.col] = true;
  while (queue.length > 0) {
    const current = queue.shift();
    if (maze[current.row][current.col] === 4) {
      return current.distance;
    }
    const directions = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ];
    for (const dir of directions) {
      const newRow = current.row + dir.dr;
      const newCol = current.col + dir.dc;
      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        !visited[newRow][newCol] &&
        maze[newRow][newCol] !== 1
      ) {
        visited[newRow][newCol] = true;
        queue.push({ row: newRow, col: newCol, distance: current.distance + 1 });
      }
    }
  }
  return Infinity;
}

function getNextStepDirection(maze, startPos) {
  const rows = maze.length;
  const cols = maze[0].length;
  
  function isValid(r, c) {
    return r >= 0 && r < rows && c >= 0 && c < cols && maze[r][c] !== 1;
  }
  
  const queue = [];
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  queue.push({ row: startPos.row, col: startPos.col, path: [] });
  visited[startPos.row][startPos.col] = true;
  
  const directions = [
    { dr: -1, dc: 0, name: "нагоре" },
    { dr: 1, dc: 0, name: "надолу" },
    { dr: 0, dc: -1, name: "наляво" },
    { dr: 0, dc: 1, name: "надясно" }
  ];
  
  while (queue.length > 0) {
    const current = queue.shift();
    if (maze[current.row][current.col] === 4) {
      return current.path.length > 0 ? current.path[0] : null;
    }
    for (const dir of directions) {
      const newRow = current.row + dir.dr;
      const newCol = current.col + dir.dc;
      if (isValid(newRow, newCol) && !visited[newRow][newCol]) {
        visited[newRow][newCol] = true;
        const newPath = current.path.concat(dir);
        queue.push({ row: newRow, col: newCol, path: newPath });
      }
    }
  }
  return null;
}

function openExplanationWindow(text, callback) {
  alert("Обяснение: " + text);
  if (typeof callback === "function") callback();
}

// DOMContentLoaded event handler
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM зареден, стартирам скрипта.");
  
  // Логин обработка (dummy логин)
  document.getElementById('login-btn').addEventListener('click', function() {
    const usernameInput = document.getElementById('username').value.trim();
    if (usernameInput === "") {
      alert("Моля, въведете потребителско име.");
      return;
    }
    currentUser = usernameInput;
    document.getElementById('display-username').textContent = currentUser;
    // Скриване на началния екран и показване на основния екран и sidebar-а
    document.getElementById('initial-screen').classList.add('hidden');
    document.getElementById('sidebar').classList.remove('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    console.log("Потребителят се логна успешно.");
  });
  
  // Избор на автор от sidebar
  const authorButtons = document.querySelectorAll('.author-btn');
  authorButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      authorButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAuthor = btn.getAttribute('data-author');
      console.log("Избран автор:", currentAuthor);
      
      // Зареждане на въпроси от API за избрания автор
      getQuestionsForAuthor(currentAuthor, function(questions) {
        console.log("Получени въпроси за автора:", questions);
        gameQuestions = questions;
        displayQuestions(questions);
      });
      
      initMazeFromAuthor();
    });
  });
  
  // Управление със стрелки
  document.addEventListener('keydown', function(event) {
    const directions = {
      ArrowUp: { dr: -1, dc: 0 },
      ArrowDown: { dr: 1, dc: 0 },
      ArrowLeft: { dr: 0, dc: -1 },
      ArrowRight: { dr: 0, dc: 1 }
    };
    if (directions[event.key]) {
      const { dr, dc } = directions[event.key];
      const newRow = playerPos.row + dr;
      const newCol = playerPos.col + dc;
      if (
        newRow >= 0 && newRow < currentMaze.length &&
        newCol >= 0 && newCol < currentMaze[0].length &&
        revealedMaze[newRow][newCol] === 0
      ) {
        movePlayer(newRow, newCol);
      }
    }
  });
  
  // Бутони "Следващо ниво" и "Изход"
  document.getElementById('next-level').addEventListener('click', function() {
    if (currentLevel < MAX_LEVEL) {
      currentLevel++;
      document.getElementById('current-level').textContent = currentLevel;
      initMazeFromAuthor();
      document.getElementById('next-level').classList.add('hidden');
    } else {
      alert("Поздравления! Вие приключихте играта на максимално ниво.");
    }
  });
  
  document.getElementById('exit-btn').addEventListener('click', function() {
    document.getElementById('initial-screen').classList.remove('hidden');
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('sidebar').classList.add('hidden');
    currentLevel = 1;
    score = 0;
  });
});
