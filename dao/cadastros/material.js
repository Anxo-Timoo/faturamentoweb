//NPM Install
const fse = require('fs-extra');

//Importando arquivo site-model.js que possui a classe com as funções de consulta
const DB = require('./../listas/selects');
const FUNCOES = require('./../util/funcoes');
const mysql = require('mysql2');
const config = require('./../../database/config');
const conn = mysql.createPool(config);

//Variáveis a serem utilizadas
var status_Crud = '';

//Variável que recebe a página do conteúdo central a incluir na tela
var page = './includes/default/3-content';

module.exports = {
    pageMaterial: (req, res) => {

        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {
            //Atribui o conteúdo central
            page = './includes/cadastros/inc_material';
            //page = './includes/default/3-content_manutencao';

            //Consultas diversas para popular elementos
            let materiais = await DBModel.getFilterMateriais(req.query.pn, req.query.descricao, req.query.familia, req.query.grupo);
            let familias = await DBModel.getFamiliaMaterial();
            let grupos = await DBModel.getGrupoMaterial();

            //var lt_materials = await DBModel.getSalesMaterialRFC('ZBAPI_MATERIAL_GETLIST');
            //materiais = lt_materials;

            //Variáveis utilizadas para paginação
            var totalItens = materiais.length,//Qtde total de registros
                pageSize = 10,//Número máximo de registros por página
                pageCount = Math.ceil(totalItens / pageSize),//Número de páginas (Arredondar p/ cima)
                currentPage = 1,//Página corrente ao entrar na rota
                itens = [],//Array que receberá todos os registros
                itensArrays = [],//Array que receberá os registros limitados a qtde registros por páginas
                itensList = [];//Array que receberá os registros limitados a de páginas

            //Criando a lista de itens
            for (var i = 0; i < totalItens; i++) {
                itens.push(materiais[i]);
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

            //Passa o conteúdo das variáveis para a página
            res.render('./pageAdmin', {
                DTMaterial: itensList,
                pageSize: pageSize,
                totalItens: totalItens,
                pageCount: pageCount,
                currentPage: currentPage,
                body: req.query,
                DTFamilia: familias,
                DTGrupo: grupos,
                status_Crud,
                cod_login_pcp: req.session.cod_login_pcp,
                nome_login_pcp: req.session.nome_login_pcp,
                foto_login_pcp: req.session.foto_login_pcp,
                usuario_login_pcp: req.session.usuario_login_pcp,
                perfil_login_pcp: req.session.perfil_login_pcp,
                page,
                //Cadastros
                Cadastro: 'active',
                CadastroOpen: 'menu-open',
                CadUsuario: '',                
                CadMaterial: 'active',
                //Transporte
                TransporteOpen: '',
                Transporte: '',
                CadAgenda: '',
                //Dashboard
                ShopFloorOpen: '',
                ShopFloor: '',
                CadShopfloor: '',
                CadInformacoes_Gerais: '',
                CadOcorrencia_sf: '',
                CadFaturamento:'',
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

        })();
    },

    addMaterial: (req, res) => {

        //Verifica se selecionou uma imagem
        if (!req.files) {
            //Se não selecionou, executa INSERT com imagem genérica
            let material = req.body.material_ADD.trim();
            let descricao = req.body.descricao_ADD.trim();
            let multiplo = req.body.multiplo_ADD;
            let valor = FUNCOES.formatDecimalToBD(req.body.valor_ADD);
            let familia = req.body.familia_ADD;
            let grupo = req.body.grupo_ADD;
            let observacao = req.body.observacao_ADD;

            //Definindo nome da imagem conforme arquivo selecionado
            //let uploadedFile = req.files.image_ADD;
            //let fileExtension = uploadedFile.mimetype.split('/')[1];
            //let image_name = uploadedFile.name.replace(/ /g, "_") + '.' + fileExtension;
            let image_name = material + '.png';

            //Verifica se o registro adicionado já existe
            let query = "SELECT * FROM `tb_cadastro_material` WHERE material = '" + material + "'";

            db.query(query, (err, results, fields) => {
                if (results.length > 0) {
                    //Já existe!
                    console.log('Erro 002: ', err);
                    status_Crud = 'registroExiste';
                    res.redirect('/material');
                } else {
                    //Faz o INSERT com imagem genérica
                    let query = "INSERT INTO `tb_cadastro_material` " +
                        "(material, descricao, multiplo, valor, familia, grupo, observacao, foto) VALUES ('" +
                        material + "', '" +
                        descricao + "', '" +
                        multiplo + "', '" +
                        valor + "', '" +
                        familia + "', '" +
                        grupo + "', '" +
                        observacao + "', '" +
                        image_name + "')";

                    //Executa o INSERT
                    db.query(query, (err, results, fields) => {
                        if (err) {
                            console.log('Erro 003: ', err);
                            status_Crud = 'nao';
                            res.redirect('/material');
                        } else {
                            //INSERT realizado com sucesso                            
                            try {
                                //Copia uma imagem genérica que está na pasta public para a pasta
                                fse.copyFile('public/dist/img/generic/material-no-image.png', 'public/dist/img/materiais/' + image_name);
                            } catch (err) {
                                console.log('Erro 004: ', err);
                                status_Crud = 'imgErroCopia';
                                res.redirect('/material');
                            }
                            //INSERT finalizado
                            status_Crud = 'sim';
                            res.redirect('/material');
                        }
                    });
                }
            });

        } else { //Selecionou uma imagem
            //Executa INSERT com a imagem selecionada
            let material = req.body.material_ADD.trim();
            let descricao = req.body.descricao_ADD.trim();
            let multiplo = req.body.multiplo_ADD;
            let valor = FUNCOES.formatDecimalToBD(req.body.valor_ADD);
            let familia = req.body.familia_ADD;
            let grupo = req.body.grupo_ADD;
            let observacao = req.body.observacao_ADD;

            //Definindo nome da imagem conforme arquivo selecionado
            let uploadedFile = req.files.image_ADD;
            let fileExtension = uploadedFile.mimetype.split('/')[1];
            let image_name = material + '_' + uploadedFile.name.replace(/ /g, "_") + '.' + fileExtension;

            //Verifica se o registro adicionado já existe
            let query = "SELECT * FROM `tb_cadastro_material` WHERE material = '" + material + "'";
            db.query(query, (err, results, fields) => {
                if (results.length > 0) {
                    //Já existe!
                    console.log('Erro 005: ', err);
                    status_Crud = 'registroExiste';
                    res.redirect('/material');
                } else {
                    //Valida se a extenção da imagem selecionada é válida
                    if (uploadedFile.mimetype === 'image/png' ||
                        uploadedFile.mimetype === 'image/jpeg' ||
                        uploadedFile.mimetype === 'image/jpg' ||
                        uploadedFile.mimetype === 'image/gif') {

                        //Se válido, faz o upload da imagem para a pasta
                        uploadedFile.mv(`public/dist/img/materiais/${image_name}`, (err) => {
                            if (err) {
                                //Erro ao fazer upload
                                console.log('Erro 006: ', err);
                                status_Crud = 'nao';
                                res.redirect('/material');
                            } else {
                                //Faz o INSERT com foto selecionada
                                let query = "INSERT INTO `tb_cadastro_material` " +
                                    "(material, descricao, multiplo, valor, familia, grupo, observacao, foto) VALUES ('" +
                                    material + "', '" +
                                    descricao + "', '" +
                                    multiplo + "', '" +
                                    valor + "', '" +
                                    familia + "', '" +
                                    grupo + "', '" +
                                    observacao + "', '" +
                                    image_name + "')";

                                //Executa o INSERT
                                db.query(query, (err, results, fields) => {
                                    if (err) {
                                        console.log('Erro 007: ', err);
                                        status_Crud = 'nao';
                                        res.redirect('/material');
                                    }

                                    //INSERT realizado com sucesso
                                    status_Crud = 'sim';
                                    res.redirect('/material');
                                });
                            }
                        });

                    } else { //Imagem inválida (extenção)                        
                        console.log('Erro 008: ', err);
                        status_Crud = 'imgErroExtensao';
                        res.redirect('/material');
                    }
                }
            });
        }
    },

    editMaterial: (req, res) => {

        //Verifica se selecionou uma imagem
        if (!req.files) {
            //Se não selecionou, executa UPDATE sem imagem, ou seja mantendo a imagem atual
            let cod = req.body.cod_EDIT;
            let material = req.body.material_EDIT.trim();
            let descricao = req.body.descricao_EDIT.trim();
            let multiplo = req.body.multiplo_EDIT;
            let valor = FUNCOES.formatDecimalToBD(req.body.valor_EDIT);
            let familia = req.body.familia_EDIT;
            let grupo = req.body.grupo_EDIT;
            let observacao = req.body.observacao_EDIT;

            //Faz o UPDATE mantendo a imagem
            let query = "UPDATE `tb_cadastro_material` SET " +
                "`material` = '" + material + "', " +
                "`descricao` = '" + descricao + "', " +
                "`multiplo` = '" + multiplo + "', " +
                "`valor` = '" + valor + "', " +
                "`familia` = '" + familia + "', " +
                "`grupo` = '" + grupo + "', " +
                "`observacao` = '" + observacao + "'" +
                " WHERE `tb_cadastro_material`.`cod` = '" + cod + "'";

            //Executa o UPDATE
            db.query(query, (err, results, fields) => {
                if (err) {
                    console.log('Erro 009: ', err);
                    status_Crud = 'nao';
                    res.redirect('/material');
                } else {
                    //UPDATE realizado com sucesso
                    status_Crud = 'sim';
                    res.redirect('/material');
                }
            });

        } else { //Selecionou uma imagem
            //Executa UPDATE com a imagem selecionada
            let cod = req.body.cod_EDIT;
            let material = req.body.material_EDIT.trim();
            let descricao = req.body.descricao_EDIT.trim();
            let multiplo = req.body.multiplo_EDIT;
            let valor = FUNCOES.formatDecimalToBD(req.body.valor_EDIT);
            let familia = req.body.familia_EDIT;
            let grupo = req.body.grupo_EDIT;
            let observacao = req.body.observacao_EDIT;

            //Definindo nome da imagem conforme arquivo selecionado
            let uploadedFile = req.files.image_EDIT;
            let fileExtension = uploadedFile.mimetype.split('/')[1];
            let image_name = material + '_' + uploadedFile.name.replace(/ /g, "_") + '.' + fileExtension;

            //Deleta a imagem antiga
            let getImageQuery = 'SELECT foto FROM `tb_cadastro_material` WHERE cod = "' + cod + '"';
            db.query(getImageQuery, (err, results, fields) => {
                let image = results[0].foto;

                //Exclui a imagem do disco
                fse.unlink(`public/dist/img/materiais/${image}`, (err) => {

                    //Valida se a extenção da imagem selecionada é válida
                    if (uploadedFile.mimetype === 'image/png' ||
                        uploadedFile.mimetype === 'image/jpeg' ||
                        uploadedFile.mimetype === 'image/jpg' ||
                        uploadedFile.mimetype === 'image/gif') {

                        //Se válido, faz o upload da imagem para a pasta
                        uploadedFile.mv(`public/dist/img/materiais/${image_name}`, (err) => {
                            if (err) {
                                console.log('Erro 010: ', err);
                                status_Crud = 'imgErroCopia';
                                res.redirect('/material');
                            } else {

                                //Faz o UPDATE com a imagem selecionada
                                let query = "UPDATE `tb_cadastro_material` SET " +
                                    "`material` = '" + material + "', " +
                                    "`descricao` = '" + descricao + "', " +
                                    "`multiplo` = '" + multiplo + "', " +
                                    "`valor` = '" + valor + "', " +
                                    "`familia` = '" + familia + "', " +
                                    "`grupo` = '" + grupo + "', " +
                                    "`observacao` = '" + observacao + "', " +
                                    "`foto` = '" + image_name + "'" +
                                    " WHERE `tb_cadastro_material`.`cod` = '" + cod + "'";

                                //Executa o UPDATE
                                db.query(query, (err, results, fields) => {
                                    if (err) {
                                        console.log('Erro 011: ', err);
                                        status_Crud = 'nao';
                                        res.redirect('/material');
                                    }

                                    //UPDATE realizado com sucesso
                                    status_Crud = 'sim';
                                    res.redirect('/material');
                                });
                            }
                        });

                    } else { //Imagem inválida (extenção)                
                        console.log('Erro 012: ', err);
                        status_Crud = 'imgErroExtensao';
                        res.redirect('/material');
                    }
                });
            });
        }
    },

    delMaterial: (req, res) => {
        let cod = req.params.id;
        let getImageQuery = 'SELECT foto FROM `tb_cadastro_material` WHERE cod = "' + cod + '"';
        let query = 'DELETE FROM `tb_cadastro_material` WHERE cod = "' + cod + '"';

        //Verifica se a imagem existe
        db.query(getImageQuery, (err, results, fields) => {
            if (err) {
                console.log('Erro 013: ', err);

                //Executa do DELETE
                db.query(query, (err, results, fields) => {
                    if (err) {
                        console.log('Erro 014: ', err);
                        status_Crud = 'nao';
                        res.redirect('/material');
                    }

                    //DELETE realizado com sucesso
                    status_Crud = 'sim';
                    res.redirect('/material');
                });
            } else { //Existe imagem a deletar
                let image = results[0].foto;

                //Exclui a imagem do disco
                fse.unlink(`public/dist/img/materiais/${image}`, (err) => {

                    //Executa do DELETE
                    db.query(query, (err, results, fields) => {
                        if (err) {
                            console.log('Erro 014: ', err);
                            status_Crud = 'nao';
                            res.redirect('/material');
                        }

                        //DELETE realizado com sucesso
                        status_Crud = 'sim';
                        res.redirect('/material');
                    });
                });
            }
        });
    },

    /**
     * Funções que passam o valor da variável para outro arquivo js */
    getStatusCrud() {
        return status_Crud;
    },

};