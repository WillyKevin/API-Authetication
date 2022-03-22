const express = require('express');
const app = express();
const http = require("http");
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = 5005;
const HOST = '0.0.0.0';

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

require('./routes/auth-route')(app);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Header',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use((req, res, next) => {
    const erro = new Error('Não encontrado');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) =>{
    res.status(error.status || 500);
    res.json({
        erro: {
            mensagem: error.message
        }
    });
});

const server = http.createServer(app);

server.listen(PORT, HOST);

module.exports = app;
