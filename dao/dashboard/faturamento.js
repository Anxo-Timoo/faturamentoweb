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
    pageFaturamento: (req, res) => {

        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {
            //Atribuindo o conteúdo central
            page = './includes/dashboard/inc_faturamento';
            //page = './includes/default/3-content_manutencao';

            //Consultas diversas para popular elementos
            
            let faturamentos = await DBModel.getFIARBillingsRFC('ZFIAR_REP_BILLING_OUTPUT',req.query.dataIni,req.query.dataFim,req.query.cliente,req.query.nfnum);
            
            //Variáveis utilizadas para paginação
            var totalItens = faturamentos.length,//Qtde total de registros
                pageSize = 10,//Número máximo de registros por página
                pageCount = Math.ceil(totalItens / pageSize),//Número de páginas (Arredondar p/ cima)
                currentPage = 1,//Página corrente ao entrar na rota
                itens = [],//Array que receberá todos os registros
                itensArrays = [],//Array que receberá os registros limitados a qtde registros por páginas
                itensList = [];//Array que receberá os registros limitados a de páginas

            //Criando a lista de itens
            for (var i = 0; i < totalItens; i++) {
                itens.push(faturamentos[i]);
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
                DTFaturamento: itensList,
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
                CadFaturamento:'active',
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

    addFaturamento: (req, res) => {
        let cod = req.body.cod_ADD;
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_ADD);
        let dia_semana = FUNCOES.formatDateTimeToDay(req.body.data_INPUT_ADD);
        let semana = FUNCOES.formatDateTimeToWeek(req.body.data_INPUT_ADD);
        let turno = req.body.turno_ADD;
        let palete_pendente = req.body.palete_pendente_ADD;
        let tempo_conferencia = req.body.tempo_conferencia_INPUT_ADD;
        let tempo_inspecao = req.body.tempo_inspecao_INPUT_ADD;
        let veiculos_previstos = req.body.veiculos_previstos_ADD;
        let volumes_previstos = req.body.volumes_previstos_ADD;

        //Faz o INSERT somente nos campos da RNC parte cliente
        let query = "INSERT INTO `tb_sf_recebimento` " +
            "(data, dia_semana, semana, turno, palete_pendente, tempo_conferencia, tempo_inspecao, veiculos_previstos, volumes_previstos) VALUES ('" +
            data + "', '" +
            dia_semana + "', '" +
            semana + "', '" +
            turno + "', '" +
            palete_pendente + "', '" +
            tempo_conferencia + "', '" +
            tempo_inspecao + "', '" +
            veiculos_previstos + "', '" +
            volumes_previstos + "')";

        //Executa o INSERT
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/recebimento');
            } else {
                //INSERT realizado com sucesso
                status_Crud = 'sim';
                res.redirect('/recebimento');
            }
        });
    },

    editFaturamento: (req, res) => {
        let cod = req.body.cod_EDIT;
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_EDIT);
        let dia_semana = FUNCOES.formatDateTimeToDay(req.body.data_INPUT_EDIT);
        let semana = FUNCOES.formatDateTimeToWeek(req.body.data_INPUT_EDIT);
        let turno = req.body.turno_EDIT;
        let palete_pendente = req.body.palete_pendente_EDIT;
        let tempo_conferencia = req.body.tempo_conferencia_INPUT_EDIT;
        let tempo_inspecao = req.body.tempo_inspecao_INPUT_EDIT;
        let veiculos_previstos = req.body.veiculos_previstos_EDIT;
        let volumes_previstos = req.body.volumes_previstos_EDIT;

        //Faz o UPDATE
        let query = "UPDATE `tb_sf_recebimento` SET " +
            "`data` = '" + data + "', " +
            "`dia_semana` = '" + dia_semana + "', " +
            "`semana` = '" + semana + "', " +
            "`turno` = '" + turno + "', " +
            "`palete_pendente` = '" + palete_pendente + "', " +
            "`tempo_conferencia` = '" + tempo_conferencia + "', " +
            "`tempo_inspecao` = '" + tempo_inspecao + "', " +
            "`veiculos_previstos` = '" + veiculos_previstos + "', " +
            "`volumes_previstos` = '" + volumes_previstos + "'" +
            " WHERE `tb_sf_recebimento`.`cod` = '" + cod + "'";

        //Executa o UPDATE
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/recebimento');
            } else {
                //UPDATE finalizado
                status_Crud = 'sim';
                res.redirect('/recebimento');
            }
        });
    },

    delFaturamento: (req, res) => {
        let cod = req.params.id;
        let query = 'DELETE FROM `tb_sf_recebimento` WHERE cod = "' + cod + '"';

        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 014: ', err);
                status_Crud = 'nao';
                res.redirect('/recebimento');
            }

            //DELETE realizado com sucesso
            status_Crud = 'sim';
            res.redirect('/recebimento');
        });
    },
    
    getFB03: (req, res) => {
        let cod = req.params.id
        
    
    },

    //Funções que passam o valor da variável para outro arquivo js
    getStatusCrud() {
        return status_Crud;
    },
    
};