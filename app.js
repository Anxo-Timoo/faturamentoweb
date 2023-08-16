//NPM Install
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const mysql = require('mysql2');
const path = require('path');
const express = require('express');
const redis = require('redis');
const session = require('express-session');
const os = require("os");
const dns = require('dns');


//================================================================== Configurações
//Cria o objeto da aplicação
var app = express();

//Inicializa o socket.io
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//Separa as partes enviadas pelo POST para facilitar a utilização dos parâmetros
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Diretório que possui os arquivos públicos como imagens, etc...
//Setar para que as rotas não percam a referência do CSS, arquivos e scripts
app.use(express.static(path.join(__dirname, 'public')));
app.use('/fornecedor', express.static(path.join(__dirname, 'public')));
app.use('/material', express.static(path.join(__dirname, 'public')));
app.use('/agenda', express.static(path.join(__dirname, 'public')));
app.use('/shopfloor', express.static(path.join(__dirname, 'public')));
app.use('/informacoes_gerais', express.static(path.join(__dirname, 'public')));
app.use('/ocorrencia_sf', express.static(path.join(__dirname, 'public')));
app.use('/faturamento', express.static(path.join(__dirname, 'public')));
app.use('/recebimento', express.static(path.join(__dirname, 'public')));
app.use('/embalagem', express.static(path.join(__dirname, 'public')));
app.use('/ordem_venda', express.static(path.join(__dirname, 'public')));
app.use('/material_sap', express.static(path.join(__dirname, 'public')));
app.use('/preparacao', express.static(path.join(__dirname, 'public')));
app.use('/inventario', express.static(path.join(__dirname, 'public')));
app.use('/qualidade', express.static(path.join(__dirname, 'public')));
app.use('/chat', express.static(path.join(__dirname, 'public')));
app.use('/usuario', express.static(path.join(__dirname, 'public')));

//Diretório onde estão as views ejs (páginas frontend)
app.set("views", path.join(__dirname, "view"));
//Seta como engine arquivos no formato "ejs"
app.set('views', 'view');
app.engine('html', require('ejs').renderFile);
app.set("view engine", "ejs");

//Criando a sessão redis
let RedisStore = require('connect-redis')(session);
let redisClient = redis.createClient();
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        host: 'localhost',
        port: 6379,
        secret: 'argenton123*',
        resave: true,
        saveUninitialized: true
    })
);

//Globais
app.locals.moment = require('moment');

//Utilizado para upload de arquivos
app.use(fileUpload());

//================================================================== Conexão ao Banco de dados
//Importamos a String de coneção que está na pasta database
var config = require('./database/config');

//Realizamos a conexão no BD
const pool = mysql.createPool(config);

//Validamos se conectou no BD
pool.getConnection(function (error) {
    if (!!error) {
        console.log('Erro ao conectar no BD:', error);
    } else {
        //Next
    }
});

// A variável "db" global recebe a conexão
global.db = pool;

//================================================================== Servidor http
//Server Listening do Node para utilizar uma porta, aqui faz a aplicação rodar
var port = 3000;
var visitas = 0;
var usuarioConectado = 0;
let messages = [];

/* Inicia a o servidor Node.JS */
server.listen(port, () => {
    console.log('------------------- Servidor online -----------');
    console.log('Endereço          : http://' + os.hostname() + ':' + port);
    console.log('Máquina           : ' + os.type(), os.platform(), os.release());
    console.log('Desenvolvido por  : souza.marcelo9@gmail.com');
    console.log('Contato           : (21) 97954-9810');
    console.log('-----------------------------------------------');
});

io.on('connection', socket => {
    visitas++;
    usuarioConectado++;
    console.log(`Token conectado   : ${socket.id}`);
    console.log('Usuários online   :', usuarioConectado);
    console.log('Número de acessos :', visitas);
    console.log('-----------------------------------------------');

    //Escuta o sendMessage do front end e add a msg no array messages[]
    socket.on('sendMessage', data => {
        //Emite a mensagem aos demais usuários    
        socket.broadcast.emit('receivedMessage', data);
        messages.push(data);
    });

    //Emite as mensagens guardandas na memoria para o front-end
    socket.emit('previousMessages', messages);

    socket.on('disconnect', socket => {
        usuarioConectado--;
        console.log('Usuários online   :', usuarioConectado);
        console.log('-----------------------------------------------');
    });
});

/**
 * Ao acessar o sistema vai entrar no routes/rotas e 
 * passar como "get" o "/login" (ver no "route/rotas.js")
 * Onde tem os GET e POST e direcionamento das páginas passando também o io (socket) */
const rotas = require('./route/rotas')(io);
app.use('/', rotas);

//================================================================== Fim
