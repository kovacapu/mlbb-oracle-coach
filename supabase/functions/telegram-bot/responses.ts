// Telegram message formatters for the ML Coach Bot

export type PlayStyle = 'Aggressive Carry' | 'Supportive' | 'Risky/Overextended' | 'Balanced';

export interface MatchAnalysisResult {
  kdaRatio: number;
  playStyle: PlayStyle;
  coachNote: string;
}

const PLAYSTYLE_EMOJI: Record<string, string> = {
  'Aggressive Carry':   '⚔️',
  'Supportive':         '🛡️',
  'Risky/Overextended': '💀',
  'Balanced':           '⚖️',
};

// Escape special Markdown characters for Telegram's MarkdownV2
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

export function formatStartMessage(firstName: string): string {
  return (
    `Welcome, ${escapeMarkdown(firstName)}\\! 👋\n\n` +
    `I'm your *Mobile Legends AI Coach*\\.\n\n` +
    `Send me your match data and I'll analyze your KDA, playstyle, and item build synergy\\.\n\n` +
    `Use /help to see all available commands\\.`
  );
}

export function formatHelpMessage(): string {
  return (
    `*ML Coach Bot \\- Commands*\n\n` +
    `/analyze \\<hero\\_id\\> \\<kills\\> \\<deaths\\> \\<assists\\> \\[items\\.\\.\\.\\.\\]\n` +
    `  Analyze a match and get instant AI coaching feedback\\.\n\n` +
    `*Example:*\n` +
    `\`/analyze chou 8 3 12 blade\\_of\\_despair endless\\_battle\`\n\n` +
    `*Hero IDs* \\(lowercase, underscores\\):\n` +
    `\`chou\\, franco\\, layla\\, hayabusa\\, gusion\\, natalia\\.\\.\\.\`\n\n` +
    `*Item IDs* \\(lowercase, underscores\\):\n` +
    `\`blade\\_of\\_despair\\, holy\\_crystal\\, athenas\\_shield\\.\\.\\.\`\n\n` +
    `/help \\- Show this message\n` +
    `/start \\- Welcome message`
  );
}

export function formatAnalysisResponse(
  heroName: string,
  kills: number,
  deaths: number,
  assists: number,
  result: MatchAnalysisResult
): string {
  const emoji = PLAYSTYLE_EMOJI[result.playStyle] ?? '🎮';
  const kdaDisplay = `${kills}/${deaths}/${assists}`;
  const isWarning = result.coachNote.startsWith('WARNING');

  return (
    `🎮 *Match Analysis \\- ${escapeMarkdown(heroName)}*\n` +
    `━━━━━━━━━━━━━━━━━\n\n` +
    `📊 *KDA:* ${kdaDisplay}  →  Ratio: \`${result.kdaRatio}\`\n` +
    `${emoji} *Playstyle:* ${escapeMarkdown(result.playStyle)}\n\n` +
    `${isWarning ? '⚠️' : '💡'} *Coach Note:*\n` +
    `_${escapeMarkdown(result.coachNote)}_\n\n` +
    `━━━━━━━━━━━━━━━━━\n` +
    `_Powered by ML Coach AI_`
  );
}

export function formatErrorMessage(): string {
  return (
    `*Usage:* /analyze \\<hero\\_id\\> \\<kills\\> \\<deaths\\> \\<assists\\> \\[items\\.\\.\\.\\.\\]\n\n` +
    `*Example:*\n` +
    `\`/analyze chou 8 3 12 blade\\_of\\_despair\`\n\n` +
    `Type /help for full documentation\\.`
  );
}

export function formatPhotoNotSupportedMessage(): string {
  return (
    `📸 Photo analysis is not supported yet\\.\n\n` +
    `Please use the text command instead:\n` +
    `\`/analyze \\<hero\\> \\<kills\\> \\<deaths\\> \\<assists\\> \\[items\\.\\.\\.\\.\\]\`\n\n` +
    `Example: \`/analyze chou 8 3 12\``
  );
}
