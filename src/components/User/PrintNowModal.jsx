/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useRef, useState } from "react";
import { Axios } from "../../api/api";
import { toast } from "react-hot-toast";
import Modal from "../Common/Modal";
import {
  DEPARTMENTS,
  fixedButtonClass,
  fixedInputClass,
} from "../../Utils/constant";
import { ArrowPathIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { QueueItem } from "./PlaceOrder";

export const PrintNowModal = ({
  showModal,
  setShowModal,
  order,
  refetchHandler,
}) => {
  const [printerIoT, setPrinterIoT] = useState(null);

  useEffect(() => {
    async function fetchPrinterIoT() {
      const result = await Axios.get(`/printerIoT/${order?.printerId}`);
      console.log("printerIoT", result.data);
      setPrinterIoT(result.data.printerIoTs);
    }

    fetchPrinterIoT();
    const intervalId = setInterval(fetchPrinterIoT, 5000);

    console.log("order", order);

    return () => clearInterval(intervalId);
  }, [order]);

  const handleOrder = async () => {
    const orderResponse = await Axios.post(
      "/order/now",
      JSON.stringify(order),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("orderResponse", orderResponse);
  };

  return (
    <Modal
      setShowModal={setShowModal}
      className={`${showModal ? "" : "hidden"}`}
    >
      <button
        type="button"
        onClick={() => {
          setShowModal(false);
        }}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        <XCircleIcon className="w-8 h-8 hover:text-red-600" />
      </button>
      <h3 className="font-bold text-lg inline-block">Print Order Now</h3>
      <div className="divide-2" />
      {printerIoT?.orderQueue?.length > 0 ? (
        <div className="my-5">
          <div className="flex justify-between flex-wrap items-center">
            <div className="mb-3 ">
              <div className="block text-lg font-semibold text-[#07074D]">
                Estimated Time :{" "}
                {Math.ceil(
                  (printerIoT.orderQueue.reduce(
                    (total, order) => total + order.pages * 8,
                    0
                  ) +
                    8) /
                    60
                )}{" "}
                min
              </div>
              <div>
                <h2 className="text-sm text-gray-500">
                  Note that the estimated time is approximate. Actual time may
                  vary.
                </h2>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 overflow-x-auto border shadow-sm p-4 rounded-md">
            {[
              ...printerIoT.orderQueue.filter(
                (item) => item.status === "PRINTING"
              ),
              ...printerIoT.orderQueue
                .filter((item) => item.status === "IN_QUEUE")
                .sort((a, b) => b.highPriority - a.highPriority),
            ].map((item, i) => (
              <QueueItem key={item._id} item={item} index={i} />
            ))}
          </div>
        </div>
      ) : (
        <div className="my-5">
          <div className="block text-[#07074D]">No orders in queue.</div>
        </div>
      )}
      <button
        onClick={handleOrder}
        className={`mt-5 ${fixedButtonClass} sm:w-44}`}
      >
        Print now
      </button>
    </Modal>
  );
};
