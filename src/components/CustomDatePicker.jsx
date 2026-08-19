import React from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { Indonesian } from "flatpickr/dist/l10n/id.js";

const CustomDatePicker = ({
  value,
  onChange,
  placeholder = "Pilih Tanggal",
  className = "form-control",
  style = {},
  disabled = false,
  options = {},
}) => {
  return (
    <Flatpickr
      value={value || ""}
      onChange={(selectedDates, dateStr) => {
        if (onChange) {
          onChange(dateStr);
        }
      }}
      options={{
        dateFormat: "Y-m-d",
        locale: Indonesian,
        disableMobile: true,
        clickOpens: true,
        ...options,
      }}
      className={className}
      placeholder={placeholder}
      style={style}
      disabled={disabled}
    />
  );
};

export default CustomDatePicker;
