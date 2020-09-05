const express = require('express');
const app = express();
const config = require('./config/db');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const PORT = Number(process.env.PORT || 4000);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

mongoose.connect(config.DB, {
    useNewUrlParser: true
}).then(res => {
    console.log('Connected to database..');
},
    err => {
        console.log(err);
    }
);

app.use(cors());

const Route = require('./router/restapi.router');
app.use('/rest/api', Route);

app.listen(PORT, function () {
    console.log('server is running in url http://localhost:' + PORT);
});
