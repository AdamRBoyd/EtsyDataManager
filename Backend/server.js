import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map brands to their JSON files
const JSON_PATHS = {
    metalworks: path.join(__dirname, '../Frontend/public/json/metalworks/EtsyAll.json'),
    lightworks: path.join(__dirname, '../Frontend/public/json/lightworks/EtsyAll.json')
};

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// GET products by brand
app.get('/api/products/:brand', async (req, res) => {
    try {
        const { brand } = req.params;

        if (!JSON_PATHS[brand]) {
            return res.status(400).json({ error: 'Invalid brand' });
        }

        const file = await fs.readFile(JSON_PATHS[brand], 'utf8');
        res.json(JSON.parse(file));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to read file' });
    }
});

// POST updated products by brand
app.post('/api/products/:brand', async (req, res) => {
    try {
        const { brand } = req.params;

        if (!JSON_PATHS[brand]) {
            return res.status(400).json({ error: 'Invalid brand' });
        }

        await fs.writeFile(
            JSON_PATHS[brand],
            JSON.stringify(req.body, null, 4),
            'utf8'
        );

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to write file' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});