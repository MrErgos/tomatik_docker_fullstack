import React from 'react';
import './Footer.css'

export default function Footer() {
    return (
        <>
            <footer className="footer">
                <div className='footer__container'>
                    <div className="footer__section footer__logo">
                        <a href="/">ТомITик</a>
                    </div>
                    <div className='footer__section footer__contacts'>
                        <h3>Наши контакты</h3>
                        <p>+7(996)697-92-36</p>
                        <p>tomITik@gmail.com</p>
                    </div>
                    <nav className="footer__section footer__nav">
                        <ul className="footer__list">
                            <li><a href="/#project-about">О проекте</a></li>
                            <li><a href="/#team">Команда</a></li>
                            <li><a href="/analyse">Анализ</a></li>
                        </ul>
                    </nav>
                </div>
            </footer>
        </>
    );
}
