/* 
Компонент BarChart. Используется для отображения столбчатой диаграммы. 
Данный компонент содержит данные и настройки графика. За основу для отображения столбчатой диаграммы взята библиотека react-chartjs-2. 
*/
import React from "react";
import { Bar } from "react-chartjs-2";

// Данные по умолчанию для демонстрации графика (используются при отсутствии переданных данных)
const defaultData = {
  labels: [
    "Category A",
    "Category B",
    "Category C",
    "Category D",
    "Category E",
  ],
  datasets: [
    {
      label: "Dataset 1",
      data: [10, 20, 30, 40, 50],
      backgroundColor: "rgba(255, 99, 132, 0.6)",
    },
    {
      label: "Dataset 2",
      data: [5, 15, 25, 35, 45],
      backgroundColor: "rgba(54, 162, 235, 0.6)", 
    },
  ],
};

// Компонент столбчатой диаграммы
const BarChart = ({ data = defaultData, options = {} }) => {
  return (
    <div>
      {/* 
        Компонент Bar из react-chartjs-2, который отображает столбчатую диаграмму.
        Принимает:
        - data: данные для графика (использует defaultData, если не переданы)
        - options: дополнительные настройки графика (пустой объект по умолчанию)
      */}
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;