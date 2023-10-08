const express = require("express");
const mysql = require('mysql2')
const nodemailer = require('nodemailer')
require("dotenv").config()
const cors = require('cors')

let transporter

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
})
connection.connect()

nodemailer.createTestAccount().then(res => {


  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.USEREMAIL,
      clientId: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      refreshToken: process.env.CLIENTREFRESHTOKEN,
      accessToken: process.env.CLIENTACCESSTOKEN
    }
  })
})


const app = express()
app.use(express.json())
app.use(cors())

app.get('/data', (req, res) => {
  connection.query('SELECT * FROM data', (err, rows) => {
    if (err) throw err
    res.send(rows)
  })
})

app.post('/data', (req, res) => {
  connection.query(`INSERT INTO data (last_name, first_name, middle_name, email_address) VALUES (
    "${req.body.last_name}", "${req.body.first_name}", ${req.body.middle_name ? `"${req.body.middle_name}"` : "NULL"}, "${req.body.email_address}"
    )
  `, (err, result) => {
    res.send(err || result)
  })
})

app.put('/data/:id', (req, res) => {
  connection.query(`
  UPDATE data 
  SET last_name = "${req.body.last_name}", 
    first_name = "${req.body.first_name}", 
    middle_name = ${req.body.middle_name
      ? `"${req.body.middle_name}"`
      : "NULL"
    }, 
    email_address = "${req.body.email_address}"
  WHERE id = ${req.params.id}
  `,
    (err, result) => {
      res.send(err || result)
    })
})

app.delete('/data/:id', (req, res) => {
  connection.query(`
  DELETE FROM data WHERE id = ${req.params.id}
  `, (err, result) => {
    res.send(err || result)
  })
})

app.post('/sendMail', (req, res) => {
  transporter.sendMail({
    from: process.env.FROM,
    to: req.body.to,
    subject: req.body.subject,
    text: req.body.text,
    html: req.body.html,
  }).then(result => {
    res.send(result)
  })
})

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is listening on port ${process.env.PORT || 3000}.`)
})