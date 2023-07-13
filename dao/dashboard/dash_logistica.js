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
    pageShopFloor: (req, res) => {
        //Executa certas funções em tempo de execução passando para a página
        let DBModel = new DB(conn);
        (async function () {            
            //Atribuindo o conteúdo central
            page = './includes/dashboard/inc_dash_logistica';
            //page = './includes/default/3-content_manutencao';

            //Consultas diversas para popular elementos
            let informacoesGerais = await DBModel.getInformacoesGerais();
            let ocorrencias = await DBModel.getOcorrencias();
            let volumesT1 = await DBModel.getVolumesT1();
            let volumesT2 = await DBModel.getVolumesT2();
            let chartLinhaTempoStageT1 = await DBModel.getChartLinhaTempoStageT1();
            let chartLinhaTempoStageT2 = await DBModel.getChartLinhaTempoStageT2();
            let boPeT1 = await DBModel.getBOPeT1();
            let boCilindroT1 = await DBModel.getBOCilindroT1();
            let boOutrosT1 = await DBModel.getBOOutrosT1();
            let boPeT2 = await DBModel.getBOPeT2();
            let boCilindroT2 = await DBModel.getBOCilindroT2();
            let boOutrosT2 = await DBModel.getBOOutrosT2();
            let setupEmbalagemT1 = await DBModel.getChartLinhaSetupEmbalagemT1();
            let setupEmbalagemT2 = await DBModel.getChartLinhaSetupEmbalagemT2();
            let taktEmbalagemT1 = await DBModel.getChartLinhaTaktEmbalagemT1();
            let taktEmbalagemT2 = await DBModel.getChartLinhaTaktEmbalagemT2();
            let preparacaoT1 = await DBModel.getPreparacaoT1();
            let preparacaoT2 = await DBModel.getPreparacaoT2();
            let setupPreparacaoT1 = await DBModel.getSetupPreparacaoT1();
            let setupPreparacaoT2 = await DBModel.getSetupPreparacaoT2();
            let inventarioT1 = await DBModel.getInventarioT1();
            let inventarioT2 = await DBModel.getInventarioT2();
            let faltanteT1 = await DBModel.getFaltanteT1();
            let faltanteT2 = await DBModel.getFaltanteT2();
            let qualidade = await DBModel.getQualidade();
            let ppmAtual = await DBModel.getPPMatual();
            let informativos = await DBModel.getInformativo();

            //Passa o conteúdo das variáveis para a página principal
            res.render('./pageAdmin', {
                //Populando elementos
                DTInformacoesGerais: informacoesGerais,
                DTOcorrencias: ocorrencias,
                DTVolumesT1: volumesT1,
                DTVolumesT2: volumesT2,
                DTChartLinhaTempoStageT1: chartLinhaTempoStageT1,
                DTChartLinhaTempoStageT2: chartLinhaTempoStageT2,
                DTBoPeT1: boPeT1,
                DTBoCilindroT1: boCilindroT1,
                DTBoOutrosT1: boOutrosT1,
                DTBoPeT2: boPeT2,
                DTBoCilindroT2: boCilindroT2,
                DTBoOutrosT2: boOutrosT2,
                DTSetupEmbalagemT1: setupEmbalagemT1,
                DTSetupEmbalagemT2: setupEmbalagemT2,
                DTTaktEmbalagemT1: taktEmbalagemT1,
                DTTaktEmbalagemT2: taktEmbalagemT2,
                DTPreparacaoT1: preparacaoT1,
                DTPreparacaoT2: preparacaoT2,
                DTSetupPreparacaoT1: setupPreparacaoT1,
                DTSetupPreparacaoT2: setupPreparacaoT2,
                DTInventarioT1: inventarioT1,
                DTInventarioT2: inventarioT2,
                DTFaltanteT1: faltanteT1,
                DTFaltanteT2: faltanteT2,
                DTQualidade: qualidade,
                DTPPMAtual: ppmAtual,
                DTInformativo: informativos,
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
                CadShopfloor: 'active',
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

    //Funções que passam o valor da variável para outro arquivo js
    getStatusCrud() {
        return status_Crud;
    },

};