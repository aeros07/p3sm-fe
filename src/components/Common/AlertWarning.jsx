import React, { useState } from "react";
import { Alert } from "react-bootstrap";

function AlertWarning({ message }) {
  const [show, setShow] = useState(true);
  return (
    <div className="col-12">
      {/* <div className="alert alert-warning">{message}</div> */}
      {show && (
        <Alert variant="warning" dismissible onClose={() => setShow(false)}>
          {message}
        </Alert>
      )}
    </div>
  );
}

export default AlertWarning;
