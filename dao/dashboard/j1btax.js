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
    pageJ1btax: (req, res) => {

        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {
            //Atribuindo o conteúdo central
            page = './includes/dashboard/inc_j1btax';
            //page = './includes/default/3-content_manutencao';

            //Consultas diversas para popular elementos
            let clientes = await DBModel.getJ1BTAXBrasilRFC('ZFIAR_CL_X_MAT_EX_PORTAL',req.query.cliente, req.query.material);            
            var resultset = 0;
            if (clientes.length > 0)
            {
                resultset = 1;
            }
            
            //Variáveis utilizadas para paginação
            var totalItens = clientes.length,//Qtde total de registros
                pageSize = 10,//Número máximo de registros por página
                pageCount = Math.ceil(totalItens / pageSize),//Número de páginas (Arredondar p/ cima)
                currentPage = 1,//Página corrente ao entrar na rota
                itens = [],//Array que receberá todos os registros
                itensArrays = [],//Array que receberá os registros limitados a qtde registros por páginas
                itensList = [];//Array que receberá os registros limitados a de páginas

            //Criando a lista de itens
            for (var i = 0; i < totalItens; i++) {
                itens.push(clientes[i]);
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
                DTClientes: itensList,
                pageSize: pageSize,
                totalItens: totalItens,
                pageCount: pageCount,
                currentPage: currentPage,
                body: req.query,
                resultset:resultset,
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

    generateExcelJ1btax:(req,res) => {
        var results = [];
    
        (async function () {
            let DBModel = new DB(conn);
            results = await DBModel.getJ1BTAXBrasilRFC('ZFIAR_CL_X_MAT_EX_PORTAL',req.query.cliente, req.query.material);
            
            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('Customers');
            
            //let results = await DBModel.getFIARPaymentsRFC('ZFIAR_REPORT_PORTAL_OUTPUT',req.query.dataIni,req.query.dataFim,req.query.cliente,req.query.nfnum,req.query.status,req.query.branch);
            //console.log(results);
            // Define columns in the worksheet, these columns are identified using a key.
            worksheet.columns = [
                { header: 'Cliente', key: 'parid', width: 20 },
                { header: 'Nome', key: 'name1', width: 50 },                
                { header: 'Material', key: 'material', width: 20 },
                { header: 'Texto', key: 'maktx', width: 50 },                                               
                { header: 'PIS', key: 'ratepis', width: 15 },
                { header: 'COFINS', key: 'ratecofins', width: 15 },
                { header: 'CSLL', key: 'ratecsll', width: 15 },
                { header: 'IRRF', key: 'rateirrf', width: 15 },
                { header: 'ISS', key: 'rateiss', width: 15 },
                { header: 'Filial', key: 'werks', width: 10 },
                { header: 'Dom.Fiscal', key: 'txjcd', width: 30 },               
                
            ]                                                                                                                                                                                                   
                                                                                                                                                                                                                                                 
            // Add rows from database to worksheet 
            for (const row of results) {
                
                worksheet.addRow(row);
            }
    
            worksheet.autoFilter = 'A1:Q1';
    
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
                    
    
            // Finally save the worksheet into the folder from where we are running the code. 
        // workbook.xlsx.writeFile('SimpleCust.xlsx');
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=Impostos_Cliente.xlsx");
            
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