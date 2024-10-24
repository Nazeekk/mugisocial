import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Gallery.css";
import Slider from "react-slick";
import axios from "axios";
import Modal from "react-modal";

Modal.setAppElement("#root");

const Gallery = ({ userId }) => {
  const [media, setMedia] = useState([]);
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");
  const myUserId = localStorage.getItem("userId");
  const amIAdmin = localStorage.getItem("isAdmin");

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const handleDelete = async (image) => {
    try {
      await axios.delete(
        amIAdmin
          ? BASE_URL + "/api/users/delete-media"
          : `${BASE_URL}/api/admin/delete-media/${userId}`,
        {
          data: { image },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchMedia();
    } catch (error) {
      console.error("Error deleting media:", error);
    }
  };

  const uploadMedia = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("media", file);

    try {
      await axios.patch(BASE_URL + "/api/users/upload-media", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      fileInputRef.current.value = null;
      setFile(null);
      fetchMedia();
    } catch (error) {
      console.error("Error uploading media:", error);
    }
  };

  const fetchMedia = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/users/media/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMedia(response.data);
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  }, [userId, token, BASE_URL]);

  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const settings = {
    dots: true,
    infinite: false,
    // infinite: media.length > 1, // Вимкнути нескінченну прокрутку, якщо одна фотографія
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <div className="gallery">
      <h2>Галерея</h2>
      {userId === myUserId && (
        <div>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files[0])}
            ref={fileInputRef}
          />
          <button
            className="button_primary gallery_upload-button"
            onClick={uploadMedia}
          >
            Завантажити
          </button>
        </div>
      )}

      {media.length > 0 ? (
        <Slider {...settings} className="gallery_slider">
          {media.map((item, index) => (
            <div key={index}>
              {item.endsWith(".mp4") ? (
                <video controls>
                  <source src={item} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  onClick={() => openModal(item)}
                  className="gallery_item"
                  src={item}
                  alt={`media-${index}`}
                />
              )}
            </div>
          ))}
        </Slider>
      ) : (
        <div
          style={{
            height: "300px",
            border: "1px dashed #ccc",
            display: myUserId === userId ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>No media available. Please upload something.</p>
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Image Modal"
        style={{
          content: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "90%",
            maxHeight: "90%",
            padding: "0",
            overflow: "hidden",
            backgroundColor: "#fff",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 2,
          },
        }}
      >
        {selectedImage && (
          <div
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <img
              src={selectedImage}
              alt="Selected"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>
        )}
        {(userId === myUserId || amIAdmin) && (
          <button
            onClick={() => handleDelete(selectedImage)}
            style={{
              position: "absolute",
              top: "10px",
              right: "100px",
              background: "red",
              color: "white",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Видалити
          </button>
        )}

        <button
          onClick={closeModal}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "10px",
          }}
        >
          Закрити
        </button>
      </Modal>
    </div>
  );
};

export default Gallery;
