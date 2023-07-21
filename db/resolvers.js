const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido')

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: 'variables.env' });

const crearToken = (usuario, secreta, expiresIn) =>{
    //console.log(usuario);
    const{id, email, nombre, apellido} = usuario;
    return jwt.sign({id, email, nombre, apellido}, secreta, {expiresIn})
}

//Resolvers: retorna los valores que necesito - almacena la info
const resolvers= {
    Query: {
        obtenerUsuario: async(_, {}, ctx) => {
            return ctx.usuario;
        },

        obtenerProductos: async() => {
            try{
                const productos = await Producto.find({});
                return productos;
            }catch(error){
                console.log(error);
            }
        }, 

        obtenerProductoID: async(_, {id}) => {
            //Revisar si existe el producto
            const producto = await Producto.findById(id);

            if(!producto){
                throw new Error('Producto no encontrado');
            }
            return producto;
        },

        obtenerClientes: async()=>{
            try{
                const clientes = await Cliente.find({});
                return clientes;
            }catch(error){
                console.log(error);
            } 
        }, 
        obtenerClienteVendedor: async(_,{}, ctx) =>{
      //  obtenerClienteVendedor: async(_,{id}, ctx) =>{
            try{
                const clientes = await Cliente.find({vendedor: ctx.usuario.id.toString()});
                return clientes;
            }catch(error){
                console.log(error);
            } 
        }, 

        obtenerClienteID: async(_, {id}, ctx) => {
            //Revisar si existe el cliente
            const cliente = await Cliente.findById(id);
            if(!cliente){
                throw new Error('Cliente no encontrado');
            }
            //Quien lo creo lo pueda ver
            if(cliente.vendedor.toString() !== ctx.usuario.id){
                throw new Error('No tienes las credenciales');
            }
            return cliente;
        },

        obtenerPedido: async()=>{
            try{
                const pedidos = await Pedido.find({});
                return pedidos;
            }catch(error){
                console.log(error);
            } 
        }, 

        obtenerPedidoVendedor: async(_,{}, ctx) =>{
            try{
                const pedidos = await Pedido.find({vendedor: ctx.usuario.id});
                return pedidos;
            }catch(error){
                console.log(error);
            } 
        }, 

        obtenerPedidoID: async(_, {id}, ctx) => {
            //Revisar si existe el pedido
            const pedidos = await Pedido.findById(id);
            if(!pedidos){
                throw new Error('Pedido no encontrado');
            }
            //Quien lo creo lo pueda ver
            if(pedidos.vendedor.toString() !== ctx.usuario.id){
                throw new Error('No tienes las credenciales');
            }
            return pedidos;
        },

        obtenerPedidoEstado: async(_, {estado}, ctx) =>{
            const pedidos = await Pedido.find({vendedor: ctx.usuario.id, estado });
            return pedidos;

        },
        mejoresCliente: async()=>{
            const clientes = await Pedido.aggregate([
                {$match: {estado: "COMPLETADO"}},
                {"$group": {_id:"$cliente", total:{$sum : "$total"}}},
                {
                    $lookup: {
                        from: 'clientes',
                        localField: '_id',
                        foreignField: "_id",
                        as: 'cliente'
                    }
                },
                {
                    $limit: 3
                },
                {
                    $sort: {total:-1}
                }
            ]);
            return clientes;
        }, 
        mejoresVendedores: async() => {
            const vendedores = await Pedido.aggregate([
                {$match: {estado: "COMPLETADO"}},
                {"$group": {_id:"$vendedor", total:{$sum : "$total"}}},
                {
                    $lookup: {
                        from: 'usuarios',
                        localField: '_id',
                        foreignField: "_id",
                        as: 'vendedor'
                    }
                },
                {
                    $limit: 3
                },
                {
                    $sort: {total:-1}
                }
            ]);
            return vendedores
        },
        buscarProducto: async(_, {texto}) =>{
            const productos = await Producto.find({$text: {$search: texto}}).$limit(10);
            return productos;
        }

    },
    Mutation: {
        nuevoUsuario: async(_, {input}) => {
            const {email, password} = input;
            
            //Revisar si el usurario si ya esta registrado
            const existeUsuario= await Usuario.findOne({email});
            if(existeUsuario){
                throw new Error('El usuario ya se encuentra registrado');
            }

          //Hashear-cifrar la contraseña 
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);          
          try{
          //Guardar en la base de datos
            const usuario = new Usuario(input);
            usuario.save(); //guarda
            return usuario;
          }catch(error){
                console.log(error);
          }
        },

        autenticarUsuario: async (_, {input}) =>{
            
            const {email, password} = input;
            //si el usuario existe
            const existeUsuario = await Usuario.findOne({email}); 
            if(!existeUsuario){
                throw new Error('El usuario no existe');
            }
            //revisar si la contraseña es correcta 
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password);
            if(!passwordCorrecto){
                throw new Error('La contraseña es incorrecta');
            }

            //crear token
            return {
                //SE PASA EL USUARIO, PALABRA SECRETA Y EL TIEMPO DE EXPIRACION 
                token: crearToken(existeUsuario, process.env.SECRETA, '24H')
            }
        }, 
//----------------PRODUCTOS
        nuevoProducto: async(_, {input}) => {
            try{
                const producto = new Producto(input);
                //almacenar en la base de datos 
                const resultados = await producto.save();
                return resultados;
                
            } catch(error){
                console.log(error);
            }
        },

        actualizarProducto:  async(_, {id, input}) =>{
            //let para reasignar
            //Revisar si existe el producto
            let producto = await Producto.findById(id);
            if(!producto){
                throw new Error('Producto no encontrado');
            }
            //Guardar en la base de datps
            producto = await Producto.findOneAndUpdate({_id: id}, input, {new: true});

            return producto;
        }, 

        eliminarProducto: async(_, {id}) => {
             //Revisar si existe el producto
             let producto = await Producto.findById(id);
             if(!producto){
                 throw new Error('Producto no encontrado');
             }

             //Eliminar Producto 
             await Producto.findOneAndDelete({ _id : id });
             return'Producto eliminado';
        }, 

//--------------------------CLIENTE
        nuevoCliente: async(_, {input}, ctx) => {
            console.log(ctx);
            const {email} = input
            //Verificar si el cliente ya esta registrado
            //console.log(input);

            const cliente = await Cliente.findOne({email});
            if(cliente){
               throw new Error('El cliente ya esta registrado');
            } 
            const nuevoCliente = new Cliente(input);

            //Asignar el vendedor
            nuevoCliente.vendedor=ctx.usuario.id; 
            
            //

           //almacenar en la base de datos 
 
            try{
                const resultados = await nuevoCliente.save();
                return resultados;
                
            } catch(error){
                console.log(error);
            }
        },
        actualizarCliente:  async(_, {id, input}, ctx) =>{
            //let para reasignar
            //Revisar si existe el producto
            let cliente = await Cliente.findById(id);
            if(!cliente){
                throw new Error('Cliente no encontrado');
            }
            //Verificar si el vendedor es quien lo esta editando
            if(cliente.vendedor.toString() !== ctx.usuario.id){
                throw new Error('No tienes las credenciales');
            }
            //Guardar en la base de datps
            cliente = await Cliente.findOneAndUpdate({_id: id}, input, {new: true});
            return cliente;
        }, 
        eliminarCliente: async(_, {id}, ctx) => {
            //Revisar si existe el Cliente
            let cliente = await Cliente.findById(id);
            if(!cliente){
                throw new Error('Cliente no encontrado');
            }
             //Verificar si el vendedor es quien lo esta editando
             if(cliente.vendedor.toString() !== ctx.usuario.id){
                throw new Error('No tienes las credenciales');
            }
            //Eliminar Cliente 
            await Cliente.findOneAndDelete({ _id : id });
            return'Cliente eliminado';
       }, 
//--------------------------PEDIDO

            nuevoPedido: async(_, {input}, ctx) => {
            const {cliente} = input
            //Verificar si el cliente ya esta registrado
            let clienteExiste = await Cliente.findById(cliente);
            //console.log(clienteExiste);
            if(!clienteExiste){
                throw new Error('Cliente no encontrado');
            }
            //Verificar si el cliente es del vendedor
            if(clienteExiste.vendedor.toString() !== ctx.usuario.id){
                throw new Error('No tienes las credenciales');
            }            

            //Revisar el stock disponible
            //console.log(input.pedido);
            for await(const articulo of input.pedido) 
                {
                const {id} = articulo;
                const producto = await Producto.findById(id);
                if(articulo.cantidad > producto.existencia){
                    throw new Error(`El articulo ${producto.nombre} excede la cantidad disponible`);
                }else{
                    //Restar el stock
                    producto.existencia = producto.existencia - articulo.cantidad;
                    await producto.save();
                }
            } 
            //Crear un nuevo pedido
            const nuevoPedido= new Pedido(input);
            //Asignar un vendedor
            nuevoPedido.vendedor = ctx.usuario.id;

           //almacenar en la base de datos
           const resultado = await nuevoPedido.save();
           return resultado
           // return clienteExiste;
        },

        actualizarPedido: async(_, {id, input}, ctx) => {
            //Verificar si existe el pedido
            let existePedido = await Pedido.findById(id);
            if(!existePedido){
                throw new Error('Pedido no encontrado');
            }

            const {cliente} = input
            //Verificar si el cliente ya esta registrado
            let clienteExiste = await Cliente.findById(cliente);
            //console.log(clienteExiste);
            if(!clienteExiste){
                throw new Error('Cliente no encontrado');
            }
            //Verificar si el cliente es del vendedor
            if(clienteExiste.vendedor.toString() !== ctx.usuario.id){
                throw new Error('No tienes las credenciales');
            }            
            //Revisar el stock disponible
            if(input.pedido){
                for await(const articulo of input.pedido) 
                {
                const {id} = articulo;
                const producto = await Producto.findById(id);
                if(articulo.cantidad > producto.existencia){
                    throw new Error(`El articulo ${producto.nombre} excede la cantidad disponible`);
                }else{
                    //Restar el stock
                    producto.existencia = producto.existencia - articulo.cantidad;
                    await producto.save();
                }
                } 
            }
            //almacenar en la base de datos
            const resultado = await Pedido.findOneAndUpdate({_id: id}, input, {new: true});
            return resultado
        }, 
        eliminarPedido: async(_, {id}, ctx) => {
            //Verificar si existe el pedido
            let pedido = await Pedido.findById(id);
            if(!pedido){
                throw new Error('Pedido no encontrado');
            }

            //Verificar si el cliente es del vendedor
            if(pedido.vendedor.toString() !== ctx.usuario.id){
                throw new Error('No tienes las credenciales');
            }            
           //Eliminar de la base de datos
           await Pedido.findOneAndDelete({_id: id});
           return "PEDIDO ELIMINADO"
       }, 


    
    }
}

module.exports = resolvers; 