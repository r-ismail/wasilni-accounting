# 🎨 White-Label Branding Guide

## 📋 Overview

The system now supports **full white-label branding**, meaning:
- ✅ **No "Wasilni Accounting" branding** appears to end users
- ✅ **Company name** replaces all app name references
- ✅ **Company logo** replaces all app logo/icon references
- ✅ **Dynamic updates** - changes reflect immediately

---

## 🎯 What Changed

### Before (Generic Branding)
```
Browser Tab: "Raed Property Management - Wasilni Accounting"
Favicon: Vite logo
Sidebar: "Wasilni Accounting"
           Raed Property Management (subtitle)
Copyright: "© 2025 Wasilni Accounting"
```

### After (White-Label)
```
Browser Tab: "Raed Property Management"
Favicon: Company logo
Sidebar: "Raed Property Management"
Copyright: "© 2025 Raed Property Management"
```

---

## 🔧 Technical Implementation

### 1. Page Title (Browser Tab)

**File:** `apps/web/src/components/Layout.tsx`

**Before:**
```typescript
document.title = `${name} - ${t('app.title')}`;
// Result: "Company Name - Wasilni Accounting"
```

**After:**
```typescript
document.title = name;
// Result: "Company Name"
```

**Default (while loading):**
```html
<!-- index.html -->
<title>Loading...</title>
```

### 2. Favicon (Browser Icon)

**File:** `apps/web/src/components/Layout.tsx`

**Implementation:**
```typescript
// Update favicon if logo exists
if (response.data.data.logo) {
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (favicon) {
    favicon.href = response.data.data.logo;
  }
}
```

**How it works:**
1. Company logo is base64 image stored in database
2. On page load, fetch company data
3. If logo exists, replace favicon href with logo
4. Browser updates tab icon automatically

**Fallback:**
- If no logo: Default Vite icon (can be customized)
- If logo fails to load: Default icon remains

### 3. Sidebar Title

**File:** `apps/web/src/components/Layout.tsx`

**Before:**
```tsx
<Typography variant="h6">
  {t('app.title')}  {/* "Wasilni Accounting" */}
</Typography>
{companyName && (
  <Typography variant="caption">
    {companyName}  {/* Company name as subtitle */}
  </Typography>
)}
```

**After:**
```tsx
<Typography variant="h6">
  {companyName || t('app.title')}  {/* Company name only */}
</Typography>
```

**Behavior:**
- Shows company name if available
- Falls back to app title if not loaded yet
- No subtitle/secondary text

### 4. AppBar Title

**File:** `apps/web/src/components/Layout.tsx`

**Before:**
```tsx
{menuItems.find(...)?.text || t('app.title')}
// Fallback: "Wasilni Accounting"
```

**After:**
```tsx
{menuItems.find(...)?.text || companyName || t('app.title')}
// Fallback: Company name, then app title
```

**Behavior:**
- Shows current page name (e.g., "Dashboard")
- If no page match, shows company name
- Last resort: app title (rarely shown)

### 5. Copyright Notice

**File:** `apps/web/src/pages/Settings.tsx`

**Before:**
```tsx
© 2025 Wasilni Accounting
```

**After:**
```tsx
© 2025 {company?.name || 'Wasilni Accounting'}
```

**Behavior:**
- Shows company name in copyright
- Falls back to app name if company not loaded

---

## 📊 Branding Matrix

| Location | Before | After | Fallback |
|----------|--------|-------|----------|
| **Browser Tab** | "Company - App" | "Company" | "Loading..." |
| **Favicon** | Vite logo | Company logo | Vite logo |
| **Sidebar Title** | "App Name" + subtitle | "Company Name" | "App Name" |
| **Sidebar Logo** | Business icon | Company logo | Business icon |
| **AppBar Logo** | None | Company logo | None |
| **Copyright** | "© App" | "© Company" | "© App" |

---

## 🎨 How to Customize

### Upload Company Logo

**Steps:**
1. Login to system
2. Go to **Settings** → **Company Settings**
3. Click **"Upload Logo"**
4. Select image file (PNG, JPG, SVG)
5. Preview appears
6. Click **"Save"**

**Result:**
- ✅ Logo appears in sidebar
- ✅ Logo appears in AppBar (desktop only)
- ✅ Logo appears in invoice print
- ✅ **Favicon updates to logo**

**Recommendations:**
- **Size:** 512×512px or larger (square)
- **Format:** PNG with transparency preferred
- **File size:** < 200KB for fast loading
- **Design:** Simple, recognizable at small sizes

### Change Company Name

**Steps:**
1. Go to **Settings** → **Company Settings**
2. Edit **"Company Name"** field
3. Click **"Save"**

**Result:**
- ✅ Browser tab title updates
- ✅ Sidebar title updates
- ✅ Copyright updates
- ✅ All references update

**No page refresh needed!**

---

## 🔍 Testing

### Test Page Title

**Steps:**
1. Open system in browser
2. Look at browser tab
3. Should show: `{Company Name}`
4. NOT: `{Company Name} - Wasilni Accounting`

**Expected:**
```
✅ "Raed Property Management"
❌ "Raed Property Management - Wasilni Accounting"
```

### Test Favicon

**Steps:**
1. Upload company logo in Settings
2. Refresh page (F5)
3. Look at browser tab icon
4. Should show company logo

**Expected:**
- ✅ Company logo appears as favicon
- ✅ Updates immediately after upload
- ✅ Persists across page navigation

**Troubleshooting:**
- If favicon doesn't update: Hard refresh (Ctrl+Shift+R)
- If logo is too large: Browser may not load it
- If logo has wrong format: Use PNG/JPG/SVG

### Test Sidebar

**Steps:**
1. Open sidebar (click menu icon)
2. Look at top section
3. Should show:
   - Company logo (if uploaded)
   - Company name (large text)

**Expected:**
```
✅ [Logo] Raed Property Management
❌ [Logo] Wasilni Accounting
           Raed Property Management
```

### Test Copyright

**Steps:**
1. Go to Settings page
2. Scroll to bottom
3. Look at copyright notice

**Expected:**
```
✅ © 2025 Raed Property Management
❌ © 2025 Wasilni Accounting
```

---

## 🚀 Benefits

### For End Users
- ✅ **Professional appearance** - branded to their company
- ✅ **No confusion** - clear which system they're using
- ✅ **Trust** - looks like their own system
- ✅ **Multi-tab friendly** - easy to identify tabs

### For Resellers
- ✅ **White-label ready** - no competitor branding
- ✅ **Easy customization** - just upload logo
- ✅ **Instant updates** - no code changes needed
- ✅ **Multi-tenant** - each company has own branding

### For Developers
- ✅ **Maintainable** - single source of truth (API)
- ✅ **Flexible** - easy to add more branding points
- ✅ **Testable** - clear fallback behavior
- ✅ **Scalable** - works for unlimited companies

---

## 📝 Code Locations

### Frontend Files Modified

| File | Lines | Purpose |
|------|-------|---------|
| `Layout.tsx` | 64-72 | Page title & favicon update |
| `Layout.tsx` | 141-143 | Sidebar title |
| `Layout.tsx` | 241 | AppBar title fallback |
| `Settings.tsx` | 804 | Copyright notice |
| `index.html` | 7 | Default title |

### Total Changes
- **Files:** 3
- **Lines added:** +14
- **Lines removed:** -11
- **Net change:** +3 lines

---

## 🔮 Future Enhancements

### Short-term
- [ ] Custom color scheme per company
- [ ] Multiple logo variants (light/dark mode)
- [ ] Custom fonts per company
- [ ] Branded email templates

### Long-term
- [ ] Custom domain per company
- [ ] Branded mobile app
- [ ] Custom login page per company
- [ ] White-label API documentation

---

## 🐛 Known Limitations

### Favicon Update Timing
- **Issue:** Favicon may not update immediately in some browsers
- **Workaround:** Hard refresh (Ctrl+Shift+R)
- **Reason:** Browser caching

### Logo Size
- **Issue:** Very large logos (>2MB) may slow down page load
- **Workaround:** Compress images before upload
- **Future:** Automatic compression on upload

### Fallback Behavior
- **Issue:** Brief flash of "Loading..." before company name appears
- **Workaround:** None (by design)
- **Reason:** Company data must be fetched from API

---

## ✅ Checklist

### For Developers
- [x] Page title uses company name only
- [x] Favicon updates dynamically
- [x] Sidebar shows company name
- [x] AppBar uses company name as fallback
- [x] Copyright uses company name
- [x] All changes committed
- [x] Documentation written

### For Users
- [ ] Upload company logo
- [ ] Verify logo appears in 4 places
- [ ] Verify page title shows company name
- [ ] Verify favicon shows company logo
- [ ] Test in multiple browsers

---

## 📞 Support

If branding doesn't work as expected:

1. **Check company data:**
   ```bash
   curl http://localhost:3001/api/companies/my-company \
     -H "Authorization: Bearer {token}"
   ```

2. **Verify logo format:**
   - Must be base64 string
   - Must start with `data:image/...`

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R
   - Clear all cache in browser settings

4. **Check console for errors:**
   - Open DevTools (F12)
   - Look for errors in Console tab

---

## 🎓 Examples

### Example 1: Real Estate Company

**Setup:**
```
Company Name: "Al-Majd Real Estate"
Logo: Company logo with building icon
```

**Result:**
```
Browser Tab: "Al-Majd Real Estate"
Favicon: Building icon
Sidebar: [Building Icon] Al-Majd Real Estate
Copyright: © 2025 Al-Majd Real Estate
```

### Example 2: Hotel Management

**Setup:**
```
Company Name: "Luxury Hotels Group"
Logo: Hotel logo with crown
```

**Result:**
```
Browser Tab: "Luxury Hotels Group"
Favicon: Crown icon
Sidebar: [Crown Icon] Luxury Hotels Group
Copyright: © 2025 Luxury Hotels Group
```

### Example 3: Property Management

**Setup:**
```
Company Name: "Raed Property Management"
Logo: Custom RPM logo
```

**Result:**
```
Browser Tab: "Raed Property Management"
Favicon: RPM logo
Sidebar: [RPM Logo] Raed Property Management
Copyright: © 2025 Raed Property Management
```

---

**Status:** ✅ Complete  
**Version:** 1.0  
**Date:** 2025-12-15  
**Commit:** 7868ded
