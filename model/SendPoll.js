class SendPoll {
    constructor({ id, celular, nick, fecha, hora, mensajero }) {
        this.id = id;
        this.celular = celular;
        this.nick = nick;
        this.fecha = fecha;
        this.hora = hora;
        this.mensajero = mensajero;
    }

    static FromJson(json) {
        return new SendPoll({
            id: json['id'], celular: json['celular'], nick: json['nick'],
            fecha: json['fecha'], mensaajero: json['mensajero']
        });
    }

    static FromArray(array = []) {
        return array.map(obj => SendPoll.FromJson(obj));
    }


}

module.exports = SendPoll;