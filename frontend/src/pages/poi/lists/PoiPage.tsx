import "./PoiPage.css";
import { FiChevronLeft, FiPlus, FiStar } from "react-icons/fi";
import { FaMusic } from "react-icons/fa";
import { useState } from "react";
import { CometCard } from "../../../components/ui/comet-card";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
function PoiPage(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="poi-container">
      {/* Header */}
      <div className="poi-header">
        <button className="icon-btn">
          <FiChevronLeft size={20} />
        </button>
        <h2 className="poi-title">My Memories</h2>
        <div className="header-right">
          <button className="icon-btn add-btn">
            <FiPlus size={18} />
          </button>
          <img
            src="https://randomuser.me/api/portraits/women/65.jpg"
            alt="profile"
            className="profile-pic"
          />
        </div>
      </div>

      {/* Section - Recent Highlight */}
      <div className="poi-section">
        <div className="section-header">
          <FaMusic className="section-icon highlight-icon" />
          <span>Recent Highlight</span>
        </div>

        <div className="flex justify-center">
          <CometCard className="w-95" rotateDepth={6} translateDepth={2}>
            <button
              type="button"
              className="my-10 flex w-95 cursor-pointer flex-col items-stretch rounded-[16px] border-0 p-2 md:my-20 md:p-4"
              aria-label="Highlight Card"
              onClick={() => setIsOpen(true)}
              style={{
                transformStyle: "preserve-3d",
                transform: "none",
                opacity: 1,
              }}
            >
              <div className="mx-2 flex-1">
                <div className="relative mt-2 aspect-[4/3] w-full">
                  <img
                    loading="lazy"
                    className="absolute inset-0 h-full w-full rounded-[16px] bg-[#000000] object-cover contrast-75"
                    alt="Invite background"
                    src="https://cms.dmpcdn.com/travel/2021/05/11/13751240-b21c-11eb-bdb4-5dd69eff079b_original.jpg"
                    style={{
                      boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px",
                      opacity: 1,
                    }}
                  />
                </div>
              </div>
              <div className="mt-2 flex flex-shrink-0 items-center align-middle justify-between p-4 font-mono text-white">
                <div className="text-xs">น้ำตกชันตาเถร</div>
                <div>
                  <div className="text-xs text-gray-300 opacity-50">
                    30/12/2025 @ 14:30
                  </div>
                </div>
              </div>
            </button>
          </CometCard>
        </div>
      </div>

      {/* Section - All Journey */}
      <div className="poi-section">
        <div className="section-header">
          <FiStar className="section-icon journey-icon" />
          <span>All Journey</span>
        </div>

        <div className="poi-card">
          <img
            src="https://picsum.photos/400/200?random=2"
            alt="beach"
            className="poi-image"
          />
          <div className="poi-info">
            <div className="poi-name">ชายหาดบางแสน</div>
            <div className="poi-date">23 ตุลาคม 2568</div>
          </div>
        </div>

        <div className="poi-card">
          <img
            src="https://picsum.photos/400/200?random=3"
            alt="mountain"
            className="poi-image"
          />
          <div className="poi-info">
            <div className="poi-name">อ่างเก็บน้ำบางพระ</div>
            <div className="poi-date">22 ตุลาคม 2568</div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={(isOpen) => !isOpen && setIsOpen(false)}
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                น้ำตกชันตาเถร
              </ModalHeader>
              <ModalBody>
                <div className="flex justify-center mb-4">
                  <img
                    loading="lazy"
                    className="w-full max-w-sm rounded-[16px] object-cover"
                    alt="น้ำตกชันตาเถร"
                    src="https://cms.dmpcdn.com/travel/2021/05/11/13751240-b21c-11eb-bdb4-5dd69eff079b_original.jpg"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Mock Location: Bangkok, Thailand
                  </p>
                  <p className="text-sm text-gray-600">
                    Address: 123 Main St, Zip: 10100
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default PoiPage;
