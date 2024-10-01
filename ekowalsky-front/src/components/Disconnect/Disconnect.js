import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPowerOff} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";
export default function Disconnect() {
    const navigate = useNavigate();
    return (
        <button onClick={()=>{
            localStorage.removeItem("user");
            navigate("/login");
        }} className={"disconnect-button"}>
            <FontAwesomeIcon icon={faPowerOff} />
        </button>
    )
}