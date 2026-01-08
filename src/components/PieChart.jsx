/* 
Компонент PieChart. Используется для отображения круговой диаграммы. 
Данный компонент содержит данные и настройки графика. За основу для отображения круговой диаграммы взята библиотека react-chartjs-2. 
*/
import { Pie } from "react-chartjs-2";

// Данные по умолчанию для демонстрации круговой диаграммы
const defaultData = {
  labels: ["Chrome", "Firefox", "Safari", "Edge", "Others"], // Названия сегментов
  datasets: [
    {
      data: [45, 20, 15, 10, 10], // Процентные значения для каждого сегмента
      backgroundColor: ["blue", "orange", "green", "purple", "gray"], // Цвета сегментов
    },
  ],
};

// Компонент круговой диаграммы
const PieChart = ({ data = defaultData, options = {} }) => {
  return (
    <div>
      {/* 
        Компонент Pie из react-chartjs-2 для отображения круговой диаграммы
        Принимает:
        - data: данные для диаграммы (использует defaultData, если не переданы)
        - options: дополнительные настройки отображения (пустой объект по умолчанию)
      */}
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChart;