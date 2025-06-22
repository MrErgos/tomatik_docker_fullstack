import React from 'react';
import './Register.css';
import api from '../api';

export default function Login() {
    const handleLogin = async (event) => {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await api.post('/api/login', { email, password }, { withCredentials: true });

            const csrfToken = response.headers['x-csrf-token'];
            if (csrfToken) {
                localStorage.setItem("csrfToken", csrfToken);
            }

            alert("Успешный вход в систему.");
            window.location.href = "/analyse";
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message;
            alert("Ошибка входа: " + errorMsg);
        }
    };

    return (
        <main>
            <div className="form-container" style={{ marginTop: '80px' }}>
                <h2>Вход в систему</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input type="password" id="password" name="password" required />
                    </div>
                    <button type="submit">Войти</button>
                </form>
            </div>
        </main>
    );
}
