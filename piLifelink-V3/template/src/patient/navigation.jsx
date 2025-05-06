import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaBell } from "react-icons/fa";
import axios from "axios";

export const Navigation = (props) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilisateur");
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const storedUserId = localStorage.getItem("userId");
    console.log("Stored User ID in localStorage:", storedUserId); // Debugging
    if (storedUserName) {
      setUserName(storedUserName);
    }
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      console.error("User ID not found in localStorage");
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userId) {
        try {
          const response = await axios.get(`http://localhost:3001/api/patients/${userId}/notifications`);
          setNotifications(response.data);
          setUnreadCount(response.data.filter(n => n.status === "unread").length);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
    
    // Set up polling to check for new notifications
    const interval = setInterval(fetchNotifications, 30000); // every 30 seconds
    
    return () => clearInterval(interval);
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:3001/api/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, status: "read" } 
          : notification
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const Logout = () => {
    console.log("Déconnexion en cours...");
    window.localStorage.removeItem("isLogedIn");
    window.localStorage.removeItem("userName");
    window.localStorage.removeItem("userId");

    console.log("isLogedIn supprimé:", localStorage.getItem("isLogedIn"));
    navigate("/");
  };

  const handleUserClick = (e) => {
    e.preventDefault();
    if (userId) {
      console.log("User ID:", userId); // Log the user ID to the console
      navigate(`/showProfile/${userId}`);
    } else {
      console.error("User ID not found");
    }
  };

  const handleComplaintsClick = (e) => {
    e.preventDefault();
    if (userId) {
      navigate(`/complaints/${userId}`);
    } else {
      console.error("User ID not found");
    }
  };

  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-example-navbar-collapse-1"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
        </div>

        <div
          className="collapse navbar-collapse"
          id="bs-example-navbar-collapse-1"
        >
          <ul className="nav navbar-nav navbar-right">
          <li>
            <a href="#home" className="page-scroll">Home</a>
          </li>
          <li>
            <a href="#specialite" className="page-scroll">List of Specialites</a>
          </li>
            <li>
              <a href="#contact" className="page-scroll">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="page-scroll" onClick={handleComplaintsClick}>Complaints</a>
            </li>
            <li>
              <a href="#testimonials" className="page-scroll">
                Chatbot
              </a>
            </li>
            <li>
              <a href="#" className="page-scroll" onClick={Logout}>
                Logout
              </a>
            </li>
            <li className="nav-notifications">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowNotifications(!showNotifications);
                }}
                className="notification-bell"
              >
                <FaBell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </a>
              
              {showNotifications && (
                <div className="notifications-dropdown">
                  <h4>Notifications</h4>
                  {notifications.length === 0 ? (
                    <p className="no-notifications">No notifications</p>
                  ) : (
                    <ul className="notification-list">
                      {notifications.map(notification => (
                        <li 
                          key={notification._id} 
                          className={`notification-item ${notification.status === "unread" ? "unread" : ""}`}
                          onClick={() => markAsRead(notification._id)}
                        >
                          <div className="notification-content">
                            <p>{notification.message}</p>
                            <small>{new Date(notification.createdAt).toLocaleString()}</small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
            <li className="nav-user">
              <a href="#" onClick={handleUserClick}>
                <FaUserCircle size={20} style={{ marginRight: "5px" }} /> {userName}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
