// setup-files.js - Run this with: node setup-files.js
const fs = require('fs');
const path = require('path');

// Ensure directories exist
const directories = [
    'src/components/layout',
    'src/components/common',
    'src/components/auth',
    'src/components/user',
    'src/components/restaurant',
    'src/components/cart',
    'src/components/delivery',
    'src/components/admin',
    'src/pages/admin',
    'src/pages/auth',
    'src/pages/user',
    'src/pages/restaurant',
    'src/pages/cart',
    'src/pages/delivery',
    'src/hooks',
    'src/contexts',
    'src/services',
    'src/utils',
    'src/styles',
    'src/routes',
    'src/config'
];

directories.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✓ Created: ${dir}`);
    }
});

// ============ HOOKS ============

// src/hooks/useAuth.js
fs.writeFileSync(path.join(__dirname, 'src/hooks/useAuth.js'), `import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
`);
console.log('✓ Created: src/hooks/useAuth.js');

// src/hooks/useCart.js
fs.writeFileSync(path.join(__dirname, 'src/hooks/useCart.js'), `import { useContext } from 'react';
import CartContext from '../contexts/CartContext';

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default useCart;
`);
console.log('✓ Created: src/hooks/useCart.js');

// src/hooks/useTheme.js
fs.writeFileSync(path.join(__dirname, 'src/hooks/useTheme.js'), `import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default useTheme;
`);
console.log('✓ Created: src/hooks/useTheme.js');

// ============ LAYOUT COMPONENTS ============

// src/components/layout/Navbar.js
fs.writeFileSync(path.join(__dirname, 'src/components/layout/Navbar.js'), `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          🍔 FoodDelivery
        </Link>
        
        <div style={styles.navLinks}>
          <Link to="/restaurants" style={styles.link}>Restaurants</Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" style={styles.link}>Orders</Link>
              <Link to="/profile" style={styles.link}>Profile</Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/signup" style={styles.link}>Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: { background: '#ff4757', padding: '1rem', position: 'sticky', top: 0, zIndex: 1000 },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: 'white', fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' },
  navLinks: { display: 'flex', gap: '1rem', alignItems: 'center' },
  link: { color: 'white', textDecoration: 'none' },
  logoutBtn: { background: 'none', border: 'none', color: 'white', cursor: 'pointer' }
};

export default Navbar;
`);
console.log('✓ Created: src/components/layout/Navbar.js');

// src/components/layout/Footer.js
fs.writeFileSync(path.join(__dirname, 'src/components/layout/Footer.js'), `import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <p>&copy; 2024 FoodDelivery. All rights reserved.</p>
        <div style={styles.links}>
          <a href="/about" style={styles.link}>About</a>
          <a href="/contact" style={styles.link}>Contact</a>
          <a href="/privacy" style={styles.link}>Privacy Policy</a>
          <a href="/terms" style={styles.link}>Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: { background: '#333', color: 'white', padding: '2rem', marginTop: 'auto' },
  container: { maxWidth: '1200px', margin: '0 auto', textAlign: 'center' },
  links: { display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' },
  link: { color: 'white', textDecoration: 'none' }
};

export default Footer;
`);
console.log('✓ Created: src/components/layout/Footer.js');

// src/components/layout/MobileFooter.js
fs.writeFileSync(path.join(__dirname, 'src/components/layout/MobileFooter.js'), `import React from 'react';
import { Link } from 'react-router-dom';

const MobileFooter = () => {
  return (
    <div style={styles.footer}>
      <Link to="/" style={styles.icon}>🏠</Link>
      <Link to="/restaurants" style={styles.icon}>🍔</Link>
      <Link to="/cart" style={styles.icon}>🛒</Link>
      <Link to="/profile" style={styles.icon}>👤</Link>
    </div>
  );
};

const styles = {
  footer: { position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', display: 'flex', justifyContent: 'space-around', padding: '0.5rem', borderTop: '1px solid #ddd', zIndex: 1000 },
  icon: { fontSize: '1.5rem', textDecoration: 'none' }
};

export default MobileFooter;
`);
console.log('✓ Created: src/components/layout/MobileFooter.js');

// ============ RESTAURANT COMPONENTS ============

// src/components/restaurant/RestaurantCard.js
fs.writeFileSync(path.join(__dirname, 'src/components/restaurant/RestaurantCard.js'), `import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant, variant = 'default' }) => {
  return (
    <Link to={\`/restaurant/\${restaurant.id}\`} style={styles.card}>
      <img src={restaurant.image || '/placeholder.jpg'} alt={restaurant.name} style={styles.image} />
      <div style={styles.content}>
        <h3 style={styles.name}>{restaurant.name}</h3>
        <div>⭐ {restaurant.rating} ({restaurant.reviewCount} reviews)</div>
        <div>⏱️ {restaurant.deliveryTime} min • {restaurant.priceRange}</div>
      </div>
    </Link>
  );
};

const styles = {
  card: { textDecoration: 'none', color: 'inherit', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', display: 'block', transition: 'transform 0.2s' },
  image: { width: '100%', height: '200px', objectFit: 'cover' },
  content: { padding: '1rem' },
  name: { margin: '0 0 0.5rem 0' }
};

export default RestaurantCard;
`);
console.log('✓ Created: src/components/restaurant/RestaurantCard.js');

// src/components/restaurant/RestaurantFilter.js
fs.writeFileSync(path.join(__dirname, 'src/components/restaurant/RestaurantFilter.js'), `import React from 'react';

const RestaurantFilter = () => {
  return (
    <div style={styles.filter}>
      <h4>Filters</h4>
      <div>Filter component - Add your filter options here</div>
    </div>
  );
};

const styles = {
  filter: { padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }
};

export default RestaurantFilter;
`);
console.log('✓ Created: src/components/restaurant/RestaurantFilter.js');

// src/components/restaurant/RestaurantInfo.js
fs.writeFileSync(path.join(__dirname, 'src/components/restaurant/RestaurantInfo.js'), `import React from 'react';

const RestaurantInfo = ({ restaurant, onBack }) => {
  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h1>{restaurant.name}</h1>
      <p>⭐ {restaurant.rating} ({restaurant.reviewCount} reviews)</p>
      <p>⏱️ {restaurant.deliveryTime} min • {restaurant.priceRange}</p>
      <p>{restaurant.address}</p>
    </div>
  );
};

export default RestaurantInfo;
`);
console.log('✓ Created: src/components/restaurant/RestaurantInfo.js');

// src/components/restaurant/MenuItem.js
fs.writeFileSync(path.join(__dirname, 'src/components/restaurant/MenuItem.js'), `import React, { useState } from 'react';

const MenuItem = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div style={styles.item}>
      <div style={styles.info}>
        <h4>{item.name}</h4>
        <p>{item.description}</p>
        <p style={styles.price}>₹{item.price}</p>
      </div>
      <div style={styles.actions}>
        <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
          {[1,2,3,4,5].map(q => <option key={q}>{q}</option>)}
        </select>
        <button onClick={() => onAddToCart({ ...item, quantity })}>Add to Cart</button>
      </div>
    </div>
  );
};

const styles = {
  item: { display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #eee' },
  price: { color: '#ff4757', fontWeight: 'bold' },
  actions: { display: 'flex', gap: '0.5rem', alignItems: 'center' }
};

export default MenuItem;
`);
console.log('✓ Created: src/components/restaurant/MenuItem.js');

// src/components/restaurant/RestaurantReviews.js
fs.writeFileSync(path.join(__dirname, 'src/components/restaurant/RestaurantReviews.js'), `import React from 'react';

const RestaurantReviews = () => {
  return (
    <div>
      <h3>Customer Reviews</h3>
      <p>No reviews yet. Be the first to review!</p>
    </div>
  );
};

export default RestaurantReviews;
`);
console.log('✓ Created: src/components/restaurant/RestaurantReviews.js');

// ============ ADMIN PAGES ============

// src/pages/admin/AdminDashboard.js
fs.writeFileSync(path.join(__dirname, 'src/pages/admin/AdminDashboard.js'), `import React from 'react';

const AdminDashboard = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin panel. Manage your platform here.</p>
    </div>
  );
};

export default AdminDashboard;
`);
console.log('✓ Created: src/pages/admin/AdminDashboard.js');

// ============ FIX CSS CASE SENSITIVITY ============
const profileCssPath = path.join(__dirname, 'src/pages/user/Profile.css');
const profileCssLowerPath = path.join(__dirname, 'src/pages/user/profile.css');

if (fs.existsSync(profileCssLowerPath) && !fs.existsSync(profileCssPath)) {
    fs.renameSync(profileCssLowerPath, profileCssPath);
    console.log('✓ Renamed profile.css to Profile.css');
} else if (!fs.existsSync(profileCssPath)) {
    // Create basic Profile.css
    fs.writeFileSync(profileCssPath, `/* Profile Page Styles */
.profile-page { padding: 24px; max-width: 1200px; margin: 0 auto; }
`);
    console.log('✓ Created: src/pages/user/Profile.css');
}

console.log('\\n✅ All files created successfully!');
console.log('\\nNow run: npm start');