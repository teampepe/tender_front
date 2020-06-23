import React from 'react';
import HeaderView from '../../components/header/HeaderView';
import Obstanovka from '../../assets/obstanovka.mp3';

import './Login.scss';
import axios from 'axios';
import { Redirect } from 'react-router';
import cookie from 'react-cookies'

class Login extends React.PureComponent {
    obstanovka = new Audio(Obstanovka);

    state = {
        login: '',
        password: '',
        error: '',
        obstanovkaPoKaifu: false,
    };

    renderForm = () => {
        const obstanovkaClassName = this.state.obstanovkaPoKaifu ? 'disabled' : '';

        const renderError = () => {
            const { error } = this.state;
            if(!error){
                return null;
            }

            return <div className="error">{error}</div>;
        };

        return (
            <div className="credentials">
                {renderError()}
                <h2>Авторизация</h2>
                <input value={this.state.login} onChange={(e) => this.setState({login: e.target.value})} type="text" placeholder="Логин"/>
                <input value={this.state.password} onChange={(e) => this.setState({password: e.target.value})} type="password" placeholder="Пароль"/>
                <div className="controls">
                    <div onClick={this.handleLogin} className="btn">ВОЙТИ</div>
                    <div onClick={ this.obstanovkaHandler } className={['btn', 'green', obstanovkaClassName].join(' ')}>СДЕЛАТЬ ОБСТАНОВКУ</div>
                </div>
            </div>
        );
    };

    obstanovkaHandler = () => {
        if (!this.state.obstanovkaPoKaifu) {
            this.setState({obstanovkaPoKaifu: true}, () => {
                this.obstanovka.play();
            });
        }
    };

    handleLogin = () => {
        const login = this.state.login;
        const password = this.state.password;

        axios.post('http://35.228.6.45:5000/login',  { login, password }).then(response => {
            if(response.status === 200){
                const token = response.data.token;
                cookie.save('token', token);
                this.setState({error: null});
                this.forceUpdate();
            } else {
                this.setState({error: 'Произошла ошибка, обновите страницу.'});
                cookie.remove('token');
            }
        }).catch(error => {
            this.setState({error: 'Неверные данные!'});
            cookie.remove('token');
        });
    };

    render() {
        const token = cookie.load('token');

        if(token){
            return <Redirect to="/" />
        }

        return (
            <>
                <HeaderView/>
                <div className="login-view">
                    { this.renderForm() }
                </div>
            </>
        );
    }
}

export default Login;