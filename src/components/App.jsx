/* 
Компонент App. Используется для маршрутизации приложения.
Данный компонент содержит контекст маршрутизации.
*/
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './Main';
import Login from './Login';
import Registration from './Registration';
import Profile from './Profile';

// Корневой компонент приложения, отвечающий за маршрутизацию
function App() {
    return (
        // BrowserRouter предоставляет контекст маршрутизации для всего приложения
        <BrowserRouter>
            {/* Routes - контейнер для определения всех маршрутов приложения */}
            <Routes>
                {/* 
                  Основной маршрут (*) - отображает компонент Main для всех путей по умолчанию
                  Используется как заглушка для несуществующих маршрутов
                */}
                <Route path="*" element={<Main />} />
                
                {/* Маршрут для страницы входа - отображает компонент Login */}
                <Route path="/login" element={<Login />} />
                
                {/* Маршрут для страницы регистрации - отображает компонент Registration */}
                <Route path="/registration" element={<Registration />} />
                
                {/* Маршрут для страницы профиля пользователя - отображает компонент Profile */}
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </BrowserRouter>
    );
}

// Экспорт компонента App для использования в корневом index.js
export default App;