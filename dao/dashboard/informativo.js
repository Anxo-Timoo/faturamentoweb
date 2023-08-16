//NPM Install
const fse = require('fs-extra');

//Importando arquivo site-model.js que possui a classe com as funções de consulta
const DB = require('../listas/selects');
const FUNCOES = require('../util/funcoes');
const mysql = require('mysql2');
const config = require('../../database/config');
const conn = mysql.createPool(config);

//Variáveis a serem utilizadas
var status_Crud = '';

//Variável que recebe a página do conteúdo central a incluir na tela
var page = './includes/default/3-content';

module.exports = {
    pageInformativo: (req, res) => {

        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {
            //Atribuindo o conteúdo central
            page = './includes/dashboard/inc_informativo';
            //page = './includes/default/3-content_manutencao';

            //Consultas diversas para popular elementos
            let informativos = await DBModel.getFilterInformativos(req.query.data, req.query.setor, req.query.titulo, req.query.conteudo, req.query.visivel);

            //Variáveis utilizadas para paginação
            var totalItens = informativos.length,//Qtde total de registros
                pageSize = 10,//Número máximo de registros por página
                pageCount = Math.ceil(totalItens / pageSize),//Número de páginas (Arredondar p/ cima)
                currentPage = 1,//Página corrente ao entrar na rota
                itens = [],//Array que receberá todos os registros
                itensArrays = [],//Array que receberá os registros limitados a qtde registros por páginas
                itensList = [];//Array que receberá os registros limitados a de páginas

            //Criando a lista de itens
            for (var i = 0; i < totalItens; i++) {
                itens.push(informativos[i]);
            }

            //Divide a lista em grupos (páginas)
            while (itens.length > 0) {
                itensArrays.push(itens.splice(0, pageSize));
            }

            //Defini a página atual, se especificado na variável "page" (ex: localhost:3000/material/?page=2)
            if (typeof req.query.page !== 'undefined') {
                currentPage = +req.query.page;
            }

            //Mostrar lista de itens do grupo
            itensList = itensArrays[+currentPage - 1];

            //Passa o conteúdo das variáveis para a página principal
            res.render('./pageAdmin', {
                DTInformativo: itensList,
                pageSize: pageSize,
                totalItens: totalItens,
                pageCount: pageCount,
                currentPage: currentPage,
                body: req.query,
                //Conteúdo fixo da tela
                status_Crud,
                cod_login_pcp: req.session.cod_login_pcp,
                nome_login_pcp: req.session.nome_login_pcp,
                foto_login_pcp: req.session.foto_login_pcp,
                usuario_login_pcp: req.session.usuario_login_pcp,
                perfil_login_pcp: req.session.perfil_login_pcp,
                page,
                //Cadastros
                CadastroOpen: '',
                Cadastro: '',
                CadUsuario: '',                
                CadMaterial: '',
                //Transporte
                TransporteOpen: '',
                Transporte: '',
                CadAgenda: '',
                //Dashboard
                ShopFloorOpen: 'menu-open',
                ShopFloor: 'active',
                CadShopfloor: '',
                CadInformacoes_Gerais: '',
                CadOcorrencia_sf: '',
                CadFaturamento:'',
                CadRecebimento: '',
                CadEmbalagem: '',
                CadPreparacao: '',
                CadInventario: '',
                CadQualidade: '',
                CadInformativo: 'active',
                //Chat
                ChatOpen: '',
                Chat: '',
                CadChat: ''
            });

            //Reinicia a variável
            status_Crud = '';
            conn.releaseConnection(db);
        })();//async
    },

    addInformativo: (req, res) => {
        //Variáveis que recebe dados do formulário
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_ADD);
        let setor = req.body.setor_ADD;
        let titulo = req.body.titulo_ADD;
        let visivel = ''; if (req.body.visivel_ADD == 'on') { visivel = '1'; } else { visivel = '0'; };
        let cor = req.body.color_ADD;
        let conteudo = req.body.conteudo_ADD;
        let autor = req.session.nome_login_pcp;

        //Faz o INSERT
        let query = "INSERT INTO `tb_sf_informativo` " +
            "(data, setor, titulo, cor, conteudo, visivel, autor) VALUES ('" +
            data + "', '" +
            setor + "', '" +
            titulo + "', '" +
            cor + "', '" +
            conteudo + "', '" +
            visivel + "', '" +
            autor + "')";

        //Executa o INSERT
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/informativo');
            } else {
                //INSERT realizado com sucesso
                status_Crud = 'sim';
                res.redirect('/informativo');
            }
        });
    },

    editInformativo: (req, res) => {
        let cod = req.body.cod_EDIT;
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_EDIT);
        let setor = req.body.setor_EDIT;
        let titulo = req.body.titulo_EDIT;
        let cor = req.body.color_EDIT;
        let conteudo = req.body.conteudo_EDIT;            
        let visivel = ''; if (req.body.visivel_EDIT == 'on') { visivel = '1'; } else { visivel = '0'; };
        let autor = req.session.nome_login_pcp;

        //Faz o UPDATE
        let query = "UPDATE `tb_sf_informativo` SET " +
            "`data` = '" + data + "', " +
            "`setor` = '" + setor + "', " +
            "`titulo` = '" + titulo + "', " +
            "`cor` = '" + cor + "', " +
            "`conteudo` = '" + conteudo + "', " +
            "`visivel` = '" + visivel + "', " +
            "`autor` = '" + autor + "'" +
            " WHERE `tb_sf_informativo`.`cod` = '" + cod + "'";

        //Executa o UPDATE
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 009: ', err);
                status_Crud = 'nao';
                res.redirect('/informativo');
            } else {
                //UPDATE realizado com sucesso
                status_Crud = 'sim';
                res.redirect('/informativo');
            }
        });
    },

    delInformativo: (req, res) => {
        let cod = req.params.id;
        let query = 'DELETE FROM `tb_sf_informativo` WHERE cod = "' + cod + '"';

        //Executa do DELETE
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 014: ', err);
                status_Crud = 'nao';
                res.redirect('/informativo');
            }

            //DELETE realizado com sucesso
            status_Crud = 'sim';
            res.redirect('/informativo');
        });
    },

    /**
     * Funções que passam o valor da variável para outro arquivo js */
    getStatusCrud() {
        return status_Crud;
    },

};