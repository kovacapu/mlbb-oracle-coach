const fs = require('fs');
const path = require('path');
const https = require('https');

// Paths to data files
const SRC_DIR = path.join(__dirname, '..', 'src', 'data');
const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets');

const HEROES_FILE = path.join(SRC_DIR, 'heroes.ts');
const ITEMS_FILE = path.join(SRC_DIR, 'items.ts');
const EMBLEMS_FILE = path.join(SRC_DIR, 'emblems.ts');
const SPELLS_FILE = path.join(SRC_DIR, 'spells.ts');

const MAX_CONCURRENT_DOWNLOADS = 5;

// Scrape fallback from wiki if explicit URL not found
async function getWikiImageUrl(heroName) {
    return new Promise((resolve) => {
        // Simple formatter, Mobile Legends wiki format
        const formattedName = heroName.replace(/ /g, '_').replace(/'/g, '%27');
        const url = `https://mobile-legends.fandom.com/wiki/Special:FilePath/${formattedName}.png`;

        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                resolve(res.headers.location.split('/revision/')[0]);
            } else if (res.statusCode === 200) {
                resolve(url);
            } else {
                resolve(null);
            }
        }).on('error', () => resolve(null));
    });
}

function extractPathsFromTS(filePath, propertyName) {
    if (!fs.existsSync(filePath)) return [];

    const content = fs.readFileSync(filePath, 'utf-8');
    // Extracts paths like imagePath: '/assets/heroes/layla.png'
    const regex = new RegExp(`${propertyName}\\s*:\\s*['"\`](/assets/[a-zA-Z0-9_/-]+\\.[a-z]+)['"\`]`, 'g');
    const matches = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
        matches.push(match[1]);
    }

    return matches;
}

function checkMissingAssets(expectedPaths) {
    const missing = [];
    for (const assetPath of expectedPaths) {
        // Convert '/assets/heroes/foo.png' -> 'public/assets/heroes/foo.png'
        const fullPath = path.join(__dirname, '..', 'public', assetPath);
        if (!fs.existsSync(fullPath)) {
            missing.push({ assetPath, fullPath });
        }
    }
    return missing;
}

const downloadFile = (url, destPath) => {
    return new Promise((resolve, reject) => {
        if (!url) return reject(new Error("Empty URL"));

        fs.mkdirSync(path.dirname(destPath), { recursive: true });

        const file = fs.createWriteStream(destPath);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                // Follow 1 redirect
                https.get(response.headers.location, (res2) => {
                    if (res2.statusCode === 200) {
                        res2.pipe(file);
                        file.on('finish', () => { file.close(resolve); });
                    } else {
                        file.close();
                        fs.unlink(destPath, () => reject(new Error(`Redirect failed: ${res2.statusCode}`)));
                    }
                }).on('error', err => {
                    file.close();
                    fs.unlink(destPath, () => reject(err));
                });
            } else {
                file.close();
                fs.unlink(destPath, () => reject(new Error(`Server responded with ${response.statusCode}: ${response.statusMessage}`)));
            }
        }).on('error', (err) => {
            file.close();
            fs.unlink(destPath, () => reject(err));
        });
    });
};

async function healData() {
    console.log("🔥 [PHOENIX] Initalizing Data Audit & Healer Protocol...");

    const heroes = extractPathsFromTS(HEROES_FILE, 'imagePath');
    const items = extractPathsFromTS(ITEMS_FILE, 'iconUrl');
    const emblems = extractPathsFromTS(EMBLEMS_FILE, 'iconUrl');
    const spells = extractPathsFromTS(SPELLS_FILE, 'iconUrl');

    const allExpected = [...heroes, ...items, ...emblems, ...spells];

    // Deduplicate
    const uniqueExpected = [...new Set(allExpected)];
    console.log(`[AUDIT] Found ${uniqueExpected.length} asset definitions in TypeScript schemas.`);

    const missingAssets = checkMissingAssets(uniqueExpected);

    if (missingAssets.length === 0) {
        console.log("✅ [AUDIT] All assets intact. The Data Core is 100% healthy.");
        return;
    }

    console.log(`⚠️ [AUDIT] Found ${missingAssets.length} missing assets. Initiating Healer Protocol...`);

    // Attempt to download missing stuff
    let successCount = 0;

    for (let i = 0; i < missingAssets.length; i += MAX_CONCURRENT_DOWNLOADS) {
        const batch = missingAssets.slice(i, i + MAX_CONCURRENT_DOWNLOADS);
        const promises = batch.map(async ({ assetPath, fullPath }) => {
            const fileName = path.basename(assetPath, path.extname(assetPath));

            // Try formatting MLBB Wiki direct links based on filename
            // Examples: "Blade_of_Despair.png" -> "https://mobile-legends.fandom.com/wiki/Special:FilePath/Blade_of_Despair.png"
            // For heroes: "Miya.png"
            let niceName = fileName.replace(/_/g, ' ');
            // Make exceptions for strange names
            if (niceName === "Yuzhong") niceName = "Yu Zhong";
            niceName = niceName.charAt(0).toUpperCase() + niceName.slice(1);

            try {
                let dlUrl = await getWikiImageUrl(niceName);
                if (dlUrl) {
                    await downloadFile(dlUrl, fullPath);
                    console.log(`   [HEALED] -> ${assetPath}`);
                    successCount++;
                } else {
                    console.log(`   [FAILED] -> Not found on Wiki: ${fileName}`);
                }
            } catch (e) {
                console.log(`   [ERROR] -> ${fileName} (${e.message})`);
            }
        });

        await Promise.all(promises);
    }

    console.log(`\n🔥 [PHOENIX] Data Healing complete. Recovered ${successCount}/${missingAssets.length} missing assets.`);
}

healData().catch(console.error);
