const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
const { Client, List, Buttons, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const urlDirectoryMedia = '/home/steven/Imágenes/Wallpapers';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // headless: false, 
        executablePath: '/usr/bin/google-chrome-stable',
    }
});

client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});

client.on('message', async msg => {
    const { body, _data, from, to, deviceType, ack, fromMe, hasMedia, type } = msg;
    // console.log(body, _data.notifyName, from, to, deviceType, ack, fromMe, hasMedia, type, getDate(), getTime());
    // console.log('MESSAGE RECEIVED',JSON.stringify(msg));
    writeMessages({ mensaje: body, desde: from.replace('@c.us', ''), para: to.replace('@c.us', ''), name: _data.notifyName, estado: ack, dispositivo: deviceType, multimedia: hasMedia, fecha: getDate(), hora: getTime(), type })
    chatbot(msg);
    chatbot_Prueba1(msg);
    chatbot_Prueba2(msg);


    if (msg.hasQuotedMsg && type === 'list_response') {

        // console.log({ description_response: msg._data.listResponse.description, title_response: msg._data.listResponse.title });
        // console.log({ title_question: msg._data.quotedMsg.list.title, description_question: msg._data.quotedMsg.list.description });
        dialogFlow_bot4(msg);

    }

});

client.on('message_create', (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        // grabar los mensajes que se envían y a los números de destino.
        // const { body, from, to, deviceType, ack, fromMe, hasMedia, type } = msg;
        // console.log("Mensaje creado y enviado ",body, from, to, deviceType, ack, fromMe, hasMedia, type);
        // console.log('MESSAGE SENDING', JSON.stringify(msg));
    }
});

client.on('message_revoke_everyone', async (after, before) => {
    // Fired whenever a message is deleted by anyone (including you)
    console.log('mensaje eliminado message_revoke_everyone...');
    // console.log(after); // message after it was deleted.
    // const { body, _data, from, to, deviceType, ack, fromMe, hasMedia, type } = after;
    // console.log(body, _data.notifyName, from, to, deviceType, ack, fromMe, hasMedia, type, 'antes de borrar');
    if (before) {
        // console.log(before); // message before it was deleted.
        const { body, _data, from, to, deviceType, ack, fromMe, hasMedia, type } = before;
        console.log(body, _data.notifyName, from, to, deviceType, ack, fromMe, hasMedia, type, 'después de borrar');
    }
});

client.on('message_revoke_me', async (msg) => {
    // Fired whenever a message is only deleted in your own view.
    const { body, _data, from, to, deviceType, ack, fromMe, hasMedia, type } = msg;
    console.log(body, _data.notifyName, from, to, deviceType, ack, fromMe, hasMedia, type);
    console.log('mensaje eliminado por mi...');
    // console.log(msg.body); // message before it was deleted.
});

client.on('message_ack', (msg, ack) => {
    const { body, from, to, deviceType, fromMe, hasMedia, type } = msg;
    console.log('estado del mensaje enviado...', body, from, to, deviceType, ack, fromMe, hasMedia, type, getDate(), getTime());
    /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

    if (ack == 3) {
        // The message was read
    }
});

client.on('group_join', (notification) => {
    // User has joined or been added to the group.
    console.log('join', notification);
    notification.reply('User joined.');
});

client.on('group_leave', (notification) => {
    // User has left or been kicked from the group.
    console.log('leave', notification);
    notification.reply('User left.');
});

client.on('group_update', (notification) => {
    // Group picture, subject or description has been updated.
    console.log('update', notification);
});

client.on('change_state', state => {
    console.log('CHANGE STATE', state);
});

// Change to false if you don't want to reject incoming calls
let rejectCalls = true;

client.on('call', async (call) => {
    console.log('Call received, rejecting. GOTO Line 261 to disable', call);
    if (rejectCalls) await call.reject();
    await client.sendMessage(call.from, `[${call.fromMe ? 'Outgoing' : 'Incoming'}] Phone call from ${call.from}, type ${call.isGroup ? 'group' : ''} ${call.isVideo ? 'video' : 'audio'} call. ${rejectCalls ? 'This call was automatically rejected by the script.' : ''}`);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});







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
const chatbot_Prueba1 = (msg) => {
    try {
        const { body, type, _data } = msg;
        if (body.includes('Bueno') && type === 'list_response') {
            repplyMessage(msg, `Gracias *${_data.notifyName}* \nTu respuesta se tomará en cuenta para mejorar nuestro servicio.`);
        }
        else if (body.includes('Pobre') && type === 'list_response') {
            repplyMessage(msg, `Gracias *${_data.notifyName}* \nEs claro que ese mensajero no cumple con nuestra atención al cliente`);
        }
        else if (body.includes('Adecuado') && type === 'list_response') {
            repplyMessage(msg, `Gracias *${_data.notifyName}* \nVemos que no quedaste muy satisfecho con el servicio.`);
        }
        else if (body.includes('Excelente') && type === 'list_response') {
            repplyMessage(msg, `Gracias *${_data.notifyName}* \nLe daremos comisión al mensajero`);
        }
    } catch (error) {
        console.log(error.message);
    }
}
const chatbot_Prueba2 = (msg) => {
    try {
        const { body, type, _data } = msg;
        if (body.includes('Porcino') && type === 'list_response') {
            repplyMessage(msg, `Gracias *${_data.notifyName}* \nPorcino, yo creo que está más gordo`);
        }
        else if (body.includes('Gordito') && type === 'list_response') {
            repplyMessage(msg, `Gracias *${_data.notifyName}* \nYo lo veo más gordo pero si tu dices que gordito por mí está bien.`);
        }
        else if (body.includes('Marrano') && type === 'list_response') {
            repplyMessage(msg, `Gracias *${_data.notifyName}* \nLa verdad está muy marrano`);
        }
    } catch (error) {
        console.log(error.message);
    }
}

const chatbot_Prueba4 = {
    title: 'Prueba de conocimiento',
    question1: () => {
        let sections = [
            {
                title: 'Selecciona la respuesta correcta.',
                rows: [
                    { title: '1️⃣Sinefrina', description: '' },
                    { title: '2️⃣Cafeína', description: '' },
                    { title: '3️⃣Taurina', description: '' },
                    { title: '4️⃣Citrulina', description: '' }
                ]
            }
        ];
        return new List('Pregunta 1, ¿Qué ingredientes no contiene Burner Stack? Presiona en Responder para ver las opciones de respuesta', 'Responder', sections, chatbot_Prueba4.title, 'nutramerican.com');
    },
    question2: () => {
        let sections = [
            {
                title: 'Selecciona la respuesta correcta.',
                rows: [
                    { title: '1️⃣', description: 'Fortalece el sistema inmunológico' },
                    { title: '2️⃣', description: 'Estimula el gen M-tor para aumentar la síntesis de proteínas.' },
                    { title: '3️⃣', description: 'Transporta los ácidos grasos al interior de la mitocondria' },
                    { title: '4️⃣', description: 'Mejora la vasodilatación sanguínea' }
                ]
            }
        ];
        return new List('Pregunta 2, ¿Cuál es la función de la L-carnitina? Presiona en Responder para ver las opciones de respuesta', 'Responder', sections, 'Prueba de conocimiento', 'nutramerican.com');
    },
    question3: () => {
        let sections = [
            {
                title: 'Selecciona la respuesta correcta.',
                rows: [
                    { title: '1️⃣', description: 'Extracto de té amargo' },
                    { title: '2️⃣', description: 'Extracto de naranja dulce' },
                    { title: '3️⃣', description: 'Extracto de naranja amarga' }
                ]
            }
        ];
        return new List('Pregunta 3, ¿Con qué nombre se le conoce a la sinefrina? Presiona en Responder para ver las opciones de respuesta', 'Responder', sections, 'Prueba de conocimiento', 'nutramerican.com');
    },
    responses: {
        'Pregunta 1': 'Citrulina',
        'Pregunta 2': 'Transporta los ácidos grasos al interior de la mitocondria',
        'Pregunta 3': 'Extracto de naranja amarga',
    }
}
function removeEmojis(string) {
    var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    return string.replace(regex, '');
}
const dialogFlow_bot4 = async (msg) => {
    if (msg._data.quotedMsg.list.title === chatbot_Prueba4.title) {
        const question = msg._data.quotedMsg.list.description.split(',')[0];
        let list = null;
        let response = null;
        const { body, _data, from, to, deviceType, ack, fromMe, hasMedia, type } = msg;
        // console.log({ description_response: msg._data.listResponse.description, title_response: msg._data.listResponse.title });
        switch (question) {
            case 'Pregunta 1':
                response = removeEmojis(msg._data.listResponse.title);
                writeMessagesPoll({ poll: chatbot_Prueba4.title, question: 'Pregunta 1', response, desde: from.replace('@c.us', ''), para: to.replace('@c.us', ''), name: _data.notifyName, estado: ack, dispositivo: deviceType, multimedia: hasMedia, fecha: getDate(), hora: getTime(), type })
                console.log("respuesta 1: ", response);
                list = chatbot_Prueba4.question2();
                await pause(2000);
                await client.sendMessage(msg.from, list);
                break;
            case 'Pregunta 2':
                response = msg._data.listResponse.description;
                writeMessagesPoll({ poll: chatbot_Prueba4.title, question: 'Pregunta 2', response, desde: from.replace('@c.us', ''), para: to.replace('@c.us', ''), name: _data.notifyName, estado: ack, dispositivo: deviceType, multimedia: hasMedia, fecha: getDate(), hora: getTime(), type })
                console.log("respuesta 2: ", response);
                list = chatbot_Prueba4.question3();
                await pause(2000);
                await client.sendMessage(msg.from, list);
                break
            case 'Pregunta 3':
                response = msg._data.listResponse.description;
                writeMessagesPoll({ poll: chatbot_Prueba4.title, question: 'Pregunta 3', response, desde: from.replace('@c.us', ''), para: to.replace('@c.us', ''), name: _data.notifyName, estado: ack, dispositivo: deviceType, multimedia: hasMedia, fecha: getDate(), hora: getTime(), type })
                console.log("respuesta 3: ", response);
                await pause(2000);

                // buscar respuestas y dar puntuación.
                const responses = JSON.parse(fs.readFileSync(path.join('storage_messages', "storagePoll.json"), "utf-8"));
                const rs = responses.filter(item => item.poll === chatbot_Prueba4.title && item.desde === from.replace('@c.us', ''))

                const firstres1 = rs.find(item => item.question === 'Pregunta 1');
                const firstres2 = rs.find(item => item.question === 'Pregunta 2');
                const firstres3 = rs.find(item => item.question === 'Pregunta 3');

                const res1 = (firstres1.response !== chatbot_Prueba4.responses['Pregunta 1']) ? 0 : 33.333;
                const res2 = (firstres2.response !== chatbot_Prueba4.responses['Pregunta 2']) ? 0 : 33.333;
                const res3 = (firstres3.response !== chatbot_Prueba4.responses['Pregunta 3']) ? 0 : 33.333

                const puntuacion = Math.ceil((res1 + res2 + res3));

                console.log(res1, res2, res3, "puntuación", puntuacion);
                let message = '';

                if (puntuacion <= 33.333) message = 'Solo tuviste una respuesta buena. Te recomendamos que repases los ingredientes del burner stack';
                if (puntuacion <= 66, 666) message = 'Solo tuviste dos respuestas buenas. Casi logras la puntuación perfecta.';
                if (puntuacion == 100) message = 'Puntuación Perfecta. ¡Felicitaciones!';
                await client.sendMessage(msg.from, `Perfecto *${msg._data.notifyName}*. Tu puntuación es *${puntuacion}* puntos. \n${message}`);
                break
            default:
                break;
        }
    }
}

const chatbot = async (msg) => {
    if (msg.body === 'video') {
        // Send a new message as a reply to the current one
        const text = '*Connection info* https://nutramerican.com';
        const media = MessageMedia.fromFilePath('./mediaSend/load.mp4');
        client.sendMessage(msg.from, media, { caption: text || null });


        //     client.sendMessage(msg.from, `
        //     *Connection info* https://nutramerican.com
        // `, { linkPreview: true });

    } else if (msg.body === '!ping') {
        // Send a new message to the same chat

        client.sendMessage(msg.from, 'pong https://nutramerican.com');

    }

    else if (msg.body === 'url') {
        // Send a new message to the same chat

        setTimeout(async () => {
            client.sendMessage(msg.from, 'https://nutramerican.com', { linkPreview: true });


            // var locationLink = '*Ubicación* \n https://www.google.com/maps/search/?api=1&query=' + 3.5282862186431885 + ',' + -76.27495574951172;
            // let locationLink = `*Ubicación* \nhttps://maps.google.com/maps?q=${3.5282862186431885},${-76.27495574951172}&z=17&hl=en`
            // const res = await client.sendMessage(msg.from, locationLink);
            // console.log('res', res);
        }, 5000);

    }
    else if (msg.body.startsWith('!sendto ')) {
        // Direct send a new message to specific id
        let number = msg.body.split(' ')[1];
        let messageIndex = msg.body.indexOf(number) + number.length;
        let message = msg.body.slice(messageIndex, msg.body.length);
        number = number.includes('@c.us') ? number : `${number}@c.us`;
        let chat = await msg.getChat();
        chat.sendSeen();
        client.sendMessage(number, message);

    } else if (msg.body.startsWith('!subject ')) {
        // Change the group subject
        let chat = await msg.getChat();
        if (chat.isGroup) {
            let newSubject = msg.body.slice(9);
            chat.setSubject(newSubject);
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body.startsWith('!echo ')) {
        // Replies with the same message
        msg.reply(msg.body.slice(6));
    } else if (msg.body.startsWith('!desc ')) {
        // Change the group description
        let chat = await msg.getChat();
        if (chat.isGroup) {
            let newDescription = msg.body.slice(6);
            chat.setDescription(newDescription);
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body === '!leave') {
        // Leave the group
        let chat = await msg.getChat();
        if (chat.isGroup) {
            chat.leave();
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body.startsWith('!join ')) {
        const inviteCode = msg.body.split(' ')[1];
        try {
            await client.acceptInvite(inviteCode);
            msg.reply('Joined the group!');
        } catch (e) {
            msg.reply('That invite code seems to be invalid.');
        }
    } else if (msg.body === '!groupinfo') {
        let chat = await msg.getChat();
        if (chat.isGroup) {
            msg.reply(`
                *Group Details*
                Name: ${chat.name}
                Description: ${chat.description}
                Created At: ${chat.createdAt.toString()}
                Created By: ${chat.owner.user}
                Participant count: ${chat.participants.length}
            `);
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body === '!chats') {
        const chats = await client.getChats();
        client.sendMessage(msg.from, `The bot has ${chats.length} chats open.`);
    } else if (msg.body === '!info') {
        let info = client.info;
        client.sendMessage(msg.from, `
            *Connection info*
            User name: ${info.pushname}
            My number: ${info.wid.user}
            Platform: ${info.platform}
        `);
    } else if (msg.body === '!mediainfo' && msg.hasMedia) {
        const attachmentData = await msg.downloadMedia();
        msg.reply(`
            *Media info*
            MimeType: ${attachmentData.mimetype}
            Filename: ${attachmentData.filename}
            Data (length): ${attachmentData.data.length}
        `);
    } else if (msg.body === '!quoteinfo' && msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();

        quotedMsg.reply(`
            ID: ${quotedMsg.id._serialized}
            Type: ${quotedMsg.type}
            Author: ${quotedMsg.author || quotedMsg.from}
            Timestamp: ${quotedMsg.timestamp}
            Has Media? ${quotedMsg.hasMedia}
        `);
    } else if (msg.body === '!resendmedia' && msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();
        if (quotedMsg.hasMedia) {
            const attachmentData = await quotedMsg.downloadMedia();
            client.sendMessage(msg.from, attachmentData, { caption: 'Here\'s your requested media.' });
        }
    } else if (msg.body === '!location') {
        let locationLink = `*Ubicación* \nhttps://maps.google.com/maps?q=${3.5282862186431885},${-76.27495574951172}&z=17&hl=en`
        msg.reply(locationLink);
    } else if (msg.location) {
        msg.reply(msg.location);
    } else if (msg.body.startsWith('!status ')) {
        const newStatus = msg.body.split(' ')[1];
        await client.setStatus(newStatus);
        msg.reply(`Status was updated to *${newStatus}*`);
    } else if (msg.body === '!mention') {
        const contact = await msg.getContact();
        const chat = await msg.getChat();
        chat.sendMessage(`Hi @${contact.number}!`, {
            mentions: [contact]
        });
    } else if (msg.body === '!delete') {
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            if (quotedMsg.fromMe) {
                quotedMsg.delete(true);
            } else {
                msg.reply('I can only delete my own messages');
            }
        }
    } else if (msg.body === '!pin') {
        const chat = await msg.getChat();
        await chat.pin();
    } else if (msg.body === '!archive') {
        const chat = await msg.getChat();
        await chat.archive();
    } else if (msg.body === '!mute') {
        const chat = await msg.getChat();
        // mute the chat for 20 seconds
        const unmuteDate = new Date();
        unmuteDate.setSeconds(unmuteDate.getSeconds() + 20);
        await chat.mute(unmuteDate);
    } else if (msg.body === '!typing') {
        const chat = await msg.getChat();
        // simulates typing in the chat
        chat.sendStateTyping();
    } else if (msg.body === '!recording') {
        const chat = await msg.getChat();
        // simulates recording audio in the chat
        chat.sendStateRecording();
    } else if (msg.body === '!clearstate') {
        const chat = await msg.getChat();
        // stops typing or recording in the chat
        chat.clearState();
    } else if (msg.body === '!jumpto') {
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            client.interface.openChatWindowAt(quotedMsg.id._serialized);
        }
    } else if (msg.body === '!buttons') {
        let button = new Buttons('Button body', [{ body: 'bt1' }, { body: 'bt2' }, { body: 'bt3' }], 'title', 'footer');
        client.sendMessage(msg.from, button);
    } else if (msg.body === '!list') {
        let sections = [{ title: 'Nutramerican', rows: [{ title: '🥰', description: 'Excelente' }, { title: '😍', description: 'Bueno' }, { title: '☺️', description: 'Adecuado' }, { title: '😢', description: 'Pobre' }] }];
        let list = new List('¿Deseas Calificar el servicio del mensajero?', 'Calificar', sections, 'Nutramerican', 'nutramerican.com');
        client.sendMessage(msg.from, list);
    } else if (msg.body === '!reaction') {
        msg.react('👍');
    }


}
//Crear conexión
const app = express();
app.use(cors());
app.set('port', process.env.PORT || 3031);
//Configurar ruta a archivos estáticos
app.use(express.static(path.join(__dirname, 'mediaSend')));
const server = app.listen(app.get('port'), () => {
    console.log(`server  on port: , http://localhost:${app.get('port')}`);
});

// encuentas

app.get('/encuesta1', async (req, res) => {
    const { to } = req.query;

    let sections = [{ title: 'Nutramerican', rows: [{ title: '🥰', description: 'Excelente' }, { title: '😍', description: 'Bueno' }, { title: '☺️', description: 'Adecuado' }, { title: '😢', description: 'Pobre' }] }];
    let list = new List('¿Deseas Calificar el servicio del mensajero?', 'Calificar', sections, 'Nutramerican', 'nutramerican.com');
    const number = `${to}@c.us`;
    const resWs = await client.sendMessage(number, list);
    res.status(200).send({ msg: `envidado a ${to}`, payload: resWs });
})

app.get('/encuesta2', async (req, res) => {
    const { to } = req.query;

    let sections = [{ title: 'Quiz de Steven', rows: [{ title: '🐷', description: 'Marrano' }, { title: '🐖', description: 'Gordito' }, { title: '🐽', description: 'Porcino' }] }];
    let list = new List('Por favor califica que tan gordo está aramburo', 'Calificar', sections, 'Quiz de Steven', 'nutramerican.com');
    const number = `${to}@c.us`;
    const resWs = await client.sendMessage(number, list);


    res.status(200).send({ msg: `envidado a ${to}`, payload: resWs });
})

app.get('/encuesta3', async (req, res) => {
    const { to } = req.query;
    const list = chatbot_Prueba4.question1();
    const number = `${to}@c.us`;
    const resWs = await client.sendMessage(number, list);
    res.status(200).send({ msg: `envidado a ${to}`, payload: resWs });
});

// multimedia
app.get('/filesname', async (req, res) => {
    try {

        const files = await fs.promises.readdir(urlDirectoryMedia);
        res.status(200).send({ files });
    } catch (error) {
        res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
    }
})

app.get('/file', async (req, res) => {
    try {
        const { to, message, fileName } = req.query;
        const number = `${to}@c.us`;
        const media = MessageMedia.fromFilePath(`${urlDirectoryMedia}/${fileName}`);
        const payload = await client.sendMessage(number, media, { caption: message.replace(/\\n/g, '\n') || null });
        res.status(200).send({ msg: `envidado a ${to}`, payload });
    } catch (error) {
        res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
    }
})

app.get('/url', async (req, res) => {
    try {
        const { to, message, url } = req.query;
        const number = `${to}@c.us`;
        const media = await MessageMedia.fromUrl(url);
        const r = await client.sendMessage(number, media, { caption: message.replace(/\\n/g, '\n') || null });
        res.status(200).send({ msg: `envidado a ${to}`, payload: r });
    } catch (error) {
        res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
    }
})

app.get('/messaje', async (req, res) => {
    const { to, message } = req.query;
    const number = `${to}@c.us`;
    const resWs = await client.sendMessage(number, message.replace(/\\n/g, '\n'), { linkPreview: true });
    res.status(200).send({ msg: `envidado a ${to}`, payload: resWs });
})