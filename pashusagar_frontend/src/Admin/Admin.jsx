import { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import { Menu, X, Pill, FileText, Users, CalendarDays, LayoutDashboard, FileCheck } from "lucide-react";
import AddMedicine from "../veterinarian/AddMedicine";
import MedicineList from "../veterinarian/MedicineList";
import UsersList from "./UsersList";
import Appointments from "../veterinarian/Appointments";
import axios from "axios";

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DefaultContent setActiveTab={setActiveTab} />;
      case "addMedicine":
        return <AddMedicine />;
      case "medicineList":
        return <MedicineList />;
      case "userList":
        return <UsersList />;
      case "appointments":
        return <Appointments />;
      default:
        return <DefaultContent setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-[#004d40] text-white"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <aside
          className={`bg-gradient-to-b from-[#004d40] to-[#00695c] text-white w-64 fixed lg:static h-[calc(100vh-64px)] overflow-y-auto transition-transform duration-300 ease-in-out z-40 
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <div className="sticky top-0 p-6">
            <h2 className="text-2xl font-semibold text-nowrap mb-6">Admin Dashboard</h2>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setIsSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 w-full ${
                    activeTab === "dashboard" ? "bg-[#55DD4A] text-white" : "hover:bg-[#55DD4A] hover:text-white"
                  }`}
                >
                  <LayoutDashboard size={20} className="mr-3" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("addMedicine");
                    setIsSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 w-full ${
                    activeTab === "addMedicine" ? "bg-[#55DD4A] text-white" : "hover:bg-[#55DD4A] hover:text-white"
                  }`}
                >
                  <Pill size={20} className="mr-3" />
                  <span>Add Medicine</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("medicineList");
                    setIsSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 w-full ${
                    activeTab === "medicineList" ? "bg-[#55DD4A] text-white" : "hover:bg-[#55DD4A] hover:text-white"
                  }`}
                >
                  <FileText size={20} className="mr-3" />
                  <span>Medicine List</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("appointments");
                    setIsSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 w-full ${
                    activeTab === "appointments" ? "bg-[#55DD4A] text-white" : "hover:bg-[#55DD4A] hover:text-white"
                  }`}
                >
                  <CalendarDays size={20} className="mr-3" />
                  <span>Appointments</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("userList");
                    setIsSidebarOpen(false);
                  }}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 w-full ${
                    activeTab === "userList" ? "bg-[#55DD4A] text-white" : "hover:bg-[#55DD4A] hover:text-white"
                  }`}
                >
                  <Users size={20} className="mr-3" />
                  <span>User List</span>
                </button>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 lg:p-8">
          <div className="bg-white rounded-lg shadow-md p-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

const DefaultContent = ({ setActiveTab }) => {
  const [dashboardStats, setDashboardStats] = useState({
    total_users: 0,
    total_products: 0,
    total_appointments: 0,
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0,
    completed_orders: 0,
    failed_orders: 0,
    refunded_orders: 0,
  });

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/dashboard-stats/")
      .then((response) => {
        setDashboardStats(response.data);
      })
      .catch((error) => {
        console.error("Error fetching dashboard stats:", error);
      });
  }, []);

  const generateReport = () => {
    axios
      .get("http://127.0.0.1:8000/api/generate-report/")
      .then((response) => {
        setDashboardStats(response.data);
      })
      .catch((error) => {
        console.error("Error generating report:", error);
      });
  };

  return (
    <div className="text-center py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-[#004d40] to-[#00695c] p-6 rounded-lg text-white">
          <h3 className="text-xl font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{dashboardStats.total_users}</p>
        </div>

        {/* Total Products */}
        <div className="bg-gradient-to-br from-[#004d40] to-[#00695c] p-6 rounded-lg text-white">
          <h3 className="text-xl font-semibold mb-2">Total Products</h3>
          <p className="text-3xl font-bold">{dashboardStats.total_products}</p>
        </div>

        {/* Total Appointments */}
        <div className="bg-gradient-to-br from-[#004d40] to-[#00695c] p-6 rounded-lg text-white">
          <h3 className="text-xl font-semibold mb-2">Total Appointments</h3>
          <p className="text-3xl font-bold">{dashboardStats.total_appointments}</p>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-[#004d40] to-[#00695c] p-6 rounded-lg text-white">
          <h3 className="text-xl font-semibold mb-2">Total Orders</h3>
          <p className="text-3xl font-bold">{dashboardStats.total_orders}</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-[#004d40] to-[#00695c] p-6 rounded-lg text-white">
          <h3 className="text-xl font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">₹{dashboardStats.total_revenue}</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-gradient-to-br from-[#FFAA00] to-[#CC8800] p-6 rounded-lg text-white">
          <h3 className="text-xl font-semibold mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold">{dashboardStats.pending_orders}</p>
        </div>

        {/* Completed Orders */}
        <div className="bg-gradient-to-br from-[#00AA55] to-[#008844] p-6 rounded-lg text-white">
          <h3 className="text-xl font-semibold mb-2">Completed Orders</h3>
          <p className="text-3xl font-bold">{dashboardStats.completed_orders}</p>
        </div>

        {/* Failed Orders */}
        <div className="bg-gradient-to-br from-[#FF4444] to-[#CC2222] p-6 rounded-lg text-white">
          <h3 className="text-xl font-semibold mb-2">Failed Orders</h3>
          <p className="text-3xl font-bold">{dashboardStats.failed_orders}</p>
        </div>

        {/* Refunds */}
        <div className="bg-gradient-to-br from-[#5566FF] to-[#3344DD] p-6 rounded-lg text-white">
          <h3 className="text-xl font-semibold mb-2">Refunded Orders</h3>
          <p className="text-3xl font-bold">{dashboardStats.refunded_orders}</p>
        </div>
      </div>

      <button
        onClick={generateReport}
        className="mt-6 px-6 py-3 bg-[#55DD4A] text-white font-semibold rounded-lg hover:bg-[#44BB3A] transition-colors"
      >
        <FileCheck className="inline-block mr-2" /> Generate Report
      </button>
    </div>
  );
};

export default Admin;
