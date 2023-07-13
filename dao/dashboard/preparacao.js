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
    pagePreparacao: (req, res) => {

        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {
            //Atribuindo o conteúdo central
            page = './includes/dashboard/inc_preparacao';
            //page = './includes/default/3-content_manutencao';

            //Consultas diversas para popular elementos
            let preparacoes = await DBModel.getSFPreparacao(req.query.data, req.query.turno);
            
            //Variáveis utilizadas para paginação
            var totalItens = preparacoes.length,//Qtde total de registros
                pageSize = 10,//Número máximo de registros por página
                pageCount = Math.ceil(totalItens / pageSize),//Número de páginas (Arredondar p/ cima)
                currentPage = 1,//Página corrente ao entrar na rota
                itens = [],//Array que receberá todos os registros
                itensArrays = [],//Array que receberá os registros limitados a qtde registros por páginas
                itensList = [];//Array que receberá os registros limitados a de páginas

            //Criando a lista de itens
            for (var i = 0; i < totalItens; i++) {
                itens.push(preparacoes[i]);
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
                DTPreparacao: itensList,
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
                CadRecebimento: '',
                CadEmbalagem: '',
                CadPreparacao: 'active',
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

    addPreparacao: (req, res) => {
        let cod = req.body.cod_ADD;
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_ADD);
        let turno = req.body.turno_ADD;
        let remessa_inicial = req.body.remessa_inicial_ADD;
        let remessa_atual = req.body.remessa_atual_ADD;
        let remessa_fora_plano = req.body.remessa_fora_plano_ADD;
        let linha_inicial = req.body.linha_inicial_ADD;
        let linha_atual = req.body.linha_atual_ADD;
        let linha_fora_plano = req.body.linha_fora_plano_ADD;
        let bipe_inicial = req.body.bipe_inicial_ADD;
        let bipe_atual = req.body.bipe_atual_ADD;
        let bipe_fora_plano = req.body.bipe_fora_plano_ADD;
        let valor_inicial = FUNCOES.formatDecimalToBD(req.body.valor_inicial_ADD);
        let valor_atual = FUNCOES.formatDecimalToBD(req.body.valor_atual_ADD);
        let valor_fora_plano = FUNCOES.formatDecimalToBD(req.body.valor_fora_plano_ADD);
        let atendimento_12h = FUNCOES.formatDecimalToBD(req.body.atendimento_12h_ADD);
        let atendimento_24h = FUNCOES.formatDecimalToBD(req.body.atendimento_24h_ADD);
        let setup = req.body.setup_INPUT_ADD;

        //Faz o INSERT somente nos campos da RNC parte cliente
        let query = "INSERT INTO `tb_sf_preparacao` " +
            "(data, turno, remessa_inicial, remessa_atual, remessa_fora_plano, linha_inicial, linha_atual, linha_fora_plano, bipe_inicial, bipe_atual, bipe_fora_plano, valor_inicial, valor_atual, valor_fora_plano, atendimento_12h, atendimento_24h, setup) VALUES ('" +
            data + "', '" +
            turno + "', '" +
            remessa_inicial + "', '" +
            remessa_atual + "', '" +
            remessa_fora_plano + "', '" +
            linha_inicial + "', '" +
            linha_atual + "', '" +
            linha_fora_plano + "', '" +
            bipe_inicial + "', '" +
            bipe_atual + "', '" +
            bipe_fora_plano + "', '" +
            valor_inicial + "', '" +
            valor_atual + "', '" +
            valor_fora_plano + "', '" +
            atendimento_12h + "', '" +
            atendimento_24h + "', '" +
            setup + "')";

        //Executa o INSERT
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/preparacao');
            } else {
                //INSERT realizado com sucesso
                status_Crud = 'sim';
                res.redirect('/preparacao');
            }
        });
    },

    editPreparacao: (req, res) => {
        let cod = req.body.cod_EDIT;
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_EDIT);
        let turno = req.body.turno_EDIT;
        let remessa_inicial = req.body.remessa_inicial_EDIT;
        let remessa_atual = req.body.remessa_atual_EDIT;
        let remessa_fora_plano = req.body.remessa_fora_plano_EDIT;
        let linha_inicial = req.body.linha_inicial_EDIT;
        let linha_atual = req.body.linha_atual_EDIT;
        let linha_fora_plano = req.body.linha_fora_plano_EDIT;
        let bipe_inicial = req.body.bipe_inicial_EDIT;
        let bipe_atual = req.body.bipe_atual_EDIT;
        let bipe_fora_plano = req.body.bipe_fora_plano_EDIT;
        let valor_inicial = FUNCOES.formatDecimalToBD(req.body.valor_inicial_EDIT);
        let valor_atual = FUNCOES.formatDecimalToBD(req.body.valor_atual_EDIT);
        let valor_fora_plano = FUNCOES.formatDecimalToBD(req.body.valor_fora_plano_EDIT);
        let atendimento_12h = FUNCOES.formatDecimalToBD(req.body.atendimento_12h_EDIT);
        let atendimento_24h = FUNCOES.formatDecimalToBD(req.body.atendimento_24h_EDIT);
        let setup = req.body.setup_INPUT_EDIT;

        //Faz o UPDATE
        let query = "UPDATE `tb_sf_preparacao` SET " +
            "`data` = '" + data + "', " +
            "`turno` = '" + turno + "', " +
            "`remessa_inicial` = '" + remessa_inicial + "', " +
            "`remessa_atual` = '" + remessa_atual + "', " +
            "`remessa_fora_plano` = '" + remessa_fora_plano + "', " +
            "`linha_inicial` = '" + linha_inicial + "', " +
            "`linha_atual` = '" + linha_atual + "', " +
            "`linha_fora_plano` = '" + linha_fora_plano + "', " +
            "`bipe_inicial` = '" + bipe_inicial + "', " +
            "`bipe_atual` = '" + bipe_atual + "', " +
            "`bipe_fora_plano` = '" + bipe_fora_plano + "', " +
            "`valor_inicial` = '" + valor_inicial + "', " +
            "`valor_atual` = '" + valor_atual + "', " +
            "`valor_fora_plano` = '" + valor_fora_plano + "', " +
            "`atendimento_12h` = '" + atendimento_12h + "', " +
            "`atendimento_24h` = '" + atendimento_24h + "', " +
            "`setup` = '" + setup + "'" +
            " WHERE `tb_sf_preparacao`.`cod` = '" + cod + "'";

        //Executa o UPDATE
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/preparacao');
            } else {
                //UPDATE finalizado
                status_Crud = 'sim';
                res.redirect('/preparacao');
            }
        });
    },

    delPreparacao: (req, res) => {
        let cod = req.params.id;
        let query = 'DELETE FROM `tb_sf_preparacao` WHERE cod = "' + cod + '"';

        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 014: ', err);
                status_Crud = 'nao';
                res.redirect('/preparacao');
            }

            //DELETE realizado com sucesso
            status_Crud = 'sim';
            res.redirect('/preparacao');
        });
    },

    //Funções que passam o valor da variável para outro arquivo js
    getStatusCrud() {
        return status_Crud;
    },

};