import { getDatabase } from '../../utils/db';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

function generateCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
}

const parseCSV = async () => {
    try {
        const filePath = path.resolve('worldcities.csv'); // Adjust path if necessary
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
        const db = await getDatabase();
        const cities = await parseCSV();

        if (cities.length === 0) {
            throw new Error('No data in the CSV file.');
        }

        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        const { lat: latitude, lng: longitude, country } = randomCity;

        if (!latitude || !longitude || !country) {
            throw new Error('Invalid data in selected city.');
        }

        const code = generateCode();

        await db.run(
            'INSERT INTO games (code, country, latitude, longitude) VALUES (?, ?, ?, ?)',
            [code, country, latitude, longitude]
        );

        return new Response(JSON.stringify({ code }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error processing GET request:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
