import Deck from "./Deck";
import {TYPE_CARD_PLAYED, TYPE_INIT_DECK} from "./Message";

class Match {
    // Riferimento a GameBoard.
    _board;
    // Lista degli altri peer con id e connessione.
    _otherPeers;
    // Id dell'attuale player.
    _id;
    // Briscola della partita.
    _briscola;

    // Carte giocate da chiunque.
    _playedCards = [];
    // Il mio punteggio.
    _score = 0;
    // Lista delle carte aggiornata turno per turno.
    _deck;
    // Id del peer che deve giocare.
    _roundOf = 0;
    // Le carte che ho in mano.
    _cards = [];
    // Lista carte giocate nel turno.
    _roundCards = [];

    constructor(board, otherPeers) {
        this._board = board;
        this._otherPeers = otherPeers;
        console.log(otherPeers);
        this._id = this._calculateMyId();

        this._otherPeers.forEach(peer => {
            peer.connection.on('data', data => {
                const msg = JSON.parse(data);
                switch (msg.type) {
                    case TYPE_INIT_DECK:
                        this._initCards(msg.data);
                        break;

                    case TYPE_CARD_PLAYED:
                        if (! this._playedCards.includes(msg.data.card)) {
                            this._playedCards.push(msg.data.card);
                            this._board.addPlayedCard(msg.data);
                            this._roundCards.push(msg.data);

                            // Calcolo prossimo giocatore.
                            this._roundOf = (this._roundOf + 1) % (this._otherPeers.length + 1);
                            // Controlliamo se la mano è terminata.
                            if (this._roundCards.length === this._otherPeers.length + 1) {
                                this._roundEnd();
                            }
                            // Controlliamo se è il mio turno per giocare.
                            if (this._roundOf === this._id) {
                                this._board.setIsMyRound();
                            }
                        }
                        break;

                    default:
                        console.log("Invalid message type");
                }
            });
        });
    }

    _calculateMyId() {
        // Id degli altri peer.
        const otherPeerIds = this._otherPeers.map(peer => peer.id);
        // Tutti gli id disponibili.
        const ids = [...Array(this._otherPeers.length + 1).keys()];
        // Manteniamo solo quelli non presenti negli altri peer.
        return ids.filter(id => ! otherPeerIds.includes(id))[0];
    }

    _broadcast(type, data) {
        const msg = {
            type: type,
            data: data
        };
        this._otherPeers.forEach(peer => {
            peer.connection.send(JSON.stringify(msg));
        });
    }

    init(master) {
        if (master) {
            setTimeout(() => {
                const deck = Deck.create();
                Deck.shuffle(deck);

                this._broadcast(TYPE_INIT_DECK, deck);
                this._initCards(deck);

                this._board.setIsMyRound();
            },1000);
        }
    }

    _initCards(deck) {
        this._deck = deck;

        // La briscola è il seme della prima carta del mazzo.
        this._briscola = this._deck[0];

        // Rimozione carte iniziali pescate dagli altri peer.
        for (let i = 0; i < 3 * this._id; i++) {
            this._deck.pop();
        }
        // Pescaggio delle mie carte.
        let card, initialCards = [];
        for (let i = 0; i < 3; i++) {
            card = this._deck.pop();
            this._cards.push(card);
            initialCards.push(card);
        }
        // Rimozione rimanenti carte.
        for (let i = 0; i < 3 * (this._otherPeers.length + 1) - 3 * this._id - 3; i++) {
            this._deck.pop();
        }

        this._board.initCards(this._briscola, initialCards);
    }

    playCard(card) {
        // Rimozione carta dalla mia mano.
        this._cards.splice(this._cards.indexOf(card), 1);

        const playedCard = {
            playerId: this._id,
            card: card
        };
        // Carta aggiunta a quelle giocate nel turno.
        this._roundCards.push(playedCard);
        this._board.addPlayedCard(playedCard);
        // Invio carta agli alri giocatori.
        this._broadcast(TYPE_CARD_PLAYED, playedCard);

        // Calcolo prossimo giocatore.
        this._roundOf = (this._roundOf + 1) % (this._otherPeers.length + 1);
        // Controlliamo se la mano è terminata.
        if (this._roundCards.length === this._otherPeers.length + 1) {
            this._roundEnd();
        }
        // Controlliamo se è il mio turno per giocare.
        if (this._id === this._roundOf) {
            this._board.setIsMyRound();
        }
    }

    _roundEnd() {
        const winner = Deck.roundWinner(this._roundCards, this._briscola.seed);
        console.log("Mano vinta da " + winner);
        if (this._id % 2 === winner % 2) {
            // Se sono il vincitore o il compoagno del vincitore,
            // aggiungo al mio punteggio quello della mano.
            this._score += Deck.scores(this._roundCards);
        }
        this._roundCards = [];
        this._board.resetPlayedCards();

        if (this._deck.length > 0) {
            // Non siamo nelle ultime tre mani della partita.
            this._drawCard();

        } else if (this._cards.length === 0) {
            // Partita terminata.
            this._matchEnd();
        }
        // Si procede con il turno successivo.
        this._roundOf = winner;
    }

    _drawCard() {
        // Rimozione carte iniziali pescate dagli altri peer.
        for (let i = 0; i < this._id; i++) {
            this._deck.pop();
        }
        // Pescaggio della mia carta.
        let card = this._deck.pop();
        this._cards.push(card);
        this._board.addCard(card);
        // Rimozione rimanenti carte.
        for (let i = 0; i < (this._otherPeers.length + 1) - this._id - 1; i++) {
            this._deck.pop();
        }
    }

    _matchEnd() {
        this._board.matchEnd(this._score);

        // Chiusura di tutte le connessioni.
        //this._otherPeers.forEach(peer => peer.connection.close());
    }
}
export default Match;