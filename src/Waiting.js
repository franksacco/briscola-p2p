import React from "react";
import $ from "jquery";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import GameBoard from "./GameBoard/GameBoard";
import {TYPE_PLAYERS_READY} from "./Utility/MessageTypes";

class Waiting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playersReady: false,
            otherPeers: []
        };
        this.deleteRoom = this.deleteRoom.bind(this);
    }

    componentDidMount() {
        if (this.props.as === "master") {
            // Creazione partita sul server.
            $.post({
                url: "http://localhost:3003/rooms/add",
                data: JSON.stringify(this.props.room),
                dataType: 'json',
                success: data => console.log(data)
            });

            this.props.peer.on('connection', conn => {
                if (this.state.otherPeers.length >= this.props.room.numPlayers - 1) {
                    // Rifiuto nuova connessione.
                    console.log("Connection with peer " + conn.peer + " refused");
                    conn.close();
                    return;
                }

                console.log("Connection from: " + conn.peer);
                conn.on('open', () => {
                    let otherPeers = this.state.otherPeers;
                    otherPeers.push({
                        id: otherPeers.length + 1,
                        connection: conn
                    });
                    let state = {otherPeers: otherPeers};

                    if (otherPeers.length === this.props.room.numPlayers - 1) {
                        // Raggiunto il numero di giocatori richiesto.
                        otherPeers.forEach(peer => {
                            // Invio informazioni degli altri peer.
                            peer.connection.send(JSON.stringify({
                                type: TYPE_PLAYERS_READY,
                                data: otherPeers.map(peer => {
                                    return {
                                        id: peer.id,
                                        username: 'username', // TODO change
                                        peerId: peer.connection.peer
                                    }
                                })
                            }));
                        });
                        state = {
                            ...state,
                            playersReady: true
                        };
                        this.deleteRoom();
                    }

                    this.setState(state);
                });
            });

        } else {
            this.props.masterConn.on('data', data => {
                const msg = JSON.parse(data);
                if (msg.type === TYPE_PLAYERS_READY) {

                    // Lista degli id degli altri peer tranne il master.
                    let otherPeers = msg.data.filter(peer => peer.peerId !== this.props.peer.id);
                    // Lista delle connessioni con gli altri peer.
                    let otherPeersConnections = [
                        {id: 0, username:'username', connection: this.props.masterConn}
                    ];
                    if (otherPeersConnections.length === otherPeers.length + 1) {
                        // Abbiamo raggiunto il numero di connessioni necessarie,
                        // possiamo procedere alla Game Board.
                        this.setState({
                            playersReady: true,
                            otherPeers: otherPeersConnections
                        });
                        return;
                    }

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

                            if (otherPeersConnections.length === otherPeers.length + 1) {
                                // Abbiamo raggiunto il numero di connessioni necessarie,
                                // possiamo procedere alla Game Board.
                                this.setState({
                                    playersReady: true,
                                    otherPeers: otherPeersConnections
                                });
                            }
                        });
                    }

                    this.props.peer.on('connection', conn => {
                        if (otherPeersConnections.length >= otherPeers.length + 1) {
                            console.log("Error: too many connections");
                            conn.close();
                            return;
                        }
                        let otherPeer = otherPeers.filter(peer => conn.peer === peer.peerId);
                        if (otherPeer.length === 0) {
                            console.log("Error: invalid peer");
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

                            if (otherPeersConnections.length === otherPeers.length + 1) {
                                // Abbiamo raggiunto il numero di connessioni necessarie,
                                // possiamo procedere alla Game Board.
                                this.setState({
                                    playersReady: true,
                                    otherPeers: otherPeersConnections
                                });
                            }
                        });
                    });
                }
            });
        }
    }

    _calculateMyId(otherPeers) {
        // Id degli altri peer.
        const otherPeerIds = otherPeers.map(peer => peer.id);
        // Tutti gli id disponibili.
        const ids = [...Array(otherPeers.length + 1).keys()].map(id => id + 1);
        // Manteniamo solo quelli non presenti negli altri peer.
        return ids.filter(id => ! otherPeerIds.includes(id))[0];
    }

    deleteRoom() {
        $.post({
            url: "http://localhost:3003/rooms/remove",
            data: JSON.stringify({masterId: this.props.room.masterId}),
            dataType: 'json',
            success: (data) => console.log(data)
        });
    }

    componentWillUnmount() {
        if (this.props.as === "master") {
            // TODO bottone annulla partita
            this.deleteRoom();
        }
    }

    render() {
        if (this.state.playersReady) {
            return <GameBoard master={this.props.as === "master"}
                              otherPeers={this.state.otherPeers}
                              username={this.props.username} />;
        }

        let msg = this.props.as === "master" ?
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