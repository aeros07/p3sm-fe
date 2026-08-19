import React, { useState } from "react";
import { Alert } from "react-bootstrap";

function AlertSuccess({ message }) {
  const [show, setShow] = useState(true);
  return (
    <div className="col-12">
      {/* <div className="alert alert-success">{message}</div> */}
      {show && (
        <Alert variant="success" dismissible onClose={() => setShow(false)}>
          {message}
        </Alert>
      )}
    </div>
  );
}

export default AlertSuccess;
