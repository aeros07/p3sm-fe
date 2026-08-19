import React, { useState, useEffect } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Row, Col
} from "reactstrap";
import axiosClient from "../../api/axiosClient";

/**
 * MediaPickerModal - Reusable component untuk memilih gambar dari galeri Media File
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   onSelect: (media: { id, full_url, name }) => void
 */
const MediaPickerModal = ({ isOpen, onClose, onSelect }) => {
  const [mediaList, setMediaList] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total_page: 1, has_next: false, has_prev: false });

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, page]);

  const fetchMedia = async (q = search) => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/media", {
        params: { title: q, page, limit: 20 },
      });
      setMediaList(response.data.data || []);
      setMeta(response.data.meta || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMedia(search);
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" scrollable>
      <ModalHeader toggle={onClose}>Pilih Gambar dari Media</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSearch} className="mb-3 d-flex gap-2">
          <Input
            type="text"
            placeholder="Cari nama media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button color="primary" type="submit">Cari</Button>
        </form>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="mdi mdi-image-off display-4"></i>
            <p>Tidak ada media. Upload dulu di menu Media File.</p>
          </div>
        ) : (
          <Row className="g-2">
            {mediaList.map((media) => (
              <Col xs={6} sm={4} md={3} key={media.id}>
                <div
                  className="border rounded p-1"
                  style={{ cursor: "pointer" }}
                  onClick={() => { onSelect(media); onClose(); }}
                  title={media.name}
                >
                  <img
                    src={media.full_url}
                    alt={media.name}
                    className="w-100 rounded"
                    style={{ height: "100px", objectFit: "cover" }}
                  />
                  <small className="d-block text-truncate text-muted mt-1 text-center">
                    {media.name}
                  </small>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </ModalBody>
      <ModalFooter className="justify-content-between">
        <div className="d-flex gap-2">
          <Button
            color="outline-secondary"
            size="sm"
            disabled={!meta.has_prev}
            onClick={() => setPage((p) => p - 1)}
          >
            &laquo; Prev
          </Button>
          <Button
            color="outline-secondary"
            size="sm"
            disabled={!meta.has_next}
            onClick={() => setPage((p) => p + 1)}
          >
            Next &raquo;
          </Button>
        </div>
        <Button color="secondary" onClick={onClose}>Tutup</Button>
      </ModalFooter>
    </Modal>
  );
};

export default MediaPickerModal;
