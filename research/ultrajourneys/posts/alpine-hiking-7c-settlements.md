# Alpine Hiking 7C – Settlements – UltraJourneys

https://ultrajourneys.org/alpine-hiking-7c-settlements/

Alpine Hiking 7C – Settlements

 December 25, 2021

 Peter Van Geit

As mentioned in earlier chapters, human settlements are important base points for the alpine style hiker (food supply, night shelter, recharge electronics, guidance). In this chapter we will see how to map human settlements (OSM tag &#8220;place&#8221;) in Open Street Maps through the web client osm.org.

First of all let’s familiarize ourselves with the &#8220;place&#8221; hierarchy in OSM:

city – largest urban settlement within the territory.
town – important urban center, between a village and a city in size
village – smaller distinct settlement, smaller than a town with few facilities available with people traveling to nearby towns to access these
hamlet – smaller rural community, typically with fewer than 50-100 inhabitants, and little infrastructure
isolated_dwelling – smallest kind of settlement usually located remotely (few households)

Below we can see an overview of OSM places around Chamba in Himachal using QGIS. We usually find villages (red) in main valleys connected by roads, farming hamlets (yellow) higher up the valley slopes and isolated_dwellings (green) deeper inside the mountains / forest. See Image 1 below.

Similarly in osm.org we can see towns appear at zoom level 9, villages (zoom 12), hamlets (zoom 14) and dwellings (zoom 16). See Image 2 below.

https://www.openstreetmap.org/#map=14/32.5628/76.1603&layers=Y

Villages (red), hamlets (yellow), dwellings (green) around Chamba in Himachal. Left shows total count of OSM places across the Western Himalayas

Hamlets around Chamba in Himachal shown in osm.org

Sample Settlements

Let’s take a closer look at a few example settlements below to get an idea of the different types of places defined in Open Street Maps:

Belakkhal, an isolated dwelling consisting of a handful of homes deep inside the mountains surrounded by forest located at higher altitude, covered in winter snow here.

An unknown farming hamlet consisting of some 10-20 homes surrounded by farmlands in an open clearing in the forest on the valley slope.

Budha Kedar, a road connected village with basic facilities like medical, school, shops, etc of some 100-200 homes.

Chamba, a town or larger urban center in the Ravi river valley of some 500+ homes.

Belakkhal isolated dwelling

Unknown farming hamlet

Budha Kedar village

Chamba town

OSM Editor

Let’s take a look now how to map new human settlements into Open Street Maps. In previous chapters we already saw how to add settlements (as POIs) through OSMAnd as we encounter them while hiking in the mountains.

Now, let’s map some new settlements from an external data source into OSM. Open &#8220;osm.org&#8221; in your browser, log-in to your OSM account (top right) and click &#8220;Edit&#8221; to start mapping. Next, let’s download a set of geo-tagged settlements from the NGA (US National Geospatial-Intelligence Agency) database:

https://drive.google.com/file/d/19JmhAbvaXTFM4rLhHw5F874WhxSKyDO3/view?usp=sharing

Drag-n-drop this GPX file into the main osm.org window. See Image 1 below.

Settlements downloaded from NGA overlaid in OSM Editor

Mapping settlements

The settlements downloaded from NGA are tagged with their &#8220;approximate&#8221; location and name. We will verify their exact location on the satellite map to accurately map them into OSM. Select &#8220;Esri World Imagery (Clarity) Beta&#8221; from the layers icon to bring up a satellite map background. See Image 1 below.

Zoom into any of the NGA imported settlements to verify their existence and exact location to add in OSM. Zoom in until the &#8220;+ Zoom in to edit&#8221; message disappears. We can only add objects in OSM at higher zoom levels to ensure accuracy.

We zoom into &#8220;Kamkaribaihk&#8221; until we see the settlement on the Satellite map. Select &#8220;Point&#8221; and click in the center of the settlement. You’ll first have to indicate the OSM type – in this case &#8220;hamlet&#8221; (some 20 homes) and set the corresponding name. See Image 2 below.

Similarly zoom into &#8220;Bat&#8221; until the nearby settlement appears on the Satellite map. Select &#8220;Point&#8221; and click in the center of the settlement. In this case we choose type &#8220;Isolated Dwelling&#8221; (handful of homes) and set the corresponding name. See Image 3 below.

Mapping remote settlements in OSM Editor using satellite map

Mapping Kamkaribaihk hamlet into OSM

Mapping the &#8220;Bat&#8221; isolated dwelling in OSM

Uploading changes to OSM

After mapping a few places through the osm.org editor we can upload the same to the global OSM database. Click &#8220;Up arrow&#8221; icon (top right), provide a Changeset Comment (proper description) and Sources (NGA) used for mapping. Click &#8220;Upload&#8221; to commit the changes and make them visible to the entire OSM community. See Image 1 below.

You can review your recent changes through your OSM profile, &#8220;My Edits&#8221; and click on any recent Changeset to view the details. You can click on any of the individual objects in the Changeset. See Image 2+3 below.

Congratulations! You now mastered how to map human settlements in Open Street Maps. Similarly we can map features digitized from other map sources into OSM.

Uploading newly mapped changes to OSM

Viewing recently mapped changes in OSM

One of the objects (place=isolated_dwelling) mapped in above Changeset

Assignment

Time for some hands-on now to apply the concepts learned in this module. Download (only) one of below NGA sets below and map at least 5 settlements in OSM:

https://drive.google.com/file/d/19JmhAbvaXTFM4rLhHw5F874WhxSKyDO3/view?usp=sharing
https://drive.google.com/file/d/143UyuYoVYmPFRnrw7sXw8cNU-JT8cWlv/view?usp=sharing
https://drive.google.com/file/d/1T15GxlpKZfibd2PSLtdKSMoran3EN3q1/view?usp=sharing
https://drive.google.com/file/d/1pUfuy_kI19xGTU8iRV5Oyr-aEZTbpDDm/view?usp=sharing

Ensure to specify the correct type (village, hamlet, isolated dwelling) for each place mapped.

Submit Assignment

 Posted in: 7 Open Street Maps, Alpine Bootcamp DIY, Open Street Maps

 Filed under: Open Street Maps

## Links

- https://ultrajourneys.org/author/peter_journeys/
- https://www.google.com/url?q=http://osm.org&sa=D&source=editors&ust=1642746574889963&usg=AOvVaw1TS1EyfJY1zt_THGGNn_Xb
- https://www.google.com/url?q=http://osm.org&sa=D&source=editors&ust=1642746574890108&usg=AOvVaw09tmA_x0LYGjBfAvAX1148
- https://www.openstreetmap.org/#map=14/32.5628/76.1603&layers=Y
- https://lh5.googleusercontent.com/5Fmu1iWl0lEE9bBJ58FlO4vVPjMF3U5D0BOjHpBH9dYWX3J9oJ1twWIDBwsgLb2GBM7Dxg2DAamJUSTZLkLmKt7uBhmlp3i96nhkAKrYkO6V3ZjwCY4hQpOQvfXIDHAMtw=w1365
- https://lh6.googleusercontent.com/kiM_xZMnt-IHuLhtDrZcPxyUH1kWUsGjjmwSA736rBOhQ0-tWmm8kqVw1SqEA9MoF1wtOMOTfdC_DCQDnhnyTyIjCMHl4ltkIFG5eEUg5D8tfQSrS4RRSMbgFtwwEaeSpQ=w1398
- https://www.google.com/url?q=http://osm.org&sa=D&source=editors&ust=1642746574891052&usg=AOvVaw3cOlm78Byo5Y1_BMu_etRC
- https://lh6.googleusercontent.com/-wYbA4eWqfbj5odxeBSp5N06bsJeoyJymRDFZd1kBoSFS3KD79Mdi-dY1HrPgeE9RmkfINuiCBIuC67tlN4Ho5cdopi_k_z9vnEyclO9qgppnLV4u2mBx-8rNTrcLE1FWg=w863
- https://lh5.googleusercontent.com/GCFcB3-3mupTiM3kPwghg-ldo4VtsRFRvTZyYZMT29d0zTJKh-BfnSGUwznyBAS8YiAEQpu1L9xq6MopZ4YDIcs7LpRdGm5GKfRSQbmxKV1jrPB4K35O5OZ2Q61buOI8_g=w1280
- https://lh6.googleusercontent.com/07lX6iQfZN6QZIePrehXFNl6jbUeydUruvbRmQPP7r9Xsn2YODITAdjL77kjWQ81Dv7UzcmuefqXVjoSUApeAAzr801PvDhY4jF4b9jqqv2GF3Fynt9ek5K_kx-MCR3Wig=w1269
- https://lh6.googleusercontent.com/Uu1bIHmQzLXKccFeDg5aFboVBIRYhrG2Vx2cDEzngsEQ861jcGDbNcoI3h9RF_qqgdPtXNvPJrD5YHoD4rQFVT7UBsB8XNdduI0QJ00ntRZ5a82SYJHDice9xxRmfWs9XQ=w1121
- https://www.google.com/url?q=http://osm.org&sa=D&source=editors&ust=1642746705650395&usg=AOvVaw1yXq76HHUon-QOLhoaP4W9
- https://drive.google.com/file/d/19JmhAbvaXTFM4rLhHw5F874WhxSKyDO3/view?usp=sharing
- https://www.google.com/url?q=http://osm.org&sa=D&source=editors&ust=1642746705650586&usg=AOvVaw0kENoxq-fQwUspTqJ5ofd_
- https://lh6.googleusercontent.com/6XJxIkOoMMIyu4WhcEmmnG27apmaZG8eTTSmwwhZV7zHAh-KIyZeAwkIQGDyLN1jlQhVCm0kBq8fXygqbYI4yJTQ8NM-ScdyASu6FZZ_MtXD5naX3pDJ3szZkuLabbNLqA=w1302
- https://lh6.googleusercontent.com/LOCyuh7mEEqMghCho6NMptrLyLnoyTRMcTJufmtUIK3MGmOhBwaE-TnHi-COJGz0KcQ_GTDyKLe5fxhU3bP_px80lTSpBSfvKeo-N-W4Iw5mfifLoECgl3eYzbEW1giIMA=w1302
- https://lh6.googleusercontent.com/VVeDyCmaa_pqQOqPA9DpYe6eEkKqpybAKN1m0L1i0226YZcVxRLAVLQLS5JzrxQTE5KUXFQ0o4UvpZ31brcm7MuAiz973al_QQWBF1cSaZZIj3JeyV8-8tECAKO-a5aKyA=w1302
- https://lh3.googleusercontent.com/gS-vfUIOGXTWPbTaru_RhIftkH79PHfnNaD-X2a98SpC2R_PT9m6y9Y-KlNgHkb60DEUPguqOnqhfEf4Q6W0xrSXOP0ZBTi-fX2APoBXWq-QwcgBXsx36T2dq_EX5u8nlA=w1302
- https://www.google.com/url?q=http://osm.org&sa=D&source=editors&ust=1642746808918217&usg=AOvVaw251damm_f-d2N7e7kOWd13
- https://lh4.googleusercontent.com/lPWz13bcUIUFlp6M0SvGuuPNEYm9NZnk3QOmy1YQlRyvEJ6j1yQ4Y8RRZyHdzpElmEkxPnMN7ty9kbnzyJRz7NLSwU4yL1z9FkFsN0rzyaXhW7_2LbZgKSV-vehkpwSTfg=w1302
- https://lh5.googleusercontent.com/UDd32IFLP8rgXtIJKFMIsf_5AQsWvWXq1LCgzliARa2TNSoXSZ6q5Ubu6Ovg-bqpC6wqayQq5kpOPr-yT5-fVXWxR2syD3TWiKH8K2PDZixNRjXZ8ot6DKeJa8-jskdQVw=w1302
- https://lh5.googleusercontent.com/4IFFUB8lE2T_tPG6UirGuM137jTW7FzY3MDOPJHMieArR8hT_gIbtDg6DKkCvw-EtT0f5b9NtV1WXgJConpU1i3Iy2iG15Y1bGrjDUei-dy8I-97BUPvXhiWxyYcZKNYmw=w1302
- https://www.google.com/url?q=https://drive.google.com/file/d/19JmhAbvaXTFM4rLhHw5F874WhxSKyDO3/view?usp%3Dsharing&sa=D&source=editors&ust=1642746875519361&usg=AOvVaw1STLCm1N5ooFxfYNDZZTd2
- https://www.google.com/url?q=https://drive.google.com/file/d/143UyuYoVYmPFRnrw7sXw8cNU-JT8cWlv/view?usp%3Dsharing&sa=D&source=editors&ust=1642746875519462&usg=AOvVaw1rBAzNSSLlmaM8V8pGEsRI
- https://www.google.com/url?q=https://drive.google.com/file/d/1T15GxlpKZfibd2PSLtdKSMoran3EN3q1/view?usp%3Dsharing&sa=D&source=editors&ust=1642746875519512&usg=AOvVaw2lx63L_tw5nD-SuJxlfypk
- https://www.google.com/url?q=https://drive.google.com/file/d/1pUfuy_kI19xGTU8iRV5Oyr-aEZTbpDDm/view?usp%3Dsharing&sa=D&source=editors&ust=1642746875519562&usg=AOvVaw2nOXc9EJc4bHf4aSRe4wQ9
- https://lh3.googleusercontent.com/kMUYf-7tTNLDGmdbERdaMKsTiWRwOVXuXO63jpVx9O8_QBwZKozQNglTBW7hOU3kY3rsyeCzg-uSG1G08nCpCdsbTH5iTkabUwgDj1a0okNtWqqcF3821cqSkfYzp3M4EA=w1302
- https://forms.gle/J8pB6V9XRZUD6QhV8
- https://ultrajourneys.org/category/training/alpine-bootcamp/7-open-street-maps/
- https://ultrajourneys.org/category/training/alpine-bootcamp/
- https://ultrajourneys.org/category/maps/open-street-maps-alpine-bootcamp/
- https://ultrajourneys.org/tag/open-street-maps/
