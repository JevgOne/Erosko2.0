#!/bin/bash

echo "🔥 Firebase Setup pro erosko-cz"
echo "================================"
echo ""
echo "📋 KROKY K DOKONČENÍ:"
echo ""
echo "1️⃣  Otevři v prohlížeči:"
echo "    👉 https://console.firebase.google.com/u/0/project/erosko-cz/settings/serviceaccounts/adminsdk"
echo ""
echo "2️⃣  Klikni na tlačítko:"
echo "    👉 'Generate new private key'"
echo ""
echo "3️⃣  Potvrd dialog (Download)"
echo ""
echo "4️⃣  Soubor se stáhne do ~/Downloads/ s názvem typu:"
echo "    👉 erosko-cz-firebase-adminsdk-xxxxx-1234567890.json"
echo ""
echo "5️⃣  Přesuň ho sem a přejmenuj:"
echo ""

SERVICE_ACCOUNT_PATH="/Users/Radim/Projects/erosko.cz/scrapers/firebase-service-account.json"

# Najdi poslední stažený Firebase service account v Downloads
LATEST_FILE=$(ls -t ~/Downloads/erosko-cz-firebase-adminsdk-*.json 2>/dev/null | head -1)

if [ -n "$LATEST_FILE" ]; then
    echo "✅ Našel jsem stažený soubor:"
    echo "   $LATEST_FILE"
    echo ""
    read -p "Chceš ho automaticky přesunout a přejmenovat? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mv "$LATEST_FILE" "$SERVICE_ACCOUNT_PATH"
        echo "✅ Hotovo! Service account uložen jako:"
        echo "   $SERVICE_ACCOUNT_PATH"
        echo ""
        echo "🚀 Teď můžeš spustit upload:"
        echo "   cd /Users/Radim/Projects/erosko.cz/scrapers"
        echo "   npm run upload:firebase"
        exit 0
    fi
fi

echo ""
echo "💡 Pokud jsi soubor ještě nestáhl, udělej kroky 1-4 výše."
echo ""
echo "📝 Pak spusť tento příkaz (nahraď XXXXX skutečným názvem):"
echo ""
echo "   mv ~/Downloads/erosko-cz-firebase-adminsdk-XXXXX-*.json \\"
echo "      $SERVICE_ACCOUNT_PATH"
echo ""
echo "🚀 A pak spusť upload:"
echo "   npm run upload:firebase"
echo ""
