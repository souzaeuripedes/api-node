const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');

const app = express();
const port = 3333;

app.use(express.json());
app.use('/api', routes);

// mongoose.connect('mongodb://localhost/sua-api', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });


mongoose.connect('mongodb://mongodb:27017/api', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});
