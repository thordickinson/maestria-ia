from dotenv import load_dotenv
load_dotenv()
import logging
from pathlib import Path

from src.etl.osm import get_nearby_places
from src.etl.geohash_stats import process_geohashes


Path("data/logs").mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler("data/logs/run.log"),
        logging.StreamHandler()
    ]
)

def __test_nearby_places():
    lat=4.657157641803628
    lng=-74.05602215637784
    places = get_nearby_places(lat, lng, 500, ["education", "healthcare"])
    print(places)


# Use Geohash Explorer https://geohash.softeng.co/
process_geohashes(["d2g6dud"], 7)

