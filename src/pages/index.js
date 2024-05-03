import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useEffect, useState } from 'react';
import ForceGraph from './force-graph';
const Home = () => {
  const [data, setData] = useState('');

  useEffect(() => {
    // Fetch the CSV data from the server
    fetch('https://raw.githubusercontent.com/LoveYourself999/conference-dashboard/main/public/data/conference_data.csv')
      .then((response) => response.text())
      .then((csvData) => setData(csvData));
  }, []);

  return (
    <div style={{ backgroundColor: '#F0F8FF' }}> {/* Changed background color to light gray */}
      <Sidebar />
      <main className="flex-grow ml-64 relative">
        <Navbar />
        {data && <ForceGraph data={data} src="/conference-dashboard"/>}
      </main>
    </div>
  );
};

export default Home;