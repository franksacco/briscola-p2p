import Card, {SEED_BASTONI, SEED_COPPE, SEED_DENARI, SEED_SPADE} from "./Card";

class Deck {
    static create() {
        let cards = [];
        [SEED_BASTONI, SEED_COPPE, SEED_DENARI, SEED_SPADE].forEach(seed => {
            Array(10).keys().forEach(value => {
                cards.push(new Card(value, seed))
            });
        });
        return cards;
    }

    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
export default Deck;