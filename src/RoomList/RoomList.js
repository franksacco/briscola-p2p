import React from "react";
import $ from "jquery";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Waiting from "../Waiting/Waiting";

class RoomList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            waiting: false,
            isLoading: true,
            rooms: []
        };
        this.onClickJoin = this.onClickJoin.bind(this);
    }

    componentDidMount() {
        $.get({
            url: "http://localhost:3003/rooms/list",
            success: (data) => {
                console.log(data);
                this.setState({
                    isLoading: false,
                    rooms: data
                });
            }
        });
    }

    onClickJoin(room) {
        let conn = this.props.peer.connect(room.masterId);
        conn.on('open', () => {
            console.log("Connected with master " + conn.peer);
            this.setState({
                waiting: true,
                connection: conn
            });
        });
        conn.on('error', (error) => {
            console.log(error);
            alert("Impossibile connettersi alla partita");
        });
    }

    render() {
        if (this.state.waiting) {
            return (
                <Waiting
                    as="slave"
                    username={this.props.username}
                    peer={this.props.peer}
                    masterConn={this.state.connection}
                />
            );
        }

        let rooms;
        if (this.state.isLoading) {
            rooms = <Spinner animation="border" variant="primary"/>;

        } else if (this.state.rooms.length === 0) {
            rooms = <i className="text-muted">Nessuna partita disponibile</i>;

        } else {
            rooms = this.state.rooms.map((room, index) => {
                return <Room room={room} key={index} onClick={this.onClickJoin} />;
            });
        }

        return (
            <div className="page">
                <header className="page__header">
                    <span className="app-name">Briscola P2P</span><br/>
                    <span className="user-name">Utente: <b>{this.props.username}</b></span>
                </header>
                <main className="page__main">
                    <Card style={{width: "500px"}}>
                        <Card.Header>Partite disponibili</Card.Header>
                        <Card.Body>
                            {rooms}
                        </Card.Body>
                        <Button type="button"
                                onClick={() => this.props.back()}>Indietro
                        </Button>
                    </Card>
                </main>
            </div>
        );
    }
}
export default RoomList;

function Room(props) {
    return (
        <div className="room">
            <div className="room__left">
                {props.room.name}<br/>
                <span className="text-muted">{props.room.numPlayers} giocatori</span>
            </div>
            <Button type="button"
                onClick={() => props.onClick(props.room)}>Partecipa
            </Button>
        </div>
    );
}