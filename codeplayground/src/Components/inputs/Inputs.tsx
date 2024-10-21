import "./Inputs.css";

type inlineInputsProps = {
  value?: string;
  newPassword: string;
  userPlaceholder: string;
  passwordPlaceholder: string;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Inputs = ({
  value,
  newPassword,
  userPlaceholder,
  passwordPlaceholder,
  onUsernameChange,
  onPasswordChange,
}: inlineInputsProps) => {
  return (
    <div className="box">
      <input
        value={value}
        onChange={onUsernameChange}
        placeholder={userPlaceholder}
        style={{ marginRight: "10px" }}
      />
      <input
        type="password"
        value={newPassword}
        onChange={onPasswordChange}
        placeholder={passwordPlaceholder}
      />
    </div>
  );
};

export default Inputs;
