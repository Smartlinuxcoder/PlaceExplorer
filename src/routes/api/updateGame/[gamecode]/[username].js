import { getDatabase } from '../../../../utils/db';
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

export async function POST({ params }) {
    try {
        const code = params.gamecode; 
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

        const existingGame = await db.get('SELECT * FROM games WHERE code = ?', [code]);

        if (existingGame) {
            await db.run(
                'UPDATE games SET country = ?, latitude = ?, longitude = ? WHERE code = ?',
                [country, latitude, longitude, code]
            );
            
        } else {
            return new Response(JSON.stringify({ error: 'That game does not exist' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        
        }

        return new Response(JSON.stringify(await db.all('SELECT * FROM games WHERE code = ?', [params.gamecode])), {
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
