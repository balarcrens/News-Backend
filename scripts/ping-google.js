const axios = require('axios');

/**
 * Pings Google to notify them of a sitemap update.
 * Usage: node scripts/ping-google.js
 */
const pingGoogle = async () => {
    const sitemapUrl = 'https://nexoranews.dpdns.org/sitemap.xml';
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

    console.log(`[SEO] Pinging Google: ${googlePingUrl}`);

    try {
        const response = await axios.get(googlePingUrl);
        if (response.status === 200) {
            console.log('[SEO] Google successfully notified of sitemap update.');
        } else {
            console.warn(`[SEO] Google ping failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error('[SEO] Error pinging Google:', error.message);
    }
};

pingGoogle();

