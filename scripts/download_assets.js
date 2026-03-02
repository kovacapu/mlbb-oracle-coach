import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HEROES_DIR = path.resolve(__dirname, '../public/assets/heroes');
const ITEMS_DIR = path.resolve(__dirname, '../public/assets/items');
const SPELLS_DIR = path.resolve(__dirname, '../public/assets/spells');
const EMBLEMS_DIR = path.resolve(__dirname, '../public/assets/emblems');

// Ensure directories exist
[HEROES_DIR, ITEMS_DIR, SPELLS_DIR, EMBLEMS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

import { execSync } from 'child_process';

// Helper to download a single file using curl (bypasses Fandom 403 Forbidden)
const downloadImage = async (url, destPath) => {
    if (fs.existsSync(destPath)) {
        return; // silently skip
    }

    try {
        execSync(`curl -sL -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -o "${destPath}" "${url}"`, { stdio: 'pipe' });

        // Check if file is downloaded successfully and has content
        const stats = fs.statSync(destPath);
        if (stats.size < 1000) {
            throw new Error('File too small, possibly an error page');
        }
        console.log(`[SUCCESS] Downloaded: ${path.basename(destPath)}`);
    } catch (error) {
        if (fs.existsSync(destPath)) {
            fs.unlinkSync(destPath); // Remove invalid file
        }
        throw new Error(error.message || 'Curl failed');
    }
};

// Formatting helper for Fandom Wiki URLs
const formatWikiName = (id) => {
    const specialCases = {
        'yu_zhong': 'Yu_Zhong',
        'lapulapu': 'Lapu-Lapu',
        'xborg': 'X.Borg',
        'dasha': 'Masha',
        'arlott': 'Arlott',
        'change': "Chang'e",
        'yi_sun_shin': 'Yi_Sun-shin',
        'popol_kupa': 'Popol_and_Kupa',
        'luo_yi': 'Luo_Yi',
        // Item specific overrides
        'haass_claws': "Haas's_Claws",
        'athenas_shield': "Athena's_Shield",
        'berserkers_fury': "Berserker's_Fury",
        'demon_hunter_sword': 'Demon_Hunter_Sword',
        'ice_queens_wand': 'Ice_Queen_Wand',
        'queens_wings': "Queen's_Wings",
        'rose_gold_meteor': 'Rose_Gold_Meteor',
        'winter_truncheon': 'Winter_Crown', // Changed in game recently
        'boots_tier1': 'Boots',
        // Spells overrides
        'execute': 'Execute',
        'retribution': 'Retribution',
        'inspire': 'Inspire',
        'sprint': 'Sprint',
        'revitalize': 'Revitalize',
        'aegis': 'Aegis',
        'petrify': 'Petrify',
        'purify': 'Purify',
        'flameshot': 'Flameshot',
        'flicker': 'Flicker',
        'arrival': 'Arrival',
        'vengeance': 'Vengeance',
    };
    if (specialCases[id]) return specialCases[id];

    // Capitalize each word split by underscore
    return id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('_');
};

const run = async () => {
    // 1. Process Heroes
    const heroesContent = fs.readFileSync(path.resolve(__dirname, '../src/data/heroes.ts'), 'utf-8');
    const heroIdMatches = [...heroesContent.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);
    const heroIds = [...new Set(heroIdMatches)];

    // 2. Process Items
    const itemsContent = fs.readFileSync(path.resolve(__dirname, '../src/data/items.ts'), 'utf-8');
    const itemIdMatches = [...itemsContent.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);
    const itemIds = [...new Set(itemIdMatches)];

    console.log(`Starting asset download process... Found ${heroIds.length} heroes and ${itemIds.length} items.`);

    // Download Heroes
    for (const id of heroIds) {
        const fileName = `${id}.png`;
        const destPath = path.join(HEROES_DIR, fileName);


        const wikiName = formatWikiName(id);
        const url = `https://mobile-legends.fandom.com/wiki/Special:FilePath/${wikiName}.png`;

        try {
            await downloadImage(url, destPath);
        } catch (error) {
            console.error(`[ERROR] Failed to download ${id}:`, error.message);
        }

        // Anti rate-limit delay
        await new Promise(r => setTimeout(r, 200));
    }

    // Download Items
    for (const id of itemIds) {
        const fileName = `${id}.png`;
        const destPath = path.join(ITEMS_DIR, fileName);

        if (fs.existsSync(destPath)) continue;

        let wikiName = formatWikiName(id);

        const url = `https://mobile-legends.fandom.com/wiki/Special:FilePath/${wikiName}.png`;

        try {
            await downloadImage(url, destPath);
        } catch (error) {
            console.error(`[ERROR] Failed to download ITEM ${id} from ${url}:`, error.message);
        }

        // Anti rate-limit delay
        await new Promise(r => setTimeout(r, 200));
    }

    console.log(`[+] Items completed. Starting Spells and Emblems...`);

    // 3. Spells
    const spellsContent = fs.readFileSync(path.resolve(__dirname, '../src/data/spells.ts'), 'utf-8');
    const spellIdMatches = [...spellsContent.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);
    const spellIds = [...new Set(spellIdMatches)];

    for (const id of spellIds) {
        const destPath = path.join(SPELLS_DIR, `${id}.png`);
        if (fs.existsSync(destPath)) continue;

        const wikiName = formatWikiName(id);
        const url = `https://mobile-legends.fandom.com/wiki/Special:FilePath/${wikiName}.png`;

        try {
            await downloadImage(url, destPath);
        } catch (e) {
            console.error(`[ERROR] Failed Spell ${id}`);
        }
        await new Promise(r => setTimeout(r, 200));
    }

    // 4. Emblems & sub-talents
    const emblemsContent = fs.readFileSync(path.resolve(__dirname, '../src/data/emblems.ts'), 'utf-8');
    const talentMatches = [...emblemsContent.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);
    const emblemIds = ['assassin', 'mage', 'fighter', 'marksman', 'tank', 'support'];
    // Merge emblem main names and talents
    const allEmblemAssetIds = [...new Set([...talentMatches, ...emblemIds])];

    for (const id of allEmblemAssetIds) {
        const destPath = path.join(EMBLEMS_DIR, `${id}.png`);
        if (fs.existsSync(destPath)) continue;

        let wikiName = formatWikiName(id);

        // Emblems often have specific naming on the wiki, let's try a few fallbacks if standard fails
        const url = `https://mobile-legends.fandom.com/wiki/Special:FilePath/${wikiName}.png`;
        try {
            await downloadImage(url, destPath);
        } catch (e) {
            console.error(`[ERROR] Failed Emblem/Talent ${id}`);
        }
        await new Promise(r => setTimeout(r, 200));
    }

    console.log('Download process completed!');
};

run();
