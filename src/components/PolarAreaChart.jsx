import { PolarArea } from "react-chartjs-2";

const defaultData = {
  labels: ["A", "B", "C", "D", "E"],
  datasets: [
    {
      data: [30, 45, 20, 10, 35],
      backgroundColor: ["red", "blue", "green", "purple", "orange"],
    },
  ],
};

const PolarAreaChart = ({ data = defaultData, options = {} }) => {
  return (
    <div>
      <PolarArea data={data} options={options} />
    </div>
  );
};

export default PolarAreaChart;
