/**
 * Este nombre no se debe repetir en otros clientes, si un cliente esta conectado con ejm: pc_1_foo, las demas conexiones con ese
 * nombre seran rechazadas
 * 
 * CAMBIAR
 */
const cliente_name = 'pc_jhon_ofi_1'

//clave debe ser igual a la confgurada en el servidor. CAMBIAR
const secret = "SuperSecret1234567890passwordfoobar"

//Puerto del app que escucha en el servidor
const puerto_server = 4000

//nombre o IP del server que escucha, CAMBIAR
const hostname_server = 'companyserver.tech-corp.com'

module.exports = { 
    cliente_name, 
    secret,
    puerto_server,
    hostname_server
 }