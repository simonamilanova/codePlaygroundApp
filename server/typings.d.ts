import {CODE_SNIPPENTS} from "../codeplayground/src/constants"
type Language = keyof typeof CODE_SNIPPETS;

export interface ServerToClientEvents {
  serverMsg: (data: { code: string; room: string; username: string, language: Language }) => void;
  serverConsoleOutput: (data: {consoleOutput: string; room?: string}) => void;
  usersTyping: (users: { username: string; socketID: string }[]) => void;
  kicked: () => void; 
}

export interface ClientToServerEvents {
  clientMsg: (data: { code: string; room: string; username: string, language: Language }) => void;
  clientConsoleOutput: (data: {consoleOutput: string; room?: string}) => void;
  kickUser: (data: { room: string; username: string, socketID: string }) => void;
  joinRoom: (data: { room: string; username: string }) => void; 
}
