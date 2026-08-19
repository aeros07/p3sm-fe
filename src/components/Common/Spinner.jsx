import React, { useEffect } from "react"
import { Spinner } from "reactstrap";

const Spinners = ({ setLoading }) => {
    return (
        <React.Fragment>
            <Spinner color="primary" style={{
       
        zIndex: 2000, // lebih tinggi dari Bootstrap modal
      }} className='position-absolute top-50 start-50' />
        </React.Fragment>
    )
}

export default Spinners;