import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Axios } from "../../api/api";
import { fixedButtonClass, fixedInputClass } from "../../Utils/constant";
import {
  XMarkIcon,
  ClipboardDocumentListIcon,
  XCircleIcon,
  MapIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  QueueListIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import Loader from "../Common/Loader";
import Modal from "../Common/Modal";
import { toast } from "react-hot-toast";

import PaymentImage from "../../assets/makePayment.png";
import { InfoBlock } from "./PrinterIoTs";
import { getStatusColor } from "../../Utils/helper";

const QueueItem = ({ item, index }) => {
  const estimatedTime = Math.ceil((item.pages * 30) / 60);

  return (
    <div
      className={`relative flex-shrink-0 w-40 border shadow-sm p-2 rounded-md ${
        item.status === "PRINTING" ? "pulse-bg" : ""
      }`}
    >
      {item.highPriority && (
        <div className="absolute top-2 right-2">
          <StarIcon className="w-4 h-4 text-green-700" />
        </div>
      )}
      <h3 className="font-semibold text-md"> #{index + 1} Document</h3>
      <div className="flex justify-between items-center mt-2">
        <p className="flex items-center text-sm gap-1">
          <DocumentDuplicateIcon className="w-4 h-4" />
          {item.pages}
        </p>
        <p className="flex items-center text-sm gap-1">
          <ClockIcon className="w-4 h-4" />
          {estimatedTime} min(s)
        </p>
      </div>
    </div>
  );
};

export default function PlaceOrder() {
  const { printerIoTId } = useParams();
  const [printerIoT, setPrinterIoT] = useState(null);

  const [numberOfPages, setNumberOfPages] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [scheduleOption, setScheduleOption] = useState("Now");
  const [isPriority, setIsPriority] = useState(false);
  const [numberOfCopies, setNumberOfCopies] = useState(1);
  const [selectedPrintType, setSelectedPrintType] = useState();
  const [printCost, setPrintCost] = useState(0);
  const [highPriorityCost, setHighPriorityCost] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  // const [scheduledTime, setScheduledTime] = useState("");
  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    async function fetchPrinterIoT() {
      const result = await Axios.get(`/printerIoT/${printerIoTId}`);
      console.log("printerIoT", result.data);
      setPrinterIoT(result.data.printerIoTs);
    }

    fetchPrinterIoT();
    const intervalId = setInterval(fetchPrinterIoT, 5000);

    return () => clearInterval(intervalId);
  }, [printerIoTId, refetch]);

  useEffect(() => {
    const newPrintCost = formatNumber(
      numberOfCopies *
        numberOfPages *
        (selectedPrintType === "color"
          ? printerIoT?.colorPrintPrice
          : printerIoT?.BWPrintPrice)
    );

    const newHighPriorityCost = formatNumber(
      isPriority ? newPrintCost * 0.05 : 0
    );

    const newServiceCharge = formatNumber(newPrintCost * 0.1);

    const newTotalCost = formatNumber(
      newPrintCost + newHighPriorityCost + newServiceCharge
    );

    setPrintCost(newPrintCost);
    setHighPriorityCost(newHighPriorityCost);
    setServiceCharge(newServiceCharge);
    setTotalCost(newTotalCost);
  }, [
    selectedPrintType,
    numberOfCopies,
    isPriority,
    numberOfPages,
    printerIoT?.colorPrintPrice,
    printerIoT?.BWPrintPrice,
  ]);

  const handleFileChange = async (e) => {
    setUploadedFileId(null);
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setFileUploadError(true);
      toast.error("File size should be less than 20MB");
      return;
    }

    if (file.type !== "application/pdf") {
      setFileUploadError(true);
      toast.error("Please select a pdf file");
      return;
    }

    setFileUploadError(false);
    setSelectedFile(file);

    var reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onloadend = async function () {
      var count = reader.result.match(/\/Type[\s]*\/Page[^s]/g).length;
      console.log("Number of Pages:", count);
      setNumberOfPages(count);

      const formData = new FormData();
      formData.append("file", file);

      try {
        toast("Uploading file... Please wait a moment!", {
          theme: "colored",
          icon: "⌛",
        });
        const response = await Axios.post("order/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("File upload response:", response.data);

        setUploadedFileId(response.data.fileId);

        toast.success("File uploaded successfully!", {
          theme: "colored",
        });
      } catch (error) {
        console.error("File upload error:", error);
        setFileUploadError(true);
        toast.error("File upload failed");
      }
    };
  };

  const formatNumber = (number) => {
    return +parseFloat(number).toFixed(2);
  };

  if (!printerIoT) {
    return <Loader />;
  }

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setFileUploadError(true);
      toast.error("Please select a file");
      return;
    }

    if (!selectedPrintType) {
      toast.error("Please select a print type");
      return;
    }

    setShowPaymentModal(true);
  };

  const handleOrderPayment = async (e) => {
    e.preventDefault();
    try {
      const transactionId = e.target.transactionId.value;

      const paymentResponse = await Axios.post("/payment", {
        transactionId,
        amount: totalCost,
      });

      const paymentDetails = paymentResponse.data;

      const data = {
        fileId: uploadedFileId,
        paymentId: paymentDetails._id, 
        printerId: printerIoT._id,
        printType: selectedPrintType,
        highPriority: isPriority,
        scheduledAt: scheduleOption,
        pages: numberOfPages,
        copies: numberOfCopies,
        totalCost: totalCost,
      };

      const orderResponse = await Axios.post("/order", JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setRefetch((p) => !p);

      const orderDetails = orderResponse.data;

      toast.success("Payment and Order placed successfully!", {
        theme: "colored",
      });

      setShowPaymentModal(false);
    } catch (error) {
      console.error("Error in Payment and Order placement:", error);
      toast.error("Payment and Order placement failed. Please try again.", {
        theme: "colored",
      });
    }
  };

  const handleRefresh = async (e) => {
    e.preventDefault();
    setRefetch((p) => !p);
  };

  return (
    <>
      <div className="lg:my-4 mb-10 px-5 lg:mr-12">
        <h2 className="sm:text-3xl text-xl font-semibold">Place Order!</h2>
        <div className="divider"></div>
        {/* <div className="flex justify-between items-center mb-6 gap-12">
        <div className="">
          <h3 className="text-xl font-semibold mr-4 basis-1/3">
            Complete the order form below:
          </h3>
        </div>
      </div> */}
        <div>
          <form
            onSubmit={handlePlaceOrder}
            className="grid grid-cols-2 gap-x-12 mb-6 pt-4"
          >
            <div>
              <div className="mb-5">
                <label className="mb-3 block text-lg font-semibold text-[#07074D]">
                  Printer Details
                </label>
                <div className="border shadow-sm px-6 py-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-lg">
                      {printerIoT?.name}
                    </h2>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div
                        className="font-semibold flex items-center gap-2"
                        style={{ color: getStatusColor(printerIoT.status) }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: getStatusColor(printerIoT.status),
                          }}
                        ></span>{" "}
                        <span>{printerIoT.status}</span>
                      </div>
                      {printerIoT.status === "ONLINE" ? (
                        <span
                          className="flex items-center text-orange-500"
                          title="Order In Queue"
                        >
                          <QueueListIcon className="w-5 h-5 mr-2 -rotate-90" />{" "}
                          {printerIoT.orderQueue?.length || 0}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  <h2 className="text-sm text-gray-500">
                    {printerIoT?.location}
                  </h2>
                  {printerIoT.googleMapLink ? (
                    <div className="mt-4">
                      <InfoBlock
                        icon={
                          <MapIcon className="w-6 h-6 min-w-[24px] min-h-[24px]" />
                        }
                        title={"Google Map Link"}
                        value={
                          <a
                            href={printerIoT.googleMapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-indigo-900 hover:text-indigo-900"
                          >
                            View on Google Maps
                          </a>
                        }
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              {printerIoT.orderQueue.length > 0 && (
                <div className="my-5">
                  <div className="flex justify-between items-center">
                    <div className="mb-3 ">
                      <div className="block text-lg font-semibold text-[#07074D]">
                        Estimated Time :{" "}
                        {Math.ceil(
                          printerIoT.orderQueue.reduce(
                            (total, order) => total + order.pages * 30,
                            0
                          ) / 60
                        )}{" "}
                        min
                      </div>
                      <div>
                        <h2 className="text-sm text-gray-500">
                          Note that the estimated time is approximate. Actual
                          time may vary.
                        </h2>
                      </div>
                    </div>
                    <button onClick={handleRefresh}>
                      <ArrowPathIcon className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto border shadow-sm p-4 rounded-md">
                    {printerIoT.orderQueue.map((item, i) => (
                      <QueueItem key={item._id} item={item} index={i} />
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="mb-3 block text-lg font-semibold text-[#07074D]">
                  Upload File
                </label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className={`flex flex-col items-center justify-center w-full ${
                      selectedFile ? "h-16" : "h-24"
                    } border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50   hover:bg-gray-100`}
                  >
                    <div className="flex items-center justify-center gap-4">
                      <svg
                        aria-hidden="true"
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        ></path>
                      </svg>
                      <p className="text-sm text-gray-500 ">
                        <span className="font-semibold">
                          Click to upload or drag and drop
                        </span>
                        <p className="text-xs text-gray-500 ">PDF only</p>
                      </p>
                    </div>
                    <input
                      type="file"
                      id="dropzone-file"
                      name="shopImage"
                      className="hidden"
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                    {fileUploadError && (
                      <div className="text-red-500">
                        Please select any pdf file
                      </div>
                    )}
                  </label>
                </div>
                {selectedFile && (
                  <div className="my-5 rounded-md bg-[#F5F7FB] py-4 px-8">
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-3 text-base font-medium text-[#07074D]">
                        {selectedFile.name} -{" "}
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB -{" "}
                        {numberOfPages} pages
                      </span>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-[#07074D]"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
                {uploadedFileId && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircleIcon className="h-6 w-6" aria-hidden="true" />
                    <span>Uploaded successfully</span>
                  </div>
                )}
              </div>
            </div>
            <div className="">
              <label className="mb-3 block text-lg font-semibold text-[#07074D]">
                Choose print
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2  gap-5 mt-2">
                <label>
                  <input
                    type="radio"
                    value="color"
                    className="peer hidden disabled:cursor-not-allowed disabled:bg-gray-400"
                    name="framework"
                    disabled={!printerIoT.colorPrintPrice}
                    onClick={() => setSelectedPrintType("color")}
                  />

                  <div className="hover:bg-gray-50 flex items-center justify-between px-4 py-2 border-2 rounded-lg cursor-pointer border-gray-200 group peer-checked:border-emerald-500 peer-checked:bg-emerald-500 text-gray-700 peer-checked:text-white">
                    <h2 className="font-medium">
                      Color - {printerIoT.colorPrintPrice} BDT/Page
                    </h2>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-9 h-9 invisible group-[.peer:checked+&]:visible"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </label>

                <label>
                  <input
                    type="radio"
                    value="blacknwhite"
                    className="peer hidden disabled:pointer-events-none disabled:bg-gray-400"
                    name="framework"
                    disabled={!printerIoT.BWPrintPrice}
                    onClick={() => setSelectedPrintType("blacknwhite")}
                  />

                  <div className="hover:bg-gray-50 flex items-center justify-between px-4 py-2 border-2 rounded-lg cursor-pointer border-gray-200 group peer-checked:border-emerald-500 peer-checked:bg-emerald-500 text-gray-700 peer-checked:text-white">
                    <h2 className="font-medium ">
                      B & W - {printerIoT.BWPrintPrice} BDT/Page
                    </h2>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-9 h-9 invisible group-[.peer:checked+&]:visible"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </label>
              </div>
              <div className="mt-5">
                <label className="mb-3 block text-lg font-semibold text-[#07074D]">
                  Schedule Print
                </label>
                <div className="flex gap-3">
                  <select
                    value={scheduleOption}
                    onChange={(e) => setScheduleOption(e.target.value)}
                    className={`${fixedInputClass} max-w-[150px] flex`}
                  >
                    <option value="Now">Now</option>
                    <option value="Later">Later</option>
                  </select>
                  {/* {scheduleOption === "Later" && (
                    <input
                      type="datetime-local"
                      name="scheduledTime"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className={`${fixedInputClass}`}
                    />
                  )} */}
                </div>
              </div>
              <div className="flex gap-5">
                <div className="mt-5 w-full">
                  <label className="mb-3 block text-lg font-semibold text-[#07074D]">
                    Number of Copies
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Number of copies"
                    className={`${fixedInputClass}`}
                    value={numberOfCopies}
                    onChange={(e) => setNumberOfCopies(+e.target.value)}
                  />
                </div>
                <div className="mt-5 w-full">
                  <label className="mb-3 block text-lg font-semibold text-[#07074D]">
                    Make the order priority?
                  </label>
                  <select
                    onChange={(e) => setIsPriority(e.target.value === "Yes")}
                    className={`${fixedInputClass}`}
                    defaultValue="No"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div className="divider"></div>
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-medium">Print cost</h2>
                  <h2 className="">
                    {numberOfPages} Pages * {numberOfCopies} Copies *{" "}
                    {selectedPrintType === "color"
                      ? printerIoT?.colorPrintPrice
                      : printerIoT?.BWPrintPrice}{" "}
                    = {printCost} BDT
                  </h2>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <h2 className="font-medium">High priority charge</h2>
                  <h2 className="">{highPriorityCost} BDT</h2>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <h2 className="font-medium">Service charge</h2>
                  <h2 className="">{serviceCharge} BDT</h2>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <h2 className="mt-3 block text-lg font-semibold text-[#07074D]">
                    Total bill
                  </h2>
                  <h2 className="text-lg font-semibold text-[#07074D]">
                    {totalCost} BDT
                  </h2>
                </div>
              </div>
              <div className="mt-8 col-span-full flex justify-end">
                <button type="submit" className={`${fixedButtonClass} sm:w-44`}>
                  Make Payment
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {showPaymentModal && (
        <Modal variant="small">
          <button
            type="button"
            onClick={() => {
              setShowPaymentModal(false);
            }}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <XCircleIcon className="w-8 h-8 hover:text-red-600" />
          </button>
          <h3 className="font-bold text-lg inline-block mb-5">
            Make payment & Confirm order
          </h3>
          <form className="space-y-6" onSubmit={handleOrderPayment}>
            <div>
              <img className="block" src={PaymentImage} alt="" />
            </div>
            <div className="border flex items-center justify-between px-4 p-3 rounded-lg bg-[#DF146E] text-white text-xl font-mono font-bold">
              <span>Bkash: 01790732717</span>
              <ClipboardDocumentListIcon
                onClick={() =>
                  navigator.clipboard.writeText("01790732717").then(() => {
                    toast("Bkash Number copied!!!", {
                      type: "info",
                      theme: "colored",
                    });
                  })
                }
                className="h-6 w-6 cursor-pointer"
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium leading-6 text-gray-600">
                Bkash Transaction ID
              </label>
              <input
                type="text"
                name="transactionId"
                placeholder="Enter the payment transaction ID"
                className={`${fixedInputClass} disabled:bg-gray-200 mt-2`}
                required
              />
            </div>

            <button type="submit" className={`${fixedButtonClass} sm:w-44}`}>
              Place Order
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
