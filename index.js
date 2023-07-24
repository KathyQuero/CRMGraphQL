//Toda la configuracion de apollo-server 

//importar apollo-server 
const { ApolloServer} = require('apollo-server');
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers');
const conectarDB = require('./config/db');
const jwt = require('jsonwebtoken');
const Usuario = require('./models/Usuario');
require('dotenv').config({path: 'variables.env' });

//conectar la base de datos
conectarDB(); 

//Servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req })=>{
        //console.log(req.headers);

       // console.log(req.headers['authorization']);
        const token = req.headers['authorization'] || "";
        if(token){
            try{
                const usuario =  jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA);
              //  console.log(usuario);
                return{
                    usuario
                }
            }catch(error){
                console.log('Hubo un error');
                console.log(error);
            }
        }
    }
});

//Arrancar el servidor 
//promise con una funcion
server.listen({ port: process.env.PORT || 4000 }).then( ({url}) => {
    console.log(`Servidor listo en la URL ${url}`)
} )