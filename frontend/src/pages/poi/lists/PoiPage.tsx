import "./PoiPage.css";
import { FiStar } from "react-icons/fi";
import { FaMusic } from "react-icons/fa";
import { LuX, LuTrash2, LuMapPin, LuCalendar, LuStar } from "react-icons/lu";
import { useState, useEffect } from "react";
import { CometCard } from "../../../components/ui/comet-card";
import Header from "@/components/layout/Header";
//query import
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import getCurrentUser from "@/queryOption/users/getCurrentUserQueryOption";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  addToast,
} from "@heroui/react";

interface Poi {
  id: number;
  name: string;
  location?: {
    province?: string;
    latitude?: number;
    longitude?: number;
  };
  images?: { url: string }[];
  visitDate: string;
  time?: string;
  review?: string;
}

function PoiPage(): JSX.Element {
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // Get current user
  const { data: currentUserData } = useQuery(getCurrentUser());

  const { data } = useQuery({
    queryKey: ["pois", currentUserData?.id],
    queryFn: async () => {
      if (!currentUserData?.id) return [];
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/poi?createdById=${currentUserData.id}&orderBy=createdAt&order=desc`
      );
      return response.data;
    },
    enabled: !!currentUserData?.id,
  });

  // Check for poiId parameter and open modal automatically
  useEffect(() => {
    const poiId = searchParams.get("poiId");
    if (poiId && data) {
      const poi = data.find((p: Poi) => p.id === parseInt(poiId));
      if (poi) {
        setSelectedPoi(poi);
      }
    }
  }, [searchParams, data]);

  const deletePoi = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${import.meta.env.VITE_API_URL}/poi/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pois"] });
      setSelectedPoi(null);
      addToast({
        title: "POI Deleted",
        description: "POI has been deleted successfully",
        color: "success",
      });
    },
    onError: (error) => {
      addToast({
        title: "Delete Failed",
        description: "Failed to delete POI. Please try again.",
        color: "danger",
      });
      console.error("Delete error:", error);
    },
  });
  console.log(data);
  return (
    <>
      <Header />
      <div className="poi-container">
        {/* Header */}
        <div className="poi-header"></div>

        {/* Section - Recent Highlight */}
        <div className="poi-section">
          <div className="section-header">
            <FaMusic className="section-icon highlight-icon" />
            <span>Recent Highlight</span>
          </div>

          {data && data.length > 0 && (
            <div className="flex justify-center">
              <CometCard className="w-95" rotateDepth={6} translateDepth={2}>
                <button
                  type="button"
                  className="my-4 flex w-95 cursor-pointer flex-col items-stretch rounded-[16px] border-0 p-2 md:my-8 md:p-4"
                  aria-label="Highlight Card"
                  onClick={() => setSelectedPoi(data?.[0] || null)}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "none",
                    opacity: 1,
                  }}
                >
                  <div className="mx-2 flex-1">
                    <div className="relative mt-2 aspect-[4/3] w-full">
                      {/* Blurred background image */}
                      <img
                        loading="lazy"
                        className="absolute inset-0 h-full w-full rounded-[16px] object-cover filter blur-sm scale-110"
                        alt="Invite background"
                        src={`${import.meta.env.VITE_API_URL}${data?.[0]?.images?.[0]?.url || ""}`}
                        style={{
                          opacity: 0.3,
                        }}
                      />
                      {/* Main image overlay */}
                      <img
                        loading="lazy"
                        className="absolute inset-0 h-full w-full rounded-[16px] bg-[#000000] object-cover contrast-75"
                        alt="Invite background"
                        src={`${import.meta.env.VITE_API_URL}${data?.[0]?.images?.[0]?.url || ""}`}
                        style={{
                          boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px",
                          opacity: 1,
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-shrink-0 items-center align-middle justify-between p-4 font-mono text-white relative z-10">
                    <div className="text-xs drop-shadow-lg">
                      {data?.[0]?.name || "น้ำตกชันตาเถร"}
                    </div>
                    <div>
                      <div className="text-xs text-gray-300 opacity-50 drop-shadow-lg">
                        {data?.[0]
                          ? new Date(data[0].visitDate).toLocaleDateString(
                              "en-GB"
                            ) +
                            " @ " +
                            (data[0].time
                              ? new Date(data[0].time).toLocaleTimeString(
                                  "en-GB",
                                  { hour: "2-digit", minute: "2-digit" }
                                )
                              : "14:30")
                          : "30/12/2025 @ 14:30"}
                      </div>
                    </div>
                  </div>
                </button>
              </CometCard>
            </div>
          )}
        </div>

        {/* Section - All Journey */}
        <div className="poi-section">
          <div className="section-header">
            <FiStar className="section-icon journey-icon" />
            <span>All Journey</span>
          </div>

          {!data || data.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium">It's empty</p>
                <p className="text-sm">No POIs available yet</p>
              </div>
            </div>
          ) : (
            data?.map((poi: any) => (
              <div className="flex justify-center mb-4" key={poi.id}>
                <CometCard className="w-95" rotateDepth={6} translateDepth={2}>
                  <button
                    type="button"
                    className="my-4 flex w-95 cursor-pointer flex-col items-stretch rounded-[16px] border-0 p-2 md:my-8 md:p-4"
                    aria-label={`${poi.name} Card`}
                    onClick={() => setSelectedPoi(poi)}
                    style={{
                      transformStyle: "preserve-3d",
                      transform: "none",
                      opacity: 1,
                    }}
                  >
                    <div className="mx-2 flex-1">
                      <div className="relative mt-2 aspect-[4/3] w-full">
                        {/* Blurred background image */}
                        <img
                          loading="lazy"
                          className="absolute inset-0 h-full w-full rounded-[16px] object-cover filter blur-sm scale-110"
                          alt={poi.name}
                          src={`${import.meta.env.VITE_API_URL}${poi.images[0]?.url || "https://picsum.photos/400/200?random=1"}`}
                          style={{
                            opacity: 0.3,
                          }}
                        />
                        {/* Main image overlay */}
                        <img
                          loading="lazy"
                          className="absolute inset-0 h-full w-full rounded-[16px] bg-[#000000] object-cover contrast-75"
                          alt={poi.name}
                          src={`${import.meta.env.VITE_API_URL}${poi.images[0]?.url || "https://picsum.photos/400/200?random=1"}`}
                          style={{
                            boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px",
                            opacity: 1,
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex flex-shrink-0 items-center align-middle justify-between p-4 font-mono text-white relative z-10">
                      <div className="text-xs drop-shadow-lg">{poi.name}</div>
                      <div>
                        <div className="text-xs text-gray-300 opacity-50 drop-shadow-lg">
                          {new Date(poi.visitDate).toLocaleDateString("en-GB")}{" "}
                          @{" "}
                          {poi.time
                            ? new Date(poi.time).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "14:30"}
                        </div>
                      </div>
                    </div>
                  </button>
                </CometCard>
              </div>
            ))
          )}
        </div>

        <Modal
          isOpen={!!selectedPoi}
          onOpenChange={(isOpen) => !isOpen && setSelectedPoi(null)}
          placement="center"
          backdrop="blur"
          hideCloseButton={true}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex justify-between items-center pb-2">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    POI Details
                  </span>
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      color="danger"
                      variant="bordered"
                      onPress={() =>
                        selectedPoi && deletePoi.mutate(selectedPoi.id)
                      }
                    >
                      <LuTrash2 />
                    </Button>
                    <Button isIconOnly variant="flat" onPress={onClose}>
                      <LuX />
                    </Button>
                  </div>
                </ModalHeader>
                <ModalBody className="p-6">
                  <div className="flex flex-col items-center space-y-6">
                    {/* Image Section */}
                    <div className="relative w-full max-w-md">
                      <img
                        loading="lazy"
                        className="w-full h-64 object-cover rounded-2xl shadow-lg"
                        alt={selectedPoi?.name || "POI Image"}
                        src={`${import.meta.env.VITE_API_URL}${selectedPoi?.images?.[0]?.url || "https://cms.dmpcdn.com/travel/2021/05/11/13751240-b21c-11eb-bdb4-5dd69eff079b_original.jpg"}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-lg font-semibold">
                          {selectedPoi?.name}
                        </h3>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="w-full max-w-md space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                          <LuMapPin className="w-4 h-4" />
                          Location
                        </h4>
                        <p className="text-base text-gray-900 dark:text-gray-100">
                          {selectedPoi?.location?.province || "Unknown"},
                          Thailand
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Lat:{" "}
                          {selectedPoi?.location?.latitude?.toFixed(4) || "N/A"}
                          , Lng:{" "}
                          {selectedPoi?.location?.longitude?.toFixed(4) ||
                            "N/A"}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                          <LuCalendar className="w-4 h-4" />
                          Visit Details
                        </h4>
                        <p className="text-base text-gray-900 dark:text-gray-100">
                          {new Date(
                            selectedPoi?.visitDate || ""
                          ).toLocaleDateString("en-GB")}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Time:{" "}
                          {selectedPoi?.time
                            ? new Date(selectedPoi.time).toLocaleTimeString(
                                "en-GB",
                                { hour: "2-digit", minute: "2-digit" }
                              )
                            : "Not specified"}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                          <LuStar className="w-4 h-4" />
                          Review
                        </h4>
                        <p className="text-base text-gray-900 dark:text-gray-100">
                          {selectedPoi?.review || "No review available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}

export default PoiPage;
