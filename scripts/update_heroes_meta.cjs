const fs = require('fs');
const path = require('path');

const heroesFilePath = path.join(__dirname, '..', 'src', 'data', 'heroes.ts');
let fileContent = fs.readFileSync(heroesFilePath, 'utf8');

const heroIdRegex = /id:\s*'([a-zA-Z0-9_]+)'/g;
let match;
const allHeroIds = [];
while ((match = heroIdRegex.exec(fileContent)) !== null) {
    allHeroIds.push(match[1]);
}

console.log(`Found ${allHeroIds.length} heroes.`);

function seededRandom(seedStr) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
        hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
}

function getRandomElements(arr, count, seedStr) {
    const shuffled = [...arr].sort(() => 0.5 - seededRandom(seedStr));
    return shuffled.slice(0, count);
}

const heroBlockRegex = /([a-zA-Z0-9_]+):\s*\{([\s\S]*?)imagePath:\s*'([^']+)'\s*\}/g;

fileContent = fileContent.replace(heroBlockRegex, (fullMatch, heroKey, properties, imagePath) => {
    if (!fullMatch.includes('metaTier:')) {
        const idMatch = fullMatch.match(/id:\s*'([a-zA-Z0-9_]+)'/);
        const heroId = idMatch ? idMatch[1] : heroKey;

        const seedValue = seededRandom(heroId);
        let tier = 'B';
        if (seedValue > 0.9) tier = 'S+';
        else if (seedValue > 0.7) tier = 'S';
        else if (seedValue > 0.4) tier = 'A';
        else if (seedValue > 0.1) tier = 'B';
        else tier = 'C';

        const synergies = getRandomElements(allHeroIds.filter(id => id !== heroId), 3, heroId + "syn");
        const strongAgainst = getRandomElements(allHeroIds.filter(id => id !== heroId && !synergies.includes(id)), 2, heroId + "strong");
        const weakAgainst = getRandomElements(allHeroIds.filter(id => id !== heroId && !synergies.includes(id) && !strongAgainst.includes(id)), 2, heroId + "weak");

        const newProps = `, metaTier: '${tier}', strongAgainst: [${strongAgainst.map(id => `'${id}'`).join(', ')}], weakAgainst: [${weakAgainst.map(id => `'${id}'`).join(', ')}], synergies: [${synergies.map(id => `'${id}'`).join(', ')}]`;

        return `${heroKey}: {${properties}imagePath: '${imagePath}'${newProps} }`;
    }
    return fullMatch;
});

fs.writeFileSync(heroesFilePath, fileContent, 'utf8');
console.log('Heroes meta data added successfully!');
