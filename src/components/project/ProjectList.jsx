import React from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../common/Pagination';
import ConfirmModal from '../common/ConfirmModal';
import { useProjectList } from '../../hooks/useProjectList';

export default function ProjectList() {
  const {
    t,
    projects,
    groups,
    totalPages,
    currentPage,
    setCurrentPage,
    loading,
    searchInput,
    setSearchInput,
    statusInput,
    setStatusInput,
    showAdvanced,
    setShowAdvanced,
    advInputs,
    handleAdvChange,
    selectedIds,
    modalConfig,
    setModalConfig,
    actionError,
    handleSearch,
    handleReset,
    toggleSelectRow,
    openDelete,
    confirmDelete,
    toggleSort,
    renderSortIcon,
    fmtDate,
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

      {/* Main Search Bar */}
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
          onClick={() => setShowAdvanced((prev) => !prev)}
          title={showAdvanced ? t('projectList.hideAdvanced') : t('projectList.showAdvanced')}
        >
          <i className="fa fa-filter" />
        </button>
      </form>

      {/* Collapsible Advanced Filter Section */}
      {showAdvanced && (
        <div className="advanced-filter-panel">
          <div className="advanced-filter-grid">
            <div className="advanced-filter-item">
              <label className="advanced-filter-label">{t('projectList.leaderPlaceholder')}</label>
              <input
                type="text"
                className="pim-input"
                placeholder="e.g. DTH"
                value={advInputs.leaderVisa}
                onChange={(e) => handleAdvChange('leaderVisa', e.target.value)}
                list="leader-visas-list"
              />
              <datalist id="leader-visas-list">
                {(groups || []).map((g) => {
                  const visa = g.groupLeader?.visa || g.leaderVisa;
                  return visa ? <option key={g.id} value={visa} /> : null;
                })}
              </datalist>
            </div>
            <div className="advanced-filter-item">
              <label className="advanced-filter-label">{t('projectList.memberPlaceholder')}</label>
              <input
                type="text"
                className="pim-input"
                placeholder="e.g. BHU"
                value={advInputs.memberVisa}
                onChange={(e) => handleAdvChange('memberVisa', e.target.value)}
              />
            </div>
            <div className="advanced-filter-item">
              <label className="advanced-filter-label">{t('projectList.startDateFrom')}</label>
              <input
                type="date"
                className="pim-input align-center"
                value={advInputs.startDateFrom}
                onChange={(e) => handleAdvChange('startDateFrom', e.target.value)}
              />
            </div>
            <div className="advanced-filter-item">
              <label className="advanced-filter-label">{t('projectList.startDateTo')}</label>
              <input
                type="date"
                className="pim-input align-center"
                value={advInputs.startDateTo}
                onChange={(e) => handleAdvChange('startDateTo', e.target.value)}
              />
            </div>
            <div className="advanced-filter-item">
              <label className="advanced-filter-label">{t('projectList.endDateFrom')}</label>
              <input
                type="date"
                className="pim-input align-center"
                value={advInputs.endDateFrom}
                onChange={(e) => handleAdvChange('endDateFrom', e.target.value)}
              />
            </div>
            <div className="advanced-filter-item">
              <label className="advanced-filter-label">{t('projectList.endDateTo')}</label>
              <input
                type="date"
                className="pim-input align-center"
                value={advInputs.endDateTo}
                onChange={(e) => handleAdvChange('endDateTo', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Projects Table with Sortable Headers */}
      <div className="pim-table-wrapper">
        <table className="pim-table">
          <thead>
            <tr>
              <th className="col-checkbox"></th>
              <th className="col-number sortable-th" onClick={() => toggleSort('projectNumber')}>
                {t('projectList.table.number')}
                {renderSortIcon('projectNumber')}
              </th>
              <th className="col-name sortable-th" onClick={() => toggleSort('name')}>
                {t('projectList.table.name')}
                {renderSortIcon('name')}
              </th>
              <th className="col-status sortable-th" onClick={() => toggleSort('status')}>
                {t('projectList.table.status')}
                {renderSortIcon('status')}
              </th>
              <th className="col-customer sortable-th" onClick={() => toggleSort('customer')}>
                {t('projectList.table.customer')}
                {renderSortIcon('customer')}
              </th>
              <th className="col-date sortable-th" onClick={() => toggleSort('startDate')}>
                {t('projectList.table.startDate')}
                {renderSortIcon('startDate')}
              </th>
              <th className="col-delete">{t('projectList.table.delete')}</th>
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

      {/* Selection Action Bar directly underneath table matching pasted-image-1397.png */}
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

      {/* Pagination aligned to right */}
      <div className="pim-pagination-container">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} />
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
