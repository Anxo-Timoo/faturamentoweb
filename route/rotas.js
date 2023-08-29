
module.exports = (io) => { //Aqui recebo o socket.io lá do app.js

    //Instanciando o Router do express
    var express = require('express');
    var rotas = express.Router();
    var username ;
    var perfil;
   
    

    //Trecho que verifica se a seção está ativa
    rotas.use(function(req, res, next){
        //Se a rota for diferente da página inicial e nome_login_pcp da seção redis estiver vazio
        if (['/'].indexOf(req.url) === -1 && req.session.nome_login_pcp == undefined) {
            //Redireciona para a página de login
            res.redirect('/')
        } else {//senão
            
            //Passa para as próximas rotas abaixo 
            next();
        } 
                
        
    });

    var BlockingMiddleware = function(req, res, next) {
        //checa se o usuario e administrador
        username = req.session.usuario_login_pcp;        
           
        if(username)
        {
            perfil = req.session.perfil_login_pcp;
            
            if (perfil != 'Administrador'){
           
                return res.sendStatus(403); // 'fORBIDDEN'
                next();
            }
            else{
                next();
            }
    
        }         
       
    };

    //================================================================== Setando as rotas da aplicação
    //Rotas para a página de "Login"
    const { pageLogin, verificaLogin, pageAdmin } = require('../dao/login.js');
    rotas.get('/', pageLogin); //localhost:3000 - Tela inicial de login
    rotas.post('/', verificaLogin); //localhost:3000 - Usado no post do botão "Entrar" da tela de login
    rotas.get('/home', pageAdmin); //localhost:3000/admin - Tela inicial da página administrativa

    //Rotas para a página de "Cadastro de Material"
    const { pageMaterial, addMaterial, editMaterial, delMaterial, } = require('../dao/cadastros/material.js');
    rotas.get('/material', pageMaterial); //localhost:3000/material (ao clicar no menu da sidebar: Cadastros > Material (C"R"UD))
    rotas.post('/addMaterial', addMaterial); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
    rotas.post('/editMaterial/:id', editMaterial); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
    rotas.get('/delMaterial/:id', delMaterial); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")
    

    //Rotas para a página de "Relatorio de Materiais SAP"
    const { pageMaterialSAP, addMaterialSAP, editMaterialSAP, delMaterialSAP, } = require('../dao/dashboard/material_sap.js');
    rotas.get('/material_sap', pageMaterialSAP); //localhost:3000/material (ao clicar no menu da sidebar: Cadastros > Material (C"R"UD))
    rotas.post('/addMaterial_SAP', addMaterialSAP); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
    rotas.post('/editMaterial_SAP/:id', editMaterialSAP); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
    rotas.get('/delMaterial_SAP/:id', delMaterialSAP); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")

    //================================================================== Transporte
    //Rotas para a página de "Agenda"
    const { pageAgenda, addAgenda, editAgenda, delAgenda, } = require('../dao/transporte/agenda.js');
    rotas.get('/agenda', pageAgenda); //localhost:3000/agenda (ao clicar no menu da sidebar: Transporte > Agenda (C"R"UD))
    rotas.post('/addAgenda', addAgenda); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
    rotas.post('/editAgenda/:id', editAgenda); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
    rotas.get('/delAgenda/:id', delAgenda); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")

    //================================================================== Dashboard
    //Rotas para a página de "Dashboard" (ShopFloor)
    const { pageShopFloor } = require('../dao/dashboard/dash_logistica.js');
    rotas.get('/shopfloor', pageShopFloor); //localhost:3000/shopfloor - Tela Dashboard da página shopfloor

    //Rotas para a página de "Informações gerais"
    const { pageInfoGerais, addInfoGerais, editInfoGerais, delInfoGerais, } = require('../dao/dashboard/informacoes_gerais.js');
    rotas.get('/informacoes_gerais', pageInfoGerais); //localhost:3000/informacoes_gerais (ao clicar no menu da sidebar: Dashboard > Informações gerais (C"R"UD))
    rotas.post('/addInformacoes_gerais', addInfoGerais); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
    rotas.post('/editInformacoes_gerais/:id', editInfoGerais); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
    rotas.get('/delInformacoes_gerais/:id', delInfoGerais); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")

    //Rotas para a página de "Ocorrencia"
    const { pageOcorrencia_sf, addOcorrencia_sf, editOcorrencia_sf, delOcorrencia_sf, } = require('../dao/dashboard/ocorrencia_sf.js');
    rotas.get('/ocorrencia_sf', pageOcorrencia_sf); //localhost:3000/ocorrencia_sf (ao clicar no menu da sidebar: Dashboard > Ocorrencia (C"R"UD))
    rotas.post('/addOcorrencia_sf', addOcorrencia_sf); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
    rotas.post('/editOcorrencia_sf/:id', editOcorrencia_sf); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
    rotas.get('/delOcorrencia_sf/:id', delOcorrencia_sf); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")

     //Rotas para a página de "Faturamento"
     const { pageFaturamento, addFaturamento, editFaturamento, delFaturamento, } = require('../dao/dashboard/faturamento.js');
     rotas.get('/faturamento', pageFaturamento); //localhost:3000/recebimento (ao clicar no menu da sidebar: Dashboard > Recebimento (C"R"UD))
     rotas.post('/addFaturamento', addFaturamento); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
     rotas.post('/editFaturamento/:id', editFaturamento); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
     rotas.get('/delFaturamento/:id', delFaturamento); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")
   
   
    //Rotas para a página de "Recebimento"
    const { pageRecebimento, addRecebimento, editRecebimento, delRecebimento, } = require('../dao/dashboard/recebimento.js');
    rotas.get('/recebimento', pageRecebimento); //localhost:3000/recebimento (ao clicar no menu da sidebar: Dashboard > Recebimento (C"R"UD))
    rotas.post('/addRecebimento', addRecebimento); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
    rotas.post('/editRecebimento/:id', editRecebimento); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
    rotas.get('/delRecebimento/:id', delRecebimento); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")

    //
    //const { pageEmbalagem, addEmbalagem, editEmbalagem, delEmbalagem, } = require('../dao/dashboard/embalagem.js');
    //rotas.get('/embalagem', pageEmbalagem); //localhost:3000/embalagem (ao clicar no menu da sidebar: Dashboard > Embalagem (C"R"UD))
    //rotas.post('/addEmbalagem', addEmbalagem); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
    //rotas.post('/editEmbalagem/:id', editEmbalagem); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
    //rotas.get('/delEmbalagem/:id', delEmbalagem); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")

    const { pageOV, addOV, faturaOV, delOV,editOV } = require('../dao/dashboard/ordem_venda.js');
    rotas.get('/ordem_venda', pageOV); //localhost:3000/ordem de venda (ao clicar no menu da sidebar: Dashboard > OV (C"R"UD))
    rotas.post('/addOV', addOV); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
    rotas.post('/faturaOV/:id', faturaOV); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
    rotas.get('/delOV/:id', delOV); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")
    rotas.post('/editOV/:id', editOV); //Usado no post do botão "Editar" do modal que altera um registro (CR"U"D)

    //Rotas para a página de "Preparação"
    const { pagePreparacao, addPreparacao, editPreparacao, delPreparacao, } = require('../dao/dashboard/preparacao.js');
    rotas.get('/preparacao', pagePreparacao); //localhost:3000/preparacao (ao clicar no menu da sidebar: Dashboard > Preparação (C"R"UD))
    rotas.post('/addPreparacao', addPreparacao); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
    rotas.post('/editPreparacao/:id', editPreparacao); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
    rotas.get('/delPreparacao/:id', delPreparacao); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")

    //Rotas para a página de "Inventario"
    //const { pageInventario, addInventario, editInventario, delInventario, } = require('../dao/dashboard/inventario.js');
    //rotas.get('/inventario', pageInventario); //localhost:3000/inventario (ao clicar no menu da sidebar: Dashboard > Inventario (C"R"UD))
    //rotas.post('/addInventario', addInventario); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
    //rotas.post('/editInventario/:id', editInventario); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
    //rotas.get('/delInventario/:id', delInventario); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")

     //Rotas para a página J1BTAX
     const { pageJ1btax, addInventario, editInventario, delInventario, } = require('../dao/dashboard/j1btax.js');
     rotas.get('/j1btax', pageJ1btax); //localhost:3000/inventario (ao clicar no menu da sidebar: Dashboard > Inventario (C"R"UD))
     rotas.post('/addInventario', addInventario); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
     rotas.post('/editInventario/:id', editInventario); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
     rotas.get('/delInventario/:id', delInventario); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")

    //Rotas para a página de "Qualidade"
    const { pageQualidade, addQualidade, editQualidade, delQualidade, } = require('../dao/dashboard/qualidade.js');
    rotas.get('/qualidade', pageQualidade); //localhost:3000/qualidade (ao clicar no menu da sidebar: Dashboard > Qualidade (C"R"UD))
    rotas.post('/addQualidade', addQualidade); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
    rotas.post('/editQualidade/:id', editQualidade); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
    rotas.get('/delQualidade/:id', delQualidade); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")

    //Rotas para a página FB03 - Exibição de doc contábil
    const { pageFB03, addFB03, editFB03, delFB03, } = require('../dao/dashboard/fb03.js');
    rotas.get('/fb03/:id&:gjahr', pageFB03); //localhost:3000/qualidade (ao clicar no menu da sidebar: Dashboard > Qualidade (C"R"UD))
    rotas.post('/addFB03', addFB03); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
    rotas.post('/editFB03/:id', editFB03); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
    rotas.get('/delFB03/:id', delFB03); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")

    //Rotas para a página de "Informativo"
    const { pageInformativo, addInformativo, editInformativo, delInformativo,} = require('../dao/dashboard/informativo.js');
    rotas.get('/Informativo', pageInformativo);
    rotas.post('/addInformativo', addInformativo);
    rotas.post('/editInformativo/:id', editInformativo);
    rotas.get('/delInformativo/:id', delInformativo); 

    //================================================================== Chat
    //Rotas para a página de "Chat"
    const { pageChat, } = require('../dao/chat/chat.js');
    rotas.get('/chat', pageChat); //localhost:3000/chat (ao clicar no menu da sidebar: Comunicação > Chat

    //================================================================== CADASTROS
    //Rotas para a página de "Cadastro de Usuário"
    const { pageUsuario, addUsuario, editUsuario, delUsuario, } = require('../dao/cadastros/usuario.js');
    rotas.get('/usuario', BlockingMiddleware, pageUsuario); //localhost:3000/usuario (ao clicar no menu da sidebar: Cadastros > Usuário (C"R"UD))
    rotas.post('/addUsuario', addUsuario); //Usado no post do botão "Salvar" do modal que cadastra um novo registro ("C"RUD)
    rotas.post('/editUsuario/:id', editUsuario); //Usado no post do botão "Salvar" do modal que altera um registro (CR"U"D)
    rotas.get('/delUsuario/:id', delUsuario); //Usado no get do botão "Sim, eliminar" do modal que deleta um registro (CRU"D")

    //Exportando este módulo
    return rotas;
};