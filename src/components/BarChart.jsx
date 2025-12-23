import React from "react";
import { Bar } from "react-chartjs-2";

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

const BarChart = ({ data = defaultData, options = {} }) => {
  return (
    <div>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;
