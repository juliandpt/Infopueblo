import mariadb, sys, os
from geopy.geocoders import Nominatim
from dotenv import load_dotenv
load_dotenv()

try:
    conn = mariadb.connect(
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME")
    )
except mariadb.Error as e:
    print(f"Error connecting to MariaDB Platform: {e}")
    sys.exit(1)

cur = conn.cursor()
cur.execute("select NAME, AACC, id_town FROM towns where latitude is NULL")
geolocator = Nominatim(user_agent="infopueblo")
result = cur.fetchall()
num = 0
for i in result:
   if i[0] is None:
       i[0] = ' '
   if i[1] is None:
       i[1] = ' '


   place = i[0] + ', ' + i[1]
   num = num + 1
   location = geolocator.geocode(place)
   if location is None:
       continue

   cur.execute("update towns set latitude = " + str(location.latitude) + ", longitude = " + str(location.longitude) + " where id_town =  " + str(i[2]) + ";")
   print("coordenada " + str(num) + " insertada correctamente")

conn.commit()
cur.close()