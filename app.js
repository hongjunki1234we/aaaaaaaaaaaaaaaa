const express = require('express');
const path = require('path');
require('dotenv').config();
const db = require('./config/db');
const studyRouter = require('./routes/study');
const tripsRouter = require('./routes/trips');
const tipsRouter = require('./routes/tips');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/study', studyRouter);
app.use('/trips', tripsRouter);
app.use('/tips', tipsRouter);

app.get('/', async (req, res) => {
  try {
    const [[{ studyCount }]] = await db.query('SELECT COUNT(*) AS studyCount FROM study_logs');
    const [[{ tripCount }]] = await db.query('SELECT COUNT(*) AS tripCount FROM trips');
    const [[{ tipCount }]] = await db.query('SELECT COUNT(*) AS tipCount FROM culture_tips');

    const [studyLogs] = await db.query(
      'SELECT log_id, exam_type, category, term_or_question, meaning_or_answer, mistake_note, review_count, mastery_status FROM study_logs ORDER BY log_id DESC'
    );

    const [trips] = await db.query(`
      SELECT
        t.trip_id,
        t.city_name,
        t.start_date,
        t.end_date,
        t.budget_jpy,
        t.exchange_rate_krw,
        COALESCE(SUM(CASE WHEN ti.item_type = 'EXPENSE' THEN ti.amount_jpy ELSE 0 END), 0) AS spent_jpy
      FROM trips t
      LEFT JOIN trip_items ti ON t.trip_id = ti.trip_id
      GROUP BY t.trip_id, t.city_name, t.start_date, t.end_date, t.budget_jpy, t.exchange_rate_krw
      ORDER BY t.trip_id DESC
    `);

    const [tripItems] = await db.query(`
      SELECT
        ti.item_id,
        ti.trip_id,
        t.city_name,
        ti.item_type,
        ti.title,
        ti.location_name,
        ti.visit_date,
        ti.amount_jpy,
        ti.category,
        ti.is_recommended,
        ti.note
      FROM trip_items ti
      JOIN trips t ON ti.trip_id = t.trip_id
      ORDER BY ti.item_id DESC
    `);

    const [tips] = await db.query(
      'SELECT tip_id, region_or_topic, title, content, helpful_count FROM culture_tips ORDER BY helpful_count DESC, tip_id DESC'
    );

    res.render('index', {
      stats: { studyCount, tripCount, tipCount },
      studyLogs,
      trips,
      tripItems,
      tips
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('DB 조회 중 오류가 발생했습니다.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
