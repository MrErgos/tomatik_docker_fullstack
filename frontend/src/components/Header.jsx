import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <header className="header" id='header'>
      <div className="header_logo">
        <a href="/">ТомITик</a>
      </div>
      <nav className="header_nav">
        <ul className="header_list">
          <li><a href="/#project-about">О проекте</a></li>
          <li><a href="/#team">Команда</a></li>
          <li><a href="/analyse">Анализ</a></li>
        </ul>
      </nav>
    </header>
  );
}
