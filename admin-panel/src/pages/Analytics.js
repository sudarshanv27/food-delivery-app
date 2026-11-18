// admin-panel/src/pages/Analytics.js

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Activity,
  BarChart3,
  CheckCircle,
  Clock3,
  RefreshCw,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
  Wallet,
  XCircle
} from 'lucide-react';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer
} from 'recharts';

import toast from 'react-hot-toast';

import API from '../services/api';

const DEMO_DAILY_ORDERS = [
  { date: 'Mon', orders: 120 },
  { date: 'Tue', orders: 180 },
  { date: 'Wed', orders: 140 },
  { date: 'Thu', orders: 220 },
  { date: 'Fri', orders: 300 },
  { date: 'Sat', orders: 280 },
  { date: 'Sun', orders: 350 }
];

const DEMO_TOP_DISHES = [
  {
    name: 'Pizza',
    quantity: 400
  },
  {
    name: 'Burger',
    quantity: 250
  },
  {
    name: 'Biryani',
    quantity: 320
  },
  {
    name: 'Pasta',
    quantity: 150
  }
];

const DEMO_USER_GROWTH = [
  { month: 'Jan', count: 200 },
  { month: 'Feb', count: 350 },
  { month: 'Mar', count: 500 },
  { month: 'Apr', count: 750 },
  { month: 'May', count: 1100 }
];

const DEMO_REVENUE_BY_DAY = [
  { date: 'Mon', revenue: 12000 },
  { date: 'Tue', revenue: 18000 },
  { date: 'Wed', revenue: 16000 },
  { date: 'Thu', revenue: 25000 },
  { date: 'Fri', revenue: 32000 },
  { date: 'Sat', revenue: 29000 },
  { date: 'Sun', revenue: 38000 }
];

const DEMO_DELIVERY_PERFORMANCE = {
  totalRevenue: 456789,
  avgDeliveryTime: 28,
  avgRating: 4.6
};

const COLORS = [
  '#ff4757',
  '#2ed573',
  '#1e90ff',
  '#ffa502',
  '#a55de8'
];

const numberFormatter = new Intl.NumberFormat('en-IN');

const formatNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '0';
  }

  return numberFormatter.format(number);
};

const formatCurrency = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '₹0';
  }

  return `₹${numberFormatter.format(number)}`;
};

const formatChartCurrency = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '₹0';
  }

  if (number >= 10000000) {
    return `₹${(number / 10000000).toFixed(1)}Cr`;
  }

  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(1)}L`;
  }

  if (number >= 1000) {
    return `₹${(number / 1000).toFixed(1)}K`;
  }

  return `₹${number}`;
};

const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const Analytics = () => {
  const [dailyOrders, setDailyOrders] = useState(
    DEMO_DAILY_ORDERS
  );

  const [topDishes, setTopDishes] = useState(
    DEMO_TOP_DISHES
  );

  const [userGrowth, setUserGrowth] = useState(
    DEMO_USER_GROWTH
  );

  const [revenueByDay, setRevenueByDay] = useState(
    DEMO_REVENUE_BY_DAY
  );

  const [deliveryPerformance, setDeliveryPerformance] =
    useState(DEMO_DELIVERY_PERFORMANCE);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  /*
   * The current backend contract available to us does not
   * establish a dedicated analytics endpoint.
   *
   * Therefore, we keep the existing demo analytics data
   * until the backend analytics route is verified.
   *
   * This function is intentionally structured so that a
   * verified analytics endpoint can be connected later
   * without rebuilding the page.
   */
  const fetchAnalytics = useCallback(
    async ({ showRefresh = false } = {}) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        /*
         * DEMO MODE
         *
         * Do not pretend these values are live backend
         * analytics. They are fallback/demo values from
         * the original Analytics page.
         */
        setDailyOrders(DEMO_DAILY_ORDERS);
        setTopDishes(DEMO_TOP_DISHES);
        setUserGrowth(DEMO_USER_GROWTH);
        setRevenueByDay(DEMO_REVENUE_BY_DAY);
        setDeliveryPerformance(
          DEMO_DELIVERY_PERFORMANCE
        );
      } catch (err) {
        console.error(
          'FoodieDash Analytics Error:',
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to load analytics.';

        setError(message);

        if (showRefresh) {
          toast.error(message);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAnalytics();

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchAnalytics]);

  const totalOrders = useMemo(() => {
    return dailyOrders.reduce(
      (total, item) =>
        total + (Number(item?.orders) || 0),
      0
    );
  }, [dailyOrders]);

  const totalRevenue = Number(
    deliveryPerformance?.totalRevenue
  ) || 0;

  const latestUserCount =
    Number(
      userGrowth[userGrowth.length - 1]?.count
    ) || 0;

  const averageDeliveryTime =
    Number(
      deliveryPerformance?.avgDeliveryTime
    ) || 0;

  const averageRating =
    Number(deliveryPerformance?.avgRating) || 0;

  const topDish = useMemo(() => {
    if (!topDishes.length) {
      return null;
    }

    return topDishes.reduce((highest, current) => {
      const highestQuantity =
        Number(highest?.quantity) || 0;

      const currentQuantity =
        Number(current?.quantity) || 0;

      return currentQuantity > highestQuantity
        ? current
        : highest;
    }, topDishes[0]);
  }, [topDishes]);

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <RefreshCw
          size={34}
          style={styles.loadingIcon}
          aria-hidden="true"
        />

        <p style={styles.loadingText}>
          Loading analytics...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ================= HEADER ================= */}

      <div style={styles.pageHeader}>
        <div>
          <div style={styles.headingRow}>
            <div style={styles.headingIcon}>
              <BarChart3 size={26} />
            </div>

            <div>
              <h1 style={styles.heading}>
                Analytics Dashboard
              </h1>

              <p style={styles.subtitle}>
                Monitor FoodieDash performance,
                revenue, orders, users, and delivery
                metrics.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            fetchAnalytics({ showRefresh: true })
          }
          disabled={refreshing}
          style={{
            ...styles.refreshButton,
            ...(refreshing
              ? styles.disabledButton
              : {})
          }}
        >
          <RefreshCw
            size={17}
            style={
              refreshing
                ? styles.refreshingIcon
                : undefined
            }
          />

          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </button>
      </div>

      {/* ================= DEMO NOTICE ================= */}

      <div style={styles.demoNotice}>
        <Activity size={18} />

        <div>
          <strong>Analytics preview mode</strong>

          <span>
            The current backend contract does not yet
            define a dedicated analytics endpoint, so
            these charts are using the existing demo
            dataset.
          </span>
        </div>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div style={styles.errorBanner} role="alert">
          <XCircle size={20} />

          <div style={styles.errorContent}>
            <strong>
              Unable to refresh analytics
            </strong>

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchAnalytics({
                showRefresh: true
              })
            }
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      )}

      {/* ================= KPI CARDS ================= */}

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              backgroundColor: '#fff0f1',
              color: '#ff4757'
            }}
          >
            <Wallet size={22} />
          </div>

          <div style={styles.statContent}>
            <span style={styles.statLabel}>
              Total Revenue
            </span>

            <strong style={styles.statValue}>
              {formatCurrency(totalRevenue)}
            </strong>

            <span style={styles.trendUp}>
              ↑ 23% from previous period
            </span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              backgroundColor: '#edf8f1',
              color: '#2ed573'
            }}
          >
            <ShoppingBag size={22} />
          </div>

          <div style={styles.statContent}>
            <span style={styles.statLabel}>
              Weekly Orders
            </span>

            <strong style={styles.statValue}>
              {formatNumber(totalOrders)}
            </strong>

            <span style={styles.trendUp}>
              ↑ Order activity
            </span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              backgroundColor: '#edf5ff',
              color: '#1e90ff'
            }}
          >
            <Users size={22} />
          </div>

          <div style={styles.statContent}>
            <span style={styles.statLabel}>
              Active Users
            </span>

            <strong style={styles.statValue}>
              {formatNumber(latestUserCount)}
            </strong>

            <span style={styles.trendUp}>
              ↑ 12% growth
            </span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              backgroundColor: '#fff6e6',
              color: '#ffa502'
            }}
          >
            <Clock3 size={22} />
          </div>

          <div style={styles.statContent}>
            <span style={styles.statLabel}>
              Avg Delivery Time
            </span>

            <strong style={styles.statValue}>
              {averageDeliveryTime} min
            </strong>

            <span style={styles.trendDown}>
              ↓ 5 min improvement
            </span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              backgroundColor: '#f5efff',
              color: '#a55de8'
            }}
          >
            <Star size={22} />
          </div>

          <div style={styles.statContent}>
            <span style={styles.statLabel}>
              Customer Rating
            </span>

            <strong style={styles.statValue}>
              {averageRating.toFixed(1)} ★
            </strong>

            <span style={styles.trendUp}>
              ↑ 0.2 improvement
            </span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              backgroundColor: '#edf8f1',
              color: '#198754'
            }}
          >
            <TrendingUp size={22} />
          </div>

          <div style={styles.statContent}>
            <span style={styles.statLabel}>
              Top Dish
            </span>

            <strong style={styles.statValueSmall}>
              {topDish?.name || 'N/A'}
            </strong>

            <span style={styles.statMeta}>
              {formatNumber(
                topDish?.quantity || 0
              )}{' '}
              orders
            </span>
          </div>
        </div>
      </div>

      {/* ================= CHARTS ================= */}

      <div style={styles.chartsGrid}>
        {/* DAILY ORDERS */}

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h2 style={styles.chartTitle}>
                Daily Orders
              </h2>

              <p style={styles.chartSubtitle}>
                Order volume by day
              </p>
            </div>

            <ShoppingBag
              size={20}
              color="#ff4757"
            />
          </div>

          <div style={styles.chartContainer}>
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <LineChart
                data={safeArray(dailyOrders)}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 5
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="date" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#ff4757"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* REVENUE */}

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h2 style={styles.chartTitle}>
                Revenue Trend
              </h2>

              <p style={styles.chartSubtitle}>
                Daily revenue performance
              </p>
            </div>

            <Wallet
              size={20}
              color="#2ed573"
            />
          </div>

          <div style={styles.chartContainer}>
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart
                data={safeArray(revenueByDay)}
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 5
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="date" />

                <YAxis
                  tickFormatter={
                    formatChartCurrency
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(value)
                  }
                />

                <Legend />

                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#2ed573"
                  radius={[
                    5,
                    5,
                    0,
                    0
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP DISHES */}

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h2 style={styles.chartTitle}>
                Top Dishes
              </h2>

              <p style={styles.chartSubtitle}>
                Best-performing food items
              </p>
            </div>

            <Star
              size={20}
              color="#ffa502"
            />
          </div>

          <div style={styles.chartContainer}>
            {topDishes.length === 0 ? (
              <div style={styles.noData}>
                No dish data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <PieChart>
                  <Pie
                    data={safeArray(topDishes)}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    dataKey="quantity"
                    nameKey="name"
                    label={(entry) =>
                      entry?.name || ''
                    }
                    labelLine
                  >
                    {topDishes.map(
                      (entry, index) => (
                        <Cell
                          key={`dish-${index}`}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      `${formatNumber(
                        value
                      )} orders`
                    }
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* USER GROWTH */}

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h2 style={styles.chartTitle}>
                User Growth
              </h2>

              <p style={styles.chartSubtitle}>
                Registered user growth
              </p>
            </div>

            <Users
              size={20}
              color="#1e90ff"
            />
          </div>

          <div style={styles.chartContainer}>
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <LineChart
                data={safeArray(userGrowth)}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 5
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip
                  formatter={(value) =>
                    formatNumber(value)
                  }
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="count"
                  name="Users"
                  stroke="#1e90ff"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= PERFORMANCE SUMMARY ================= */}

      <div style={styles.performanceCard}>
        <div style={styles.performanceHeader}>
          <div>
            <h2 style={styles.performanceTitle}>
              Delivery Performance
            </h2>

            <p style={styles.chartSubtitle}>
              Current delivery-related KPIs
            </p>
          </div>

          <Activity
            size={22}
            color="#ff4757"
          />
        </div>

        <div style={styles.performanceGrid}>
          <div style={styles.performanceItem}>
            <Wallet
              size={21}
              color="#2ed573"
            />

            <div>
              <span style={styles.performanceLabel}>
                Total Revenue
              </span>

              <strong
                style={styles.performanceValue}
              >
                {formatCurrency(totalRevenue)}
              </strong>
            </div>
          </div>

          <div style={styles.performanceItem}>
            <Clock3
              size={21}
              color="#ffa502"
            />

            <div>
              <span style={styles.performanceLabel}>
                Average Delivery
              </span>

              <strong
                style={styles.performanceValue}
              >
                {averageDeliveryTime} minutes
              </strong>
            </div>
          </div>

          <div style={styles.performanceItem}>
            <Star
              size={21}
              color="#a55de8"
            />

            <div>
              <span style={styles.performanceLabel}>
                Average Rating
              </span>

              <strong
                style={styles.performanceValue}
              >
                {averageRating.toFixed(1)} / 5
              </strong>
            </div>
          </div>

          <div style={styles.performanceItem}>
            <CheckCircle
              size={21}
              color="#1e90ff"
            />

            <div>
              <span style={styles.performanceLabel}>
                Weekly Orders
              </span>

              <strong
                style={styles.performanceValue}
              >
                {formatNumber(totalOrders)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    background: '#f5f6fa',
    minHeight: '100vh'
  },

  pageHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '22px'
  },

  headingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  headingIcon: {
    width: '52px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '14px',
    backgroundColor: '#fff0f1',
    color: '#ff4757',
    flexShrink: 0
  },

  heading: {
    margin: 0,
    fontSize: '30px',
    lineHeight: 1.2,
    color: '#2c3e50',
    fontWeight: '700'
  },

  subtitle: {
    margin: '7px 0 0',
    color: '#6c757d',
    fontSize: '14px'
  },

  refreshButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minWidth: '110px',
    height: '42px',
    padding: '0 15px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#495057',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },

  refreshingIcon: {
    animation: 'spin 1s linear infinite'
  },

  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },

  demoNotice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '13px 15px',
    marginBottom: '18px',
    backgroundColor: '#fff8e8',
    border: '1px solid #ffe8a1',
    borderRadius: '10px',
    color: '#856404'
  },

  demoNoticeText: {
    display: 'flex',
    flexDirection: 'column'
  },

  demoNoticeStrong: {
    fontSize: '13px'
  },

  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    marginBottom: '18px',
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

  retryButton: {
    padding: '7px 13px',
    backgroundColor: '#842029',
    color: '#ffffff',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    fontWeight: '600'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '22px'
  },

  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minHeight: '108px',
    padding: '18px',
    backgroundColor: '#ffffff',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    boxShadow:
      '0 2px 8px rgba(0, 0, 0, 0.04)'
  },

  statIcon: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    flexShrink: 0
  },

  statContent: {
    minWidth: 0
  },

  statLabel: {
    display: 'block',
    marginBottom: '5px',
    color: '#6c757d',
    fontSize: '13px'
  },

  statValue: {
    display: 'block',
    marginBottom: '5px',
    color: '#2c3e50',
    fontSize: '23px',
    lineHeight: 1.1
  },

  statValueSmall: {
    display: 'block',
    marginBottom: '5px',
    color: '#2c3e50',
    fontSize: '19px',
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  statMeta: {
    color: '#6c757d',
    fontSize: '12px'
  },

  trendUp: {
    color: '#198754',
    fontSize: '12px',
    fontWeight: '600'
  },

  trendDown: {
    color: '#198754',
    fontSize: '12px',
    fontWeight: '600'
  },

  chartsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },

  chartCard: {
    minWidth: 0,
    backgroundColor: '#ffffff',
    padding: '20px',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    boxShadow:
      '0 2px 8px rgba(0, 0, 0, 0.04)'
  },

  chartHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '8px'
  },

  chartTitle: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '17px',
    fontWeight: '700'
  },

  chartSubtitle: {
    margin: '5px 0 0',
    color: '#868e96',
    fontSize: '12px'
  },

  chartContainer: {
    width: '100%',
    height: '300px'
  },

  noData: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#868e96',
    fontSize: '14px'
  },

  performanceCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    boxShadow:
      '0 2px 8px rgba(0, 0, 0, 0.04)'
  },

  performanceHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '20px'
  },

  performanceTitle: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '18px'
  },

  performanceGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px'
  },

  performanceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px'
  },

  performanceLabel: {
    display: 'block',
    marginBottom: '4px',
    color: '#868e96',
    fontSize: '12px'
  },

  performanceValue: {
    display: 'block',
    color: '#343a40',
    fontSize: '15px'
  },

  loaderContainer: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: '#6c757d'
  },

  loadingIcon: {
    animation: 'spin 1s linear infinite',
    color: '#ff4757'
  },

  loadingText: {
    margin: 0,
    fontSize: '15px'
  }
};

export default Analytics;