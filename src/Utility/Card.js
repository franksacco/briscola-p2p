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


export const SEED_BASTONI = 0;
export const SEED_COPPE = 1;
export const SEED_DENARI = 2;
export const SEED_SPADE = 3;

export const SEED_MAP = [
    'Bastoni',
    'Coppe',
    'Denari',
    'Spade'
];

export const VALUE_MAP = [
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

export const SCORES_MAP = [
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

export const IMAGES = {
    0: [
        img_0_0,
        img_0_1,
        img_0_2,
        img_0_3,
        img_0_4,
        img_0_5,
        img_0_6,
        img_0_7,
        img_0_8,
        img_0_9
    ],
    1: [
        // TODO
    ],
    2: [
        img_2_0,
        img_2_1,
        img_2_2,
        img_2_3,
        img_2_4,
        img_2_5,
        img_2_6,
        img_2_7,
        img_2_8,
        img_2_9
    ],
    3: [
        // TODO
    ]
};

class Card {
    value;
    seed;
    score;

    constructor(value, seed) {
        this.value = value;
        this.seed = seed;
        this.score = SCORES_MAP[this.value];
    }
}
export default Card;