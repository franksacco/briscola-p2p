import React from "react";
import './TwoPlayerPage.css';

class TwoPlayersPage extends React.Component {
    render() {
        return (
            <div className="two-player-page">
                <Header/>
                <Main/>
            </div>
        );
    }
}
export default TwoPlayersPage;

function Header() {
    return (
        <header className="two-player-page__header">
            <span className="app-title">Briscola P2P</span>
        </header>
    );
}

function Main() {
    return (
        <main className="two-player-page__main">
            Game board for 2 players
        </main>
    );
}