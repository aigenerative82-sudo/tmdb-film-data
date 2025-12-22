# tmdb-film-data

Curated, machine-friendly collection of film metadata derived from The Movie Database (TMDB). This repository provides a reusable dataset and convenience examples for analysis, exploration, and reproducible research on films (titles, release dates, genres, ratings, runtime, crew, companies, and other metadata fields).

Maintainer: @vyshnave1997

---

Table of contents
- [About](#about)
- [Contents / Project layout](#contents--project-layout)
- [Data schema (typical fields)](#data-schema-typical-fields)
- [Usage examples](#usage-examples)
  - [Load dataset with Python (pandas)](#load-dataset-with-python-pandas)
  - [Load dataset with Node.js (JavaScript)](#load-dataset-with-nodejs-javascript)
- [Reproducing / refreshing the dataset (how it was collected)](#reproducing--refreshing-the-dataset-how-it-was-collected)
- [TMDB terms & attribution](#tmdb-terms--attribution)
- [Contributing](#contributing)
- [License](#license)
- [Contact / Issues](#contact--issues)

---

## About

This repository stores film metadata exported or derived from The Movie Database (TMDB). It is intended for:
- Data analysis and exploratory data science.
- Building simple recommender prototypes, dashboards, visualizations.
- Education and reproducible examples using real-world movie metadata.

Important: this repo contains metadata only (no video or infringing content). All original metadata are subject to TMDB's policies and copyright as described below.

---

## Contents / Project layout

A suggested/typical layout (actual files in the repository may vary):

- data/
  - movies.csv            — primary table of film metadata (CSV)
  - movies.json           — same data in JSON format
  - credits.csv           — cast & crew records per movie
  - ratings.csv           — aggregated ratings or external ratings (if included)
- scripts/
  - fetch_tmdb.py         — example script to request TMDB API and build dataset
  - normalize.py          — cleanup / normalization utilities
- notebooks/
  - exploration.ipynb     — example Jupyter notebook(s)
- README.md
- LICENSE

If a file referenced above is not present in this repo, consider it a recommended structure for adding new data or scripts.

---

## Data schema (typical fields)

Fields may vary between exports. Common fields you can expect:

- tmdb_id — (integer) TMDB movie id
- title — (string) movie title
- original_title — (string)
- overview — (string) synopsis / description
- release_date — (YYYY-MM-DD)
- runtime — (integer) runtime in minutes
- genres — (array or pipe-separated) genre names or ids
- vote_average — (float) average user rating on TMDB
- vote_count — (integer)
- popularity — (float)
- original_language — (string, e.g. "en")
- production_companies — (array)
- production_countries — (array)
- budget — (integer, if available)
- revenue — (integer, if available)
- poster_path / backdrop_path — (strings — relative TMDB image paths)
- homepage — (string URL)
- tagline — (string)
- status — (string, e.g. "Released")

If you need a canonical field list for scripts/notebooks, check the headers of CSV files in `data/` or the top-level JSON schema.

Example JSON-like row (illustrative):
{
  "tmdb_id": 550,
  "title": "Fight Club",
  "original_title": "Fight Club",
  "release_date": "1999-10-15",
  "runtime": 139,
  "genres": ["Drama"],
  "vote_average": 8.4,
  "vote_count": 18000,
  "overview": "A depressed man ...",
  "production_companies": ["20th Century Fox"],
  "original_language": "en"
}

---

## Usage examples

Load the dataset quickly for analysis.

Load CSV with Python (pandas)
```python
import pandas as pd

# adjust path as needed
df = pd.read_csv("data/movies.csv", low_memory=False)
print(df.shape)
print(df.columns)
print(df.head())
```

Filter films released after 2010:
```python
df['release_date'] = pd.to_datetime(df['release_date'], errors='coerce')
recent = df[df['release_date'].dt.year >= 2010]
```

Load JSON with Node.js
```js
// Node 18+ or use a JSON file reader
import fs from 'fs/promises';

async function load() {
  const raw = await fs.readFile('data/movies.json', 'utf8');
  const movies = JSON.parse(raw);
  console.log(movies.length);
}

load().catch(console.error);
```

Notes:
- Some fields are arrays encoded as strings in CSVs (e.g. "['Drama','Comedy']"). Use a parser or normalization script in `scripts/` to convert to native lists.
- Use `low_memory=False` in pandas if you encounter dtype warnings.

---

## Reproducing / refreshing the dataset (how it was collected)

If you want to regenerate or update the dataset from TMDB:

1. Obtain a TMDB API key
   - Create an account at https://www.themoviedb.org/
   - Follow https://developers.themoviedb.org/3/getting-started/introduction to get an API key.

2. Use a script to fetch details
   - A simple Python pattern:

```python
import os
import time
import requests

API_KEY = os.getenv("TMDB_API_KEY")  # set this in your environment
BASE_URL = "https://api.themoviedb.org/3"

def fetch_movie_details(tmdb_id):
    url = f"{BASE_URL}/movie/{tmdb_id}"
    params = {"api_key": API_KEY, "language": "en-US"}
    r = requests.get(url, params=params)
    r.raise_for_status()
    return r.json()

# Example usage:
# details = fetch_movie_details(550)
# time.sleep(0.26)  # be polite with rate limits
```

3. Respect rate limits and attribution
   - TMDB enforces request limits and requires attribution — see TMDB docs.
   - Cache responses locally to avoid re-querying for the same id.

4. Normalize
   - Convert nested fields (genres, companies) into a flattened or relational format depending on your analysis needs.

If you find or include a `scripts/fetch_tmdb.py` in this repository, use it as the canonical script to reproduce the `data/` files.

---

## TMDB terms & attribution

This project uses metadata sourced from The Movie Database (TMDB). Please note:
- TMDB data and images are subject to TMDB's Terms of Use and licensing. See: https://www.themoviedb.org/terms-of-use and https://developers.themoviedb.org/3/getting-started/attribution
- If you redistribute data or display images sourced from TMDB, follow TMDB attribution requirements.
- This repository does not claim ownership of TMDB content.

---

## Contributing

Contributions are welcome. Typical ways to contribute:
- Report problems or suggest additions via Issues.
- Add data-cleaning scripts under `scripts/` and reference them in README.
- Add example notebooks showing analyses or visualizations under `notebooks/`.
- Submit pull requests that include tests / small, well-documented changes.

When opening PRs:
- Describe the change and reason.
- Include a small sample of data or a script output if relevant.
- Respect privacy and licensing — do not add private API keys or restricted content.

---

## License

See the repository LICENSE file for the repository's license (if present). Note separately:
- Data derived from TMDB is subject to TMDB's policies and must be used according to their terms.

---

## Contact / Issues

For problems, feature requests, or questions, please open an issue in this repository. For urgent or private concerns you can contact the maintainer @vyshnave1997.

Thank you — enjoy exploring the dataset!
