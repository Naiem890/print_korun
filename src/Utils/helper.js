export function truncateAndAddEllipsis(text, maxLength = 24) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
}
