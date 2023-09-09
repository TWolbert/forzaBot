import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import { useParams } from 'react-router-dom';
import { connect } from 'socket.io-client';

export default function Username() {
    const { username } = useParams();

    const [isConnected, setIsConnected] = useState(socket.connected);
    const [players, setPlayers] = useState([]);
    const [started, setStarted] = useState(false);
    const [price, setPrice] = useState("");
    const [class_, setClass] = useState("");
    const [race, setRace] = useState("");
    const [not_upgradeable, setNotUpgradeable] = useState("");
    const [cartype, setCarType] = useState("");
    class Round {
        selectedprice = null;
        selectedclass = null;
        selectedrace = null;
        selectednot_upgradeable = null;
        selectedcartype = null;
    
        constructor(selectedprice, selectedclass, selectedrace, selectednot_upgradeable, selectedcartype) {
            this.selectedprice = selectedprice;
            this.selectedclass = selectedclass;
            this.selectedrace = selectedrace;
            this.selectednot_upgradeable = selectednot_upgradeable;
            this.selectedcartype = selectedcartype;
        }
    }

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
                setStarted(data.state);
                let options = data.options;
                let round = new Round(options.selectedprice, options.selectedclass, options.selectedrace, options.selectednot_upgradeable, options.selectedcartype)
                setPrice(round.selectedprice);
                setClass(round.selectedclass);
                setRace(round.selectedrace);
                setNotUpgradeable(round.selectednot_upgradeable);
                setCarType(round.selectedcartype);
            })

            socket.on('stopped', (data) => {
                setStarted(data.state);
            });
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
    function stop() {
        socket.emit('stop', username);
    }

    return (
        <>
            <h1>Username: {username}</h1>
            <p>State: { '' + isConnected }</p>
            <button onClick={ connect }>Join</button>
            <button onClick={ disconnect }>Leave</button>
            {players[0] === username ? <button onClick={ start }>Start</button> : null}
            {players[0] === username ? <button onClick={ stop }>Stop</button> : null}
            <p>{players}</p>
            <p>Started: { '' + started }</p>
            <p>Price: {price}</p>
            <p>Class: {class_}</p>
            <p>Race: {race}</p>
            <p>Not Upgradeable: {not_upgradeable}</p>
            <p>Car Type: {cartype}</p>
        </>
    );
}