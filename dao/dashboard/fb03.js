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
    pageFB03: (req, res) => {

        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {
            //Atribuindo o conteúdo central
            page = './includes/dashboard/inc_fb03';
            //page = './includes/default/3-content_manutencao';

            //Consultas diversas para popular elementos
            let fb03 = await DBModel.getFB03ByBelnrRFC('ZFI_DOCUMENT_READ1',req.params.id,req.params.gjahr);
            
            //Variáveis utilizadas para paginação
            var totalItens = fb03.length,//Qtde total de registros
                pageSize = 99,//Número máximo de registros por página
                pageCount = Math.ceil(totalItens / pageSize),//Número de páginas (Arredondar p/ cima)
                currentPage = 1,//Página corrente ao entrar na rota
                itens = [],//Array que receberá todos os registros
                itensArrays = [],//Array que receberá os registros limitados a qtde registros por páginas
                itensList = [];//Array que receberá os registros limitados a de páginas

            //Criando a lista de itens
            for (var i = 0; i < totalItens; i++) {
                itens.push(fb03[i]);
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
                DTQualidade: itensList,
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
                CadQualidade: 'active',
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

    addFB03: (req, res) => {
        let cod = req.body.cod_ADD;
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_ADD);
        let turno = req.body.turno_ADD;
        let avaria_interna = req.body.avaria_interna_ADD;
        let rnc_operador = req.body.rnc_operador_ADD;
        let ppm_atual = req.body.ppm_atual_ADD;
        let ppm_acumulado = req.body.ppm_acumulado_ADD;
        let observacoes = req.body.observacoes_ADD;

        //Faz o INSERT somente nos campos da RNC parte cliente
        let query = "INSERT INTO `tb_sf_qualidade` " +
            "(data, turno, avaria_interna, rnc_operador, ppm_atual, ppm_acumulado, observacoes) VALUES ('" +
            data + "', '" +
            turno + "', '" +
            avaria_interna + "', '" +
            rnc_operador + "', '" +
            ppm_atual + "', '" +
            ppm_acumulado + "', '" +
            observacoes + "')";

        //Executa o INSERT
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/qualidade');
            } else {
                //INSERT realizado com sucesso                            

                status_Crud = 'sim';
                res.redirect('/qualidade');
            }
        });
    },

    editFB03: (req, res) => {
        let cod = req.body.cod_EDIT;
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_EDIT);
        let turno = req.body.turno_EDIT;
        let avaria_interna = req.body.avaria_interna_EDIT;
        let rnc_operador = req.body.rnc_operador_EDIT;
        let ppm_atual = req.body.ppm_atual_EDIT;
        let ppm_acumulado = req.body.ppm_acumulado_EDIT;
        let observacoes = req.body.observacoes_EDIT;

        //Faz o UPDATE
        let query = "UPDATE `tb_sf_qualidade` SET " +
            "`data` = '" + data + "', " +
            "`turno` = '" + turno + "', " +
            "`avaria_interna` = '" + avaria_interna + "', " +
            "`rnc_operador` = '" + rnc_operador + "', " +
            "`ppm_atual` = '" + ppm_atual + "', " +
            "`ppm_acumulado` = '" + ppm_acumulado + "', " +
            "`observacoes` = '" + observacoes + "'" +
            " WHERE `tb_sf_qualidade`.`cod` = '" + cod + "'";

        //Executa o UPDATE
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/qualidade');
            } else {
                //UPDATE finalizado
                status_Crud = 'sim';
                res.redirect('/qualidade');
            }
        });
    },

    delFB03: (req, res) => {
        let cod = req.params.id;
        let query = 'DELETE FROM `tb_sf_qualidade` WHERE cod = "' + cod + '"';

        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 014: ', err);
                status_Crud = 'nao';
                res.redirect('/qualidade');
            }

            //DELETE realizado com sucesso
            status_Crud = 'sim';
            res.redirect('/qualidade');
        });
    },

    //Funções que passam o valor da variável para outro arquivo js
    getStatusCrud() {
        return status_Crud;
    },

};