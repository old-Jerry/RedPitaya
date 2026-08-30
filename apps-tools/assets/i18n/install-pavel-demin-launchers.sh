#!/bin/sh
set -eu

APP_ROOT=${1:-/opt/redpitaya/www/apps}
MARKER="pavel-demin-launchers.js"

for app_dir in \
    sdr_receiver_hpsdr sdr_receiver_hpsdr_122_88 sdr_receiver_hpsdr_z20 \
    sdr_transceiver sdr_transceiver_122_88 sdr_transceiver_z20 \
    sdr_transceiver_hpsdr sdr_transceiver_hpsdr_122_88 sdr_transceiver_hpsdr_z20 \
    sdr_transceiver_hpsdr_thetis sdr_transceiver_hpsdr_thetis_122_88 \
    sdr_transceiver_hpsdr_thetis_z20 vna vna_122_88 vna_z20
do
    index="$APP_ROOT/$app_dir/index.html"
    [ -f "$index" ] || continue
    sed -i \
        -e 's|/assets/i18n/locales/common.en.js|/assets/i18n/locales/en.js|g' \
        -e 's|/assets/i18n/locales/common.zh-CN.js|/assets/i18n/locales/zh-CN.js|g' \
        "$index"
    grep -q "$MARKER" "$index" && continue
    sed -i '/<\/head>/i\
<link rel="stylesheet" href="/assets/i18n/i18n.css">\
<script src="/assets/i18n/i18n.js"><\/script>\
<script src="/assets/i18n/locales/en.js"><\/script>\
<script src="/assets/i18n/locales/zh-CN.js"><\/script>\
<script src="/assets/i18n/integrations/pavel-demin-launchers.js"><\/script>' "$index"
done
