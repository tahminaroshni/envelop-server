require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute');

const app = express();

// middlewares
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use('/api/user', userRoute);


// port
const PORT = process.env.PORT || 5000;

// requests
app.get('/', (req, res) => {
  res.json({ message: 'Getting messages' });
})

// connect to mongoose/db
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    // listening to port
    app.listen(PORT, () => {
      console.log(`Connected to db and Listening to server ${PORT}`);
    })
  }).catch(err => {
    console.log(err.message);
  })

