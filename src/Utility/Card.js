const scores = [
    0,  // Due
    0,  // Quattro
    0,  // Cinque
    0,  // Sei
    0,  // Sette
    2,  // Fante
    3,  // Cavallo
    4,  // Re
    10, // Tre
    11  // Asso
];

class Card {
    _value;
    _seed;
    _score;

    constructor(value, seed) {
        this._value = value;
        this._seed = seed;
        this._score = scores[this._value];
    }

    get value() {
        return this._value;
    }

    get seed() {
        return this._seed;
    }

    get score() {
        return this._score;
    }
}
export default Card;

export const SEED_BASTONI = 0;
export const SEED_COPPE = 1;
export const SEED_DENARI = 2;
export const SEED_SPADE = 3;