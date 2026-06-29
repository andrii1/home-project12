/* eslint-disable prefer-template */
export function formatDuration(duration) {
  if (!duration) return '0m'; // handle null or empty

  const [h = 0, m = 0] = duration.split(':').map(Number); // ignore seconds
  const result = [];

  if (h) result.push(h + 'h');
  if (m) result.push(m + 'm');

  return result.join(' ') || '0m';
}
