//import the node express package
const express = require('express')
//import the node nedb package
const Datastore = require('nedb')
//import the node-fetch package to be able to do serverside fetch-requests
const fetch = require('node-fetch')
//load anything in the file .env into an environment variable (process.env)
require('dotenv').config()

//create a web application by calling the function express (which contains the whole package)
const app = express()
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Starting server at ${port}`))
//using express to host static files => server serves any file in the 'public' folder
app.use(express.static('public'))
//parse any incoming data as JSON
app.use(express.json({ limit: '1mb' }))

//create the database and specify the path to the file where the database is going to sit
const database = new Datastore('database.db')
//load the data into memory (create the above mentioned file on first run)
database.loadDatabase()

//New Route for Querying the Database
app.get('/api', (request, response) => {
    //empty object means find everything
    database.find({}, (err, data) => {
        if (err) {
            response.end()
            return
        }
        response.json(data)
    })
})

//Route = Endpoint = Address, at which the data is sent to (where the post from the client is received)
app.post('/api', (request, response) => {
    console.log('I got a request!')
    const data = request.body
    const timestamp = Date.now()
    data.timestamp = timestamp
    //store the data into the database
    database.insert(data)
    response.json(data)
})

//New Endpoint for a GET-Request
//when lat and long is sent in as route parameter, the server is requesting weather data from openWeather API and sending them back to the client
app.get('/weather/:latlon', async (request, response) => {
    const latlon = request.params.latlon.split(',')
    const lat = latlon[0]
    const lon = latlon[1]
    //GET weather data
    const api_key = process.env.API_KEY
    const weather_url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${api_key}`
    const weather_response = await fetch(weather_url)
    const weather_data = await weather_response.json()

    //GET air quality data
    const aq_url = `https://u50g7n0cbj.execute-api.us-east-1.amazonaws.com/v2/latest?limit=1&coordinates=${lat}%2C${lon}`
    const aq_response = await fetch(aq_url)
    const aq_data = await aq_response.json()

    const data = {
        weather: weather_data,
        air_quality: aq_data
    }
    //send the data back to the client
    response.json(data)
})
