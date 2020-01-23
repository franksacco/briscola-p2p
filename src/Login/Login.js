import React from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import './Login.css';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.setUsername = this.setUsername.bind(this);
    }

    setUsername(username) {
        this.props.setUsername(username);
    }

    render() {
        return (
            <div className="login-page">
                <header className="login-page__header">
                    <span className="app-title">Briscola P2P</span>
                </header>
                <main className="login-page__main">
                    <LoginForm setUsername={this.setUsername}/>
                </main>
            </div>
        );
    }
}
export default Login;

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
            <Card className="login-page__main-box">
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