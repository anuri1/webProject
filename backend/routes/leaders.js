const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        console.log('Запрос на получение рекордов');
        const result = await pool.query('SELECT * FROM leaders ORDER BY score DESC LIMIT 20');
        console.log('Найдено записей:', result.rows.length);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Ошибка в GET /:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    }
});

router.post('/', async (req, res) => {
    try {
        console.log('💾 Запрос на сохранение:', req.body);
        const { player_name, level_id, level_name, speed, accuracy, score } = req.body;
        
        const result = await pool.query(
            `INSERT INTO leaders (player_name, level_id, level_name, speed, accuracy, score) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [player_name, level_id, level_name, speed, accuracy, score]
        );
        
        console.log('Сохранено:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('❌ Ошибка в POST /:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    }
});

module.exports = router;