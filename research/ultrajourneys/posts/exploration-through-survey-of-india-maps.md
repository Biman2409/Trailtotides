# Exploration through Survey of India maps – UltraJourneys

https://ultrajourneys.org/exploration-through-survey-of-india-maps/

Exploration through Survey of India maps

 August 24, 2021

 Peter Van Geit

This is a step-by-step tutorial how to identify, download, geo-reference, convert and use Survey of India maps for exploration using offline mobile navigation.

Step 1 – Identify survey map sheet nr

https://www.indigeo.com/iMap.html#10/32.6937/78.0442

Step 2 – Download survey map

https://onlinemaps.surveyofindia.gov.in/FreeMapSpecification.aspx

Step 3 – Convert to JPG

https://www.ilovepdf.com/

Step 4 – Clip the borders

Microsoft Paint

Step 5 – Geo-ref map + export as MBTiles

https://www.maptiler.com/

Check the right latitude, longitude coordinates mentioned at the corners of the original Survey map

Step 6 – Convert to SQLite format

Download:
https://github.com/tarwirdur/mbtiles2osmand

Run:
python3 mbtiles2osmand.py 47F_6_clip.mbtiles 47F_6_clip.sqlitedb

Step 7 – Load in OSMAnd

Download the SQLitedb file in your phone and set as Overlay map in OSMAnd

Congratulations! You are now ready to explore the region using offline Survey of India maps on your mobile phone

 Posted in: Survey of India

 Filed under: Survey of India

## Links

- https://ultrajourneys.org/author/peter_journeys/
- https://www.indigeo.com/iMap.html#10/32.6937/78.0442
- https://ultrajourneys.org/wp-content/uploads/2021/08/image-1024x714.png
- https://onlinemaps.surveyofindia.gov.in/FreeMapSpecification.aspx
- https://ultrajourneys.org/wp-content/uploads/2021/08/image-1-1024x610.png
- https://www.ilovepdf.com/
- https://ultrajourneys.org/wp-content/uploads/2021/08/image-2-1024x610.png
- https://ultrajourneys.org/wp-content/uploads/2021/08/image-3-1024x686.png
- https://ultrajourneys.org/wp-content/uploads/2021/08/image-4-1024x668.png
- https://ultrajourneys.org/wp-content/uploads/2021/08/image-5-1024x668.png
- https://ultrajourneys.org/wp-content/uploads/2021/08/image-6-1024x668.png
- https://github.com/tarwirdur/mbtiles2osmand
- https://ultrajourneys.org/wp-content/uploads/2021/08/image-8.png
- https://ultrajourneys.org/wp-content/uploads/2021/08/image-7.png
- https://ultrajourneys.org/wp-content/uploads/2021/08/image-9-698x1024.png
- https://ultrajourneys.org/wp-content/uploads/2021/08/image-10-461x1024.png
- https://ultrajourneys.org/category/maps/survey-of-india/
- https://ultrajourneys.org/tag/survey-of-india/
