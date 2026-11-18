// admin-panel/src/pages/DeliveryPartners.js

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bike,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  X,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import API from '../services/api';

const DELIVERY_TYPE = 'delivery';

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
};

const getPartnerId = (partner) => {
  return (
    partner?.user_id ??
    partner?.id ??
    partner?._id ??
    partner?.userId ??
    ''
  );
};

const getPartnerName = (partner) => {
  return (
    normalizeValue(partner?.full_name) ||
    normalizeValue(partner?.name) ||
    normalizeValue(partner?.username) ||
    'Unnamed Partner'
  );
};

const getPartnerEmail = (partner) => {
  return normalizeValue(partner?.email) || 'Not available';
};

const getPartnerPhone = (partner) => {
  return (
    normalizeValue(partner?.phone) ||
    normalizeValue(partner?.phone_number) ||
    'Not available'
  );
};

const getPartnerStatus = (partner) => {
  const value = partner?.is_active;

  if (
    value === true ||
    value === 1 ||
    String(value).toLowerCase() === 'true' ||
    String(value).toLowerCase() === 'active' ||
    String(value) === '1'
  ) {
    return true;
  }

  return false;
};

const getPartnerCreatedAt = (partner) => {
  return (
    partner?.created_at ||
    partner?.createdAt ||
    partner?.joined_at ||
    partner?.joinedAt ||
    null
  );
};

const formatDate = (value) => {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getPartnerAddress = (partner) => {
  const parts = [
    partner?.address,
    partner?.city,
    partner?.state,
    partner?.pincode || partner?.postal_code
  ]
    .map(normalizeValue)
    .filter(Boolean);

  return parts.length ? parts.join(', ') : '';
};

const getInitial = (name) => {
  return name.trim().charAt(0).toUpperCase() || 'D';
};

export default function DeliveryPartners() {
  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [error, setError] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);

  const fetchDeliveryPartners = useCallback(
    async ({ showLoader = false } = {}) => {
      if (showLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const response = await API.get('/admin/users');

        const data = response?.data;

        if (!data?.success) {
          throw new Error(
            data?.message ||
              'Unable to fetch delivery partners.'
          );
        }

        const users = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.users)
            ? data.users
            : [];

        const deliveryPartners = users.filter((user) => {
          const userType = normalizeValue(
            user?.user_type ||
              user?.type ||
              user?.role
          ).toLowerCase();

          return userType === DELIVERY_TYPE;
        });

        setPartners(deliveryPartners);
      } catch (err) {
        console.error(
          'FoodieDash Delivery Partners Error:',
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to fetch delivery partners.';

        setError(message);

        if (showLoader || !partners.length) {
          toast.error(message);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [partners.length]
  );

  useEffect(() => {
    fetchDeliveryPartners();
  }, [fetchDeliveryPartners]);

  const filteredPartners = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return partners.filter((partner) => {
      const name = getPartnerName(partner).toLowerCase();
      const email = getPartnerEmail(partner).toLowerCase();
      const phone = getPartnerPhone(partner).toLowerCase();
      const id = normalizeValue(getPartnerId(partner)).toLowerCase();

      const isActive = getPartnerStatus(partner);

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        id.includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [partners, searchQuery, statusFilter]);

  const activeCount = useMemo(() => {
    return partners.filter((partner) =>
      getPartnerStatus(partner)
    ).length;
  }, [partners]);

  const inactiveCount = partners.length - activeCount;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const togglePartnerStatus = async (
    partner,
    event = null
  ) => {
    if (event) {
      event.stopPropagation();
    }

    const userId = getPartnerId(partner);
    const currentStatus = getPartnerStatus(partner);
    const partnerName = getPartnerName(partner);

    if (!userId) {
      toast.error(
        'Unable to update this partner because the user ID is missing.'
      );
      return;
    }

    if (updatingId !== null) {
      return;
    }

    const nextStatus = !currentStatus;

    const confirmed = window.confirm(
      `${nextStatus ? 'Activate' : 'Deactivate'} ${partnerName}?`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(userId);

    try {
      const response = await API.put(
        `/admin/users/${userId}/status`,
        {
          is_active: nextStatus
        }
      );

      const data = response?.data;

      if (data && data.success === false) {
        throw new Error(
          data.message ||
            'Failed to update delivery partner status.'
        );
      }

      setPartners((currentPartners) =>
        currentPartners.map((item) => {
          const itemId = getPartnerId(item);

          if (String(itemId) === String(userId)) {
            return {
              ...item,
              is_active: nextStatus
            };
          }

          return item;
        })
      );

      setSelectedPartner((currentPartner) => {
        if (!currentPartner) {
          return currentPartner;
        }

        const selectedId = getPartnerId(currentPartner);

        if (String(selectedId) === String(userId)) {
          return {
            ...currentPartner,
            is_active: nextStatus
          };
        }

        return currentPartner;
      });

      toast.success(
        `${partnerName} ${
          nextStatus ? 'activated' : 'deactivated'
        } successfully.`
      );
    } catch (err) {
      console.error(
        'FoodieDash Delivery Partner Status Error:',
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to update delivery partner status.';

      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <RefreshCw
          size={28}
          style={styles.loadingIcon}
          aria-hidden="true"
        />

        <p>Loading delivery partners...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={styles.backBtn}
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <div style={styles.titleRow}>
            <div style={styles.titleIcon}>
              <Bike size={28} />
            </div>

            <div>
              <h1 style={styles.title}>
                Delivery Partner Management
              </h1>

              <p style={styles.subtitle}>
                Manage FoodieDash delivery partners and
                their account status.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            fetchDeliveryPartners({ showLoader: true })
          }
          disabled={refreshing || updatingId !== null}
          style={{
            ...styles.refreshBtn,
            ...(refreshing
              ? styles.disabledButton
              : {})
          }}
        >
          <RefreshCw
            size={17}
            style={
              refreshing
                ? styles.spinIcon
                : undefined
            }
          />

          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBanner} role="alert">
          <XCircle size={20} />

          <div style={styles.errorContent}>
            <strong>Unable to load delivery partners</strong>
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => fetchDeliveryPartners()}
            style={styles.retryBtn}
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              backgroundColor: '#fff3e8',
              color: '#ff7a00'
            }}
          >
            <Bike size={23} />
          </div>

          <div>
            <span style={styles.summaryLabel}>
              Total Partners
            </span>

            <strong style={styles.summaryValue}>
              {partners.length}
            </strong>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              backgroundColor: '#eaf8ef',
              color: '#28a745'
            }}
          >
            <CheckCircle size={23} />
          </div>

          <div>
            <span style={styles.summaryLabel}>
              Active
            </span>

            <strong style={styles.summaryValue}>
              {activeCount}
            </strong>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              backgroundColor: '#fdecec',
              color: '#dc3545'
            }}
          >
            <XCircle size={23} />
          </div>

          <div>
            <span style={styles.summaryLabel}>
              Inactive
            </span>

            <strong style={styles.summaryValue}>
              {inactiveCount}
            </strong>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterCard}>
        <div style={styles.searchBox}>
          <Search
            size={19}
            color="#777"
            aria-hidden="true"
          />

          <input
            type="search"
            placeholder="Search by name, email, phone, or ID..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            style={styles.searchInput}
            aria-label="Search delivery partners"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          style={styles.filterSelect}
          aria-label="Filter delivery partners by status"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {(searchQuery || statusFilter !== 'all') && (
          <button
            type="button"
            onClick={clearFilters}
            style={styles.clearBtn}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h2 style={styles.tableTitle}>
              Delivery Partners
            </h2>

            <p style={styles.tableSubtitle}>
              Showing {filteredPartners.length} of{' '}
              {partners.length} partners
            </p>
          </div>
        </div>

        {filteredPartners.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <Bike size={30} />
            </div>

            <h3>No delivery partners found</h3>

            <p>
              {partners.length === 0
                ? 'There are currently no delivery partners registered in the system.'
                : 'Try changing your search or status filter.'}
            </p>

            {(searchQuery ||
              statusFilter !== 'all') && (
              <button
                type="button"
                onClick={clearFilters}
                style={styles.emptyAction}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Partner</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPartners.map((partner) => {
                  const partnerId = getPartnerId(partner);
                  const partnerName =
                    getPartnerName(partner);
                  const isActive =
                    getPartnerStatus(partner);
                  const isUpdating =
                    updatingId !== null &&
                    String(updatingId) ===
                      String(partnerId);

                  return (
                    <tr
                      key={
                        partnerId ||
                        `${partnerName}-${getPartnerEmail(
                          partner
                        )}`
                      }
                      style={styles.tr}
                      onClick={() =>
                        setSelectedPartner(partner)
                      }
                    >
                      <td style={styles.td}>
                        <div style={styles.partnerCell}>
                          <div
                            style={styles.avatar}
                            aria-hidden="true"
                          >
                            {getInitial(partnerName)}
                          </div>

                          <div>
                            <strong
                              style={styles.partnerName}
                            >
                              {partnerName}
                            </strong>

                            {partnerId && (
                              <span
                                style={styles.partnerId}
                              >
                                ID: {partnerId}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={styles.td}>
                        {getPartnerEmail(partner)}
                      </td>

                      <td style={styles.td}>
                        {getPartnerPhone(partner)}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(isActive
                              ? styles.activeBadge
                              : styles.inactiveBadge)
                          }}
                        >
                          {isActive ? (
                            <CheckCircle size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}

                          {isActive
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {formatDate(
                          getPartnerCreatedAt(
                            partner
                          )
                        )}
                      </td>

                      <td
                        style={styles.td}
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <button
                          type="button"
                          onClick={(event) =>
                            togglePartnerStatus(
                              partner,
                              event
                            )
                          }
                          disabled={isUpdating}
                          style={{
                            ...styles.actionBtn,
                            ...(isActive
                              ? styles.deactivateBtn
                              : styles.activateBtn),
                            ...(isUpdating
                              ? styles.disabledButton
                              : {})
                          }}
                        >
                          {isUpdating
                            ? 'Updating...'
                            : isActive
                              ? 'Deactivate'
                              : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedPartner && (
        <div
          style={styles.modalOverlay}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPartner(null);
            }
          }}
        >
          <div
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delivery-partner-modal-title"
          >
            <div style={styles.modalHeader}>
              <div>
                <h2
                  id="delivery-partner-modal-title"
                  style={styles.modalTitle}
                >
                  Delivery Partner Details
                </h2>

                <p style={styles.modalSubtitle}>
                  Account information
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPartner(null)
                }
                style={styles.closeBtn}
                aria-label="Close partner details"
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalProfile}>
              <div style={styles.largeAvatar}>
                {getInitial(
                  getPartnerName(selectedPartner)
                )}
              </div>

              <div>
                <h3 style={styles.profileName}>
                  {getPartnerName(selectedPartner)}
                </h3>

                <span
                  style={{
                    ...styles.statusBadge,
                    ...(getPartnerStatus(
                      selectedPartner
                    )
                      ? styles.activeBadge
                      : styles.inactiveBadge)
                  }}
                >
                  {getPartnerStatus(
                    selectedPartner
                  ) ? (
                    <CheckCircle size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}

                  {getPartnerStatus(
                    selectedPartner
                  )
                    ? 'Active'
                    : 'Inactive'}
                </span>
              </div>
            </div>

            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <User
                  size={18}
                  color="#ff4757"
                />

                <div>
                  <span style={styles.detailLabel}>
                    Partner ID
                  </span>

                  <strong style={styles.detailValue}>
                    {getPartnerId(
                      selectedPartner
                    ) || 'Not available'}
                  </strong>
                </div>
              </div>

              <div style={styles.detailItem}>
                <Mail
                  size={18}
                  color="#ff4757"
                />

                <div>
                  <span style={styles.detailLabel}>
                    Email
                  </span>

                  <strong style={styles.detailValue}>
                    {getPartnerEmail(
                      selectedPartner
                    )}
                  </strong>
                </div>
              </div>

              <div style={styles.detailItem}>
                <Phone
                  size={18}
                  color="#ff4757"
                />

                <div>
                  <span style={styles.detailLabel}>
                    Phone
                  </span>

                  <strong style={styles.detailValue}>
                    {getPartnerPhone(
                      selectedPartner
                    )}
                  </strong>
                </div>
              </div>

              <div style={styles.detailItem}>
                <ShieldCheck
                  size={18}
                  color="#ff4757"
                />

                <div>
                  <span style={styles.detailLabel}>
                    Account Type
                  </span>

                  <strong style={styles.detailValue}>
                    Delivery Partner
                  </strong>
                </div>
              </div>

              <div style={styles.detailItem}>
                <CheckCircle
                  size={18}
                  color="#ff4757"
                />

                <div>
                  <span style={styles.detailLabel}>
                    Joined
                  </span>

                  <strong style={styles.detailValue}>
                    {formatDate(
                      getPartnerCreatedAt(
                        selectedPartner
                      )
                    )}
                  </strong>
                </div>
              </div>

              {getPartnerAddress(
                selectedPartner
              ) && (
                <div
                  style={{
                    ...styles.detailItem,
                    gridColumn: '1 / -1'
                  }}
                >
                  <MapPin
                    size={18}
                    color="#ff4757"
                  />

                  <div>
                    <span style={styles.detailLabel}>
                      Address
                    </span>

                    <strong
                      style={styles.detailValue}
                    >
                      {getPartnerAddress(
                        selectedPartner
                      )}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() =>
                  togglePartnerStatus(
                    selectedPartner
                  )
                }
                disabled={
                  updatingId !== null
                }
                style={{
                  ...styles.modalStatusBtn,
                  ...(getPartnerStatus(
                    selectedPartner
                  )
                    ? styles.deactivateBtn
                    : styles.activateBtn),
                  ...(updatingId !== null
                    ? styles.disabledButton
                    : {})
                }}
              >
                {updatingId !== null
                  ? 'Updating...'
                  : getPartnerStatus(
                        selectedPartner
                      )
                    ? 'Deactivate Partner'
                    : 'Activate Partner'}
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedPartner(null)
                }
                style={styles.modalCloseBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px'
  },

  loadingPage: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: '#666',
    fontSize: '16px'
  },

  loadingIcon: {
    animation: 'spin 1s linear infinite'
  },

  header: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '24px'
  },

  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '9px 14px',
    backgroundColor: '#f1f3f5',
    color: '#495057',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '18px',
    fontSize: '14px',
    fontWeight: '600'
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  titleIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0f1',
    color: '#ff4757',
    flexShrink: 0
  },

  title: {
    margin: 0,
    fontSize: '28px',
    lineHeight: 1.2,
    color: '#212529',
    fontWeight: '700'
  },

  subtitle: {
    margin: '7px 0 0',
    color: '#6c757d',
    fontSize: '14px'
  },

  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minWidth: '110px',
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    color: '#495057',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },

  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },

  spinIcon: {
    animation: 'spin 1s linear infinite'
  },

  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    marginBottom: '20px',
    backgroundColor: '#fff5f5',
    color: '#842029',
    border: '1px solid #f5c2c7',
    borderRadius: '10px'
  },

  errorContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    fontSize: '13px'
  },

  retryBtn: {
    padding: '7px 13px',
    backgroundColor: '#842029',
    color: '#ffffff',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    fontWeight: '600'
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },

  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    boxShadow:
      '0 2px 8px rgba(0, 0, 0, 0.04)'
  },

  summaryIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  summaryLabel: {
    display: 'block',
    marginBottom: '4px',
    color: '#6c757d',
    fontSize: '13px'
  },

  summaryValue: {
    display: 'block',
    color: '#212529',
    fontSize: '24px',
    lineHeight: 1.1
  },

  filterCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    padding: '16px',
    marginBottom: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #e9ecef',
    borderRadius: '12px'
  },

  searchBox: {
    flex: '1 1 350px',
    minWidth: '250px',
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '0 13px',
    height: '42px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px'
  },

  searchInput: {
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: '#212529',
    fontSize: '14px'
  },

  filterSelect: {
    height: '42px',
    padding: '0 12px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#495057',
    cursor: 'pointer',
    fontSize: '14px'
  },

  clearBtn: {
    height: '42px',
    padding: '0 14px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#6c757d',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },

  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow:
      '0 2px 10px rgba(0, 0, 0, 0.04)'
  },

  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    borderBottom: '1px solid #e9ecef'
  },

  tableTitle: {
    margin: 0,
    color: '#212529',
    fontSize: '18px',
    fontWeight: '700'
  },

  tableSubtitle: {
    margin: '5px 0 0',
    color: '#6c757d',
    fontSize: '13px'
  },

  tableWrapper: {
    width: '100%',
    overflowX: 'auto'
  },

  table: {
    width: '100%',
    minWidth: '900px',
    borderCollapse: 'collapse'
  },

  th: {
    padding: '13px 16px',
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    textAlign: 'left',
    borderBottom: '1px solid #e9ecef',
    whiteSpace: 'nowrap'
  },

  tr: {
    cursor: 'pointer',
    borderBottom: '1px solid #f1f3f5'
  },

  td: {
    padding: '15px 16px',
    color: '#495057',
    fontSize: '14px',
    verticalAlign: 'middle'
  },

  partnerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px'
  },

  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0f1',
    color: '#ff4757',
    fontWeight: '700',
    flexShrink: 0
  },

  partnerName: {
    display: 'block',
    color: '#212529',
    fontSize: '14px'
  },

  partnerId: {
    display: 'block',
    marginTop: '3px',
    color: '#868e96',
    fontSize: '11px'
  },

  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 9px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },

  activeBadge: {
    backgroundColor: '#eaf8ef',
    color: '#198754'
  },

  inactiveBadge: {
    backgroundColor: '#fdecec',
    color: '#dc3545'
  },

  actionBtn: {
    padding: '7px 12px',
    border: 'none',
    borderRadius: '7px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },

  activateBtn: {
    backgroundColor: '#28a745'
  },

  deactivateBtn: {
    backgroundColor: '#dc3545'
  },

  emptyState: {
    padding: '70px 20px',
    textAlign: 'center',
    color: '#6c757d'
  },

  emptyIcon: {
    width: '64px',
    height: '64px',
    margin: '0 auto 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: '#f8f9fa',
    color: '#adb5bd'
  },

  emptyStateHeading: {
    margin: 0
  },

  emptyAction: {
    marginTop: '12px',
    padding: '9px 15px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#ff4757',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: '600'
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.55)'
  },

  modal: {
    width: '100%',
    maxWidth: '680px',
    maxHeight: '90vh',
    overflowY: 'auto',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    boxShadow:
      '0 20px 60px rgba(0, 0, 0, 0.2)'
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '20px',
    padding: '20px',
    borderBottom: '1px solid #e9ecef'
  },

  modalTitle: {
    margin: 0,
    color: '#212529',
    fontSize: '20px'
  },

  modalSubtitle: {
    margin: '5px 0 0',
    color: '#6c757d',
    fontSize: '13px'
  },

  closeBtn: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa',
    color: '#495057',
    cursor: 'pointer'
  },

  modalProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '20px',
    backgroundColor: '#fffafa',
    borderBottom: '1px solid #f1f3f5'
  },

  largeAvatar: {
    width: '58px',
    height: '58px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: '#fff0f1',
    color: '#ff4757',
    fontSize: '22px',
    fontWeight: '700'
  },

  profileName: {
    margin: '0 0 8px',
    color: '#212529',
    fontSize: '20px'
  },

  detailsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '18px',
    padding: '22px'
  },

  detailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px'
  },

  detailLabel: {
    display: 'block',
    marginBottom: '4px',
    color: '#868e96',
    fontSize: '12px'
  },

  detailValue: {
    display: 'block',
    color: '#343a40',
    fontSize: '14px',
    wordBreak: 'break-word'
  },

  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '16px 20px',
    borderTop: '1px solid #e9ecef'
  },

  modalStatusBtn: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },

  modalCloseBtn: {
    padding: '10px 15px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#495057',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  }
};