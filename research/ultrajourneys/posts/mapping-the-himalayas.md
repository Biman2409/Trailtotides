# Mapping Hamlets in OSM – UltraJourneys

https://ultrajourneys.org/mapping-the-himalayas/

Mapping Hamlets in OSM

 August 24, 2020

 Peter Van Geit

See also Part 2 – Mapping Hiking Routes

The Western Indian Himalayas are a true hiking paradise. Unfortunately they are largely unexplored due to the lack of good public available maps. In this short tutorial I demonstrate how to identify remote Himalayan villages and remote settlements using satellite maps and geo-map these into Open Street Maps (OSM) such that they start appearing on widely available public OSM map viewers and mobile apps.

We ll be using JOSM, a popular Open Street Map editor to identify and add new villages to the OSM public domain. To identify the names of these villages we will be referring to Survey of India (SOI) maps which are publicly available for download.

We ll be identifying both beautiful farming hamlets (above) in the valleys as well as remote, isolated settlements deep inside the forests and higher ranges (below). We will be using the standard OSM tags for mapping these populated places as explained over here: villages, hamlets, isolated dwellings and towns.

This effort will result in beautiful, detailed maps in numerous publicly available OSM viewers and mobile apps which can be used by anyone in the world for route planning and hiking the Himalayas – OpenTopoMap, WaymarkedTrails, OSMAnd, LocusMaps, etc.

At this moment I myself already mapped a huge amount of data on the Himalayas but given the vast extent I need more helping hands to complete mapping the entire region. Approximately 3000 trails, 600 passes, 600+ high altitude lakes, 800+ temples, 3000 villages, 2000 hamlets, 200 isolated dwellings and hundreds of shelters have been mapped so far. Thousands of villages, hamlets, dwellings still have to be mapped to complete the effort.

Ready to contribute?

Step 1. Create your Open Street Maps Account. Open osm.org in your web browser and click Sign Up in the top right corner. You can create a new account or sign up using your Google or Facebook account:

Step 2. Download & Install JOSM Open Street Maps editor from here (Windows Installer). After installation, start JOSM and go to the Edit – Preferences menu. In the Connection Sessions (globe icon), Authentication tab select the Use Basic Authentication option and enter your name and password: (created above in your OSM account)

Go back to the main screen. Select: Imagery – Bing aerial imagery to bring up Satellite Map background which we will use to identify villages:

Zoom into any part of the Himalayas at a scale of max. 2km (shown top-left) and click the Download Map icon (green down arrow on toolbar) to download OSM data. You will see forest boundaries, streams, villages, passes, geo-political boundaries&#8230; being shown:

Zoom into the map (use mouse rocker) and select any place to bring up its OSM tags in the right hand panel. In this case &#8220;name=Darsaun&#8221; (name of place) and &#8220;place=hamlet&#8221; (small type of village):

Types of Places

While adding new places to OSM we need to tag them appropriately as per size. We will focus on 4 types of places in decreasing size. First one is &#8220;place=town&#8221; (red icon) which is a larger urban center with hundreds of houses (less frequent in the mountains, only the main towns) like say Joshimath:

Next in line is &#8220;place=village&#8221; (orange icon) which is a smaller sized settlement with fewer facilities available usually connected by proper roads. Villages are larger settlements where the people from surrounding smaller hamlets go to for certain facilities like shops, transport, medical, etc.

Most common in the Himalayas however are the &#8220;place=hamlet&#8221; (yellow icon) which are typical small farming settlements of some 10 to 50 homes surrounded by terrace farmlands higher up the cultivated slopes or near forest boundaries with trails are smaller roads connecting them.

Finally we have the &#8220;place=isolated_dwelling&#8221; (green icon) which are the smallest type of human settlements (max 10 homes) in more remote sections of the mountains or deeper in the forest connected only by trails to the rest of the world. Many of these might be nomadic, seasonal or even uninhabited due to migration or climate change.

Ready for hands on!

Now that we understand the 4 basic OSM types of human settlements it’s time for some hands on!

Download and unzip this sample SOI map on your computer. It consists of a KML file (geo-coordinates) and PNG file in Files sub-directory (actual map). To import this map in JOSM we need to install the &#8220;PicLayer&#8221; plugin. Go to the Edit – Preferences menu and Search for piclayer. Install the plug in:

Go to the Imagery menu, select Others and New picture layer from file and select the doc.KML file from the location where you unzipped the map. 

Piclayer will show a message that KML calibration is still in beta stage. Just press OK to continue. You should now see the sample SOI map shown in its geo-referenced location. If not visible just drag the &#8220;53J_10&#8230;&#8221; layer before the &#8220;Bing aerial imagery&#8221; layer in the Layers panel on the right so that it is shown on top:

Zoom anywhere into the map and press the Download map icon to download the corresponding Open Street Maps data. You ll see that the hamlets (yellow icons), villages (orange), isolated dwellings (green) marked on the SOI map have already been added to OSM:

To verify the correct location of any place just zoom into that particular place and hide the SOI map in the layers panel to see the actual place on the Bing satellite map:

Adding a new Hamlet

Now let’s try adding a new hamlet to OSM with appropriate tags. Show the SOI map again in the Layers panel and locate &#8220;Titruna&#8221; hamlet in the top right corner of the SOI map and click the Download Map icon. You ll see the yellow icon (place=hamlet) displayed as below. Select the icon to show it’s OSM tags in the Tags panel on the right: &#8220;name=Titruna&#8221; and &#8220;place=hamlet&#8221;:

For the sake of learning we will now remove this hamlet from OSM and adding it back again with appropriate tags. Select the yellow icon and hit Delete on your keyboard to remove the hamlet. Click the Upload all changes (green up arrow) icon on the toolbar to upload the changes to the OSM database:

Give a brief comment to document your changes (Himalayan villages) and source (survey). Next click Upload Changes to commit the changes. The hamlet has been removed now from the global OSM database.

Next let us add it back again. Hide the SOI map in the Layers panel and zoom into the hamlet on the Satellite and select the Draw Nodes icon on the left toolbar. This tool is used to add nodes (places&#8230;), lines (trails, roads&#8230;) or areas (regions, lakes&#8230;):

Click once on the center of the hamlet on the satellite map and add two tags in the Tags panel on the right side: &#8220;place=hamlet&#8221; and &#8220;name=Titruna&#8220;:

Finally press Esc button on your keyboard to complete the edit. To commit the changes you again select the Upload All Changes (green up button) icon on the top toolbar:

Congratulations!

Congratulations! You have now mapped your first Himalayan hamlet into the Open Street Maps community! Anyone in the world will see your changes in their OSM map viewers and mobile apps. 

Ready to map some virgin regions of the Himalayas? Get in touch with me and I will assign you a still unmapped region with corresponding SOI map that has the place names to be verified on satellite map and added to OSM with appropriate tags as explained above. With multiple contributors mapping different parts we will soon create the most detailed Open Street Maps of the Himalayas!

 Posted in: Mapping Himalayas

 Filed under: Mapping Himalayas, Open Street Maps

## Links

- https://ultrajourneys.org/author/peter_journeys/
- https://ultrajourneys.org/creating-hiking-routes-in-osm/
- https://www.openstreetmap.org/
- https://ultrajourneys.org/wp-content/uploads/2020/08/Mapping3-1024x740.jpg
- https://josm.openstreetmap.de/
- http://www.soinakshe.uk.gov.in/
- https://ultrajourneys.org/wp-content/uploads/2020/08/WhatsApp-Image-2020-08-23-at-2.10.16-AM-1024x669.jpeg
- https://wiki.openstreetmap.org/wiki/Key:place#Mapping_populated_places_as_areas
- https://ultrajourneys.org/wp-content/uploads/2020/08/Snow.jpg
- https://opentopomap.org/#map=14/30.50929/79.41665
- https://hiking.waymarkedtrails.org/#?map=7!32.5156!79.238
- https://osmand.net/
- https://www.locusmap.eu/
- https://ultrajourneys.org/wp-content/uploads/2020/08/OSM-map-1024x698.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/OSM_-1024x545.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/osm_account-1024x734.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/JOSM10.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/JOSM-1024x641.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/JOSM2-1-1024x638.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/JOSM3-1024x636.jpg
- https://wiki.openstreetmap.org/wiki/Tag:place%3Dtown
- https://ultrajourneys.org/wp-content/uploads/2020/08/OSM-town-1024x722.jpg
- https://wiki.openstreetmap.org/wiki/Tag:place%3Dvillage
- https://ultrajourneys.org/wp-content/uploads/2020/08/Village.jpg
- https://wiki.openstreetmap.org/wiki/Tag:place%3Dhamlet
- https://ultrajourneys.org/wp-content/uploads/2020/08/Hamlet.jpg
- https://wiki.openstreetmap.org/wiki/Tag:place%3Disolated_dwelling
- https://ultrajourneys.org/wp-content/uploads/2020/08/IsolatedDwelling-1024x733.jpg
- https://drive.google.com/file/d/1XpiTO410EIEIStrYEYIFTXDaNVNc7IEW/view?usp=sharing
- https://ultrajourneys.org/wp-content/uploads/2020/08/JOSM-plugin.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/JOSM-import.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/JOSM-import2-1024x521.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/JOSM-import3-1024x746.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/JOSM-import4-1024x512.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/JOSM5-3-1024x641.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/JOSM7.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/JOSM8-1024x565.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/Titruna-1024x569.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/08/OSM-upload.jpg
- https://ultrajourneys.org/category/maps/mapping-himalayas/
- https://ultrajourneys.org/tag/mapping-himalayas/
- https://ultrajourneys.org/tag/open-street-maps/
