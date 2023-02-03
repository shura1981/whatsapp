const fs = require('fs');
const fetch = require('node-fetch');
/**
 * Constesta una respuesta (texto) a nuestro cliente
 * @param {*} msg objecto mensaje
 * @param {String} mensaje mensaje de respuesta
 * @param {number} millisecond pausa para ejecutar la respuesta
 */
const repplyMessage = (msg, message = 'hola', millisecond = 3000) => new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
        try {
            const res = msg.reply(message);
            console.log(` '⚡⚡⚡ Enviando mensajes....`);
            clearTimeout(timeout);
            resolve(res)
        } catch (error) {
            reject(error.message);
        }
    }, millisecond);
});
const getDate = () => new Date().toISOString().split('T')[0];
const getTime = () => new Date().toLocaleString('es-CO', { minute: 'numeric', hour: 'numeric', hour12: false });
const pause = (millisecond) => new Promise((resolve, reject) => { const h = setTimeout(() => { resolve('Finish'); clearTimeout(h) }, millisecond) });
const crearDirectorio = (dirname) => {
    try {
        const dir = fs.accessSync(dirname);
        return "el directorio ya existe";
    } catch (error) {
        //No existe el directorio. Se crea.
        try {
            fs.mkdirSync(dirname);
            return "directorio creado "
        } catch (error) { throw error; }
    }
}
const writeMessages = (msg) => {
    const pathFile = "storage_messages/storage.json";
    try {
        crearDirectorio('storage_messages');
        let storage = [];
        if (fs.existsSync(pathFile)) {
            storage = JSON.parse(fs.readFileSync(pathFile, "utf-8"));
            storage.push(msg)
            fs.writeFileSync(pathFile, JSON.stringify(storage));
            console.log("se ha actualizado el archvo");
        } else {
            storage.push(msg)
            fs.writeFileSync(pathFile, JSON.stringify(storage));
            console.log("archivo creado correctamente.");
        }

    } catch (error) {
        console.log(error.message);
    }


}
const writeMessagesPoll = (msg) => {
    const pathFile = "storage_messages/storagePoll.json";
    try {
        crearDirectorio('storage_messages');
        let storage = [];
        if (fs.existsSync(pathFile)) {
            storage = JSON.parse(fs.readFileSync(pathFile, "utf-8"));
            storage.push(msg)
            fs.writeFileSync(pathFile, JSON.stringify(storage));
            console.log("se ha actualizado el archvo");
        } else {
            storage.push(msg)
            fs.writeFileSync(pathFile, JSON.stringify(storage));
            console.log("archivo creado correctamente.");
        }

    } catch (error) {
        console.log(error.message);
    }


}
const removeEmojis = (string) => {
    var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    return string.replace(regex, '');
}
const getName = (user) => user.split(" ")[0]
const fetchPost = (url, body) => {
    const options = {
        method: 'post',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    }
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const { status, ok } = response;
                const msg = await response.json()
                reject({ status, ok, msg });
            }
            const json = await response.json();
            resolve(json);
        } catch (error) {
            reject(error.message);
        }
    });
}
const sendNotification = async (payload, response) => {
    try {
        const { poll, question, desde, para, fecha, hora, name } = payload;
        const json = {
            fecha: fecha,
            celular: Number(desde.split("57")[1]),
            calificacion: { poll, question, response, desde, para, fecha, hora, name }
        }
        const res = await fetchPost('https://www.elitenutritiongroup.com/api_eliteN/api/webservicev2.php/calificarmensajeros', json);
        console.log("respuesta", res);
    } catch (error) {
        console.log("ocurrió un error", error);
    }
}

const responseButtons={
    '0': 'REGULAR',
    '1':  'BUENO',
    '2': 'EXCELENTE'
}

module.exports = {
    repplyMessage, getDate, getTime, pause, writeMessages, writeMessagesPoll, removeEmojis, getName, fetchPost, sendNotification, responseButtons
}