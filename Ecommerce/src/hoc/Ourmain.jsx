import React from "react";
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from "../components/Sidebar";

const Ourmain = 
    (Component) => 
    ({ sidebarMode, ...props }) => {
        return (
            <div>
                <Header /> 
                <Sidebar sidebarMode={sidebarMode} />
                <Component {...props} />
                <Footer />
            </div>
        );
    };

export default Ourmain;