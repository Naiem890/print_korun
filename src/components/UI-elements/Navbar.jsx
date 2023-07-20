import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(false);

  const navItems = [
    { text: "My Orders", link: "/my-orders" },
    { text: "Edit Profile", link: "/profile" },
  ].map((item) => (
    <li key={item.link}>
      <Link to={item.link} className="px-6 py-4">
        {item.text}
      </Link>
    </li>
  ));

  return (
    <div className="navbar text-white bg-slate-700">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          Print Korun
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        {loggedIn && (
          <ul className="flex gap-6 px-1">
            <Link to="/" className="">
              Shops
            </Link>
            {navItems}
          </ul>
        )}
      </div>
      <div className="navbar-end">
        {loggedIn ? (
          <div className="dropdown">
            <label
              onClick={() => setDropdownOpen((prev) => !prev)}
              tabIndex={0}
              className="btn btn-ghost lg:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
            {dropdownOpen(
              <ul
                onClick={() => setDropdownOpen((prev) => !prev)}
                tabIndex={0}
                className="menu menu-sm right-0 dropdown-content mt-3 z-[1] gap-2 shadow bg-base-100 text-black rounded-box w-52"
              >
                {navItems}
                <button className="btn btn-warning btn-outline">Log out</button>
              </ul>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn btn-success btn-md px-6 btn-outline">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
