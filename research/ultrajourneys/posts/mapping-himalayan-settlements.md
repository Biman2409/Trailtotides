# Mapping Himalayan Settlements – UltraJourneys

https://ultrajourneys.org/mapping-himalayan-settlements/

Mapping Himalayan Settlements

 February 16, 2021

 Peter Van Geit

In this step-by-step tutorial I provide a quick overview on how to map human settlements in Open Street Maps. Settlements are important for alpine hikers to find their way in the Himalayas, resupply food, recharge electronics and possible night halt. In recent years around 40 thousand settlements in the Western Himalayas have been mapped in OSM providing a true treasure for the alpine explorer.

We will make use of the Survey of India maps and hires Satellite maps to identify and locate settlements in the Himalayas and map them accurately in OSM. We will make use of a versatile OSM editor called JOSM which can be downloaded from here. After installation configure your OSM credentials (required to make changes). Menu Edit – Preferences – OSM Server – specify username and password.

Next, we will be using two map layers to identify and locate settlements. First of all we add a hires satellite map layer. Menu – Imagery – Esri World Imagery. This will add a new map in the layers panel where we can show / hide the same. Zoom into any part of the Western Himalayas to view individual human settlements. This layer will allow us to confirm the existence and accurate locate settlements. 

Next we will install the WEBP image format plugin required to view Survey map tiles image format. Go to Edit menu – Preferences – Plugins – search for &#8220;webp&#8221; and install the webp-v0.0.4 plugin:

To identify the name and approximate location of settlements we will use the Survey of India maps. Let’s create a map source. Menu – Imagery – Imagery Preferences – Add new TMS (Tile Map Server) source:

URL: https://storage.googleapis.com/soi_data/export/tiles/{z}/{x}/{y}.webp

Name: Survey of India

We can now bring up Survey of Inda maps by adding a new map layer. Menu: Imagery – Survey of India. Zoom into any region of the Western Himalayas to view individual settlements (yellow = cultivated land, red squares = homes) and their respective names (black text). Survey maps are legacy maps (18th century) so the present day existence and exact location should be verified on the corresponding satellite map by hiding the Survey map and showing the satellite map layer.

Before we map any settlement in Open Street Maps we should first verify whether the same has already been mapped previously. To do so we can download OSM data for the currently viewed region using the green down arrow Icon on the toolbar. This will create a new &#8220;Data Layer&#8221; which shows all currently mapped OSM objects. Settlements are shown as red (town), orange (village), yellow (hamlet) or green (isolated dwelling) depending on its size. 

Select any settlement in the map view to display its OSM attributes in the Tags panel. In case of Bhutti below we see two tags: place=village and name=Bhutti. Zoom into any settlement to view the individual homes and surrounding farm lands on the satellite map. 

When loading OSM data for a certain region while viewing the Survey map we can easily identify which settlements are yet to be mapped. Below we can see that no OSM objects exist for various settlements: Bare Hiragran, Baragran, Palalang and Mathala.

To map new settlements in OSM we use the &#8220;Draw Nodes&#8221; icon on the left toolbar.

Step 1 – view the approximate location (and name) on the Survey map layer (image 1 below)

Step 2 – verify the existence & exact location on the Satellite map layer (image 2 below)

Step 3 – click in the center of the settlement on the sat map to add a new node (image 2 below)

Step 4 – add relevant tags for the settlement. E.g. place=village, name=Baragran (image 1 below)

After verifying & mapping several new settlements in JOSM you can upload the same to Open Street Maps. Click the green up arrow icon on the top toolbar to upload your changes. Provide a Description (e.g. &#8220;Himalayan settlements&#8221;) and Source (e.g. &#8220;Survey maps&#8221;, &#8220;Esri world imagery&#8221;) and click &#8220;Upload Changes&#8221; to commit your new mappings to the central OSM database.

When mapping a new settlement in the Himalayas in Open Street Maps do correctly identify the type as either village, hamlet or isolated dwelling. A village is a larger settlement (e.g. 100-200 homes) with basic facilities (medical, school, shops&#8230;), usually connected by road and lower into the valley. OSM tag place=village (color orange).

A hamlet is medium sized settlement (e.g. 20-50 homes) usually a farming settlement higher up the valley slopes and connected either by a trail or small road. Usually lacking most facilities found in a village. OSM tag place=hamlet (color yellow).

An isolated dwelling is a very small settlement (usually a handful of homes) fairly remote (deeper in the forest, higher up the valley slopes) usually only connected by trails. OSM tag place=isolated_dwelling (color green).

You are all set now to pick up any region in the Himalayas and map any yet unmapped human settlements in Open Street Maps for the benefit of the international / outdoor community.

Open Street Maps can be downloaded offline on your phone and used while navigating in the mountains. Alpine explorers use settlements for traverse planning, guidance, food resupply and possible night halt. Mapping all human settlements in any given region greatly supports the alpine hiking community.

 Posted in: Mapping Himalayas

 Filed under: Mapping Himalayas, Open Street Maps

## Links

- https://ultrajourneys.org/author/peter_journeys/
- https://ultrajourneys.org/wp-content/uploads/2023/02/Untitled-1024x637.jpg
- https://josm.openstreetmap.de/wiki/Download
- https://ultrajourneys.org/wp-content/uploads/2023/02/jos0-1024x596.jpg
- https://ultrajourneys.org/wp-content/uploads/2023/02/jos4-1024x621.jpg
- https://ultrajourneys.org/wp-content/uploads/2023/08/image-40-1024x687.png
- https://storage.googleapis.com/soi_data/export/tiles/%7Bz%7D/%7Bx%7D/%7By%7D.webp
- https://ultrajourneys.org/wp-content/uploads/2023/02/jos6.jpg
- https://ultrajourneys.org/wp-content/uploads/2023/02/jos5-1-1024x621.jpg
- https://ultrajourneys.org/wp-content/uploads/2023/02/jos8-1024x621.jpg
- https://ultrajourneys.org/wp-content/uploads/2023/02/jos7-1024x621.jpg
- https://ultrajourneys.org/wp-content/uploads/2023/02/jos9-1024x621.jpg
- https://ultrajourneys.org/wp-content/uploads/2023/02/jos10-1024x621.jpg
- https://ultrajourneys.org/wp-content/uploads/2023/02/jos2.jpg
- https://ultrajourneys.org/wp-content/uploads/2023/02/jos11-1024x621.jpg
- https://ultrajourneys.org/wp-content/uploads/2023/02/jos12-1024x621.jpg
- https://ultrajourneys.org/wp-content/uploads/2023/02/jos13-1024x621.jpg
- https://ultrajourneys.org/wp-content/uploads/2023/02/jos14-1024x621.jpg
- https://ultrajourneys.org/wp-content/uploads/2023/02/jos15-1024x982.jpg
- https://ultrajourneys.org/category/maps/mapping-himalayas/
- https://ultrajourneys.org/tag/mapping-himalayas/
- https://ultrajourneys.org/tag/open-street-maps/
