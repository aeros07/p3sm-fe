import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <React.Fragment>
          <div className="page-content">
            <div className="container-fluid">
              <div className="text-center py-5">
                <h1 className="display-4 fw-bold">404</h1>
                <p className="fs-5 mb-3">Halaman tidak ditemukan.</p>
                <Link to="/" className="btn btn-primary">
                  Kembali ke Home
                </Link>
              </div>
            </div>
          </div>
    </React.Fragment>
  );
};

export default NotFoundPage;
