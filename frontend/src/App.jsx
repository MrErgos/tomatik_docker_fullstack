import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Header from './components/Header';
import Footer from './components/Footer';
import './main.css'
import Analysis from "./pages/Analysis";

function App() {
    return (
        <Router>
            <Header/>
            <div className="app-container">
                <main>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/analyse" element={<Analysis/>}/>
                    </Routes>
                </main>
            </div>
            <Footer/>
        </Router>
    );
}

export default App;