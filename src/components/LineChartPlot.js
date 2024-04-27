import { LineChart, XAxis, YAxis, Line, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
const LineChartPlot = () => {
    const data = [
      {
        month: 'Jan',
        paid: 5000,
        organic: 4230
      },
      {
        month: 'Feb',
        paid: 7800,
        organic: 2900
      },
      {
        month: 'Mar',
        paid: 4700,
        organic: 2400
      },
      {
        month: 'Apr',
        paid: 9000,
        organic: 2600
      },
      {
        month: 'May',
        paid: 7000,
        organic: 3210
      }
    ];
    return (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              width={500}
              height={300}
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="paid" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="organic" stroke="#82ca9d" strokeWidth={2}/>
            </LineChart>
          </ResponsiveContainer>
        </>
      );
  };
  
  export default LineChartPlot;