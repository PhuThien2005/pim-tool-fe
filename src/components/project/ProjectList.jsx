import React from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../common/Pagination';
import ConfirmModal from '../common/ConfirmModal';
import { useProjectList } from '../../hooks/useProjectList';

const COLS = [
  ['col-checkbox'],
  ['col-number', 'number', 'projectNumber'],
  ['col-name', 'name', 'name'],
  ['col-status', 'status', 'status'],
  ['col-customer', 'customer', 'customer'],
  ['col-date', 'startDate', 'startDate'],
  ['col-delete', 'delete'],
];

const ADV_FIELDS = [
  { label: 'leaderPlaceholder', key: 'leaderVisa', type: 'text', placeholder: 'e.g. DTH', list: 'leader-visas-list' },
  { label: 'memberPlaceholder', key: 'memberVisa', type: 'text', placeholder: 'e.g. BHU' },
  { label: 'startDateFrom', key: 'startDateFrom', type: 'date' },
  { label: 'startDateTo', key: 'startDateTo', type: 'date' },
  { label: 'endDateFrom', key: 'endDateFrom', type: 'date' },
  { label: 'endDateTo', key: 'endDateTo', type: 'date' },
];

export default function ProjectList() {
  const {
    t, projects, groups, totalPages, currentPage, setCurrentPage, loading,
    searchInput, setSearchInput, statusInput, setStatusInput, showAdvanced, setShowAdvanced,
    advInputs, handleAdvChange, selectedIds, modalConfig, setModalConfig, actionError,
    handleSearch, handleReset, toggleSelectRow, openDelete, confirmDelete,
    toggleSort, renderSortIcon, fmtDate,
  } = useProjectList();

  return (
    <div className="pim-project-list-container">
      <h2 className="pim-page-title">{t('projectList.title')}</h2>
      <hr className="pim-divider" />

      {actionError && (
        <div className="error-banner" role="alert">
          <i className="fa fa-exclamation-circle" />
          <span>{actionError}</span>
        </div>
      )}

      <form className="pim-search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          className="pim-input search-input-field"
          placeholder={t('projectList.searchPlaceholder')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          className="pim-select search-select-field"
          value={statusInput}
          onChange={(e) => setStatusInput((e.target.value || '').toUpperCase())}
        >
          <option value="">{t('projectList.statusPlaceholder')}</option>
          {['NEW', 'PLA', 'INP', 'FIN'].map((s) => (
            <option key={s} value={s}>{t(`status.${s}`)}</option>
          ))}
        </select>
        <button type="submit" className="btn-pim-primary">{t('projectList.searchBtn')}</button>
        <button type="button" className="btn-reset-search" onClick={handleReset}>{t('projectList.resetSearch')}</button>
        <button
          type="button"
          className="btn-advanced-toggle"
          onClick={() => setShowAdvanced((p) => !p)}
          title={showAdvanced ? t('projectList.hideAdvanced') : t('projectList.showAdvanced')}
          aria-label={showAdvanced ? t('projectList.hideAdvanced') : t('projectList.showAdvanced')}
        >
          <i className="fa fa-filter" />
        </button>
      </form>

      {showAdvanced && (
        <div className="advanced-filter-panel">
          <div className="advanced-filter-grid">
            {ADV_FIELDS.map(({ label, key, type, placeholder, list }) => (
              <div key={key} className="advanced-filter-item">
                <label className="advanced-filter-label">{t(`projectList.${label}`)}</label>
                <input
                  type={type}
                  className={`pim-input ${type === 'date' ? 'align-center' : ''}`}
                  placeholder={placeholder}
                  value={advInputs[key]}
                  onChange={(e) => handleAdvChange(key, e.target.value)}
                  list={list}
                />
                {list && (
                  <datalist id={list}>
                    {(groups || []).map((g) => {
                      const visa = g.groupLeader?.visa || g.leaderVisa;
                      return visa ? <option key={g.id} value={visa} /> : null;
                    })}
                  </datalist>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pim-table-wrapper">
        <table className="pim-table">
          <thead>
            <tr>
              {COLS.map(([cls, key, sortField]) => (
                <th
                  key={cls}
                  className={`${cls} ${sortField ? 'sortable-th' : ''}`}
                  onClick={sortField ? () => toggleSort(sortField) : undefined}
                >
                  {key ? t(`projectList.table.${key}`) : null}
                  {sortField && renderSortIcon(sortField)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!projects.length ? (
              <tr>
                <td colSpan={7} className="empty-table-msg">
                  {loading ? t('common.loading') : t('projectList.noProjectsFound')}
                </td>
              </tr>
            ) : (
              projects.map((p) => {
                const id = p.id || p.projectNumber;
                return (
                  <tr key={p.projectNumber} className={selectedIds.includes(id) ? 'selected-row' : ''}>
                    <td className="col-checkbox">
                      <input
                        type="checkbox"
                        className="pim-checkbox"
                        checked={selectedIds.includes(id)}
                        onChange={() => toggleSelectRow(id)}
                        aria-label={`Select project ${p.projectNumber}`}
                      />
                    </td>
                    <td className="col-number">
                      <Link to={`/project/edit/${p.projectNumber}`} className="project-number-link">
                        {p.projectNumber}
                      </Link>
                    </td>
                    <td className="col-name">{p.name}</td>
                    <td className="col-status">{t(`status.${p.status}`)}</td>
                    <td className="col-customer">{p.customer}</td>
                    <td className="col-date">{fmtDate(p.startDate)}</td>
                    <td className="col-delete">
                      {p.status === 'NEW' && (
                        <button
                          type="button"
                          className="btn-delete-icon"
                          onClick={() => openDelete([p], t('projectList.confirmDeleteSingle', { number: p.projectNumber }))}
                          title="Delete project"
                          aria-label={`Delete project ${p.projectNumber}`}
                        >
                          <i className="fa fa-trash-o" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedIds.length > 0 && (
        <div className="table-selection-bar">
          <span className="selected-count-text">
            {t('projectList.selectedItems', { count: selectedIds.length })}
          </span>
          <button
            type="button"
            className="btn-delete-selected"
            onClick={() =>
              openDelete(
                projects.filter((p) => selectedIds.includes(p.id || p.projectNumber)),
                t('projectList.confirmDeleteMultiple', { count: selectedIds.length })
              )
            }
          >
            <span>{t('projectList.deleteSelected')}</span>
            <i className="fa fa-trash-o" />
          </button>
        </div>
      )}

      <div className="pim-pagination-container">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={t('common.confirm')}
        message={modalConfig.message}
        onConfirm={confirmDelete}
        onCancel={() => setModalConfig({ isOpen: false, ids: [], message: '' })}
      />
    </div>
  );
}
