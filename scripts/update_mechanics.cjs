const fs = require('fs');
const path = require('path');

const heroesFilePath = path.join(__dirname, '..', 'src', 'data', 'heroes.ts');
let fileContent = fs.readFileSync(heroesFilePath, 'utf8');

function seededRandom(seedStr) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
        hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
}

function getRandomLevel(seed, opts) {
    const val = seededRandom(seed);
    if (val < 0.33) return opts[0];
    if (val < 0.66) return opts[1];
    return opts[2];
}

const SPIKES = ['Early', 'Mid', 'Late'];
const LEVELS = ['High', 'Medium', 'Low'];

const heroBlockRegex = /([a-zA-Z0-9_]+):\s*\{([\s\S]*?)synergies:\s*\[[^\]]*\]\s*\}/g;

fileContent = fileContent.replace(heroBlockRegex, (fullMatch, heroKey) => {
    if (!fullMatch.includes('powerSpike:')) {
        const idMatch = fullMatch.match(/id:\s*'([a-zA-Z0-9_]+)'/);
        const heroId = idMatch ? idMatch[1] : heroKey;

        // Certain roles generally lean towards specific spikes/levels for better realism
        // but we'll use a seeded structure to ensure all elements are populated
        const isTank = fullMatch.includes("'Tank'");
        const isAssassin = fullMatch.includes("'Assassin'");
        const isMarksman = fullMatch.includes("'Marksman'");

        let spike = getRandomLevel(heroId + "spike", SPIKES);
        if (isMarksman) spike = 'Late';
        if (isAssassin) spike = 'Early'; // Or Mid

        let mobility = getRandomLevel(heroId + "mob", LEVELS);
        if (isAssassin) mobility = 'High';
        if (isTank) mobility = 'Low'; // Generally

        let cc = getRandomLevel(heroId + "cc", LEVELS);
        if (isTank) cc = 'High';
        if (isAssassin) cc = 'Low'; // Generally

        const newProps = `, powerSpike: '${spike}', mobilityLevel: '${mobility}', ccLevel: '${cc}'`;
        return fullMatch + newProps;
    }
    return fullMatch;
});

// Since the regex above expects synergies to be the last field before the closing brace, we might need to adjust if we appended it before.
// Actually, earlier we just added synergies before the brace: `, synergies: [...] }`. So it matches `synergies: [...]` and we insert after it.

fs.writeFileSync(heroesFilePath, fileContent, 'utf8');
console.log('Heroes mechanics data added successfully!');
