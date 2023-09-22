//Importando arquivo site-model.js que possui a classe com as funções de consulta
const DB = require('../listas/selects');
const FUNCOES = require('../util/funcoes');
const mysql = require('mysql2');
const config = require('../../database/config');
const Excel = require('exceljs');
const conn = mysql.createPool(config);


//Variáveis a serem utilizadas
var status_Crud = '';

//Variável que recebe a página do conteúdo central a incluir na tela
var page = './includes/default/3-content';

module.exports = {
    pageRecebimento: (req, res) => {

        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {
            //Atribuindo o conteúdo central
            page = './includes/dashboard/inc_recebimento';
            //page = './includes/default/3-content_manutencao';

            //Consultas diversas para popular elementos
            //let recebimentos = await DBModel.getSFRecebimentos(req.query.data, req.query.semana, req.query.turno);
            let recebimentos = await DBModel.getFIARPaymentsRFC('ZFIAR_REPORT_PORTAL_OUTPUT',req.query.dataIni,req.query.dataFim,req.query.cliente,req.query.nfnum,req.query.status,req.query.branch);
            //Variáveis utilizadas para paginação
            var totalItens = recebimentos.length,//Qtde total de registros
                pageSize = 10,//Número máximo de registros por página
                pageCount = Math.ceil(totalItens / pageSize),//Número de páginas (Arredondar p/ cima)
                currentPage = 1,//Página corrente ao entrar na rota
                itens = [],//Array que receberá todos os registros
                itensArrays = [],//Array que receberá os registros limitados a qtde registros por páginas
                itensList = [];//Array que receberá os registros limitados a de páginas

            //Criando a lista de itens
            for (var i = 0; i < totalItens; i++) {
                itens.push(recebimentos[i]);
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
                DTRecebimento: itensList,
                DTRecebimentoxls:recebimentos,
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
                CadRecebimento: 'active',
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
        })();//async
    },

    addRecebimento: (req, res) => {
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

    editRecebimento: (req, res) => {
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

    delRecebimento: (req, res) => {
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
    
    generateExcel:(req,res) => {
    var results = [];

    (async function () {
        let DBModel = new DB(conn);
        results = await DBModel.getFIARPaymentsRFC('ZFIAR_REPORT_PORTAL_OUTPUT',req.query.dataIni,req.query.dataFim,req.query.cliente,req.query.nfnum,req.query.status,req.query.branch);
        
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Customers');
        
        //let results = await DBModel.getFIARPaymentsRFC('ZFIAR_REPORT_PORTAL_OUTPUT',req.query.dataIni,req.query.dataFim,req.query.cliente,req.query.nfnum,req.query.status,req.query.branch);
        //console.log(results);
        // Define columns in the worksheet, these columns are identified using a key.
        worksheet.columns = [
            { header: 'Nota Fiscal', key: 'nfnum', width: 20 },
            { header: 'Emissão', key: 'docdat', width: 10 },
            { header: 'Status', key: 'statuspag', width: 20 },
            { header: 'Dt.Pagto', key: 'augdt', width: 10 },
            { header: 'Doc.Pagto', key: 'augbl', width: 10 },
            { header: 'Doc.Faturamento', key: 'refkey', width: 15 },
            { header: 'Valor Bruto', key: 'nftot', width: 15 },
            { header: 'Valor Liquido', key: 'vlr_liquido', width: 15 },
            { header: 'Projeto', key: 'projk', width: 30 },
            { header: 'Descrição', key: 'post1', width: 200 },
            { header: 'Filial', key: 'werks', width: 15 },
            { header: 'Dt.Vencimento', key: 'zfbdt', width: 15 },
            { header: 'Cliente', key: 'parid', width: 15 },
            { header: 'Nome', key: 'name1', width: 50 },
            { header: 'Texto', key: 'sgtxt', width: 15 },
            { header: 'Valor Pago', key: 'vlr_pago', width: 15 },
            { header: 'Doc.Reclass', key: 'belnr_reclas', width: 15 },
            { header: 'Proj.Final', key: 'pep_reclas', width: 20 },
            { header: 'Nome', key: 'post1_reclas', width: 20 },
            { header: 'Vlr.Proj.Atual', key: 'vlr_proj_atual', width: 20 },
        ]                                                                                                        
                                                       

        // Add rows from database to worksheet 
        for (const row of results) {
            
            worksheet.addRow(row);
        }

        worksheet.autoFilter = 'A1:T1';

        worksheet.eachRow(function (row, rowNumber) {
            row.eachCell((cell, colNumber) => {
            if (rowNumber == 1) {
            // First set the background of header row
            cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'f5b914' }
            }
            }
            // Set border of each cell
            cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
            };
            })
            //Commit the changed row to the stream
            row.commit();
            });
    

        
        //worksheet.addRow({ docdat: 1, statusnf: 'John Doe', candat: new Date(1970, 1, 1) });
        //worksheet.addRow({ docdat: 2, statusnf: 'Jane Doe', candat: new Date(1965, 1, 7) });

        // Finally save the worksheet into the folder from where we are running the code. 
    // workbook.xlsx.writeFile('SimpleCust.xlsx');
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=Recebimentos.xlsx");
        
        workbook.xlsx.write(res);
        //status_Crud = 'sim';
        //res.redirect('/recebimento');
            //res.status(200).end();

            var fileName = "Task" + '_Template.xlsx';
            var tempFilePath = __dirname + "\\public\\dist\\" + fileName;
            workbook.xlsx.writeFile(tempFilePath).then(function () {
                res.send(fileName);
            });
       // });
    })();//async
    },
    
    //Funções que passam o valor da variável para outro arquivo js
    getStatusCrud() {
        return status_Crud;
    },

};