import { useEffect } from 'react';

import { createSymbolClient } from './ws-client';
require('./App.css');

/**
 * Example usage of the websocket client
 *
 * Subscribe to symbols
 * client.subscribe(['A', 'AA']);
 *
 * Unsubscribe to symbols
 * client.unsubscribe(['A', 'AA']);
 * 
 * interface Symbol {
 *   symbol: string,
 *   name: string,
 *   last: number,
 *   change: number,
 *   changePct: number,
 * }
*/

function App() {
  useEffect(() => {
    const handleDataChanged = (data) => {
      console.log('Received data', data);
    };

    const client = createSymbolClient(handleDataChanged);
    client.subscribe(['BCS', 'ABB']);

    return () => {
      client.unsubscribe(['BCS', 'ABB']);
    };
  }, []);


  return <div className="app">(Your Javascript code here)</div>;
}

export default App;
