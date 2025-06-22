import React from 'react';
import './Register.css';
import api from '../api'; // импорт конфигурированного axios-инстанса

export default function Register() {
    const handleRegister = async (event) => {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirm = document.getElementById("confirm").value;

        if (password !== confirm) {
            alert("Пароли не совпадают!");
            return;
        }

        if (!validatePassword(password)) {
            alert(
                "Пароль должен содержать хотя бы одну цифру, одну заглавную и строчную букву и быть длиной от 8 символов."
            );
            return;
        }

        try {
            await api.post('/api/register', { email, password });
            alert("Регистрация прошла успешно. Теперь вы можете войти.");
            window.location.href = "/login";
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.message;
            alert("Ошибка регистрации: " + errorMsg);
        }
    };

    const validatePassword = (password) => {
        const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        return re.test(password);
    };

    return (
        <main>
            <div className="form-container" style={{ marginTop: '80px' }}>
                <h2>Регистрация</h2>
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input type="password" id="password" name="password" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm">Подтверждение пароля</label>
                        <input type="password" id="confirm" name="confirm" required />
                    </div>
                    <button type="submit">Зарегистрироваться</button>
                </form>
            </div>
        </main>
    );
}
