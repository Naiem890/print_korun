import React, { useState, useEffect } from "react";
import { Axios } from "../../api/api";
import {
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { truncateAndAddEllipsis } from "../../Utils/helper";
import { toast } from "react-hot-toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await Axios.get("/order");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const downloadFile = async (orderId) => {
    try {
      toast("Downloading file...", { type: "info" });
      // Make a GET request to the backend API endpoint that serves the file
      const response = await Axios({
        url: `/order/${orderId}/download`,
        method: "GET",
        responseType: "blob", // Specify the response type as blob
      });

      // Check if the request was successful (status code 200)
      if (response.status === 200) {
        const filename = `order_${orderId}.pdf`;

        // Extract the content type from the response headers
        const contentType = response.headers["content-type"];

        // Create a Blob from the response body with the specified content type
        const fileBlob = new Blob([response.data], { type: contentType });

        // Create an anchor element to trigger the download
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(fileBlob);
        link.download = filename;

        // Append the anchor element to the document and trigger the download
        document.body.appendChild(link);
        link.click();

        // Remove the anchor element from the document
        document.body.removeChild(link);
      } else {
        // If the request was not successful, log an error message
        console.error("File download failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div className="lg:my-4 mb-10 px-5 lg:mr-12">
      <h2 className="sm:text-3xl text-xl font-semibold">Orders</h2>
      <div className="divider"></div>

      <div className="">
        {orders.length === 0 ? (
          <p className="text-sm font-semibold">No orders available</p>
        ) : (
          orders.map((order, i) => (
            <div
              key={order._id}
              className="border py-4 px-4 rounded-lg mb-4 flex gap-4 justify-between items-start hover:shadow-md transition-all cursor-pointer font-mono"
            >
              <div>
                <h3 className="mb-1 text-xs text-gray-600">SL</h3>
                <div className="text-sm font-semibold">#{i + 1}</div>
              </div>
              <div>
                <h3 className="mb-1 text-xs text-gray-600">Printer Type</h3>
                <div
                  className="text-sm font-semibold"
                  // title={order.printer[0].printType}
                >
                  {order.printType}
                </div>
              </div>
              <div>
                <h3 className="mb-1 text-xs text-gray-600">Order Priority</h3>
                <div className="text-sm font-semibold">
                  {order.highPriority ? "High" : "Normal"}
                </div>
              </div>
              <div>
                <h3 className="mb-1 text-xs text-gray-600">Order Status</h3>
                <div className="text-sm font-semibold">{order.status}</div>
              </div>
              <div>
                <h3 className="mb-1 text-xs text-gray-600">Order Date</h3>
                <div className="text-sm font-semibold flex flex-col">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <h3 className="mb-1 text-xs text-gray-600">Transaction Id</h3>
                <div className="text-sm font-semibold">
                  {order.payment[0].transactionId}
                </div>
              </div>
              <div>
                <h3 className="mb-1 text-xs text-gray-600">Payment Status</h3>
                <div className="text-sm font-semibold">
                  {order.payment[0].status}
                </div>
              </div>
              <div>
                <h3 className="mb-1 text-xs text-gray-600">Payment Amount</h3>
                <div className="text-sm font-semibold">
                  {order.payment[0].amount}
                </div>
              </div>
              <div className="flex gap-4 self-center">
                <div>
                  <a
                    className="flex items-center gap-2 text-green-600"
                    onClick={() => downloadFile(order._id)}
                  >
                    <ArrowDownTrayIcon className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
