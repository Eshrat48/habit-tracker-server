const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Users server is available!')
})

app.listen(port, () => {
  console.log(`Users Server started on Port: ${port}`)
})
