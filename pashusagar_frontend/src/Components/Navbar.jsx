import { useState, useEffect } from "react";
import Logo1 from "../assets/Logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import { IoMdMenu } from "react-icons/io";
import { X, Search, ShoppingCart, ChevronDown } from "lucide-react";
import { IoMdPerson } from "react-icons/io";
import { FaSignOutAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Bell } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ------ NEW NOTIFICATION STATE ------
  const [notifications, setNotifications] = useState([]);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const role = localStorage.getItem("role");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");
    const storedProfileImage = localStorage.getItem("profile_image");
    if (storedUsername && storedEmail) {
      setUser({
        username: storedUsername,
        email: storedEmail,
        profile_image: storedProfileImage,
      });
    }
  }, []);

  // ------ FETCH NOTIFICATIONS ------
  useEffect(() => {
    // Only fetch if user is logged in
    if (user) {
      const fetchNotifications = async () => {
        try {
          const response = await fetch("http://127.0.0.1:8000/api/notifications/", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch notifications");
          }
          const data = await response.json();
          setNotifications(data);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };
      fetchNotifications();
    }
  }, [user]);

  // ------ MARK SINGLE NOTIFICATION AS READ ------
  const markNotificationAsRead = async (notifId) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/notifications/${notifId}/read/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ read: true }),
      });
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // ------ MARK ALL NOTIFICATIONS AS READ (OPTIONAL) ------
  const markAllNotificationsAsRead = async () => {
    try {
      // Option A: loop over unread notifications
      const unreadNotifs = notifications.filter((n) => !n.read);
      for (const notif of unreadNotifs) {
        await fetch(`http://127.0.0.1:8000/api/notifications/${notif.id}/read/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ read: true }),
        });
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Toggles
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMobileProfileOpen) setIsMobileProfileOpen(false);
    document.body.style.overflow = isMenuOpen ? "auto" : "hidden";
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleMobileProfile = () => {
    setIsMobileProfileOpen(!isMobileProfileOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        document.getElementById("search-input")?.focus();
      }, 100);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleCartClick = () => {
    navigate("/mycart");
  };

  // ------ TOGGLE NOTIFICATIONS ------
  const toggleNotifications = () => {
    setIsNotifsOpen(!isNotifsOpen);
  };

  // Submenu for logged-in user
  const ProfileMenu = ({ isMobile = false }) => (
    <div
      className={`${
        isMobile
          ? "bg-[#005d4f] mt-2"
          : "absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg"
      } overflow-hidden`}
    >
      <NavLink
        to="/myaccount"
        className={`block px-4 py-2 ${
          isMobile
            ? "text-white hover:bg-[#006d5f]"
            : "text-gray-700 hover:bg-[#55DD4A] hover:text-white"
        } transition-colors duration-200`}
        onClick={() => isMobile && toggleMenu()}
      >
        My Account
      </NavLink>
      <NavLink
        to="/history"
        className={`block px-4 py-2 ${
          isMobile
            ? "text-white hover:bg-[#006d5f]"
            : "text-gray-700 hover:bg-[#55DD4A] hover:text-white"
        } transition-colors duration-200`}
        onClick={() => isMobile && toggleMenu()}
      >
        History
      </NavLink>
      <NavLink
        to="/changepassword"
        className={`block px-4 py-2 ${
          isMobile
            ? "text-white hover:bg-[#006d5f]"
            : "text-gray-700 hover:bg-[#55DD4A] hover:text-white"
        } transition-colors duration-200`}
        onClick={() => isMobile && toggleMenu()}
      >
        Change Password
      </NavLink>
      <NavLink
        to="/updateprofile"
        className={`block px-4 py-2 ${
          isMobile
            ? "text-white hover:bg-[#006d5f]"
            : "text-gray-700 hover:bg-[#55DD4A] hover:text-white"
        } transition-colors duration-200`}
        onClick={() => isMobile && toggleMenu()}
      >
        Update Profile
      </NavLink>
      {role === "seller" && (
        <NavLink
          to="/seller/dashboard"
          className={`block px-4 py-2 ${
            isMobile
              ? "text-white hover:bg-[#006d5f]"
              : "text-gray-700 hover:bg-[#55DD4A] hover:text-white"
          } transition-colors duration-200`}
          onClick={() => isMobile && toggleMenu()}
        >
          Seller Dashboard
        </NavLink>
      )}
      {role === "admin" && (
        <NavLink
          to="/admin/dashboard"
          className={`block px-4 py-2 ${
            isMobile
              ? "text-white hover:bg-[#006d5f]"
              : "text-gray-700 hover:bg-[#55DD4A] hover:text-white"
          } transition-colors duration-200`}
          onClick={() => isMobile && toggleMenu()}
        >
          Admin Dashboard
        </NavLink>
      )}
      {role === "user" && (
        <NavLink
          to="/user/dashboard"
          className={`block px-4 py-2 ${
            isMobile
              ? "text-white hover:bg-[#006d5f]"
              : "text-gray-700 hover:bg-[#55DD4A] hover:text-white"
          } transition-colors duration-200`}
          onClick={() => isMobile && toggleMenu()}
        >
          User Dashboard
        </NavLink>
      )}
      <button
        onClick={() => {
          handleLogout();
          isMobile && toggleMenu();
        }}
        className={`w-full px-4 py-2 text-left ${
          isMobile
            ? "text-white hover:bg-[#006d5f]"
            : "text-gray-700 hover:bg-[#55DD4A] hover:text-white"
        } transition-colors duration-200`}
      >
        <FaSignOutAlt className="inline mr-2" />
        Logout
      </button>
    </div>
  );

  // ------ NOTIFICATIONS DROPDOWN UPDATED ------
  const NotificationsDropdown = () => (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50">
      <div className="max-h-60 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-800">Notifications</h3>
          <button
            onClick={markAllNotificationsAsRead}
            className="text-sm text-blue-500 hover:underline"
          >
            Mark all as read
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-gray-700 text-sm">No new notifications</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`mb-2 p-2 rounded shadow-sm text-sm 
                ${notif.read ? "bg-gray-100 text-gray-700" : "bg-white text-gray-800"}`}
            >
              <p>{notif.message}</p>
              {!notif.read && (
                <button
                  onClick={() => markNotificationAsRead(notif.id)}
                  className="text-xs text-blue-500 hover:underline mt-1"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <nav className="bg-gradient-to-r from-[#004d40] to-[#00695c] backdrop-blur-lg shadow-md sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src={Logo1}
              alt="Logo"
              className="h-8 w-auto sm:h-10 md:h-12 lg:h-14 transition-all duration-200"
            />
          </div>

          {/* Mobile Right Icons */}
          <div className="flex items-center space-x-4 lg:hidden">
            {/* Cart */}
            <button
              onClick={handleCartClick}
              className="p-2 hover:bg-[#55DD4A] rounded-full transition-colors duration-200 relative"
            >
              <ShoppingCart className="text-white" size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notifications (Mobile) */}
            {user && (
              <button
                onClick={toggleNotifications}
                className="relative p-2 hover:bg-[#55DD4A] rounded-full transition-colors duration-200"
              >
                <Bell className="text-white" size={24} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            )}

            {/* Search */}
            <button
              onClick={toggleSearch}
              className="p-2 hover:bg-[#55DD4A] rounded-full transition-colors duration-200"
            >
              <Search className="text-white" size={24} />
            </button>

            {/* Profile or Login */}
            {user && (
              <button
                onClick={toggleProfileMenu}
                className="p-2 hover:bg-[#55DD4A] rounded-full transition-colors duration-200"
              >
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <IoMdPerson className="text-white text-2xl" />
                )}
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={toggleMenu}
              className="p-2 hover:bg-[#55DD4A] rounded-full transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="text-white" size={24} />
              ) : (
                <IoMdMenu className="text-white text-2xl" />
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-between flex-1 ml-8">
            {/* Left Nav Links */}
            <div className="flex ml-24 space-x-4 xl:space-x-8">
              {[
                { to: "/", label: "Home" },
                { to: "/pharmacy", label: "Pharmacy" },
                { to: "/online-booking", label: "Booking" },
                { to: "/online-consultation", label: "Online Consultation" },
              ].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-2 text-white uppercase text-sm xl:text-base transition-colors duration-200 
                    ${isActive ? "bg-[#55DD4A] rounded-xl" : "hover:bg-[#55DD4A] rounded-xl"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-6">
              {/* Cart */}
              <button
                onClick={handleCartClick}
                className="relative p-2 hover:bg-[#55DD4A] rounded-full transition-colors duration-200"
              >
                <ShoppingCart className="text-white" size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Notifications (Desktop) */}
              {user && (
                <div className="relative">
                  <button
                    onClick={toggleNotifications}
                    className="relative p-2 hover:bg-[#55DD4A] rounded-full transition-colors duration-200"
                  >
                    <Bell className="text-white" size={24} />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                  {isNotifsOpen && <NotificationsDropdown />}
                </div>
              )}

              {/* Search */}
              <button
                onClick={toggleSearch}
                className="p-2 hover:bg-[#55DD4A] rounded-full transition-colors duration-200"
              >
                <Search className="text-white" size={24} />
              </button>

              {/* User Profile or Login/Signup */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-[#55DD4A] rounded-xl transition-colors duration-200"
                  >
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <IoMdPerson className="text-xl" />
                    )}
                    <span className="text-sm font-medium">{user.username}</span>
                  </button>
                  {isProfileMenuOpen && <ProfileMenu />}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <NavLink
                    to="/login"
                    className="px-4 py-2 text-white hover:bg-[#55DD4A] rounded-xl transition-colors duration-200"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="px-4 py-2 bg-[#55DD4A] text-white rounded-xl hover:bg-green-600 transition-colors duration-200"
                  >
                    Sign up
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-screen opacity-100 visible" : "max-h-0 opacity-0 invisible"
          }`}
        >
          <div className="py-4 space-y-2">
            {[
              { to: "/", label: "Home" },
              { to: "/pharmacy", label: "Pharmacy" },
              { to: "/online-booking", label: "Booking" },
              { to: "/online-consultation", label: "Online Consultation" },
            ].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={toggleMenu}
                className={({ isActive }) =>
                  `block px-4 py-2 text-white text-center uppercase text-sm transition-colors duration-200
                  ${isActive ? "bg-[#55DD4A]" : "hover:bg-[#55DD4A]"}`}
              >
                {link.label}
              </NavLink>
            ))}

            {/* Mobile Profile Menu */}
            {user ? (
              <div className="space-y-2 pt-4">
                <button
                  onClick={toggleMobileProfile}
                  className="w-full flex items-center justify-center px-4 py-2 text-white hover:bg-[#55DD4A] transition-colors duration-200"
                >
                  <span className="mr-2">Profile Menu</span>
                  <ChevronDown
                    size={20}
                    className={`transform transition-transform duration-200 ${
                      isMobileProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isMobileProfileOpen && <ProfileMenu isMobile={true} />}
              </div>
            ) : (
              <div className="space-y-2 pt-4">
                <NavLink
                  to="/login"
                  onClick={toggleMenu}
                  className="block px-4 py-2 text-white text-center hover:bg-[#55DD4A] transition-colors duration-200"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={toggleMenu}
                  className="block px-4 py-2 text-white text-center bg-[#55DD4A] hover:bg-green-600 transition-colors duration-200"
                >
                  Sign up
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute top-0 left-0 w-full transform">
            <form onSubmit={handleSearch} className="bg-white shadow-lg">
              <div className="container mx-auto max-w-4xl p-4">
                <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <input
                    id="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 p-3 bg-transparent focus:outline-none text-lg"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-[#004d40] text-white hover:bg-[#00695c] transition-colors duration-200"
                  >
                    <Search size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
