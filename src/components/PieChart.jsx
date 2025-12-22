import { Pie } from "react-chartjs-2";

const data = {
  labels: ["Chrome", "Firefox", "Safari", "Edge", "Others"],
  datasets: [
    {
      data: [45, 20, 15, 10, 10],
      backgroundColor: ["blue", "orange", "green", "purple", "gray"],
    },
  ],
};

const PieChart = () => {
  return (
    <div>
      <Pie data={data} />
    </div>
  );
};

export default PieChart;
