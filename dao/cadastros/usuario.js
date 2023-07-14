//NPM Install
const fse = require('fs-extra');

//Importando arquivo site-model.js que possui a classe com as funções de consulta
const DB = require('./../listas/selects');
const mysql = require('mysql2');
const config = require('./../../database/config');
const conn = mysql.createPool(config);

//Importando o móduto routes/login.js 
const jsLogin = require('./../login');

//Variáveis a serem utilizadas
var status_Crud = '';

//Variável que recebe a página do conteúdo central a incluir na tela
var page = './includes/default/3-content';

var BlockingMiddleware = function(req, res, next) {
    //checa se o usuario e administrador
    username = req.session.usuario_login_pcp;
    console.log("USUARIOOOOOOO",username);
       
    if(username)
    {
        perfil = req.session.perfil_login_pcp;
        //console.log("PERFIL",perfil);

        if (perfil != 'Administradora' && ['/'].indexOf(req.url) == 'usuario' )
        perfil = ['/'].indexOf(req.url);
        console.log("PERFIL",perfil);
        return res.send(404); // 'fORBIDDEN'
        next();

    }         
   
};

module.exports = {
    pageUsuario: (req, res, BlockingMiddleware) => {
    
        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {
            //Atribuindo o conteúdo central
            page = './includes/cadastros/inc_usuario';
            //page = './includes/default/3-content_manutencao';

            //Consultas diversas para popular elementos
            let usuarios = await DBModel.getFilterUsuarios(req.query.nome, req.query.usuario, req.query.perfil, req.query.status);
            let perfis = await DBModel.getPerfilUsuario();

            //Variáveis utilizadas para paginação
            var totalItens = usuarios.length,//Qtde total de registros
                pageSize = 10,//Número máximo de registros por página
                pageCount = Math.ceil(totalItens / pageSize),//Número de páginas (Arredondar p/ cima)
                currentPage = 1,//Página corrente ao entrar na rota
                itens = [],//Array que receberá todos os registros
                itensArrays = [],//Array que receberá os registros limitados a qtde registros por páginas
                itensList = [];//Array que receberá os registros limitados a de páginas

            //Criando a lista de itens
            for (var i = 0; i < totalItens; i++) {
                itens.push(usuarios[i]);
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
                DTUsuario: itensList,
                pageSize: pageSize,
                totalItens: totalItens,
                pageCount: pageCount,
                currentPage: currentPage,
                body: req.query,
                DTPerfis: perfis,
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
                CadUsuario: 'active',
                
                CadMaterial: '',
                //Recebimento
                RecebimentoOpen: '',
                Recebimento: '',
                CadOcorrencia: '',
                CadDevolucao: '',
                //Qualidade
                QualidadeOpen: '',
                Qualidade: '',
                CadRnc: '',
                //Transporte
                TransporteOpen: '',
                Transporte: '',
                CadAgenda: '',
                //Inventario
                InventarioOpen: '',
                Inventario: '',
                CadRdi: '',
                //Dashboard
                ShopFloorOpen: '',
                ShopFloor: '',
                CadShopfloor: '',
                CadShopfloor: '',
                CadInformacoes_Gerais: '',
                CadOcorrencia_sf: '',
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

    addUsuario: (req, res) => {

        //Verifica se selecionou uma imagem
        if (!req.files) {
            //Se não selecionou, executa INSERT com imagem genérica
            let nome = req.body.nome_ADD.trim();
            let email = req.body.email_ADD.trim();
            let usuario = req.body.usuario_ADD.trim();
            let senha = req.body.senha_ADD.trim();
            let perfil = req.body.perfil_ADD;

            //Lista
            let status = '';
            if (req.body.status_ADD == 'on') {
                status = '1';
            } else {
                status = '0';
            };

            //Definindo nome da imagem conforme arquivo selecionado
            //let uploadedFile = req.files.image_ADD;
            //let fileExtension = uploadedFile.mimetype.split('/')[1];
            //let image_name = uploadedFile.name.replace(/ /g, "_") + '.' + fileExtension;
            let image_name = usuario + '.png';

            //Verifica se o registro adicionado já existe
            let query = "SELECT * FROM `tb_usuario` WHERE usuario = '" + usuario + "'";
            db.query(query, (err, results, fields) => {
                if (results.length > 0) {
                    //Já existe!
                    console.log('Erro 002: ', err);
                    status_Crud = 'registroExiste';
                    res.redirect('/usuario');
                } else {
                    //Faz o INSERT com imagem genérica
                    let query = "INSERT INTO `tb_usuario` " +
                        "(nome, email, usuario, senha, perfil, status, foto) VALUES ('" +
                        nome + "', '" +
                        email + "', '" +
                        usuario + "', '" +
                        senha + "', '" +
                        perfil + "', '" +
                        status + "', '" +
                        image_name + "')";

                    //Executa o INSERT
                    db.query(query, (err, results, fields) => {
                        if (err) {
                            console.log('Erro 003: ', err);
                            status_Crud = 'nao';
                            res.redirect('/usuario');
                        } else {
                            try {
                                //INSERT realizado com sucesso, agora faça uma cópia da imagem genérica para a pasta
                                fse.copyFile('public/dist/img/generic/usuario-no-image.png', 'public/dist/img/usuarios/' + image_name);
                            } catch (err) {
                                console.log('Erro 004: ', err);
                                status_Crud = 'imgErroCopia';
                                res.redirect('/usuario');
                            }
                            //INSERT finalizado
                            status_Crud = 'sim';
                            res.redirect('/usuario');
                        }
                    });
                }
            });

        } else { //Selecionou uma imagem
            //Executa INSERT com a imagem selecionada
            let nome = req.body.nome_ADD.trim();
            let email = req.body.email_ADD.trim();
            let usuario = req.body.usuario_ADD.trim();
            let senha = req.body.senha_ADD.trim();
            let perfil = req.body.perfil_ADD;

            let status = '';
            if (req.body.status_ADD == 'on') {
                status = '1';
            } else {
                status = '0';
            };

            //Definindo nome da imagem conforme arquivo selecionado
            let uploadedFile = req.files.image_ADD;
            let fileExtension = uploadedFile.mimetype.split('/')[1];
            let image_name = usuario + '_' + uploadedFile.name.replace(/ /g, "_") + '.' + fileExtension;

            //Verifica se o registro adicionado já existe
            let query = "SELECT * FROM `tb_usuario` WHERE usuario = '" + usuario + "'";
            db.query(query, (err, results, fields) => {
                if (results.length > 0) {
                    //Já existe!
                    console.log('Erro 005: ', err);
                    status_Crud = 'registroExiste';
                    res.redirect('/usuario');
                } else {
                    //Valida se a extenção da imagem selecionada é válida
                    if (uploadedFile.mimetype === 'image/png' ||
                        uploadedFile.mimetype === 'image/jpeg' ||
                        uploadedFile.mimetype === 'image/jpg' ||
                        uploadedFile.mimetype === 'image/gif') {

                        //Se válido, faz o upload da imagem para a pasta
                        uploadedFile.mv(`public/dist/img/usuarios/${image_name}`, (err) => {
                            if (err) {
                                //Erro ao fazer upload
                                console.log('Erro 006: ', err);
                                status_Crud = 'imgErroCopia';
                                res.redirect('/usuario');
                            } else {
                                //Faz o INSERT com foto selecionada
                                let query = "INSERT INTO `tb_usuario` " +
                                    "(nome, email, usuario, senha, perfil, status, foto) VALUES ('" +
                                    nome + "', '" +
                                    email + "', '" +
                                    usuario + "', '" +
                                    senha + "', '" +
                                    perfil + "', '" +
                                    status + "', '" +
                                    image_name + "')";

                                //Executa o INSERT
                                db.query(query, (err, results, fields) => {
                                    if (err) {
                                        console.log('Erro 007: ', err);
                                        status_Crud = 'nao';
                                        res.redirect('/usuario');
                                    }

                                    //INSERT realizado com sucesso
                                    status_Crud = 'sim';
                                    res.redirect('/usuario');
                                });
                            }
                        });

                    } else { //Imagem inválida (extenção)                        
                        console.log('Erro 008: ', err);
                        status_Crud = 'imgErroExtensao';
                        res.redirect('/usuario');
                    }
                }
            });
        }
    },

    editUsuario: (req, res) => {

        //Verifica se selecionou uma imagem
        if (!req.files) {
            //Se não selecionou, executa UPDATE sem imagem, ou seja mantendo a imagem atual
            let cod = req.body.cod_EDIT;
            let nome = req.body.nome_EDIT.trim();
            let email = req.body.email_EDIT.trim();
            let usuario = req.body.usuario_EDIT.trim();
            let senha = req.body.senha_EDIT.trim();
            let perfil = req.body.perfil_EDIT;

            //Combobox
            let status = '';
            if (req.body.status_EDIT == 'on') {
                status = '1';
            } else {
                status = '0';
            };

            //Faz o UPDATE mantendo a imagem
            let query = "UPDATE `tb_usuario` SET " +
                "`nome` = '" + nome + "', " +
                "`email` = '" + email + "', " +
                "`usuario` = '" + usuario + "', " +
                "`senha` = '" + senha + "', " +
                "`status` = '" + status + "', " +
                "`perfil` = '" + perfil + "'" +
                " WHERE `tb_usuario`.`cod` = '" + cod + "'";

            //Executa o UPDATE
            db.query(query, (err, results, fields) => {
                if (err) {
                    console.log('Erro 009: ', err);
                    status_Crud = 'nao';
                    res.redirect('/usuario');
                } else {
                    //Atualiza dados da seção
                    if (cod == req.session.cod_login_pcp) {
                        req.session.cod_login_pcp = cod;
                        req.session.nome_login_pcp = nome;
                        //req.session.foto_login_pcp = image_name;
                        req.session.usuario_login_pcp = usuario;
                        req.session.perfil_login_pcp = perfil;
                    } else {
                        //Não faça nada
                    }

                    //UPDATE realizado com sucesso              
                    status_Crud = 'sim';
                    res.redirect('/usuario');
                }
            });

        } else { //Selecionou uma imagem
            //Executa UPDATE com a imagem selecionada
            let cod = req.body.cod_EDIT;
            let nome = req.body.nome_EDIT.trim();
            let email = req.body.email_EDIT.trim();
            let usuario = req.body.usuario_EDIT.trim();
            let senha = req.body.senha_EDIT.trim();
            let perfil = req.body.perfil_EDIT;

            let status = '';
            if (req.body.status_EDIT == 'on') {
                status = '1';
            } else {
                status = '0';
            };

            //Definindo nome da imagem conforme arquivo selecionado
            let uploadedFile = req.files.image_EDIT;
            let fileExtension = uploadedFile.mimetype.split('/')[1];
            let image_name = usuario + '_' + uploadedFile.name.replace(/ /g, "_") + '.' + fileExtension;

            //Deleta a imagem antiga
            let getImageQuery = 'SELECT foto FROM `tb_usuario` WHERE cod = "' + cod + '"';
            db.query(getImageQuery, (err, results, fields) => {
                let image = results[0].foto;

                //Exclui a imagem do disco
                fse.unlink(`public/dist/img/usuarios/${image}`, (err) => {

                    //Valida se a extenção da imagem selecionada é válida
                    if (uploadedFile.mimetype === 'image/png' ||
                        uploadedFile.mimetype === 'image/jpeg' ||
                        uploadedFile.mimetype === 'image/jpg' ||
                        uploadedFile.mimetype === 'image/gif') {

                        //Se válido, faz o upload da imagem para a pasta
                        uploadedFile.mv(`public/dist/img/usuarios/${image_name}`, (err) => {
                            if (err) {
                                console.log('Erro 010: ', err);
                                status_Crud = 'imgErroCopia';
                                res.redirect('/usuario');
                            } else {
                                //Faz o UPDATE com a imagem selecionada
                                let query = "UPDATE `tb_usuario` SET " +
                                    "`nome` = '" + nome + "', " +
                                    "`email` = '" + email + "', " +
                                    "`usuario` = '" + usuario + "', " +
                                    "`senha` = '" + senha + "', " +
                                    "`status` = '" + status + "', " +
                                    "`perfil` = '" + perfil + "', " +
                                    "`foto` = '" + image_name + "'" +
                                    " WHERE `tb_usuario`.`cod` = '" + cod + "'";

                                //Executa o UPDATE
                                db.query(query, (err, results, fields) => {
                                    if (err) {
                                        console.log('Erro 011: ', err);
                                        status_Crud = 'nao';
                                        res.redirect('/usuario');
                                    }

                                    //Atualiza dados da seção
                                    if (cod == req.session.cod_login_pcp) {
                                        req.session.cod_login_pcp = cod;
                                        req.session.nome_login_pcp = nome;
                                        req.session.foto_login_pcp = image_name;
                                        req.session.usuario_login_pcp = usuario;
                                        req.session.perfil_login_pcp = perfil;
                                    } else {
                                        //Não faça nada
                                    }

                                    //UPDATE realizado com sucesso              
                                    status_Crud = 'sim';
                                    res.redirect('/usuario');
                                });
                            }
                        });

                    } else { //Imagem inválida (extenção)                
                        console.log('Erro 012: ', err);
                        status_Crud = 'imgErroExtensao';
                        res.redirect('/usuario');
                    }
                });
            });
        }
    },

    delUsuario: (req, res) => {
        let cod = req.params.id;
        let getImageQuery = 'SELECT foto FROM `tb_usuario` WHERE cod = "' + cod + '"';
        let query = 'DELETE FROM `tb_usuario` WHERE cod = "' + cod + '"';

        //Verifica se a imagem existe
        db.query(getImageQuery, (err, results, fields) => {
            if (err) {
                console.log('Erro 013: ', err);

                //Executa do DELETE
                db.query(query, (err, results, fields) => {
                    if (err) {
                        console.log('Erro 014: ', err);
                        status_Crud = 'nao';
                        res.redirect('/usuario');
                    }

                    //DELETE realizado com sucesso
                    status_Crud = 'sim';
                    res.redirect('/usuario');
                });
            } else { //Existe imagem a deletar
                let image = results[0].foto;

                //Exclui a imagem do disco
                fse.unlink(`public/dist/img/usuarios/${image}`, (err) => {

                    //Executa do DELETE
                    db.query(query, (err, results, fields) => {
                        if (err) {
                            console.log('Erro 014: ', err);
                            status_Crud = 'nao';
                            res.redirect('/usuario');
                        }

                        //DELETE realizado com sucesso
                        status_Crud = 'sim';
                        res.redirect('/usuario');
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