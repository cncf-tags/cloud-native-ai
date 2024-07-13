import { spawn } from 'child_process';
import path from 'path';

const csvUrl = 'https://raw.githubusercontent.com/cncf-tags/cloud-native-ai/main/cncf-youtube-channel-summarizer/data/cncf_video_summary_combine.csv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const scriptPath = path.join(process.cwd(), 'scripts', 'semantic_search.py');
  const script = spawn('python3', [scriptPath, query, csvUrl]);

  let output = '';
  script.stdout.on('data', (data) => {
    output += data.toString();
  });

  script.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  script.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: 'Search script failed' });
    }
    res.status(200).json({ results: JSON.parse(output) });
  });
}
