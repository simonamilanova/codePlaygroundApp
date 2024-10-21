import "../button/Button.css"

type buttonProps = {
    buttonName: string,
    onClick: () => void;
    style?: React.CSSProperties;
}

const Button = ({buttonName, onClick, style} : buttonProps) => {

    return (
        <button style={style} className="btnStyle" onClick={onClick}>{buttonName}</button>
    )
}

export default Button;