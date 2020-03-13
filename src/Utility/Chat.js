import {TYPE_CHAT_MESSAGE} from "./MessageTypes";

/**
 * Gestione della chat della partita.
 */
export default class Chat {
    /**
     * Riferimento alla GameBoard.
     * @var {GameBoard}
     * @private
     */
    _board;

    /**
     * Lista degli altri peer.
     * @var {{id: number, username: string, connection: DataConnection}[]}
     * @private
     */
    _otherPeers;

    /**
     * Il proprio ID da giocatore.
     * @var {number}
     * @private
     */
    _playerId;

    /**
     * Inizializzazione della partita.
     * @param board {GameBoard} Riferimento alla game board.
     * @param otherPeers {{id: number, username: string, connection: DataConnection}[]} Lista
     *   delle connessioni con gli altri peer.
     * @param playerId {number}
     */
    constructor(board, otherPeers, playerId) {
        this._board = board;
        this._otherPeers = otherPeers;
        this._playerId = playerId;

        this._otherPeers.forEach(peer => {
            this._handleConnection(peer.id, peer.connection);
        });
    }

    /**
     * Setup dei listener per gli eventi della connessione.
     * @param playerId {number} ID del giocatore.
     * @param connection {DataConnection}
     * @private
     */
    _handleConnection(playerId, connection) {
        // Gestione della ricezione dei messaggi.
        connection.on('data', data => {
            const msg = JSON.parse(data);
            if (msg.type === TYPE_CHAT_MESSAGE) {
                this._board.addMessage(playerId, msg.data);
            }
        });
    }

    /**
     * Invia un messaggio a tutti i giocatori.
     * @param text {string}
     */
    sendMessage(text) {
        const msg = {
            type: TYPE_CHAT_MESSAGE,
            data: text
        };
        this._board.addMessage(this._playerId, text);
        this._otherPeers.forEach(peer => {
            peer.connection.send(JSON.stringify(msg));
        });
    }
}