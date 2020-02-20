import React from "react";
import $ from "jquery";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import GameBoard from "./GameBoard/GameBoard";
import {TYPE_PLAYERS_READY} from "./Utility/MessageTypes";

/**
 * Gestione dell'attesa per l'inizio di una partita per tutti i peer.
 */
class Waiting extends React.Component {

    constructor(props) {
        super(props);
        /**
         * @type {{
         *   otherPeers: [{id: number, username: string, connection: DataConnection}],
         *   playersReady: boolean
         * }}
         */
        this.state = {
            otherPeers: [],
            playersReady: false
        };
        this._deleteRoom = this._deleteRoom.bind(this);
    }

    componentDidMount() {
        this.props.master ?
            this._masterWaiting() :
            this._peerWaiting();
    }

    /**
     * Gestione dell'attesa del master peer.
     * @private
     */
    _masterWaiting() {
        this._createMatch();

        this.props.peer.on('connection', conn => {
            if (this.state.otherPeers.length >= this.props.room.numPlayers - 1) {
                console.error("Too many connections");
                conn.close();
                return;
            }

            console.log("Connection from: " + conn.peer);
            conn.on('open', () => {
                let peers = this.state.otherPeers;
                peers.push({
                    id: peers.length + 1,
                    username: conn.metadata.username,
                    connection: conn
                });
                let state = {otherPeers: peers};

                // Controllo se si è raggiunto il numero di giocatori richiesto.
                if (peers.length === this.props.room.numPlayers - 1) {
                    let data = peers.map(peer => {
                        return {
                            id: peer.id,
                            username: peer.username,
                            peerId: peer.connection.peer
                        }
                    });
                    // Aggiungo i dati del master peer a quelli inviati in
                    // modo che sappiano anche il suo username.
                    data.push({
                        id: 0,
                        username: this.props.username,
                        peerId: this.props.peer.id
                    });
                    peers.forEach(peer => {
                        // Invio informazioni dei peer in broadcast.
                        peer.connection.send(JSON.stringify({
                            type: TYPE_PLAYERS_READY,
                            data: data
                        }));
                    });
                    state = {...state, playersReady: true};
                    this._deleteRoom();
                }

                this.setState(state);
            });
        });
    }

    /**
     * Gestione dell'attesa di un generico peer.
     * @private
     */
    _peerWaiting() {
        this.props.masterConn.on('data', data => {
            const msg = JSON.parse(data);
            if (msg.type === TYPE_PLAYERS_READY) {

                let master = msg.data.filter(peer => peer.id === 0)[0];
                // Lista degli altri peer tranne sè stessi e il master.
                let otherPeers = msg.data.filter(peer => peer.id !== 0 && peer.peerId !== this.props.peer.id);
                // Lista delle connessioni con gli altri peer.
                let otherPeersConnections = [{
                    id: 0,
                    username: master.username,
                    connection: this.props.masterConn
                }];
                this._checkForWaitingEnd(otherPeers, otherPeersConnections);

                // Effettuiamo ID - 1 connessioni agli altri peer a partire dal primo.
                const myId = this._calculateMyId(otherPeers);
                for (let i = 0; i < myId - 1; i++) {
                    let conn = this.props.peer.connect(otherPeers[i].peerId);
                    conn.on('open', () => {

                        console.log("Connected with peer " + conn.peer);
                        otherPeersConnections.push({
                            id: otherPeers[i].id,
                            username: otherPeers[i].username,
                            connection: conn
                        });
                        this._checkForWaitingEnd(otherPeers, otherPeersConnections);
                    });
                }

                this.props.peer.on('connection', conn => {
                    if (otherPeersConnections.length >= otherPeers.length + 1) {
                        console.error("Too many connections");
                        conn.close();
                        return;
                    }

                    let otherPeer = otherPeers.filter(peer => conn.peer === peer.peerId);
                    if (otherPeer.length === 0) {
                        console.error("Invalid peer");
                        conn.close();
                        return;
                    }

                    console.log("Connection from: " + conn.peer);
                    conn.on('open', () => {

                        otherPeersConnections.push({
                            id: otherPeer[0].id,
                            username: otherPeer[0].username,
                            connection: conn
                        });
                        this._checkForWaitingEnd(otherPeers, otherPeersConnections);
                    });
                });
            }
        });
    }

    /**
     * Calcolo del proprio ID a partire da quelli degli altri peer.
     * @param otherPeers {{id: number}[]}
     * @return {number}
     * @private
     */
    _calculateMyId(otherPeers) {
        // Id degli altri peer.
        const otherPeerIds = otherPeers.map(peer => peer.id);
        // Tutti gli id disponibili.
        const ids = [...Array(otherPeers.length + 1).keys()].map(id => id + 1);
        // Manteniamo solo quelli non presenti negli altri peer.
        return ids.filter(id => ! otherPeerIds.includes(id))[0];
    }

    /**
     * Controllo della condizione per l'inizio della partita.
     * @param otherPeers {{id: number, username: string, peerId: string}[]}
     *   Lista degli altri peer tranne il master.
     * @param otherPeersConnections {{id: number, username: string, connection: DataConnection}[]}
     *   Lista delle connessioni stabilite.
     * @private
     */
    _checkForWaitingEnd(otherPeers, otherPeersConnections) {
        if (otherPeersConnections.length === otherPeers.length + 1) {
            // Abbiamo raggiunto il numero di connessioni necessarie,
            // possiamo procedere alla GameBoard.
            this.setState({
                playersReady: true,
                otherPeers: otherPeersConnections
            });
        }
    }

    /**
     * Creazione della partita sul server.
     * @private
     */
    _createMatch() {
        $.post({
            url: "http://localhost:3003/rooms/add",
            data: JSON.stringify(this.props.room),
            dataType: 'json',
            success: data => console.log(data)
        });
    }

    /**
     * Eliminazione della partita dal server.
     * @private
     */
    _deleteRoom() {
        $.post({
            url: "http://localhost:3003/rooms/remove",
            data: JSON.stringify({masterId: this.props.room.masterId}),
            dataType: 'json',
            success: data => console.log(data)
        });
    }

    componentWillUnmount() {
        if (this.props.master) {
            this._deleteRoom();
        }
    }

    render() {
        if (this.state.playersReady) {
            return <GameBoard master={this.props.master}
                              otherPeers={this.state.otherPeers}
                              username={this.props.username} />;
        }

        let msg = this.props.master ?
            "In attesa di " + (this.props.room.numPlayers - this.state.otherPeers.length - 1) + " giocatori...":
            "In attesa dei giocatori...";
        return (
            <div className="page">
                <header className="page__header">
                    <span className="app-name">Briscola P2P</span><br/>
                    <span className="user-name">Utente: <b>{this.props.username}</b></span>
                </header>
                <main className="page__main">
                    <Card style={{width: "400px"}}>
                        <Card.Body>
                            <Spinner animation="border" variant="primary"/><br/>
                            {msg}
                        </Card.Body>
                    </Card>
                </main>
            </div>
        );
    }
}
export default Waiting;