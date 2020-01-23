import React from "react";
import $ from 'jquery';

class GameBoard extends React.Component {
    componentDidMount() {
        $.post({
            url: "http://localhost:3003/rooms/add",
            data: JSON.stringify(this.props.room),
            dataType: 'json',
            success: (data) => {
                console.log(data)
            }
        });
    }

    componentWillUnmount() {
        $.post({
            url: "http://localhost:3003/rooms/remove",
            data: JSON.stringify({masterId: this.props.room.masterId}),
            dataType: 'json',
            success: (data) => {
                console.log(data)
            }
        });
    }

    render() {
        return (
            <div className="game-page">

            </div>
        );
    }
}
export default GameBoard;