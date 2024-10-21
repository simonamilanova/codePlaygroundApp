import Button from "../button/Button";
import "../usersTyping/UsersTyping.css"

type UsersTypingProps = {
  usersTyping: { username: string; socketID: string }[];
  handleKickUser: (userToKick: string) => void;
  isAdmin: { isAdmin: boolean; username: string } | undefined;
  username: string;
};

const UsersTyping = ({
  usersTyping,
  handleKickUser,
  isAdmin,
  username,
}: UsersTypingProps) => {
    
  return (
    <div className="usersTyping">
      <p>
        <strong>Users currently typing:</strong>
      </p>
      {usersTyping.length > 1 ? (
        <ul>
          {usersTyping.map((user, index) => {
            if (
              isAdmin?.username === user.username ||
              username === user.username
            ) {
              return null;
            }

            return (
              <li key={index}>
                {user.username}
                {isAdmin?.isAdmin && (
                  <Button
                    onClick={() => handleKickUser(user.username)}
                    buttonName="Kick"
                  />
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No users typing</p>
      )}
    </div>
  );
};

export default UsersTyping;
