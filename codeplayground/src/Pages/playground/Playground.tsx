import { Editor } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import LanguageSelector from "../../Components/languageSelector/LanguageSelector";
import { CODE_SNIPPETS } from "../../constants";
import ConsoleOutput from "../../Components/consoleOutput/ConsoleOutput";
import "../playground/Playground.css";
import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../../../server/typings";
import { useLocation } from "react-router-dom";
import Button from "../../Components/button/Button";
import { SocketType } from "dgram";
import UsersTyping from "../../Components/usersTyping/UsersTyping";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://localhost:3001"
);

type Language = keyof typeof CODE_SNIPPETS;

const Playground = () => {
  const [code, setCode] = useState<string>(CODE_SNIPPETS["javascript"]);
  const [language, setLanguage] = useState<Language>("javascript");
  const [room, setRoom] = useState<string>("");
  const editorRef = useRef(null);
  const location = useLocation();
  const { username } = location.state;
  const [usersTyping, setUsersTyping] = useState<
    { username: string; socketID: string }[]
  >([]);
  const [, setSocketID] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<{
    isAdmin: boolean;
    username: string;
  }>();
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  useEffect(() => {
    const getUser = async (username: string) => {
      try {
        const response = await fetch(
          `http://localhost:3001/users/${username}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (data.code) {
          setCode(data.code);
        }

        if (data.language) {
          setLanguage(data.language);
        }
      } catch (error) {
        console.error("Error updating user code:", error);
      }
    };

    getUser(username);
  }, [username]);

  socket.on("connect", () => {
    setSocketID(socket.id as SocketType);
  });

  const onMountEditor = (editor: any): void => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelectedLanguage = (language: Language) => {
    setLanguage(language);
    setCode(CODE_SNIPPETS[language]);
  };

  const handleChangeEditor = (newCode: string) => {
    setUndoStack([...undoStack, code]);
    setRedoStack([]);
    setCode(newCode || "");
    socket.emit("clientMsg", { code: newCode, room, username, language });
  };

  useEffect(() => {
    socket.on("serverMsg", (data) => {
      setCode(data.code);
      setRoom(data.room);
      setLanguage(data.language as Language);
    });

    return () => {
      socket.off("serverMsg");
    };
  }, [socket, code, language, room, usersTyping]);

  useEffect(() => {
    socket.on("kicked", () => {
      alert("You have been kicked from the room.");
      setRoom("");
    });

    return () => {
      socket.off("kicked");
    };
  }, []);

  useEffect(() => {
    socket.on("usersTyping", (data) => {
      setUsersTyping(data);
    });

    return () => {
      socket.off("usersTyping");
    };
  }, [socket]);

  const handleEnterClick = () => {
    if (room) {
      socket.emit("joinRoom", { room, username });
      alert("You have entered room " + room);
    } else {
      alert("Please enter a valid room.");
    }
  };

  const createRoom = () => {
    const randomNumber: number =
      Math.floor(Math.random() * (500 - 100 + 1)) + 100;
    const roomSessionUrl: string = `code-playground-session/${randomNumber}`;
    setRoom(roomSessionUrl);
    setIsAdmin({ isAdmin: true, username });
  };

  const handleKickUser = (userToKick: string) => {
    const user = usersTyping.find((user) => user.username === userToKick);
    if (user) {
      socket.emit("kickUser", {
        room,
        username: user.username,
        socketID: user.socketID,
      });
    }

    setUsersTyping((prevUsers) =>
      prevUsers.filter((u) => u.username !== userToKick)
    );
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousCode = undoStack[undoStack.length - 1];
      setRedoStack([...redoStack, code]);
      setUndoStack(undoStack.slice(0, -1));
      setCode(previousCode);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextCode = redoStack[redoStack.length - 1];
      setUndoStack([...undoStack, code]);
      setRedoStack(redoStack.slice(0, -1));
      setCode(nextCode);
    }
  };

  return (
    <div>
      <LanguageSelector
        code={code}
        username={username}
        language={language}
        onSelect={onSelectedLanguage}
      />
      <div className="container left">
      <Button style={{height: '30px', padding: '10px'}} buttonName="Undo" onClick={handleUndo} />
      <Button style={{height: '30px', padding: '10px'}} buttonName="Redo" onClick={handleRedo} />
        <Editor
          language={language}
          theme="vs-dark"
          value={code}
          onMount={onMountEditor}
          onChange={(newCode) => {
            handleChangeEditor(newCode || "");
          }}
        />
        <div className="roomInputSection">
          <div className="roomInfo">
            <p>Your current room is: {room !== "" ? <b>{room}</b> : "none"}</p>
            <Button onClick={createRoom} buttonName="Create Room" />
          </div>

          <div className="joinSessionContainer">
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Your code session room url"
            />
            <Button buttonName="JOIN" onClick={handleEnterClick} />
          </div>
        </div>
      </div>
      <div className="container right">
        <ConsoleOutput room={room} code={code} language={language} />
      </div>
      <UsersTyping
        usersTyping={usersTyping}
        handleKickUser={handleKickUser}
        isAdmin={isAdmin}
        username={username}
      />
    </div>
  );
};

export default Playground;
