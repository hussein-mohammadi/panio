/**
 * Minimal fetch-based Telegram Bot API client for one-off calls (push notifications)
 * outside the grammY update loop.
 *
 * Never throws: a notification is a side effect of a business action (order created, etc.)
 * and Telegram being briefly unreachable must never turn an already-committed D1 write into
 * a reported failure for the caller. Errors are logged, not propagated.
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: number | string,
  text: string,
  opts: { replyMarkup?: unknown } = {}
): Promise<void> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: opts.replyMarkup,
      }),
    });

    if (!response.ok) {
      console.error('sendTelegramMessage failed', await response.text());
    }
  } catch (error) {
    console.error('sendTelegramMessage threw', error);
  }
}
