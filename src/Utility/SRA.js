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
     * @var {bigInt}
     * @private
     */
    _p;

    /**
     * @var {bigInt}
     * @private
     */
    _q;

    /**
     * Inizializza un'istanza di SRA.
     * @param p {bigInt}
     * @param q {bigInt}
     */
    constructor(p, q) {
        if (typeof p === 'string') {
            p = new bigInt(p);
        }
        if (typeof q === 'string') {
            q = new bigInt(q);
        }

        this._p = p;
        this._q = q;
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
     * Restituisce il valore del parametro p.
     * @return {bigInt}
     */
    getP() {
        return this._p;
    }

    /**
     * Restituisce il valore del parametro q.
     * @return {bigInt}
     */
    getQ() {
        return this._q;
    }

    /**
     * Genera un'istanza di SRA.
     * @returns {SRA}
     */
    static generate() {
        let p, q;
        do {
            p = bigInt.randBetween(1000, 9999);
        } while (! p.isPrime());

        do {
            q = bigInt.randBetween(1000, 9999);
        } while (! q.isPrime());

        return new SRA(p, q);
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