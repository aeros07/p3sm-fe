import React from "react";

const PaginationTable = ({ pageInfo, onPageChange, rangeLimit = 2 }) => {
  if (!pageInfo || typeof pageInfo !== "object") return null;

  // console.log(pageInfo);
  
  const { page, total_page } = pageInfo;

  const min_page_display = (page - rangeLimit > 0) ? page - rangeLimit : 1;
  const max_page_display = (page + rangeLimit < total_page) ? page + rangeLimit : total_page;

  const pages = [];
  for (let i = 1; i <= total_page; i++) {
    // pages.push(i);
    if (i >= min_page_display && i <= max_page_display) {
      pages.push(i);
    }
  }

  return (
    <ul className="pagination justify-content-end">
      <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          &laquo;
        </button>
      </li>

      {pages.map((p) => (
        <li key={p} className={`page-item  ${page === p ? "active" : ""}`}>
          <button className="page-link" onClick={() => onPageChange(p)}>
            {p}
          </button>
        </li>
      ))}

      <li className={`page-item ${page >= total_page ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => onPageChange(page + 1)} disabled={page >= total_page}>
          &raquo;
        </button>
      </li>
    </ul>
  );
};

export default PaginationTable;
