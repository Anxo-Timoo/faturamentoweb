//Classe de consultas
class DB {

    //Construtor que recebe a conexão quando instanciado a classe
    constructor(db) {
        this.db = db;
    }

      getSAPR3ConnectionString(){
        
        var abapSystem = {
            user: 'rfcbrq',
            passwd: 'rfc@brq12',
            ashost: '10.2.0.226',
            sysnr: '01',
            client: '210'
        };
       return abapSystem;
    }

    //-------------------------------------------------------------------------------------- Funções internas

    //Consulta sem parâmetro
    async doQuery(queryToDo) {
        let pro = new Promise((resolve, reject) => {
            let query = queryToDo;

            //Executando a consulta
            this.db.query(query, function(err, result) {
                if (err) throw err;
                resolve(result);
            });
        })

        //Retornando o resultado
        return pro.then((val) => {
            return val;            
        })
    }

    //Consulta com parâmetro
    async doQueryParams(queryToDo, array) {
        let pro = new Promise((resolve, reject) => {
            let query = queryToDo;

            //Executando a consulta com parâmetro
            this.db.query(query, array, function(err, result) {
                if (err) throw err;
                resolve(result);
            });
        })

        //Retornando o resultado
        return pro.then((val) => {
            return val;
        })
    }
     
    
    async getFIARBillingsRFC(bapi,data_ini,data_fim,cliente,nfenum){
         var objects = [];

        var res_array = [];
        var texts_array = [];
        var mes;
        var dia; 
        var ano;

        const promise = new Promise((resolve, reject) => {
             
            "use strict";
                var rfc = require('node-rfc');
                var abapSystem = this.getSAPR3ConnectionString();
                var client = new rfc.Client(abapSystem);
                var MAX_ROWS = 999;
              
                if(!data_ini){
                    data_ini = '19000101';
                    data_fim = '19000101';
                }  
                //caso a data fim não esteja preenchida, copia a data início para somente 1 dia
                if(!data_fim){
                    
                    data_fim = data_ini;
                }  
                                           
                if(!cliente){

                 cliente = '';
                }   

                if(!nfenum){

                    nfenum = '';
                
                }   

                //inverte para o formato SAP - budat
                dia = data_ini.substring(0,2);
                mes = data_ini.substring(2,4);
                ano = data_ini.substring(4,8);   

                data_ini = ano + mes + dia;

                dia = data_fim.substring(0,2);
                mes = data_fim.substring(2,4);
                ano = data_fim.substring(4,8); 
                
                data_fim = ano + mes + dia;


                client.connect(function(err) {
                    if (err) {
                        return console.error('could not connect to server', err);
                    }	
                    client.invoke('ZFIAR_REP_BILLING_OUTPUT', {
                            P_KUNNR: cliente,
                            DTINI: data_ini,
                            DTFIM: data_fim,
                            PNFENUM:nfenum,
                        },
                        function(err, res) {
                            if (err) {
                                return console.error('Error invoking ZFIAR_REP_BILLING_OUTPUT:', err);
                            }
                        //console.log('Result ZFIAR_REP_BILLING_OUTPUT:', res);
                        //console.log(JSON.stringify(res.USERLIST));
                    
                        for(let i in res.RETURN) { 
                            res_array.push({
                                refkey: res.RETURN[i].REFKEY,
                                nfnum: res.RETURN[i].NFNUM,
                                statusnf: res.RETURN[i].STATUSNF,
                                parid: res.RETURN[i].PARID,
                                name1: res.RETURN[i].NAME1,
                                cnpj: res.RETURN[i].TXT_CPF_CNPJ,
                                docdat: res.RETURN[i].DOCDAT,
                                zfbdt: res.RETURN[i].ZFBDT,
                                netwr: res.RETURN[i].NETWR,
                                projk: res.RETURN[i].PROJK,
                                post1: res.RETURN[i].POST1,
                                maktx_i: res.RETURN[i].MAKTX_I,
                                crenam: res.RETURN[i].CRENAM,
                                werks:res.RETURN[i].WERKS,
                                augdt:res.RETURN[i].AUGDT,
                                augbl:res.RETURN[i].AUGBL,
                                vlr_liquido:res.RETURN[i].WRBTR_L,

                            });
                            //res_array.push([i,res.USERLIST[i].USERNAME]); 
                            //console.log(res.RETURN);
                         }; 
                       
                          resolve(res_array);
                          
                        });	
                });
                //promise.then(result => return result);
            })
                return promise;


    }

     //Obtem uma ordem de venda pelo ID
    async getSalesOrderById(vbeln) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (vbeln == undefined || vbeln == '') { vbeln = "|"}
        
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_sf_ordem_venda WHERE " +
        "IFNULL(vbeln, '') REGEXP(REPLACE('" + vbeln + "', ';' , '|')) " +        
        "ORDER BY vbeln ASC";
        return this.doQuery(query)      
    }

     async editaOVRFC(bapi,ov,text_bank,text_tax,text_service,valdt,condition)
     {
        var objects = [];
        var docFaturamento;
        var res_array = [];
        let abap_table = [];

        const promise = new Promise((resolve, reject) => {
             
            "use strict";
                var rfc = require('node-rfc');
                var abapSystem = this.getSAPR3ConnectionString();
                var client = new rfc.Client(abapSystem);
                var MAX_ROWS = 999;
                
               // if (ov){
                    // ABAP structure
                 //   const abap_structure = {
                   //     REF_DOC: ov,
                   //     REF_DOC_CA: 'C',                    
                  //  };
                    // ABAP table
                  //   abap_table = [abap_structure];
                //}                                                                                           
                                                
                client.connect(function(err) {
                    if (err) {
                        return console.error('could not connect to server', err);
                    }	
                      client.invoke('ZSAVE_TEXTS_OV_EDIT_PORTAL', 
                       {
                            I_TEXT_BANK:text_bank,
                            I_VBELN:ov,
                            I_TEXT_TAX:text_tax,
                            I_TEXT_SERVICE:text_service,
                            VALDT:valdt,
                            PAYMNTRM:condition,                                                    
                        },
                        function(err, res) {
                            if (err) {
                                return console.error('Error invoking ZSAVE_TEXTS_OV_EDIT_PORTAL:', err);
                            }
                        //console.log('Result ZSAVE_TEXTS_OV_EDIT_PORTAL:', res);
                        
                    
                        for(let i in res.RETURN) { 
                            res_array.push({
                                type: res.RETURN[i].TYPE,
                                id: res.RETURN[i].ID,
                                number: res.RETURN[i].NUMBER,
                                message: res.RETURN[i].MESSAGE,
                               

                            });
                            //res_array.push([i,res.USERLIST[i].USERNAME]); 
                            //console.log(res.RETURN);
                         }; 
                          resolve(res_array);
                        });	
                });
                //promise.then(result => return result);
            })
                return promise;
       }


     async faturaOVRFC(bapi,ov)
     {
        var objects = [];
        var docFaturamento;
        var res_array = [];
        let abap_table = [];
        const promise = new Promise((resolve, reject) => {
             
            "use strict";
                var rfc = require('node-rfc');
                var abapSystem = this.getSAPR3ConnectionString();
                var client = new rfc.Client(abapSystem);
                var MAX_ROWS = 999;
                
                if (ov){
                    // ABAP structure
                    const abap_structure = {
                        REF_DOC: ov,
                        REF_DOC_CA: 'C',                    
                    };
                    // ABAP table
                     abap_table = [abap_structure];
                }                                                                                           
               
               // var SELECTION_RANGE_str = {
                 //       PARAMETER: "USERNAME",
                 //       SIGN:      "I",
                  //      OPTION:    "CP",
                 //       LOW:       "A*"
                  //};	
                //var VBCOM = [SELECTION_RANGE_str];
                    
                client.connect(function(err) {
                    if (err) {
                        return console.error('could not connect to server', err);
                    }	
                    client.invoke('BAPI_BILLINGDOC_CREATEMULTIPLE', {
                           BILLINGDATAIN: abap_table                                                      
                        },
                        function(err, res) {
                            if (err) {
                                return console.error('Error invoking BAPI_BILLINGDOC_CREATEMULTIPLE:', err);
                            }
                        console.log('Result BAPI_BILLINGDOC_CREATEMULTIPLE:', res);
                        //console.log(JSON.stringify(res.USERLIST));
                    
                        for(let i in res.RETURN) { 
                            res_array.push({
                                type: res.RETURN[i].TYPE,
                                id: res.RETURN[i].ID,
                                number: res.RETURN[i].NUMBER,
                                message: res.RETURN[i].MESSAGE,
                               

                            });
                            //res_array.push([i,res.USERLIST[i].USERNAME]); 
                            //console.log(res.RETURN);
                         }; 
                          resolve(res_array);
                        });	
                });
                //promise.then(result => return result);
            })
                return promise;
       }

    async getSalesOrderRFC(bapi,data_ini,data_fim,cliente,ov)
     {
        var objects = [];

        var res_array = [];
        var texts_array = [];

        const promise = new Promise((resolve, reject) => {
             
            "use strict";
                var rfc = require('node-rfc');
                var abapSystem = this.getSAPR3ConnectionString();
                var client = new rfc.Client(abapSystem);
                var MAX_ROWS = 999;
              
                if(!data_ini){
                    data_ini = '19000101';
                    data_fim = '19000101';
                }  
                //caso a data fim não esteja preenchida, copia a data início para somente 1 dia
                if(!data_fim){
                    
                    data_fim = data_ini;
                }  

                if (ov){
                    ST_VBCOM = {
                        VKORG : 'BRQ1',
                        ZUART : 'A',
                        TRVOG : '0',
                        STAT_DAZU : 'X',
                        NAME_DAZU : 'X',
                        KOPF_DAZU : 'X',
                        VBOFF : 'X',                        
                        VBELN: ov,                       
                    };      

                }

                if (cliente){

                    ST_VBCOM = {
                        VKORG : 'BRQ1',
                        ZUART : 'A',
                        TRVOG : '0',
                        STAT_DAZU : 'X',
                        NAME_DAZU : 'X',
                        KOPF_DAZU : 'X',
                        VBOFF : 'X',                        
                        BSTKD: cliente,
                    };      

                }

                if(!cliente && !ov)
                {
                var ST_VBCOM = {
                                VKORG : 'BRQ1',
                                ZUART : 'A',
                                TRVOG : '0',
                                STAT_DAZU : 'X',
                                NAME_DAZU : 'X',
                                KOPF_DAZU : 'X',
                                VBOFF : 'X',
                 };
                }    
                
               
               // var SELECTION_RANGE_str = {
                 //       PARAMETER: "USERNAME",
                 //       SIGN:      "I",
                  //      OPTION:    "CP",
                 //       LOW:       "A*"
                  //};	
                //var VBCOM = [SELECTION_RANGE_str];
                    
                client.connect(function(err) {
                    if (err) {
                        return console.error('could not connect to server', err);
                    }	
                    client.invoke('ZRV_SALES_DOCUMENT_VIEW_3', {
                            VBCOM: ST_VBCOM,
                            DATAINI: data_ini,
                            DATAFIM: data_fim
                            
                        },
                        function(err, res) {
                            if (err) {
                                return console.error('Error invoking ZRV_SALES_DOCUMENT_VIEW_3:', err);
                            }
                        //console.log('Result ZRV_SALES_DOCUMENT_VIEW_3:', res);
                        //console.log(JSON.stringify(res.USERLIST));
                    
                        for(let i in res.RETURN) { 
                            res_array.push({
                                vbeln: res.RETURN[i].VBELN,
                                audat: res.RETURN[i].AUDAT,
                                auart: res.RETURN[i].AUART,
                                bstnk: res.RETURN[i].BSTNK,
                                ernam: res.RETURN[i].ERNAM,
                                name1: res.RETURN[i].NAME1,
                                netwr: res.RETURN[i].NETWR,
                                statu: res.RETURN[i].STATU,
                                vkorg: res.RETURN[i].VKORG,
                                erdat: res.RETURN[i].ERDAT,
                                valdt: res.RETURN[i].WADAT,
                                zterm: res.RETURN[i].KURST,

                            });
                            //res_array.push([i,res.USERLIST[i].USERNAME]); 
                            //console.log(res.RETURN);
                         }; 
                       
                          resolve(res_array);
                          
                        });	
                });
                //promise.then(result => return result);
            })
                return promise;
       }

       async getFIARPaymentsRFC(bapi,data_ini,data_fim,cliente,nfe)
     {
        var objects = [];
        var res_array = [];     

        const promise = new Promise((resolve, reject) => {
             
            "use strict";
                var rfc = require('node-rfc');
                var abapSystem = this.getSAPR3ConnectionString();
                var client = new rfc.Client(abapSystem);
                var MAX_ROWS = 999;
                
                if(!data_ini){
                    data_ini = '19000101';
                    data_fim = '19000101';
                }  
                //caso a data fim não esteja preenchida, copia a data início para somente 1 dia
                if(!data_fim){
                    
                    data_fim = data_ini;
                }                
                
                if(!cliente){
                    cliente = '';
                }

                if(!nfe){
                    nfe = '';
                }
               
               // var SELECTION_RANGE_str = {
                 //       PARAMETER: "USERNAME",
                 //       SIGN:      "I",
                  //      OPTION:    "CP",
                 //       LOW:       "A*"
                  //};	
                //var VBCOM = [SELECTION_RANGE_str];
                    
                client.connect(function(err) {
                    if (err) {
                        return console.error('could not connect to server', err);
                    }	
                    client.invoke('ZFIAR_REPORT_PORTAL_OUTPUT', {
                            P_KUNNR:cliente,
                            PNFENUM:nfe,
                            DTINI:data_ini,
                            DTFIM:data_fim,                          
                            
                        },
                        function(err, res) {
                            if (err) {
                                return console.error('Error invoking ZFIAR_REPORT_PORTAL_OUTPUT:', err);
                            }
                        console.log('Result ZFIAR_REPORT_PORTAL_OUTPUT:', res);
                        //console.log(JSON.stringify(res.USERLIST));
                    
                        for(let i in res.RETURN) { 
                            res_array.push({
                                nfnum: res.RETURN[i].NFNUM,
                                docdat: res.RETURN[i].DOCDAT,
                                stcd1: res.RETURN[i].STCD1,
                                statusnf: res.RETURN[i].STATUSNF,
                                candat: res.RETURN[i].CANDAT,
                                nftot: res.RETURN[i].NFTOT,
                                statuspag: res.RETURN[i].STATUSPAG,
                                augdt: res.RETURN[i].AUGDT,
                                augbl: res.RETURN[i].AUGBL,
                                wrbtr: res.RETURN[i].WRBTR,
                                zfbdt: res.RETURN[i].ZFBDT,
                                parid: res.RETURN[i].PARID,
                                name1: res.RETURN[i].NAME1,
                                cnpj: res.RETURN[i].TXT_CPF_CNPJ,
                                refkey: res.RETURN[i].REFKEY,
                                werks:res.RETURN[i].WERKS,
                                maktx:res.RETURN[i].MAKTX,
                                projk:res.RETURN[i].PROJK,
                                post1:res.RETURN[i].POST1,
                                sgtxt:res.RETURN[i].SGTXT,
                                belnr_reclas:res.RETURN[i].BELNR_RECLAS,
                                pep_reclas:res.RETURN[i].PEP_RECLASS,
                                post1_reclas:res.RETURN[i].POST1_RECLAS,
                                vlr_liquido:res.RETURN[i].VLR_LIQUIDO,
                                vlr_pago:res.RETURN[i].VLR_PAGO,
                                vlr_proj_atual:res.RETURN[i].VLR_PROJ_ATUAL,

                            });
                            //res_array.push([i,res.USERLIST[i].USERNAME]); 
                            //console.log(res.RETURN);
                         }; 
                       
                          resolve(res_array);
                          
                        });	
                });
                //promise.then(result => return result);
            })
                return promise;
       }

       async getSalesOrderTextsRFC(bapi,data_ini,data_fim,cliente,ov)
       {
                    
          var texts_array = [];
  
          const promise = new Promise((resolve, reject) => {
               
              "use strict";
                  var rfc = require('node-rfc');
                  var abapSystem = this.getSAPR3ConnectionString();
                  var client = new rfc.Client(abapSystem);
                  var MAX_ROWS = 999;
                
                  if(!data_ini){
                      data_ini = '19000101';
                      data_fim = '19000101';
                  }  
                  //caso a data fim não esteja preenchida, copia a data início para somente 1 dia
                  if(!data_fim){
                      
                      data_fim = data_ini;
                  }  
  
                  if (ov){
                      ST_VBCOM = {
                          VKORG : 'BRQ1',
                          ZUART : 'A',
                          TRVOG : '0',
                          STAT_DAZU : 'X',
                          NAME_DAZU : 'X',
                          KOPF_DAZU : 'X',
                          VBOFF : 'X',                        
                          VBELN: ov,                       
                      };      
  
                  }
  
                  if (cliente){
  
                      ST_VBCOM = {
                          VKORG : 'BRQ1',
                          ZUART : 'A',
                          TRVOG : '0',
                          STAT_DAZU : 'X',
                          NAME_DAZU : 'X',
                          KOPF_DAZU : 'X',
                          VBOFF : 'X',                        
                          BSTKD: cliente,
                      };      
  
                  }
  
                  if(!cliente && !ov)
                  {
                  var ST_VBCOM = {
                                  VKORG : 'BRQ1',
                                  ZUART : 'A',
                                  TRVOG : '0',
                                  STAT_DAZU : 'X',
                                  NAME_DAZU : 'X',
                                  KOPF_DAZU : 'X',
                                  VBOFF : 'X',
                   };
                  }    
                  
                 
               
                  client.connect(function(err) {
                      if (err) {
                          return console.error('could not connect to server', err);
                      }	
                      client.invoke('ZRV_SALES_DOCUMENT_VIEW_3', {
                              VBCOM: ST_VBCOM,
                              DATAINI: data_ini,
                              DATAFIM: data_fim
                              
                          },
                          function(err, res) {
                              if (err) {
                                  return console.error('Error invoking ZRV_SALES_DOCUMENT_VIEW_3:', err);
                              }
                        
                                                
                           for(let i in res.IT_TXT) { 
                              texts_array.push({
                                  object: res.IT_TXT[i].OBJECTREFKEY,
                                  text: res.IT_TXT[i].TEXT_ID,
                                  text_line: res.IT_TXT[i].TEXT_LINE,                          
                              });
                              
                              //console.log(res.IT_TXT);
                           }; 
                            
                            resolve(texts_array);
                          });	
                  });
                  //promise.then(result => return result);
              })
                  return promise;
         }

       async getSalesMaterialRFC(bapi,matnr,maktx,ctitem,werks)
      {
        var objects = [];

        var res_array = [];
        const promise = new Promise((resolve, reject) => {
             
            "use strict";
                var rfc = require('node-rfc');
                var abapSystem = this.getSAPR3ConnectionString();
                var client = new rfc.Client(abapSystem);
                var MAX_ROWS = 999;                                                           
                var ST_IN_MAT = { };

                //SELECIONA SOMENTE MATERIAIS DE VENDA
                var SELECTION_RANGE_str = {                     
                       SIGN:      "I",
                       OPTION:    "CP",
                       MATNR_LOW: "BRQ9*",

                };	
                
                if(matnr){
                    ST_IN_MAT = {
                    MATNR : matnr
                    
                 }
                };

                if(maktx){
                     ST_IN_MAT = {
                        MAKTX: maktx
                        
                     }
                };

                if(ctitem){
                       ST_IN_MAT = {
                        MTPOS_MARA: ctitem
                        
                     }
                };

                
                if(werks){
                     ST_IN_MAT = {
                        VKORG: werks
                        
                     }
                };
                  
                var MATNRSELECTION = [SELECTION_RANGE_str];
                    
                client.connect(function(err) {
                    if (err) {
                        return console.error('could not connect to server', err);
                    }	
                    client.invoke('ZBAPI_MATERIAL_GETLIST', {
                            MTART:'YSER',
                            IN_MAT:ST_IN_MAT                           
                            
                        },
                        function(err, res) {
                            if (err) {
                                return console.error('Error invoking BAPI_MATERIAL_GETLIST:', err);
                            }
                       // console.log('Result BAPI_MATERIAL_GETLIST:', res);
                        //console.log(JSON.stringify(res.USERLIST));
                    
                        for(let i in res.RETURN) { 
                            res_array.push({
                                matnr: res.RETURN[i].MATNR,
                                maktx: res.RETURN[i].MAKTX,
                                meins: res.RETURN[i].MEINS,
                                mtpos_mara: res.RETURN[i].MTPOS_MARA,
                                vkorg: res.RETURN[i].VKORG,
                                steuc: res.RETURN[i].STEUC,
                                bklas: res.RETURN[i].BKLAS,
                                ersda: res.RETURN[i].ERSDA,
                                ernam: res.RETURN[i].ERNAM                                

                            });
                            //res_array.push([i,res.USERLIST[i].USERNAME]); 
                            //console.log(res.RETURN);
                         }; 
                          resolve(res_array);
                        });	
                });
                //promise.then(result => return result);
            })
                return promise;
       }

       async getSalesConditionsRFC(bapi)
       {
         var objects = [];
 
         var res_array = [];
         const promise = new Promise((resolve, reject) => {
              
             "use strict";
                 var rfc = require('node-rfc');
                 var abapSystem = this.getSAPR3ConnectionString();
                 var client = new rfc.Client(abapSystem);
                 var MAX_ROWS = 999;                                                           
                 var ST_IN_MAT = { };
                 
                     
                 client.connect(function(err) {
                     if (err) {
                         return console.error('could not connect to server', err);
                     }	
                     client.invoke('ZME_VALUES_T052', {
                             I_KOART:'D'                                                          
                         },
                         function(err, res) {
                             if (err) {
                                 return console.error('Error invoking ZME_VALUES_T052:', err);
                             }
                        
                     
                         for(let i in res.RETURN) { 
                             res_array.push({
                                 zterm: res.RETURN[i].ZTERM,
                                 vtext: res.RETURN[i].VTEXT,                                                            
 
                             });
                             
                             //console.log(res.RETURN);
                          }; 
                           resolve(res_array);
                         });	
                 });
                 //promise.then(result => return result);
             })
                 return promise;
        }

    //-------------------------------------------------------------------------------------- Funções exportadas
    //Funções contendo os selects responsáveis por retornar o resultado caso chamado

    //Usuários com filtro avançado
    async getFilterUsuarios(nome, usuario, perfil, status) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (nome == undefined || nome == '') { nome = "|"}
        if (usuario == undefined || usuario == '') { usuario = "|"}
        if (perfil == undefined || perfil == '') { perfil = "|"}
        if (status == undefined || status == '') { status = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_usuario WHERE " +
        "IFNULL(nome, '') REGEXP(REPLACE('" + nome + "', ';' , '|')) AND " +
        "IFNULL(usuario, '') REGEXP(REPLACE('" + usuario + "', ';' , '|')) AND " +
        "IFNULL(perfil, '') REGEXP(REPLACE('" + perfil + "', ';' , '|')) AND " +
        "IFNULL(status, '') REGEXP(REPLACE('" + status + "', ';' , '|')) " +
        "ORDER BY nome ASC";
        
        return this.doQuery(query)      
    }
    
    //Perfis de usuário
    async getPerfilUsuario() {
        let query = "SELECT * FROM tb_usuario_perfil ORDER BY perfil ASC";
        return this.doQuery(query)
    }

    //Ocorrências com filtro avançado
    async getFilterOcorrencias(ocorrencia,data,status_operador,fornecedor,nf,material,bloqueio,tipo,status_cliente,nota_debito) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (ocorrencia == undefined || ocorrencia == '') { ocorrencia = "|"}
        if (data == undefined || data == '') { data = "|"}
        if (status_operador == undefined || status_operador == '') { status_operador = "|"}
        if (fornecedor == undefined || fornecedor == '') { fornecedor = "|"}
        if (nf == undefined || nf == '') { nf = "|"}
        if (material == undefined || material == '') { material = "|"}
        if (bloqueio == undefined || bloqueio == '') { bloqueio = "|"}
        if (tipo == undefined || tipo == '') { tipo = "|"}
        if (status_cliente == undefined || status_cliente == '') { status_cliente = "|"}
        if (nota_debito == undefined || nota_debito == '') { nota_debito = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_recebimento_ocorrencia WHERE " +
        "IFNULL(cod, '') REGEXP(REPLACE('" + ocorrencia + "', ';' , '|')) AND " +
        "IFNULL(data_recebimento, '') REGEXP(REPLACE('" + data + "', ';' , '|')) AND " +
        "IFNULL(status_operacao, '') REGEXP(REPLACE('" + status_operador + "', ';' , '|')) AND " +
        "IFNULL(fornecedor, '') REGEXP(REPLACE('" + fornecedor + "', ';' , '|')) AND " +
        "IFNULL(nota_fiscal, '') REGEXP(REPLACE('" + nf + "', ';' , '|')) AND " +
        "IFNULL(material, '') REGEXP(REPLACE('" + material + "', ';' , '|')) AND " +
        "IFNULL(bloqueio_sistemico, '') REGEXP(REPLACE('" + bloqueio + "', ';' , '|')) AND " +
        "IFNULL(tipo_diferenca, '') REGEXP(REPLACE('" + tipo + "', ';' , '|')) AND " +
        "IFNULL(status_cliente, '') REGEXP(REPLACE('" + status_cliente + "', ';' , '|')) AND " +
        "IFNULL(status_debito, '') REGEXP(REPLACE('" + nota_debito + "', ';' , '|')) " +
        "ORDER BY cod DESC";
        
        return this.doQuery(query)      
    }

    //Transportadoras
    async getTransportadoras() {
        let query = "SELECT * FROM tb_lista_transportadora ORDER BY transportadora ASC";
        return this.doQuery(query)
    }

    //Fornecedores
    async getFornecedores() {
        let query = "SELECT * FROM tb_cadastro_fornecedor ORDER BY fornecedor ASC";
        return this.doQuery(query)
    }

    //Fornecedores com filtro avançado
    async getFilterFornecedores(cod, fornecedor) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (cod == undefined || cod == '') { cod = "|"}
        if (fornecedor == undefined || fornecedor == '') { fornecedor = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_cadastro_fornecedor WHERE " +
        "IFNULL(codigo, '') REGEXP(REPLACE('" + cod + "', ';' , '|')) AND " +
        "IFNULL(fornecedor, '') REGEXP(REPLACE('" + fornecedor + "', ';' , '|')) " +
        "ORDER BY fornecedor ASC";
        
        return this.doQuery(query)      
    }

    //Planejadores
    async getPlanejadores() {
        let query = "SELECT * FROM tb_lista_planejador ORDER BY planejador ASC";
        return this.doQuery(query)
    }

    //Materiais
    async getMateriais() {
        let query = "SELECT * FROM tb_cadastro_material ORDER BY material ASC";
        return this.doQuery(query)
    }

    //Materiais com filtro avançado
    async getFilterMateriais(pn, descricao, familia, grupo) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (pn == undefined || pn == '') { pn = "|"}
        if (descricao == undefined || descricao == '') { descricao = "|"}
        if (familia == undefined || familia == '') { familia = "|"}
        if (grupo == undefined || grupo == '') { grupo = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_cadastro_material WHERE " +
        "IFNULL(material, '') REGEXP(REPLACE('" + pn + "', ';' , '|')) AND " +
        "IFNULL(descricao, '') REGEXP(REPLACE('" + descricao + "', ';' , '|')) AND " +
        "IFNULL(familia, '') REGEXP(REPLACE('" + familia + "', ';' , '|')) AND " +
        "IFNULL(grupo, '') REGEXP(REPLACE('" + grupo + "', ';' , '|')) " +
        "ORDER BY material ASC";
        return this.doQuery(query)      
    }

    //Familias de material
    async getFamiliaMaterial() {
        let query = "SELECT * FROM tb_lista_material_familia ORDER BY familia ASC";
        return this.doQuery(query)
    }

    //Grupos de material
    async getGrupoMaterial() {
        let query = "SELECT * FROM tb_lista_material_grupo ORDER BY grupo ASC";
        return this.doQuery(query)
    }

    //Status Ocorrencia operacional
    async getStatusOperacaoOcorrencia() {
        let query = "SELECT * FROM tb_lista_status_operacao ORDER BY status_operacao ASC";
        return this.doQuery(query)
    }

    //Status Ocorrencia cliente
    async getStatusClienteOcorrencia() {
        let query = "SELECT * FROM tb_lista_status_cliente ORDER BY status_cliente ASC";
        return this.doQuery(query)
    }

    //Status Debito
    async getStatusDebito() {
        let query = "SELECT * FROM tb_lista_status_debito ORDER BY status_debito ASC";
        return this.doQuery(query)
    }

    //Status Bloqueio
    async getStatusBloqueio() {
        let query = "SELECT * FROM tb_lista_status_bloqueio ORDER BY status_bloqueio ASC";
        return this.doQuery(query)
    }

    //Qtde de novas ocorrências de divergência de recebimento
    async getNovasOcorrenciasRecebimento() {
        let query = "SELECT COUNT(cod) AS qtde_novas_ocorrencias FROM(SELECT * FROM tb_recebimento_ocorrencia WHERE status_operacao = 'Pendente' AND status_cliente = 'Pendente') AS consulta";
        return this.doQuery(query)
    }

    //Qtde de ocorrências em análise
    async getAnaliseOcorrenciasRecebimento() {
        let query = "SELECT COUNT(cod) AS qtde_ocorrencias_analise FROM(SELECT * FROM tb_recebimento_ocorrencia WHERE status_cliente <> 'Fechado' AND status_cliente <> 'Ajustado' AND status_cliente <> 'Pendente') AS consulta";
        return this.doQuery(query)
    }

    //Qtde de ocorrências Atenção operacional
    async getAtencaoOcorrenciasRecebimento() {
        let query = "SELECT COUNT(cod) AS qtde_ocorrencias_atencao FROM(SELECT * FROM tb_recebimento_ocorrencia WHERE status_operacao = 'Atencao') AS consulta";
        return this.doQuery(query)
    }

    //Qtde de ocorrências Finalizadas
    async getFinalizadaOcorrenciasRecebimento() {
        let query = "SELECT COUNT(cod) AS qtde_ocorrencias_finalizada FROM(SELECT * FROM tb_recebimento_ocorrencia WHERE status_operacao = 'Fechado' AND (status_cliente = 'Fechado' OR status_cliente = 'Ajustado')) AS consulta";
        return this.doQuery(query)
    }

    //RNCs com filtro avançado
    async getFilterRNCs(rnc,status_rnc,nf,material,status_acao,alerta,rac) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (rnc == undefined || rnc == '') { rnc = "|"}
        if (status_rnc == undefined || status_rnc == '') { status_rnc = "|"}
        if (nf == undefined || nf == '') { nf = "|"}
        if (material == undefined || material == '') { material = "|"}
        if (status_acao == undefined || status_acao == '') { status_acao = "|"}
        if (alerta == undefined || alerta == '') { alerta = "|"}
        if (rac == undefined || rac == '') { rac = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_rnc WHERE " +
        "IFNULL(numero_rnc, '') REGEXP(REPLACE('" + rnc + "', ';' , '|')) AND " +
        "IFNULL(status_rnc, '') REGEXP(REPLACE('" + status_rnc + "', ';' , '|')) AND " +
        "IFNULL(nota_fiscal, '') REGEXP(REPLACE('" + nf + "', ';' , '|')) AND " +
        "IFNULL(material, '') REGEXP(REPLACE('" + material + "', ';' , '|')) AND " +
        "IFNULL(status_plano_acao, '') REGEXP(REPLACE('" + status_acao + "', ';' , '|')) AND " +
        "IFNULL(numero_alerta_qualidade, '') REGEXP(REPLACE('" + alerta + "', ';' , '|')) AND " +
        "IFNULL(numero_rac, '') REGEXP(REPLACE('" + rac + "', ';' , '|')) " +
        "ORDER BY cod DESC";
        return this.doQuery(query)      
    }

    //Status RNC
    async getStatusRnc() {
        let query = "SELECT * FROM tb_rnc_status ORDER BY status_rnc ASC";
        return this.doQuery(query)
    }

    //Tipo de não conformidade de RNC
    async getTipoNcRnc() {
        let query = "SELECT * FROM tb_lista_rnc_tipo_nc ORDER BY tipo_nc ASC";
        return this.doQuery(query)
    }

    //Clientes
    async getClientes() {
        let query = "SELECT * FROM tb_lista_cliente ORDER BY cliente ASC";
        return this.doQuery(query)
    }

    //Assumido por (Responsabilidade final da RNC)
    async getAssumidoPorRnc() {
        let query = "SELECT * FROM tb_lista_assumido_por ORDER BY assumido_por ASC";
        return this.doQuery(query)
    }

    //Status do plano de ação da RNC
    async getStatusPlanoAcaoRnc() {
        let query = "SELECT * FROM tb_rnc_status_plano_acao ORDER BY status_plano_acao ASC";
        return this.doQuery(query)
    }

    //Status da contenção da RNC
    async getStatusContencaoRnc() {
        let query = "SELECT * FROM tb_rnc_status_contencao ORDER BY status_contencao ASC";
        return this.doQuery(query)
    }

     //Status da devolução da RNC
     async getStatusDevolucaoRnc() {
        let query = "SELECT * FROM tb_rnc_status_devolucao ORDER BY status_devolucao ASC";
        return this.doQuery(query)
    }

    //Devoluções com filtro avançado
    async getFilterDevolucao(rnc,status,nf,material,material_fisico) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (rnc == undefined || rnc == '') { rnc = "|"}
        if (status == undefined || status == '') { status = "|"}
        if (nf == undefined || nf == '') { nf = "|"}
        if (material == undefined || material == '') { material = "|"}
        if (material_fisico == undefined || material_fisico == '') { material_fisico = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_rnc WHERE gerou_devolucao = '1' AND " +
        "IFNULL(numero_rnc, '') REGEXP(REPLACE('" + rnc + "', ';' , '|')) AND " +
        "IFNULL(status_devolucao, '') REGEXP(REPLACE('" + status + "', ';' , '|')) AND " +
        "IFNULL(nota_fiscal, '') REGEXP(REPLACE('" + nf + "', ';' , '|')) AND " +
        "IFNULL(material, '') REGEXP(REPLACE('" + material + "', ';' , '|')) AND " +
        "IFNULL(material_fisico, '') REGEXP(REPLACE('" + material_fisico + "', ';' , '|')) " +
        "ORDER BY cod DESC";
        return this.doQuery(query)      
    }

    //Qtde de novas RNCs
    async getNovasRNCs() {
        let query = "SELECT COUNT(cod) AS qtde_novas_rnc FROM(SELECT * FROM tb_rnc WHERE status_rnc = 'Pendente') AS consulta";
        return this.doQuery(query)
    }

    //Qtde de RNCs em análise
    async getAnaliseRNC() {
        let query = "SELECT COUNT(cod) AS qtde_analise_rnc FROM(SELECT * FROM tb_rnc WHERE status_rnc = 'Em analise') AS consulta";
        return this.doQuery(query)
    }

    //Tempo médio de resposta no corrente ano
    async getTempoMedioRespostaFY() {
        let query = "SELECT ROUND(AVG(tempo_resposta),0) AS media_tempo_resposta FROM tb_rnc WHERE DATE_FORMAT(data_abertura, '%Y') = DATE_FORMAT(CURDATE(), '%Y')";
        return this.doQuery(query)
    }

    //RNCs finalizadas
    async getFinalizadaRNC() {
        let query = "SELECT COUNT(cod) AS qtde_finalizadas_rnc FROM(SELECT * FROM tb_rnc WHERE status_rnc = 'Procede' OR status_rnc = 'Nao procede') AS consulta";
        return this.doQuery(query)
    }

    //Tipos de veículo
    async getTipoVeiculo() {
        let query = "SELECT * FROM tb_lista_tipo_veiculo ORDER BY tipo_veiculo ASC";
        return this.doQuery(query)
    }

    //RDIs com filtro avançado
    async getFilterRDIs(rdi,data_abertura,status_rdi,documento,bloqueio,material,setor,responsavel,status_operacao) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (rdi == undefined || rdi == '') { rdi = "|"}
        if (data_abertura == undefined || data_abertura == '') { data_abertura = "|"}
        if (status_rdi == undefined || status_rdi == '') { status_rdi = "|"}
        if (documento == undefined || documento == '') { documento = "|"}
        if (bloqueio == undefined || bloqueio == '') { bloqueio = "|"}
        if (material == undefined || material == '') { material = "|"}
        if (setor == undefined || setor == '') { setor = "|"}
        if (responsavel == undefined || responsavel == '') { responsavel = "|"}
        if (status_operacao == undefined || status_operacao == '') { status_operacao = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_rdi WHERE " +
        "IFNULL(cod, '') REGEXP(REPLACE('" + rdi + "', ';' , '|')) AND " +
        "IFNULL(data_abertura, '') REGEXP(REPLACE('" + data_abertura + "', ';' , '|')) AND " +
        "IFNULL(status_rdi, '') REGEXP(REPLACE('" + status_rdi + "', ';' , '|')) AND " +
        "IFNULL(documento, '') REGEXP(REPLACE('" + documento + "', ';' , '|')) AND " +
        "IFNULL(bloqueio_sistemico, '') REGEXP(REPLACE('" + bloqueio + "', ';' , '|')) AND " +
        "IFNULL(material, '') REGEXP(REPLACE('" + material + "', ';' , '|')) AND " +
        "IFNULL(setor, '') REGEXP(REPLACE('" + setor + "', ';' , '|')) AND " +
        "IFNULL(responsavel, '') REGEXP(REPLACE('" + responsavel + "', ';' , '|')) AND " +
        "IFNULL(status_operacao, '') REGEXP(REPLACE('" + status_operacao + "', ';' , '|')) " +
        "ORDER BY cod DESC";
        return this.doQuery(query)      
    }

    //Status RDI
    async getStatusRdi() {
        let query = "SELECT * FROM tb_rdi_status ORDER BY status_rdi ASC";
        return this.doQuery(query)
    }

    //Processo RDI
    async getProcessoRdi() {
        let query = "SELECT * FROM tb_rdi_processo ORDER BY processo ASC";
        return this.doQuery(query)
    }

    //CLaim
    async getClaim() {
        let query = "SELECT * FROM tb_lista_quarter ORDER BY claim ASC";
        return this.doQuery(query)
    }

    //Causa Raiz RDI
    async getCausaRaizRdi() {
        let query = "SELECT * FROM tb_rdi_causa_raiz ORDER BY causa_raiz ASC";
        return this.doQuery(query)
    }

    //Causa Erro identificado RDI
    async getErroIdentificadoRdi() {
        let query = "SELECT * FROM tb_rdi_erro_identificado ORDER BY erro ASC";
        return this.doQuery(query)
    }

    //Setor
    async getSetor() {
        let query = "SELECT * FROM tb_lista_setor ORDER BY setor ASC";
        return this.doQuery(query)
    }

    //Turno
    async getTurno() {
        let query = "SELECT * FROM tb_lista_turno ORDER BY turno ASC";
        return this.doQuery(query)
    }

    //Status RDI Plano de ação
    async getStatusPlanoAcaoRdi() {
        let query = "SELECT * FROM tb_rdi_status_plano_acao ORDER BY status_plano_acao ASC";
        return this.doQuery(query)
    }

    //Colaboradores
    async getColaborador() {
        let query = "SELECT * FROM tb_lista_funcionario ORDER BY nome ASC";
        return this.doQuery(query)
    }

    //Dashboard  ---------------------------------------------------------------

    //SF Informações gerais com filtro avançado
    async getSFInformacoes_gerais(data,aviso,ativo) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (data == undefined || data == '') { data = "|"}
        if (aviso == undefined || aviso == '') { aviso = "|"}
        if (ativo == undefined || ativo == '') { ativo = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_sf_informacoes_gerais WHERE " +
        "IFNULL(data, '') REGEXP(REPLACE('" + data + "', ';' , '|')) AND " +
        "IFNULL(aviso_feedback, '') REGEXP(REPLACE('" + aviso + "', ';' , '|')) AND " +
        "IFNULL(ativo, '') REGEXP(REPLACE('" + ativo + "', ';' , '|')) " +
        "ORDER BY cod DESC";
        return this.doQuery(query)      
    }

    //Informações gerais (Fleg Ativo)
    async getInformacoesGerais() {
        let query = "SELECT * FROM `tb_sf_informacoes_gerais` WHERE ativo = '1' ORDER BY cod DESC";
        return this.doQuery(query)
    }

    //SF Ocorrencias com filtro avançado
    async getSFOcorrencias(cod,setor,solucao,descricao,acao,responsavel,status) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (cod == undefined || cod == '') { cod = "|"}
        if (setor == undefined || setor == '') { setor = "|"}
        if (solucao == undefined || solucao == '') { solucao = "|"}
        if (descricao == undefined || descricao == '') { descricao = "|"}
        if (acao == undefined || acao == '') { acao = "|"}
        if (responsavel == undefined || responsavel == '') { responsavel = "|"}
        if (status == undefined || status == '') { status = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_sf_ocorrencia WHERE " +
        "IFNULL(cod, '') REGEXP(REPLACE('" + cod + "', ';' , '|')) AND " +
        "IFNULL(setor, '') REGEXP(REPLACE('" + setor + "', ';' , '|')) AND " +
        "IFNULL(solucao, '') REGEXP(REPLACE('" + solucao + "', ';' , '|')) AND " +
        "IFNULL(descricao, '') REGEXP(REPLACE('" + descricao + "', ';' , '|')) AND " +
        "IFNULL(acao, '') REGEXP(REPLACE('" + acao + "', ';' , '|')) AND " +
        "IFNULL(responsavel, '') REGEXP(REPLACE('" + responsavel + "', ';' , '|')) AND " +
        "IFNULL(status, '') REGEXP(REPLACE('" + status + "', ';' , '|')) " +
        "ORDER BY cod DESC";
        return this.doQuery(query)      
    }

    //Ocorrências (< 100%)
    async getOcorrencias() {
        let query = "SELECT * FROM `tb_sf_ocorrencia` WHERE `status`< '100' ORDER BY cod DESC";
        return this.doQuery(query)
    }

    //SF Recebimento com filtro avançado
    async getSFRecebimentos(data,semana,turno) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (data == undefined || data == '') { data = "|"}
        if (semana == undefined || semana == '') { semana = "|"}
        if (turno == undefined || turno == '') { turno = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_sf_recebimento WHERE " +
        "IFNULL(data, '') REGEXP(REPLACE('" + data + "', ';' , '|')) AND " +
        "IFNULL(semana, '') REGEXP(REPLACE('" + semana + "', ';' , '|')) AND " +
        "IFNULL(turno, '') REGEXP(REPLACE('" + turno + "', ';' , '|')) " +
        "ORDER BY cod DESC";
        return this.doQuery(query)      
    }

    //Recebimento: Tabela de volumes T1 (Semana atual)
    async getVolumesT1() {
        //let query = "SELECT * FROM `tb_sf_recebimento` WHERE semana = CONCAT(WEEK(CURRENT_TIMESTAMP()), '-', YEAR(CURRENT_TIMESTAMP())) AND turno = 'T1' ORDER BY cod ASC";
        let query = "SELECT * FROM `tb_sf_recebimento`  ORDER BY cod ASC";
        return this.doQuery(query)
    }

    //Recebimento: Tabela de volumes T2 (Semana atual)
    async getVolumesT2() {
        //let query = "SELECT * FROM `tb_sf_recebimento` WHERE semana = CONCAT(WEEK(CURRENT_TIMESTAMP()), '-', YEAR(CURRENT_TIMESTAMP())) AND turno = 'T2' ORDER BY cod ASC";
         let query = "SELECT * FROM `tb_sf_recebimento`  ORDER BY cod ASC";
        return this.doQuery(query)
    }

    //Recebimento: Gráfico de linha: Tempo de stage T1 (Mes atual)
    async getChartLinhaTempoStageT1() {
        //let query = "SELECT DAY(data) AS Dia, '03:00:00' AS Meta, tempo_conferencia, tempo_inspecao FROM `tb_sf_recebimento` WHERE CONCAT(MONTH(CURRENT_TIMESTAMP()), '-', YEAR(CURRENT_TIMESTAMP())) = CONCAT(MONTH(data), '-', YEAR(DATA)) AND turno = 'T1' ORDER BY cod ASC";
        let query = "SELECT DAY(data) AS Dia, 'R$35000,00' AS Meta, tempo_conferencia, tempo_inspecao FROM `tb_sf_recebimento` WHERE turno = 'T1' ORDER BY cod ASC";
        return this.doQuery(query)
    }

    //Recebimento: Gráfico de linha: Tempo de stage T2 (Mes atual)
    async getChartLinhaTempoStageT2() {
        let query = "SELECT DAY(data) AS Dia, 'R$35000,00' AS Meta, tempo_conferencia, tempo_inspecao FROM `tb_sf_recebimento` WHERE  turno = 'T2' ORDER BY cod ASC";
        return this.doQuery(query)
    }

    //SF Recebimento com filtro avançado
    async getSFEmbalagens(data,semana,turno) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (data == undefined || data == '') { data = "|"}
        if (semana == undefined || semana == '') { semana = "|"}
        if (turno == undefined || turno == '') { turno = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_sf_embalagem WHERE " +
        "IFNULL(data, '') REGEXP(REPLACE('" + data + "', ';' , '|')) AND " +
        "IFNULL(semana, '') REGEXP(REPLACE('" + semana + "', ';' , '|')) AND " +
        "IFNULL(turno, '') REGEXP(REPLACE('" + turno + "', ';' , '|')) " +
        "ORDER BY cod DESC";
        return this.doQuery(query)      
    }

    //SF Ordens de venda - conexão com o SAP R3
    async getSFOrdemDeVenda(data,semana,turno) {
       
        var query = null;
        const res_array = []; 
        "use strict";
            var rfc = require('node-rfc');
            var abapSystem = {
                user: 'rfcbrq',
                passwd: 'rfc@brq12',
                ashost: '10.2.0.226',
                sysnr: '01',
                client: '210'
            };
            var client = new rfc.Client(abapSystem);
            var MAX_ROWS = 3;
            var SELECTION_RANGE_str = {
                    PARAMETER: "USERNAME",
                    SIGN:      "I",
                    OPTION:    "CP",
                    LOW:       "A*"
                };	
            var SELECTION_RANGE_tab = [SELECTION_RANGE_str];
                
            client.connect(function(err) {
                if (err) {
                    return console.error('could not connect to server', err);
                }	
                client.invoke('BAPI_USER_GETLIST', {
                        MAX_ROWS: MAX_ROWS,
                        SELECTION_RANGE: SELECTION_RANGE_tab
                    },
                    function(err, res) {
                        if (err) {
                            return console.error('Error invoking BAPI_USER_GETLIST:', err);
                        }
                    console.log('Result BAPI_USER_GETLIST:', res);
                    //console.log(JSON.stringify(res.USERLIST));
                
                    for(let i in res.USERLIST) { 
                        res_array.push([i,res.USERLIST[i]]); 
                        console.log(res.USERLIST[i]);
                     }; 
                    
                    });	
            });
        
            console.log(res_array);
         //return this.doQuery(res_array)  
       
        return res_array;    
    }

    //Embalagem: Gráfico de Barra: BO PE T1 (Dia atual)
    async getBOPeT1() {
        let query = "SELECT 'PE' AS Perfil, bo_objetivo_pe, bo_entrega_pe, (bo_entrega_pe/bo_objetivo_pe)*100 AS Percentual_PE FROM tb_sf_embalagem WHERE DATE_FORMAT(DATA,'%Y-%m-%d') = CURDATE() AND turno = 'T1'";
        return this.doQuery(query)
    }

    //Embalagem: Gráfico de Barra: BO Cilindro T1 (Dia atual)
    async getBOCilindroT1() {
        let query = "SELECT 'KIT Cilindro' AS Perfil, bo_objetivo_cilindro, bo_entrega_cilindro, (bo_entrega_cilindro/bo_objetivo_cilindro)*100 AS Percentual_Cilindro FROM tb_sf_embalagem WHERE DATE_FORMAT(DATA,'%Y-%m-%d') = CURDATE() AND turno = 'T1'";
        return this.doQuery(query)
    }

    //Embalagem: Gráfico de Barra: BO Outros T1 (Dia atual)
    async getBOOutrosT1() {
        let query = "SELECT 'KIT Outros' AS Perfil, bo_objetivo_outros, bo_entrega_outros, (bo_entrega_outros/bo_objetivo_outros)*100 AS Percentual_Outros FROM tb_sf_embalagem WHERE DATE_FORMAT(DATA,'%Y-%m-%d') = CURDATE() AND turno = 'T1'";
        return this.doQuery(query)
    }

    //Embalagem: Gráfico de Barra: BO PE T2 (Dia atual)
    async getBOPeT2() {
        let query = "SELECT 'PE' AS Perfil, bo_objetivo_pe, bo_entrega_pe, (bo_entrega_pe/bo_objetivo_pe)*100 AS Percentual_PE FROM tb_sf_embalagem WHERE DATE_FORMAT(DATA,'%Y-%m-%d') = CURDATE() AND turno = 'T2'";
        return this.doQuery(query)
    }

    //Embalagem: Gráfico de Barra: BO Cilindro T2 (Dia atual)
    async getBOCilindroT2() {
        let query = "SELECT 'KIT Cilindro' AS Perfil, bo_objetivo_cilindro, bo_entrega_cilindro, (bo_entrega_cilindro/bo_objetivo_cilindro)*100 AS Percentual_Cilindro FROM tb_sf_embalagem WHERE DATE_FORMAT(DATA,'%Y-%m-%d') = CURDATE() AND turno = 'T2'";
        return this.doQuery(query)
    }

    //Embalagem: Gráfico de Barra: BO Outros T1 (Dia atual)
    async getBOOutrosT2() {
        let query = "SELECT 'KIT Outros' AS Perfil, bo_objetivo_outros, bo_entrega_outros, (bo_entrega_outros/bo_objetivo_outros)*100 AS Percentual_Outros FROM tb_sf_embalagem WHERE DATE_FORMAT(DATA,'%Y-%m-%d') = CURDATE() AND turno = 'T2'";
        return this.doQuery(query)
    }

    //Embalagem: Gráfico de Linha: Setup Embalagem T1 (Mes atual)
    async getChartLinhaSetupEmbalagemT1() {
        let query = "SELECT DAY(data) AS Dia, '00:05:00' AS Meta, setup_pe, setup_cilindro, setup_outros FROM `tb_sf_embalagem` WHERE CONCAT(MONTH(CURRENT_TIMESTAMP()), '-', YEAR(CURRENT_TIMESTAMP())) = CONCAT(MONTH(data), '-', YEAR(DATA)) AND turno = 'T1' ORDER BY cod ASC";
        return this.doQuery(query)
    }

    //Embalagem: Gráfico de Linha: Setup Embalagem T2 (Mes atual)
    async getChartLinhaSetupEmbalagemT2() {
        let query = "SELECT DAY(data) AS Dia, '00:05:00' AS Meta, setup_pe, setup_cilindro, setup_outros FROM `tb_sf_embalagem` WHERE CONCAT(MONTH(CURRENT_TIMESTAMP()), '-', YEAR(CURRENT_TIMESTAMP())) = CONCAT(MONTH(data), '-', YEAR(DATA)) AND turno = 'T2' ORDER BY cod ASC";
        return this.doQuery(query)
    }

    //Embalagem: Gráfico de Linha: Takt Embalagem T1 (Mes atual)
    async getChartLinhaTaktEmbalagemT1() {
        let query = "SELECT DAY(DATA) AS Dia, '95' AS Meta, takt_pe, takt_cilindro, takt_outros FROM `tb_sf_embalagem` WHERE CONCAT(MONTH(CURRENT_TIMESTAMP()), '-', YEAR(CURRENT_TIMESTAMP())) = CONCAT(MONTH(DATA), '-', YEAR(DATA)) AND turno = 'T1' ORDER BY cod ASC";
        return this.doQuery(query)
    }

    //Embalagem: Gráfico de Linha: Takt Embalagem T2 (Mes atual)
    async getChartLinhaTaktEmbalagemT2() {
        let query = "SELECT DAY(DATA) AS Dia, '95' AS Meta, takt_pe, takt_cilindro, takt_outros FROM `tb_sf_embalagem` WHERE CONCAT(MONTH(CURRENT_TIMESTAMP()), '-', YEAR(CURRENT_TIMESTAMP())) = CONCAT(MONTH(DATA), '-', YEAR(DATA)) AND turno = 'T2' ORDER BY cod ASC";
        return this.doQuery(query)
    }

    //SF Preparação com filtro avançado
    async getSFPreparacao(data,turno) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (data == undefined || data == '') { data = "|"}
        if (turno == undefined || turno == '') { turno = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_sf_preparacao WHERE " +
        "IFNULL(data, '') REGEXP(REPLACE('" + data + "', ';' , '|')) AND " +
        "IFNULL(turno, '') REGEXP(REPLACE('" + turno + "', ';' , '|')) " +
        "ORDER BY cod DESC";
        return this.doQuery(query)      
    }

    //Preparação: Tabela: Preparacao T1 (Dia atual)
    async getPreparacaoT1() {
        let query = "SELECT * FROM `tb_sf_preparacao` WHERE DATE_FORMAT(DATA,'%Y-%m-%d') = CURDATE() AND turno = 'T1' ORDER BY cod DESC LIMIT 1";
        return this.doQuery(query)
    }

    //Preparação: Tabela: Preparacao T2 (Dia atual)
    async getPreparacaoT2() {
        let query = "SELECT * FROM `tb_sf_preparacao` WHERE DATE_FORMAT(DATA,'%Y-%m-%d') = CURDATE() AND turno = 'T2' ORDER BY cod DESC LIMIT 1";
        return this.doQuery(query)
    }

    //Preparação: Grafico de linha: Setup T1 (Mes atual)
    async getSetupPreparacaoT1() {
        let query = "SELECT DAY(DATA) AS Dia, '00:02:30' AS Meta, setup FROM `tb_sf_preparacao` WHERE CONCAT(MONTH(CURRENT_TIMESTAMP()), '-', YEAR(CURRENT_TIMESTAMP())) = CONCAT(MONTH(DATA), '-', YEAR(DATA)) AND turno = 'T1' ORDER BY cod ASC";
        return this.doQuery(query)
    }

    //Preparação: Grafico de linha: Setup T2 (Mes atual)
    async getSetupPreparacaoT2() {
        let query = "SELECT DAY(DATA) AS Dia, '00:02:30' AS Meta, setup FROM `tb_sf_preparacao` WHERE CONCAT(MONTH(CURRENT_TIMESTAMP()), '-', YEAR(CURRENT_TIMESTAMP())) = CONCAT(MONTH(DATA), '-', YEAR(DATA)) AND turno = 'T2' ORDER BY cod ASC";
        return this.doQuery(query)
    }

    //SF Preparação com filtro avançado
    async getSFInventarios(data,turno) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (data == undefined || data == '') { data = "|"}
        if (turno == undefined || turno == '') { turno = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_sf_inventario WHERE " +
        "IFNULL(data, '') REGEXP(REPLACE('" + data + "', ';' , '|')) AND " +
        "IFNULL(turno, '') REGEXP(REPLACE('" + turno + "', ';' , '|')) " +
        "ORDER BY cod DESC";
        return this.doQuery(query)      
    }

    //Inventario: Tabela: Inventario T1 (Dia atual)
    async getInventarioT1() {
        let query = "SELECT * FROM `tb_sf_inventario` WHERE DATE_FORMAT(DATA,'%Y-%m-%d') = CURDATE() AND turno = 'T1' ORDER BY cod DESC LIMIT 1";
        return this.doQuery(query)
    }

    //Inventario: Tabela: Inventario T2 (Dia atual)
    async getInventarioT2() {
        let query = "SELECT * FROM `tb_sf_inventario` WHERE DATE_FORMAT(DATA,'%Y-%m-%d') = CURDATE() AND turno = 'T2' ORDER BY cod DESC LIMIT 1";
        return this.doQuery(query)
    }

    //Inventario: Grafico de linha: Faltante T1 (Mes atual)
    async getFaltanteT1() {
        let query = "SELECT DAY(DATA) AS Dia, faltante FROM `tb_sf_inventario` WHERE CONCAT(MONTH(CURRENT_TIMESTAMP()), '-', YEAR(CURRENT_TIMESTAMP())) = CONCAT(MONTH(DATA), '-', YEAR(DATA)) AND turno = 'T1' ORDER BY cod ASC";
        return this.doQuery(query)
    }

    //Inventario: Grafico de linha: Faltante T2 (Mes atual)
    async getFaltanteT2() {
        let query = "SELECT DAY(DATA) AS Dia, faltante FROM `tb_sf_inventario` WHERE CONCAT(MONTH(CURRENT_TIMESTAMP()), '-', YEAR(CURRENT_TIMESTAMP())) = CONCAT(MONTH(DATA), '-', YEAR(DATA)) AND turno = 'T2' ORDER BY cod ASC";
        return this.doQuery(query)
    }

    //SF Preparação com filtro avançado
    async getSFQualidades(data,turno) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (data == undefined || data == '') { data = "|"}
        if (turno == undefined || turno == '') { turno = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_sf_qualidade WHERE " +
        "IFNULL(data, '') REGEXP(REPLACE('" + data + "', ';' , '|')) AND " +
        "IFNULL(turno, '') REGEXP(REPLACE('" + turno + "', ';' , '|')) " +
        "ORDER BY cod DESC";
        return this.doQuery(query)      
    }

    //Qualidade: Graficos Qualidade SFM (Mes atual)
    async getQualidade() {
        let query = "SELECT *, DAY(`data`) AS Dia FROM `tb_sf_qualidade` WHERE CONCAT(MONTH(CURRENT_TIMESTAMP()), '-', YEAR(CURRENT_TIMESTAMP())) = CONCAT(MONTH(`data`), '-', YEAR(`data`)) ORDER BY cod ASC";
        return this.doQuery(query)
    }

    //Qualidade: Tabela Qualidade SFM (Dia atual)
    async getPPMatual() {
        let query = "SELECT *, DAY(`data`) AS Dia FROM `tb_sf_qualidade` WHERE CONCAT(MONTH(CURRENT_TIMESTAMP()), '-', YEAR(CURRENT_TIMESTAMP())) = CONCAT(MONTH(`data`), '-', YEAR(`data`)) ORDER BY cod DESC LIMIT 1";
        return this.doQuery(query)
    }

    //Secoes com filtro avançado
    async getFilterInformativos(data, setor, titulo, conteudo, visivel) {
        //Se campo do filtro vazio atribui "|" para ser usado no select de multipla consulta
        if (data == undefined || data == '') { data = "|"}
        if (setor == undefined || setor == '') { setor = "|"}
        if (titulo == undefined || titulo == '') { titulo = "|"}
        if (conteudo == undefined || conteudo == '') { conteudo = "|"}
        if (visivel == undefined || visivel == '') { visivel = "|"}
        
        //Select para filtar varias coisas num mesmo campo usando "texto1;texto2"
        //Porém o MySQL usa o REGEXP("texto1|texto2") para separar os textos digitados
        //Desta forma substituimos o ";" digitado pelo usuário pelo "|" usando o REPLACE abaixo
        let query = 
        "SELECT * FROM tb_sf_informativo WHERE " +
        "IFNULL(data, '') REGEXP(REPLACE('" + data + "', ';' , '|')) AND " +
        "IFNULL(setor, '') REGEXP(REPLACE('" + setor + "', ';' , '|')) AND " +
        "IFNULL(titulo, '') REGEXP(REPLACE('" + titulo + "', ';' , '|')) AND " +
        "IFNULL(conteudo, '') REGEXP(REPLACE('" + conteudo + "', ';' , '|')) AND " +
        "IFNULL(visivel, '') REGEXP(REPLACE('" + visivel + "', ';' , '|')) " +
        "ORDER BY cod DESC";
        
        return this.doQuery(query)      
    }

    //Informativos para Dashboard
    async getInformativo() {
        let query = "SELECT * FROM tb_sf_informativo WHERE visivel = 1 ORDER BY cod DESC";        
        return this.doQuery(query)      
    }


}

//Exportando esta classe
module.exports = DB;