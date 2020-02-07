import {TYPE_CHAT_MESSAGE} from "./MessageTypes";


/**
 * Gestione della chat della partita.
 */
class Chat {
    /**
     * Riferimento alla GameBoard.
     * @var {GameBoard}
     * @protected
     */
    _board;

    /**
     * Lista degli altri peer.
     * @var {{id: number, username: string, connection: DataConnection}[]}
     * @protected
     */
    _otherPeers;

    /**
     * @var {string}
     * @private
     */
    _username;

    /**
     * Inizializzazione della partita.
     * @param board {GameBoard} Riferimento alla game board.
     * @param otherPeers {{id: number, username: string, connection: DataConnection}[]} Lista
     *   delle connessioni con gli altri peer.
     * @param username {string}
     */
    constructor(board, otherPeers, username) {
        this._board = board;
        this._otherPeers = otherPeers;
        this._username = username;

        this._otherPeers.forEach(peer => {
            this.handleConnection(peer.connection);
        });
    }

    /**
     * Setup dei listener per gli eventi della connessione.
     * @param connection {DataConnection}
     */
    handleConnection(connection) {
        // Gestione della ricezione dei messaggi.
        connection.on('data', data => {
            const msg = JSON.parse(data);
            if (msg.type === TYPE_CHAT_MESSAGE) {
                this._board.addMessage(msg.data.username, msg.data.text);
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
            data: {
                username: this._username,
                text: text
            }
        };
        this._board.addMessage(this._username, text);
        this._otherPeers.forEach(peer => {
            peer.connection.send(JSON.stringify(msg));
        });
    }
}
export default Chat;