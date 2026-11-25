const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. 새 어학 오답·어휘 추가 (INSERT)
router.post('/add', async (req, res) => {
  const { exam_type, category, term_or_question, meaning_or_answer, mistake_note } = req.body;
  try {
    await db.query(
      `INSERT INTO study_logs (user_id, exam_type, category, term_or_question, meaning_or_answer, mistake_note)
       VALUES (1, ?, ?, ?, ?, ?)`,
      [exam_type, category, term_or_question, meaning_or_answer, mistake_note || '']
    );
    res.redirect('/#study');
  } catch (err) {
    console.error(err);
    res.status(500).send('어학 로그 등록 중 오류가 발생했습니다.');
  }
});

// 2. 복습 완료 버튼: review_count 증가 및 숙련도 상태 자동 전이 (주도적 상태 머신 로직)
router.post('/:id/review', async (req, res) => {
  const logId = req.params.id;
  try {
    const [[row]] = await db.query('SELECT review_count FROM study_logs WHERE log_id = ?', [logId]);
    if (!row) return res.status(404).send('항목을 찾을 수 없습니다.');

    const nextCount = row.review_count + 1;
    let nextStatus = 'LEARNING';
    if (nextCount >= 3) {
      nextStatus = 'MASTERED';
    } else if (nextCount >= 1) {
      nextStatus = 'REVIEWING';
    }

    await db.query(
      'UPDATE study_logs SET review_count = ?, mastery_status = ? WHERE log_id = ?',
      [nextCount, nextStatus, logId]
    );
    res.redirect('/#study');
  } catch (err) {
    console.error(err);
    res.status(500).send('복습 상태 업데이트 중 오류가 발생했습니다.');
  }
});

// 3. 오답 재학습 버튼: 틀렸을 때 LEARNING으로 초기화 (상태 전이)
router.post('/:id/reset', async (req, res) => {
  const logId = req.params.id;
  try {
    await db.query(
      "UPDATE study_logs SET review_count = 0, mastery_status = 'LEARNING' WHERE log_id = ?",
      [logId]
    );
    res.redirect('/#study');
  } catch (err) {
    console.error(err);
    res.status(500).send('상태 초기화 중 오류가 발생했습니다.');
  }
});

// 4. 삭제 기능 (DELETE)
router.post('/:id/delete', async (req, res) => {
  const logId = req.params.id;
  try {
    await db.query('DELETE FROM study_logs WHERE log_id = ?', [logId]);
    res.redirect('/#study');
  } catch (err) {
    console.error(err);
    res.status(500).send('삭제 중 오류가 발생했습니다.');
  }
});

module.exports = router;
