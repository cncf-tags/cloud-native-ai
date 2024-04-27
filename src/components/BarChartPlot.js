import { BarChart, XAxis, YAxis, Bar, Tooltip, Legend, ResponsiveContainer} from "recharts";
const BarChartPlot = () => {
    const data = [
      {
          name: "Jan",
          high: 4000,
          low: 2400
      },
      {
          name: "Feb",
          high: 5000,
          low: 1500
      },
      {
          name: "Mar",
          high: 6000,
          low: 3000
      },
      {
          name: "Apr",
          high: 6500,
          low: 4500
      },
      {
          name: "May",
          high: 7000,
          low: 2200
      },
      {
          name: "Jun",
          high: 8000,
          low: 3500
      },
      {
          name: "Jul",
          high: 7400,
          low: 5500
      },
    ];
    return (
    <>
    <ResponsiveContainer width="100%" height="100%">
     <style>
            background-color: #f0f0f0;
     </style>
        <BarChart width={730} height={250} data={data}>
             <XAxis dataKey="name" />
             <YAxis />
             <Tooltip />
             <Legend />
             <Bar dataKey="high" fill="#82ca9d" />
             <Bar dataKey="low" fill="#FA8072" />
        </BarChart>
    </ResponsiveContainer>
    </>
    );
};
    
export default BarChartPlot;