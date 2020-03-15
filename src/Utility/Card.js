import img_0_0 from '../assets/cards/c_0_0.png';
import img_0_1 from '../assets/cards/c_0_1.png';
import img_0_2 from '../assets/cards/c_0_2.png';
import img_0_3 from '../assets/cards/c_0_3.png';
import img_0_4 from '../assets/cards/c_0_4.png';
import img_0_5 from '../assets/cards/c_0_5.png';
import img_0_6 from '../assets/cards/c_0_6.png';
import img_0_7 from '../assets/cards/c_0_7.png';
import img_0_8 from '../assets/cards/c_0_8.png';
import img_0_9 from '../assets/cards/c_0_9.png';
import img_1_0 from '../assets/cards/c_1_0.png';
import img_1_1 from '../assets/cards/c_1_1.png';
import img_1_2 from '../assets/cards/c_1_2.png';
import img_1_3 from '../assets/cards/c_1_3.png';
import img_1_4 from '../assets/cards/c_1_4.png';
import img_1_5 from '../assets/cards/c_1_5.png';
import img_1_6 from '../assets/cards/c_1_6.png';
import img_1_7 from '../assets/cards/c_1_7.png';
import img_1_8 from '../assets/cards/c_1_8.png';
import img_1_9 from '../assets/cards/c_1_9.png';
import img_2_0 from '../assets/cards/c_2_0.png';
import img_2_1 from '../assets/cards/c_2_1.png';
import img_2_2 from '../assets/cards/c_2_2.png';
import img_2_3 from '../assets/cards/c_2_3.png';
import img_2_4 from '../assets/cards/c_2_4.png';
import img_2_5 from '../assets/cards/c_2_5.png';
import img_2_6 from '../assets/cards/c_2_6.png';
import img_2_7 from '../assets/cards/c_2_7.png';
import img_2_8 from '../assets/cards/c_2_8.png';
import img_2_9 from '../assets/cards/c_2_9.png';
import img_3_0 from '../assets/cards/c_3_0.png';
import img_3_1 from '../assets/cards/c_3_1.png';
import img_3_2 from '../assets/cards/c_3_2.png';
import img_3_3 from '../assets/cards/c_3_3.png';
import img_3_4 from '../assets/cards/c_3_4.png';
import img_3_5 from '../assets/cards/c_3_5.png';
import img_3_6 from '../assets/cards/c_3_6.png';
import img_3_7 from '../assets/cards/c_3_7.png';
import img_3_8 from '../assets/cards/c_3_8.png';
import img_3_9 from '../assets/cards/c_3_9.png';


const SEED_NAMES_MAP = [
    'Bastoni',
    'Coppe',
    'Denari',
    'Spade'
];

const VALUE_NAMES_MAP = [
    'Due',
    'Quattro',
    'Cinque',
    'Sei',
    'Sette',
    'Fante',
    'Cavallo',
    'Re',
    'Tre',
    'Asso'
];

const VALUES_MAP = [
    9,  // Asso
    0,  // Due
    8,  // Tre
    1,  // Quattro
    2,  // Cinque
    3,  // Sei
    4,  // Sette
    5,  // Fante
    6,  // Cavallo
    7   // Re
];

const SCORES_MAP = [
    11, // Asso
    0,  // Due
    10, // Tre
    0,  // Quattro
    0,  // Cinque
    0,  // Sei
    0,  // Sette
    2,  // Fante
    3,  // Cavallo
    4   // Re
];

const IMAGES = {
    0: [img_0_0, img_0_1, img_0_2, img_0_3, img_0_4,
        img_0_5, img_0_6, img_0_7, img_0_8, img_0_9],
    1: [img_1_0, img_1_1, img_1_2, img_1_3, img_1_4,
        img_1_5, img_1_6, img_1_7, img_1_8, img_1_9],
    2: [img_2_0, img_2_1, img_2_2, img_2_3, img_2_4,
        img_2_5, img_2_6, img_2_7, img_2_8, img_2_9],
    3: [img_3_0, img_3_1, img_3_2, img_3_3, img_3_4,
        img_3_5, img_3_6, img_3_7, img_3_8, img_3_9]
};

/**
 * Descrizione e rappresentazione di una carta di gioco.
 */
export default class Card {
    /**
     * @var {number}
     * @private
     */
    _id;

    /**
     * @var {number}
     * @private
     */
    _seed;

    /**
     * @var {number}
     * @private
     */
    _value;

    /**
     * @var {number}
     * @private
     */
    _score;

    /**
     * Inizializza una carta a partire dal suo ID.
     * @param id {number}
     */
    constructor(id) {
        if (id < 2 || id > 41) {
            throw new Error('Invalid card ID');
        }
        this._id = id;
        this._seed = Math.floor((id - 2) / 10);
        this._value = VALUES_MAP[(id - 2) % 10];
        this._score = SCORES_MAP[(id - 2) % 10];
    }

    /**
     * Restituisce l'identificativo della carta.
     * @return {number}
     */
    getId() {
        return this._id;
    }

    /**
     * Restituisce l'identificativo del seme della carta.
     * @return {number}
     */
    getSeed() {
        return this._seed;
    }

    /**
     * Restituisce il nome del seme della carta.
     * @return {string}
     */
    getSeedName() {
        return SEED_NAMES_MAP[this._seed];
    }

    /**
     * Restituisce il valore della carta nei confronti delle altre.
     * @return {number}
     */
    getValue() {
        return this._value;
    }

    /**
     * Restituisce il nome della tipologia della carta.
     * @return {string}
     */
    getValueName() {
        return VALUE_NAMES_MAP[this._value];
    }

    /**
     * Restituisce il valore in punti della carta.
     * @return {number}
     */
    getScore() {
        return this._score;
    }

    /**
     * Restituisce il riferimento all'immagine della carta.
     * @return {*}
     */
    getImage() {
        return IMAGES[this._seed][this._value];
    }
}

/**
 * Carta di gioco messa in campo da un utente.
 */
export class PlayedCard extends Card {
    /**
     * @var {number}
     * @private
     */
    _playerId;

    /**
     * Inizializza una carta giocata.
     * @param id {number}
     * @param playedId {number}
     */
    constructor(id, playedId) {
        super(id);
        this._playerId = playedId;
    }

    /**
     * Restituisce l'ID del giocatore che ha giocato la carta.
     * @return {number}
     */
    getPlayerId() {
        return this._playerId;
    }
}