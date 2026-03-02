// ML Coach Bot — Core Analysis Logic + Telegram Command Router
// Ported from src/services/MLAnalyzer.ts (analyzeMatch method)

import { HEROES_DENO } from './heroData.ts';
import { ITEMS_DENO } from './itemData.ts';
import {
  formatStartMessage,
  formatHelpMessage,
  formatAnalysisResponse,
  formatErrorMessage,
  formatPhotoNotSupportedMessage,
  type PlayStyle,
  type MatchAnalysisResult,
} from './responses.ts';

// ---- Telegram API Types ----
interface TelegramUser {
  id: number;
  first_name?: string;
  language_code?: string;
}

interface TelegramChat {
  id: number;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  text?: string;
  photo?: unknown[];
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

// ---- Core Analysis Logic (ported from MLAnalyzer.analyzeMatch) ----
function analyzeMatch(
  heroId: string,
  kills: number,
  deaths: number,
  assists: number,
  itemIds: string[],
): MatchAnalysisResult {
  // 1. KDA Calculation
  const safeDeaths = deaths === 0 ? 1 : deaths;
  const kdaRatio = Number(((kills + assists) / safeDeaths).toFixed(2));

  // 2. Playstyle Detection (Heuristic Model)
  let playStyle: PlayStyle = 'Balanced';

  if (deaths >= 8 && kdaRatio < 1.5) {
    playStyle = 'Risky/Overextended';
  } else if (kills >= 8 && deaths <= 4 && kdaRatio >= 3.0) {
    playStyle = 'Aggressive Carry';
  } else if (assists >= 10 && kills <= 4) {
    playStyle = 'Supportive';
  } else if (kdaRatio >= 4.0) {
    playStyle = 'Aggressive Carry';
  } else if (deaths > kills + assists) {
    playStyle = 'Risky/Overextended';
  }

  // 3. Item & Role Synergy Check
  let coachNote = 'Great match! Your item build and playstyle are balanced.';

  const hero = HEROES_DENO[heroId];
  if (hero) {
    const items = itemIds.map((id) => ITEMS_DENO[id]).filter(Boolean);

    let magicItems = 0;
    let physicalItems = 0;

    items.forEach((item) => {
      if (item.category === 'Magic') magicItems++;
      if (item.category === 'Attack' && item.hasPhysicalAttack) physicalItems++;
    });

    let hasIncompatibleItem = false;

    if (hero.damageType === 'Magic' && physicalItems > 0 && hero.roles.includes('Mage')) {
      coachNote =
        'WARNING: Incompatible build! You bought physical damage items on a Mage hero. This significantly reduces your damage potential.';
      hasIncompatibleItem = true;
    } else if (
      hero.damageType === 'Physical' &&
      magicItems > 0 &&
      (hero.roles.includes('Fighter') || hero.roles.includes('Marksman'))
    ) {
      coachNote =
        'WARNING: Incompatible build! You bought magic items on a physical damage hero. Review your item choices.';
      hasIncompatibleItem = true;
    }

    if (!hasIncompatibleItem) {
      if (playStyle === 'Risky/Overextended') {
        coachNote =
          'You took too many risks this match. Track the minimap more closely and wait for your team before engaging.';
      } else if (playStyle === 'Aggressive Carry') {
        coachNote =
          'Phenomenal carry performance! You were a massive damage source for your team. Excellent positioning!';
      } else if (playStyle === 'Supportive') {
        coachNote =
          'Outstanding team player! You sacrificed kills to generate assists, which often wins games more than solo carry plays.';
      }
    }
  } else {
    coachNote = `Hero '${heroId}' was not found in the database. KDA analysis was still performed.`;
  }

  return { kdaRatio, playStyle, coachNote };
}

// ---- Telegram API Helper ----
async function sendMessage(chatId: number, text: string, token: string): Promise<void> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'MarkdownV2',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Telegram sendMessage failed (${response.status}): ${body}`);
  }
}

// ---- Command Router ----
export async function handleUpdate(update: TelegramUpdate, token: string): Promise<void> {
  const message = update.message;
  if (!message) return;

  const chatId = message.chat.id;
  const text = message.text ?? '';
  const firstName = message.from?.first_name ?? 'Coach';

  // /start command
  if (text.startsWith('/start')) {
    await sendMessage(chatId, formatStartMessage(firstName), token);
    return;
  }

  // /help command
  if (text.startsWith('/help')) {
    await sendMessage(chatId, formatHelpMessage(), token);
    return;
  }

  // /analyze command
  if (text.startsWith('/analyze')) {
    // Split on whitespace, skip the command itself
    const args = text.trim().split(/\s+/).slice(1);

    if (args.length < 4) {
      await sendMessage(chatId, formatErrorMessage(), token);
      return;
    }

    const [heroId, killsStr, deathsStr, assistsStr, ...itemIds] = args;
    const kills = parseInt(killsStr, 10);
    const deaths = parseInt(deathsStr, 10);
    const assists = parseInt(assistsStr, 10);

    if (isNaN(kills) || isNaN(deaths) || isNaN(assists)) {
      await sendMessage(
        chatId,
        'Kills, deaths, and assists must be numbers\\.\n\nExample: `/analyze chou 8 3 12`',
        token,
      );
      return;
    }

    if (kills < 0 || deaths < 0 || assists < 0) {
      await sendMessage(chatId, 'KDA values cannot be negative\\.', token);
      return;
    }

    const result = analyzeMatch(heroId, kills, deaths, assists, itemIds);
    const heroName = HEROES_DENO[heroId]?.name ?? heroId;

    await sendMessage(chatId, formatAnalysisResponse(heroName, kills, deaths, assists, result), token);
    return;
  }

  // Photo message — not supported yet
  if (message.photo) {
    await sendMessage(chatId, formatPhotoNotSupportedMessage(), token);
    return;
  }
}
