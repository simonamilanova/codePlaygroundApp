import { useEffect, useState } from "react";
import { executeCode } from "../../apiClient";
import { LANGUAGE_VERSIONS } from "../../constants";
import Spinner from "react-spinners/HashLoader";
import "./ConsoleOutput.css";
import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../../../server/typings";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://localhost:3001"
);

type SupportedLanguage = keyof typeof LANGUAGE_VERSIONS;

type consoleOutputProps = {
  code: string;
  language: SupportedLanguage;
  room: string;
};

const ConsoleOutput = ({ code, language, room }: consoleOutputProps) => {
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const runCode = async () => {
    if (!code) {
      return;
    }

    try {
      setLoading(true);
      const res = await executeCode(language, code);
      setOutput(res.run.output);
      socket.emit("clientConsoleOutput", { room, consoleOutput: res.run.output });
    } catch (error) {
      alert("Something went wrong when running code");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    socket.on("serverConsoleOutput", (data) => {      //not beign triggered when in a room - why?
      setOutput(data.consoleOutput);
    });
    
    return () => {
      socket.off("serverConsoleOutput");
    };
  }, [room, output]);

  return (
    <div className="container">
      <button className="button" onClick={runCode}>
        {loading ? (
          <Spinner color="#e0dbdb" loading={loading} size={17} />
        ) : (
          "Run Code"
        )}
      </button>
      <div className="outputContainer">
        {output ? output : "Click 'Run Code' to see the output"}
      </div>
    </div>
  );
};

export default ConsoleOutput;
