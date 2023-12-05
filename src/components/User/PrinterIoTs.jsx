import {
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  MapPinIcon,
  CurrencyBangladeshiIcon,
  MapIcon,
  PrinterIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { fixedButtonClass, fixedInputClass } from "../../Utils/constant";
import { Axios } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { truncateAndAddEllipsis } from "../../Utils/helper";

export default function PrinterIoTs() {
  const [printerIoTs, setPrinterIoTs] = useState([]);
  const [statusEnum, setStatusEnum] = useState([]);
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [printerIoT, setPrinterIoT] = useState(null);
  const [refetch, setRefetch] = useState(false);
  const [showAddPrintIoTModal, setShowAddPrintIoTModal] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrinterIoT();

    async function fetchPrinterIoT() {
      const result = await Axios.get("/printerIoT/all");
      console.log("printers", result.data);
      const modifiedPrinterIoTs = result.data.printerIoTs.map((printerIoT) => {
        return {
          ...printerIoT,
          bgColor: `bg-${getStatusColor(printerIoT.status)}`, // Updated this line
          textColor: `text-${getStatusColor(printerIoT.status)}`, // Updated this line
        };
      });
      setPrinterIoTs(modifiedPrinterIoTs);
      setStatusEnum(result.data.statusEnum);
    }
  }, [refetch]);

  const refetchHandler = () => {
    setRefetch((prev) => !prev);
  };

  const handleAddAccount = () => {
    setShowAddPrintIoTModal(true);
  };

  const handleEditPrinter = (printerIoT) => {
    setPrinterIoT(printerIoT);
    setShowModal(true);
  };

  const handleDeletePrinter = async (printer) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `<div>
        You want to delete the printer:
        <p style="color:#f27474;">
          <br /> 
          Name: ${printer.name} 
          <br /> 
          Location: ${printer.location}
          <br /> 
          Status: ${printer.status}
        </p>
      </div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete!",
    });

    if (result.isConfirmed) {
      try {
        const response = await Axios.delete(`/printerIoT/${printer._id}`);

        if (response.status === 200) {
          toast.success(response.data.message);
          refetchHandler();
        } else {
          console.error("Failed to delete printer:", response.data.error);
          toast.error(response.data.error);
        }
      } catch (error) {
        console.error("Error deleting printer:", error);
        toast.error("Failed to delete printer. Please try again.");
      }
    }
  };

  const getStatusColor = (status) => {
    console.log("Status:", status);
    switch (status) {
      case "ONLINE":
        return "green-500";

      case "OFFLINE":
        return "red-500";
      case "ACTIVE":
        return "blue-500";
      case "INACTIVE":
        return "gray-500";
      case "PAPER_JAM":
        return "orange-500";
      case "NO_PAPER":
        return "yellow-500";
      case "NO_TONER":
        return "purple-500";
      default:
        return "gray-500";
    }
  };

  const handlePrinterFilter = (printerIoT) => {
    return (
      (!status || printerIoT.status === status) &&
      (printerIoT.name.toLowerCase().includes(search.toLowerCase()) ||
        printerIoT.location.toLowerCase().includes(search.toLowerCase()) ||
        printerIoT._id.toLowerCase().includes(search.toLowerCase()))
    );
  };

  return (
    <div className="lg:my-4 mb-10 px-5 lg:mr-12">
      <h2 className="sm:text-3xl text-xl font-semibold">
        Choose printer near you!
      </h2>
      <div className="divider"></div>
      <div className="flex justify-between items-center mb-6 gap-12">
        <div className="">
          <h3 className="text-xl font-semibold mr-4 basis-1/3">
            Total Printers: {printerIoTs.length}
          </h3>
        </div>
        <div className="flex gap-2 items-center">
          {/* Toggle button for detailed view */}
          <div className="min-w-[180px]">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showAdditionalInfo}
                onChange={() => setShowAdditionalInfo((prev) => !prev)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300  rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900">
                {showAdditionalInfo ? "Collapse Details" : "Expand Details"}
              </span>
            </label>
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`${fixedInputClass} h-auto max-w-[150px]`}
          >
            <option selected value="">
              Status
            </option>
            {statusEnum.map((status, i) => (
              <option key={i} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Printer Id, Name, Location"
            className={`${fixedInputClass} h-auto min-w-[300px]`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {printerIoTs.filter(handlePrinterFilter).map((printerIoT) => (
          <div
            onClick={() => navigate(`/dashboard/place-order/${printerIoT._id}`)}
            key={printerIoT._id}
            className="bg-white rounded-xl shadow-sm border hover:shadow-xl transition-all cursor-pointer mb-4 relative group px-8 py-6 flex flex-col"
          >
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold flex items-center gap-4">
              <div className="indicator">
                <span
                  style={{ color: `!${printerIoT.bgColor.split("-")[1]}` }}
                  title={printerIoT.status}
                  className={`indicator-item indicator-bottom badge-warning right-2 bottom-2 badge-xs rounded-full`}
                ></span>
                <div className="grid w-12 h-12 bg-emerald-50 rounded-full place-items-center">
                  <PrinterIcon className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <h1
                className="font-semibold text-gray-900"
                title={printerIoT.location}
              >
                {truncateAndAddEllipsis(
                  showAdditionalInfo ? printerIoT.name : printerIoT.location
                )}
              </h1>
            </div>
            <div className="divider my-3 opacity-40"></div>
            <div className={`${showAdditionalInfo ? "" : "hidden"}`}>
              <InfoBlock
                icon={
                  <MapPinIcon className="w-6 h-6 min-w-[24px] min-h-[24px]" />
                }
                title={"Location"}
                value={printerIoT.location}
              />
              {printerIoT.googleMapLink ? (
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
              ) : (
                ""
              )}
              {printerIoT.ip ? (
                <InfoBlock
                  icon={
                    <GlobeAltIcon className="w-6 h-6 min-w-[24px] min-h-[24px]" />
                  }
                  title={"IP Address"}
                  value={
                    <a
                      target="_blank"
                      href={`http://${printerIoT.ip}`}
                      rel="noreferrer"
                      className="underline"
                    >
                      {printerIoT.ip}
                    </a>
                  }
                />
              ) : (
                ""
              )}
            </div>
            <div className="flex justify-between text-emerald-600 font-bold mt-auto pt-2">
              <InfoBlock
                icon={
                  <CurrencyBangladeshiIcon className="w-6 h-6 min-w-[24px] min-h-[24px]" />
                }
                title={"Color Print Price"}
                value={`Color: ${printerIoT.colorPrintPrice} BDT`}
              />
              <InfoBlock
                icon={
                  <CurrencyBangladeshiIcon className="w-6 h-6 min-w-[24px] min-h-[24px]" />
                }
                title={"Black & White Print Price"}
                value={`B&W: ${printerIoT.BWPrintPrice} BDT`}
              />
            </div>

            {/* <div className="flex items-baseline gap-2 mt-auto">
              <div
                className={`${printerIoT.bgColor} block rounded-full min-w-[24px] min-h-[24px]`}
                title={printerIoT.status}
              ></div>
              <p className={printerIoT.textColor}>{`${printerIoT.status}`}</p>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export function InfoBlock({ icon, title, value }) {
  return (
    <div className="flex flex-col justify-center mb-3" title={title}>
      <div className="flex gap-2 opacity-70">
        {icon}
        <h3 className="">{value}</h3>
      </div>
      {/* <p className="text-gray-500 text-sm">{value}</p> */}
    </div>
  );
}
