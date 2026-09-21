import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <ul className="pim-pagination">
      <li className="pim-pagination-item">
        <button
          type="button"
          className="pim-pagination-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
        >
          «
        </button>
      </li>

      {pages.map((p) => (
        <li key={p} className="pim-pagination-item">
          <button
            type="button"
            className={`pim-pagination-btn ${p === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        </li>
      ))}

      <li className="pim-pagination-item">
        <button
          type="button"
          className="pim-pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
        >
          »
        </button>
      </li>
    </ul>
  );
}
