const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. 문화·학습 팁 등록 (INSERT into culture_tips)
router.post('/add', async (req, res) => {
  const { region_or_topic, title, content } = req.body;
  try {
    await db.query(
      `INSERT INTO culture_tips (user_id, region_or_topic, title, content)
       VALUES (1, ?, ?, ?)`,
      [region_or_topic || '일본 문화/생활', title, content]
    );
    res.redirect('/#tips');
  } catch (err) {
    console.error(err);
    res.status(500).send('팁 등록 중 오류가 발생했습니다.');
  }
});

// 2. 유용함(+1) 추천 증가 (UPDATE helpful_count)
router.post('/:tipId/helpful', async (req, res) => {
  const tipId = req.params.tipId;
  try {
    await db.query(
      'UPDATE culture_tips SET helpful_count = helpful_count + 1 WHERE tip_id = ?',
      [tipId]
    );
    res.redirect('/#tips');
  } catch (err) {
    console.error(err);
    res.status(500).send('추천 반영 중 오류가 발생했습니다.');
  }
});

// 3. 팁 삭제 (DELETE)
router.post('/:tipId/delete', async (req, res) => {
  const tipId = req.params.tipId;
  try {
    await db.query('DELETE FROM culture_tips WHERE tip_id = ?', [tipId]);
    res.redirect('/#tips');
  } catch (err) {
    console.error(err);
    res.status(500).send('팁 삭제 중 오류가 발생했습니다.');
  }
});

module.exports = router;
