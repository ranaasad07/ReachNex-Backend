const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./Mongo_Connection/connectdb');
const router = require('./Routes/route.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/ReachNex', router);
connectDB(process.env.MONGODB_URI);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
   console.log(`Server running at port ${PORT}`);
});
