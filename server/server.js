const http = require('http');

class Room {
    name;
    numPlayers;
    masterId;

    constructor(name, numPlayers, masterId) {
        this.name = name;
        this.numPlayers = numPlayers;
        this.masterId = masterId;
    }
}

let rooms = [];

http.createServer((request, response) => {
    response.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': 'http://localhost:3000'
    });

    if (request.url === '/rooms/list' && request.method === 'GET') {
        // Lista delle stanze disponibili.
        response.end(JSON.stringify(rooms));

    } else if (request.url === "/rooms/add" && request.method === 'POST') {
        // Aggiunta di una nuova stanza.
        let body = '';
        request.on('data', (data) => {
            body += data;
        });
        request.on('end', () => {
            const data = JSON.parse(body);
            rooms.push(new Room(data.name, data.numPlayers, data.masterId));
            console.log(rooms);

            response.end(JSON.stringify({'response': 'OK'}));
        });

    } else if (request.url === '/rooms/remove' && request.method === 'POST') {
        // Rimozione delle stanze relative ad un certo masterId.
        let body = '';
        request.on('data', (data) => {
            body += data;
        });
        request.on('end', () => {
            const data = JSON.parse(body);
            rooms = rooms.filter((r) => {return r.masterId !== data.masterId});
            console.log(rooms);

            response.end(JSON.stringify({'response': 'OK'}));
        });

    } else {
        response.writeHead(404, {'Content-Type': 'application/json; charset=utf-8'});
        response.end(JSON.stringify({'response': 'Not Found'}));
    }

}).listen(3003);

console.log('Server running at http://localhost:3003/');