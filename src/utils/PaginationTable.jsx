import React from 'react';

const PaginationTable = ({ pageInfo, onPageChange }) => {
  const pages = [];

  // Previous button
  pages.push(
    <li className={`page-item ${pageInfo.have_prev ? '' : 'disabled'}`} key="prev">
      <a
        href="#"
        className="page-link"
        onClick={(e) => {
          e.preventDefault();
          pageInfo.have_prev && onPageChange(pageInfo.page - 1);
        }}
        tabIndex={pageInfo.have_prev ? '0' : '-1'}
        aria-label="Previous"
      >
        Previous
      </a>
    </li>
  );

  // Page number buttons
  pageInfo.page_links.forEach((data) => {
    pages.push(
      <li
        className={`page-item ${pageInfo.page === data.number ? 'active' : ''}`}
        key={data.number}
      >
        <a
          href="#"
          className="page-link"
          onClick={(e) => {
            e.preventDefault();
            onPageChange(data.number);
          }}
          aria-current={pageInfo.page === data.number ? 'page' : undefined}
        >
          {data.number}
        </a>
      </li>
    );
  });

  // Next button
  pages.push(
    <li className={`page-item ${pageInfo.have_next ? '' : 'disabled'}`} key="next">
      <a
        href="#"
        className="page-link"
        onClick={(e) => {
          e.preventDefault();
          pageInfo.have_next && onPageChange(pageInfo.page + 1);
        }}
        tabIndex={pageInfo.have_next ? '0' : '-1'}
        aria-label="Next"
      >
        Next
      </a>
    </li>
  );

  return (
    <nav>
      <ul className="pagination">{pages}</ul>
    </nav>
  );
};

export default PaginationTable;
