import React from "react";
import './FourPlayerPage.css';

class FourPlayersPage extends React.Component {
    render() {
        return (
            <div className="four-player-page">
                <Header/>
                <Main/>
            </div>
        );
    }
}
export default FourPlayersPage;

function Header() {
    return (
        <header className="four-player-page__header">
            <span className="app-title">Briscola P2P</span>
        </header>
    );
}

function Main() {
    return (
        <main className="four-player-page__main">
            Game board for 4 players
        </main>
    );
}