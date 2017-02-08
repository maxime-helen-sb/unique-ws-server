'use strict';
const ee = require('event-emitter');

// Note: No binary messages are allowed to be transmit to this ws server

const WebSocketServer = require('ws').Server;

module.exports = function (http_server, options) {
    const emitter = ee();

    // init variables
    let wss = null;

    if (http_server) {
        wss = new WebSocketServer({
            server: http_server,
            perMessageDeflate: false
        });
    } else if (options.port) {
        wss = new WebSocketServer({
            port: options.port,
            perMessageDeflate: false
        });
    } else {
        throw "Can't initialize ws server";
    }
    wss.on('connection', client => {
        client.on("error", () => {
            console.error('Bilrost EventBus: got socket error %j', arguments);
        });
        client.on("close", () => {
            emitter.emit("close", client);
        });
        emitter.emit("open", client);
        client.on("message", (string_msg, flags) => {
            // Check msg type
            if (flags.binary) {
                console.error('Proxy error: Binary Message received. ', string_msg);
                return;
            }
            var msg;
            try {
                msg = JSON.parse(string_msg);
            } catch (e) {
                console.error("Proxy error: Message is not JSON. Discarding malformed message: ", string_msg);
                return;
            }
            emitter.emit("message", client, msg);
        });
    });
    emitter.wss = wss;
    return emitter;
};
