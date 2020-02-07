import Card from "./Card";


class Deck {
    /**
     * Genera il mazzo delle carte.
     * @returns {Card[]} Restituisce il mazzo completo e ordinato.
     */
    static create() {
        let deck = [];
        for (let i = 1; i <= 40; i++) {
            deck.push(new Card(i));
        }
        return deck;
    }

    /**
     * Mescola un generico array di elementi in modo casuale.
     * @param array {*[]} La lista da mescolare.
     */
    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Determina il vincitore di una mano.
     * @param playedCards {PlayedCard[]} La lista delle carte giocate.
     * @param briscolaSeed {number} Il seme della briscola.
     * @returns {number} Restituisce l'id del giocatore vincitore.
     */
    static roundWinner(playedCards, briscolaSeed) {
        // Controllo carta con seme fissato (briscola) più alta.
        const briscolaCards = playedCards
            .filter(playedCard => playedCard.getSeed() === briscolaSeed);

        if (briscolaCards.length > 0) {
            // È presente almeno una carta di briscola.
            // Ordiniamo solo le carte di briscola secondo il campo value in
            // modo decrescente e restituiamo la prima.
            const sorted = briscolaCards.sort((pc1, pc2) =>
                pc2.getValue() - pc1.getValue()
            );
            return sorted[0].getPlayerId();

        } else {
            // Non è presente nessuna carta di briscola.
            // Quindi vince la carta più alta riferita al seme della prima giocata.
            return this.roundWinner(playedCards, playedCards[0].getSeed());
        }
    }

    /**
     * Calcula i punti totali di una mano.
     * @param playedCards {PlayedCard[]} La lista delle carte giocate.
     */
    static scores(playedCards) {
        return playedCards
            .reduce((acc, playedCard) => acc + playedCard.getScore(), 0);
    }
}
export default Deck;