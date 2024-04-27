import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
const PieChartPlot = () => {
    const colors = [
        "#8884d8",
        "#FA8072",
        "#AF69EE",
        "#3DED97",
        "#3AC7EB",
        "#F9A603",
      ];
    const data = [
      {
        name: "Twitter",
        value: 200400,
      },
      {
        name: "Facebook",
        value: 205000,
      },
      {
        name: "Instagram",
        value: 23400,
      },
      {
        name: "Snapchat",
        value: 20000,
      },
      {
        name: "LinkedIn",
        value: 29078,
      },
      {
        name: "YouTube",
        value: 18900,
      },
    ];
    return (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={730} height={250}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                fill="#8884d8"
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </>
      );
  }
  export default PieChartPlot; 