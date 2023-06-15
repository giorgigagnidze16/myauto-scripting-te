import { ReactComponent as Logo } from '../styles/imgs/logo.svg';
import styles from "../styles/nav.module.css";
import {useWindowSize} from "@uidotdev/usehooks";
import React from "react";
import {Menu} from "@mui/icons-material";

export const Navbar = ({setNav} : {setNav :  React.Dispatch<React.SetStateAction<boolean>>}) => {
    const width = useWindowSize()

    return (
        <div className={styles.parent}>
            <div className={styles.wrapper}>
                <a href={"/"} className={styles.logo}>
                    <Logo />
                </a>
                {width.width <= 600 && <span className={styles.navMenu} onClick={() => setNav(prevState => !prevState)}>
                    <Menu style={{height: 40, width: 50}}/></span>}
            </div>
        </div>
    )
}

