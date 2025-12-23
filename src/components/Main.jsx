import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Header from './Header';
import Footer from './Footer';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChart from './PieChart';
import PolarAreaChart from './PolarAreaChart';
import { Chart, registerables } from "chart.js/auto";
import { selectors as categoriesSelectors } from '../slices/categoriesSlice';
import { selectors as operationsSelectors } from '../slices/operationsSlice';

Chart.register(...registerables);

function Main() {

    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const currentUser = useSelector(state => state.auth.currentUser);
    const [selectedChart, setSelectedChart] = useState('line');
    const [dataType, setDataType] = useState('all'); 

    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
    const [selectedDateFilter, setSelectedDateFilter] = useState('all');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const allCategories = useSelector(categoriesSelectors.selectAll);
    const allOperations = useSelector(operationsSelectors.selectAll);

    const userCategories = useMemo(() => {
        return allCategories.filter(
            category => category.author === currentUser?.id
        );
    }, [allCategories, currentUser?.id]);

    const userOperations = useMemo(() => {
        return allOperations
            .filter(operation => operation.author === currentUser?.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [allOperations, currentUser?.id]);

    const filteredOperations = useMemo(() => {
        let filtered = userOperations;

        if (selectedCategoryFilter !== 'all') {
            filtered = filtered.filter(operation => 
                operation.categoryId === selectedCategoryFilter
            );
        }

        const now = new Date();
        switch (selectedDateFilter) {
            case 'week': {
                const weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                filtered = filtered.filter(operation => 
                    new Date(operation.date) >= weekAgo
                );
                break;
            }
            case 'month': {
                const monthAgo = new Date(now);
                monthAgo.setMonth(now.getMonth() - 1);
                filtered = filtered.filter(operation => 
                    new Date(operation.date) >= monthAgo
                );
                break;
            }
            case 'year': {
                const yearAgo = new Date(now);
                yearAgo.setFullYear(now.getFullYear() - 1);
                filtered = filtered.filter(operation => 
                    new Date(operation.date) >= yearAgo
                );
                break;
            }
            case 'selected_year': {
                filtered = filtered.filter(operation => 
                    new Date(operation.date).getFullYear() === selectedYear
                );
                break;
            }
            case 'selected_month': {
                filtered = filtered.filter(operation => {
                    const opDate = new Date(operation.date);
                    return opDate.getFullYear() === selectedYear && 
                           opDate.getMonth() + 1 === selectedMonth;
                });
                break;
            }
            case 'all':
            default:
                break;
        }

        return filtered;
    }, [userOperations, selectedCategoryFilter, selectedDateFilter, selectedYear, selectedMonth]);

    const availableYears = useMemo(() => {
        const years = userOperations.map(op => new Date(op.date).getFullYear());
        const uniqueYears = [...new Set(years)].sort((a, b) => b - a);
        return uniqueYears;
    }, [userOperations]);

    const getDataTypeText = useMemo(() => (type) => {
        switch(type) {
            case 'all': return 'доходов и расходов';
            case 'income': return 'доходов';
            case 'expense': return 'расходов';
            default: return 'операций';
        }
    }, []);

    const prepareChartData = (chartType, dataType) => {
        if (filteredOperations.length === 0) {
            return getEmptyChartData(chartType, dataType);
        }
        
        switch(chartType) {
            case 'line':
                return prepareLineChartData(dataType);
            case 'bar':
                return prepareBarChartData(dataType);
            case 'pie':
                return preparePieChartData(dataType);
            case 'polar':
                return preparePolarChartData(dataType);
            default:
                return prepareLineChartData(dataType);
        }
    };

    const prepareLineChartData = (dataType) => {
        const operationsByDate = {};
        
        filteredOperations.forEach(op => {
            const date = new Date(op.date).toLocaleDateString('ru-RU');
            if (!operationsByDate[date]) {
                operationsByDate[date] = { income: 0, expense: 0 };
            }
            
            const category = userCategories.find(c => c.id === op.categoryId);
            if (category) {
                if (category.type === 'income') {
                    operationsByDate[date].income += Math.abs(op.amount);
                } else if (category.type === 'expense') {
                    operationsByDate[date].expense += Math.abs(op.amount);
                }
            }
        });

        const dates = Object.keys(operationsByDate).sort((a, b) => {
            const parseDate = (dateString) => {
                const [day, month, year] = dateString.split('.');
                return new Date(year, month - 1, day);
            };
            return parseDate(a) - parseDate(b);
        });

        const datasets = [];
        
        if (dataType === 'all' || dataType === 'income') {
            datasets.push({
                label: 'Доходы',
                data: dates.map(date => operationsByDate[date].income),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: dataType === 'all',
                tension: 0.4,
            });
        }
        
        if (dataType === 'all' || dataType === 'expense') {
            datasets.push({
                label: 'Расходы',
                data: dates.map(date => operationsByDate[date].expense),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: dataType === 'all',
                tension: 0.4,
            });
        }

        return {
            labels: dates,
            datasets
        };
    };

    const prepareBarChartData = (dataType) => {
        const incomeByCategory = {};
        const expenseByCategory = {};
        
        filteredOperations.forEach(op => {
            const category = userCategories.find(c => c.id === op.categoryId);
            if (category) {
                if (category.type === 'income') {
                    if (!incomeByCategory[category.name]) {
                        incomeByCategory[category.name] = 0;
                    }
                    incomeByCategory[category.name] += Math.abs(op.amount);
                } else if (category.type === 'expense') {
                    if (!expenseByCategory[category.name]) {
                        expenseByCategory[category.name] = 0;
                    }
                    expenseByCategory[category.name] += Math.abs(op.amount);
                }
            }
        });
        
        let allCategoryNames = [];
        
        if (dataType === 'all') {
            allCategoryNames = [
                ...new Set([
                    ...Object.keys(incomeByCategory),
                    ...Object.keys(expenseByCategory)
                ])
            ];
        } else if (dataType === 'income') {
            allCategoryNames = Object.keys(incomeByCategory);
        } else if (dataType === 'expense') {
            allCategoryNames = Object.keys(expenseByCategory);
        }
        
        const datasets = [];
        
        if (dataType === 'all' || dataType === 'income') {
            datasets.push({
                label: 'Доходы',
                data: allCategoryNames.map(name => incomeByCategory[name] || 0),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            });
        }
        
        if (dataType === 'all' || dataType === 'expense') {
            datasets.push({
                label: 'Расходы',
                data: allCategoryNames.map(name => expenseByCategory[name] || 0),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            });
        }

        return {
            labels: allCategoryNames,
            datasets
        };
    };

    const preparePieChartData = (dataType) => {
        let operationsForPie = [];
        
        if (dataType === 'all' || dataType === 'expense') {
            operationsForPie = filteredOperations.filter(op => {
                const category = userCategories.find(c => c.id === op.categoryId);
                return category && category.type === 'expense';
            });
        } else if (dataType === 'income') {
            operationsForPie = filteredOperations.filter(op => {
                const category = userCategories.find(c => c.id === op.categoryId);
                return category && category.type === 'income';
            });
        }
        
        if (operationsForPie.length === 0) {
            return {
                labels: ['Нет данных'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#cccccc'],
                }]
            };
        }
        
        const dataByCategory = {};
        const colorsByCategory = {};
        
        operationsForPie.forEach(op => {
            const category = userCategories.find(c => c.id === op.categoryId);
            if (category) {
                if (!dataByCategory[category.name]) {
                    dataByCategory[category.name] = 0;
                    colorsByCategory[category.name] = category.color || '#cccccc';
                }
                dataByCategory[category.name] += Math.abs(op.amount);
            }
        });
        
        return {
            labels: Object.keys(dataByCategory),
            datasets: [{
                data: Object.values(dataByCategory),
                backgroundColor: Object.keys(dataByCategory).map(name => colorsByCategory[name]),
            }]
        };
    };

    const preparePolarChartData = (dataType) => {
        let operationsForPolar = [];
        
        if (dataType === 'all' || dataType === 'income') {
            operationsForPolar = filteredOperations.filter(op => {
                const category = userCategories.find(c => c.id === op.categoryId);
                return category && category.type === 'income';
            });
        } else if (dataType === 'expense') {
            operationsForPolar = filteredOperations.filter(op => {
                const category = userCategories.find(c => c.id === op.categoryId);
                return category && category.type === 'expense';
            });
        }
        
        if (operationsForPolar.length === 0) {
            return {
                labels: ['Нет данных'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#cccccc'],
                }]
            };
        }
        
        const dataByCategory = {};
        const colorsByCategory = {};
        
        operationsForPolar.forEach(op => {
            const category = userCategories.find(c => c.id === op.categoryId);
            if (category) {
                if (!dataByCategory[category.name]) {
                    dataByCategory[category.name] = 0;
                    colorsByCategory[category.name] = category.color || '#cccccc';
                }
                dataByCategory[category.name] += Math.abs(op.amount);
            }
        });
        
        return {
            labels: Object.keys(dataByCategory),
            datasets: [{
                data: Object.values(dataByCategory),
                backgroundColor: Object.keys(dataByCategory).map(name => colorsByCategory[name]),
            }]
        };
    };

    const getEmptyChartData = (chartType, dataType) => {
        const emptyData = {
            labels: ['Нет данных'],
            datasets: [{
                data: [1],
                backgroundColor: ['#cccccc'],
            }]
        };
        
        switch(chartType) {
            case 'line':
                const lineDatasets = [];
                if (dataType === 'all' || dataType === 'income') {
                    lineDatasets.push({
                        label: 'Доходы',
                        data: [0],
                        borderColor: 'rgba(75, 192, 192, 1)',
                    });
                }
                if (dataType === 'all' || dataType === 'expense') {
                    lineDatasets.push({
                        label: 'Расходы',
                        data: [0],
                        borderColor: 'rgba(255, 99, 132, 1)',
                    });
                }
                return {
                    labels: ['Нет операций'],
                    datasets: lineDatasets
                };
            case 'bar':
                const barDatasets = [];
                if (dataType === 'all' || dataType === 'income') {
                    barDatasets.push({
                        label: 'Доходы',
                        data: [0],
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    });
                }
                if (dataType === 'all' || dataType === 'expense') {
                    barDatasets.push({
                        label: 'Расходы',
                        data: [0],
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    });
                }
                return {
                    labels: ['Нет данных'],
                    datasets: barDatasets
                };
            case 'pie':
            case 'polar':
            default:
                return emptyData;
        }
    };
    
    const handleCategoryFilterChange = (e) => {
        setSelectedCategoryFilter(e.target.value);
    };

    const handleDateFilterChange = (e) => {
        setSelectedDateFilter(e.target.value);
    };

    const handleYearChange = (e) => {
        setSelectedYear(parseInt(e.target.value));
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(parseInt(e.target.value));
    };

    const handleDataTypeChange = (e) => {
        setDataType(e.target.value);
    };

    const chartData = useMemo(() => {
        return prepareChartData(selectedChart, dataType);
    }, [selectedChart, dataType, filteredOperations, userCategories]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `График ${getDataTypeText(dataType)}`
            }
        }
    }), [dataType, filteredOperations.length, getDataTypeText]);

    const getChartTitle = () => {
        const typeText = getDataTypeText(dataType);
        const chartText = selectedChart === 'line' ? 'Линейный график' :
                        selectedChart === 'bar' ? 'Столбчатая диаграмма' :
                        selectedChart === 'pie' ? 'Круговая диаграмма' : 'Полярная диаграмма';
        return `${chartText} (${typeText})`;
    };

    const renderSelectedChart = () => {
        if (!isAuthenticated || !currentUser) {
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
        }

        switch(selectedChart) {
            case 'line':
                return <LineChart data={chartData} options={chartOptions} />;
            case 'bar':
                return <BarChart data={chartData} options={chartOptions} />;
            case 'pie':
                return <PieChart data={chartData} options={chartOptions} />;
            case 'polar':
                return <PolarAreaChart data={chartData} options={chartOptions} />;
            default:
                return <LineChart data={chartData} options={chartOptions} />;
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
            {isAuthenticated && currentUser && (
                <div>
                    <h1>Аналитика ваших операций</h1>
                    <p>
                        Здесь вы можете просматривать графики на основе ваших финансовых операций.
                    </p>

                    <div>
                        <h3>Фильтры для графиков:</h3>
                        
                        <div>
                            <div className="main__chart-select-div">
                                <label htmlFor="category-filter-chart">Категория: </label>
                                <select id="category-filter-chart" value={selectedCategoryFilter} onChange={handleCategoryFilterChange} className="main__chart-option">
                                    <option value="all" className="main__chart-option">Все категории</option>
                                    {userCategories.map(category => (
                                        <option key={category.id} value={category.id} className="main__chart-option">
                                            {category.name} ({category.type === 'income' ? 'доход' : 'расход'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="main__chart-select-div">
                                <label htmlFor="date-filter-chart">Период: </label>
                                <select id="date-filter-chart" value={selectedDateFilter} onChange={handleDateFilterChange} className="main__chart-option">
                                    <option value="all" className="main__chart-option">Все время</option>
                                    <option value="week" className="main__chart-option">Последняя неделя</option>
                                    <option value="month" className="main__chart-option">Последний месяц</option>
                                    <option value="year" className="main__chart-option">Последний год</option>
                                    <option value="selected_year" className="main__chart-option">Выбранный год</option>
                                    <option value="selected_month" className="main__chart-option">Выбранный месяц</option>
                                </select>
                                
                                {selectedDateFilter === 'selected_year' && (
                                    <select value={selectedYear} onChange={handleYearChange} className="main__chart-option">
                                        {availableYears.map(year => (
                                            <option key={year} value={year} className="main__chart-option">{year} год</option>
                                        ))}
                                    </select>
                                )}
                                
                                {selectedDateFilter === 'selected_month' && (
                                    <>
                                        <select value={selectedYear} onChange={handleYearChange} className="main__chart-option">
                                            {availableYears.map(year => (
                                                <option key={year} value={year} className="main__chart-option">{year} год</option>
                                            ))}
                                        </select>
                                        <select value={selectedMonth} onChange={handleMonthChange} className="main__chart-option">
                                            <option value="1" className="main__chart-option">Январь</option>
                                            <option value="2" className="main__chart-option">Февраль</option>
                                            <option value="3" className="main__chart-option">Март</option>
                                            <option value="4" className="main__chart-option">Апрель</option>
                                            <option value="5" className="main__chart-option">Май</option>
                                            <option value="6" className="main__chart-option">Июнь</option>
                                            <option value="7" className="main__chart-option">Июль</option>
                                            <option value="8" className="main__chart-option">Август</option>
                                            <option value="9" className="main__chart-option">Сентябрь</option>
                                            <option value="10" className="main__chart-option">Октябрь</option>
                                            <option value="11" className="main__chart-option">Ноябрь</option>
                                            <option value="12" className="main__chart-option">Декабрь</option>
                                        </select>
                                    </>
                                )}
                            </div>
                            
                            <div className="main__chart-select-div">
                                <label htmlFor="data-type-filter">Тип данных: </label>
                                <select id="data-type-filter" value={dataType} onChange={handleDataTypeChange} className="main__chart-option">
                                    <option value="all" className="main__chart-option">Доходы и расходы</option>
                                    <option value="income" className="main__chart-option">Только доходы</option>
                                    <option value="expense" className="main__chart-option">Только расходы</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <p>Тип графика: {getChartTitle()}</p>
                        </div>
                    </div>

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
                        {filteredOperations.length > 0 ? (
                            renderSelectedChart()
                        ) : (
                            <div>
                                <p>Нет операций для отображения. Добавьте операции или измените фильтры.</p>
                                <p>Вы можете добавить операции в своем профиле.</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3>Описание графиков:</h3>
                        <ul>
                            <li>Линейный график - показывает динамику доходов и/или расходов по времени</li>
                            <li>Столбчатая диаграмма - сравнивает доходы и/или расходы по категориям</li>
                            <li>Круговая диаграмма - показывает распределение доходов или расходов по категориям</li>
                            <li>Полярная диаграмма - показывает распределение доходов или расходов по категориям в полярной системе координат</li>
                        </ul>
                        <p>Вы можете выбрать тип данных:</p>
                        <ul>
                            <li>Доходы и расходы - отображаются оба типа операций</li>
                            <li>Только доходы - отображаются только доходные операции</li>
                            <li>Только расходы - отображаются только расходные операции</li>
                        </ul>
                    </div>
                </div>
            )}
        </main>
        <Footer />
        </>
    );
}

export default Main;