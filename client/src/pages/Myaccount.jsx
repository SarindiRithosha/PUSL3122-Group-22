// client/src/pages/Myaccount.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FaHeart } from "react-icons/fa";
import {
  FiUser, FiHeart, FiClock, FiLogOut,
  FiX, FiEdit2, FiTrash2, FiAlertTriangle,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../contexts/CustomerAuthContext";
import { listMyDesigns, deleteMyDesign } from "../services/customerApi";
import "../styles/Myaccount.css";

const SRI_LANKA_PROVINCES = [
  "Central","Eastern","Northern","North Central",
  "North Western","Sabaragamuwa","Southern","Uva","Western",
];

const DELETE_ACCOUNT_CONFIRMATION = "DELETE MY ACCOUNT";

const splitName = (fullName = "") => {
  const value = String(fullName || "").trim();
  if (!value) return { firstName: "", lastName: "" };
  const [firstName, ...rest] = value.split(" ");
  return { firstName, lastName: rest.join(" ") };
};

// ── Saved-design card ─────────────────────────────────────────────────────────
const SavedDesignCard = ({ design, onOpen, onDelete }) => {
  const date = new Date(design.updatedAt || design.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const W = design.room?.dimensions?.width  || 0;
  const L = design.room?.dimensions?.length || 0;

  return (
    <div className="saved-design-card">
      {/* Mini room preview */}
      <div className="saved-design-preview">
        <svg width="100%" height="100%" viewBox="0 0 120 80" fill="none">
          <rect width="120" height="80" fill="#F0F2F5"/>
          {design.room?.shape === 'L-Shape' ? (
            <path d="M10 8 L80 8 L80 38 L45 38 L45 70 L10 70 Z"
              fill={design.room?.activeFloorColor || design.room?.floorColor || '#C8A882'}
              stroke={design.room?.activeWallColor || design.room?.wallColor || '#8B7355'}
              strokeWidth="3"/>
          ) : (
            <rect x="10" y="10" width="100" height="60" rx="3"
              fill={design.room?.activeFloorColor || design.room?.floorColor || '#C8A882'}
              stroke={design.room?.activeWallColor || design.room?.wallColor || '#8B7355'}
              strokeWidth="3"/>
          )}
          {(design.placedItems || []).slice(0, 8).map((item, i) => (
            <rect key={i}
              x={Math.min(10 + (item.xM || 0) * 14, 95)}
              y={Math.min(10 + (item.yM || 0) * 8,  60)}
              width={Math.min((item.width || 1) * 14, 22)}
              height={Math.min((item.depth || 1) * 8, 14)}
              rx="2"
              fill={item.activeColor || '#D4B896'}
              opacity="0.85"/>
          ))}
        </svg>
        <div className="saved-design-item-count">{design.itemCount || 0} items</div>
      </div>

      {/* Card body */}
      <div className="saved-design-body">
        <h4 className="saved-design-name">{design.name}</h4>
        <div className="saved-design-meta">
          {design.room?.name && (
            <span className="saved-design-meta-row">
              <span className="saved-design-meta-label">Room</span>
              <span>{design.room.name}</span>
            </span>
          )}
          {W > 0 && L > 0 && (
            <span className="saved-design-meta-row">
              <span className="saved-design-meta-label">Size</span>
              <span>{W}m × {L}m</span>
            </span>
          )}
          <span className="saved-design-meta-row">
            <span className="saved-design-meta-label">Saved</span>
            <span>{date}</span>
          </span>
        </div>
        <div className="saved-design-actions">
          <button className="saved-design-btn open" onClick={() => onOpen(design)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit Design
          </button>
          <button className="saved-design-btn delete" onClick={() => onDelete(design)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Delete confirm ────────────────────────────────────────────────────────────
const DeleteDesignModal = ({ design, onConfirm, onClose }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal-content">
      <div className="modal-header">
        <h3>Delete Design</h3>
        <button className="modal-close" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="modal-body">
        <p style={{ color: "#374151", marginBottom: 0 }}>
          Are you sure you want to delete <strong>"{design.name}"</strong>?
          This cannot be undone.
        </p>
      </div>
      <div className="modal-footer">
        <button className="btn outline" onClick={onClose}>Cancel</button>
        <button className="btn danger" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const Myaccount = () => {
  const navigate = useNavigate();
  const {
    customer,
    updateCustomerProfile,
    changeCustomerPassword,
    deleteCustomerAccount,
    logoutCustomer,
  } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState("profile");

  // ── Saved designs state ────────────────────────────────────────────────────
  const [savedDesigns,     setSavedDesigns]     = useState([]);
  const [designsLoading,   setDesignsLoading]   = useState(false);
  const [designsError,     setDesignsError]     = useState("");
  const [designToDelete,   setDesignToDelete]   = useState(null);

  // ── Profile ────────────────────────────────────────────────────────────────
  const [favTab,  setFavTab]  = useState("furniture");
  const [orderTab,setOrderTab]= useState("furniture");
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileError,    setProfileError]    = useState("");
  const [profileSuccess,  setProfileSuccess]  = useState("");

  const [profile, setProfile] = useState({ firstName:"", lastName:"", email:"", phone:"" });
  const [address, setAddress] = useState({ street:"", city:"", state:"", zip:"" });

  const [favoriteFurniture, setFavoriteFurniture] = useState([
    { id:1, name:"Nordic Oak Chair",        price:32000, category:"Chair" },
    { id:2, name:"Minimalist Wooden Table", price:45000, category:"Table" },
  ]);
  const [favoriteDesigns, setFavoriteDesigns] = useState([
    { id:1, name:"Scandinavian Living Room", theme:"Scandinavian", room:"Living Room" },
    { id:2, name:"Minimalist Bedroom",       theme:"Minimalist",   room:"Bedroom" },
  ]);
  const [furnitureOrders] = useState([
    { id:101, date:"2026-02-10", total:54000, status:"Delivered",  items:"Nordic Oak Chair" },
  ]);
  const [designOrders] = useState([
    { id:201, date:"2026-01-20", total:125000, status:"Completed", items:"Living Room Design" },
  ]);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isChangingPassword,      setIsChangingPassword]      = useState(false);
  const [passwordError,           setPasswordError]           = useState("");
  const [passwordSuccess,         setPasswordSuccess]         = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });

  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount,      setIsDeletingAccount]      = useState(false);
  const [deleteError,            setDeleteError]            = useState("");
  const [deleteForm, setDeleteForm] = useState({ password:"", confirmationText:"", acknowledged:false });

  // ── Load profile ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!customer) return;
    const { firstName, lastName } = splitName(customer.name);
    setProfile({ firstName, lastName, email: customer.email || "", phone: customer.phone || "" });
    setAddress({
      street: customer.address?.street   || "",
      city:   customer.address?.city     || "",
      state:  customer.address?.province || "",
      zip:    customer.address?.postalCode || "",
    });
  }, [customer]);

  // ── Load saved designs when tab selected ───────────────────────────────────
  useEffect(() => {
    if (activeTab !== "saved-designs") return;
    setDesignsLoading(true);
    setDesignsError("");
    listMyDesigns()
      .then(res => setSavedDesigns(res.data || []))
      .catch(err => setDesignsError(err.status === 401
        ? "Please sign in to view your saved designs."
        : "Failed to load designs. Please try again."
      ))
      .finally(() => setDesignsLoading(false));
  }, [activeTab]);

  const customerDisplayName = useMemo(() => {
    const name = `${profile.firstName} ${profile.lastName}`.trim();
    return name || customer?.name || "Customer";
  }, [customer?.name, profile.firstName, profile.lastName]);

  // ── Saved design actions ───────────────────────────────────────────────────
  const handleOpenDesign  = (d) => navigate(`/workspace/design/${d._id}`);
  const handleDeleteDesign = async () => {
    if (!designToDelete) return;
    try {
      await deleteMyDesign(designToDelete._id);
      setSavedDesigns(prev => prev.filter(d => d._id !== designToDelete._id));
    } catch { /* ignore */ }
    setDesignToDelete(null);
  };

  // ── Profile helpers ────────────────────────────────────────────────────────
  const saveProfile = async () => {
    try {
      setProfileError(""); setProfileSuccess(""); setIsProfileSaving(true);
      await updateCustomerProfile({
        firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone,
        address: { street:address.street, city:address.city, province:address.state, postalCode:address.zip },
      });
      setProfileSuccess("Profile saved successfully.");
    } catch (error) { setProfileError(error?.message || "Failed to save profile."); }
    finally { setIsProfileSaving(false); }
  };

  const handleProfileChange = e => { const { name, value } = e.target; setProfile(p => ({...p,[name]:value})); };
  const handleAddressChange = e => { const { name, value } = e.target; setAddress(p => ({...p,[name]:value})); };

  const openChangePasswordModal = () => {
    setPasswordError(""); setPasswordSuccess("");
    setPasswordForm({ currentPassword:"", newPassword:"", confirmPassword:"" });
    setShowChangePasswordModal(true);
  };

  const submitPasswordChange = async () => {
    try {
      setPasswordError(""); setPasswordSuccess("");
      if (!passwordForm.currentPassword||!passwordForm.newPassword||!passwordForm.confirmPassword) {
        setPasswordError("All password fields are required."); return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError("New password and confirmation do not match."); return;
      }
      if (passwordForm.newPassword.length < 8) {
        setPasswordError("New password must be at least 8 characters long."); return;
      }
      setIsChangingPassword(true);
      await changeCustomerPassword(passwordForm);
      setPasswordSuccess("Password changed successfully.");
      setPasswordForm({ currentPassword:"", newPassword:"", confirmPassword:"" });
    } catch (error) { setPasswordError(error?.message || "Failed to change password."); }
    finally { setIsChangingPassword(false); }
  };

  const openDeleteAccountModal = () => {
    setDeleteError("");
    setDeleteForm({ password:"", confirmationText:"", acknowledged:false });
    setShowDeleteAccountModal(true);
  };

  const submitDeleteAccount = async () => {
    try {
      setDeleteError("");
      if (!deleteForm.acknowledged) { setDeleteError("Please confirm that this action is permanent."); return; }
      if (!deleteForm.password)     { setDeleteError("Password is required."); return; }
      if (deleteForm.confirmationText.trim().toUpperCase() !== DELETE_ACCOUNT_CONFIRMATION) {
        setDeleteError(`Type "${DELETE_ACCOUNT_CONFIRMATION}" exactly to continue.`); return;
      }
      setIsDeletingAccount(true);
      await deleteCustomerAccount({ password:deleteForm.password, confirmationText:deleteForm.confirmationText });
      navigate("/", { replace: true });
    } catch (error) { setDeleteError(error?.message || "Failed to delete account."); }
    finally { setIsDeletingAccount(false); }
  };

  // ── Render tabs ────────────────────────────────────────────────────────────
  const renderProfileTab = () => (
    <>
      <div className="section personal-information">
        <h2>Personal Information</h2>
        <div className="fields">
          <div className="field"><label>First Name</label>
            <input name="firstName" value={profile.firstName} onChange={handleProfileChange} type="text"/></div>
          <div className="field"><label>Last Name</label>
            <input name="lastName" value={profile.lastName} onChange={handleProfileChange} type="text"/></div>
          <div className="field"><label>Email Address</label>
            <input name="email" value={profile.email} type="email" disabled/></div>
          <div className="field"><label>Phone Number</label>
            <input name="phone" value={profile.phone} onChange={handleProfileChange} type="tel" placeholder="+94 77 123 4567"/></div>
        </div>

        <h2>Default Shipping Address</h2>
        <div className="fields">
          <div className="field full-width"><label>Street Address</label>
            <input name="street" value={address.street} onChange={handleAddressChange} type="text"/></div>
          <div className="field"><label>City</label>
            <input name="city" value={address.city} onChange={handleAddressChange} type="text"/></div>
          <div className="field"><label>State / Province</label>
            <select name="state" value={address.state} onChange={handleAddressChange}>
              <option value="">Select Province</option>
              {SRI_LANKA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select></div>
          <div className="field"><label>Postal Code</label>
            <input name="zip" value={address.zip} onChange={handleAddressChange} type="text"/></div>
        </div>

        {profileError   && <p className="error-text">{profileError}</p>}
        {profileSuccess && <p className="success-text">{profileSuccess}</p>}
        <button className="btn primary" onClick={saveProfile} disabled={isProfileSaving}>
          {isProfileSaving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      <div className="section account-security">
        <h2>Account Security</h2>
        <p>Change password or permanently delete your account.</p>
        <div className="security-container">
          <div className="security-actions">
            <button className="btn outline" onClick={openChangePasswordModal}>Change Password</button>
          </div>
          <button className="btn danger" onClick={openDeleteAccountModal}>Delete Account</button>
        </div>
      </div>
    </>
  );

  const renderSavedDesignsTab = () => (
    <div className="section">
      <h2>My Saved Designs</h2>
      {designsLoading && (
        <div className="saved-designs-loading">
          {[1,2,3].map(i => <div key={i} className="saved-design-skeleton"/>)}
        </div>
      )}
      {designsError && <p className="error-text" style={{ marginTop:12 }}>{designsError}</p>}
      {!designsLoading && !designsError && savedDesigns.length === 0 && (
        <div className="saved-designs-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C8973A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{display:"block",margin:"0 auto 8px"}}><rect x="2" y="9" width="20" height="11" rx="2"/><path d="M6 9V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/><path d="M2 15h20"/></svg>
          <p>No saved designs yet.</p>
          <p className="saved-designs-empty-sub">
            Visit the <button className="link-btn" onClick={() => navigate('/room')}>Room page</button> to start designing!
          </p>
        </div>
      )}
      {!designsLoading && !designsError && savedDesigns.length > 0 && (
        <div className="saved-designs-grid">
          {savedDesigns.map(d => (
            <SavedDesignCard key={d._id} design={d}
              onOpen={handleOpenDesign}
              onDelete={d => setDesignToDelete(d)}/>
          ))}
        </div>
      )}
    </div>
  );

  const renderFavoritesTab = () => (
    <div className="section">
      <h2>My Favorites</h2>
      <div className="favorites-tabs">
        <button className={`fav-tab-btn ${favTab==="furniture"?"active":""}`} onClick={() => setFavTab("furniture")}>Furniture</button>
        <button className={`fav-tab-btn ${favTab==="design"?"active":""}`}    onClick={() => setFavTab("design")}>Design</button>
      </div>
      {favTab === "furniture" ? (
        <div className="furniture-grid">
          {favoriteFurniture.map(item => (
            <div className="furniture-card" key={item.id}>
              <div className="furniture-image">F</div>
              <div className="furniture-info">
                <div className="furniture-header">
                  <h4>{item.name}</h4>
                  <button className="furniture-wish-btn active"
                    onClick={() => setFavoriteFurniture(p => p.filter(f => f.id !== item.id))}>
                    <FaHeart/>
                  </button>
                </div>
                <p className="furniture-price">LKR {item.price.toLocaleString()}</p>
                <span className="furniture-category">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="design-grid">
          {favoriteDesigns.map(d => (
            <div className="design-fav-card" key={d.id}>
              <div className="design-fav-image">D</div>
              <div className="design-fav-content">
                <div className="design-fav-header">
                  <h4>{d.name}</h4>
                  <button className="design-fav-wish-btn active"
                    onClick={() => setFavoriteDesigns(p => p.filter(f => f.id !== d.id))}>
                    <FaHeart/>
                  </button>
                </div>
                <div className="design-fav-tags">
                  <span className="design-fav-tag">{d.theme}</span>
                  <span className="design-fav-tag">{d.room}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOrdersTab = () => (
    <div className="section order-history">
      <h2>Order History</h2>
      <div className="favorites-tabs">
        <button className={`fav-tab-btn ${orderTab==="furniture"?"active":""}`} onClick={() => setOrderTab("furniture")}>Furniture Orders</button>
        <button className={`fav-tab-btn ${orderTab==="design"?"active":""}`}    onClick={() => setOrderTab("design")}>Design Orders</button>
      </div>
      <div className="orders-content">
        <table className="orders-table">
          <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {(orderTab==="furniture"?furnitureOrders:designOrders).map(o => (
              <tr key={o.id}>
                <td>{o.id}</td><td>{o.date}</td><td>{o.items}</td>
                <td>LKR {o.total.toLocaleString()}</td>
                <td><span className={`status-badge ${o.status.toLowerCase().replace(" ","-")}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === "profile")        return renderProfileTab();
    if (activeTab === "saved-designs")  return renderSavedDesignsTab();
    if (activeTab === "favorites")      return renderFavoritesTab();
    return renderOrdersTab();
  };

  return (
    <div className="myaccount-container">
      <h1>My Account</h1>
      <p className="subtitle">Manage your profile, security settings, and saved items.</p>

      <div className="account-layout">
        {/* ── Sidebar nav ── */}
        <nav className="sidebar">
          <div className="sidebar-profile">
            <div className="avatar">{customerDisplayName.charAt(0).toUpperCase() || "C"}</div>
            <div className="profile-info">
              <span className="name">{customerDisplayName}</span>
              <span className="membership">Registered Customer</span>
            </div>
          </div>
          <ul>
            <li className={activeTab==="profile"?"active":""} onClick={() => setActiveTab("profile")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span className="text">Profile Details</span>
            </li>
            <li className={activeTab==="saved-designs"?"active":""} onClick={() => setActiveTab("saved-designs")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              <span className="text">My Saved Designs</span>
              {savedDesigns.length > 0 && (
                <span className="badge">{savedDesigns.length}</span>
              )}
            </li>
            <li className={activeTab==="favorites"?"active":""} onClick={() => setActiveTab("favorites")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span className="text">My Favorites</span>
              <span className="badge">{favoriteFurniture.length + favoriteDesigns.length}</span>
            </li>
            <li className={activeTab==="orders"?"active":""} onClick={() => setActiveTab("orders")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/></svg>
              <span className="text">Order History</span>
            </li>
            <li className="logout" onClick={() => { logoutCustomer(); navigate("/"); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span className="text">Log Out</span>
            </li>
          </ul>
        </nav>

        <div className="content">{renderContent()}</div>
      </div>

      {/* ── Delete design confirm modal ── */}
      {designToDelete && (
        <DeleteDesignModal
          design={designToDelete}
          onConfirm={handleDeleteDesign}
          onClose={() => setDesignToDelete(null)}/>
      )}

      {/* ── Change password modal ── */}
      {showChangePasswordModal && (
        <div className="modal-overlay" onClick={() => !isChangingPassword && setShowChangePasswordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <button className="modal-close" onClick={() => setShowChangePasswordModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              {["currentPassword","newPassword","confirmPassword"].map(f => (
                <div className="field" key={f}>
                  <label>{f==="currentPassword"?"Current Password":f==="newPassword"?"New Password":"Confirm New Password"}</label>
                  <input type="password" minLength={f!=="currentPassword"?8:undefined}
                    value={passwordForm[f]}
                    onChange={e => setPasswordForm(p => ({...p,[f]:e.target.value}))}/>
                </div>
              ))}
              {passwordError   && <p className="error-text">{passwordError}</p>}
              {passwordSuccess && <p className="success-text">{passwordSuccess}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn outline" onClick={() => setShowChangePasswordModal(false)} disabled={isChangingPassword}>Cancel</button>
              <button className="btn primary" onClick={submitPasswordChange} disabled={isChangingPassword}>
                {isChangingPassword?"Updating...":"Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete account modal ── */}
      {showDeleteAccountModal && (
        <div className="modal-overlay" onClick={() => !isDeletingAccount && setShowDeleteAccountModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Account</h3>
              <button className="modal-close" onClick={() => setShowDeleteAccountModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="danger-note"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:"middle"}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>This action is permanent and cannot be recovered.</p>
              <div className="field">
                <label>Type "{DELETE_ACCOUNT_CONFIRMATION}"</label>
                <input type="text" value={deleteForm.confirmationText}
                  onChange={e => setDeleteForm(p => ({...p, confirmationText:e.target.value}))}/>
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={deleteForm.password}
                  onChange={e => setDeleteForm(p => ({...p, password:e.target.value}))}/>
              </div>
              <label className="danger-ack">
                <input type="checkbox" checked={deleteForm.acknowledged}
                  onChange={e => setDeleteForm(p => ({...p, acknowledged:e.target.checked}))}/>
                I understand this action cannot be undone.
              </label>
              {deleteError && <p className="error-text">{deleteError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn outline" onClick={() => setShowDeleteAccountModal(false)} disabled={isDeletingAccount}>Cancel</button>
              <button className="btn danger" onClick={submitDeleteAccount} disabled={isDeletingAccount}>
                {isDeletingAccount?"Deleting...":"Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Myaccount;