import Match from "./Match";
import {TYPE_CRYPTO_BRISCOLA, TYPE_CRYPTO_CARD, TYPE_CRYPTO_DECK, TYPE_INIT_DECK} from "./MessageTypes";
import Deck from "./Deck";
import SRA from "./SRA";
import Card from "./Card";

class SecureMatch extends Match {
    /**
     * Lista delle carte criptate aggiornata turno per turno.
     * @var {string[]}
     * @protected
     */
    _deck;

    /**
     * Istanza di SRA.
     * @var {SRA}
     * @private
     */
    _sra;

    /**
     * Inizializzazione della partita.
     * @param board {GameBoard} Riferimento alla game board.
     * @param otherPeers {{id: number, connection: DataConnection}[]} Lista delle connessioni con gli altri peer.
     */
    constructor(board, otherPeers) {
        super(board, otherPeers);
        this._sra = SRA.generate();
    }

    /**
     * Gestione della ricezione di un messaggio.
     * @param message {{type: number, data: *}}
     */
    handleMessage(message) {
        // TODO: conteggio numero di decriptazioni per turno.

        switch (message.type) {
            case TYPE_CRYPTO_DECK:
                this._handleCryptoDeck(message.data);
                break;

            case TYPE_CRYPTO_BRISCOLA:
                this._handleCryptoBriscola(message.data);
                break;

            case TYPE_CRYPTO_CARD:
                this._handleCryptoCard(message.data);
                break;

            default:
                super.handleMessage(message);
        }
    }

    /**
     * Invia un messaggio al successivo giocatore.
     * @param type {number} Tipo del messaggio.
     * @param data Contenuto del messaggio.
     * @private
     */
    _sendToNextPlayer(type, data) {
        const nextId = (this._id + 1) % (this._otherPeers.length + 1);
        const peers = this._otherPeers.filter(peer => peer.id === nextId);
        if (peers.length === 1) {
            const msg = {
                type: type,
                data: data
            };
            peers[0].connection.send(JSON.stringify(msg));
        }
    }

    /**
     * Inizializzazione del mazzo.
     * Azione effettuate solo dal master peer.
     */
    initDeck() {
        let deck = Deck.create();
        deck = deck.map(card => this._encryptCard(card.getId()));
        Deck.shuffle(deck);

        const data = {
            counter: 1,  // Contatore delle volte in cui il mazzo è stato criptato.
            deck: deck
        };
        this._sendToNextPlayer(TYPE_CRYPTO_DECK, data);
    }

    /**
     * Gestione della criptazione del mazzo.
     * @param msg {{deck: string[], counter: number}}
     * @private
     */
    _handleCryptoDeck(msg) {
        let deck = msg.deck.map(card => this._encryptCard(card));
        Deck.shuffle(deck);

        if (msg.counter === this._otherPeers.length) {
            // Mazzo criptato e mescolato da tutti i peer,
            // procediamo con l'invio in broadcast della versione finale del deck.
            this._broadcast(TYPE_INIT_DECK, deck);
            this._initMatch(deck);

        } else {
            // Criptazione ulteriore del mazzo, mescolamento e invio al successivo peer.
            this._sendToNextPlayer(TYPE_CRYPTO_DECK, {
                counter: msg.counter + 1,
                deck: deck
            });
        }
    }

    /**
     * Inizializzazione della partita.
     * @param deck {string[]}
     * @protected
     */
    _initMatch(deck) {
        this._deck = deck;

        // Invio della prima carta del mazzo per la decriptazione.
        this._sendToNextPlayer(TYPE_CRYPTO_BRISCOLA, {
            counter: 0,  // Numero di decriptazioni.
            briscola: this._deck[0]
        });

        // Rimozione carte iniziali pescate dagli altri peer.
        for (let i = 0; i < 3 * this._id; i++) {
            this._deck.pop();
        }
        // Pescaggio delle mie carte.
        let card;
        for (let i = 0; i < 3; i++) {
            card = this._deck.pop();
            this._sendToNextPlayer(TYPE_CRYPTO_CARD, {
                counter: 0,  // Numero di decriptazioni.
                card: card
            });
        }
        // Rimozione rimanenti carte.
        for (let i = 0; i < 3 * (this._otherPeers.length + 1) - 3 * this._id - 3; i++) {
            this._deck.pop();
        }
    }

    /**
     * Gestione della decriprazione della briscola.
     * @param msg {{counter: number, briscola: string}}
     * @private
     */
    _handleCryptoBriscola(msg) {
        let briscola = this._decryptCard(msg.briscola);
        if (msg.counter === this._otherPeers.length) {
            // Briscola decriptata da tutti i peer.
            this._briscola = new Card(briscola.toJSNumber());
            this._board.setBriscola(this._briscola);

        } else {
            // Decriptazione ulteriore della briscola e invio al successivo peer.
            this._sendToNextPlayer(TYPE_CRYPTO_BRISCOLA, {
                counter: msg.counter + 1,
                briscola: briscola
            });
        }
    }

    /**
     * Gestione della decriptazione di una carta.
     * @param msg {{counter: number, card: string}}
     * @private
     */
    _handleCryptoCard(msg) {
        let card = this._decryptCard(msg.card);
        if (msg.counter === this._otherPeers.length) {
            // Carta decriptata da tutti i peer.
            card = new Card(card.toJSNumber());
            this._cards.push(card);
            this._board.drawCard(card);

        } else {
            // Decriptazione ulteriore della carta e invio al successivo peer.
            this._sendToNextPlayer(TYPE_CRYPTO_CARD, {
                counter: msg.counter + 1,
                card: card
            });
        }
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
        const card = this._deck.pop();
        this._sendToNextPlayer(TYPE_CRYPTO_CARD, {
            counter: 0,  // Numero di decriptazioni.
            card: card
        });

        // Rimozione rimanenti carte.
        for (let i = 0; i < (this._otherPeers.length + 1) - this._id - 1; i++) {
            this._deck.pop();
        }
    }

    /**
     * Cripta una carta.
     * @param cardId {string|number}
     * @return {bigInt}
     */
    _encryptCard(cardId) {
        return this._sra.encrypt(cardId);
    }

    /**
     * Decripta una carta.
     * @param cardId {string}
     * @return {bigInt}
     */
    _decryptCard(cardId) {
        return this._sra.decrypt(cardId);
    }
}
export default SecureMatch;