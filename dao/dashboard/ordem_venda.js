//Importando arquivo site-model.js que possui a classe com as funções de consulta
const DB = require('../listas/selects');
const FUNCOES = require('../util/funcoes');
const mysql = require('mysql2');
const config = require('../../database/config');
const conn = mysql.createPool(config);
var salesorder;

//Variáveis a serem utilizadas
var status_Crud = '';

//Variável que recebe a página do conteúdo central a incluir na tela
var page = './includes/default/3-content';

module.exports = {
    pageOV: (req, res) => {

        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {
            //Atribuindo o conteúdo central
            page = './includes/dashboard/inc_ordem_venda';
            //page = './includes/default/3-content_manutencao';

            //Consultas diversas para popular elementos
            //let embalagens = await DBModel.getSFEmbalagens(req.query.data, req.query.semana, req.query.turno);
            //var embalagens  = [];
            // embalagens = await DBModel.getSFOrdemDeVenda(req.query.data, req.query.semana, req.query.turno);
            let ordens = await DBModel.getSalesOrderRFC("ZRV_SALES_DOCUMENT_VIEW_3",req.query.dataini,req.query.datafim,req.query.cliente,req.query.ov);
            //console.log("Retorno embalagens",embalagens);
            let textos = await DBModel.getSalesOrderTextsRFC("ZRV_SALES_DOCUMENT_VIEW_3",req.query.dataini,req.query.datafim,req.query.cliente,req.query.ov);
           // RECUPERA AS CONDIÇÕES DE PAGAMENTO
            let condicoes = await DBModel.getSalesConditionsRFC("ZME_VALUES_T052");
            

            //Variáveis utilizadas para paginação
            var totalItens = ordens.length;//Qtde total de registros
            var totalTextos = textos.length;
            var totalCondicoes = condicoes.length;
            //console.log(totalItens.toString());
             var   pageSize = 10,//Número máximo de registros por página
                pageCount = Math.ceil(totalItens / pageSize),//Número de páginas (Arredondar p/ cima)
                //console.log("linhas",pageCount);
                currentPage = 1,//Página corrente ao entrar na rota
                itens = [],//Array que receberá todos os registros
                itensArrays = [],//Array que receberá os registros limitados a qtde registros por páginas
                textArrays = [],//Array cmo os textos das ovs
                condArrays = [],
                itensList = [];//Array que receberá os registros limitados a de páginas

            //Criando a lista de itens
            for (var i = 0; i < totalItens; i++) {
                itens.push(ordens[i]);
            }
            
            
            //Criando a lista de textos
            for (var i = 0; i < totalTextos; i++) {
                textArrays.push(textos[i]);
            }

              //Criando a lista de condicoes
              for (var i = 0; i < totalCondicoes; i++) {
                condArrays.push(condicoes[i]);
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
                DTOrdens: itensList,
                DTTextos:textArrays,
                DTCondicoes: condArrays,
                OVPage:'',
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
                CadEmbalagem: 'active',
                CadPreparacao: '',
                CadInventario: '',
                CadQualidade: '',
                CadInformativo: '',
                //Chat
                ChatOpen: '',
                Chat: '',
                Index:'',
                CadChat: ''
            });

            //Reinicia a variável
            status_Crud = '';
            //conn.releaseConnection(db);
        })();//async
    },

    addOV: (req, res) => {
        let cod = req.body.cod_ADD;
        let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_ADD);
        let semana = FUNCOES.formatDateTimeToWeek(req.body.data_INPUT_ADD);
        let turno = req.body.turno_ADD;
        let setup_pe = req.body.setup_PE_INPUT_ADD;
        let setup_cilindro = req.body.setup_Cilindro_INPUT_ADD;
        let setup_outros = req.body.setup_Outros_INPUT_ADD;
        let takt_pe = FUNCOES.formatDecimalToBD(req.body.takt_PE_ADD);
        let takt_cilindro = FUNCOES.formatDecimalToBD(req.body.takt_Cilindro_ADD);
        let takt_outros = FUNCOES.formatDecimalToBD(req.body.takt_Outros_ADD);
        let bo_objetivo_pe = FUNCOES.formatDecimalToBD(req.body.bo_objetivo_pe_ADD);
        let bo_entrega_pe = FUNCOES.formatDecimalToBD(req.body.bo_entrega_pe_ADD);
        let bo_objetivo_cilindro = FUNCOES.formatDecimalToBD(req.body.bo_objetivo_cilindro_ADD);
        let bo_entrega_cilindro = FUNCOES.formatDecimalToBD(req.body.bo_entrega_cilindro_ADD);
        let bo_objetivo_outros = FUNCOES.formatDecimalToBD(req.body.bo_objetivo_outros_ADD);
        let bo_entrega_outros = FUNCOES.formatDecimalToBD(req.body.bo_entrega_outros_ADD);

        //Faz o INSERT somente nos campos da RNC parte cliente
        let query = "INSERT INTO `tb_sf_embalagem` " +
            "(data, semana, turno, setup_pe, setup_cilindro, setup_outros, takt_pe, takt_cilindro, takt_outros, bo_objetivo_pe, bo_entrega_pe, bo_objetivo_cilindro, bo_entrega_cilindro, bo_objetivo_outros, bo_entrega_outros) VALUES ('" +
            data + "', '" +
            semana + "', '" +
            turno + "', '" +
            setup_pe + "', '" +
            setup_cilindro + "', '" +
            setup_outros + "', '" +
            takt_pe + "', '" +
            takt_cilindro + "', '" +
            takt_outros + "', '" +
            bo_objetivo_pe + "', '" +
            bo_entrega_pe + "', '" +
            bo_objetivo_cilindro + "', '" +
            bo_entrega_cilindro + "', '" +
            bo_objetivo_outros + "', '" +
            bo_entrega_outros + "')";

        //Executa o INSERT
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/embalagem');
            } else {
                //INSERT realizado com sucesso
                status_Crud = 'sim';
                res.redirect('/embalagem');
            }
        });
    },
    editOV: (req, res) => {
        let ov = req.body.cod_EDIT1;
        let query;
        //console.log("IVES",ov);
        let vencimento = FUNCOES.formatDateTimeToBD(req.body.venc_EDIT);
        let dadosBanco = req.body.txtBank_EDIT;
        let dadosImposto = req.body.taxText_EDIT;
        let descServico = req.body.txtServiceEDIT;
        let zterm = req.body.condition_EDIT;
        /* let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_EDIT);
        let semana = FUNCOES.formatDateTimeToWeek(req.body.data_INPUT_EDIT);        
        let bo_objetivo_outros = FUNCOES.formatDecimalToBD(req.body.bo_objetivo_outros_EDIT);
        let bo_entrega_outros = FUNCOES.formatDecimalToBD(req.body.bo_entrega_outros_EDIT); */

        //Chama a BAPI para faturar
        let DBModel = new DB(conn);            

        //(async function () {
        
            //let ovBD = await DBModel.getSalesOrderById(ov);
           // console.log(ovBD);
            //if(ovBD)
           // {
           //   query = "UPDATE `tb_sf_ordem_venda` SET " +
           // "`valdt` = '" + vencimento + "', " +
           // "`dados_bancarios` = '" + dadosBanco + "', " +
           // "`dados_impostos` = '" + dadosImposto + "', " +
           // "`desc_servico` = '" + descServico + "' " +
            
            //" WHERE `tb_sf_ordem_venda`.`vbeln` = '" + ov + "'"; 
         
            //}
            //else
           // {
        
                //docFaturamento = await DBModel.faturaOVRFC("BAPI_BILLINGDOC_CREATEMULTIPLE",ov);
                // console.log("RETORNO",docFaturamento);
                    //Faz o INSERT somente nos campos da RNC parte cliente
                query = "INSERT INTO `tb_sf_ordem_venda` " +
                "(vbeln, valdt, dados_bancarios, dados_impostos, desc_servico, desc_condicao) VALUES ('" +
                ov + "', '" +
                vencimento + "', '" +
                dadosBanco + "', '" +
                dadosImposto + "', '" +
                descServico + "', '" +                
                zterm + "')";
            //}
            //Executa o INSERT ou update
            db.query(query, (err, results, fields) => {
                if (err) {
                    console.log('Erro 003: ', err);
                    status_Crud = 'nao';
                    //res.redirect('/ordem_venda');
                } else {
                    //INSERT realizado com sucesso
                    status_Crud = 'sim';
                    //res.redirect('/ordem_venda');
                }
            });
         
        //Executa o UPDATE NO SAP R3
            (async function () {
            var ano = vencimento.substring(0,4);
            var dia = vencimento.substring(8,10);
            var mes = vencimento.substring(5,7);
            vencimento = ano + mes + dia;
                    
            let retorno = await DBModel.editaOVRFC('ZSAVE_TEXTS_OV_EDIT_PORTAL',ov,dadosBanco,dadosImposto,descServico,vencimento,zterm);
            res.redirect('/ordem_venda');

})();//async
    
},    

    faturaOV: (req, res) => {
        let ov = req.body.cod_EDIT;
        console.log("IVES",ov);
        var docFaturamento = [] ;
        /* let data = FUNCOES.formatDateTimeToBD(req.body.data_INPUT_EDIT);
        let semana = FUNCOES.formatDateTimeToWeek(req.body.data_INPUT_EDIT);
        let turno = req.body.turno_EDIT;
        let setup_pe = req.body.setup_PE_INPUT_EDIT;
        let setup_cilindro = req.body.setup_Cilindro_INPUT_EDIT;
        let setup_outros = req.body.setup_Outros_INPUT_EDIT;
        let takt_pe = FUNCOES.formatDecimalToBD(req.body.takt_PE_EDIT);
        let takt_cilindro = FUNCOES.formatDecimalToBD(req.body.takt_Cilindro_EDIT);
        let takt_outros = FUNCOES.formatDecimalToBD(req.body.takt_Outros_EDIT);
        let bo_objetivo_pe = FUNCOES.formatDecimalToBD(req.body.bo_objetivo_pe_EDIT);
        let bo_entrega_pe = FUNCOES.formatDecimalToBD(req.body.bo_entrega_pe_EDIT);
        let bo_objetivo_cilindro = FUNCOES.formatDecimalToBD(req.body.bo_objetivo_cilindro_EDIT);
        let bo_entrega_cilindro = FUNCOES.formatDecimalToBD(req.body.bo_entrega_cilindro_EDIT);
        let bo_objetivo_outros = FUNCOES.formatDecimalToBD(req.body.bo_objetivo_outros_EDIT);
        let bo_entrega_outros = FUNCOES.formatDecimalToBD(req.body.bo_entrega_outros_EDIT); */

        //Chama a BAPI para faturar
        let DBModel = new DB(conn);

        (async function () {
        
           docFaturamento = await DBModel.faturaOVRFC("BAPI_BILLINGDOC_CREATEMULTIPLE",ov);
          // console.log("RETORNO",docFaturamento);                                     
     
    
    
    if ( docFaturamento[0].type.toString() == 'E' ){
        
        console.log('Erro 014: ',  docFaturamento[0]["message"].toString());
        status_Crud = 'nao';
        res.redirect('/ordem_venda');
    }
    else{

        //DELETE realizado com sucesso
        status_Crud = 'sim';
        res.redirect('/ordem_venda');
    }
})();//async
    
},    
    delOV: (req, res) => {
        //let cod = req.params.id;
        //let query = 'DELETE FROM `tb_sf_ordem_venda` WHERE cod = "' + cod + '"';

        //db.query(query, (err, results, fields) => {
            //if (err) {
            //    console.log('Erro 014: ', err);
            //    status_Crud = 'nao';
            //    res.redirect('/ordem_venda');
            //}

            //DELETE realizado com sucesso
            status_Crud = 'sim';
            res.redirect('/ordem_venda');
       // }
       // );
    },

    //Funções que passam o valor da variável para outro arquivo js
    getStatusCrud() {
        return status_Crud;
    },

};