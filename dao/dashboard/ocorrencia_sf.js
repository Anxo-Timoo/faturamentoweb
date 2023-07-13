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
    pageOcorrencia_sf: (req, res) => {

        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {
            //Atribuindo o conteúdo central
            page = './includes/dashboard/inc_ocorrencia_sf';
            //page = './includes/default/3-content_manutencao';

            //Consultas diversas para popular elementos
            let ocorrencias = await DBModel.getSFOcorrencias(req.query.cod, req.query.setor, req.query.solucao, req.query.descricao, req.query.acao, req.query.responsavel, req.query.status);
            let setor = await DBModel.getSetor();

            //Variáveis utilizadas para paginação
            var totalItens = ocorrencias.length,//Qtde total de registros
                pageSize = 10,//Número máximo de registros por página
                pageCount = Math.ceil(totalItens / pageSize),//Número de páginas (Arredondar p/ cima)
                currentPage = 1,//Página corrente ao entrar na rota
                itens = [],//Array que receberá todos os registros
                itensArrays = [],//Array que receberá os registros limitados a qtde registros por páginas
                itensList = [];//Array que receberá os registros limitados a de páginas

            //Criando a lista de itens
            for (var i = 0; i < totalItens; i++) {
                itens.push(ocorrencias[i]);
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
                //Populando elementos
                DTOcorrencias_sf: itensList,
                pageSize: pageSize,
                totalItens: totalItens,
                pageCount: pageCount,
                currentPage: currentPage,
                body: req.query,
                DTSetor: setor,
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
                CadOcorrencia_sf: 'active',
                CadRecebimento: '',
                CadEmbalagem: '',
                CadPreparacao: '',
                CadInventario: '',
                CadQualidade: '',
                CadInformativo: '',
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

    addOcorrencia_sf: (req, res) => {
        let cod = req.body.cod_ADD;
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_ADD);
        let semana = FUNCOES.formatDateTimeToWeek(req.body.data_INPUT_ADD);
        let setor = req.body.setor_ADD;
        let solucao = req.body.solucao_ADD;
        let descricao = req.body.descricao_ADD.trim();
        let acao = req.body.acao_ADD.trim();
        let responsavel = req.body.responsavel_ADD.trim();
        let prazo = FUNCOES.formatDateTimeToBD(req.body.prazo_INPUT_ADD);
        let status = req.body.status_ADD;

        //Faz o INSERT somente nos campos da RNC parte cliente
        let query = "INSERT INTO `tb_sf_ocorrencia` " +
            "(data, semana, setor, solucao, descricao, acao, responsavel, prazo, status) VALUES ('" +
            data + "', '" +
            semana + "', '" +
            setor + "', '" +
            solucao + "', '" +
            descricao + "', '" +
            acao + "', '" +
            responsavel + "', '" +
            prazo + "', '" +
            status + "')";

        //Executa o INSERT
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/ocorrencia_sf');
            } else {
                //INSERT realizado com sucesso                            

                status_Crud = 'sim';
                res.redirect('/ocorrencia_sf');
            }
        });
    },

    editOcorrencia_sf: (req, res) => {
        let cod = req.body.cod_EDIT;
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_EDIT);
        let semana = FUNCOES.formatDateTimeToWeek(req.body.data_INPUT_EDIT);
        let setor = req.body.setor_EDIT;
        let solucao = req.body.solucao_EDIT;
        let descricao = req.body.descricao_EDIT.trim();
        let acao = req.body.acao_EDIT.trim();
        let responsavel = req.body.responsavel_EDIT.trim();
        let prazo = FUNCOES.formatDateTimeToBD(req.body.prazo_INPUT_EDIT);
        let status = req.body.status_EDIT;

        //Faz o UPDATE
        let query = "UPDATE `tb_sf_ocorrencia` SET " +
            "`data` = '" + data + "', " +
            "`semana` = '" + semana + "', " +
            "`setor` = '" + setor + "', " +
            "`solucao` = '" + solucao + "', " +
            "`descricao` = '" + descricao + "', " +
            "`acao` = '" + acao + "', " +
            "`responsavel` = '" + responsavel + "', " +
            "`prazo` = '" + prazo + "', " +
            "`status` = '" + status + "'" +
            " WHERE `tb_sf_ocorrencia`.`cod` = '" + cod + "'";

        //Executa o UPDATE
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/ocorrencia_sf');
            } else {
                //UPDATE finalizado
                status_Crud = 'sim';
                res.redirect('/ocorrencia_sf');
            }
        });
    },

    delOcorrencia_sf: (req, res) => {
        let cod = req.params.id;
        let query = 'DELETE FROM `tb_sf_ocorrencia` WHERE cod = "' + cod + '"';

        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 014: ', err);
                status_Crud = 'nao';
                res.redirect('/ocorrencia_sf');
            }

            //DELETE realizado com sucesso
            status_Crud = 'sim';
            res.redirect('/ocorrencia_sf');
        });
    },

    //Funções que passam o valor da variável para outro arquivo js
    getStatusCrud() {
        return status_Crud;
    },

};