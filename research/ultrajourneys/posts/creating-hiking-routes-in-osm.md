# Mapping Hiking Routes in OSM – UltraJourneys

https://ultrajourneys.org/creating-hiking-routes-in-osm/

Mapping Hiking Routes in OSM

 November 6, 2020

 Peter Van Geit

See also Part 1 – Using JOSM and adding Hamlets

This short tutorial illustrates the steps to create a new hiking route in Open Street Maps through the JOSM editor. First step is to create a new trail (if not already existing in OSM). This can be done by looking at a satellite map (if trail is visible on map) or by importing a GPS recording of the trail (GPX file). We will be using a pre-existing GPS recording in this tutorial. In JOSM, open and select the GPX file (or drag n drop) to import it:

Use Imagery – Bing areal imagery menu to show satellite map in background. Next, zoom in and draw a trail over the imported GPX file: (same line tool used in part 1)

Note – sometimes the Satellite imagery is not accurately aligned so there might be a slight offset with the GPS line. In that case give priority to the GPS line. Make sure (at least one side of) the trail is connected to an existing road or trail such that routing in OSM will be possible across these connected highway objects:

After completing the trail add proper tags to it: highway=path

After doing so click the Green up icon on the toolbar to Upload All changes to Open Street Maps. Provide a brief comment and source (satellite map or source of GPX file) for the changes. After doing so the new trail should be visible on osm.org:

The trail is now part of Open Street Maps and can be hiked by anyone in the world using an OSM map viewer / mobile app to navigate. OSM has thousands and thousands of – sometimes smaller – trail segments which can – at times – be challenging to find (only shown at higher zoom levels) and sometimes quite chaotic (mesh of interconnected, sometimes incomplete trails). 

To present a more comprehensive view to the hiking community OSM has introduced an additional layer which can be put over this sometimes complex network of thousands of trail segments. One can define hiking routes – relationship objects in OSM which include one or more trail segments and which define a proper end-2-end hiking route. Hiking routes can be tagged as intercontinental / national / regional / local and will be shown accordingly in any OSM hiking route viewer like waymarked trails. At low zoom levels only intercontinental (red) and national (blue) routes are shown:

As we zoom into any specific region the regional (orange) and local (purple) trails will appear:

These are not shown at low zoom level not to overload the view. Selecting any route will show more useful information to the hiker: name, symbol, length, elevation profile, ect:

Hikers can download the GPX file to navigate the route offline using any mobile app. 

Let us now create a hiking route for the trail we added earlier in this tutorial. Ensure the &#8220;Relations&#8221; pane is visible in the right toolbar by enabling Relations in the Windows menu in JOSM. Select the earlier added trail object in the main window and add a new relation:

Add the proper tags to the OSM relation: type=route, route=hiking, and appropriate name, tag (2-3 letter acronym for route shown in route viewers) and network tags. Add the selected trail(s) (highway object) to the members of the relation:

For the network tag 4 levels can be used as per the extent of the hiking route:

After completing the above upload all the changes. Resolve any conflicts if any. Verify in osm.org that the trail is now part of a new relationship:

To see more details open waymarked trails and zoom in sufficient to show the newly added regional hiking route. Click on the hiking route to see more details:

That’s it! Congratulations for creating your first hiking route in Open Street Maps. The route is now visible to the international hiking community.

 Posted in: Mapping Himalayas, Open Street Maps

 Filed under: Mapping Himalayas, Open Street Maps

## Links

- https://ultrajourneys.org/author/peter_journeys/
- https://ultrajourneys.org/mapping-the-himalayas/
- https://josm.openstreetmap.de/
- https://ultrajourneys.org/wp-content/uploads/2020/11/Step1-2-1024x700.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/11/Step2-1024x701.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/11/Step2b-1024x700.jpg
- https://wiki.openstreetmap.org/wiki/Tag:highway%3Dpath
- https://ultrajourneys.org/wp-content/uploads/2020/11/Step3-1024x697.jpg
- http://osm.org/
- https://ultrajourneys.org/wp-content/uploads/2020/11/Step4-1024x643.jpg
- https://wiki.openstreetmap.org/wiki/Tag:route%3Dhiking
- http://hiking.waymarkedtrails.org/
- https://ultrajourneys.org/wp-content/uploads/2020/11/step5.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/11/step6.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/11/Step7-1024x876.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/11/Step7b-3-1024x776.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/11/relation-1.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/11/network-1024x265.jpg
- https://ultrajourneys.org/wp-content/uploads/2020/11/OSM-1-1024x792.jpg
- https://hiking.waymarkedtrails.org/#route?id=11842292&map=14.212785058181524!17.761!73.9752
- https://ultrajourneys.org/wp-content/uploads/2020/11/Waymarked-1024x981.jpg
- https://ultrajourneys.org/category/maps/mapping-himalayas/
- https://ultrajourneys.org/category/maps/open-street-maps-alpine-bootcamp/
- https://ultrajourneys.org/tag/mapping-himalayas/
- https://ultrajourneys.org/tag/open-street-maps/
