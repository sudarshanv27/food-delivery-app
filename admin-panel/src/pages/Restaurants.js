// src/pages/Restaurants.js

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
// RESTAURANTS
// ======================================================

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedRestaurant, setSelectedRestaurant] =
    useState(null);

  // ======================================================
  // FETCH RESTAURANTS
  // ======================================================

  const fetchRestaurants = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const response = await API.get(
          '/admin/restaurants'
        );

        const data = response?.data;

        if (!data?.success) {
          throw new Error(
            data?.message ||
              'Failed to load restaurants.'
          );
        }

        const restaurantData =
          data?.data ||
          data?.restaurants ||
          [];

        setRestaurants(
          Array.isArray(restaurantData)
            ? restaurantData
            : []
        );

      } catch (err) {
        console.error(
          'FoodieDash restaurants error:',
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load restaurants.';

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
    fetchRestaurants();
  }, [fetchRestaurants]);

  // ======================================================
  // HELPERS
  // ======================================================

  const isRestaurantActive = (restaurant) => {
    return (
      restaurant?.is_active === true ||
      restaurant?.is_active === 'true' ||
      restaurant?.is_active === 1 ||
      restaurant?.is_active === '1'
    );
  };

  const getRestaurantId = (restaurant) => {
    return (
      restaurant?.restaurant_id ||
      restaurant?.id ||
      restaurant?._id ||
      null
    );
  };

  const getRestaurantName = (restaurant) => {
    return (
      restaurant?.name ||
      restaurant?.restaurant_name ||
      'Unnamed Restaurant'
    );
  };

  const getOwnerName = (restaurant) => {
    return (
      restaurant?.owner_name ||
      restaurant?.owner ||
      restaurant?.ownerName ||
      '—'
    );
  };

  const getCuisineText = (restaurant) => {
    const cuisines =
      restaurant?.cuisine_types ??
      restaurant?.cuisines ??
      '';

    if (Array.isArray(cuisines)) {
      return cuisines.length
        ? cuisines.join(', ')
        : '—';
    }

    return String(cuisines || '—');
  };

  const getRating = (restaurant) => {
    const value =
      restaurant?.avg_rating ??
      restaurant?.rating ??
      0;

    const rating = Number(value);

    return Number.isFinite(rating)
      ? rating
      : 0;
  };

  const getDeliveryFee = (restaurant) => {
    return (
      restaurant?.delivery_fee ??
      restaurant?.deliveryFee ??
      0
    );
  };

  const formatCurrency = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return '₹0.00';
    }

    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
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

  const getRestaurantStatus = (restaurant) => {
    return isRestaurantActive(restaurant)
      ? 'Active'
      : 'Inactive';
  };

  // ======================================================
  // FILTER RESTAURANTS
  // ======================================================

  const filteredRestaurants = useMemo(() => {
    const searchTerm = search
      .trim()
      .toLowerCase();

    return restaurants.filter(
      (restaurant) => {
        const name =
          getRestaurantName(
            restaurant
          ).toLowerCase();

        const owner =
          getOwnerName(
            restaurant
          ).toLowerCase();

        const cuisine =
          getCuisineText(
            restaurant
          ).toLowerCase();

        const address =
          String(
            restaurant?.address || ''
          ).toLowerCase();

        const matchesSearch =
          !searchTerm ||
          name.includes(searchTerm) ||
          owner.includes(searchTerm) ||
          cuisine.includes(searchTerm) ||
          address.includes(searchTerm);

        const active =
          isRestaurantActive(
            restaurant
          );

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' &&
            active) ||
          (statusFilter === 'inactive' &&
            !active);

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    restaurants,
    search,
    statusFilter
  ]);

  // ======================================================
  // UPDATE RESTAURANT STATUS
  // ======================================================

  const updateStatus = async (
    restaurant
  ) => {
    const restaurantId =
      getRestaurantId(
        restaurant
      );

    if (!restaurantId) {
      toast.error(
        'Restaurant ID not found.'
      );
      return;
    }

    if (updatingId) {
      return;
    }

    const currentStatus =
      isRestaurantActive(
        restaurant
      );

    const nextStatus =
      !currentStatus;

    const action =
      nextStatus
        ? 'activate'
        : 'deactivate';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${getRestaurantName(
        restaurant
      )}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(
        restaurantId
      );

      const response =
        await API.put(
          `/admin/restaurants/${restaurantId}/status`,
          {
            is_active: nextStatus
          }
        );

      if (!response?.data?.success) {
        throw new Error(
          response?.data?.message ||
            'Failed to update restaurant status.'
        );
      }

      toast.success(
        `Restaurant ${
          nextStatus
            ? 'activated'
            : 'deactivated'
        } successfully.`
      );

      // Refresh the restaurant list so the UI
      // reflects the actual backend state.
      await fetchRestaurants(
        true
      );

      if (
        selectedRestaurant &&
        getRestaurantId(
          selectedRestaurant
        ) === restaurantId
      ) {
        setSelectedRestaurant(
          null
        );
      }

    } catch (err) {
      console.error(
        'Failed to update restaurant:',
        err
      );

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to update restaurant.'
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
    setStatusFilter('all');
  };

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const closeModal = () => {
    setSelectedRestaurant(
      null
    );
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
          Loading restaurants...
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
            Restaurants
          </h1>

          <p style={styles.subHeading}>
            Manage restaurants registered
            on the FoodieDash platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            fetchRestaurants(true)
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
              fetchRestaurants()
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

      <div
        style={styles.filters}
      >

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
            placeholder="Search restaurants, owners, cuisine..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={
              styles.searchInput
            }
            aria-label="Search restaurants"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          style={styles.select}
          aria-label="Filter restaurants by status"
        >
          <option value="all">
            All Restaurants
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>

        {(search ||
          statusFilter !== 'all') && (
          <button
            type="button"
            onClick={clearFilters}
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

      <div
        style={
          styles.summary
        }
      >
        Showing{' '}
        <strong>
          {filteredRestaurants.length}
        </strong>{' '}
        of{' '}
        <strong>
          {restaurants.length}
        </strong>{' '}
        restaurants
      </div>

      {/* ==================================================
          RESTAURANT TABLE
      ================================================== */}

      <div
        style={styles.tableCard}
      >

        {filteredRestaurants.length ===
        0 ? (

          <div
            style={
              styles.emptyState
            }
          >
            <StoreEmptyIcon />

            <h3>
              No restaurants found
            </h3>

            <p>
              Try changing your
              search or status filter.
            </p>

            {(search ||
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
                    Restaurant
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Owner
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Cuisine
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Rating
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Delivery Fee
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
                {filteredRestaurants.map(
                  (
                    restaurant,
                    index
                  ) => {
                    const restaurantId =
                      getRestaurantId(
                        restaurant
                      ) ||
                      `restaurant-${index}`;

                    const name =
                      getRestaurantName(
                        restaurant
                      );

                    const owner =
                      getOwnerName(
                        restaurant
                      );

                    const cuisines =
                      getCuisineText(
                        restaurant
                      );

                    const rating =
                      getRating(
                        restaurant
                      );

                    const deliveryFee =
                      getDeliveryFee(
                        restaurant
                      );

                    const active =
                      isRestaurantActive(
                        restaurant
                      );

                    const isUpdating =
                      updatingId ===
                      restaurantId;

                    return (
                      <tr
                        key={
                          restaurantId
                        }
                        style={
                          styles.tableRow
                        }
                      >

                        {/* RESTAURANT */}

                        <td
                          style={
                            styles.tableCell
                          }
                        >
                          <strong>
                            {name}
                          </strong>

                          {restaurant?.address && (
                            <div
                              style={
                                styles.address
                              }
                            >
                              {
                                restaurant.address
                              }
                            </div>
                          )}
                        </td>

                        {/* OWNER */}

                        <td
                          style={
                            styles.tableCell
                          }
                        >
                          {owner}
                        </td>

                        {/* CUISINE */}

                        <td
                          style={
                            styles.tableCell
                          }
                        >
                          {cuisines}
                        </td>

                        {/* RATING */}

                        <td
                          style={
                            styles.tableCell
                          }
                        >
                          <span
                            style={
                              styles.rating
                            }
                          >
                            ⭐
                          </span>{' '}
                          {rating.toFixed(1)}
                        </td>

                        {/* DELIVERY FEE */}

                        <td
                          style={
                            styles.tableCell
                          }
                        >
                          {formatCurrency(
                            deliveryFee
                          )}
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
                            {active
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </td>

                        {/* CREATED */}

                        <td
                          style={
                            styles.tableCell
                          }
                        >
                          {formatDate(
                            restaurant?.created_at ||
                            restaurant?.createdAt
                          )}
                        </td>

                        {/* ACTIONS */}

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
                                setSelectedRestaurant(
                                  restaurant
                                )
                              }
                              title="View restaurant"
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
                                  restaurant
                                )
                              }
                              disabled={
                                Boolean(
                                  updatingId
                                )
                              }
                              title={
                                active
                                  ? 'Deactivate restaurant'
                                  : 'Activate restaurant'
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
          RESTAURANT DETAILS MODAL
      ================================================== */}

      {selectedRestaurant && (
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
            aria-labelledby="restaurant-details-title"
          >

            {/* MODAL HEADER */}

            <div
              style={
                styles.modalHeader
              }
            >

              <div>
                <h2
                  id="restaurant-details-title"
                  style={
                    styles.modalTitle
                  }
                >
                  {getRestaurantName(
                    selectedRestaurant
                  )}
                </h2>

                <p
                  style={
                    styles.modalSubtitle
                  }
                >
                  Restaurant Details
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                style={
                  styles.closeButton
                }
                aria-label="Close restaurant details"
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
                label="Restaurant ID"
                value={
                  getRestaurantId(
                    selectedRestaurant
                  ) || '—'
                }
              />

              <Detail
                label="Owner"
                value={
                  getOwnerName(
                    selectedRestaurant
                  )
                }
              />

              <Detail
                label="Cuisine"
                value={
                  getCuisineText(
                    selectedRestaurant
                  )
                }
              />

              <Detail
                label="Rating"
                value={getRating(
                  selectedRestaurant
                ).toFixed(1)}
              />

              <Detail
                label="Delivery Fee"
                value={formatCurrency(
                  getDeliveryFee(
                    selectedRestaurant
                  )
                )}
              />

              <Detail
                label="Minimum Order"
                value={formatCurrency(
                  selectedRestaurant
                    ?.min_order_amount ??
                  selectedRestaurant
                    ?.minimum_order ??
                  0
                )}
              />

              <Detail
                label="Estimated Delivery"
                value={
                  selectedRestaurant
                    ?.estimated_delivery_time
                    ? `${selectedRestaurant.estimated_delivery_time} min`
                    : '—'
                }
              />

              <Detail
                label="Status"
                value={getRestaurantStatus(
                  selectedRestaurant
                )}
              />

              <Detail
                label="Created"
                value={formatDate(
                  selectedRestaurant
                    ?.created_at ||
                  selectedRestaurant
                    ?.createdAt
                )}
              />

              <Detail
                label="Address"
                value={
                  selectedRestaurant
                    ?.address || '—'
                }
              />

            </div>

            {/* DESCRIPTION */}

            {selectedRestaurant?.description && (
              <div
                style={
                  styles.description
                }
              >
                <span
                  style={
                    styles.detailLabel
                  }
                >
                  Description
                </span>

                <p>
                  {
                    selectedRestaurant.description
                  }
                </p>
              </div>
            )}

            {/* MODAL ACTION */}

            <div
              style={
                styles.modalFooter
              }
            >
              <button
                type="button"
                onClick={() =>
                  updateStatus(
                    selectedRestaurant
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

                {isRestaurantActive(
                  selectedRestaurant
                )
                  ? 'Deactivate Restaurant'
                  : 'Activate Restaurant'}
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
// EMPTY STATE ICON
// ======================================================

const StoreEmptyIcon = () => {
  return (
    <div
      style={
        styles.emptyIcon
      }
      aria-hidden="true"
    >
      <span>🏪</span>
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

  address: {
    marginTop: '4px',
    color: '#777',
    fontSize: '12px',
    maxWidth: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  rating: {
    fontSize: '13px'
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

  description: {
    marginTop: '24px',
    paddingTop: '20px',
    borderTop:
      '1px solid #eee'
  },

  description: {
    marginTop: '24px',
    paddingTop: '20px',
    borderTop:
      '1px solid #eee',
    color: '#555'
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

export default Restaurants;