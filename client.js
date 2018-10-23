var io = require('socket.io-client')
var fs = require('fs')
const { spawn } = require('child_process')
const { 
    cliente_name, 
    secret,
    puerto_server,
    hostname_server } = require('./config_client.js')

var hub = io(`ws://${hostname_server}:${puerto_server}`, {
    path: '/printer-connection', 
    query: {
        printer_name: cliente_name,
        secret:  secret
    }
})

/**
 * Evento en el cual el cliente recibe un requerimiento de impresion por parte del servidor
 */
hub.on('imprimir', imprimir)

hub.on('connect', () => console.log(new Date().toLocaleString(),    `[${cliente_name}] --(online)---> ws://${hostname_server}:${puerto_server}`))

hub.on('disconnect', () => console.log(new Date().toLocaleString(), `[${cliente_name}] --(offline)--> ws://${hostname_server}:${puerto_server}`))

hub.on('error', err => {
    if (typeof err === 'string' || err instanceof String) {
        setInterval(()=> {
            console.log(new Date().toLocaleString(), `Error ${err} | cierre y abra el programa o notifique a Sistemas`)
        }, 2000)
        
        hub.close() 
    } 
})

/**
 * @param {Object} request requerimiento que llega desde el servidor
 * @param {string} request.file_name Nombre del archivo
 * @param {string} request.file_base64 Data del archivo en base64
 * @param {string} request.impresora Impresora que ejecutara la accion
 * @param {Function} response_cb Funcion que enviara la respuesta al servidor
 */
async function imprimir (request, response_cb) {
    try {
        var { file_name, file_base64, impresora } = request;

        var file = await pasteFile(file_name, file_base64) //path archivo
        var data = await execScript(file, impresora) //respuesta

        console.log('EXITO', data, '\n');

        response_cb({
            exito: true, 
            data: `EXITO [codigo: ${data.code}]  [outs: ${data.outs.join(', ')}]  [errores: ${data.errores.join(', ')}]`
        })

    } catch (e) {
        if (isNaN(e.code) || e.outs === undefined || e.errores === undefined) {
            console.log('ERROR_NO_CONTROLADO', e, '\n')
            response_cb({exito: false, data: `ERROR_NO_CONTROLADO ${e}`})
        } else {
            console.log("POSIBLE_ERROR", e, '\n')
            response_cb({exito: false, data: `POSIBLE_ERROR [codigo: ${e.code}]  [outs: ${e.outs.join(', ')}]  [errores: ${e.errores.join(', ')}]`})
        }        
    } finally {
        fs.unlink(`./files/${file_name}`, e => e ? console.log('Error eliminar archivo: ', e) : '')
    }    
}

/**
 * pasteFile toma un archivo en base64 y lo copia en la carpeta files/
 * 
 * @param {string} file_name nombre del archivo a crearse
 * @param {string} file_base64 contenido del archivo en base64
 * @returns {Promise<*>} Resuelve con nombre del archivo, reject con el error
 */
function pasteFile (file_name, file_base64) {
    var bitmap = new Buffer(file_base64, 'base64');

    return new Promise((resolve, reject) => {
        fs.writeFile(`./files/${file_name}`, bitmap, err => {
            if (err) return reject(err)
            resolve(`./files/${file_name}`)
        })
    })
}

/**
 * execScript imprime un archivo (Impresoras) mediante un script de Java
 * 
 * @param {string} path localizacion del archivo a ser impreso 
 * @param {string} printer nombre de la impresora
 * @returns {Promise<{code:number, outs:[string], errores:[string]}>} Resultado de la impresion
 */
function execScript (path, printer) {
    return new Promise((resolve, reject) => {

        var outs = []
        var errores = []
        var java = spawn('javaw', [
            '-cp', 
            '".;pdfbox-app-2.0.12.jar"', 
            '-Dsun.java2d.cmm=sun.java2d.cmm.kcms.KcmsServiceProvider', //comando para un renderizado mas rapido
            'Print', 
            `PRINTER=${printer}`, 
            `FILE_PATH=${path}`
        ])
        
        console.log('\n')
        console.log(new Date().toLocaleString(), "------IMPRIMIENDO------")
        console.log("\n")

        java.stdout.on('data', data => outs.push(`${data}`))          
        java.stderr.on('data', data => errores.push(`${data}`))
        java.on('error', err => console.log('ERROR_DE_EJECUCION: '+err))        
        java.on('close', code => code === 0 ? resolve({code, outs, errores}) : reject({code, outs, errores}) )
    })
} 
