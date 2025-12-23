import { Pie } from "react-chartjs-2";

const defaultData = {
  labels: ["Chrome", "Firefox", "Safari", "Edge", "Others"],
  datasets: [
    {
      data: [45, 20, 15, 10, 10],
      backgroundColor: ["blue", "orange", "green", "purple", "gray"],
    },
  ],
};

const PieChart = ({ data = defaultData, options = {} }) => {
  return (
    <div>
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChart;
