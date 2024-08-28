import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY || "defaultSecretKey";

// Setup CORS middleware
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(cookieParser());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.get("/", (req, res) => {
    res.send("hello world");
});

app.get("/login", (req, res) => {
    const token = jwt.sign({ _id: "hashkdjkjadk" }, secretKey);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
       .json({ message: "login success" });
});

io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res || {}, (err) => {
        if (err) return next(err);
        const token = socket.request.cookies.token;
        if (!token) return next(new Error("Authentication error"));
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) return next(new Error("Authentication error"));
            socket.decoded = decoded;
            next();
        });
    });
});

io.on("connection", (socket) => {
    console.log(`connected ${socket.id}`);

    socket.on("join-room", (room) => {
        socket.join(room);
        console.log(`${socket.id} joined room ${room}`);
        socket.emit("welcome", `Welcome to room ${room}, ${socket.id}`);
    });

    socket.on("message", ({ room, message }) => {
        console.log(`Message from ${socket.id} to room ${room}: ${message}`);
        io.to(room).emit("receive-message", { message});
    });

    socket.on("room-box", (data) => {
        socket.join(data);
    });

    socket.on("disconnect", () => {
        console.log(`disconnected ${socket.id}`);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
