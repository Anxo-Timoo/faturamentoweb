# ---------------------------------- #
# Criado por: Marcelo Souza #
# E-mail: mgsouza@brq.com #
# Contato: (19) 9 9799-1755          #
# PS: Não forneço suporte (perdão)   #
# ---------------------------------- #

# --------------------------------------------------------------------------------- Passo a Passo

## ATENÇÃO!
Antes de fazer qualquer coisa, leia este arquivo inteiro, a aplicação só irá rodar se você seguir corretamente o passo a passo aqui descrito. 

# WEB DASHBOARD
Projeto desenvolvido em Node.JS com banco de dados MySQL.

## Estrutura do projeto:

Pasta **database**: Aqui fica o arquivo de configuração para conexão do MySQL.
Pasta **public**: Nesta pasta ficam todos os meus arquivos públicos como imagens, css, js, etc... é nesta pasta que ficam os arquivos carregados pelo usuário no front-end.

[app.js].
**app.js**:  É o arquivo de inicialização do projeto, é nele que faço a importação dos módulos node.js, defino a porta e a rota principal para a aplicação.

[app.js->route].
Pasta **route**: É aqui que temos o arquivo de direcionamento das rotas e, é nele que defino qual rota o app deve seguir quando o usuário entra em uma determinada tela/endereço ou faz um post.

[app.js->route->dao].
Pasta  **dao**: É aqui que fica minhas rotas e é aqui que fica o CRUD (Create, Ready, Update e Delete) da aplicação. 
 -dao>listas é onde contém as consultas que levam os dados até as rotas para serem renderizadas nas telas dos gráficos

[app.js->route->dao->view].
Pasta **view**: É aqui que fica meu front-end.
 -pageLogin é a página de login
 -pageInformativo é a página com os conteúdos que ficam passando nas telas em foma de slide
 -includes é onde ficam todas as estruturas e esqueleto do nosso projeto
   -default 0-header por exemplo é onde ficam as importações de css e plugins usados no projeto e o título da página
   -default 2-anside por exemplo é onde fica o menu lateral da tela de administrativa
   -default 6-tail por exemplo é onde ficam as configurações dos plugins e funções gerais usadas no projeto
   -cadastros>inc_usuario é onde fica a tela de cadastro de usuário adicionar, editar, excluir
   -dashboard>inc_dash_logistica é onde fica todas as estruturas dos gráficos
 
## Instalações necessárias para voce iniciar:
Instale o Node JS: https://nodejs.org/en/download/
Instale o VS Code: https://code.visualstudio.com/download
instale o HeidSQL: https://www.heidisql.com/download.php?download=installer
instale o MySQL  : https://dev.mysql.com/downloads/windows/installer/8.0.html

Configure o MySQL definindo um usuário e senha (Procure passo a passo no youtube como instalar MySQL para uso local)

Reinicie o Windows

## Instalando as dependências:

Coloque a pasta do projeto contendo todo código fonte deste projeto na máquina que será utilizada como servidor do Node.JS/MySQL, geralmente eu crio uma partição no HD e coloco a pasta do projeto nesta partição, mas você pode colocar numa pasta de sua preferência.

Com o cmd aberto dentro da pasta raiz do projeto execute: `npm install`.

Após instalação do npm entre no arquivo **package.json** e veja todos os módulos que necessitam instalação, caso necessite instalar algum individualmente execute: npm install --save modulo_a_instalar_aqui.

Agora instale o nodemon, execute: `npm install -g nodemon`.

Faça a instalação do Redis nesta mesma máquina (servidor), para SO Windows faça a instalação do executável mantido pela microsoft disponível neste endereço: https://github.com/microsoftarchive/redis/releases.

Abra o HeidSQL e rode o script para criação do BD no seu servidor MySQL, o script está na pasta **database**.

Configure a conexão ao BD (pasta database)

Inicie sua aplicação executando o comando: `nodemon app.js`.

Na máquina servidor acesse a aplicação pelo endereço: `http://localhost:3000/`.
Em outras máquinas da rede acesse a aplicação pelo nome ou IP da máquina servidor definido na rede, exemplo `http://JDM090:3000/`.

Observação:
    - Se aparecer algum erro "module not found", é porque precisa instalar algum módulo necessário
    - Dê "CTRL+C" para resetar o cmd e instale o módulo solicitado utilizando o comando: npm install digite-nome-do-módulo-faltante-aqui

### PLUS - Informações adicionais:
Para que o servidor node fique rodando 24h e reinicie automaticamente caso ocorra algum erro na rede, queda do mysql ou queda de energia, utilize o PM2: https://pm2.keymetrics.io/docs/usage/quick-start/.

**Instalando o PM2**
Na máquina servidor, abrir CMD como **administrador** na pasta do projeto.
Execute: npm install -save pm2@latest -g
Execute: npm install --save pm2-windows-startup -g
Execute: pm2-startup install

**Configurando e salvando o PM2**
Execute: pm2 start app.js
Execute: pm2 save

**Pronto!**
Para ver os processos execute: pm2 status
Para ver o log execute: pm2 logs
Para abrir monitor dashboard execute: pm2 monit
Para parar o processo execute: pm2 stop all
Para reiniciar o processo execute: pm2 restart all
Para deletar um processo salvo: pm2 delete id_do_processo_aqui

**Comandos comuns:**
pm2 start app.js
pm2 restart all
pm2 reload all
pm2 stop all

**Atenção**
Para gerar uma execução assistida, ou seja, reinicio automático do node sempre que houver alguma alteração no código fonte ou arquivos da pasta do projeto execute: pm2 start app.js --watch.

Cuidado! Esta execução reiniciará o servidor sempre que alguém adicionar/alterar uma foto das telas, para parar este processo
execute: pm2 stop 0 --watch.

**ngrok**
Aplicativo que permite compartilhar sua aplicação na WEB externa sem necessidade de servidor ou domínio BR.
Faça o download do executável: https://dashboard.ngrok.com/get-started/setup.
Coloque o executável dentro da pasta raiz do projeto.
Pelo CMD se a aplicação não estiver rodando, rode a aplicação.
Ainda no CMD execute: ngrok http 3000.
Será disponibilizado um link publico na WEB para sua aplicação local.
