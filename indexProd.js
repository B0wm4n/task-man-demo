const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const server = app.listen(443, function () {
   console.log("Express App running at https://127.0.0.1:443/");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new sqlite3.Database('tasks.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the task database.');

    db.serialize(() => {
      db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'`, (err, row) => {
        if (err) {
          console.error(err.message);
        } else if (row) {
          console.log('Table "tasks" already exists.');
        } else {
          db.run(`CREATE TABLE tasks (
            taskid INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
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
    });
  }
});

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.get('/dir/', function (req, res) {
    const dir = '.'; // Starting directory

    fs.readdir(dir, (err, files) => {
        if (err) {
            console.log(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }

        const fileDetails = [];

        files.forEach(file => {
            const filePath = path.join(dir, file);

            // Get file/directory information
            const stats = fs.statSync(filePath);

            fileDetails.push({
                name: file,
                isDirectory: stats.isDirectory(),
                size: stats.size,
                mtime: stats.mtime
            });
        });

        // Respond with a JSON array of file details
        res.json(fileDetails);
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


app.get('/tasks/', function (req, res) {
  db.all("SELECT taskid, Title, description, status FROM tasks ORDER BY updated DESC", [], (err, rows) => {
    if (err) {
      console.log(err.message);
      res.status(500).send('Internal Server Error');
      return;
    }
    // Respond with a JSON array of tasks
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
    // Check if the task exists
    if (!row) {
      res.status(404).send('Task not found');
      return;
    }
    // Send the query result as JSON response
    res.json(row);
  });
});

app.put('/tasks/:id', function (req, res) {
  db.run(
    'UPDATE tasks SET Title = ?, description = ?, status = ?, updated = CURRENT_TIMESTAMP WHERE taskid = ?',
    [req.body.title, req.body.description, req.body.status, req.params.id],
    function (err) {
      if (err) {
        console.log(err.message);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Check if any rows were updated
      if (this.changes === 0) {
        res.status(404).send('Task not found');
        return;
      }

      // Query for the updated record
      db.get('SELECT taskid, Title, description, status, updated FROM tasks WHERE taskid = ?', [req.params.id], function (err, row) {
        if (err) {
          console.log(err.message);
          res.status(500).send('Internal Server Error');
          return;
        }

        // Send the updated record as JSON
        res.json(row);
      });
    }
  );
});

app.post('/tasks', function (req, res) {
  const sql = 'INSERT INTO tasks (Title, description, status) VALUES (?, ?, "PENDING")';
  const params = [req.body.title, req.body.description];

  db.run(sql, params, function (err) {
    if (err) {
      console.log(err.message);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Use the lastID property to get the ID of the inserted row
    const lastId = this.lastID;

    // Retrieve the newly inserted record
    db.get('SELECT taskid, Title, description, status FROM tasks WHERE taskid = ?', [lastId], function (err, row) {
      if (err) {
        console.log(err.message);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Return the inserted record as JSON
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

      // Check if any rows were deleted
      if (this.changes === 0) {
        res.status(404).send('Task not found');
        return;
      }

      console.log('Deleted record:', req.params.id);

      // Send 204 No Content
      res.status(204).send();
    }
  );
});

