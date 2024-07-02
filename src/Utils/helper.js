export function truncateAndAddEllipsis(text, maxLength = 24) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
}

export const getStatusColor = (status) => {
  switch (status) {
    case "ONLINE":
      return "green";
    case "OFFLINE":
      return "red";
    case "PAPER_JAM":
      return "orange";
    case "NO_PAPER":
      return "gold";
    case "NO_TONER":
      return "purple";
    default:
      return "orange";
  }
};