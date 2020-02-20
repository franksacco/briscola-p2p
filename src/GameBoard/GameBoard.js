import React, {useState} from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";

import SecureMatch from "../Utility/SecureMatch";
import Chat from "../Utility/Chat";
import './GameBoard.css';
import deck_image from '../assets/cards/deck.png';
import Badge from "react-bootstrap/Badge";


class GameBoard extends React.Component {
    /**
     * Riferimento al gestore della partita.
     * @var {Match}
     * @private
     */
    _match;

    /**
     * Array associativo degli username.
     * @type {{}}
     * @private
     */
    _usernames = {};

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
         *   cardsCounter: number,
         *   isMyRound: boolean,
         *   cards: Card[],
         *   roundCards: PlayedCard[],
         *   matchEnd: boolean,
         *   score: number,
         *   chatMessages: {playerId: number, text: string}[],
         *   unreadMessages: number,
         *   error: null|string}}
         */
        this.state = {
            briscola: null,
            cardsCounter: 40 - 3 * (props.otherPeers.length + 1),
            isMyRound: this.props.master,
            cards: [],
            roundCards: [],
            matchEnd: false,
            score: 0,
            chatMessages: [],
            unreadMessages: 0,
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

        // Creazione dell'array associativo con gli username.
        this.props.otherPeers.forEach(peer => {
            this._usernames[peer.id] = peer.username;
        });
        this._usernames[this._match.getMyId()] = this.props.username;

        this._chat = new Chat(this, this.props.otherPeers, this._match.getMyId());
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
     * @param delay {boolean}
     */
    setIsMyRound(delay = false) {
        if (delay) {
            setTimeout(() => {
                // Ritardo necessario per essere sicuri che le carte di
                // questo turno siano state cancellate.
                this.setState({isMyRound: true});
            }, 2000);

        } else {
            this.setState({isMyRound: true});
        }
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
        if (this.state.cardsCounter > 0) {
            this.setState({
                cardsCounter: this.state.cardsCounter - (this.props.otherPeers.length + 1)
            });
        }
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
     * Aggiungi un messaggio alla chat.
     * @param playerId {number}
     * @param text {string}
     */
    addMessage(playerId, text) {
        let chatMessages = this.state.chatMessages;
        chatMessages.push({
            playerId: playerId,
            text: text
        });
        this.setState({
            chatMessages: chatMessages,
            unreadMessages: this.state.unreadMessages + 1
        });

        // Riporta il focus in fondo all'elemento.
        let el = document.getElementById('chat-messages');
        el.scrollTop = el.scrollHeight;
    }

    /**
     * Azzera il numero di messaggi non letti.
     */
    setMessagesRead() {
        this.setState({
            unreadMessages: 0
        });
    }

    /**
     * Mostra il messaggio ed interrope la partita.
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
            return (<div key={i} className="card-container">
                <Card card={playedCard}/>
                <div className="card-player">
                    {this._usernames[playedCard.getPlayerId()]}
                </div>
            </div>);
        });

        return (<>
            <div className="board">
                <div className="state">
                    {this.state.isMyRound ? "Tocca a te" : "In attesa degli avversari..."}
                </div>
                <div className="deck">
                    <img className="deck-image"
                         src={deck_image}
                         alt="Mazzo"/>
                    <Card card={this.state.briscola} />
                    <div className="cards-counter">
                        {this.state.cardsCounter}
                    </div>
                </div>
                <div className="played-cards">
                    {playedCards}
                </div>
                <div className="my-cards">
                    {cards}
                </div>
                <ChatComponent
                    usernames={this._usernames}
                    chat={this._chat}
                    messages={this.state.chatMessages}
                    unreadMessages={this.state.unreadMessages}
                    setMessageRead={() => this.setMessagesRead()} />
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

    // Reset dei messaggi non letti.
    visible && props.unreadMessages > 0 && props.setMessageRead();

    function onSubmit(e) {
        e.preventDefault();
        props.chat.sendMessage(document.getElementById('text').value);
        document.getElementById('text').value = '';
    }

    const messages = props.messages.map((msg, key) => {
        return (
            <div key={key} className="chat-message">
                <span className="chat-message__username">
                    &lt;{props.usernames[msg.playerId]}&gt;
                </span>
                <span className="chat-message__text">
                    {msg.text}
                </span>
            </div>
        );
    });

    return (<>
        <Button type="button"
                variant="dark"
                size="lg"
                className="chat-button"
                onClick={() => setVisible(!visible)}>Chat
            {props.unreadMessages > 0 &&
                <Badge pill variant="warning">{props.unreadMessages}</Badge>
            }
        </Button>
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