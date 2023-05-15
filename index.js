require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())

app.use(express.json())
app.use(express.static('build'))


const requestLogger = morgan((tokens, req, res) => {
    const status = tokens.status(req, res)
    const method = tokens.method(req, res)
    const url = tokens.url(req, res)
    const responseTime = tokens['response-time'](req, res)
    const contentLength = tokens.res(req, res, 'content-length')
    
    if (req.method === 'POST') {
      const body = JSON.stringify(req.body)
      return `${method} ${url} ${status} ${contentLength} - ${responseTime} ms ${body}`
    } else {
      return `${method} ${url} ${status} ${contentLength} - ${responseTime} ms`
    }
  })

const errorHandler = (error, req, res, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(requestLogger)

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
  })
  
app.get('/api/persons', (req, res) => {
    Person.find({}).then(person => {
        res.json(person)
  })
})

app.get('/info', (req, res) => {
    Person.find({}).then(person => {
        res.send(`Phonebook has info for ${person.length} people<br></br>${Date()}`)
    })
  })

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
    .then(person => {
        if (person) {
            res.json(person)
        } else {
            res.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndRemove(req.params.id)
    .then(result => {
        res.status(204).end()
    })
})

app.post('/api/persons', (req, res, next) => {

    const body = req.body

    const person = new Person({
        name: body.name,
        number: body.number,
      })
    
    person.save()
      .then(savedPerson => {
        res.json(savedPerson)
      })
      .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const {name, number} = req.body

    Person.findByIdAndUpdate(req.params.id, {name, number}, { new: true, runValidators: true, context: 'query' })
      .then(updatedPerson => {
        res.json(updatedPerson)
      })
      .catch(error => next(error))
  })

app.use(errorHandler)

const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

