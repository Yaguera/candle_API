import { Channel, connect } from "amqplib";
import { config } from "dotenv";
import { Server } from "http";
import http from "http"
import CandleControler from "../controllers/CandleController";
import { Candle } from "../models/CandleModels";

config()

export default class CandleMessageChannel {

    private _channel!: Channel;
    private _candleCtrl: CandleControler;
    private _io: Server;

    constructor(server: http.Server) {
        this._candleCtrl = new CandleControler();
        this._io = new Server(server)
        this._io.on('connection',() => console.log('Web socket connection created'))
    }

    private async _createMessageChannel() {
        try{
            const connection = await connect(process.env.AMQP_SERVER ??'')
            this._channel = await connection.createChannel()
            this._channel.assertQueue(process.env.QUEUE_NAME ?? '')
        } catch(err){
            console.error('Connection to RabbitMQ failed', err)
        }
    }

    async consumeMessages() {
        await this._createMessageChannel()
        if(this._channel){
            const queueName = process.env.QUEUE_NAME || ''; // Garanta que queueName seja uma string válida
            this._channel.consume(queueName, async msg => {
                if (msg) {
                    const candleObj = JSON.parse(msg.content.toString());
                    console.log('Message Received');
                    console.log(candleObj);
                    this._channel.ack(msg)
    
                    const candle:Candle = candleObj
                    await this._candleCtrl.save(candle)
                    console.log('Candle saved to database')
                    this._io.emit(process.env.SOCKET_EVENT_NAME ?? '', candle)
                    console.log('New candle emited by web socket')
                }
            });
    
            console.log('Candle consumer started')
        }
    }
}