'use strict';

const WebSocket = require('ws');
const ws_server = require("../websocket_server");
const http = require("http");
const assert = require("assert");

var http_server, http_server_bis;
var server, server_bis;
var client, client_bis;

describe("Unique ws server", () => {

    beforeEach("Create first ws server", done => {
        http_server = http.createServer(function(request, response) {
            response.writeHead(200);
            response.end();
        });
        http_server.listen(9220, () => {
            server = ws_server(http_server);
            done();
        });
    });

    beforeEach("Create second ws server", done => {
        http_server_bis = http.createServer(function(request, response) {
            response.writeHead(200);
            response.end();
        });
        http_server_bis.listen(9221, () => {
            server_bis = ws_server(http_server_bis);
            done();
        });
    });


    beforeEach("Create first ws client", done => {
        client = new WebSocket("ws://127.0.0.1:9220", { perMessageDeflate: false });
        client.on("open", () => {
            done();
        });
    });

    beforeEach("Create second ws client", done => {
        client_bis = new WebSocket("ws://127.0.0.1:9221", { perMessageDeflate: false });
        client_bis.on("open", () => {
            done();
        });
    });

    afterEach("Close first ws client", done => {
        client.on("close", () => {
            done();
        });
        client.close();
    });

    afterEach("Close second ws client", done => {
        client_bis.on("close", () => {
            done();
        });
        client_bis.close();
    });

    afterEach("Close first wss server", done => {
        server.wss.close(error => {
            http_server.close(err => {
                done(error||err);
            });
        });
    });

    afterEach("Close second wss server", done => {
        server_bis.wss.close((error) => {
            http_server_bis.close(err => {
                done(error||err);
            });
        });
    });

    it("Send message to one server", done => {
        server.on("message", (cl, message) => {
            assert.equal(message.test, true);
            done();
        });
        server_bis.on("message", (cl, message) => {
            assert.equal(message.test, true);
            done();
        });
        client.send(JSON.stringify({ test: true }));
    });

    it("Send message to the other server", done => {
        server.on("message", (cl, message) => {
            assert.equal(message.test, true);
            done();
        });
        server_bis.on("message", (cl, message) => {
            assert.equal(message.test, true);
            done();
        });
        client_bis.send(JSON.stringify({ test: true }));
    });

});
