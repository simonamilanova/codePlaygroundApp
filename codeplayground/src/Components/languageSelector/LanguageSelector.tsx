import { LANGUAGE_VERSIONS } from "../../constants";
import { makeRequest } from "../../services/services";
import Button from "../button/Button";
import "./LanguageSelector.css";
import { useEffect, useState } from "react";

const languages = Object.entries(LANGUAGE_VERSIONS);
type Language = keyof typeof LANGUAGE_VERSIONS;

type props = {
  language: Language;
  onSelect: (language: Language) => void;
  username: string;
  code: string;
};

const LanguageSelector = ({ language, onSelect, username, code }: props) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language, selectedLanguage]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value as Language;
    setSelectedLanguage(newLanguage);
    onSelect(newLanguage);
  };

  const updateUserCode = async (username: string, code: string) => {
    try {
      const body = {
        code: code,
        language: selectedLanguage,
      };

      const response = await makeRequest(body, "PUT", `users/${username}/code`);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      await response.json();
      alert("Code Saved!");
    } catch (error) {
      console.error("Error updating user code:", error);
    }
  };

  return (
    <div className="languageContainer">
      <label className="labelContainer">Language:</label>
      <select
        value={selectedLanguage}
        onChange={handleChange}
        className="selectContainer"
      >
        {languages.map(([lang, version]) => (
          <option key={lang} value={lang}>
            {lang} ({version})
          </option>
        ))}
      </select>
      <span>
        Your username: <b>{username}</b>
      </span>
      <Button
        onClick={() => updateUserCode(username, code)}
        buttonName="Save My Code"
      />
    </div>
  );
};

export default LanguageSelector;
