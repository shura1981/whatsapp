const { repplyMessage, getDate, getTime, pause, writeMessagesPoll, removeEmojis, sendNotification, responseButtons } = require("./utils");
const { List, Buttons, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');


const optionResponse = {
    regular: `Gracias por tu comentario. Tu respuesta se tomará en cuenta para mejorar nuestro servicio.\nSi tienes alguna queja o reclamo no dudes en escribirnos.`,
    bueno: `Gracias por tu comentario. Si tienes alguna sugerencia no dudes en escribirnos`,
    excelente: `Gracias por tu comentario.`
}


// chatbots
const chatbot = async (msg, client) => {
    try {
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

    } catch (error) {
        console.log(error.message);
    }

}
const chatbot_Prueba1 = async (msg) => {
    if (!(msg._data.quotedMsg.list.description.includes("Cómo estuvo la entrega de nuestro especialista en logística"))) {
        return null;
    }
    const { _data, from, to, deviceType, ack, hasMedia, type } = msg;
    let response = _data.listResponse.description.toLocaleUpperCase();

    try {
        const payload = { poll: "atención al cliente de mensajeros", question: 'Qué tal estuvo la entrega', response, desde: from.replace('@c.us', ''), para: to.replace('@c.us', ''), name: _data.notifyName, estado: ack, dispositivo: deviceType, multimedia: hasMedia, fecha: getDate(), hora: getTime(), type }
        writeMessagesPoll(payload);
        await sendNotification(payload, response);

        if (response.includes('REGULAR') && type === 'list_response') {
            repplyMessage(msg, optionResponse.regular);
        }
        else if (response.includes('BUENO') && type === 'list_response') {
            repplyMessage(msg, optionResponse.bueno);
        }
        else if (response.includes('EXCELENTE') && type === 'list_response') {
            repplyMessage(msg, optionResponse.excelente);
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
const chatbot_Prueba5 = async (msg, client) => {
    if (!(msg._data.quotedMsg.body.toLocaleLowerCase().includes("qué tal estuvo la entrega de nuestro especialista en logística"))) {
        return null;
    }

    const { _data, from, to, deviceType, ack, hasMedia, type } = msg;
    let response = responseButtons[msg.selectedButtonId];
    try {
        const payload = { poll: "atención al cliente de mensajeros", question: 'Qué tal estuvo la entrega', response, desde: from.replace('@c.us', ''), para: to.replace('@c.us', ''), name: _data.notifyName, estado: ack, dispositivo: deviceType, multimedia: hasMedia, fecha: getDate(), hora: getTime(), type }
        writeMessagesPoll(payload);
        await sendNotification(payload, response);

        if (response.includes('REGULAR') && type === 'buttons_response') {
            client.sendMessage(from, optionResponse.regular);
        }
        else if (response.includes('BUENO') && type === 'buttons_response') {
            client.sendMessage(from, optionResponse.bueno);
        }
        else if (response.includes('EXCELENTE') && type === 'buttons_response') {
            client.sendMessage(from, optionResponse.excelente);
        }
    } catch (error) {
        console.log(error.message);
    }
}
// flujos chatbots-lista de respuestas
const dialogFlow_bot4 = async (msg, client) => {
    if (msg._data.quotedMsg.list.title === chatbot_Prueba4.title) {
        const question = msg._data.quotedMsg.list.description.split(',')[0];
        let list = null;
        let response = null;
        const { _data, from, to, deviceType, ack, hasMedia, type } = msg;
        // console.log({ title_list: msg._data.quotedMsg.list.title, title_description: msg._data.quotedMsg.list.description });
        // console.log({ title_response: msg._data.listResponse.title, title_description: msg._data.listResponse.description });
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

module.exports = {
    chatbot_Prueba1, chatbot_Prueba2, chatbot_Prueba4, chatbot, dialogFlow_bot4, chatbot_Prueba5
}