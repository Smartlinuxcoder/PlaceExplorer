import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';


const parseCSV = async () => {
  try {
    const filePath = path.resolve('worldcities.csv'); 
    
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');

    const result = Papa.parse(fileContent, {
      header: true,  
      dynamicTyping: true,  
    });


    return result.data;
  } catch (error) {
    console.error('Error reading or parsing CSV:', error);
    throw error;
  }
};


export async function GET() {
  try {
    const cities = await parseCSV();
    const randomCity = cities[Math.floor(Math.random() * cities.length)];

    console.log(randomCity);
    return new Response(JSON.stringify(randomCity), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
