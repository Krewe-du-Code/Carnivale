import React from "react";
import { useAuth0 } from "@auth0/auth0-react"; //TODO: temporary
import { Link, To, useNavigate } from "react-router-dom";
import { Navbar, Button} from 'react-bootstrap/';
import { MdDynamicFeed } from "react-icons/md";
import { VscFeedback } from "react-icons/vsc"
import { FaMapMarkedAlt } from "react-icons/fa"
import { IoHomeOutline, IoPeople } from "react-icons/io5";


const NavBar = () => {
  const navigate = useNavigate();
  const handleNavigation = (path: To) => {
    navigate(path);
  };

  const { logout } = useAuth0();

  return (
      <Navbar fixed="bottom" className="bottom-nav">

          <div className="d-flex flex-column">
          <Button
            className="bottom-nav-button rounded-circle"
            type="button"
            id="homeButton"
            onClick={() => handleNavigation("/homepage")}
          >
            <IoHomeOutline />
          </Button>


          </div>

          <Button
          className="bottom-nav-button rounded-circle"
            type="button"
            id="mapButton"
            onClick={() => handleNavigation("/mappage")}
          >
            <FaMapMarkedAlt />
          </Button>

          <Button
          className="bottom-nav-button rounded-circle"
            type="button"
            id="feedButton"
            onClick={() => handleNavigation("/feedpage")}
          >
            <MdDynamicFeed />
          </Button>

          <Button
            className="bottom-nav-button rounded-circle"
            type="button"
            id="userButton"
            onClick={() => handleNavigation("/userpage")}
          >
            <IoPeople />
          </Button>

        {/* <span>
          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            Log Out
          </button>
        </span> */}
      </Navbar>

  );
};
export default NavBar;
