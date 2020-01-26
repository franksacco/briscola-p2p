import React from "react";
import '../assets/bootstrap.scss'
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Home from "../Home/Home";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {username: null};
        this.setUsername = this.setUsername.bind(this);
    }

    setUsername(username) {
        this.setState({username: username});
    }

    render() {
        if (this.state.username) {
            return <Home username={this.state.username} />;
        }

        return (
            <div className="page">
                <header className="page__header">
                    <span className="app-name">Briscola P2P</span>
                </header>
                <main className="page__main">
                    <LoginForm setUsername={this.setUsername}/>
                </main>
            </div>
        );
    }
}
export default App;

class LoginForm extends React.Component{
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        this.props.setUsername(document.getElementById('username').value);
    }

    render() {
        return (
            <Card>
                <Card.Header>Inserisci il tuo username</Card.Header>
                <Card.Body>
                    <Form onSubmit={this.onSubmit}>
                        <Form.Group>
                            <Form.Control id="username" type="text" placeholder="Username" required/>
                        </Form.Group>
                        <Button type="submit">Continua</Button>
                    </Form>
                </Card.Body>
            </Card>
        );
    }
}