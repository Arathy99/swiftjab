const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Welcome to SwiftJAB Server v0.1'))

module.exports = app
