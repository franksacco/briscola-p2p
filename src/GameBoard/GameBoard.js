import React, {useState} from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";

import './GameBoard.css';
import SecureMatch from "../Utility/SecureMatch";
import Form from "react-bootstrap/Form";
import Chat from "../Utility/Chat";
import InputGroup from "react-bootstrap/InputGroup";


class GameBoard extends React.Component {
    /**
     * Riferimento al gestore della partita.
     * @var {Match}
     * @private
     */
    _match;

    /**
     * Riferimento al gestore della chat.
     * @var {Chat}
     * @private
     */
    _chat;

    constructor(props) {
        super(props);
        /**
         * @type {{briscola: Card?,
         *   isMyRound: boolean,
         *   cards: Card[],
         *   roundCards: PlayedCard[],
         *   matchEnd: boolean,
         *   score: number,
         *   chatMessages: {username: string, text: string}[],
         *   error: null|string}}
         */
        this.state = {
            briscola: null,
            isMyRound: this.props.master,
            cards: [],
            roundCards: [],
            matchEnd: false,
            score: 0,
            chatMessages: [],
            error: null
        };
        this._onCardClicked = this._onCardClicked.bind(this);
    }

    componentDidMount() {
        this._match = new SecureMatch(this, this.props.otherPeers);
        if (this.props.master) {
            setTimeout(() => {
                // Inizializzazione del mazzo posticipata per permettere la
                // creazione delle connessioni tra i peer.
                this._match.initDeck();
            }, 1000);
        }

        this._chat = new Chat(this, this.props.otherPeers, this.props.username);
    }

    /**
     * Imposta la briscola della partita.
     * @param briscola {Card}
     */
    setBriscola(briscola) {
        this.setState({briscola: briscola});
    }

    /**
     * Imposta il proprio turno.
     */
    setIsMyRound() {
        setTimeout(() => {
            // Ritardo necessario per essere sicuri che le carte di
            // questo turno siano state cancellate.
            this.setState({isMyRound: true});
        }, 2000);
    }

    /**
     * Aggiungi una carta pescata.
     * @param card {Card}
     */
    drawCard(card) {
        let cards = this.state.cards;
        cards.push(card);
        this.setState({cards: cards});
    }

    /**
     * Aggiungi una carta giocata da un avversario.
     * @param card {PlayedCard}
     */
    addPlayedCard(card) {
        let playedCards = this.state.roundCards;
        playedCards.push(card);
        this.setState({roundCards: playedCards});
    }

    /**
     * Segnala alla board la fine del turno.
     */
    roundEnd() {
        setTimeout(() => {
            // Ritardo necessario per poter visualizzare la carta
            // giocata dall'avversario.
            this.setState({roundCards: []});
        }, 2000);
    }

    /**
     * Segnala alla board la fine della partita.
     * @param score {number} I propri punti.
     */
    matchEnd(score) {
        this.setState({
            matchEnd: true,
            score: score
        });
    }

    /**
     * Aggiungi un messaggio della chat.
     * @param username {string}
     * @param text {string}
     */
    addMessage(username, text) {
        let chatMessages = this.state.chatMessages;
        chatMessages.push({
            username: username,
            text: text
        });
        this.setState({chatMessages: chatMessages});

        let el = document.getElementById('chat-messages');
        el.scrollTop = el.scrollHeight;
    }

    /**
     * Mostra il messaggio ed interropi la partita.
     * @param error {string}
     */
    setError(error) {
        this.setState({error: error});
    }

    /**
     * Gestione del click di una carta.
     * @param event {Event}
     * @param index {number}
     * @private
     */
    _onCardClicked(event, index) {
        if (this.state.isMyRound) {
            let cards = this.state.cards;
            const card = cards.splice(index, 1)[0];
            this.setState({
                isMyRound: false,
                cards: cards
            });
            this._match.playCard(card);
        }
    }

    /**
     * Gestione del click del bottone di uscita.
     * @private
     */
    _onExitClicked() {
        // Chiusura di tutte le connessioni.
        this.props.otherPeers.forEach(peer => peer.connection.close());

        // Ricarica della pagina.
        window.location.reload();
    }

    render() {
        if (! this.state.briscola) {
            return (
                <div className="board">
                    <Spinner animation="border" variant="light"/>
                    Sto mescolando il mazzo...
                </div>
            );
        }

        let cards = this.state.cards.map((card, i) => {
            return (
                <Card key={i}
                      card={card}
                      onClick={(e) => this._onCardClicked(e, i)} />
            );
        });

        let playedCards = this.state.roundCards.map((playedCard, i) => {
            return <Card key={i} card={playedCard} />;
        });

        return (<>
            <div className="board">
                <div className="state">
                    {this.state.isMyRound ? "Tocca a te" : "In attesa degli avversari..."}
                </div>
                <div className="deck">
                    <Card card={this.state.briscola} />
                </div>
                <div className="played-cards">
                    {playedCards}
                </div>
                <div className="my-cards">
                    {cards}
                </div>
                <ChatComponent chat={this._chat} messages={this.state.chatMessages}/>
            </div>
            <EndMatchModal
                show={this.state.matchEnd}
                onHide={() => this._onExitClicked()}
                score={this.state.score} />
            <ErrorModal
                onHide={() => this._onExitClicked()}
                error={this.state.error} />
        </>);
    }
}
export default GameBoard;

function Card(props) {
    const card = props.card;
    return (
        <img className="briscola-card"
             src={card.getImage()}
             alt={card.getValueName() + " di " + card.getSeedName()}
             onClick={(e) => props.onClick(e)} />
    );
}

function ChatComponent(props) {
    const [visible, setVisible] = useState(false);

    function onSubmit(e) {
        e.preventDefault();
        props.chat.sendMessage(document.getElementById('text').value);
        document.getElementById('text').value = '';
    }

    const messages = props.messages.map((msg, key) => {
        return (
            <div key={key} className="chat-message">
                <span className="chat-message__username">&lt;{msg.username}&gt;</span>
                <span className="chat-message__text">{msg.text}</span>
            </div>
        );
    });

    return (<>
        <Button type="button"
                variant="dark"
                size="lg"
                className="chat-button"
                onClick={() => setVisible(!visible)}>Chat</Button>
        <div className={"chat" + (visible ? " visible" : "")}>
            <div className="chat-messages" id="chat-messages">
                {messages}
            </div>
            <div className="chat-footer">
                <Form onSubmit={e => onSubmit(e)}>
                    <InputGroup>
                        <Form.Control
                            id="text"
                            type="text"
                            placeholder="Messaggio"
                            autoComplete="off"
                            required />
                        <InputGroup.Append>
                            <Button type="submit">Invia</Button>
                        </InputGroup.Append>
                    </InputGroup>
                </Form>
            </div>
        </div>
    </>);
}

function EndMatchModal(props) {
    return (
        <Modal show={props.show} onHide={() => props.onHide()} aria-labelledby="modal-title" centered>
            <Modal.Header>
                <Modal.Title id="modal-title">
                    {props.score > 60 ? "Hai vinto!" : (props.score === 60 ? "Avete pareggiato!" : "Hai perso")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Il tuo punteggio è pari a {props.score} punti.
            </Modal.Body>
            <Modal.Footer>
                <Button type="button" variant="primary" onClick={() => props.onHide()}>Esci</Button>
            </Modal.Footer>
        </Modal>
    );
}

function ErrorModal(props) {
    return (
        <Modal show={props.error !== null} onHide={() => props.onHide()} aria-labelledby="modal-title" centered>
            <Modal.Header>
                <Modal.Title id="modal-title">
                    Ops! Si è verificato un errore
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {props.error}
            </Modal.Body>
            <Modal.Footer>
                <Button type="button" variant="primary" onClick={() => props.onHide()}>Esci</Button>
            </Modal.Footer>
        </Modal>
    );
}