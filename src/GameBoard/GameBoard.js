import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import Match from "../Utility/Match";
import {IMAGES, SEED_MAP, VALUE_MAP} from "../Utility/Card";
import './GameBoard.css';
import img_back from '../assets/cards/back.png';
import Spinner from "react-bootstrap/Spinner";


class GameBoard extends React.Component {
    _match;

    constructor(props) {
        super(props);
        this.state = {
            briscola: null,
            isMyRound: false,
            cards: [],
            roundCards: [],
            matchEnd: false,
            score: 0
        };

        this.onCardClicked = this.onCardClicked.bind(this);
    }

    componentDidMount() {
        this._match = new Match(this, this.props.otherPeers);
        this._match.init(this.props.master);
    }

    initCards(briscola, initialCards) {
        this.setState({
            briscola: briscola,
            cards: initialCards
        });
    }

    setIsMyRound() {
        this.setState({isMyRound: true});
    }

    addCard(card) {
        let cards = this.state.cards;
        cards.push(card);
        this.setState({cards: cards});
    }

    addPlayedCard(card) {
        let playedCards = this.state.roundCards;
        playedCards.push(card);
        this.setState({roundCards: playedCards});
    }

    resetPlayedCards() {
        this.setState({roundCards: []});
    }

    onCardClicked(event, index) {
        if (this.state.isMyRound) {
            let cards = this.state.cards;
            const card = cards.splice(index, 1)[0];
            this.setState({
                isMyRound: false,
                cards: cards
            });
            this._match.playCard(card);
        }
    }

    matchEnd(score) {
        this.setState({
            matchEnd: true,
            score: score
        });
    }

    render() {
        if (! this.state.briscola) {
            return (
                <div className="board">
                    <Spinner animation="border" variant="light"/>
                    Sto mescolando il mazzo...
                </div>
            );
        }

        let round = this.state.isMyRound ? <div className="my-turn">Tocca a te</div> : "";
        let cards = this.state.cards.map((card, i) => {
            return (
                <Card key={i}
                      card={card}
                      onClick={(e) => this.onCardClicked(e, i)} />
            );
        });

        let playedCards = this.state.roundCards.map((playedCard, i) => {
            return <Card key={i} card={playedCard.card} />;
        });

        return (<>
            <div className="board">
                {round}
                <div className="deck">
                    <Card card={this.state.briscola} />
                </div>
                <div className="played-cards">
                    {playedCards}
                </div>
                <div className="my-cards">
                    {cards}
                </div>
            </div>
            <EndMatchModal
                show={this.state.matchEnd}
                back={() => this.props.back()}
                score={this.state.score} />
        </>);
    }
}
export default GameBoard;

function Card(props) {
    const card = props.card;
    return (
        <div className="briscola-card">
            <div className="briscola-card__inner">
                <div className="briscola-card__front">
                    <img src={IMAGES[card.seed][card.value]}
                         alt={VALUE_MAP[card.value] + " di " + SEED_MAP[card.seed]}
                         onClick={(e) => props.onClick(e)} />
                </div>
                <div className="briscola-card__back">
                    <img src={img_back}
                         alt="Retro carta" />
                </div>
            </div>
        </div>
    );
}

function EndMatchModal(props) {
    return (
        <Modal show={props.show} onHide={() => props.back()} aria-labelledby="modal-title" centered>
            <Modal.Header>
                <Modal.Title id="modal-title">
                    Partita terminata
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Il tuo punteggio è {props.score}
            </Modal.Body>
            <Modal.Footer>
                <Button type="button" variant="primary" onClick={() => props.back()}>Esci</Button>
            </Modal.Footer>
        </Modal>
    );
}