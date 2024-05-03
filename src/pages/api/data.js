import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const csvFilePath = path.join(process.cwd(), 'data', 'conference_data.csv');
  const csvData = fs.readFileSync(csvFilePath, 'utf8');
  res.status(200).send(csvData);
}