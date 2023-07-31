import React, {useEffect, useState} from 'react';
import './App.css';
import { createSymbolClient } from './ws-client';

/**
 * Example usage of the websocket client
 *
 * Subscribe to symbols
 * client.subscribe(['A', 'AA']);
 *
 * Unsubscribe to symbols
 * client.unsubscribe(['A', 'AA']);
 */

interface Symbol {
  symbol: string,
  name: string,
  last: number,
  change: number,
  changePct: number,
}

interface Client {
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
}

const App = () => {
  useEffect(() => {
    const handleDataChanged = (data: Symbol[]) => {
      console.log('Received data', data);
    };
  
    const client: Client = createSymbolClient(handleDataChanged);
    client.subscribe(['BCS', 'ABB']);

    return () => {
      client.unsubscribe(['BCS', 'ABB']);
    };
  }, []);

  return <div className="app">(Your Typescript code here)</div>;
};

export default App;
