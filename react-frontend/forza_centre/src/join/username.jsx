import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import { useParams } from 'react-router-dom';
import { connect } from 'socket.io-client';

export default function Username() {
    const { username } = useParams();

    const [isConnected, setIsConnected] = useState(socket.connected);
    const [players, setPlayers] = useState([]);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            socket.id = username;
            
            socket.emit('join', username);

            socket.on('joined', (data) => {
                console.log(data);
                setPlayers(data);
            });

            socket.on('started', (data) => {
                console.log(data);
                setStarted(data.state);
            })
        }

        function onDisconnect() {

            setIsConnected(false);

        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on("error", (err) => {
            console.error(err.message);
        });


        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    });
    function connect() {
        socket.connect();
      }
    
    function disconnect() {
        socket.emit('leave', username);
        socket.disconnect();
    }
    function start() {
        socket.emit('start', username);
    }

    return (
        <>
            <h1>Username: {username}</h1>
            <p>State: { '' + isConnected }</p>
            <button onClick={ connect }>Join</button>
            <button onClick={ disconnect }>Leave</button>
            {players[0] === username ? <button onClick={ start }>Start</button> : null}
            <p>{players}</p>
            <p>Started: { '' + started }</p>
        </>
    );
}