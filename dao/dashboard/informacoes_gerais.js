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
    pageInfoGerais: (req, res) => {

        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {
            //Atribuindo o conteúdo central
            page = './includes/dashboard/inc_informacoes_gerais';
            //page = './includes/default/3-content_manutencao';

            //Consultas diversas para popular elementos
            let informacoes_gerais = await DBModel.getSFInformacoes_gerais(req.query.data, req.query.aviso, req.query.ativo);
            
            //Variáveis utilizadas para paginação
            var totalItens = informacoes_gerais.length,//Qtde total de registros
                pageSize = 10,//Número máximo de registros por página
                pageCount = Math.ceil(totalItens / pageSize),//Número de páginas (Arredondar p/ cima)
                currentPage = 1,//Página corrente ao entrar na rota
                itens = [],//Array que receberá todos os registros
                itensArrays = [],//Array que receberá os registros limitados a qtde registros por páginas
                itensList = [];//Array que receberá os registros limitados a de páginas

            //Criando a lista de itens
            for (var i = 0; i < totalItens; i++) {
                itens.push(informacoes_gerais[i]);
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
                DTInformacoesGerais: itensList,
                pageSize: pageSize,
                totalItens: totalItens,
                pageCount: pageCount,
                currentPage: currentPage,
                body: req.query,
                status_Crud,
                cod_login_pcp: req.session.cod_login_pcp,
                nome_login_pcp: req.session.nome_login_pcp,
                foto_login_pcp: req.session.foto_login_pcp,
                usuario_login_pcp: req.session.usuario_login_pcp,
                perfil_login_pcp: req.session.perfil_login_pcp,
                page,
                //Cadastros
                Cadastro: '',
                CadastroOpen: '',
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
                CadInformacoes_Gerais: 'active',
                CadOcorrencia_sf: '',
                CadRecebimento: '',
                CadFaturamento:'',
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
        })();
    },

    addInfoGerais: (req, res) => {
        let cod = req.body.cod_ADD;
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_ADD);
        let dia_semana = FUNCOES.formatDateTimeToDay(req.body.data_INPUT_ADD);
        let semana = FUNCOES.formatDateTimeToWeek(req.body.data_INPUT_ADD);
        let aviso_feedback = req.body.aviso_feedback_ADD.trim();
        if (req.body.ativo_ADD == 'on') {
            ativo = '1';
        } else {
            ativo = '0';
        };

        //Faz o INSERT
        let query = "INSERT INTO `tb_sf_informacoes_gerais` " +
            "(data, dia_semana, semana, aviso_feedback, ativo) VALUES ('" +
            data + "', '" +
            dia_semana + "', '" +
            semana + "', '" +
            aviso_feedback + "', '" +
            ativo + "')";

        //Executa o INSERT
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/informacoes_gerais');
            } else {
                //INSERT realizado com sucesso
                status_Crud = 'sim';
                res.redirect('/informacoes_gerais');
            }
        });

    },

    editInfoGerais: (req, res) => {
        let cod = req.body.cod_EDIT;
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_EDIT);
        let dia_semana = FUNCOES.formatDateTimeToDay(req.body.data_INPUT_EDIT);
        let semana = FUNCOES.formatDateTimeToWeek(req.body.data_INPUT_EDIT);
        let aviso_feedback = req.body.aviso_feedback_EDIT.trim();
        if (req.body.ativo_EDIT == 'on') {
            ativo = '1';
        } else {
            ativo = '0';
        };

        //Faz o UPDATE
        let query = "UPDATE `tb_sf_informacoes_gerais` SET " +
            "`data` = '" + data + "', " +
            "`dia_semana` = '" + dia_semana + "', " +
            "`semana` = '" + semana + "', " +
            "`aviso_feedback` = '" + aviso_feedback + "', " +
            "`ativo` = '" + ativo + "'" +
            " WHERE `tb_sf_informacoes_gerais`.`cod` = '" + cod + "'";

        //Executa o UPDATE
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 009: ', err);
                status_Crud = 'nao';
                res.redirect('/informacoes_gerais');
            } else {
                //UPDATE realizado com sucesso
                status_Crud = 'sim';
                res.redirect('/informacoes_gerais');
            }
        });
    },

    delInfoGerais: (req, res) => {
        let cod = req.params.id;
        let query = 'DELETE FROM `tb_sf_informacoes_gerais` WHERE cod = "' + cod + '"';

        //Executa do DELETE
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 014: ', err);
                status_Crud = 'nao';
                res.redirect('/informacoes_gerais');
            }

            //DELETE realizado com sucesso
            status_Crud = 'sim';
            res.redirect('/informacoes_gerais');
        });
    },

    /**
     * Funções que passam o valor da variável para outro arquivo js */
    getStatusCrud() {
        return status_Crud;
    },

};