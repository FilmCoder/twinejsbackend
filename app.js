const express = require('express')
const bodyParser = require('body-parser')
const Pool = require('pg').Pool
const app = express();
const port = 5000;

app.use(bodyParser.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'twinebot',
//   password: 'password',
//   port: 5432,
// })

app.post('/entries/:key', async (req, res) => {
  const key = req.params.key;
  const value = req.body;

  await pool.query(`
    INSERT INTO local_storage_entries(key, value)
    VALUES($1, $2)
    ON CONFLICT (key)
    DO
        UPDATE SET value = $2;
  `, [key, value]);

  res.send('Entry Saved!')
});

app.get('/entries/:key', async (req, res) => {
    const key = req.params.key;
    const out = await pool.query('SELECT value FROM local_storage_entries WHERE key = $1', [key]);

    if(out.rows.length == 0) {
        res.status(404).send(`Entry with key ${key} not found.`);
        return;
    };

    res.send(out.rows[0]);
});

app.get('/entries', async (req, res) => {
    const result = await pool.query('SELECT * from local_storage_entries');
    res.send(result.rows);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});