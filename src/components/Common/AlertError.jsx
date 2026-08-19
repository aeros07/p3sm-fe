import React, { useState } from "react";
import { Alert } from "react-bootstrap";

function AlertError({ message }) {
  const [show, setShow] = useState(true);
  return (
    <div className="col-12">
      {/* <div className="alert alert-danger">{message}</div> */}
      {show && (
        <Alert variant="danger" dismissible onClose={() => setShow(false)}>
          {message}
        </Alert>
      )}
    </div>
  );
}

export default AlertError;
