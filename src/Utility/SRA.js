const bigInt = require('big-integer');


class SRA {
    /**
     * @var {bigInt}
     * @private
     */
    _n;

    /**
     * @var {bigInt}
     * @private
     */
    _e;

    /**
     * @var {bigInt}
     * @private
     */
    _d;

    /**
     * Inizializza un'istanza di SRA.
     * @param p {bigInt}
     * @param q {bigInt}
     */
    constructor(p, q) {
        this._n = p.multiply(q);
        const lambda = bigInt.lcm(p.minus(1), q.minus(1));

        // Generazione di e.
        do {
            this._e = bigInt.randBetween(2, lambda);
        } while (bigInt.gcd(this._e, lambda).neq(bigInt.one));

        // Generazione di d.
        this._d = this._e.modInv(lambda);
    }

    /**
     * Genera un'istanza di SRA.
     * @returns {SRA}
     */
    static generate() {
        // TODO: Impostiamo p e q fissi?
        return new SRA(new bigInt(1039), new bigInt(6761));
    }

    /**
     * Cripta un messaggio.
     * @param plain {number|string|bigInt}
     * @return {bigInt}
     */
    encrypt(plain) {
        if (typeof plain === 'number' || typeof plain === 'string') {
            plain = new bigInt(plain);
        }
        return plain.modPow(this._e, this._n);
    }

    /**
     * Decripta un messaggio.
     * @param cipher {string|bigInt}
     * @return {bigInt}
     */
    decrypt(cipher) {
        if (typeof cipher === 'string') {
            cipher = new bigInt(cipher);
        }
        return cipher.modPow(this._d, this._n);
    }
}
export default SRA;