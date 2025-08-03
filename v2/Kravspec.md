# Kravspecifikation: Webbapplikation för Privat Ekonomi (Budget, Resultat & Balansräkning)

## 1. Syfte
Att ge privatpersoner ett enkelt, överskådligt verktyg för att hantera sin ekonomi – budget, resultat och balansräkning – direkt i webbläsaren, utan krav på backend eller inloggning. Applikationen ska vara statisk och bestå av HTML och CSS.

## 2. Funktionella krav

### 2.1 Budget
- **Visa en budgettabell** där användaren kan se förväntade inkomster och utgifter för en vald period (t.ex. per månad).
- **Möjlighet att manuellt fylla i eller ändra poster** (t.ex. "Lön", "Hyra", "Mat", "Sparande") direkt i tabellen (i denna MVP, sker detta via redigerbara fält eller textområden).
- **Automatisk summering** av inkomster, utgifter och saldo (intäkter minus kostnader).

### 2.2 Resultatrapport
- **Visa faktisk utfallstabell** där användaren kan fylla i verkliga inkomster och utgifter för perioden.
- **Jämförelse mellan budget och utfall** (t.ex. visas skillnaden i en kolumn bredvid).
- **Summering av över-/underskott**.

### 2.3 Balansräkning
- **Tabell för tillgångar och skulder** där användaren kan mata in aktuella belopp (t.ex. "Bankkonto", "Lån", "Värde på bil").
- **Summering av tillgångar, skulder och eget kapital**.

### 2.4 Översikt & visualisering
- **Enkel översiktssida** som visar nyckeltal: månadens saldo, sparkvot, förändring av eget kapital.
- **Enkla diagram** (exempel: staplar med CSS för att visa fördelning, färgade rader som indikerar positivt/negativt resultat).

## 3. Icke-funktionella krav

- **Responsiv design**: Fungerar på både mobil, surfplatta och dator.
- **Lättläst och tydlig layout**: Använd tydliga rubriker, färgkoder (grönt/rött för plus/minus), och bra kontraster.
- **Ingen inloggning eller datalagring**: All data fylls i av användaren och sparas inte (MVP). Vid uppdatering eller omladdning försvinner data.
- **Enkel att bygga vidare på**: Koden ska vara modulär och enkel att komplettera med JavaScript för framtida funktionalitet.

## 4. Designidéer för statisk HTML/CSS

- **Enkel navigering** med tre sektioner/sidor: Budget, Resultat, Balansräkning (t.ex. via tabbar eller sidlänkar i sidhuvud).
- **Tabeller med redigerbara fält** (input eller textarea i varje cell där användaren skriver in siffror).
- **Summarader** i tabellerna med automatiskt uppdaterade värden (i MVP: dessa kan vara manuellt ifyllda eller summerade med enkel CSS-styling).
- **Färgkodning**: Använd CSS-klasser för att färga positiva tal grönt och negativa rött.
- **Diagram**: Skapa stapeldiagram med hjälp av CSS (div-taggar med olika bredd/höjd och färg).
- **Responsivitet**: Media queries i CSS för att anpassa layouten till olika skärmstorlekar.

## 5. Exempel på sidstruktur

1. **Startsida / Navigering**
    - Kort introduktion och länkar till sektionerna.

2. **Budget**
    - Tabell: Kategori | Belopp | Kommentar

3. **Resultat**
    - Tabell: Kategori | Budget | Utfall | Differens

4. **Balansräkning**
    - Tabell: Tillgångar | Belopp
    - Tabell: Skulder | Belopp
    - Summering: Eget kapital

5. **Översikt**
    - Nyckeltal och diagram (kan vara på startsidan eller en egen sektion).

---

## 6. Exempel på HTML-struktur (utdrag, Budget-sektion)

```html
<section id="budget">
  <h2>Budget</h2>
  <table>
    <thead>
      <tr>
        <th>Kategori</th>
        <th>Belopp</th>
        <th>Kommentar</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Lön</td>
        <td><input type="number" placeholder="0"></td>
        <td><input type="text" placeholder="Ex. nettolön"></td>
      </tr>
      <tr>
        <td>Hyra</td>
        <td><input type="number" placeholder="0"></td>
        <td><input type="text"></td>
      </tr>
      <!-- Fler rader -->
      <tr class="summary">
        <td><strong>Summa</strong></td>
        <td><span class="summa">0</span></td>
        <td></td>
      </tr>
    </tbody>
  </table>
</section>
```

## 7. Exempel på CSS-design

```css
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
.summary {
  background: #f0f0f0;
  font-weight: bold;
}
.positive {
  color: green;
}
.negative {
  color: red;
}
@media (max-width: 600px) {
  table, thead, tbody, th, td, tr { display: block; }
  th { display: none; }
  td { border: none; }
}
```

---

## 8. Framtida utveckling (utanför MVP)

- Möjlighet att spara data lokalt (localStorage) eller exportera till fil.
- Lägg till grafer med JavaScript.
- Fler språk.
- Inloggning och molnlagring.