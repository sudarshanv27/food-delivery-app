// src/pages/Users.js

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Search,
  RefreshCw,
  Eye,
  X,
  Power,
  AlertCircle
} from 'lucide-react';

import toast from 'react-hot-toast';
import API from '../services/api';

// ======================================================
// USER TYPES
// ======================================================

const USER_TYPES = [
  'customer',
  'restaurant_owner',
  'restaurant',
  'delivery',
  'admin'
];

// ======================================================
// USERS
// ======================================================

const Users = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] =
    useState('all');
  const [statusFilter, setStatusFilter] =
    useState('all');

  const [selectedUser, setSelectedUser] =
    useState(null);

  // ======================================================
  // FETCH USERS
  // ======================================================

  const fetchUsers = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const response =
          await API.get('/admin/users');

        const data = response?.data;

        if (!data?.success) {
          throw new Error(
            data?.message ||
              'Failed to load users.'
          );
        }

        const usersData =
          data?.data ||
          data?.users ||
          [];

        setUsers(
          Array.isArray(usersData)
            ? usersData
            : []
        );

      } catch (err) {
        console.error(
          'FoodieDash users error:',
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load users.';

        setError(message);

        toast.error(message);

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ======================================================
  // HELPERS
  // ======================================================

  const getUserId = (user) => {
    return (
      user?.user_id ||
      user?.id ||
      user?._id ||
      null
    );
  };

  const getUserName = (user) => {
    return (
      user?.full_name ||
      user?.name ||
      user?.username ||
      'Unnamed User'
    );
  };

  const getUserEmail = (user) => {
    return (
      user?.email ||
      '—'
    );
  };

  const getUserPhone = (user) => {
    return (
      user?.phone ||
      user?.phone_number ||
      '—'
    );
  };

  const getUserType = (user) => {
    return String(
      user?.user_type ||
      user?.type ||
      user?.role ||
      'unknown'
    ).toLowerCase();
  };

  const getTypeLabel = (type) => {
    const labels = {
      customer:
        'Customer',

      restaurant_owner:
        'Restaurant Owner',

      restaurant:
        'Restaurant',

      delivery:
        'Delivery Partner',

      delivery_partner:
        'Delivery Partner',

      admin:
        'Admin'
    };

    return (
      labels[type] ||
      String(type || 'Unknown')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        )
    );
  };

  const isUserActive = (user) => {
    return (
      user?.is_active === true ||
      user?.is_active === 'true' ||
      user?.is_active === 1 ||
      user?.is_active === '1'
    );
  };

  const isUserVerified = (user) => {
    return (
      user?.is_verified === true ||
      user?.is_verified === 'true' ||
      user?.is_verified === 1 ||
      user?.is_verified === '1'
    );
  };

  const getUserStatus = (user) => {
    return isUserActive(user)
      ? 'Active'
      : 'Inactive';
  };

  const formatDate = (value) => {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  };

  // ======================================================
  // FILTER USERS
  // ======================================================

  const filteredUsers = useMemo(() => {
    const searchTerm =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const name =
        getUserName(user)
          .toLowerCase();

      const email =
        getUserEmail(user)
          .toLowerCase();

      const phone =
        getUserPhone(user)
          .toLowerCase();

      const type =
        getUserType(user)
          .toLowerCase();

      const typeLabel =
        getTypeLabel(type)
          .toLowerCase();

      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm) ||
        email.includes(searchTerm) ||
        phone.includes(searchTerm) ||
        type.includes(searchTerm) ||
        typeLabel.includes(searchTerm);

      const matchesType =
        typeFilter === 'all' ||
        type ===
          String(typeFilter)
            .toLowerCase();

      const active =
        isUserActive(user);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' &&
          active) ||
        (statusFilter === 'inactive' &&
          !active);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    typeFilter,
    statusFilter
  ]);

  // ======================================================
  // UPDATE USER STATUS
  // ======================================================

  const updateStatus = async (user) => {
    const userId =
      getUserId(user);

    if (!userId) {
      toast.error(
        'User ID not found.'
      );
      return;
    }

    if (updatingId) {
      return;
    }

    const currentStatus =
      isUserActive(user);

    const nextStatus =
      !currentStatus;

    const action =
      nextStatus
        ? 'activate'
        : 'deactivate';

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} "${getUserName(
          user
        )}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(userId);

      const response =
        await API.put(
          `/admin/users/${userId}/status`,
          {
            is_active:
              nextStatus
          }
        );

      if (!response?.data?.success) {
        throw new Error(
          response?.data?.message ||
            'Failed to update user status.'
        );
      }

      toast.success(
        `User ${
          nextStatus
            ? 'activated'
            : 'deactivated'
        } successfully.`
      );

      await fetchUsers(true);

      if (
        selectedUser &&
        getUserId(
          selectedUser
        ) === userId
      ) {
        setSelectedUser(null);
      }

    } catch (err) {
      console.error(
        'Failed to update user:',
        err
      );

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to update user.'
      );

    } finally {
      setUpdatingId(null);
    }
  };

  // ======================================================
  // CLEAR FILTERS
  // ======================================================

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const closeModal = () => {
    setSelectedUser(null);
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div
        style={styles.loading}
        role="status"
        aria-live="polite"
      >
        <RefreshCw
          size={28}
          style={styles.spinning}
          aria-hidden="true"
        />

        <p>
          Loading users...
        </p>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div
      className="page-container"
      style={styles.page}
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <div style={styles.header}>

        <div>
          <h1 style={styles.heading}>
            Users
          </h1>

          <p style={styles.subHeading}>
            Manage platform users and
            accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            fetchUsers(true)
          }
          disabled={refreshing}
          style={{
            ...styles.refreshButton,
            ...(refreshing
              ? styles.disabledButton
              : {})
          }}
          aria-busy={refreshing}
        >
          <RefreshCw
            size={17}
            style={
              refreshing
                ? styles.spinning
                : undefined
            }
            aria-hidden="true"
          />

          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </button>

      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div
          style={styles.errorBanner}
          role="alert"
        >
          <AlertCircle
            size={18}
            aria-hidden="true"
          />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              fetchUsers()
            }
            style={
              styles.retryButton
            }
          >
            Retry
          </button>
        </div>
      )}

      {/* ==================================================
          FILTERS
      ================================================== */}

      <div style={styles.filters}>

        {/* SEARCH */}

        <div
          style={
            styles.searchContainer
          }
        >
          <Search
            size={18}
            style={
              styles.searchIcon
            }
            aria-hidden="true"
          />

          <input
            type="search"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={
              styles.searchInput
            }
            aria-label="Search users"
          />
        </div>

        {/* USER TYPE */}

        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(
              e.target.value
            )
          }
          style={styles.select}
          aria-label="Filter users by type"
        >
          <option value="all">
            All Types
          </option>

          {USER_TYPES.map(
            (type) => (
              <option
                key={type}
                value={type}
              >
                {getTypeLabel(type)}
                {type ===
                  'customer'
                  ? 's'
                  : ''}
              </option>
            )
          )}
        </select>

        {/* STATUS */}

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          style={styles.select}
          aria-label="Filter users by status"
        >
          <option value="all">
            All Status
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>

        {/* CLEAR */}

        {(search ||
          typeFilter !== 'all' ||
          statusFilter !== 'all') && (
          <button
            type="button"
            onClick={
              clearFilters
            }
            style={
              styles.clearButton
            }
          >
            Clear Filters
          </button>
        )}

      </div>

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div style={styles.summary}>
        Showing{' '}
        <strong>
          {filteredUsers.length}
        </strong>{' '}
        of{' '}
        <strong>
          {users.length}
        </strong>{' '}
        users
      </div>

      {/* ==================================================
          USERS TABLE
      ================================================== */}

      <div
        style={
          styles.tableCard
        }
      >

        {filteredUsers.length ===
        0 ? (

          <div
            style={
              styles.emptyState
            }
          >
            <div
              style={
                styles.emptyIcon
              }
            >
              👤
            </div>

            <h3>
              No users found
            </h3>

            <p>
              Try changing your
              search or filters.
            </p>

            {(search ||
              typeFilter !==
                'all' ||
              statusFilter !==
                'all') && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                style={
                  styles.clearButton
                }
              >
                Clear Filters
              </button>
            )}
          </div>

        ) : (

          <div
            style={
              styles.tableWrapper
            }
          >
            <table
              style={styles.table}
            >

              <thead>

                <tr
                  style={
                    styles.tableHeaderRow
                  }
                >
                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    User
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Phone
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Type
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Status
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Verified
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Created
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Action
                  </th>
                </tr>

              </thead>

              <tbody>

                {filteredUsers.map(
                  (user, index) => {

                    const userId =
                      getUserId(
                        user
                      ) ||
                      `user-${index}`;

                    const name =
                      getUserName(
                        user
                      );

                    const email =
                      getUserEmail(
                        user
                      );

                    const phone =
                      getUserPhone(
                        user
                      );

                    const type =
                      getUserType(
                        user
                      );

                    const active =
                      isUserActive(
                        user
                      );

                    const verified =
                      isUserVerified(
                        user
                      );

                    const isUpdating =
                      updatingId ===
                      userId;

                    return (
                      <tr
                        key={userId}
                        style={
                          styles.tableRow
                        }
                      >

                        {/* USER */}

                        <td
                          style={
                            styles.tableCell
                          }
                        >

                          <div
                            style={
                              styles.userCell
                            }
                          >

                            <div
                              style={
                                styles.avatar
                              }
                            >
                              {name
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {name}
                              </strong>

                              <div
                                style={
                                  styles.email
                                }
                              >
                                {email}
                              </div>
                            </div>

                          </div>

                        </td>

                        {/* PHONE */}

                        <td
                          style={
                            styles.tableCell
                          }
                        >
                          {phone}
                        </td>

                        {/* TYPE */}

                        <td
                          style={
                            styles.tableCell
                          }
                        >
                          <span
                            style={
                              styles.typeBadge
                            }
                          >
                            {getTypeLabel(
                              type
                            )}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td
                          style={
                            styles.tableCell
                          }
                        >
                          <span
                            style={{
                              ...styles.statusBadge,
                              ...(active
                                ? styles.activeBadge
                                : styles.inactiveBadge)
                            }}
                          >
                            {getUserStatus(
                              user
                            )}
                          </span>
                        </td>

                        {/* VERIFIED */}

                        <td
                          style={
                            styles.tableCell
                          }
                        >
                          <span
                            style={{
                              ...styles.verifiedBadge,
                              ...(verified
                                ? styles.verified
                                : styles.notVerified)
                            }}
                          >
                            {verified
                              ? '✓ Verified'
                              : 'Not Verified'}
                          </span>
                        </td>

                        {/* CREATED */}

                        <td
                          style={
                            styles.tableCell
                          }
                        >
                          {formatDate(
                            user?.created_at ||
                            user?.createdAt
                          )}
                        </td>

                        {/* ACTION */}

                        <td
                          style={
                            styles.tableCell
                          }
                        >
                          <div
                            style={
                              styles.actions
                            }
                          >

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedUser(
                                  user
                                )
                              }
                              title="View user"
                              aria-label={`View ${name}`}
                              style={
                                styles.iconButton
                              }
                            >
                              <Eye
                                size={16}
                                aria-hidden="true"
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(
                                  user
                                )
                              }
                              disabled={
                                Boolean(
                                  updatingId
                                )
                              }
                              title={
                                active
                                  ? 'Deactivate user'
                                  : 'Activate user'
                              }
                              aria-label={
                                active
                                  ? `Deactivate ${name}`
                                  : `Activate ${name}`
                              }
                              style={{
                                ...styles.iconButton,
                                ...(isUpdating
                                  ? styles.disabledButton
                                  : {})
                              }}
                            >
                              <Power
                                size={16}
                                aria-hidden="true"
                              />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* ==================================================
          USER DETAILS MODAL
      ================================================== */}

      {selectedUser && (
        <div
          style={
            styles.overlay
          }
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeModal();
            }
          }}
          role="presentation"
        >

          <div
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-details-title"
          >

            {/* HEADER */}

            <div
              style={
                styles.modalHeader
              }
            >

              <div
                style={
                  styles.modalUser
                }
              >

                <div
                  style={
                    styles.modalAvatar
                  }
                >
                  {getUserName(
                    selectedUser
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h2
                    id="user-details-title"
                    style={
                      styles.modalTitle
                    }
                  >
                    {getUserName(
                      selectedUser
                    )}
                  </h2>

                  <p
                    style={
                      styles.modalSubtitle
                    }
                  >
                    {getTypeLabel(
                      getUserType(
                        selectedUser
                      )
                    )}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                style={
                  styles.closeButton
                }
                aria-label="Close user details"
              >
                <X
                  size={20}
                  aria-hidden="true"
                />
              </button>

            </div>

            {/* DETAILS */}

            <div
              style={
                styles.detailGrid
              }
            >

              <Detail
                label="User ID"
                value={
                  getUserId(
                    selectedUser
                  ) || '—'
                }
              />

              <Detail
                label="Full Name"
                value={
                  getUserName(
                    selectedUser
                  )
                }
              />

              <Detail
                label="Email"
                value={
                  getUserEmail(
                    selectedUser
                  )
                }
              />

              <Detail
                label="Phone"
                value={
                  getUserPhone(
                    selectedUser
                  )
                }
              />

              <Detail
                label="User Type"
                value={getTypeLabel(
                  getUserType(
                    selectedUser
                  )
                )}
              />

              <Detail
                label="Status"
                value={getUserStatus(
                  selectedUser
                )}
              />

              <Detail
                label="Verified"
                value={
                  isUserVerified(
                    selectedUser
                  )
                    ? 'Yes'
                    : 'No'
                }
              />

              <Detail
                label="Created"
                value={formatDate(
                  selectedUser?.created_at ||
                  selectedUser?.createdAt
                )}
              />

              <Detail
                label="Updated"
                value={formatDate(
                  selectedUser?.updated_at ||
                  selectedUser?.updatedAt
                )}
              />

            </div>

            {/* ADDITIONAL INFORMATION */}

            {(selectedUser?.address ||
              selectedUser?.city ||
              selectedUser?.state ||
              selectedUser?.pincode) && (

              <div
                style={
                  styles.additionalDetails
                }
              >

                <Detail
                  label="Address"
                  value={
                    selectedUser?.address ||
                    '—'
                  }
                />

                <Detail
                  label="Location"
                  value={[
                    selectedUser?.city,
                    selectedUser?.state,
                    selectedUser?.pincode
                  ]
                    .filter(Boolean)
                    .join(', ') ||
                    '—'}
                />

              </div>
            )}

            {/* FOOTER */}

            <div
              style={
                styles.modalFooter
              }
            >

              <button
                type="button"
                onClick={() =>
                  updateStatus(
                    selectedUser
                  )
                }
                disabled={
                  Boolean(updatingId)
                }
                style={
                  styles.statusActionButton
                }
              >
                <Power
                  size={17}
                  aria-hidden="true"
                />

                {isUserActive(
                  selectedUser
                )
                  ? 'Deactivate User'
                  : 'Activate User'}
              </button>

              <button
                type="button"
                onClick={
                  closeModal
                }
                style={
                  styles.secondaryButton
                }
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// ======================================================
// DETAIL COMPONENT
// ======================================================

const Detail = ({
  label,
  value
}) => {
  return (
    <div>
      <span
        style={
          styles.detailLabel
        }
      >
        {label}
      </span>

      <strong
        style={
          styles.detailValue
        }
      >
        {value || '—'}
      </strong>
    </div>
  );
};

// ======================================================
// STYLES
// ======================================================

const styles = {

  page: {
    padding: '24px',
    background: '#f5f6fa',
    minHeight: '100vh',
    boxSizing: 'border-box'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },

  heading: {
    margin: 0,
    fontSize: '30px',
    color: '#2c3e50'
  },

  subHeading: {
    marginTop: '7px',
    color: '#666',
    fontSize: '14px'
  },

  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: '600'
  },

  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },

  spinning: {
    animation:
      'spin 1s linear infinite'
  },

  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    marginBottom: '18px',
    background: '#fff1f2',
    border: '1px solid #fecdd3',
    borderRadius: '10px',
    color: '#b42318'
  },

  retryButton: {
    marginLeft: 'auto',
    border: 'none',
    background: 'transparent',
    color: '#b42318',
    fontWeight: '700',
    cursor: 'pointer'
  },

  filters: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap'
  },

  searchContainer: {
    position: 'relative',
    flex: 1,
    minWidth: '260px'
  },

  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform:
      'translateY(-50%)',
    color: '#888'
  },

  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding:
      '11px 12px 11px 40px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    fontSize: '14px',
    background: '#fff'
  },

  select: {
    padding: '10px 14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px'
  },

  clearButton: {
    padding: '10px 14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: '600'
  },

  summary: {
    color: '#777',
    fontSize: '13px',
    marginBottom: '12px'
  },

  tableCard: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e5e5',
    overflow: 'hidden'
  },

  tableWrapper: {
    width: '100%',
    overflowX: 'auto'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },

  tableHeaderRow: {
    background: '#f8f9fa'
  },

  tableHeader: {
    textAlign: 'left',
    padding: '14px 16px',
    borderBottom:
      '1px solid #e5e5e5',
    fontSize: '13px',
    color: '#666',
    whiteSpace: 'nowrap'
  },

  tableRow: {
    borderBottom:
      '1px solid #eee'
  },

  tableCell: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#2c3e50',
    verticalAlign: 'middle'
  },

  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: '210px'
  },

  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: '#f1f2f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    color: '#555',
    flexShrink: 0
  },

  email: {
    marginTop: '4px',
    fontSize: '12px',
    color: '#777'
  },

  typeBadge: {
    display: 'inline-block',
    padding: '5px 10px',
    borderRadius: '20px',
    background: '#f1f3f5',
    fontSize: '12px',
    fontWeight: '600'
  },

  statusBadge: {
    display: 'inline-block',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },

  activeBadge: {
    background: '#e8f7ee',
    color: '#16834b'
  },

  inactiveBadge: {
    background: '#f1f1f1',
    color: '#666'
  },

  verifiedBadge: {
    display: 'inline-block',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },

  verified: {
    background: '#e8f7ee',
    color: '#16834b'
  },

  notVerified: {
    background: '#fff3cd',
    color: '#856404'
  },

  actions: {
    display: 'flex',
    gap: '8px'
  },

  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    border: '1px solid #ddd',
    background: '#fff',
    borderRadius: '7px',
    cursor: 'pointer'
  },

  emptyState: {
    padding: '60px 30px',
    textAlign: 'center',
    color: '#777'
  },

  emptyIcon: {
    fontSize: '40px',
    marginBottom: '10px'
  },

  loading: {
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#666'
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    background:
      'rgba(0,0,0,0.45)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box'
  },

  modal: {
    width: '100%',
    maxWidth: '760px',
    maxHeight: '88vh',
    overflowY: 'auto',
    background: '#fff',
    borderRadius: '14px',
    padding: '24px',
    boxSizing: 'border-box',
    boxShadow:
      '0 20px 60px rgba(0,0,0,0.25)'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    paddingBottom: '18px',
    marginBottom: '22px',
    borderBottom:
      '1px solid #eee'
  },

  modalUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  modalAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#f1f2f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '18px',
    color: '#555'
  },

  modalTitle: {
    margin: 0,
    fontSize: '22px',
    color: '#2c3e50'
  },

  modalSubtitle: {
    margin: '5px 0 0',
    color: '#888',
    fontSize: '13px'
  },

  closeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: '#f1f2f6',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    cursor: 'pointer'
  },

  detailGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '20px'
  },

  detailLabel: {
    display: 'block',
    marginBottom: '5px',
    color: '#888',
    fontSize: '12px'
  },

  detailValue: {
    color: '#2c3e50',
    wordBreak: 'break-word'
  },

  additionalDetails: {
    display: 'grid',
    gap: '20px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop:
      '1px solid #eee'
  },

  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop:
      '1px solid #eee'
  },

  statusActionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 14px',
    border: 'none',
    borderRadius: '8px',
    background: '#ff4757',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '600'
  },

  secondaryButton: {
    padding: '10px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: '600'
  }
};

export default Users;