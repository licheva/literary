BEGIN TRANSACTION;

-- 1. Затворен въпрос – първият български роман
INSERT INTO questions (author_id, question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, type)
VALUES (
  (SELECT id FROM authors WHERE name = 'vazov'),
  'Кое от посочените произведения на Иван Вазов е признато за първия български роман?',
  'Немили-недраги',
  'Една българка',
  'Под игото',
  'Чичовци',
  'Под игото',
  'Произведението "Под игото" е признато за първия български роман.',
  'multiple_choice'
);

-- 2. Затворен въпрос – главната героиня в "Една българка"
INSERT INTO questions (author_id, question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, type)
VALUES (
  (SELECT id FROM authors WHERE name = 'vazov'),
  'Коя е главната героиня в разказа "Една българка"?',
  'Рада Госпожина',
  'Баба Илийца',
  'Пенка Калинкина',
  'Севда Еница',
  'Баба Илийца',
  'В разказа "Една българка" главната героиня е Баба Илийца.',
  'multiple_choice'
);

-- 3. Отворен въпрос – тема на "Опълченците на Шипка"
INSERT INTO questions (author_id, question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, type)
VALUES (
  (SELECT id FROM authors WHERE name = 'vazov'),
  'Каква е основната тема в стихотворението "Опълченците на Шипка"?',
  'N/A',
  'N/A',
  'N/A',
  'N/A',
  'Подвигът на българските опълченци по време на Руско-турската освободителна война и героизмът в защита на родината',
  'Стихотворението прославя героизма и саможертвата на опълченците.',
  'open_short'
);

-- 4. Отворен въпрос – роля на природата в творчеството на Вазов
INSERT INTO questions (author_id, question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, type)
VALUES (
  (SELECT id FROM authors WHERE name = 'vazov'),
  'Каква роля изпълнява природата в творчеството на Иван Вазов?',
  'N/A',
  'N/A',
  'N/A',
  'N/A',
  'Природата в творчеството на Вазов е представена като символ на българската земя и извор на духовна сила, вдъхновение и национална гордост',
  'Природата символизира българската земя и вдъхновява национален дух.',
  'open_short'
);

-- 5. Затворен въпрос – свързване на жанровите определения
INSERT INTO questions (author_id, question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, type)
VALUES (
  (SELECT id FROM authors WHERE name = 'vazov'),
  'Свържете заглавието на произведението с подходящото жанрово определение: "Под игото", "Чичовци", "Една българка", "Опълченците на Шипка".',
  'Под игото',
  'Чичовци',
  'Една българка',
  'Опълченците на Шипка',
  'Под игото - роман; Чичовци - повест; Една българка - разказ; Опълченците на Шипка - oda',
  'Правилното свързване е: "Под игото" е роман, "Чичовци" е повест, "Една българка" е разказ, "Опълченците на Шипка" е oda.',
  'matching'
);

-- 6. Затворен въпрос – верен/грешен
INSERT INTO questions (author_id, question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, type)
VALUES (
  (SELECT id FROM authors WHERE name = 'vazov'),
  'Твърдение: "Немили-недраги" от Иван Вазов е посветено на българските хъшове, живеещи в Румъния преди Освобождението. Вярно или Грешно?',
  'Вярно',
  'Грешно',
  'N/A',
  'N/A',
  'Вярно',
  'Произведението "Немили-недраги" е посветено на българските хъшове, затова твърдението е вярно.',
  'true_false'
);


-- 7. Отворен въпрос – разширен отговор за образа на българската майка
INSERT INTO questions (author_id, question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, type)
VALUES (
  (SELECT id FROM authors WHERE name = 'vazov'),
  'Как Вазов изгражда образа на българската майка в разказа "Една българка" и какви са посланията на този образ към читателя?',
  'N/A',
  'N/A',
  'N/A',
  'N/A',
  'Баба Илийца олицетворява саможертвата, смелостта и родолюбивия дух на българката. Тя показва, че дори обикновеният човек може да бъде герой.',
  'Образът подчертава моралната устойчивост и националната гордост.',
  'open_extended'
);

-- 8. Затворен въпрос – изборен въпрос за мотиви в поезията на Вазов
INSERT INTO questions (author_id, question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, type)
VALUES (
  (SELECT id FROM authors WHERE name = 'vazov'),
  'Кой от следните мотиви НЕ е характерен за поезията на Иван Вазов?',
  'Родолюбие и преклонение пред българската природа',
  'Патриотичен призив за борба срещу робството',
  'Възхвала на човешката самота и отчуждение',
  'Преклонение пред националните герои',
  'Възхвала на човешката самота и отчуждение',
  'Този мотив не е типичен за поезията на Вазов.',
  'multiple_choice'
);

-- 9. Затворен въпрос – роден град на Вазов
INSERT INTO questions (author_id, question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, type)
VALUES (
  (SELECT id FROM authors WHERE name = 'vazov'),
  'В кой град е роден Иван Вазов?',
  'София',
  'Пловдив',
  'Сопот',
  'Казанлък',
  'Сопот',
  'Иван Вазов е роден в Сопот.',
  'multiple_choice'
);

-- 10. Отворен въпрос – общо послание на творбите на Вазов
INSERT INTO questions (author_id, question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, type)
VALUES (
  (SELECT id FROM authors WHERE name = 'vazov'),
  'Какво общо послание обединява голяма част от творбите на Иван Вазов, включително "Под игото", "Една българка" и "Опълченците на Шипка"?',
  'N/A',
  'N/A',
  'N/A',
  'N/A',
  'Те подчертават важността на родолюбието, героизма и духовната сила на българския народ, както и стремежа към свобода и национално достойнство',
  'Творбите на Вазов обединява посланието за национална гордост, свобода и героизъм.',
  'open_short'
);

COMMIT;
