
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const STATE = require('./state/index')

const NODE_ENV = STATE.dev;
require('dotenv').config({
    path: `environments/.env.${NODE_ENV}`
});
const port = process.env.PORT;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // headless: false, 
        executablePath: process.env.DIRECTORYCROME,
    }
});

require('./eventsclient')(client);

//Iniciar Servidor
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // support json encoded bodies
app.use(bodyParser.text()); // support text plain encoded bodies
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // support encoded bodies
app.set('port', process.env.PORT || port);
//Configurar ruta a archivos estáticos
app.use(express.static(path.join(__dirname, 'mediaSend')));
const server = app.listen(app.get('port'), () => {
    console.log(`server  on port: , http://localhost:${app.get('port')}`);
});

app.use('/whatsapp', require("./router")(client));
app.all('/*', function (req, res) { res.status(404).send("<h1>La ruta que buscas no está disponible</h2>"); });