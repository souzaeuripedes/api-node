const express = require('express');
const mongoose = require('mongoose');
const Routes = require('./Routes/routes');
const config = require('./config');

const app = express();
const port = 3333;

app.use(express.json());

mongoose.connect(config.databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(Routes);

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

