const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const port = 3000;
const host = '0.0.0.0';

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('driver');
});

app.get('/logistics', (req, res) => {
  res.render('logistics');
});

app.post('/logistics', (req, res) => {
  const { d_id } = req.body;
  let [r, e] = ['', ''];
  db.query('SELECT * FROM driver WHERE d_id = ?;', [d_id], (err, result) => {
    if (err || result.length == 0) {
      e += 'Error user select\n';
    } else {
        driver_id = d_id;
        r += `
            <style>
            table, th, td {
                border: 1px solid black;
            }
            caption {
                font-size: 48px;
            }
            </style>
            <table>
                <caption font-size=48px>results are</caption>
                <tr>
                    <th>driver id</th>
                    <th>driver age</th>
                    <th>driver name</th>
                    <th>logistics id</th>
                </tr>
                <tr>
                    <td>${result[0].d_id}</td>
                    <td>${result[0].d_age}</td>
                    <td>${result[0].d_name}</td>
                    <td>${result[0].logistics_id}</td>
                </tr>
            </table><br><br>
      `;
    }
  });
    db.query('SELECT logistics.start_location, logistics.end_location FROM logistics LEFT JOIN driver ON driver.logistics_id = l_id WHERE driver.d_id = ?;', [d_id], (err1, resultL) => {
      db.query('SELECT * FROM driver LEFT JOIN persons ON persons.driver_id = d_id where driver.d_id = ?;', [d_id], (err2, resultP) => {
        db.query('SELECT * FROM driver LEFT JOIN materials ON materials.driver_id = d_id where driver.d_id = ?;', [d_id], (err3, resultM) => {
            r += `<h3>your tasks are</h3><br>`;
            if (resultP[0]?.p_id && resultM[0]?.m_id) {
                r += `
                <h4>drive persons and materials, which are:</h4><br>
                <h4>drive person named: ${resultP[0].p_name}, to: ${resultP[0].p_destination}</h4><br>
                <h4>And transport material named: ${resultM[0].m_name} of origin: ${resultM[0].origin}</h4><br>
                <h4>Your start location is from: ${resultL[0].start_location}, to: ${resultL[0].end_location}</h4><br>
                `;
            } else if (resultP[0]?.p_id) {
                r += `
                <h4>drive persons, which are:</h4><br>
                <h4>drive person named: ${resultP[0].p_name}, to: ${resultP[0].p_destination}</h4><br>
                <h4>Your start location is from: ${resultL[0].start_location}, to: ${resultL[0].end_location}</h4><br>
                `;
            } else if (resultM[0]?.m_id) {
                r += `
                <h4>drive materials, which are:</h4><br>
                <h4>Transport material named: ${resultM[0].m_name} of origin: ${resultM[0].origin}</h4><br>
                <h4>Your start location is from: ${resultL[0].start_location}, to: ${resultL[0].end_location}</h4><br>
                `;
            } else {
                e += `Error one:${err1}\nTwo: ${err2}\nThree: ${err3}`;
            }
            if (e.length > 0) {
                res.send(e)
            } else {
                res.send(r);
            }
        });
      });
    });
});

app.post('/', (req, res) => {
  const {
  duration,         start_location,     end_location,
  d_id,             d_name,             d_age,
  p_id,             p_age,              p_name,
  p_destination,    p_origin,           m_id,
  m_name,           weight,             origin,
  quantity } = req.body;
  crudState = req.body['crud-selection']
  let [r, e] = ['', ''];
  console.log(req.body);
  if (crudState == 'Create') {
      db.query('INSERT INTO logistics (duration, start_location, end_location) VALUES (?, ?, ?);',
      [duration[0], start_location, end_location], (err, results) => {
        if (err) {
         e += `[one]Insertion fail\n`;
        } else {
          r += `<h3>the request body object: ${Object.keys(req.body)}</h3><br>`;
        }
      });
      let last = 0;
      db.query('SELECT last_insert_id(l_id) AS last_id FROM logistics ORDER BY l_id DESC LIMIT 1;', [], (err, result) => {
        if (err) {
           e += `[two]Failed to get id\n`;
        } else {
            r += `<h3>logistics id is: ${result[0].last_id}</h3>`;
            last = result[0].last_id;
        }
      });

      setTimeout(() => {
        db.query('INSERT INTO driver (d_id, d_name, d_age, logistics_id) VALUES (?, ?, ?, ?);',
        [d_id, d_name[0], d_age[0], last], (err, result) => {
            if (err) {
                e += `[three]Failed to insert: ${err}\n`;
            }
        });
      }, 100);

      setTimeout(() => {
        if (m_id && p_id) {
            r += `<h2>material and persons chosen</h2>`;
            db.query('INSERT INTO materials (m_id, m_name, weight, origin, quantity, driver_id) VALUES (?, ?, ?, ?, ?, ?);',
            [m_id, m_name[0], weight[0], origin[0], quantity[0], d_id], (err, result) => {
                if (err) {
                   e += `[four]Failed to insert: ${err}\n`;
                }
            });

            db.query('INSERT INTO persons (p_id, p_age, p_name, p_destination, p_origin, driver_id) VALUES (?, ?, ?, ?, ?, ?);',
            [p_id, p_age[0], p_name[0], p_destination[0], p_origin[0], d_id], (err, result) => {
                if (err) {
                    e += `Failed to insert: ${err}\n`;
                }
            });
        } else if (m_id) {
            r += `<h2>material chosen</h2>`;
            db.query('INSERT INTO materials (m_id, m_name, weight, origin, quantity, driver_id) VALUES (?, ?, ?, ?, ?, ?);',
            [m_id, m_name[0], weight[0], origin[0], quantity[0], d_id], (err, result) => {
                if (err) {
                    e += `Failed to insert: ${err}\n`;
                }
            });
        } else {
            r += `<h2>persons chosen</h2>`;
            db.query('INSERT INTO persons (p_id, p_age, p_name, p_destination, p_origin, driver_id) VALUES (?, ?, ?, ?, ?, ?);',
            [p_id, p_age[0], p_name[0], p_destination[0], p_origin[0], d_id], (err, result) => {
                if (err) {
                    e += `Failed to insert: ${err}`;
                }
            });
        }
        if (e.length > 0) {
            res.send(e);
        } else {
            res.send(r);
        }
      }, 200);

  } else if (crudState == 'Update') {
    let toUpdate = req.body['update-selection'].split(' ')[1];
    let q = 'UPDATE';
    let action = false;
    let data = [];
    switch (toUpdate) {
    case 'logistics':
        q += ' logistics SET';
        if (req.body.duration.length > 0) {
            q += ` duration = ?,`;
            data.push(req.body.duration);
            action = true;
        }
        if (req.body['start-location'].length > 0) {
            q += ` start_location = ?,`;
            data.push(req.body['start-location']);
            action = true;
        }
        if (req.body['end-location'].length > 0) {
            q += ` end_location = ?,`;
            data.push(req.body['end-location']);
            action = true;
        }
        if (action) {
            q = q.replace(/,$/, '');
            q += ` WHERE l_id = ?;`;
            data.push(req.body.l_id);
        }
        break;
    case 'driver':
        q += ' driver SET';
        if (req.body.d_age.length > 0) {
            q += ` d_age = ?,`;
            data.push(req.body.d_age);
            action = true;
        }
        if (req.body.d_name.length > 0) {
            q += ` d_name = ?,`;
            data.push(req.body.d_name);
            action = true;
        }
        if (action) {
            q = q.replace(/,$/, '');
            q += ` WHERE d_id = ?;`;
            data.push(req.body.d_id);
        }
        break;
    case 'persons':
        q += ' persons SET';
        if (req.body.p_age[1].length > 0) {
            q += ` p_age = ?,`;
            data.push(req.body.p_age[1]);
            action = true;
        }
        if (req.body.p_name[1].length > 0) {
            q += ` p_name = ?,`;
            data.push(req.body.p_name[1]);
            action = true;
        }
        if (req.body.p_destination[1].length > 0) {
            q += ` p_destination = ?,`;
            data.push(req.body.p_destination[1]);
            action = true;
        }
        if (req.body.p_origin[1].length > 0) {
            q += ` p_origin = ?,`;
            data.push(req.body.p_origin[1]);
            action = true;
        }
        if (action) {
            q = q.replace(/,$/, '');
            q += ` WHERE p_id = ?;`;
            data.push(req.body.p_id);
        }
        break;
    case 'materials':
        q += ' materials SET';
        if (req.body.m_name[1].length > 0) {
            q += ` m_name = ?,`;
            data.push(req.body.p_age[1]);
            action = true;
        }
        if (req.body.weight[1].length > 0) {
            q += ` weight = ?,`;
            data.push(req.body.weight[1]);
            action = true;
        }
        if (req.body.origin[1].length > 0) {
            q += ` origin = ?,`;
            data.push(req.body.origin[1]);
            action = true;
        }
        if (req.body.quantity[1].length > 0) {
            q += ` quantity = ?,`;
            data.push(req.body.quantity[1]);
            action = true;
        }
        if (action) {
            q = q.replace(/,$/, '');
            q += ` WHERE m_id = ?;`;
            data.push(req.body.m_id);
        }
        break;
    default:
        console.log('selection problem on update');
    }
    if (action) {
        db.query(q, data, (err, result) => {
        if (err) { throw err; }
        console.log(result.affectedRows + " record(s) updated");
        });

        res.send(`${toUpdate} is updated`);
    } else {
        console.log('nothing to update');
    }
    console.log(`query: ${q}`);

  } else if (crudState == 'Delete') {
    let toDelete = req.body['delete-selection'].split(' ')[1];
    let q = 'DELETE FROM';
    let action = false;
    let data = [];
    switch (toDelete) {
    case 'logistics':
        q += ` logistics WHERE l_id = ?;`;
        data.push(req.body.l_id);
        action = true;
        break;
    case 'driver':
        q += ` driver WHERE d_id = ?;`;
        data.push(req.body.d_id);
        action = true;
        break;
    case 'persons':
        q += ` persons WHERE p_id = ?;`;
        data.push(req.body.p_id);
        action = true;
        break;
    case 'materials':
        q += ` materials WHERE m_id = ?;`;
        data.push(req.body.m_id);
        action = true;
        break;
    default:
        console.log('selection problem on delete');
    }
    if (action) {
        db.query(q, data, (err, result) => {
        if (err) { throw err; }
        console.log(result.affectedRows + " record(s) deleted");
        });

        res.send(`${toDelete} is deleted`);
    } else {
        console.log('nothing to delete');
    }
    data = [];
    console.log(`query: ${q}`);
  }
});

app.listen(port, host, () => {
  console.log(`App listening at http://localhost:${port}`);
});
