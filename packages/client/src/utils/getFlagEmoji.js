export const getFlagEmoji = (isoCodeParam) => {
  if (!isoCodeParam || isoCodeParam.length !== 2) return ''; // must be 2 letters

  // Convert each letter to regional indicator symbol
  const codePoints = [...isoCodeParam.toUpperCase()].map(
    (char) => 127397 + char.charCodeAt(0),
  );
  return String.fromCodePoint(...codePoints);
};
