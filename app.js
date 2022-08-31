const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

//api will be able to handle req that are coming from
// diff origin
const cors = require('cors');
const expressValidator = require('express-validator')
require('dotenv').config();

//import routes
const AuthRoutes = require('./routes/auth');
const UserRoutes = require('./routes/user');
const CategoryRoutes = require('./routes/category');
const ProductRoutes = require('./routes/product');

//app
const app = express()

//database
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser : true
}).then(() => console.log("Database connected"));


//middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(expressValidator());
app.use(cors());

//routes middleware
app.use("/api", AuthRoutes);
app.use("/api", UserRoutes);
app.use("/api", CategoryRoutes);
app.use("/api", ProductRoutes);

const port = process.env.PORT || 8000

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})