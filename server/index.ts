import express, { Express } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { ClientToServerEvents, ServerToClientEvents } from "./typings";
import dbClient from "./db";
import { addUser, doesUserExist, getUser, updateUserCode } from "./dbServices";

const app: Express = express();
app.use(cors());
app.use(express.json());
const server = createServer(app);
dbClient.connect();

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const usersTypingByRoom: {
  [roomName: string]: { username: string; socketID: string }[];
} = {};

io.on(
  "connection",
  (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    socket.on("joinRoom", ({ room, username }) => {
      socket.join(room);
      if (!usersTypingByRoom[room]) {
        usersTypingByRoom[room] = [];
      }
  
      if (!usersTypingByRoom[room].some(user => user.username === username)) {
        usersTypingByRoom[room].push({ username, socketID: socket.id });
      }
  
      io.to(room).emit("usersTyping", usersTypingByRoom[room]);
    });
  
    socket.on("clientMsg", (data) => {
      const { room } = data;
  
      if (room) {
        io.to(room).emit("serverMsg", data);
      } else {
        io.sockets.emit("serverMsg", data);
      }
    });

    socket.on("clientConsoleOutput", (data) => {
      const { room, consoleOutput } = data;
      if (room) {
        io.to(room).emit("serverConsoleOutput", { consoleOutput, room });
      } else {
        io.sockets.emit("serverConsoleOutput", { consoleOutput });
      }
    });
    
    

    socket.on("kickUser", ({ room, username }) => {
      const userToKick = usersTypingByRoom[room]?.find(
        (user) => user.username === username
      );

      if (userToKick) {
        socket.to(userToKick.socketID).emit("kicked");
        socket.leave(room);

        usersTypingByRoom[room] = usersTypingByRoom[room].filter(
          (user) => user.username !== username
        );
        io.to(room).emit("usersTyping", usersTypingByRoom[room]);
      }
    });

    socket.on("disconnect", () => {
      for (const room in usersTypingByRoom) {
        const index = usersTypingByRoom[room].findIndex(
          (user) => user.socketID === socket.id
        );
        if (index !== -1) {
          usersTypingByRoom[room].splice(index, 1);
          io.to(room).emit("usersTyping", usersTypingByRoom[room]);
        }
      }
    });
  }
);

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});

// Add new user
app.post("/users", async (req, res) => {
  const { id, username, code, newPassword } = req.body;
  
  try {
    await addUser(id, username, code, newPassword);
    res.status(201).send("User added successfully");
  } catch (error) {
    console.log("Error adding user:", error);
    res.status(500).send("An error occurred while adding the user");
  }
});

// Check if user exists
app.post("/check-username", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const exists = await doesUserExist(username, password);
    res.json({ exists });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Update user
app.put("/users/:username/code", async (req, res) => {
  const { username } = req.params;
  const { code, language } = req.body;

  try {
    const updatedUser = await updateUserCode(username, code, language);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Get user
app.get("/users/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await getUser(username);
    res.json(user.rows[0]);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
