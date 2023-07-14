//Variável que setamos a página do conteúdo central a ser incluído na tela
const DB = require('./listas/selects');
const FUNCOES = require('./util/funcoes');
const mysql = require('mysql2');
const config = require('./../database/config');
const { json } = require('body-parser');

const conn = mysql.createPool(config);
var page = './includes/default/3-content';
var status_Login = '';

//================================================================== Funções recebidas da rota
module.exports = {

    //Pagina inicial de login ao acessar localhost:3000 ou fazer logoff
    pageLogin: (req, res) => {

        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {

            //Deleta a sessão do usuário do redis
            delete req.session.nome_login_pcp;
            
            //Abre a página de login
            status_Login = 'blank';
            res.render('./pageLogin', {
                status_Login,
                body: req.body
            });
        })();//async
    },

    //Função que verifica usuário e senha digitados na tela de login
    verificaLogin: (req, res) => {

        var username = req.body.usuario;
        var password = req.body.senha;        

        let sql = "SELECT * FROM tb_usuario WHERE " +
            "usuario = '" + username + "' AND " +
            "senha = '" + password + "'";

        //Valida e executa o login na aplicação
        db.query(sql, (err, results, fields) => {

            //Verifica se usuário e senha digitados conferem
            if (results.length > 0) {

                //Verifica se o usuário está ativo
                if (results[0].status == '1') {

                    //Executa certas funções em tempo de execução passando para a página
                    let DBModel = new DB(conn);
                    (async function () {
                         //Seta o conteúdo da página                   
                         page = './includes/default/3-content';
                         //page = './includes/default/3-content_manutencao';                      

                        //Grava dados do usuário logado na sessão do redis
                        req.session.cod_login_pcp = results[0].cod;
                        req.session.nome_login_pcp = results[0].nome;
                        req.session.foto_login_pcp = results[0].foto;
                        req.session.usuario_login_pcp = results[0].usuario;
                        req.session.perfil_login_pcp = results[0].perfil;

                        //Login OK - Passa o conteúdo das variáveis para a página index
                        res.render('./pageAdmin', {
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
                            ShopFloorOpen: '',
                            ShopFloor: '',
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

                        //Limpa campos
                        req.body = {};
                    })();//async
                    //res.end();
                    

                } else { //Usuário bloqueado
                    status_Login = 'loginBloqueado';
                    res.render('./pageLogin', {
                        status_Login,
                        body: req.body
                    });
                    res.end();
                }

            } else { //Usuário e senha não conferem
                               
                status_Login = 'loginIncorreto';                
                res.render('./pageLogin', {
                    status_Login,
                    body: req.body
                });
                res.end();
            
            }
        });
      },

    pageAdmin: (req, res) => {

        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {
            //Seta o conteúdo da página                   
            page = './includes/default/3-content';
            //page = './includes/default/3-content_manutencao';

            res.render('./pageAdmin', {
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
                ShopFloorOpen: '',
                ShopFloor: '',
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
        })();//async
        //res.end();
    },
};