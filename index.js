const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())

app.use(express.json())

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

app.use(requestLogger)


let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
  })
  
app.get('/api/persons', (req, res) => {
    res.json(persons)
  })

app.get('/info', (req, res) => {
    res.send(`Phonebook has info for ${persons.length} people<br></br>${Date()}`)
  })

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
  })

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()
})

app.post('/api/persons', (req, res) => {

    const body = req.body

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    if (!body.name && !body.number) {
        return res.status(400).json({
            error: 'name and number missing'
        })
    } else if (!body.number) {
        return res.status(400).json({
            error: 'number is missing'
        })
    } else if (!body.name) {
        return res.status(400).json({
            error: 'name is missing'
        })
    } else if (persons.find(person => person.name === body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    } else {
        persons = persons.concat(person)
        res.json(person)   
    }
})

const generateId = () => {
    const min = Math.ceil(persons.length + 1)
    const max = Math.floor(30)
    return Math.floor(Math.random() * (max - min + 1) + min)
}
  
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

