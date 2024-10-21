import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";
import { useState } from "react";
import Button from "../../Components/button/Button";
import Inputs from "../../Components/inputs/Inputs";
import { makeRequest } from "../../services/services";

const WelcomePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [existingUsername, setExistingUsername] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [existingPassword, setExistingPassword] = useState<string>("");

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleExistingUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExistingUsername(e.target.value);
  };

  const handleUserCreation = async () => {
    const id: number = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    const code: string = "";

    if (!username || !newPassword) {
      alert("Please fill in both the username and password fields.");
      return;
    }

    const body = {
      username: username,
      password: newPassword,
    };

    const response = await makeRequest(body, "POST", "check-username");
    const checkData = await response.json();

    if (checkData.exists) {
      alert("Username already exists. Please choose a different username.");
      setUsername("");
      setNewPassword("");
      return;
    }

    try {
      const body = {
        id,
        username,
        code,
        newPassword,
      };
      const response = await makeRequest(body, "POST", "users");

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.text();
      navigateToPlayground(username);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleExistingUser = async () => {
    if (!existingUsername || !existingPassword) {
      alert("Please fill in both the username and password fields.");
      return;
    }

    const body = {
      username: existingUsername,
      password: existingPassword,
    };
    const response = await makeRequest(body, "POST", "check-username");

    const checkData = await response.json();

    if (checkData.exists) {
      navigateToPlayground(existingUsername);
    } else {
      alert("Username or password doesn't match");
      setExistingUsername("");
      setExistingPassword("");
    }
  };

  const navigateToPlayground = (username: string) => {
    navigate("/playground", { state: { username } });
  };

  const handleNewPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleExistingPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExistingPassword(e.target.value);
  };

  return (
    <div className="mainContainer">
      <h1>Welcome to Code Playground!</h1>
      <p>Create a username to enter code playground:</p>
      <Inputs
        value={username}
        newPassword={newPassword}
        userPlaceholder="Enter username"
        passwordPlaceholder="Enter password"
        onUsernameChange={handleUsernameChange}
        onPasswordChange={handleNewPassword}
      />
      <Button onClick={handleUserCreation} buttonName="Enter" />
      <p>Enter existing username:</p>
      <Inputs
        newPassword={existingPassword}
        userPlaceholder="Enter username"
        passwordPlaceholder="Enter password"
        onUsernameChange={handleExistingUsername}
        onPasswordChange={handleExistingPassword}
      />
      <Button onClick={handleExistingUser} buttonName="Enter" />
    </div>
  );
};

export default WelcomePage;
