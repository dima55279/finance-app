/* 
Компонент LineChart. Используется для отображения линейного графика. 
Данный компонент содержит данные и настройки графика. За основу для отображения линейного графика взята библиотека react-chartjs-2. 
*/
import React from "react";
import { Line } from "react-chartjs-2";

// Данные по умолчанию для демонстрации линейного графика
const defaultData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  datasets: [
    {
      label: "Up Line", // Название первого набора данных (возрастающая линия)
      data: [10, 20, 15, 40, 30], // Данные для отображения
      borderColor: "rgba(75, 192, 192, 1)", // Цвет линии
      fill: false, // Не заполнять область под линией
      tension: 0.4, // Плавность кривой (0.4 для сглаживания)
    },
    {
      label: "Flat Line", // Второй набор данных (нестабильная линия)
      data: [60, 30, 80, 30, 90],
      borderColor: "rgba(255, 159, 64, 1)",
      fill: false,
      tension: 0.4,
    },
    {
      label: "Down Line", // Третий набор данных (нисходящая линия)
      data: [50, 10, 30, 30, 10],
      borderColor: "rgba(255, 99, 132, 1)",
      fill: false,
      tension: 0.4,
    },
  ],
};

// Настройки отображения графика по умолчанию
const defaultOptions = {
  scales: {
    x: {
      display: true, // Отображать ось X
      title: {
        display: true,
        text: "Month", // Подпись оси X
      },
    },
    y: {
      display: true, // Отображать ось Y
      title: {
        display: true,
        text: "Value", // Подпись оси Y
      },
    },
  },
};

// Компонент линейного графика
const LineChart = ({ data = defaultData, options = defaultOptions }) => {
  return (
    <div>
      {/* 
        Компонент Line из react-chartjs-2 для отображения линейного графика
        Принимает:
        - data: данные для графика (использует defaultData по умолчанию)
        - options: настройки отображения (использует defaultOptions по умолчанию)
      */}
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;