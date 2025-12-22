import { PolarArea } from "react-chartjs-2";

const data = {
  labels: ["A", "B", "C", "D", "E"],
  datasets: [
    {
      data: [30, 45, 20, 10, 35],
      backgroundColor: ["red", "blue", "green", "purple", "orange"],
    },
  ],
};

const PolarAreaChart = () => {
  return (
    <div>
      <PolarArea data={data} />
    </div>
  );
};

export default PolarAreaChart;
