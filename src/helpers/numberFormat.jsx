// helpers/numberFormat.js

// Format angka ke tampilan (contoh: 1000000 => "1.000.000")
export const formatNumber = (value) => {
  if (!value) return "";
  const num = parseInt(value.toString().replace(/\D/g, ""), 10);
  if (isNaN(num)) return "";
  return num.toLocaleString("id-ID");
};

// Bersihkan input ke angka mentah (string)
export const parseNumberInput = (value) => {
  return value.replace(/\D/g, "");
};

export const formatNumberWithDecimal = (value) => {
  if (value == null || value === "") return "0.00"; // aman untuk null/undefined
  const num = parseFloat(value.toString().replace(",", ""));
  if (isNaN(num)) return "0.00";

  return num.toLocaleString("id-ID", { minimumFractionDigits: 2 });
};
export const formatNumberWithDecimalDigit4 = (value) => {
  if (value == null || value === "") return "0.0000"; // aman untuk null/undefined
  const num = parseFloat(value.toString().replace(",", ""));
  if (isNaN(num)) return "0.0000";

  return num.toLocaleString("id-ID", { minimumFractionDigits: 4 });
};

export const formatNumberWithoutDecimal = (value) => {
  if (value == null || value === "") return "0.00"; // aman untuk null/undefined
  const num = parseInt(value.toString().replace(",", ""));
  if (isNaN(num)) return "0";

  return num.toLocaleString("id-ID", { minimumFractionDigits: 0 });
};


// export const formatNumberWithDecimal = (value) => {
//   value = value.toString();
//   if (!value) return "";
//   if (value == "0" || value == 0) return "0";
//   const num = parseFloat(value);
//   if (isNaN(num)) return 0;
//   // console.log(num);

//   return num.toLocaleString("id-ID", { minimumFractionDigits: 2 });
// };
