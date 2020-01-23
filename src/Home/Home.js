import React from "react";
import './Home.css';
import Card from "react-bootstrap/Card";
import {Controller, People, Person} from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.setRoom = this.setRoom.bind(this);
    }

    setRoom(room) {
        this.props.setRoom(room);
    }

    render() {
        return (
            <div className="start-page">
                <header className="start-page__header">
                    <span className="app-title">Briscola P2P</span><br/>
                    <span className="username">Utente: <b>{this.props.username}</b></span>
                </header>
                <main className="start-page__main">
                    <Main setRoom={this.setRoom}/>
                </main>
            </div>
        );
    }
}
export default Home;

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.onClickButton = this.onClickButton.bind(this);
    }

    onClickButton(numPlayers) {
        // TODO use a dialog
        const name = prompt("Inserisci il nome della stanza:");
        this.props.setRoom({
            name: name,
            numPlayers: numPlayers
        });
    }

    render() {
        return (<>
            <Card>
                <Card.Body>
                    <Card.Title>
                        <Controller color="black" size="52"/>
                    </Card.Title>
                    <Card.Text>
                        Partecipa ad una partita
                    </Card.Text>
                    <Button type="button" onClick={() => {}}>Partecipa</Button>
                </Card.Body>
            </Card>
            <Card>
                <Card.Body>
                    <Card.Title>
                        <Person color="primary" size="52"/>
                    </Card.Title>
                    <Card.Text>
                        Crea una partita per 2 giocatori
                    </Card.Text>
                    <Button type="button" onClick={() => {this.onClickButton(2)}}>Crea</Button>
                </Card.Body>
            </Card>
            <Card>
                <Card.Body>
                    <Card.Title>
                        <People color="primary" size="52"/>
                    </Card.Title>
                    <Card.Text>
                        Crea una partita per 4 giocatori
                    </Card.Text>
                    <Button type="button" onClick={() => {this.onClickButton(4)}}>Crea</Button>
                </Card.Body>
            </Card>
        </>);
    }
}