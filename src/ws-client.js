export const createSymbolClient = (onChange) => {
  const webSocket = new WebSocket('ws://localhost:8082');
  webSocket.binaryType = 'arraybuffer';
  let isConnected = false;
  let pendingSubscriptions = [];

  webSocket.onopen = function (event) {
    isConnected = true;
    pendingSubscriptions.forEach((subscription) => subscription());
    pendingSubscriptions = [];
  };

  webSocket.onmessage = (event) => {
    onChange(JSON.parse(event.data));
  };

  const subscribe = (symbols) => {
    console.info('Subscribing to symbols', symbols);
    const msg = JSON.stringify({
      type: 'subscribe',
      symbols,
    });

    if (isConnected) {
      webSocket.send(msg);
    } else {
      pendingSubscriptions.push(() => webSocket.send(msg));
    }
  };

  const unsubscribe = (symbols) => {
    const msg = JSON.stringify({
      type: 'unsubscribe',
      symbols,
    });

    if (isConnected) {
      webSocket.send(msg);
    } else {
      pendingSubscriptions.push(() => webSocket.send(msg));
    }
  };

  return {
    subscribe,
    unsubscribe,
  };
};
