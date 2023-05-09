export default () => ({
  relayWebsocketUrl: process.env.RELAY_WEBSOCKET_URL,
  nostrPublicKey: process.env.NOSTR_PUBLIC_KEY,
  nostrPrivateKey: process.env.NOSTR_PRIVATE_KEY,
});
