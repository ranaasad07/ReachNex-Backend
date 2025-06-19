const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./Mongo_Connection/connectdb');

const authenticationRoute = require('./Routes/authenticationRoute');
const postRoute = require("./Routes/postRoute")
const profileRoute = require("./Routes/profileRoute")

const app = express();

app.use(cors());
app.use(express.json());

app.use('/ReachNex', authenticationRoute);
app.use('/ReachNex', postRoute);
app.use('/ReachNex', profileRoute);
connectDB(process.env.MONGODB_URI);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
   console.log(`Server running at port ${PORT}`);
});
