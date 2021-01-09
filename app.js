const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const config = require('config')
const mongoose = require('mongoose')
const path = require('path')

const app = express()

app.use(cors())
app.use(morgan('combined'))
app.use(bodyParser.json())

const STATIC = path.join(__dirname, 'client', 'dist')
const INDEX = path.resolve(STATIC, 'index.html')

app.use(express.json({ extended: true }))
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/card', require('./routes/card.routes'))

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(STATIC))
  app.get('*', (req, res) => {
    // if (!/\..+$/.test(req.url)) {
    res.sendFile(INDEX)
    // }
  })
}

const PORT = config.get('port') || 5000

const start = async () => {
  try {
    await mongoose.connect(config.get('mongoUri'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })

    app.listen(PORT, () => {
      console.log(`App has been started on port ${PORT}...`)
    })
  } catch (e) {
    console.log(`Server error ${e.message}`)
    process.exit(1)
  }
}

start()
