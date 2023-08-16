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
    pageInventario: (req, res) => {

        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {
            //Atribuindo o conteúdo central
            page = './includes/dashboard/inc_inventario';
            //page = './includes/default/3-content_manutencao';

            //Consultas diversas para popular elementos
            let inventarios = await DBModel.getSFInventarios(req.query.data, req.query.turno);
            
            //Variáveis utilizadas para paginação
            var totalItens = inventarios.length,//Qtde total de registros
                pageSize = 10,//Número máximo de registros por página
                pageCount = Math.ceil(totalItens / pageSize),//Número de páginas (Arredondar p/ cima)
                currentPage = 1,//Página corrente ao entrar na rota
                itens = [],//Array que receberá todos os registros
                itensArrays = [],//Array que receberá os registros limitados a qtde registros por páginas
                itensList = [];//Array que receberá os registros limitados a de páginas

            //Criando a lista de itens
            for (var i = 0; i < totalItens; i++) {
                itens.push(inventarios[i]);
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
                DTInventario: itensList,
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
                CadInventario: 'active',
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

    addInventario: (req, res) => {
        let cod = req.body.cod_ADD;
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_ADD);
        let turno = req.body.turno_ADD;
        let pns_em_contagem = req.body.pns_em_contagem_ADD;
        let locais_aereo = req.body.locais_aereo_ADD;
        let locais_picking = req.body.locais_picking_ADD;
        let faltante = FUNCOES.formatDecimalToBD(req.body.faltante_ADD);

        //Faz o INSERT somente nos campos da RNC parte cliente
        let query = "INSERT INTO `tb_sf_inventario` " +
            "(data, turno, pns_em_contagem, locais_aereo, locais_picking, faltante) VALUES ('" +
            data + "', '" +
            turno + "', '" +
            pns_em_contagem + "', '" +
            locais_aereo + "', '" +
            locais_picking + "', '" +
            faltante + "')";

        //Executa o INSERT
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/inventario');
            } else {
                //INSERT realizado com sucesso
                status_Crud = 'sim';
                res.redirect('/inventario');
            }
        });
    },

    editInventario: (req, res) => {
        let cod = req.body.cod_EDIT;
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_EDIT);
        let turno = req.body.turno_EDIT;
        let pns_em_contagem = req.body.pns_em_contagem_EDIT;
        let locais_aereo = req.body.locais_aereo_EDIT;
        let locais_picking = req.body.locais_picking_EDIT;
        let faltante = FUNCOES.formatDecimalToBD(req.body.faltante_EDIT);

        //Faz o UPDATE
        let query = "UPDATE `tb_sf_inventario` SET " +
            "`data` = '" + data + "', " +
            "`turno` = '" + turno + "', " +
            "`pns_em_contagem` = '" + pns_em_contagem + "', " +
            "`locais_aereo` = '" + locais_aereo + "', " +
            "`locais_picking` = '" + locais_picking + "', " +
            "`faltante` = '" + faltante + "'" +
            " WHERE `tb_sf_inventario`.`cod` = '" + cod + "'";

        //Executa o UPDATE
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/inventario');
            } else {
                //UPDATE finalizado
                status_Crud = 'sim';
                res.redirect('/inventario');
            }
        });
    },

    delInventario: (req, res) => {
        let cod = req.params.id;
        let query = 'DELETE FROM `tb_sf_inventario` WHERE cod = "' + cod + '"';

        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 014: ', err);
                status_Crud = 'nao';
                res.redirect('/inventario');
            }

            //DELETE realizado com sucesso
            status_Crud = 'sim';
            res.redirect('/inventario');
        });
    },

    //Funções que passam o valor da variável para outro arquivo js
    getStatusCrud() {
        return status_Crud;
    },

};