import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Helper function to read and parse the CSV file using Node.js's fs
const parseCSV = async () => {
  try {
    // Construct the absolute path to the CSV file
    const filePath = path.resolve('worldcities.csv'); // Adjust the path as needed
    
    // Read the CSV file asynchronously with Node.js fs
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');

    // Use PapaParse to parse the CSV data
    const result = Papa.parse(fileContent, {
      header: true,  // Treat first row as headers
      dynamicTyping: true,  // Automatically convert types (e.g., number)
    });

    // Return parsed data
    return result.data;
  } catch (error) {
    console.error('Error reading or parsing CSV:', error);
    throw error;
  }
};

// SolidStart GET handler to return a random city
export async function GET() {
  try {
    // Parse the CSV file and get the rows
    const cities = await parseCSV();

    // Select a random city from the parsed data
    const randomCity = cities[Math.floor(Math.random() * cities.length)];

    // Return the random city as JSON
    console.log(randomCity);
    return new Response(JSON.stringify(randomCity), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
