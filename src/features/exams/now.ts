/** Aktuelle Serverzeit in ms. Wird als serverNow an Client-Komponenten gereicht (siehe useNow). */
export function getServerNow() {
  return Date.now();
}
