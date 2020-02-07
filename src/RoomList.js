import React from "react";
import $ from "jquery";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Waiting from "./Waiting";
import Alert from "react-bootstrap/Alert";

class RoomList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            waiting: false, // Waiting for game start.
            loading: true,  // Loading room list.
            error: null,
            rooms: []
        };
        this.onClickJoin = this.onClickJoin.bind(this);
    }

    componentDidMount() {
        $.get(
            "http://localhost:3003/rooms/list",
            data => this.setState({rooms: data})
        )
        .fail(err => this.setState({error: err}))
        .always(() => this.setState({loading: false}));
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
                    back={() => this.props.back()}
                />
            );
        }

        let rooms;
        if (this.state.loading) {
            rooms = <Spinner animation="border" variant="primary"/>;

        } else if (this.state.error) {
            rooms = <Alert variant="danger">Impossibile connettersi con il server</Alert>;

        } else if (this.state.rooms.length === 0) {
            rooms = <i className="text-muted">Nessuna partita disponibile</i>;

        } else {
            rooms = this.state.rooms.map((room, index) => {
                return <Room room={room}
                             key={index}
                             onClick={room => this.onClickJoin(room)} />;
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