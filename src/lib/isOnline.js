export const isUserOnline = (lastSeen) => {
  if (!lastSeen) return false;
  const now = Date.now();
  const diff = now - lastSeen;
  // agar last seen 2 minute (120000 ms) ke andar hai, toh online maano
  return diff < 120000;
};