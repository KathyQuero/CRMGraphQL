
const { gql } = require('apollo-server');

//Schema:describe los tipos de datos -- codigo de graphql -- obligatorio el type query con una funcion 
const typeDefs = gql`   

     type Usuario{
          id: ID
          nombre: String
          apellido: String
          email: String
          creado: String 
     }

     type Token{
          token:String
     }

     type Producto{
          id: ID
          nombre: String
          marca: String
          existencia:Int
          precio: Float
          #creado: String 
     }

     type Cliente{
          id: ID
          nombre: String
          apellido: String
          cedula: String
          email: String
          telefono: String
          vendedor: ID
          creado: String 
     }

     type Pedido{
          id: ID
          pedido: [PedidoGrupo]
          total: Float
          cliente: ID
          vendedor: ID
          fecha: String
          estado: EstadoPedido
     }

     type PedidoGrupo{
          id :ID
          cantidad: Int
     }

     type TopCliente{
          total: Float
          cliente: [Cliente]
     }

     type TopVendedor{
          total: Float
          vendedor: [Usuario]
     }

     #INPUT---------------------------------------------
     input ProductoInput{
          nombre: String!
          marca: String!
          existencia: Int!
          precio: Float!
     }

     input UsuarioInput{
          nombre: String!
          apellido: String!
          email: String!
          password: String!
     }


     input AutenticardInput{
          email: String!
          password: String!
     }

     input ClienteInput{
          nombre: String!
          apellido: String!
          cedula: String!
          email: String!
          telefono: String!
     }

     input PedidoProductoInput{
          id: ID
          cantidad: Int
     }

     input PedidoInput{
          pedido: [PedidoProductoInput]
          total: Float
          cliente: ID
          estado: EstadoPedido
     }

     enum EstadoPedido{
          PENDIENTE
          COMPLETADO
          CANCELADO
     }



     #Query ------------------------------------------------
     type Query{
          #USUARIOS
          obtenerUsuario: Usuario

          #PRODUCTOS
          obtenerProductos: [Producto]
          obtenerProductoID(id: ID!): Producto

          #CLIENTES
          obtenerClientes: [Cliente]
          obtenerClienteVendedor: [Cliente]
          obtenerClienteID(id: ID!): Cliente

          #PEDIDOS
          obtenerPedido: [Pedido]
          obtenerPedidoVendedor: [Pedido]
          obtenerPedidoID(id: ID!): Pedido
          obtenerPedidoEstado(estado: String!): [Pedido]

          #BUSQUEDAS AVANZADA
          mejoresCliente: [TopCliente]
          mejoresVendedores: [TopVendedor]
          buscarProducto(texto:String!) :[Producto]

     }
  

     #Mutation---------------------------------------------
     type Mutation { 
          #USUARIOS
          nuevoUsuario(input: UsuarioInput): Usuario    
          autenticarUsuario(input: AutenticardInput): Token

          #PRODUCTOS
          nuevoProducto(input: ProductoInput): Producto
          actualizarProducto(id:ID!, input: ProductoInput): Producto
          eliminarProducto(id:ID!): String

          #CLIENTES
          nuevoCliente(input: ClienteInput): Cliente    
          actualizarCliente(id:ID!, input: ClienteInput): Cliente
          eliminarCliente(id:ID!): String

          #PEDIDOS
          nuevoPedido(input: PedidoInput): Pedido
          actualizarPedido(id:ID!, input: PedidoInput): Pedido
          eliminarPedido(id:ID!): String

     }
`;

module.exports = typeDefs;