# Alpine Hiking 6E – DEM & Contours – UltraJourneys

https://ultrajourneys.org/alpine-hiking-6e-dem-contours/

Alpine Hiking 6E – DEM & Contours

 December 21, 2021

 Peter Van Geit

A Digital Elevation Model (DEM) is a representation of the bare ground (bare earth) topographic surface of the Earth excluding trees, buildings, and any other surface objects. The Shuttle Radar Topography Mission (SRTM) is an international research effort that obtained digital elevation models on a near-global scale, to generate the most complete high-resolution digital topographic database of Earth.

In QGIS it’s easy to download SRTM DEM data which can be used to generate contours. In this module we will generate 50m contours for the Survey map 52d/6 to make it a proper topographic map showing elevation data. Open the QGIS menu and zoom into the region covered by map 52d/6. Next let’s install the &#8220;SRTM-Downloader&#8221; plugin. See Image 1 below.

The new plugin can be accessed through the &#8220;Plugins&#8221; main menu, &#8220;SRTM-Downloader&#8221;. Click &#8220;Set Canvas&#8221; extent to automatically load the latitude, longitude coordinates for the current QGIS window. Click &#8220;Download&#8221; next. You will be requested to provide a login for NASA’s EarthData. Click on the URL to create a new profile. See Image 2+3+4 below.

After completing this process you will be able to download SRTM data in QGIS as a new raster layer. Dark areas correspond to low altitude regions (valleys). White areas correspond to high ranges (ridgelines). Hide / Show the new DEM raster layer to verify this on the underlying Survey map layer. See Image 5 below.

SRTM Downloader plugin

Downloading SRTM DEM data for selected coordinates

Enter your EarthData login credentials. Click the URL to create a new one

Login or Click Register to create a new EarthData login profile

SRTM data downloaded in QGIS as a new raster layer

Generating contours

We can now generate contours from the downloaded DEM data which can be overlaid on top of an existing map. First check whether the &#8220;GRASS&#8221; plugin is installed (This option should have been enabled while installing QGIS in module 1). See Image 1 below.

Next, go to menu &#8220;Raster&#8221;, &#8220;Extraction&#8221;, &#8220;Contours&#8221;. Select the newly downloaded DEM raster layer as input layer and set interval to 50m (works well with 1:50K scale Survey map). Click &#8220;Run&#8221; to generate contours in a new vector layer in QGIS. See Image 2 below.

You can now uncheck (hide) the DEM layer and just check (show) the Survey map and newly created contour layer and zoom into any part of the Survey map layer to see the contours clearly revealing the topography of the map – valleys, ridges, peaks, etc. Congrats! You have just created the most detailed topographic map for your alpine style exploration journey! See Image 3 below.

Right click on the contour layer and a choose a dark gray color and stroke with of 0.15 mm for optimum rendering of the contours on the Survey map. Don’t forget to save your newly created contour layer as a &#8220;ESRI shapefile&#8221; for future use. See Image 4 below. You can also overlay your contour layer on any other basemap, e.g. Google Satellite. See Image 5 below.

GRASS plugin offering advanced raster and vector processing tools in QGIS

Extracting contours from DEM layer

50m DEM generated contours overlaid over a Survey map

Saving your contours as an ESRI shapefil

50m contours shown over a Google Satellite base map adding a topographic layer on top

Assignment

Submit the form below acknowledging the fact that you have gone through the above tutorial.

Submit Assignment

 Posted in: 6 GIS, Alpine Bootcamp DIY, Topography

 Filed under: GIS, Topography

## Links

- https://ultrajourneys.org/author/peter_journeys/
- https://lh6.googleusercontent.com/tsvxrxfYM44VcVrivqCs22SMLgCVqejM8aizyxuSR2vHSp-wwsnT-CHgkNxIqNrgre6osH34Lfi8vOyYMUCjhtQFrDgQcIQp-lfrjvsueg8KERv2iVWW5wpNllxdol7dww=w1218
- https://lh6.googleusercontent.com/i4BtAG79kbVDYqaBF0v4JJUOVdEoLX1GUe_k48SeN9Jsk3NInw_-sEzcoFxIunwCdQG9rW1CxK-LchXYTUAjHv3LiTBTgXNQKF4YVJC-S0AwP50KfxUep_2866x93O8pfw=w388
- https://lh3.googleusercontent.com/2SiuacpM3xjRt8IEZTn6655otPeXJkfTp8W8dPObWUfBXB09JnNPWzYeBL3Z8PvAS4J-MJ94KC5X0zyORA1otwXjXlG1iEilfQuMkgsjtmbGfU85oko5gIAjocLGtDTu8g=w398
- https://lh5.googleusercontent.com/fcJPnIzQgumP61YG0-lpbljMa4EILcIHNywGCoEaE_DHaBXikMETbGL5PlJgWtYVu4Or3vxoOpXZyLH3k_EsrW2ZsLsY0ofvC43zpxV04AHuDDktFy3fqKZVvN7exaEw3w=w1392
- https://lh5.googleusercontent.com/ekrxUMZl8EY1xaBwHUWLe8BW4_dCGRw9CgkcE1cOl70JTe8QwRgv-dWE0c-g7xILKyR98m4ipkgUv7Le-jLrKUhsVmdGycrthVXO3jtzthMcKof9RmQJ-ezT1pLKuZlvpA=w1265
- https://lh4.googleusercontent.com/EBRnkVwyxXu5o62MFfBxM45yPgl2M6_jF3Jc7hoLVRyfB3RtCH7LTtn_mE2Ugr50wsTDFSTtdgfsoULMqUNMaSxSj8hJ6-0gsqWSprI7z_-96c7tJXDsLhOOrJ9sh98igw=w598
- https://lh6.googleusercontent.com/iOroV9PrpU5w1JjzK63BE35NcGnVccyuWH67FCA9NoqCb8AEGKAEJwpP1R9mibFoOpwg0CMcgnH674t77zc7hsyGd_TA_bT3DlPh0K1YH--dt3ChmbgF3XnAMmRcVGDlSQ=w961
- https://lh5.googleusercontent.com/T7nxS017o3eQsWY4FrT5EQ8KnLh_AwhoLqObDR0L-2aCtf-spzeyF-KPbWe6MZlHii4CTyXYqaon89mzgSkQMkEgxVDlZyMLHIcxV7rSOk0GwiNSNRj8D5nHH_SO_KFWZw=w1366
- https://lh4.googleusercontent.com/db3CUNsGw7uhIV-WnhmCy6SocvYEVoKEGZAkRt1f40RYpBz1zxWjpinbjuUu6E8D7hXl9h7EXhy3-w1vZ_gu1UyNXdk0Oc5yzHxvQrzUth7KfBNVqdRUdaOPCrur5fKvbQ=w544
- https://lh4.googleusercontent.com/jpbRe1FX3yKTowTTiJJs2AWWamwJs-X_wESIqhHD_BYG-NPPF3LbUsXfVYvc_hMWfjFJnw6oPFWOOasMpmhSCKIpxvSPZut-qHqVCGGxU3deeWE2KJWt1Aif2iBTS44eDw=w1366
- https://forms.gle/E2StTpd2AnkwUzyE8
- https://ultrajourneys.org/category/training/alpine-bootcamp/gis/
- https://ultrajourneys.org/category/training/alpine-bootcamp/
- https://ultrajourneys.org/category/maps/topography/
- https://ultrajourneys.org/tag/gis/
- https://ultrajourneys.org/tag/topography/
