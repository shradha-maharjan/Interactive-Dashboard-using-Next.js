# WiFi Results Visualization Frontend

A Next.js web application for visualizing WiFi experiment data from ns-3 simulations, compiled as a static site for GitHub Pages deployment.


## 📊 Features

- **Interactive Charts**: Line charts and scatter plots using Recharts
- **Multi-Manager Comparison**: Overlay data from different WiFi managers
- **SNR Analysis**: Aggregated data with 1 dB bins for trend analysis
- **Responsive Design**: Built with Tailwind CSS for all screen sizes
- **Static Site**: Fully compiled to static HTML/CSS/JS for fast loading
- **Sample Data**: Includes demo data for WiFi experiment results

## 🚀 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Building for Production

```bash
# Build static export for GitHub Pages
npm run build

# Test the build locally
cd out
python3 -m http.server 8000
# Open http://localhost:8000
```

## 🔧 Static Site Configuration

The app is configured for static site generation with:

- **Static Export**: `output: 'export'` in `next.config.mjs`
- **Base Path**: `/lab-project` for GitHub Pages
- **Asset Prefix**: Proper asset loading for static hosting
- **Image Optimization**: Disabled for static compatibility
- **No Jekyll**: `.nojekyll` file included
- **Trailing Slash**: Enabled for static hosting compatibility

## 📁 Project Structure

```
frontend/
├── src/app/
│   ├── page.js          # Main visualization page (with embedded data)
│   ├── layout.js        # App layout
│   └── globals.css      # Global styles
├── public/              # Static assets
│   └── .nojekyll        # Prevents Jekyll processing
├── out/                 # Build output (GitHub Pages)
├── next.config.mjs      # Next.js static export configuration
└── package.json         # Dependencies and scripts
```

## 🔄 Deployment

### Automatic Deployment

Changes to the `frontend/` folder automatically trigger deployment via GitHub Actions:

1. **Push changes** to main branch
2. **GitHub Actions** builds the static site
3. **GitHub Pages** serves the static files
4. **Live site** updates at https://uno-networks-lab.github.io/lab-project/

### Manual Deployment

```bash
# From project root
./deploy_frontend.sh

# Or manually
cd frontend
npm run build
git add .
git commit -m "Update frontend"
git push origin main
```

### Local Testing

```bash
# Build and test static site
npm run build
cd out
python3 -m http.server 8000

# Or use the deployment script
../deploy_frontend.sh
```

## 📊 Data Integration

### Current Implementation (Demo Mode)
The static site uses embedded sample data for demonstration:

```javascript
const SAMPLE_DATA = {
  "manager_On/wifi-manager-example-1.csv": [
    { snr: 20, rate: 54, observed: 15.2 },
    // ... more data points
  ]
};
```

### Production Integration
For production use with real ns-3 data:

1. **Replace sample data** with actual experiment results
2. **Add data loading** from static JSON files or external APIs
3. **Update build process** to include data generation step
4. **Configure data sources** in the deployment pipeline

### Expected Data Format

```csv
SNR(dB),802.11a-rate selected,802.11a-observed
27.0,54.0,23.126
26.0,54.0,25.2068
25.0,54.0,24.8545
```

## 🛠 Technology Stack

- **Framework**: Next.js 15 with App Router (Static Export)
- **UI**: React 19 + Tailwind CSS 4
- **Charts**: Recharts for data visualization
- **Deployment**: GitHub Pages with GitHub Actions
- **Build**: Static HTML/CSS/JS generation
- **Hosting**: Static file serving (no server required)

## 🔗 Integration Points

This static frontend can integrate with:

- **Static Data Files**: JSON/CSV files served alongside the site
- **External APIs**: Client-side data fetching from external services
- **CDN Storage**: Data files hosted on CDN for fast access
- **GitHub Raw Files**: Direct access to data files in the repository

## 🚀 Performance Benefits

Static site generation provides:

- **Fast Loading**: Pre-rendered HTML for instant page loads
- **CDN Friendly**: All assets can be cached and distributed globally
- **No Server Costs**: Runs on any static hosting service
- **High Availability**: No server dependencies or downtime
- **SEO Optimized**: Pre-rendered content for search engines

## 🔧 Customization

### Adding New Data Sources

1. **Update sample data** in `src/app/page.js`
2. **Modify data structure** if needed
3. **Test locally** with `npm run build`
4. **Deploy** via Git push

### Styling Changes

1. **Edit Tailwind classes** in components
2. **Update global styles** in `globals.css`
3. **Test responsive design** across devices
4. **Build and deploy** changes

### Chart Modifications

1. **Update Recharts components** in `page.js`
2. **Add new visualization types** as needed
3. **Configure chart options** and styling
4. **Test interactivity** in static build
