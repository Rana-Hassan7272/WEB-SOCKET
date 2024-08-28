import React, { useEffect, useState, useMemo } from 'react';
import { io } from "socket.io-client";
import { Container, TextField, Typography, Button, Stack } from '@mui/material';

export default function App() {
  const socket = useMemo(() => io("http://localhost:3000", { withCredentials: true }), []);

  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [socketid, setSocketid] = useState("");
  const [roomBox, setRoomBox] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message", { room, message });
    setMessage("");
  };

  const handleRoom = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomBox);
    setRoom(roomBox);
    setRoomBox("");
  };

  useEffect(() => {
    socket.on("connect", () => {
      setSocketid(socket.id);
      console.log("Connected to server", socket.id);
    });

    socket.on("receive-message", (data) => {
      console.log("Received message:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("welcome", (message) => {
      console.log(message);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <Container style={{ marginTop: '20px', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Socket ID: {socketid}
      </Typography>
      <form onSubmit={handleRoom} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TextField
          id="outlined-basic"
          label="Room Name"
          variant="outlined"
          value={roomBox}
          onChange={(e) => { setRoomBox(e.target.value); }}
          style={{ marginBottom: '20px', width: '300px' }}
        />
        <Button type='submit' variant='contained' color='primary' style={{ marginBottom: '10px' }}>
          Join
        </Button>
      </form>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TextField
          id="outlined-basic"
          label="Message"
          variant="outlined"
          value={message}
          onChange={(e) => { setMessage(e.target.value); }}
          style={{ marginBottom: '20px', width: '300px' }}
        />
        <TextField
          id="outlined-basic"
          label="Room Id"
          variant="outlined"
          value={room}
          onChange={(e) => { setRoom(e.target.value); }}
          style={{ marginBottom: '20px', width: '300px' }}
        />
        <Button type='submit' variant='contained' color='primary' style={{ marginBottom: '10px' }}>
          Send
        </Button>
      </form>
      <Stack>
        {messages.map((m, i) => (
          <Typography key={i} variant='h6' component="div" gutterBottom>
            {m.message}
          </Typography>
        ))}
      </Stack>
    </Container>
  );
}
