import {faMoon,faSun} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useState,useEffect} from "react";


export default function ThemeSwitch() {
    const [currentTheme, setCurrentTheme] = useState();

    useEffect(() => {
        if (localStorage.getItem("theme")) {
            setCurrentTheme(localStorage.getItem("theme"));
            document.documentElement.setAttribute("data-theme", localStorage.getItem("theme"));
        } else {
            setCurrentTheme("light");
            document.documentElement.setAttribute("data-theme", "light");
        }
    });

    const switchTheme = () => {
        if (currentTheme === "light") {
            setCurrentTheme("dark");
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        }
        else {
            setCurrentTheme("light");
            document.documentElement.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
        }
    }


    return (
        <button onClick={switchTheme} className={"theme-switch"}>
            {currentTheme === "light" ? <FontAwesomeIcon icon={faSun} /> : <FontAwesomeIcon icon={faMoon} />}
        </button>)
}