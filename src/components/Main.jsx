import React from 'react';
import { useSelector } from 'react-redux';
import Header from './Header';
import Footer from './Footer';

function Main() {

    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    
    return (
        <>
        <Header />
        <main className="main">
            {!isAuthenticated && (
                <div>
                    <h1>Веб-приложение для управления бюджетом</h1>
                    <p>
                        Данное веб-приложение позволяет Вам настроить контроль над собственным бюджетом.
                    </p>
                    <p>
                        Вы можете создавать и удалять собственные категории доходов и расходов, выбирать цвета категориям для дальнейшего отображения на графиках, 
                        задавать лимит бюджета на месяц, добавлять финансовые операции, а также фильтровать их по дате и категории.
                    </p>
                    <p>
                        Весь функционал веб-приложения будет доступен после регистрации.
                    </p>
                </div>
            )}
            {isAuthenticated && (
                <div>
                    <p>
                        Здесь будут размещены графики для авторизированных пользователей.
                    </p>
                </div>
            )}
        </main>
        <Footer />
        </>
    );
}

export default Main;