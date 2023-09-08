import React from 'react';
import { socket } from '../socket';

export default function ConnectionManager() {


  return (
    <>
      <button onClick={ connect }>Connect</button>
      <button onClick={ disconnect }>Disconnect</button>
    </>
  );
}