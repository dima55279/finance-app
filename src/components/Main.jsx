import React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import Header from './Header';
import Footer from './Footer';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChart from './PieChart';
import PolarAreaChart from './PolarAreaChart';
import { Chart, registerables } from "chart.js/auto";

Chart.register(...registerables);

function Main() {

    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const [selectedChart, setSelectedChart] = useState('line');

    const renderSelectedChart = () => {
        switch(selectedChart) {
            case 'line':
                return <LineChart />;
            case 'bar':
                return <BarChart />;
            case 'pie':
                return <PieChart />;
            case 'polar':
                return <PolarAreaChart />;
            default:
                return <LineChart />;
        }
    };

    return (
        <>
        <Header />
        <main className="main">
            {!isAuthenticated && (
                <div>
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
                    <div>
                        <h1>Примеры отображаемых графиков</h1>
                        <div className="main__chart-select-div">
                            <label htmlFor="chart-type">
                                Выберите тип графика:
                            </label>
                            <select id="chart-type" value={selectedChart} onChange={(e) => setSelectedChart(e.target.value)} className="main__chart-option">
                                <option value="line" className="main__chart-option">Линейный график</option>
                                <option value="bar" className="main__chart-option">Столбчатая диаграмма</option>
                                <option value="pie" className="main__chart-option">Круговая диаграмма</option>
                                <option value="polar" className="main__chart-option">Полярная диаграмма</option>
                            </select>
                        </div>

                        <div className="main__chart-div">
                            {renderSelectedChart()}
                        </div>
                    </div>
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