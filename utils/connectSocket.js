import WebSocketClient from 'websocket';
import { sendErrorAlert } from './sendTelegramAlert.js';
const client = new WebSocketClient.client();

export const connectSocket = (callback) => {
    try {
        client.on('connectFailed', function (error) {
            callback({
                success: false,
                message: 'Connect Error: ' + error.toString() || 'Error!'
            })

            restart();
        });
        
        client.on('connect', function (connection) {
            console.log('WebSocket Client Connected');

            connection.on('error', function (error) {
                callback({
                    success: false,
                    message: 'Connection Error: ' + error.toString() || 'Error!'
                })

                restart();
            });
        
            connection.on('close', function () {
                console.log('Connection Closed');

                callback({
                    success: false,
                    message: 'Connection Close'
                })

                restart();
            });
        
            connection.on('message', async function (message) {
                const { tickers } = JSON.parse(message.utf8Data);

                callback({
                    success: true,
                    data: tickers
                })
            });
        });
        
        client.connect(process.env.WEB_SOCKET_URL);
    } catch (error) {
        callback({
            success: false,
            message: error.message || 'Error!'
        })

        restart();
    }
}

function restart() {
    setTimeout(() => {
        connectSocket();
    }, 2000)
}