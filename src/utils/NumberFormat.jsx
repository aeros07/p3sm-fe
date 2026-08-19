// src/utils/numberFormat.js

/**
 * Format angka ke format Indonesia (id-ID)
 * Contoh: 1000 => 1.000, 1234567.89 => 1.234.567,89
 *
 * @param {number|string} value - Angka yang ingin diformat
 * @param {Object} options - Opsi tambahan untuk format
 * @param {number} options.minimumFractionDigits - Jumlah minimum digit desimal
 * @param {number} options.maximumFractionDigits - Jumlah maksimum digit desimal
 * @returns {string}
 */
export function NumberFormat(value, options = {}) {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  // Ubah string ke float kalau perlu
  const numericValue = parseFloat(value);

  if (isNaN(numericValue)) return '';

  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericValue);
}
