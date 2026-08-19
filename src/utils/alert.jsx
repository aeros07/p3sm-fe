import Swal from 'sweetalert2';

const showAlert = (title, text, icon,status_confirm) => {
    const options = {
        title,
        text,
        icon,
    };

    if (status_confirm === "true") {
        options.showCancelButton = true;
        options.confirmButtonColor = "#3085d6";
        options.cancelButtonColor = "#d33";
        options.confirmButtonText = "Yes";
    }

    return Swal.fire(options);
};

export const showSuccess = (text) => showAlert("Success", text, "success","false");
export const showError = (text) => showAlert("Oops...", text, "error","false");
export const showConfirm = (text) => showAlert("Are you sure?", text, "warning","true");
