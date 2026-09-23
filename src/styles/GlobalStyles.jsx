import React from 'react';

export default function GlobalStyles() {
  return (
    <style>{`
      /* ========================================================
         PIM Tool - Consolidated JSX Global Styles
         Strict compliance with S25.2 Checklist & Mockups
         ======================================================== */
      :root {
        --primary-blue: #0088D0;
        --primary-blue-hover: #0058CC;
        --text-dark: #666666;
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
        color: #666666;
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

      /* Error & Form Alert Banner (matching pasted-image-5.png) */
      .error-banner {
        background-color: #F2DEDE;
        color: #A94442;
        border: 1px solid #EBCCD1;
        padding: 12px 18px;
        border-radius: 4px;
        margin-bottom: 24px;
        font-family: var(--font-segoe);
        font-size: 13px;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .error-banner-close {
        background: none;
        border: none;
        font-size: 14px;
        color: #A94442;
        cursor: pointer;
        padding: 0 4px;
        line-height: 1;
      }

      .error-banner-close:hover {
        color: #7A2826;
      }

      .inline-field-error-msg {
        color: #A94442;
        font-family: var(--font-segoe);
        font-size: 13px;
        font-weight: 500;
      }

      .field-error {
        border-color: #D9534F !important;
        box-shadow: none !important;
      }

      .required-asterisk {
        color: #D9534F;
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
        background: linear-gradient(to top, #0058CC 0%, #0084CC 100%);
        color: #FFFFFF;
        border: 1px solid #0058CC;
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
        transition: opacity 0.15s ease-in-out;
      }

      .btn-pim-primary:hover:not(:disabled) {
        opacity: 0.9;
        background: linear-gradient(to top, #004FB8 0%, #0077B8 100%);
        border-color: #004FB8;
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
        padding: 12px 48px;
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
        color: #666666;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 24px;
        font-size: 14px;
        font-family: var(--font-segoe);
      }

      .lang-switch {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        min-width: 52px;
      }

      .lang-btn {
        background: none;
        border: none;
        padding: 0;
        width: 22px;
        min-width: 22px;
        text-align: center;
        cursor: pointer;
        color: #666666;
        font-family: var(--font-segoe);
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
      }

      .lang-btn.active {
        color: #018FE1;
        text-decoration: none;
        font-weight: 600;
      }

      .lang-btn:hover {
        color: #018FE1;
        text-decoration: underline;
      }

      .lang-divider {
        color: #018FE1;
        margin: 0 2px;
        user-select: none;
      }

      .header-link-help {
        color: #666666 !important;
        text-decoration: none;
        cursor: pointer;
        min-width: 36px;
        text-align: center;
        font-weight: 600;
      }

      .header-link-help:hover,
      .header-link-help.active {
        color: #018FE1 !important;
        text-decoration: underline;
      }

      .header-link-logout {
        color: #666666 !important;
        text-decoration: none;
        cursor: pointer;
        min-width: 60px;
        text-align: left;
        font-weight: 600;
      }

      .header-link-logout:hover {
        text-decoration: underline;
        color: #333333 !important;
      }

      /* Sidebar Styles */
      .pim-sidebar {
        width: 240px;
        min-width: 220px;
        padding: 32px 0;
        border-right: 1px solid #EAEAEA;
        min-height: calc(100vh - 70px);
        background-color: #FFFFFF;
        display: flex;
        justify-content: center;
      }

      .sidebar-inner {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        width: fit-content;
        min-width: 130px;
      }

      .sidebar-section {
        margin-bottom: 24px;
        width: 100%;
        text-align: left;
      }

      .sidebar-title-link {
        display: block;
        font-family: var(--font-segoe);
        font-size: 18px;
        font-weight: 600;
        color: #666666;
        text-decoration: none;
        margin-bottom: 16px;
        cursor: pointer;
        padding: 0;
        text-align: left;
      }

      .sidebar-title-link:hover {
        text-decoration: underline;
        color: #2E84FB;
      }

      .sidebar-title-link.active {
        font-weight: 600;
        color: #2E84FB;
      }

      .sidebar-heading {
        font-family: var(--font-segoe);
        font-size: 18px;
        font-weight: 600;
        color: #666666;
        margin-bottom: 12px;
        padding: 0;
        text-align: left;
      }

      .sidebar-heading.active {
        color: #2E84FB;
      }

      .sidebar-nav {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        text-align: left;
      }

      .sidebar-nav-item {
        padding: 0;
        margin: 0;
        text-align: left;
      }

      .sidebar-nav-item a {
        font-family: var(--font-segoe);
        font-size: 14px;
        text-decoration: none;
        display: block;
        color: #666666;
        font-weight: 400;
        text-align: left;
      }

      .sidebar-nav-item a.active {
        font-weight: 600;
        color: #2E84FB;
      }

      .sidebar-nav-item a.disabled {
        color: #666666;
        cursor: default;
      }

      .sidebar-nav-item a:hover:not(.disabled) {
        text-decoration: underline;
        color: #2E84FB;
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
        color: #666666;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.1s;
      }

      .pim-pagination-btn:hover:not(:disabled) {
        background-color: #F0F4FF;
        color: #0088D0;
      }

      .pim-pagination-btn.active {
        color: #0088D0;
        font-weight: bold;
        background-color: #FFFFFF;
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
        color: #2E85F9;
        font-family: var(--font-segoe);
        font-size: 14px;
        cursor: pointer;
        padding: 0 8px;
      }

      .btn-reset-search:hover {
        text-decoration: underline;
        color: #1b6fdc;
      }

      .btn-advanced-toggle {
        background: #F0F4FF;
        border: 1px solid #C7D9FD;
        color: var(--primary-blue);
        font-size: 14px;
        cursor: pointer;
        padding: 0;
        width: 35px;
        height: 35px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
      }

      .btn-advanced-toggle:hover {
        background: #E2ECFE;
        border-color: var(--primary-blue);
      }

      /* Advanced Filter Panel */
      .advanced-filter-panel {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 4px;
        padding: 16px 20px;
        margin: 12px 0 20px 0;
        animation: fadeIn 0.2s ease-in-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .advanced-filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px 20px;
      }

      .advanced-filter-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .advanced-filter-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
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
        padding: 4px 10px;
        background-color: #FFFFFF;
        font-weight: normal;
        color: #666666;
        border-bottom: 1px solid #DCDCDC;
        border-right: 1px solid #EBEBEB;
        user-select: none;
        white-space: nowrap;
      }

      .pim-table th:last-child {
        border-right: none;
      }

      .sortable-th {
        cursor: pointer;
        white-space: nowrap !important;
        transition: background-color 0.15s ease;
      }

      .sortable-th:hover {
        background-color: #F0F4FF !important;
        color: #0088D0 !important;
      }

      .sort-caret {
        display: inline-block;
        margin-left: 4px;
        font-size: 10px;
        color: #0088D0;
        vertical-align: middle;
        line-height: 0;
        position: relative;
        top: -1px;
      }

      .pim-table td {
        height: 32px;
        padding: 4px 10px;
        border-bottom: 1px solid #EBEBEB;
        border-right: 1px solid #EBEBEB;
        color: #666666;
        font-weight: 600;
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
        accent-color: #0088D0;
      }

      .col-checkbox {
        width: 38px;
        text-align: center;
      }

      .col-number {
        width: 100px;
        min-width: 95px;
        text-align: right;
        white-space: nowrap;
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
        color: #666666;
        text-decoration: none;
        font-weight: 600;
      }

      .project-number-link:hover {
        color: #0088D0;
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
      /* Selection Action Bar (matching pasted-image-1397.png) */
      .table-selection-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #FAFCFE;
        border: 1px solid #DCDCDC;
        border-top: none;
        padding: 8px 16px;
        margin-bottom: 16px;
      }

      .selected-count-text {
        font-family: var(--font-segoe);
        font-size: 14px;
        color: #0088D0;
        font-weight: 600;
      }

      .btn-delete-selected {
        background: none;
        border: none;
        color: #D9534F;
        font-family: var(--font-segoe);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        padding: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .btn-delete-selected:hover {
        text-decoration: underline;
      }

      .pim-pagination-container {
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
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

      /* Locale Datepicker Styles */
      .locale-datepicker-wrapper {
        display: inline-flex;
        align-items: center;
        width: 160px;
        height: 32px;
        border: 1px solid #CCCCCC;
        background-color: #FFFFFF;
        border-radius: 2px;
        padding: 0 4px;
        position: relative;
        transition: border-color 0.15s ease;
      }

      .locale-datepicker-wrapper:focus-within {
        border-color: #2E84FB;
      }

      .locale-datepicker-wrapper.field-error {
        border-color: #D9534F !important;
      }

      .locale-datepicker-input {
        flex: 1;
        width: 100%;
        height: 100%;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        background: transparent;
        font-family: var(--font-segoe);
        font-size: 13px;
        color: #333333;
        text-align: center;
      }

      .locale-datepicker-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0 4px;
        color: #666666;
        font-size: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .locale-datepicker-btn:hover {
        color: #2E84FB;
      }

      .locale-datepicker-popup {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        z-index: 1100;
        background-color: #FFFFFF;
        border: 1px solid #CCCCCC;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 10px;
        width: 220px;
      }

      .datepicker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .datepicker-title {
        font-family: var(--font-segoe);
        font-size: 13px;
        font-weight: 600;
        color: #333333;
      }

      .datepicker-nav-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        color: #666666;
        padding: 0 6px;
      }

      .datepicker-nav-btn:hover {
        color: #2E84FB;
      }

      .datepicker-days-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        margin-bottom: 4px;
      }

      .datepicker-day-name {
        font-family: var(--font-segoe);
        font-size: 11px;
        font-weight: 600;
        color: #888888;
      }

      .datepicker-days-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
      }

      .datepicker-day-cell {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        border-radius: 3px;
        font-family: var(--font-segoe);
        font-size: 12px;
        color: #333333;
        cursor: pointer;
        padding: 0;
      }

      .datepicker-day-cell:hover:not(.empty) {
        background-color: #EBF3FE;
        color: #2E84FB;
      }

      .datepicker-day-cell.selected {
        background-color: #2E84FB !important;
        color: #FFFFFF !important;
        font-weight: bold;
      }

      .datepicker-day-cell.empty {
        cursor: default;
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

      /* Member Suggest Tag/Chip Styles (matching pasted-image-10.png) */
      .member-suggest-box {
        min-height: 32px;
        width: 100%;
        max-width: 480px;
        border: 1px solid #CCCCCC;
        background-color: #FFFFFF;
        border-radius: 2px;
        padding: 3px 6px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        cursor: text;
        transition: border-color 0.15s ease;
      }

      .member-suggest-box:focus-within {
        border-color: #2E84FB;
      }

      .member-suggest-box.field-error {
        border-color: #D9534F !important;
      }

      .member-chip {
        background: linear-gradient(180deg, #FAFAFA 0%, #E8E8E8 100%);
        border: 1px solid #BDBDBD;
        border-radius: 3px;
        padding: 2px 6px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: var(--font-segoe);
        font-size: 12px;
        font-weight: 600;
        color: #333333;
        user-select: none;
        line-height: 1.2;
      }

      .member-chip-remove {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        margin-left: 2px;
        font-size: 12px;
        line-height: 1;
        color: #666666;
        font-weight: bold;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .member-chip-remove:hover {
        color: #D9534F;
      }

      .member-suggest-input {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        flex: 1;
        min-width: 100px;
        height: 24px;
        padding: 0 4px;
        font-family: var(--font-segoe);
        font-size: 13px;
        background: transparent;
        color: #333333;
      }

      .member-suggest-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        max-width: 480px;
        max-height: 180px;
        overflow-y: auto;
        background-color: #FFFFFF;
        border: 1px solid #7F9DB9;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        list-style: none;
        padding: 0;
        margin: 2px 0 0 0;
      }

      .member-suggest-item {
        padding: 6px 12px;
        cursor: pointer;
        font-family: var(--font-segoe);
        font-size: 13px;
        color: #333333;
        display: flex;
        align-items: center;
      }

      .member-suggest-item.active, .member-suggest-item:hover {
        background-color: #3399FF;
        color: #FFFFFF;
      }
    `}</style>
  );
}
