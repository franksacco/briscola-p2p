import React from "react";
import $ from "jquery";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import GameBoard from "../GameBoard/GameBoard";
import {TYPE_PLAYERS_READY} from "../Utility/Message";

class Waiting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playersReady: false,
            connections: []
        };
        this.deleteRoom = this.deleteRoom.bind(this);
    }

    componentDidMount() {
        if (this.props.as === "master") {
            $.post({
                url: "http://localhost:3003/rooms/add",
                data: JSON.stringify(this.props.room),
                dataType: 'json',
                success: (data) => console.log(data)
            });

            this.props.peer.on('connection', c => {
                if (this.state.connections.length >= this.props.room.numPlayers - 1) {
                    // Rifiuto nuova connessione.
                    console.log("Connection with peer " + c.peer + " refused");
                    c.close();
                    return;
                }

                console.log("Connection from: " + c.peer);
                c.on('open', () => {
                    let connections = this.state.connections;
                    connections.push(c);
                    let state = {connections: connections};

                    if (connections.length === this.props.room.numPlayers - 1) {
                        connections.forEach(conn => {
                            conn.send(JSON.stringify({
                                type: TYPE_PLAYERS_READY,
                                data: connections.map(c => c.peer)
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
                    let connections = msg.data
                        .filter(peerId => peerId !== this.props.peer.id)
                        .map(peerId => {
                            let conn = this.props.peer.connect(peerId);
                            conn.on('open', () => console.log("Connected with peer " + conn.peer));
                            return conn;
                        });
                    connections.push(this.props.masterConn);
                    this.setState({
                        playersReady: true,
                        connections: connections
                    });
                }
            });
        }
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
            this.deleteRoom();
        }
    }

    render() {
        if (this.state.playersReady) {
            return <GameBoard connections={this.state.connections} />;
        }

        let msg = this.props.as === "master" ?
            "In attesa di " + (this.props.room.numPlayers - this.state.connections.length - 1) + " giocatori...":
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