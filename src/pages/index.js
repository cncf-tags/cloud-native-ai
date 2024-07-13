import { useEffect, useState } from 'react';
import ForceGraph from './force-graph';
const Home = () => {
  const [data, setData] = useState('');
  useEffect(() => {
    // Fetch the CSV data from the server
    fetch('https://raw.githubusercontent.com/cncf-tags/cloud-native-ai/main/cncf-youtube-channel-summarizer/data/cncf_video_summary_29.csv')
      .then((response) => response.text())
      .then((csvData) => setData(csvData));
  }, []);

  return (
    <div style={{ backgroundColor: '#F0F8FF' }}>
      <main className="">
        {data && <ForceGraph data={data} src="/conference-dashboard"/>}
      </main>
    </div>
  );
};

export default Home;