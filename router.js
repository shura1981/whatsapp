const express = require('express');
const router = express.Router();
const { chatbot_Prueba4 } = require("./chatbots");
const { List, Buttons, MessageMedia } = require('whatsapp-web.js');
const { getName } = require("./utils.js");
const fs = require('fs');


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
    router.get('/checknumber', async (req, res) => {
        try {
            const { number } = req.query;
            const resWs = await client.isRegisteredUser(number)
            res.status(200).send({ exists: resWs });
        } catch (error) {
            res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
        }
    })
    // encuentas
    router.get('/encuesta1', async (req, res) => {
        const { to, mensajero, cliente } = req.query;
        try {
            let sections = [{ title: '', rows: [{ title: '😠', description: 'No me gustó' }, { title: '😐', description: 'Regular' }, { title: '😃', description: 'Bueno' }, { title: '🤩', description: 'Excelente' }] }];
            let list = new List(`Hola *${getName(cliente)}* Te escribimos de MEGAPLEX ¿Te gustaría Calificar la atención al cliente?\n😠 😐 😃 🤩`, 'Calificar', sections, 'Megaplex', 'nutramerican.com');
           
           
            let button = new Buttons(`\n¿Qué tal estuvo la entrega de nuestro especialista en logística *${mensajero}*?`, [{ body: '😐 Regular' }, { body: '😃 Bueno' }, { body: '🤩 Excelente' }], `Hola ${getName(cliente)}. Te escribimos de MEGAPLEX. ¿Te gustaría Calificar la atención al cliente?\n 😐 😃 🤩`, 'nutramerican pharma');
                   const number = `${to}@c.us`;
            const resWs = await client.sendMessage(number, button);
            // await client.sendMessage(number, `¿Qué tal estuvo la entrega del conductor *${mensajero}*?`)
            res.status(200).send({ msg: `envidado a ${to}`, payload: resWs });
        } catch (error) {
            res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
        }
    })

    router.get('/encuesta2', async (req, res) => {
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


    router.get('/encuesta3', async (req, res) => {
        try {
            const { to } = req.query;
            const list = chatbot_Prueba4.question1();
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
            const valid = await client.isRegisteredUser(to);
            if (valid) {
                const number = `${to}@c.us`;
                const media = MessageMedia.fromFilePath(`${process.env.URLDIRECTORYMEDIA}/${fileName}`);
                const payload = await client.sendMessage(number, media, { caption: message.replace(/\\n/g, '\n') || null });
                res.status(200).send({ msg: `envidado a ${to}`, payload });
            } else res.status(404).send({ message: 'El número de celular no se encuentra disponible' });
        } catch (error) {
            res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
        }
    });

    router.get('/url', async (req, res) => {
        try {
            const { to, message, url } = req.query;
            const valid = await client.isRegisteredUser(to);
            if (valid) {
                const number = `${to}@c.us`;
                const media = await MessageMedia.fromUrl(url);
                const r = await client.sendMessage(number, media, { caption: message.replace(/\\n/g, '\n') || null });
                res.status(200).send({ msg: `envidado a ${to}`, payload: r });
            } else res.status(404).send({ message: 'El número de celular no se encuentra disponible' });
        } catch (error) {
            res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
        }
    });

    router.get('/message', async (req, res) => {
        try {
            const { to, message } = req.query;
            const valid = await client.isRegisteredUser(to);
            if (valid) {
                const number = `${to}@c.us`;
                const resWs = await client.sendMessage(number, message.replace(/\\n/g, '\n'), { linkPreview: true });
                res.status(200).send({ msg: `envidado a ${to}`, payload: resWs });
            } else res.status(404).send({ message: 'El número de celular no se encuentra disponible' });
        } catch (error) {
            res.status(500).send({ message: 'ocurrió un error en el servidor', error: error.message });
        }
    });

    return router;
}