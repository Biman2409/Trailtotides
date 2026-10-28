# Himalayan Geography & GIS – Part 4 – Topography – UltraJourneys

https://ultrajourneys.org/himalayan-traverse-planning-using-qgis-part-4-topography/

Himalayan Geography & GIS – Part 4 – Topography

 May 23, 2024

 Peter Van Geit

In this module we will be download satellite generated Digital Elevation Model (DEM) data, extract elevation data for Himalayan features, plan seasonal traverses, generate contours and hill shades and create an elevation profile for a Himalayan traverse.

Contents

Digital Elevation Model

Downloading Elevation Data

Visualization

Exctacting elevation

Seasonal traverses

Generating Contours

Generating Hill Shades

Elevation Profile

Digital Elevation Model

A Digital Elevation Model (DEM) is a representation of the bare ground (bare earth) topographic surface of the Earth excluding trees, buildings, and any other surface objects.

Shuttle Radar Topography Mission

The Shuttle Radar Topography Mission (SRTM) obtained elevation data on a near-global scale to generate the most complete high-resolution digital topographic database of Earth. SRTM consisted of a specially modified radar system that flew onboard the Space Shuttle Endeavour during an 11-day mission in February of 2000

Downloading Elevation Data

We will download DEM data from the NASA Earthdata website. To do so we have to create a profile.

https://urs.earthdata.nasa.gov//users/new

Set your map window centered around Kedarnath at scale 1:500K

We can download DEM data for the above region directly in QGIS using the SRTM Downloader plugin

Visualization

Six 1&#215;1 arc-degree DEM tiles are downloaded and merged into one raster layer spanning 30-31 degrees North and 78-80 degrees East and shown as below. The raster layer consists of 16 bit integers representing the elevation at each point from black (lowest) to white (highest)

Overlay rivers and peaks to see correlation with the downloaded elevation data

We can also visualize the raster layers using a more comprehensive color spectrum

Extracting Elevation

We can extract elevation for various terrain features from the DEM raster layer. Let’s identify the height of each OSM mountain pass downloaded in part 2. Select the &#8220;Drape&#8221; function from the &#8220;Processing Toolbox&#8221;

A new vector layer &#8220;Draped&#8221; is created which is a copy of &#8220;mountain_pass_yes&#8221; layer with &#8220;Z value&#8221; set to elevation. Click on the icon next to the layer and save it as an ESRI_Shapefile.

We can now visualize passes as per elevation. Click on Properties and set Symbology to &#8220;Graduated&#8221;, &#8220;Value=z($geometry)&#8221;, &#8220;Color ramp=Spectrum&#8221;, &#8220;Equal Interval&#8221;, &#8220;Classes=7&#8221;

We can also display the exact elevation next to the name

Seasonal Traverses

Let’s say we wish to plan a one week traverse in the month of April when the snowline is usually around 3000m. In this case we would want to focus on mountain passes below 3000m. Bring up the &#8220;Attribute Table&#8221; of the draped passes

The sub-3000m passes are selected in the attributes window and highlighted in yellow in the map window. We can overlay hiking routes and now plan a continuous traverse which touches only the passes which are open in the month of April

We can also export the sub-3000m passes in a GPX file for easy planning on the phone

The exported passes can be downloaded in any app on the phone for planning a suitable traverse in April

Generating Contours

We can also generate contours from the downloaded elevation data. Let’s generate 100m interval contours for the same region

A new line vector layer is created for the generated contours

Set Labels as &#8220;ELEV&#8221; attribute to show the actual elevation

Only show contours at minimum 1:60K scale to reduce clutter on the screen while zooming out to higher scales

Contours can be overlaid over other base maps to add topography

Generating Hill Shades

We can also generate hill shades from the elevation raster layer using the &#8220;Hillshade&#8221; function in the &#8220;Processing Toolbox&#8221;. This creates a new raster layer with hill shades.

Set the &#8220;Transparency&#8221; of the hillshade raster layer to 40% and overlay over the OSM basemap to add hill shades

We can also add contours to create a proper topographic map

Overlay Survey + Hillshades + Contour to create a proper topographic map

Elevation Profile

Let’s add elevation data to the POIs of our simple Himalayan traverse planned in the previous chapter. Run the &#8220;Drape&#8221; function from the &#8220;Processing Toolbox&#8221; on the &#8220;Khati to Sitel&#8221; vector point layer. A new vector layer &#8220;Draped&#8221; is created. Rename it as &#8220;Khati to Sitel Draped&#8221; and save it as &#8220;ESRI shapefile&#8221; format

Right click on the new layer and bring up the &#8220;Attribute Table&#8221;. Click icon &#8220;Toggle Edit&#8221; and &#8220;New Field&#8221; with name &#8221; &#8220;Name=&#8221;Elevation&#8221;.

Set &#8220;Elevation&#8221; field equal to&#8221;z($geometry)&#8221; and click &#8220;Update All&#8221; to copy the elevation retrieved from the DEM layer into this field

Now run the &#8220;Bar Plot&#8221; function from the &#8220;Processing Toolbox&#8221; on the draped POI layer. &#8220;Category=name&#8221; and &#8220;Value=Elevation&#8221;

Click on the html results link and open up the bar chart in your browser to see an elevation profile of your Himalayan traverse

Assignment

Download all glaciers in the Ladakh and visualize them as per elevation

 Posted in: GIS, Online Courses, Topography

 Filed under: GIS, Topography

## Links

- https://ultrajourneys.org/author/peter_journeys/
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-160-1024x576.png
- https://en.wikipedia.org/wiki/Digital_elevation_model
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-159.png
- https://en.wikipedia.org/wiki/Shuttle_Radar_Topography_Mission
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-163.png
- https://urs.earthdata.nasa.gov//users/new
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-162-1024x594.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-165-1024x653.png
- https://plugins.qgis.org/plugins/SRTM-Downloader/
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-161.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-164.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-166-1024x611.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-167-1024x609.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-168-1024x703.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-169-1024x609.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-170-1024x616.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-171-1024x519.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-172-1024x664.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-173-1024x722.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-176-1024x602.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-177-1024x716.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-179-1024x673.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-202-1024x678.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-204-1024x698.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-205.png
- https://drive.google.com/file/d/1JwJTJWJS6NN5gCYD1uOjZN8yb-B4rMcT/view?usp=drive_link
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-206-543x1024.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-207-541x1024.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-180.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-183.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-184-1024x720.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-191-1024x589.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-229-1024x552.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-189-1024x620.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-190-1024x600.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-208.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-192-1024x585.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-193-1024x680.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-196-1024x757.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-194-1024x657.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-197-1024x674.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-198-1024x665.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-199.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-200.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-210.png
- https://ultrajourneys.org/wp-content/uploads/2024/05/image-211-1024x479.png
- https://ultrajourneys.org/category/training/gis-training/
- https://ultrajourneys.org/category/training/
- https://ultrajourneys.org/category/maps/topography/
- https://ultrajourneys.org/tag/gis/
- https://ultrajourneys.org/tag/topography/
