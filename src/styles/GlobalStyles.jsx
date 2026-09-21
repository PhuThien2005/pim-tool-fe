import React from 'react';

export default function GlobalStyles() {
  return (
    <style>{`
      /* ========================================================
         PIM Tool - Consolidated JSX Global Styles
         Strict compliance with S25.2 Checklist & Mockups
         ======================================================== */
      :root {
        --primary-blue: #2F85FA;
        --primary-blue-hover: #1b6fdc;
        --text-dark: #333333;
        --text-muted: #666666;
        --border-color: #B9B9B9;
        --border-light: #E0E0E0;
        --error-color: #CC0000;
        --error-bg: #FDF2F2;
        --error-border: #F5C6CB;
        --readonly-bg: #F0F0F0;
        --font-segoe: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: var(--font-segoe);
        background-color: #FAFAFA;
        color: var(--text-dark);
        -webkit-font-smoothing: antialiased;
      }

      * {
        box-sizing: border-box;
      }

      a {
        color: var(--primary-blue);
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
        color: var(--primary-blue-hover);
      }

      /* S25.2 Text Alignment Rules */
      .align-left {
        text-align: left !important;
      }

      .align-center {
        text-align: center !important;
      }

      .align-right {
        text-align: right !important;
      }

      /* Error & Form Alert Banner */
      .error-banner {
        background-color: var(--error-bg);
        color: var(--error-color);
        border: 1px solid var(--error-border);
        padding: 10px 16px;
        border-radius: 4px;
        margin-bottom: 24px;
        font-size: 13px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .field-error {
        border-color: var(--error-color) !important;
        box-shadow: 0 0 0 1px var(--error-color) !important;
      }

      .required-asterisk {
        color: var(--error-color);
        margin-left: 4px;
        font-weight: bold;
      }

      .readonly-field {
        background-color: var(--readonly-bg) !important;
        color: #777777 !important;
        cursor: not-allowed !important;
        border: 1px solid var(--border-light) !important;
      }

      /* Button Styles (S25.2: Segoe UI, 4px border radius, clear states) */
      .btn-pim-primary {
        background-color: var(--primary-blue);
        color: #FFFFFF;
        border: 1px solid var(--primary-blue);
        border-radius: 4px;
        height: 35px;
        padding: 0 24px;
        font-family: var(--font-segoe);
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.15s ease-in-out;
      }

      .btn-pim-primary:hover:not(:disabled) {
        background-color: var(--primary-blue-hover);
        border-color: var(--primary-blue-hover);
      }

      .btn-pim-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-pim-secondary {
        background: linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%);
        color: var(--text-dark);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        height: 35px;
        padding: 0 24px;
        font-family: var(--font-segoe);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease-in-out;
      }

      .btn-pim-secondary:hover {
        background: #EAEAEA;
      }

      .btn-pim-danger {
        background-color: #D9534F;
        color: #FFFFFF;
        border: 1px solid #D43F3A;
        border-radius: 4px;
        height: 35px;
        padding: 0 20px;
        font-family: var(--font-segoe);
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }

      .btn-pim-danger:hover {
        background-color: #C9302C;
      }

      /* Form Inputs & Selects */
      .pim-input {
        height: 30px;
        border: 1px solid var(--border-color);
        border-radius: 3px;
        padding: 2px 8px;
        font-family: var(--font-segoe);
        font-size: 13px;
        color: var(--text-dark);
        outline: none;
        width: 100%;
        background-color: #FFFFFF;
      }

      .pim-input:focus {
        border-color: var(--primary-blue);
        box-shadow: 0 0 0 1px var(--primary-blue);
      }

      .pim-select {
        height: 30px;
        border: 1px solid var(--border-color);
        border-radius: 3px;
        padding: 2px 24px 2px 8px;
        font-family: var(--font-segoe);
        font-size: 13px;
        color: var(--text-dark);
        outline: none;
        background-color: #FFFFFF;
        cursor: pointer;
      }

      .pim-select:focus {
        border-color: var(--primary-blue);
      }

      .pim-divider {
        border: 0;
        height: 1px;
        background-color: #E2E2E2;
        margin: 16px 0 24px 0;
      }

      /* Header Styles */
      .pim-header {
        background-color: #FFFFFF;
        border-bottom: 1px solid #E0E0E0;
        padding: 12px 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .header-logo {
        height: 42px;
        object-fit: contain;
      }

      .header-title {
        margin: 0;
        font-family: var(--font-segoe);
        font-size: 22px;
        font-weight: 600;
        color: var(--text-dark);
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 28px;
        font-size: 14px;
        font-family: var(--font-segoe);
      }

      .lang-switch {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
      }

      .lang-btn {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        color: var(--primary-blue);
        font-family: var(--font-segoe);
        font-size: 14px;
      }

      .lang-btn.active {
        font-weight: 700;
        color: var(--primary-blue);
        text-decoration: underline;
      }

      .lang-divider {
        color: #999999;
      }

      .header-link {
        color: var(--primary-blue);
        text-decoration: none;
        cursor: pointer;
      }

      .header-link:hover {
        text-decoration: underline;
      }

      .header-link.disabled {
        color: #888888;
        cursor: default;
      }

      /* Sidebar Styles */
      .pim-sidebar {
        width: 220px;
        min-width: 200px;
        padding: 24px 20px 24px 0;
        border-right: 1px solid #EAEAEA;
        min-height: calc(100vh - 70px);
        background-color: #FFFFFF;
      }

      .sidebar-section {
        margin-bottom: 24px;
      }

      .sidebar-title-link {
        display: block;
        font-family: var(--font-segoe);
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-blue);
        text-decoration: none;
        margin-bottom: 12px;
        cursor: pointer;
      }

      .sidebar-title-link:hover {
        text-decoration: underline;
        color: var(--primary-blue-hover);
      }

      .sidebar-title-link.active {
        font-weight: 700;
      }

      .sidebar-heading {
        font-family: var(--font-segoe);
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-blue);
        margin-bottom: 8px;
      }

      .sidebar-nav {
        list-style: none;
        padding: 0;
        margin: 0 0 0 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .sidebar-nav-item a {
        font-family: var(--font-segoe);
        font-size: 14px;
        text-decoration: none;
        display: block;
        color: var(--text-muted);
        font-weight: 400;
      }

      .sidebar-nav-item a.active {
        font-weight: 600;
        color: #333333;
      }

      .sidebar-nav-item a.disabled {
        color: #888888;
        cursor: default;
      }

      .sidebar-nav-item a:hover:not(.disabled) {
        text-decoration: underline;
        color: #333333;
      }

      /* Pagination Styles */
      .pim-pagination {
        display: flex;
        align-items: center;
        list-style: none;
        padding: 0;
        margin: 0;
        border: 1px solid #DCDCDC;
        border-radius: 2px;
        overflow: hidden;
        height: 32px;
      }

      .pim-pagination-item {
        border-right: 1px solid #DCDCDC;
        height: 100%;
      }

      .pim-pagination-item:last-child {
        border-right: none;
      }

      .pim-pagination-btn {
        background: #FFFFFF;
        border: none;
        min-width: 32px;
        height: 100%;
        padding: 0 10px;
        font-family: var(--font-segoe);
        font-size: 13px;
        color: var(--primary-blue);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.1s;
      }

      .pim-pagination-btn:hover:not(:disabled) {
        background-color: #F0F4FF;
      }

      .pim-pagination-btn.active {
        color: var(--primary-blue);
        font-weight: bold;
        background-color: #EBF3FE;
        text-decoration: underline;
      }

      .pim-pagination-btn:disabled {
        color: #CCCCCC;
        cursor: not-allowed;
      }

      /* Project List Styles */
      .pim-project-list-container {
        padding: 24px 32px;
        width: 100%;
        max-width: 1200px;
      }

      .pim-page-title {
        font-family: var(--font-segoe);
        font-size: 20px;
        font-weight: 600;
        color: var(--text-dark);
        margin: 0 0 16px 0;
      }

      .pim-search-bar {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }

      .search-bar-wrapper {
        margin-bottom: 20px;
      }

      .search-form {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }

      .search-input-field {
        width: 280px;
        height: 32px;
      }

      .search-select-field {
        width: 180px;
        height: 32px;
      }

      .btn-reset-search {
        background: none;
        border: none;
        color: var(--primary-blue);
        font-family: var(--font-segoe);
        font-size: 14px;
        cursor: pointer;
        padding: 0 8px;
      }

      .btn-reset-search:hover {
        text-decoration: underline;
      }

      /* Projects Table */
      .pim-table-wrapper {
        border: 1px solid #DCDCDC;
        background-color: #FFFFFF;
        margin-bottom: 20px;
        min-height: 120px;
        position: relative;
      }

      .pim-table {
        width: 100%;
        border-collapse: collapse;
        font-family: var(--font-segoe);
        font-size: 14px;
      }

      .pim-table th {
        height: 32px;
        padding: 4px 12px;
        background-color: #FFFFFF;
        font-weight: 600;
        color: var(--text-muted);
        border-bottom: 1px solid #DCDCDC;
        border-right: 1px solid #EBEBEB;
        user-select: none;
      }

      .pim-table th:last-child {
        border-right: none;
      }

      .pim-table td {
        height: 34px;
        padding: 4px 12px;
        border-bottom: 1px solid #EBEBEB;
        border-right: 1px solid #EBEBEB;
        color: var(--text-dark);
      }

      .pim-table td:last-child {
        border-right: none;
      }

      .pim-table tr:hover {
        background-color: #F9FBFF;
      }

      .pim-table tr.selected-row {
        background-color: #F0F6FF;
      }

      .pim-checkbox {
        width: 15px;
        height: 15px;
        cursor: pointer;
        accent-color: var(--primary-blue);
      }

      .col-checkbox {
        width: 38px;
        text-align: center;
      }

      .col-number {
        width: 80px;
        text-align: right;
      }

      .col-name {
        min-width: 220px;
        text-align: left;
      }

      .col-status {
        width: 120px;
        text-align: left;
      }

      .col-customer {
        min-width: 200px;
        text-align: left;
      }

      .col-date {
        width: 110px;
        text-align: center;
      }

      .col-delete {
        width: 70px;
        text-align: center;
      }

      .project-number-link {
        color: var(--primary-blue);
        text-decoration: none;
        font-weight: 500;
      }

      .project-number-link:hover {
        text-decoration: underline;
      }

      .btn-delete-icon {
        background: none;
        border: none;
        color: #D9534F;
        cursor: pointer;
        padding: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: transform 0.1s ease;
      }

      .btn-delete-icon:hover {
        transform: scale(1.15);
        color: #C9302C;
      }

      .empty-state, .loading-state {
        padding: 40px;
        text-align: center;
        color: var(--text-muted);
        font-size: 14px;
      }

      .empty-table-msg {
        text-align: center;
        padding: 32px !important;
        color: var(--text-muted);
        font-style: italic;
      }

      /* Footer Section: selection info & pagination */
      .pim-table-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 16px;
        flex-wrap: wrap;
        gap: 16px;
      }

      .table-footer-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 16px;
      }

      .selection-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .selected-count-text {
        font-family: var(--font-segoe);
        font-size: 14px;
        color: var(--primary-blue);
        font-weight: 500;
      }

      .selected-items-info {
        font-family: var(--font-segoe);
        font-size: 13px;
        color: var(--primary-blue);
        font-weight: 500;
      }

      .btn-delete-selected {
        background: none;
        border: none;
        color: #D9534F;
        font-family: var(--font-segoe);
        font-size: 14px;
        cursor: pointer;
        padding: 0;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .btn-delete-selected:hover {
        text-decoration: underline;
      }

      .delete-selected-text {
        margin-left: 12px;
        color: #D9534F;
        cursor: pointer;
        text-decoration: none;
      }

      .delete-selected-text:hover {
        text-decoration: underline;
      }

      /* Project Form Styles */
      .pim-project-form-container {
        padding: 24px 32px;
        width: 100%;
        max-width: 900px;
      }

      .pim-form-title {
        font-family: var(--font-segoe);
        font-size: 20px;
        font-weight: 600;
        color: var(--text-dark);
        margin: 0 0 12px 0;
      }

      .pim-form-body {
        max-width: 900px;
      }

      .form-row-custom {
        display: flex;
        align-items: center;
        margin-bottom: 14px;
      }

      .form-label-col {
        width: 170px;
        font-family: var(--font-segoe);
        font-size: 14px;
        font-weight: 600;
        color: var(--text-muted);
      }

      .form-input-col {
        flex: 1;
        display: flex;
        align-items: center;
      }

      .input-sm {
        width: 160px !important;
      }

      .input-md {
        width: 220px !important;
      }

      .input-lg {
        width: 480px !important;
        max-width: 100%;
      }

      .date-row-container {
        display: flex;
        align-items: center;
        gap: 32px;
        width: 100%;
      }

      .date-group {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .date-label {
        font-family: var(--font-segoe);
        font-size: 14px;
        font-weight: 600;
        color: var(--text-muted);
        white-space: nowrap;
      }

      .form-actions-row {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        margin-top: 32px;
        padding-top: 16px;
      }

      /* Autocomplete dropdown */
      .suggest-dropdown-list {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: #FFFFFF;
        border: 1px solid var(--border-color);
        border-top: none;
        max-height: 180px;
        overflow-y: auto;
        z-index: 100;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .suggest-item {
        padding: 6px 10px;
        font-family: var(--font-segoe);
        font-size: 13px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
      }

      .suggest-item:hover, .suggest-item.highlighted {
        background-color: #F0F6FF;
      }

      /* Modal Dialog */
      .pim-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1050;
      }

      .pim-modal-box {
        background-color: #FFFFFF;
        border-radius: 4px;
        width: 420px;
        max-width: 90%;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        overflow: hidden;
      }

      .pim-modal-header {
        padding: 14px 20px;
        border-bottom: 1px solid #EAEAEA;
        font-weight: 600;
        font-size: 16px;
        font-family: var(--font-segoe);
        color: var(--text-dark);
      }

      .pim-modal-body {
        padding: 20px;
        font-size: 14px;
        font-family: var(--font-segoe);
        color: var(--text-muted);
        line-height: 1.5;
      }

      .pim-modal-footer {
        padding: 12px 20px;
        border-top: 1px solid #EAEAEA;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        background-color: #F9F9F9;
      }

      /* Member Suggest Dropdown Styles */
      .member-suggest-dropdown {
        position: absolute;
        top: 32px;
        left: 0;
        right: 0;
        max-height: 180px;
        overflow-y: auto;
        background-color: #FFFFFF;
        border: 1px solid #DCDCDC;
        border-radius: 2px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .member-suggest-item {
        padding: 6px 12px;
        cursor: pointer;
        font-family: var(--font-segoe);
        font-size: 13px;
        color: var(--text-dark);
        display: flex;
        justify-content: space-between;
      }

      .member-suggest-item.active, .member-suggest-item:hover {
        background-color: #EBF3FE;
      }

      .member-suggest-visa {
        color: var(--primary-blue);
        font-weight: 600;
      }

      .member-suggest-name {
        color: var(--text-muted);
      }
    `}</style>
  );
}
