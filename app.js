const express = require('express')
const app = express()

app.use(express.static('public'))

const PORT = process.env.PORT || 4001
app.listen(PORT, () => {
    console.log('Running on port: '+PORT)
})