import "./NavBar.css";

import { GiBookshelf } from "react-icons/gi";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoPersonSharp } from "react-icons/io5";

export default function NavBar() {
    const reloadPage = () => {
        window.location.reload();
    };

    return (
        <nav className="navbar">
            <button onClick={reloadPage} className="navbar-logo">
                LIBRARY
            </button>

            <div className="navbar-icons">
                <button className="navbar-icon-btn"><FaMagnifyingGlass /></button>
                <button className="navbar-icon-btn"><GiBookshelf /></button>
                <button className="navbar-icon-btn"><IoPersonSharp /></button>
            </div>
        </nav>
    );
}
