const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = 'https://pjxrflnxdxucxosmrdqz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqeHJmbG54ZHh1Y3hvc21yZHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5OTE0MTQsImV4cCI6MjA5NzU2NzQxNH0.CU_5ePI2iBFWMeYJT6X2X63CCZ4lKiu_qu0Zl7v_1js';

app.get('/api/leaders', async (req, res) => {
    try {
        let url = `${SUPABASE_URL}/rest/v1/leaders?select=*&order=score.desc&limit=20`;

        if (req.query.level_id) {
            url += `&level_id=eq.${parseInt(req.query.level_id)}`;
        }

        console.log('Fetching:', url);

        const response = await fetch(url, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Supabase error:', errorText);
            return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        console.log('Found records:', data.length);
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/leaders', async (req, res) => {
    try {
        console.log('Saving:', req.body);

        const response = await fetch(`${SUPABASE_URL}/rest/v1/leaders`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Supabase error:', errorText);
            return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        console.log('Saved successfully');
        res.status(201).json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/test', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});