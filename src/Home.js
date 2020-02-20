import React, {useState} from "react";
import Peer from "peerjs";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {Controller, People, Person} from "react-bootstrap-icons";
import RoomList from "./RoomList";
import Waiting from "./Waiting";
import Form from "react-bootstrap/Form";

/**
 * Pagina iniziale dopo aver effettuato il login.
 */
class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            viewRoomList: false,
            room: null
        };

        this.setViewRoomList = this.setViewRoomList.bind(this);
        this.setRoom = this.setRoom.bind(this);
    }

    componentDidMount() {
        this.peer = new Peer(null, {host: 'localhost', port: 9000});
        this.peer.on('open', () => console.log("Peer connected with id: " + this.peer.id));
        this.peer.on('error', err => console.log("Peer error: " + err));
    }

    setViewRoomList(value = true) {
        this.setState({viewRoomList: value});
    }

    setRoom(room) {
        room.masterId = this.peer.id;
        this.setState({room: room});
    }

    back() {
        this.setState({
            viewRoomList: false,
            room: null
        });
    }

    render() {
        if (this.state.viewRoomList) {
            return <RoomList username={this.props.username}
                             peer={this.peer}
                             back={() => this.back()} />;

        } else if (this.state.room) {
            return (
                <Waiting
                    master={true}
                    username={this.props.username}
                    peer={this.peer}
                    room={this.state.room}
                    back={() => this.back()}
                />
            );
        }

        return (
            <div className="page">
                <header className="page__header">
                    <span className="app-name">Briscola P2P</span><br/>
                    <span className="user-name">Utente: <b>{this.props.username}</b></span>
                </header>
                <Main setRoom={(room) => this.setRoom(room)}
                      viewRoomList={() => this.setViewRoomList()}/>
            </div>
        );
    }
}
export default Home;

function Main(props) {
    const [numPlayers, setNumPlayers] = useState(null);
    const [showDialog, setShowDialog] = useState(false);

    return (
        <main className="page__main">
            <Card style={{width: "240px", margin: "16px"}}>
                <Card.Body>
                    <Card.Title>
                        <Controller color="#33691E" size="52"/>
                    </Card.Title>
                    <Card.Text>
                        Partecipa ad una partita
                    </Card.Text>
                    <Button type="button"
                            onClick={() => props.viewRoomList()}>Partecipa
                    </Button>
                </Card.Body>
            </Card>
            <Card style={{width: "240px", margin: "16px"}}>
                <Card.Body>
                    <Card.Title>
                        <Person color="#33691E" size="52"/>
                    </Card.Title>
                    <Card.Text>
                        Crea una partita per 2 giocatori
                    </Card.Text>
                    <Button type="button"
                            onClick={() => {setNumPlayers(2); setShowDialog(true);}}>Crea
                    </Button>
                </Card.Body>
            </Card>
            <Card style={{width: "240px", margin: "16px"}}>
                <Card.Body>
                    <Card.Title>
                        <People color="#33691E" size="52"/>
                    </Card.Title>
                    <Card.Text>
                        Crea una partita per 4 giocatori
                    </Card.Text>
                    <Button type="button"
                            onClick={() => {setNumPlayers(4); setShowDialog(true);}}>Crea
                    </Button>
                </Card.Body>
            </Card>
            <CreateRoomDialog
                show={showDialog}
                onHide={() => setShowDialog(false)}
                onConfirm={(e) => {
                    e.preventDefault();
                    setShowDialog(false);
                    props.setRoom({
                        name: document.getElementById("room_name_input").value,
                        numPlayers: numPlayers
                    });
                }}/>
        </main>
    );
}

function CreateRoomDialog(props) {
    return (
        <Modal show={props.show} onHide={() => props.onHide()} aria-labelledby="modal-title" centered>
            <Form onSubmit={e => props.onConfirm(e)}>
                <Modal.Header>
                    <Modal.Title id="modal-title">
                        Crea nuova partita
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="room_name_input">
                        <Form.Label>Specifica un nome per la partita:</Form.Label>
                        <Form.Control type="text" placeholder="Nome partita" />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="button" variant="secondary" onClick={() => props.onHide()}>Annulla</Button>
                    <Button type="submit" variant="primary">Conferma</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}