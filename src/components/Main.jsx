/* 
Компонент Main. Используется для отображения основной страницы приложения. 
Данный компонент содержит контент основной страницы, включая аналитику и графики. 
*/
import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Loader from './Loader';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChart from './PieChart';
import PolarAreaChart from './PolarAreaChart';
import { Chart, registerables } from "chart.js/auto";
import { useGetCategoriesByUserQuery } from '../slices/api/categoriesApi';
import { useGetOperationsByUserQuery } from '../slices/api/operationsApi';
import { useGetCurrentUserQuery } from '../slices/api/usersApi';

// Регистрация всех необходимых компонентов Chart.js для работы графиков
Chart.register(...registerables);

// Основной компонент главной страницы приложения с аналитикой и графиками
function Main() {
    // Получение токена доступа и ID пользователя из localStorage
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');

    // Запрос на получение данных текущего пользователя (только если есть токен)
    const { data: currentUser, isLoading: userLoading, error: userError } = useGetCurrentUserQuery(undefined, {
        skip: !token
    });

    // Состояние для выбранного типа графика
    const [selectedChart, setSelectedChart] = useState('line');
    // Состояние для типа отображаемых данных (все/доходы/расходы)
    const [dataType, setDataType] = useState('all'); 

    // Состояния для фильтров
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
    const [selectedDateFilter, setSelectedDateFilter] = useState('all');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    // Запрос на получение категорий пользователя (только если есть токен)
    const { data: categoriesData = [], isLoading: categoriesLoading } = useGetCategoriesByUserQuery(undefined, {
        skip: !token
    });

    // Запрос на получение операций пользователя (только если есть токен)
    const { data: operationsData = [], isLoading: operationsLoading } = useGetOperationsByUserQuery(undefined, {
        skip: !token
    });

    // Общее состояние загрузки (объединяет загрузку пользователя, категорий и операций)
    const isLoading = userLoading || categoriesLoading || operationsLoading;

    // Проверка на неавторизованный доступ (ошибка 401)
    const isUnauthorized = userError?.status === 401;

    // Эффект для очистки localStorage при обнаружении неавторизованного доступа
    useEffect(() => {
        if (isUnauthorized) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
        }
    }, [isUnauthorized]);

    // Мемоизированный список категорий пользователя
    const userCategories = useMemo(() => {
        if (!token) return [];
        return [...categoriesData];
    }, [token, categoriesData]);

    // Мемоизированный список операций пользователя с нормализацией данных и сортировкой по дате
    const userOperations = useMemo(() => {
        if (!token) return [];
        
        if (!operationsData || operationsData.length === 0) {
            return [];
        }

        // Нормализация данных: приведение category_id к categoryId для единообразия
        const normalizedOperations = operationsData.map(op => ({
            ...op,
            categoryId: op.category_id,
        }));
        
        // Сортировка операций по дате (от новых к старым)
        return [...normalizedOperations].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [token, operationsData]);

    // Мемоизированные отфильтрованные операции на основе выбранных фильтров
    const filteredOperations = useMemo(() => {
        let filtered = userOperations;

        // Фильтрация по категории
        if (selectedCategoryFilter !== 'all') {
            const categoryId = parseInt(selectedCategoryFilter);
            filtered = filtered.filter(operation => 
                operation.categoryId === categoryId
            );
        }

        // Фильтрация по временному периоду
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

    // Мемоизированный список доступных лет на основе операций пользователя
    const availableYears = useMemo(() => {
        const years = userOperations.map(op => new Date(op.date).getFullYear());
        const uniqueYears = [...new Set(years)].sort((a, b) => b - a);
        return uniqueYears;
    }, [userOperations]);

    // Мемоизированная функция для получения текстового описания типа данных
    const getDataTypeText = useMemo(() => (type) => {
        switch(type) {
            case 'all': return 'доходов и расходов';
            case 'income': return 'доходов';
            case 'expense': return 'расходов';
            default: return 'операций';
        }
    }, []);

    // Функция для подготовки данных графика на основе выбранного типа графика и типа данных
    const prepareChartData = (chartType, dataType) => {
        if (filteredOperations.length === 0 || userCategories.length === 0) {
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

    // Функция подготовки данных для линейного графика
    const prepareLineChartData = (dataType) => {
        const operationsByDate = {};
        
        // Группировка операций по дате
        filteredOperations.forEach(op => {
            const date = new Date(op.date).toLocaleDateString('ru-RU');
            if (!operationsByDate[date]) {
                operationsByDate[date] = { income: 0, expense: 0 };
            }
            
            // Суммирование доходов и расходов по датам
            const category = userCategories.find(c => c.id === op.categoryId);
            if (category) {
                if (category.category_type === 'income') {
                    operationsByDate[date].income += Math.abs(op.amount);
                } else if (category.category_type === 'expense') {
                    operationsByDate[date].expense += Math.abs(op.amount);
                }
            }
        });

        // Сортировка дат в хронологическом порядке
        const dates = Object.keys(operationsByDate).sort((a, b) => {
            const parseDate = (dateString) => {
                const [day, month, year] = dateString.split('.');
                return new Date(year, month - 1, day);
            };
            return parseDate(a) - parseDate(b);
        });

        // Формирование наборов данных для графика
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

    // Функция подготовки данных для столбчатой диаграммы
    const prepareBarChartData = (dataType) => {
        const categoryStats = {};
        
        // Инициализация статистики по категориям
        userCategories.forEach(category => {
            categoryStats[category.id] = {
                name: category.name,
                income: 0,
                expense: 0,
                color: category.color
            };
        });
        
        // Суммирование доходов и расходов по категориям
        filteredOperations.forEach(op => {
            const category = userCategories.find(c => c.id === op.categoryId);
            if (category) {
                if (category.category_type === 'income') {
                    categoryStats[category.id].income += Math.abs(op.amount);
                } else if (category.category_type === 'expense') {
                    categoryStats[category.id].expense += Math.abs(op.amount);
                }
            }
        });
        
        // Фильтрация и сортировка категорий по доходам
        const incomeCategories = Object.values(categoryStats)
            .filter(stat => stat.income > 0)
            .sort((a, b) => b.income - a.income);
        
        // Фильтрация и сортировка категорий по расходам
        const expenseCategories = Object.values(categoryStats)
            .filter(stat => stat.expense > 0)
            .sort((a, b) => b.expense - a.expense);
        
        let labels = [];
        const datasets = [];
        
        // Формирование данных в зависимости от выбранного типа
        if (dataType === 'all') {
            const allCategoryNames = [...new Set([
                ...incomeCategories.map(c => c.name),
                ...expenseCategories.map(c => c.name)
            ])];
            
            labels = allCategoryNames;
            
            const incomeData = allCategoryNames.map(name => {
                const cat = incomeCategories.find(c => c.name === name);
                return cat ? cat.income : 0;
            });
            
            const expenseData = allCategoryNames.map(name => {
                const cat = expenseCategories.find(c => c.name === name);
                return cat ? cat.expense : 0;
            });
            
            datasets.push({
                label: 'Доходы',
                data: incomeData,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            });
            
            datasets.push({
                label: 'Расходы',
                data: expenseData,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            });
        } else if (dataType === 'income') {
            labels = incomeCategories.map(c => c.name);
            datasets.push({
                label: 'Доходы',
                data: incomeCategories.map(c => c.income),
                backgroundColor: incomeCategories.map(c => c.color || 'rgba(54, 162, 235, 0.6)'),
            });
        } else if (dataType === 'expense') {
            labels = expenseCategories.map(c => c.name);
            datasets.push({
                label: 'Расходы',
                data: expenseCategories.map(c => c.expense),
                backgroundColor: expenseCategories.map(c => c.color || 'rgba(255, 99, 132, 0.6)'),
            });
        }

        return {
            labels,
            datasets
        };
    };

    // Функция подготовки данных для круговой диаграммы
    const preparePieChartData = (dataType) => {
        const categoryStats = {};
        
        // Инициализация статистики по категориям
        userCategories.forEach(category => {
            categoryStats[category.id] = {
                name: category.name,
                amount: 0,
                color: category.color
            };
        });
        
        // Суммирование сумм операций по категориям в зависимости от типа данных
        filteredOperations.forEach(op => {
            const category = userCategories.find(c => c.id === op.categoryId);
            if (category) {
                if (dataType === 'all' || 
                    (dataType === 'income' && category.category_type === 'income') ||
                    (dataType === 'expense' && category.category_type === 'expense')) {
                    categoryStats[category.id].amount += Math.abs(op.amount);
                }
            }
        });
        
        // Фильтрация и сортировка категорий по сумме
        const categoriesWithData = Object.values(categoryStats)
            .filter(stat => stat.amount > 0)
            .sort((a, b) => b.amount - a.amount);
        
        // Возврат пустых данных, если нет операций
        if (categoriesWithData.length === 0) {
            return {
                labels: ['Нет данных'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#cccccc'],
                }]
            };
        }
        
        return {
            labels: categoriesWithData.map(c => c.name),
            datasets: [{
                data: categoriesWithData.map(c => c.amount),
                backgroundColor: categoriesWithData.map(c => c.color || '#cccccc'),
            }]
        };
    };

    // Функция подготовки данных для полярной диаграммы (использует те же данные, что и круговая)
    const preparePolarChartData = (dataType) => {
        return preparePieChartData(dataType);
    };

    // Функция для получения пустых данных графика (когда нет операций)
    const getEmptyChartData = (chartType, dataType) => {
        const emptyData = {
            labels: ['Нет данных'],
            datasets: [{
                data: [1],
                backgroundColor: ['#cccccc'],
            }]
        };
        
        // Формирование пустых данных в зависимости от типа графика
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
    
    // Обработчик изменения фильтра по категории
    const handleCategoryFilterChange = (e) => {
        setSelectedCategoryFilter(e.target.value);
    };

    // Обработчик изменения фильтра по дате
    const handleDateFilterChange = (e) => {
        setSelectedDateFilter(e.target.value);
    };

    // Обработчик изменения выбранного года
    const handleYearChange = (e) => {
        setSelectedYear(parseInt(e.target.value));
    };

    // Обработчик изменения выбранного месяца
    const handleMonthChange = (e) => {
        setSelectedMonth(parseInt(e.target.value));
    };

    // Обработчик изменения типа данных
    const handleDataTypeChange = (e) => {
        setDataType(e.target.value);
    };

    // Мемоизированные данные для графика
    const chartData = useMemo(() => {
        return prepareChartData(selectedChart, dataType);
    }, [selectedChart, dataType, filteredOperations, userCategories]);

    // Мемоизированные настройки графика
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
    }), [dataType, getDataTypeText]);

    // Функция получения заголовка графика
    const getChartTitle = () => {
        const typeText = getDataTypeText(dataType);
        const chartText = selectedChart === 'line' ? 'Линейный график' :
                        selectedChart === 'bar' ? 'Столбчатая диаграмма' :
                        selectedChart === 'pie' ? 'Круговая диаграмма' : 'Полярная диаграмма';
        return `${chartText} (${typeText})`;
    };

    // Функция рендеринга выбранного типа графика
    const renderSelectedChart = () => {
        // Для неавторизованных пользователей или во время загрузки показываем демо-графики
        if (!token || userLoading) {
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

        // Для авторизованных пользователей показываем графики с их данными
        if (token && !userLoading && currentUser) {
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
        }

        return <LineChart />;
    };
    
    return (
        <>
        <Header />
        <main className="main">
            {isLoading && <Loader />}
            
            {/* Отображение демо-контента для неавторизованных пользователей */}
            {(!token || userLoading) && !isLoading && (
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
            
            {/* Отображение аналитики для авторизованных пользователей */}
            {token && !userLoading && currentUser && !isLoading && (
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
                                            {category.name} ({category.category_type === 'income' ? 'доход' : 'расход'})
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
                                
                                {/* Дополнительные селекторы для выбора года/месяца */}
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
                        {filteredOperations.length > 0 && userCategories.length > 0 ? (
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