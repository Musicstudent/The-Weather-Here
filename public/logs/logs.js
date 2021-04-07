
//Making a map and tiles
const myMap = L.map('checkinMap').setView([0, 0], 2)
const attribution = '&copy; <a href="https://www.openstreetmap/copyright">OpenStreetMap</a> contributors'

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tiles = L.tileLayer(tileUrl, { attribution })
tiles.addTo(myMap)

getData()

//make a GET request to a route on the server and have that rout return all the data from the database
async function getData() {
    const response =  await fetch('/api')
    const data = await response.json()

    for (item of data) {
        const marker = L.marker([item.lat, item.lon]).addTo(myMap)
        let txt = `The weather here at ${item.lat}&deg;, ${item.lon}&deg; is defined of ${item.weather.weather[0].description}
                    with a temperature of ${item.weather.main.temp}&deg; C.`
        if (item.air.value < 0) {
            txt += ' No air quality reading.'
        } else {
            txt += `The concentration of particulate matter (${item.air.parameter}) is ${item.air.value} ${item.air.unit}
                    last read on ${item.air.lastUpdated}.`
        }
        marker.bindPopup(txt)
        // const root = document.createElement('p')
        // const geo = document.createElement('div')
        // const date = document.createElement('div')
        
        // geo.textContent = `position: ${item.lat}°, ${item.lon}°`
        // //converting the timestamp into a string
        // const dateString = new Date(item.timestamp).toLocaleString()
        // date.textContent = dateString

        // root.append(geo, date)
        // document.body.append(root)
    }
    console.log(data)
}