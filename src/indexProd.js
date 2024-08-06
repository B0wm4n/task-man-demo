const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const server = app.listen(443, function () {
   console.log("Express App running at https://127.0.0.1:443/");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new sqlite3.Database('/home/node/tasks.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the task database.');

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      taskid INTEGER PRIMARY KEY AUTOINCREMENT,
      Title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      created DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Table "tasks" has been created.');
      }
    });
  }
});

// Define valid statuses as uppercase
const VALID_STATUSES = ['PENDING', 'IN PROGRESS', 'COMPLETED'];

function isValidStatus(status) {
  // Compare the Status values as UPPERCASE
  return VALID_STATUSES.includes(status.toUpperCase());
}

app.get('/tasks/', function (req, res) {
  db.all("SELECT taskid, Title, description, status FROM tasks ORDER BY updated DESC", [], (err, rows) => {
    if (err) {
      console.log(err.message);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(rows);
  });
});

app.get('/tasks/:id', function (req, res) {
  db.get('SELECT taskid, Title, description, status FROM tasks WHERE taskid = ?', [req.params.id], function (err, row) {
    if (err) {
      console.log(err.message);
      res.status(500).send('Internal Server Error');
      return;
    }
    if (!row) {
      res.status(404).send('Task not found');
      return;
    }
    res.json(row);
  });
});

app.put('/tasks/:id', function (req, res) {
  
  // Validate the status
  if (!isValidStatus(req.body.status)) {
    res.status(400).send('Invalid status value');
    return;
  }

  db.run(
    'UPDATE tasks SET Title = ?, description = ?, status = ?, updated = CURRENT_TIMESTAMP WHERE taskid = ?',
    [req.body.title, req.body.description, req.body.status, req.params.id],
    function (err) {
      if (err) {
        console.log(err.message);
        res.status(500).send('Internal Server Error');
        return;
      }

      if (this.changes === 0) {
        res.status(404).send('Task not found');
        return;
      }

      db.get('SELECT taskid, Title, description, status, updated FROM tasks WHERE taskid = ?', [req.params.id], function (err, row) {
        if (err) {
          console.log(err.message);
          res.status(500).send('Internal Server Error');
          return;
        }
        res.json(row);
      });
    }
  );
});

app.post('/tasks', function (req, res) {

  // Validate the status
  if (!isValidStatus(req.body.status)) {
    res.status(400).send('Invalid status value');
    return;
  }

  db.run('INSERT INTO tasks (Title, description, status) VALUES (?, ?, ?)', [req.body.title, req.body.description, req.body.status], function (err) {
    if (err) {
      console.log(err.message);
      res.status(500).send('Internal Server Error');
      return;
    }

    const lastId = this.lastID;

    db.get('SELECT taskid, Title, description, status FROM tasks WHERE taskid = ?', [lastId], function (err, row) {
      if (err) {
        console.log(err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.status(201).json(row);
    });
  });
});

app.delete('/tasks/:id', function (req, res) {
  db.run(
    'DELETE FROM tasks WHERE taskid = ?',
    [req.params.id],
    function (err) {
      if (err) {
        console.log(err.message);
        res.status(500).send('Internal Server Error');
        return;
      }

      if (this.changes === 0) {
        res.status(404).send('Task not found');
        return;
      }

      console.log('Deleted record:', req.params.id);
      res.status(204).send();
    }
  );
});

