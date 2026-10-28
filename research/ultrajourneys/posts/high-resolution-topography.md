# High Resolution Topography – UltraJourneys

https://ultrajourneys.org/high-resolution-topography/

High Resolution Topography

 May 19, 2025

 Peter Van Geit

Topography is represented on topographic maps through contour lines. Most contours are generated from 30 meter (1 arc sec) DEM (Digital Elevation Model) data. These contours give a fair representation of the overall topography but miss many smaller topographic details. To generate more accurate topography we require higher resolution DEM. The NASA EarthData ASF Data Search Vertex site provides 12 meter DEM (nearly 3 times better) which allows us to identify finer topographic details. Follow below steps:

Open website: https://search.asf.alaska.edu

Dataset: ALOS PALSAR

Area of Interest: Draw a box

Filters: Hi-Res Terrain Corrected

Search

Multiple data-sets are shown matching your area of interest

Download the data set you prefer

The 12m DEM data set is a compressed zip file with multiple files. Load the DEM TIFF file in QGIS:

Select the imported DEM layer

Raster – Extraction – Clip Raster by Extent

Raster – Extraction – Contours

Contour interval: 10m, Min zoom 13, Max zoom 16, Format JPG, Quality 90%

Refer chapter 6 / module 6 of the Alpine Field Bootcamp how to generate offline map tiles which can be downloaded in your phone for offline navigation. Comparison below:

left: 30m DEM / 10m contours (default in OSMAnd)

mid: 12m DEM / 10m contours (topography is more accurate)

right: 12m DEM / 5m contours (accurate topography + finer contours)

10m contours using 30m DED / 10m contours using 12m DEM / 5m contours using 12m DEM

You can download more accurate 10m contours generated from 12m DEM data for the Manali region over here. Open the SQLitedb file in OSMAnd and:

Keep your Map Source as Offline vector maps

Set your underlay map as: 12m_Contours_Manali

Built-in Contour lines: disable

Built-in Terrain: disable

 Posted in: Maps, Topography

 Filed under: Topography

## Links

- https://ultrajourneys.org/author/peter_journeys/
- https://ultrajourneys.org/wp-content/uploads/2025/05/image-13-1024x659.png
- https://ultrajourneys.org/wp-content/uploads/2025/05/image-10-1024x836.png
- https://search.asf.alaska.edu/#
- https://ultrajourneys.org/wp-content/uploads/2025/05/image-11-1024x862.png
- https://ultrajourneys.org/alpine-bootcamp/
- https://ultrajourneys.org/wp-content/uploads/2025/05/image-7-1024x767.png
- https://drive.google.com/file/d/1pQmGN799vEr2ujliPfH9n9LT6e3jwRRp/view?usp=drive_link
- https://ultrajourneys.org/category/maps/
- https://ultrajourneys.org/category/maps/topography/
- https://ultrajourneys.org/tag/topography/
