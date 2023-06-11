import React from 'react';
import {Navbar} from "./components/nav/nav";
import {Body} from "./components/body/body";

const styles = {
    height: "100vh",
    widows: "100vw",
}

function App() {
    return (
        <div style={styles}>
            <Navbar/>
            <Body/>
        </div>
    );
}

export default App;
