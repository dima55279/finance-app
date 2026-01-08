/* 
Компонент PolarAreaChart. Используется для отображения полярной диаграммы. 
Данный компонент содержит данные и настройки графика. За основу для отображения полярной диаграммы взята библиотека react-chartjs-2. 
*/
import { PolarArea } from "react-chartjs-2";

// Данные по умолчанию для демонстрации полярной диаграммы
const defaultData = {
  labels: ["A", "B", "C", "D", "E"], // Названия осей/секторов
  datasets: [
    {
      data: [30, 45, 20, 10, 35], // Значения для каждого сектора
      backgroundColor: ["red", "blue", "green", "purple", "orange"], // Цвета секторов
    },
  ],
};

// Компонент полярной диаграммы
const PolarAreaChart = ({ data = defaultData, options = {} }) => {
  return (
    <div>
      {/* 
        Компонент PolarArea из react-chartjs-2 для отображения полярной диаграммы
        Принимает:
        - data: данные для диаграммы (использует defaultData, если не переданы)
        - options: дополнительные настройки отображения (пустой объект по умолчанию)
      */}
      <PolarArea data={data} options={options} />
    </div>
  );
};

export default PolarAreaChart;
