import React from "react";
import {Link} from "react-router-dom";
import './StartPage.css';

function StartPage() {
    return (
        <div className="start-page">
            <Header/>
            <Main/>
        </div>
    );
}
export default StartPage;

function Header() {
    return (
        <header className="start-page__header">
            <span className="app-title">Briscola P2P</span>
        </header>
    );
}

function Main() {
    return (
        <main className="start-page__main">
            <Link to="/two-players"><Button>2 giocatori</Button></Link>
            <Link to="/four-players"><Button>4 giocatori</Button></Link>
        </main>
    );
}

function Button(props) {
    return (
        <div className="game-select-button">
            {props.children}
        </div>
    );
}