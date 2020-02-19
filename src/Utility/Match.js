import Card, {PlayedCard} from "./Card";
import Deck from "./Deck";
import {TYPE_CARD_PLAYED, TYPE_INIT_DECK, TYPE_MALICIOUS_PEER} from "./MessageTypes";


class Match {
    /**
     * Riferimento alla GameBoard.
     * @var {GameBoard}
     * @protected
     */
    _board;

    /**
     * Lista degli altri peer.
     * @var {{id: number, connection: DataConnection}[]}
     * @protected
     */
    _otherPeers;

    /**
     * Id dell'attuale player.
     * @var {number}
     * @protected
     */
    _id;

    /**
     * Briscola della partita.
     * @var {Card}
     * @protected
     */
    _briscola;

    /**
     * Carte giocate da chiunque durante la partita.
     * @type {PlayedCard[]}
     * @protected
     */
    _playedCards = [];

    /**
     * Il proprio punteggio.
     * @type {number}
     * @protected
     */
    _score = 0;

    /**
     * Lista delle carte aggiornata turno per turno.
     * @var {Card[]}
     * @protected
     */
    _deck = [];

    /**
     * ID del peer che deve giocare.
     * @type {number}
     * @protected
     */
    _roundOf = 0;

    /**
     * Liste delle proprie carte in mano.
     * @type {Card[]}
     * @protected
     */
    _cards = [];

    /**
     * Lista delle proprie carte giocate nel turno.
     * @type {PlayedCard[]}
     * @protected
     */
    _roundCards = [];

    /**
     * Inizializzazione della partita.
     * @param board {GameBoard} Riferimento alla game board.
     * @param otherPeers {{id: number, connection: DataConnection}[]} Lista
     *   delle connessioni con gli altri peer.
     */
    constructor(board, otherPeers) {
        this._board = board;
        this._otherPeers = otherPeers;
        this._id = this._calculateMyId();

        this._otherPeers.forEach(peer => {
            this.handleConnection(peer.connection);
        });
    }

    /**
     * Calcolo del proprio ID.
     *
     * @returns {number} Restituisce l'ID.
     * @private
     */
    _calculateMyId() {
        // Id degli altri peer.
        const otherPeerIds = this._otherPeers.map(peer => peer.id);
        // Tutti gli id disponibili.
        const ids = [...Array(this._otherPeers.length + 1).keys()];
        // Manteniamo solo quelli non presenti negli altri peer.
        return ids.filter(id => ! otherPeerIds.includes(id))[0];
    }

    /**
     * Setup dei listener per gli eventi della connessione.
     * @param connection {DataConnection}
     */
    handleConnection(connection) {
        // Gestione della ricezione di dati.
        connection.on('data', data => {
            const msg = JSON.parse(data);
            this.handleMessage(msg);
        });

        // Gestione degli errori della connessione.
        connection.on('error', error => {
            console.error(error);
            this._handleError("Errore di comunicazione");
        });

        // Gestione della chiusura della connessione.
        connection.on('close', () => {
            if (this._deck.length > 0 || this._cards.length > 0) {
                this._handleError("La connessione con un altro utente si è interrotta");
            }
        });
    }

    /**
     * Gestione della ricezione di un messaggio.
     * @param message {{type: number, data: *}}
     */
    handleMessage(message) {
        switch (message.type) {
            case TYPE_INIT_DECK:
                this._initMatch(message.data);
                break;

            case TYPE_CARD_PLAYED:
                const playedCard = new PlayedCard(message.data.id, message.data.playerId);
                if (this._playedCards.includes(playedCard)) {
                    this._broadcast(TYPE_MALICIOUS_PEER, {
                        error: "Un avversario ha giocato una carta vecchia"
                    });
                    this._handleError("Un avversario ha giocato una carta vecchia");
                    break;
                }
                this._playedCards.push(playedCard);
                this._roundCards.push(playedCard);
                this._board.addPlayedCard(playedCard);

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
                break;

            case TYPE_MALICIOUS_PEER:
                this._handleError("Un utente sta cercando di barare: " + message.data.error);
                break;

            default:  // Do nothing.
        }
    }

    /**
     * Gestione degli errori di connessione.
     * @param error {string}
     * @protected
     */
    _handleError(error) {
        this._board.setError(error);
    }

    /**
     * Invia un messaggio a tutti i peer.
     * @param type {number} Tipo del messaggio.
     * @param data Contenuto del messaggio.
     * @protected
     */
    _broadcast(type, data) {
        const msg = {
            type: type,
            data: data
        };
        this._otherPeers.forEach(peer => {
            peer.connection.send(JSON.stringify(msg));
        });
    }

    /**
     * Inizializzazione del mazzo.
     * Azione effettuate solo dal master peer.
     */
    initDeck() {
        const deck = Deck.create();
        Deck.shuffle(deck);

        this._broadcast(TYPE_INIT_DECK, deck.map(card => card.getId()));
        this._initMatch(deck.map(card => card.getId()));
    }

    /**
     * Inizializzazione della partita.
     * @param deck {number[]} Lista ID carte.
     * @protected
     */
    _initMatch(deck) {
        this._deck = deck.map(id => new Card(id));

        // La briscola è la prima carta del mazzo.
        this._briscola = this._deck[0];
        this._board.setBriscola(this._briscola);

        // Rimozione carte iniziali pescate dagli altri peer.
        for (let i = 0; i < 3 * this._id; i++) {
            this._deck.pop();
        }
        // Pescaggio delle mie carte.
        let card;
        for (let i = 0; i < 3; i++) {
            card = this._deck.pop();
            this._cards.push(card);
            this._board.drawCard(card);
        }
        // Rimozione rimanenti carte.
        for (let i = 0; i < 3 * (this._otherPeers.length + 1) - 3 * this._id - 3; i++) {
            this._deck.pop();
        }
    }

    /**
     * Gioca una propria carta.
     * @param card {Card}
     */
    playCard(card) {
        // Rimozione carta dalla propria mano.
        this._cards.splice(this._cards.indexOf(card), 1);

        const playedCard = new PlayedCard(card.getId(), this._id);
        // Carta aggiunta a quelle giocate nel turno.
        this._roundCards.push(playedCard);
        this._board.addPlayedCard(playedCard);
        // Invio carta agli alri giocatori.
        this._broadcast(TYPE_CARD_PLAYED, {
            id: playedCard.getId(),
            playerId: playedCard.getPlayerId()
        });

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

    /**
     * Esecuzione del termine del turno.
     * @protected
     */
    _roundEnd() {
        const winner = Deck.roundWinner(this._roundCards, this._briscola.getSeed());
        console.log("Mano vinta da " + winner);

        if (this._id % 2 === winner % 2) {
            // Se sono il vincitore o il compoagno del vincitore,
            // aggiungo al mio punteggio quello della mano.
            this._score += Deck.scores(this._roundCards);
        }

        this._roundCards = [];
        this._board.roundEnd();

        if (this._deck.length > 0) {
            // Non siamo nelle ultime tre mani della partita.
            this._drawCard();

        } else if (this._cards.length === 0) {
            // Partita terminata.
            this._board.matchEnd(this._score);
        }

        // Si procede con il turno successivo.
        this._roundOf = winner;
    }

    /**
     * Pescaggio di una carta a fine turno.
     * @protected
     */
    _drawCard() {
        // Rimozione carte iniziali pescate dagli altri peer.
        for (let i = 0; i < this._id; i++) {
            this._deck.pop();
        }

        // Pescaggio della propria carta.
        let card = this._deck.pop();
        this._cards.push(card);
        this._board.drawCard(card);

        // Rimozione rimanenti carte.
        for (let i = 0; i < (this._otherPeers.length + 1) - this._id - 1; i++) {
            this._deck.pop();
        }
    }
}
export default Match;