import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {

    return(
        <div style={{ backgroundColor: '#F0F8FF' }}>
        <Sidebar />
        <main className="flex-grow ml-64 relative">
          <Navbar />
          {children}
        </main>
      </div>
    )
}

export default Layout;