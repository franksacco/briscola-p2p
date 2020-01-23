import React from "react";
import Peer from "peerjs";
import GameBoard from "../GameBoard/GameBoard";
import Home from "../Home/Home";
import Login from "../Login/Login";
import '../assets/bootstrap.scss'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: null,
            peer: new Peer(null, {debug: 3}),
            room: null
        };

        this.setUsername = this.setUsername.bind(this);
        this.setRoom = this.setRoom.bind(this);
    }

    setUsername(username) {
        this.setState({username: username});
    }

    setRoom(room) {
        room.masterId = this.state.peer.id;
        this.setState({room: room});
    }

    render() {
        if (this.state.username) {

            if (this.state.room) {
                return <GameBoard room={this.state.room}/>;

            } else {
                return <Home username={this.state.username} setRoom={this.setRoom}/>;
            }

        } else {
            return <Login setUsername={this.setUsername}/>;
        }
    }
}
export default App;