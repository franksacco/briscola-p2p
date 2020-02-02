import Card, {SEED_BASTONI, SEED_DENARI} from "./Card";

class Deck {
    /**
     * Genera il mazzo delle carte.
     *
     * @returns Card[] Restituisce il mazzo completo e ordinato.
     */
    static create() {
        let cards = [];
        [SEED_BASTONI, SEED_DENARI].forEach(seed => {
            [...Array(10).keys()].forEach(value => {
                cards.push(new Card(value, seed))
            });
        });
        return cards;
    }

    /**
     * Mescola un generico array di elementi in modo casuale.
     *
     * @param array La lista da mescolare.
     */
    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Determina il vincitore di una mano.
     *
     * @param playedCards La lista delle carte giocate.
     * @param briscolaSeed Il seme della briscola.
     * @returns Number Restituisce l'id del giocatore vincitore.
     */
    static roundWinner(playedCards, briscolaSeed) {
        // Controllo carta con seme fissato (briscola) più alta.
        const briscolaCards = playedCards
            .filter(playedCard => playedCard.card.seed === briscolaSeed);

        if (briscolaCards.length > 0) {
            // È presente almeno una carta di briscola.
            // Ordiniamo solo le carte di briscola secondo il campo value in
            // modo decrescente e restituiamo la prima.
            const sorted = briscolaCards.sort((pc1, pc2) =>
                pc2.card.value - pc1.card.value
            );
            return sorted[0].playerId;

        } else {
            // Non è presente nessuna carta di briscola.
            // Quindi vince la carta più alta riferita al seme della prima giocata.
            return this.roundWinner(playedCards, playedCards[0].card.seed);
        }
    }

    /**
     * Calcula i punti totali di una mano.
     *
     * @param playedCards La lista delle carte giocate.
     */
    static scores(playedCards) {
        return playedCards
            .reduce((acc, playedCard) => acc + playedCard.card.score, 0);
    }
}
export default Deck;