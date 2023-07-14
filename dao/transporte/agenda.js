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
    pageAgenda: (req, res) => {

        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {

            //Consultas diversas para popular elementos
            let tipoVeiculo = await DBModel.getTipoVeiculo();
            let transportadoras = await DBModel.getTransportadoras();
            let planejadores = await DBModel.getPlanejadores();

            //Atribuindo o conteúdo central
            page = './includes/transporte/inc_agenda';
            //page = './includes/default/3-content_manutencao';

            //Consulta tabela para popular conteúdo da tabela
            let query = "SELECT * FROM `tb_transporte_agenda`";
            db.query(query, (err, results, fields) => {

                //Passa o conteúdo das variáveis para a página principal
                res.render('./pageAdmin', {
                    DTAgenda: JSON.parse(JSON.stringify(results)),
                    DTTransportadora: transportadoras,
                    DTVeiculo: tipoVeiculo,
                    DTPlanejador: planejadores,
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
                    TransporteOpen: 'menu-open',
                    Transporte: 'active',
                    CadAgenda: 'active',
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

                //Reinicia a variável
                status_Crud = '';
                conn.releaseConnection(db);
            });
        })();//async
    },

    addAgenda: (req, res) => {

        let title = req.body.title_ADD.trim();
        let description = req.body.description_ADD.trim();
        let parceiro = req.body.parceiro_ADD;
        let tipo_veiculo = req.body.tipo_veiculo_ADD;
        let planejador = req.body.planejador_ADD.trim();
        let qtde_palete;
        if (req.body.qtde_palete_ADD == 0 || req.body.qtde_palete_ADD == '' || req.body.qtde_palete_ADD == undefined || req.body.qtde_palete_ADD == null) {
            qtde_palete = 0;
        } else {
            qtde_palete = req.body.qtde_palete_ADD.trim()
        }
        let start = FUNCOES.formatDateTimeToBD(req.body.start_INPUT_ADD);
        let semana = FUNCOES.formatDateTimeToWeekAgenda(req.body.start_INPUT_ADD);
        let end = FUNCOES.formatDateTimeToBD(req.body.end_INPUT_ADD);
        let color = req.body.color_ADD;
        let observacao = req.body.observacao_ADD;

        //Faz o INSERT
        let query = "INSERT INTO `tb_transporte_agenda` " +
            "(title, description, parceiro, tipo_veiculo, planejador, qtde_palete, start, semana, end, color, observacao) VALUES ('" +
            title + "', '" +
            description + "', '" +
            parceiro + "', '" +
            tipo_veiculo + "', '" +
            planejador + "', '" +
            qtde_palete + "', '" +
            start + "', '" +
            semana + "', '" +
            end + "', '" +
            color + "', '" +
            observacao + "')";

        //Executa o INSERT
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/agenda');
            } else {
                //INSERT realizado com sucesso
                status_Crud = 'sim';
                res.redirect('/agenda');
            }
        });
    },

    editAgenda: (req, res) => {
        let cod = req.body.cod_EDIT;
        let title = req.body.title_EDIT.trim();
        let description = req.body.description_EDIT.trim();
        let parceiro = req.body.parceiro_EDIT;
        let tipo_veiculo = req.body.tipo_veiculo_EDIT;
        let planejador = req.body.planejador_EDIT.trim();
        let qtde_palete;
        if (req.body.qtde_palete_EDIT == 0 || req.body.qtde_palete_EDIT == '' || req.body.qtde_palete_EDIT == undefined || req.body.qtde_palete_EDIT == null) {
            qtde_palete = 0;
        } else {
            qtde_palete = req.body.qtde_palete_EDIT.trim()
        }
        let start = FUNCOES.formatDateTimeToBD(req.body.start_INPUT_EDIT);
        let semana = FUNCOES.formatDateTimeToWeekAgenda(req.body.start_INPUT_EDIT);
        let end = FUNCOES.formatDateTimeToBD(req.body.end_INPUT_EDIT);
        let color = req.body.color_EDIT;
        let observacao = req.body.observacao_EDIT;

        //Faz o UPDATE
        let query = "UPDATE `tb_transporte_agenda` SET " +
            "`title` = '" + title + "', " +
            "`description` = '" + description + "', " +
            "`parceiro` = '" + parceiro + "', " +
            "`tipo_veiculo` = '" + tipo_veiculo + "', " +
            "`planejador` = '" + planejador + "', " +
            "`qtde_palete` = '" + qtde_palete + "', " +
            "`start` = '" + start + "', " +
            "`semana` = '" + semana + "', " +
            "`end` = '" + end + "', " +
            "`color` = '" + color + "', " +
            "`observacao` = '" + observacao + "'" +
            " WHERE `tb_transporte_agenda`.`cod` = '" + cod + "'";

        //Executa o UPDATE
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 003: ', err);
                status_Crud = 'nao';
                res.redirect('/agenda');
            } else {
                //UPDATE finalizado
                status_Crud = 'sim';
                res.redirect('/agenda');
            }
        });
    },

    delAgenda: (req, res) => {
        let cod = req.params.id;
        let query = 'DELETE FROM `tb_transporte_agenda` WHERE cod = "' + cod + '"';

        //Executa do DELETE
        db.query(query, (err, results, fields) => {
            if (err) {
                console.log('Erro 014: ', err);
                status_Crud = 'nao';
                res.redirect('/agenda');
            }

            //DELETE realizado com sucesso
            status_Crud = 'sim';
            res.redirect('/agenda');
        });
    },

    /**
     * Funções que passam o valor da variável para outro arquivo js */
    getStatusCrud() {
        return status_Crud;
    },

};