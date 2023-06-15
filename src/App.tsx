import React, {useState} from 'react';
import {Navbar} from "./components/nav/nav";
import {Body} from "./components/body/body";

const styles = {
    height: "100vh",
    width: "100%",
}

function App() {
    const [showNav, setShowNav] = useState(false)

    return (
        <div style={styles}>
            <Navbar setNav={setShowNav}/>
            <Body nav={showNav}/>
        </div>
    );
}

export default App;
