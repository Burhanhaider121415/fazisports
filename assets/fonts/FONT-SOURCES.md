# Self-hosted font sources

Both approved families were retrieved directly from the official Google Fonts API and are distributed under their included SIL Open Font Licenses.

- Barlow Condensed CSS/API: https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&display=swap
- Inter variable CSS/API: https://fonts.googleapis.com/css2?family=Inter:wght@400..600&display=swap
- Official font repository/license source: https://github.com/google/fonts/tree/main/ofl/barlowcondensed and https://github.com/google/fonts/tree/main/ofl/inter

The font binaries are self-hosted under this directory to avoid a third-party font request at runtime. Only the site's Latin text coverage is bundled. Barlow Condensed weights 600 and 700 are separate WOFF2 files; weight 400 is not included because the approved display roles use only 600 and 700. Inter is one variable WOFF2 covering weights 400–600. `OFL-Barlow-Condensed.txt` and `OFL-Inter.txt` preserve the respective licenses.
