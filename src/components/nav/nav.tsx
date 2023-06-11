import { ReactComponent as Logo } from '../styles/imgs/logo.svg';
import styles from "../styles/nav.module.css";

export const Navbar = () => {

    return (
        <div className={styles.parent}>
            <div className={styles.wrapper}>
                <a href={"/"} className={styles.logo}>
                    <Logo />
                </a>
            </div>
        </div>
    )
}

