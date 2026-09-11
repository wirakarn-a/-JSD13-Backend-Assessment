import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Add Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: 1
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    quantity: 1
  });
  const [editError, setEditError] = useState('');

  // 1. Fetch products from Express API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm.trim()) {
        queryParams.append('search', searchTerm.trim());
      }
      if (sortBy) {
        queryParams.append('sortBy', sortBy);
      }

      const url = `${API_BASE_URL}/products${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Cannot connect to the server. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Run fetch on mount and whenever search/sort changes
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, sortBy]);

  // 2. Handle Add Product (POST /products)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Product name is required');
      return;
    }
    if (formData.price === '' || Number(formData.price) <= 0) {
      setFormError('Price must be a positive number');
      return;
    }
    if (formData.quantity < 1) {
      setFormError('Quantity must be at least 1');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          price: Number(formData.price),
          quantity: Number(formData.quantity)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      const newProduct = data.product || data;
      setProducts((prev) => [...prev, newProduct]);

      // Reset form
      setFormData({ name: '', price: '', quantity: 1 });
      setFormError('');
    } catch (err) {
      setFormError(err.message || 'Error creating product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Start Editing
  const handleStartEdit = (product) => {
    setEditingId(product.id);
    setEditFormData({
      name: product.name,
      price: product.price,
      quantity: product.quantity
    });
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditError('');
  };

  // 4. Handle Save Edited Product (PUT /products/:id)
  const handleSaveEdit = async (id) => {
    setEditError('');

    if (!editFormData.name.trim()) {
      setEditError('Product name cannot be empty');
      return;
    }
    if (editFormData.price === '' || Number(editFormData.price) <= 0) {
      setEditError('Price must be greater than 0');
      return;
    }
    if (editFormData.quantity < 1) {
      setEditError('Quantity must be at least 1');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editFormData.name.trim(),
          price: Number(editFormData.price),
          quantity: Number(editFormData.quantity)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      const updated = data.product || data;

      setProducts((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );

      setEditingId(null);
    } catch (err) {
      setEditError(err.message || 'Error updating product');
    }
  };

  // 5. Handle Delete Product (DELETE /products/:id)
  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete product');
      }

      setProducts((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(`Error deleting product: ${err.message}`);
    }
  };

  // Cart Totals calculation
  const totalItemsCount = products.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalCartPrice = products.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  return (
    <div className="page-wrapper">
      {/* Main Dashboard Canvas */}
      <div className="dashboard-card">
        {/* Top Navbar */}
        <header className="dashboard-navbar">
          <div className="brand-pill">
            <span className="brand-dot"></span>
            <span className="brand-text">Wirakarn</span>
          </div>

          <nav className="nav-menu">
            <button className="nav-item active">Dashboard</button>
            <button className="nav-item">Products</button>
            <button className="nav-item">Orders</button>
            <button className="nav-item">Inventory</button>
            <button className="nav-item">Analytics</button>
          </nav>

          <div className="nav-actions">
            <button className="btn-icon-pill" title="Settings">Setting</button>
            <button className="btn-icon-pill" title="Notifications">🔔</button>
            <div className="user-avatar-pill">
              <span className="avatar-icon">👤</span>
            </div>
          </div>
        </header>

        {/* Hero Title & Metrics Header */}
        <div className="dashboard-hero">
          <div className="hero-left">
            <h1 className="hero-title">Shopping Cart</h1>
            <div className="segmented-status-bar">
              <div className="segment-badge segment-dark">
                <span>Active: {products.length} Items</span>
              </div>
              <div className="segment-badge segment-yellow">
                <span>Units: {totalItemsCount}</span>
              </div>
              <div className="segment-badge segment-muted">
                <span>API Status: Online</span>
              </div>
            </div>
          </div>

          <div className="hero-metrics">
            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-value">{products.length}</span>
              </div>
              <span className="metric-label">Products</span>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-value">{totalItemsCount}</span>
              </div>
              <span className="metric-label">Total Qty</span>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-value">${totalCartPrice.toFixed(0)}</span>
              </div>
              <span className="metric-label">Cart Total</span>
            </div>
          </div>
        </div>

        {/* Error State Banner */}
        {error && (
          <div className="alert-banner">
            <div className="alert-content">
              <span className="alert-badge">⚠️ Server Offline</span>
              <p className="alert-message">{error}</p>
            </div>
            <button className="btn-pill-retry" onClick={fetchProducts}>
              Retry Connection
            </button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Add Product Form & Summary */}
          <aside className="left-panel">
            {/* Add Product Card */}
            <div className="widget-card add-card">
              <div className="widget-header">
                <h3>Add New Product</h3>
                <span className="widget-tag">POST /products</span>
              </div>

              <form onSubmit={handleAddSubmit} className="modern-form">
                {formError && <div className="form-alert">{formError}</div>}

                <div className="input-group">
                  <label htmlFor="product-name">Product Name *</label>
                  <input
                    id="product-name"
                    type="text"
                    className="pill-input"
                    placeholder="e.g. Mechanical Keyboard"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="product-price">Price ($) *</label>
                    <input
                      id="product-price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="pill-input"
                      placeholder="29.99"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="product-quantity">Quantity *</label>
                    <input
                      id="product-quantity"
                      type="number"
                      min="1"
                      className="pill-input"
                      placeholder="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-action-dark" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : '+ Add to Inventory'}
                </button>
              </form>
            </div>

            {/* Summary Widget */}
            <div className="widget-card summary-widget">
              <div className="widget-header">
                <h3>Cart Overview</h3>
                <span className="indicator-pill">Live Sync</span>
              </div>

              <div className="summary-list">
                <div className="summary-row">
                  <span className="summary-title">Unique SKUs</span>
                  <span className="summary-badge-dark">{products.length}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-title">Total Quantity</span>
                  <span className="summary-badge-yellow">{totalItemsCount} units</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total-highlight">
                  <span className="summary-title">Total</span>
                  <span className="total-amount">${totalCartPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Products List & Explorer */}
          <main className="right-panel">
            <div className="widget-card main-list-widget">
              {/* Controls Bar */}
              <div className="list-toolbar">
                <div className="toolbar-title-box">
                  <h3>Inventory Items</h3>
                  <span className="count-pill">{products.length}</span>
                </div>

                <div className="toolbar-controls">
                  <div className="search-pill-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      className="search-pill-input"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="sort-pill-wrapper">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="sort-pill-select"
                    >
                      <option value="">Default Order</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="state-container">
                  <div className="modern-spinner"></div>
                  <p>Fetching inventory from Express API...</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && products.length === 0 && (
                <div className="state-container empty">
                  <div className="empty-badge">📭</div>
                  <h4>No Products Found</h4>
                  <p>
                    {searchTerm
                      ? `No items matched "${searchTerm}". Try resetting search.`
                      : 'Your inventory is currently empty. Add your first product on the left!'}
                  </p>
                </div>
              )}

              {/* Products Cards List */}
              {!loading && products.length > 0 && (
                <div className="products-stack">
                  {products.map((product) => {
                    const isEditing = editingId === product.id;
                    const subtotal = (Number(product.price) * Number(product.quantity)).toFixed(2);

                    if (isEditing) {
                      return (
                        <div key={product.id} className="product-row-card editing-card">
                          <div className="edit-card-header">
                            <span className="edit-title">Editing Product #{product.id}</span>
                            {editError && <span className="edit-error-tag">{editError}</span>}
                          </div>

                          <div className="edit-grid">
                            <div className="edit-field">
                              <label>Product Name</label>
                              <input
                                type="text"
                                className="pill-input"
                                value={editFormData.name}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, name: e.target.value })
                                }
                              />
                            </div>
                            <div className="edit-field">
                              <label>Price ($)</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="pill-input"
                                value={editFormData.price}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, price: e.target.value })
                                }
                              />
                            </div>
                            <div className="edit-field">
                              <label>Quantity</label>
                              <input
                                type="number"
                                min="1"
                                className="pill-input"
                                value={editFormData.quantity}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, quantity: e.target.value })
                                }
                              />
                            </div>
                          </div>

                          <div className="edit-actions-row">
                            <button
                              className="btn-pill-save"
                              onClick={() => handleSaveEdit(product.id)}
                            >
                              ✓ Save Changes
                            </button>
                            <button className="btn-pill-cancel" onClick={handleCancelEdit}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={product.id} className="product-row-card">
                        <div className="product-meta">
                          <div className="product-avatar-tag">
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="product-details">
                            <div className="product-name-row">
                              <h4 className="product-title">{product.name}</h4>
                              <span className="id-tag">ID: {product.id}</span>
                            </div>
                            <div className="badges-row">
                              <span className="badge-pill price-pill">
                                ${Number(product.price).toFixed(2)}
                              </span>
                              <span className="badge-pill qty-pill">
                                Qty: {product.quantity}
                              </span>
                              <span className="badge-pill subtotal-pill">
                                Subtotal: ${subtotal}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="product-actions">
                          <button
                            className="btn-pill-action edit-btn"
                            onClick={() => handleStartEdit(product)}
                            title="Edit Product"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn-pill-action delete-btn"
                            onClick={() => handleDelete(product.id, product.name)}
                            title="Delete Product"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
