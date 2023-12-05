import {
  ArrowPathIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  GlobeAltIcon,
  MapPinIcon,
  CurrencyBangladeshiIcon,
  MapIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { fixedButtonClass, fixedInputClass } from "../../Utils/constant";
import { Axios } from "../../api/api";
import { EditPrinterModal } from "./EditPrinterModal";
import { AddPrinterModal } from "./AddPrinterModal";

export const AdminPrinterIoTs = () => {
  const [printerIoTs, setPrinterIoTs] = useState([]);
  const [statusEnum, setStatusEnum] = useState([]);
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [printerIoT, setPrinterIoT] = useState(null);
  const [refetch, setRefetch] = useState(false);
  const [showAddPrintIoTModal, setShowAddPrintIoTModal] = useState(false);

  useEffect(() => {
    fetchPrinterIoT();

    async function fetchPrinterIoT() {
      const result = await Axios.get("/printerIoT/all");
      console.log("printers", result.data);
      setPrinterIoTs(result.data.printerIoTs);
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
      <h2 className="sm:text-3xl text-xl font-semibold"> Printers</h2>
      <div className="divider"></div>
      <div className="flex justify-between items-center mb-6 gap-12">
        <div className="">
          <h3 className="text-xl font-semibold mr-4 basis-1/3">
            Total Printers: {printerIoTs.length}
          </h3>
        </div>
        <div className="flex gap-2 basis-1/2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`${fixedInputClass} h-auto basis-1/4`}
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
            className={`${fixedInputClass} h-auto basis-2/4`}
          />
          <button
            onClick={() => {
              handleAddAccount();
            }}
            className={`${fixedButtonClass} btn-sm h-auto basis-40 ml-2`}
          >
            <PlusIcon className="w-4 h-4" /> Add Printer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {printerIoTs.filter(handlePrinterFilter).map((printerIoT) => (
          <div
            key={printerIoT._id}
            className="bg-white rounded-xl shadow-sm border hover:shadow-xl transition-all cursor-pointer mb-4 relative group px-8 py-6 flex flex-col"
          >
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold flex justify-between items-baseline gap-4">
              <h1 className="text-lg leading-tight font-semibold text-gray-900">
                {printerIoT.name}
              </h1>
              <div className="flex gap-4 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PencilIcon
                  onClick={() => {
                    handleEditPrinter(printerIoT);
                  }}
                  className="w-6 h-6 text-blue-500 cursor-pointer"
                />
                <TrashIcon
                  onClick={() => {
                    handleDeletePrinter(printerIoT);
                  }}
                  className="w-6 h-6 text-red-500 cursor-pointer"
                />
              </div>
            </div>
            <div className="divider mt-3 opacity-40"></div>
            <div className="">
              <InfoBlock
                icon={
                  <PrinterIcon className="w-6 h-6 min-w-[24px] min-h-[24px]" />
                }
                title={"Printer Id"}
                value={
                  <p
                    onClick={() => {
                      navigator.clipboard.writeText(printerIoT._id);
                      toast.success("Printer ID Copied");
                    }}
                  >
                    {" "}
                    {printerIoT._id} #
                  </p>
                }
              />
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
              <div className="flex justify-between text-emerald-600 font-bold">
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
            </div>

            <div className="flex items-baseline pt-4 gap-2 mt-auto">
              <div
                className={`bg-${getStatusColor(
                  printerIoT.status
                )} rounded-full min-w-[12px] min-h-[12px]`}
                title={printerIoT.status}
              ></div>
              <p
                className={`text-${getStatusColor(printerIoT.status)}`}
              >{`${printerIoT.status}`}</p>
            </div>
          </div>
        ))}
      </div>

      <AddPrinterModal
        showAddPrintIoTModal={showAddPrintIoTModal}
        setShowAddPrintIoTModal={setShowAddPrintIoTModal}
        refetchHandler={refetchHandler}
      />
      <EditPrinterModal
        showModal={showModal}
        setShowModal={setShowModal}
        printerIoT={printerIoT}
        setPrinterIoT={setPrinterIoT}
        refetchHandler={refetchHandler}
      />
    </div>
  );
};

const InfoBlock = ({ icon, title, value }) => {
  return (
    <div className="flex flex-col justify-center mb-3" title={title}>
      <div className="flex gap-2 opacity-70">
        {icon}
        <h3 className="">{value}</h3>
      </div>
      {/* <p className="text-gray-500 text-sm">{value}</p> */}
    </div>
  );
};
