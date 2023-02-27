const express = require('express');
const router = express.Router();
const { chatbot_Prueba4 } = require("./chatbots");
const { List, Buttons, MessageMedia } = require('whatsapp-web.js');
const { getName, pause } = require("./utils.js");
const fs = require('fs');
let optionsResponse = 0;

module.exports = (client) => {

    router.get('/chats', async (req, res) => {
        try {
            const { number } = req.query;
            const resWs = await client.getChats();
            let mensajes = await resWs.find(r => r.id.user == number).fetchMessages();
            res.status(200).send(mensajes.reverse());
        } catch (error) {
            res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
        }
    })
    //check number
    // router.get('/checknumber', async (req, res) => {
    //     try {
    //         const { number } = req.query;
    //         const resWs = await client.isRegisteredUser(number)
    //         res.status(200).send({ exists: resWs });
    //     } catch (error) {
    //         res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
    //     }
    // })
    // encuentas
    router.get('/encuestamensajeros', async (req, res) => {
        const { to, mensajero, cliente } = req.query;
        try {
            optionsResponse++;
            if (optionsResponse > 1) optionsResponse = 0;
            const number = `${to}@c.us`;
            let poll = null;
            if (optionsResponse === 0) {
                let sections = [{ title: '', rows: [{ title: '😐', description: 'Regular' }, { title: '😃', description: 'Bueno' }, { title: '🤩', description: 'Excelente' }] }];
                poll = new List(`¿Cómo estuvo la entrega de nuestro especialista en logística *${mensajero}*?\n 😐 😃 🤩`, 'Calificar', sections, ``, 'nutramerican.com');
                await client.sendMessage(number, `Buen día *${getName(cliente)}*. Te escribimos del call center de *MEGAPLEX*. Nos interesa su opinión sobre nuestro servicio de mensajería. \n¿Te gustaría calificar el servicio?`);
            } else {
                poll = new Buttons(`\n¿Qué tal estuvo la entrega de nuestro especialista en logística *${mensajero}*?`, [{ body: '😐 Regular' }, { body: '😃 Bueno' }, { body: '🤩 Excelente' }], `¿Te gustaría Calificar la atención al cliente?\n 😐 😃 🤩`, 'nutramerican pharma');
                await client.sendMessage(number, `Hola *${getName(cliente)}*. Te escribimos de *MEGAPLEX*. Estamos interesados en mejorar nuestro servicio.`);
            }
            await pause(2000);
            const resWs = await client.sendMessage(number, poll);
            res.status(200).send(resWs);
        } catch (error) {
            res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
        }
    })

    router.get('/encuestaramburo', async (req, res) => {
        const { to } = req.query;
        try {
            let sections = [{ title: 'Quiz de Steven', rows: [{ title: '🐷', description: 'Marrano' }, { title: '🐖', description: 'Gordito' }, { title: '🐽', description: 'Porcino' }] }];
            let list = new List('Por favor califica que tan gordo está aramburo', 'Calificar', sections, 'Quiz de Steven', 'nutramerican.com');
            const number = `${to}@c.us`;
            const resWs = await client.sendMessage(number, list);
            res.status(200).send({ msg: `envidado a ${to}`, payload: resWs });
        } catch (error) {
            res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
        }
    })


    router.get('/encuestasuplementos', async (req, res) => {
        try {
            const { to, name } = req.query;
            const list = chatbot_Prueba4.question1(name);
            const number = `${to}@c.us`;
            const resWs = await client.sendMessage(number, list);
            res.status(200).send({ msg: `envidado a ${to}`, payload: resWs });
        } catch (error) {
            res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
        }
    });
    // nombres de archivos para /file
    router.get('/filesname', async (req, res) => {
        try {
            const files = await fs.promises.readdir(process.env.URLDIRECTORYMEDIA);
            res.status(200).send({ files });
        } catch (error) {
            res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
        }
    });

    router.get('/file', async (req, res) => {
        try {
            const { to, message, fileName } = req.query;
            // const valid = await client.isRegisteredUser(to);
            // if (valid) {
            const number = `${to}@c.us`;
            const media = MessageMedia.fromFilePath(`${process.env.URLDIRECTORYMEDIA}/${fileName}`);
            const payload = await client.sendMessage(number, media, { caption: message.replace(/\\n/g, '\n') || null });
            res.status(200).send({ msg: `envidado a ${to}`, payload });
            // } else res.status(404).send({ message: 'El número de celular no se encuentra disponible' });
        } catch (error) {
            res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
        }
    });

    router.get('/url', async (req, res) => {
        try {
            const { to, message, url } = req.query;
            // const valid = await client.isRegisteredUser(to);
            // if (valid) {
            const number = `${to}@c.us`;
            const media = await MessageMedia.fromUrl(url);
            const r = await client.sendMessage(number, media, { caption: message.replace(/\\n/g, '\n') || null });
            res.status(200).send({ msg: `envidado a ${to}`, payload: r });
            // } else res.status(404).send({ message: 'El número de celular no se encuentra disponible' });
        } catch (error) {
            res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
        }
    });

    router.get('/message', async (req, res) => {
        try {
            const { to, message } = req.query;
            // const valid = await client.isRegisteredUser(to);
            // if (valid) {
            const number = `${to}@c.us`;
            const resWs = await client.sendMessage(number, message.replace(/\\n/g, '\n'), { linkPreview: true });
            res.status(200).send({ msg: `envidado a ${to}`, payload: resWs });
            // } else res.status(404).send({ message: 'El número de celular no se encuentra disponible' });
        } catch (error) {
            res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
        }
    });

    return router;
}