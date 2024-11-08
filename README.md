# Code-Analyser

A PySpark application for processing vehicle data using Delta Lake.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your actual credentials

## Usage

Run the main script:
```bash
python src/main.py
```

## Testing

Run the tests:
```bash
python -m unittest discover tests
