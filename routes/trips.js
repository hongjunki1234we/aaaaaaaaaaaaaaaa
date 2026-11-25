const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. 새 일본 여행 등록 (INSERT into trips)
router.post('/add', async (req, res) => {
  const { city_name, start_date, end_date, budget_jpy, exchange_rate_krw, memo } = req.body;
  try {
    await db.query(
      `INSERT INTO trips (user_id, city_name, start_date, end_date, budget_jpy, exchange_rate_krw, memo)
       VALUES (1, ?, ?, ?, ?, ?, ?)`,
      [
        city_name,
        start_date,
        end_date,
        Number(budget_jpy) || 0,
        Number(exchange_rate_krw) || 9.0,
        memo || ''
      ]
    );
    res.redirect('/#trips');
  } catch (err) {
    console.error(err);
    res.status(500).send('여행 등록 중 오류가 발생했습니다.');
  }
});

// 2. 여행 세부 항목(경비 / 일정 / 추천 스팟) 추가 (INSERT into trip_items)
router.post('/:tripId/items/add', async (req, res) => {
  const tripId = req.params.tripId;
  const { item_type, title, location_name, visit_date, amount_jpy, category, is_recommended, note } = req.body;
  try {
    await db.query(
      `INSERT INTO trip_items
        (trip_id, item_type, title, location_name, visit_date, amount_jpy, category, is_recommended, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tripId,
        item_type,
        title,
        location_name || '',
        visit_date || null,
        Number(amount_jpy) || 0,
        category || 'OTHER',
        is_recommended ? 1 : 0,
        note || ''
      ]
    );
    res.redirect('/#trips');
  } catch (err) {
    console.error(err);
    res.status(500).send('여행 항목 등록 중 오류가 발생했습니다.');
  }
});

// 3. 여행 세부 항목 삭제
router.post('/items/:itemId/delete', async (req, res) => {
  const itemId = req.params.itemId;
  try {
    await db.query('DELETE FROM trip_items WHERE item_id = ?', [itemId]);
    res.redirect('/#trips');
  } catch (err) {
    console.error(err);
    res.status(500).send('여행 항목 삭제 중 오류가 발생했습니다.');
  }
});

module.exports = router;
