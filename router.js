const express = require('express');
const router = express.Router();
const { chatbot_Prueba4 } = require("./chatbots");
const { List, Buttons, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');

module.exports = ( client ) => {

    router.get('/chats', async (req, res) => {
        const resWs = await client.getChats();
        let mensajes_verificar = await resWs[0].fetchMessages();
        res.status(200).send({ mensajes_verificar, resWs });
    })
    //check number
    router.get('/checknumber', async (req, res) => {
        const { number } = req.query;
        const resWs = await client.isRegisteredUser(number)
        res.status(200).send({ exists: resWs });
    })
    // encuentas
    router.get('/encuesta1', async (req, res) => {
        const { to } = req.query;

        let sections = [{ title: 'Nutramerican', rows: [{ title: '🥰', description: 'Excelente' }, { title: '😍', description: 'Bueno' }, { title: '☺️', description: 'Adecuado' }, { title: '😢', description: 'Pobre' }] }];
        let list = new List('¿Deseas Calificar el servicio del mensajero?', 'Calificar', sections, 'Nutramerican', 'nutramerican.com');
        const number = `${to}@c.us`;
        const resWs = await client.sendMessage(number, list);
        res.status(200).send({ msg: `envidado a ${to}`, payload: resWs });
    })
    router.get('/encuesta2', async (req, res) => {
        const { to } = req.query;

        let sections = [{ title: 'Quiz de Steven', rows: [{ title: '🐷', description: 'Marrano' }, { title: '🐖', description: 'Gordito' }, { title: '🐽', description: 'Porcino' }] }];
        let list = new List('Por favor califica que tan gordo está aramburo', 'Calificar', sections, 'Quiz de Steven', 'nutramerican.com');
        const number = `${to}@c.us`;
        const resWs = await client.sendMessage(number, list);


        res.status(200).send({ msg: `envidado a ${to}`, payload: resWs });
    })
    router.get('/encuesta3', async (req, res) => {
        const { to } = req.query;
        const list = chatbot_Prueba4.question1();
        const number = `${to}@c.us`;
        const resWs = await client.sendMessage(number, list);
        res.status(200).send({ msg: `envidado a ${to}`, payload: resWs });
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