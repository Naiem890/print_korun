import React, { useState, useEffect } from "react";
import { Axios } from "../../api/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch all orders when the component mounts
    const fetchOrders = async () => {
      try {
        const response = await Axios.get("/order");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []); // The empty dependency array ensures that this effect runs once when the component mounts

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-semibold mb-4">All Orders</h2>
      {orders.length === 0 ? (
        <p>No orders available</p>
      ) : (
        <table className="min-w-full bg-white border table table-lg border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4">Order ID</th>
              <th className="py-2 px-4">User ID</th>
              <th className="py-2 px-4">Printer ID</th>
              {/* Add more headers based on your Order model */}
              <th className="py-2 px-4">Print Type</th>
              <th className="py-2 px-4">Status</th>
              {/* Add more headers based on your Order model */}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="py-2 px-4">{order._id}</td>
                <td className="py-2 px-4">{order.userId}</td>
                <td className="py-2 px-4">{order.printerId}</td>
                {/* Add more cells based on your Order model */}
                <td className="py-2 px-4">{order.printType}</td>
                <td className="py-2 px-4">{order.status}</td>
                {/* Add more cells based on your Order model */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
