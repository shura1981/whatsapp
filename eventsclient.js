
const { chatbot_Prueba1, chatbot_Prueba2, chatbot, dialogFlow_bot4 } = require("./chatbots");
const { getDate, getTime, writeMessages } = require("./utils");
const qrcode = require('qrcode-terminal');
module.exports = (client) => {


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
        chatbot(msg, client);
        chatbot_Prueba1(msg);
        chatbot_Prueba2(msg);

        // recibe las respuestas de las listas enviadas
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
        // capturar los mensajes enviados con su estado *ack*
        // console.log('estado del mensaje enviado...', body, from, to, deviceType, ack, fromMe, hasMedia, type, getDate(), getTime());
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




}