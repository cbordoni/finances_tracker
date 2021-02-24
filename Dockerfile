## Comando obrigatório
## Baixa a imagem do node com versão alpine (versão mais simplificada e leve)
FROM node:alpine

## Define o local onde o app vai ficar no disco do container
## Pode ser o diretório que você quiser
WORKDIR /home/node/app

RUN  mkdir -p /home/node/app/

## Copia tudo que está no diretório onde o arquivo Dockerfile está 
## para dentro da pasta /usr/app do container
## Vamos ignorar a node_modules por isso criaremos um .dockerignore
COPY . .

RUN yarn global add node-sass uglifyjs-folder

ENV PATH="$PATH:/node_modules/.bin"

## Executa npm install para adicionar as dependências e criar a pasta node_modules
RUN yarn install

RUN rm -rf public/

RUN mkdir public/

RUN cp -r src/static/* public	

RUN node-sass src/app/scss -o public/styles

RUN uglifyjs-folder src/app/js -eo public/js 

RUN	node app