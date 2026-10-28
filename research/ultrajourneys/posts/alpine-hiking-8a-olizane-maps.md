# Alpine Hiking 8A – Olizane Maps – UltraJourneys

https://ultrajourneys.org/alpine-hiking-8a-olizane-maps/

Alpine Hiking 8A – Olizane Maps

 December 28, 2021

 Peter Van Geit

Welcome to &#8220;Chapter 8 – Map Sources&#8221; of the Alpine Hiking Bootcamp. In this chapter we’ll compare topographic maps of the Western Himalayas from various sources:

Module 1 – Olizane Maps
Module 2 – Soviet Maps
Module 3 – AMS Maps
Module 4 – Digitizing trails
Module 5 – Comparison

In module 1E we had already learned about Survey of India maps. Each Survey map covers 15’x15&#8242; or roughly 28x28km and has a scale of 1:50K (1cm on the map equals 500m on the ground). Contours have been removed from many (not all) Survey maps. It takes around 60 Survey maps to cover an entire Himalayan state.

Projection is UTM (Universal Transverse Mercator) and Datum WGS84. Survey maps were created as part of the Great Trigonometric Survey as are no doubt the most detailed available of the Himalayas. As of August 2021 the Survey made most of the maps available to the public.

Survey of India map 52d/6

Olizane

Olizane maps are commercial maps produced with a Swiss company covering most of Ladakh and Northern Himachal. Olizane maps are topographic maps (100m contours), each map covering a large area of 1.3&#8243;x08&#8243; or 144x89km. They are usually available in large print format and very popular among European hikers visiting Ladakh.

At a scale of 1:150K (1cm on map related to 1.5km on the ground) Olizane is less detailed than a Survey map (1:50K). Olizane include less terrain details limited to hiking routes, passes, peaks, settlements. The hiking routes are indicate and less accurate than those on the Survey maps.

Download (a part of) an Olizane map covering the Pir Panjal:

https://drive.google.com/file/d/1f8RBRRVDghGkKhK4bA2xXO5UIgHlOHLR/view?usp=sharing

Olizane map projection, datum, scale and contour details

Geo-reference

Geo-reference the Olizane map as per module 6D (Raster, Geo-referencer). Mark an intersection of the X/Y lines near one of the corners of the map and set set the projection as WGS 84 / UTM Zone 43N. Repeat the same for all 4 corners. Press the green arrow icon twice to geo-reference the map. See Images 1 +2 below.

Geo-referencing an Olizane map using UTM zone 43N projection

Geo-reference Olizane map covering part of the Pir Panjal and Chenab river valley

Verification

We can verify if the Olizane map is properly geo-referenced (mapped to the right place) by referencing it with other (accurate) base maps. Right click on the Olizane map and set Transparency as 50%. See Image 1 below.

Next overlay the Olizane map on top of an &#8220;OpenTopoMap&#8221; base layer to see that both topography and terrain features (rivers, &#8230;) match. Aside the 100m contours on Olizane and 10m contours on OpenTopoMap you can see a clear match in topography (both use same SRTM DEM data). See Image 2+3 below.

Similarly we can overlay a 50% transparent Survey map 52d/6 over the Olizane map and cross check matching features (valleys, &#8230;). See Image 4 below.

Olizane map transparently overlaid over an OpenTopMap base map

Topography comparison between Olizane (top) and OpenTopoMap (bottom) map

Survey map transparently overlaid over an Olizane base map.

Comparison

We can compare the Olizane and Survey maps in QGIS, the larger scale (1:150K) Olizane map covering a much larger area (in less detail). See Image 1 below.

Fixing the QGIS scale (e.g. 1:25K) we can also compare the detail of the 1:50K Survey vs. 1:150K Olizane map. You can see much finer and richer detail in the Survey map even tough it is lacking any topography (contour lines). See Image 2 below.

Comparison of a Survey and (part of an) Olizane, each spanning a different sized region

Equal scale comparison of 1:50K Survey (left) and 1:150K Olizane (right) maps

Assignment

Acknowledge your understanding of the concepts learned above. Geo-reference the Olizane map and compare it in various ways (as above) with the existing OpenTopoMap and Survey maps in your QGIS project.

Topography showing 100m contours on an Olizane map

Submit Assignment

 Posted in: 8 Maps of the Himalayas, Alpine Bootcamp DIY, Himalayan Maps

 Filed under: Himalayan Maps

## Links

- https://ultrajourneys.org/author/peter_journeys/
- https://lh3.googleusercontent.com/crpRm2GUEyLXmY9N8x_MXJ8cFwG10G_YAIwkXsxB0k5gJJU7cVERPy5yMPdak5MkmHcLbi_m_pwaDJKqL-J62lh_2l9oLDHHGx7c2hj2NujPKeg1drpOdPlF4XizA-sOTw=w1678
- https://drive.google.com/file/d/1f8RBRRVDghGkKhK4bA2xXO5UIgHlOHLR/view?usp=sharing
- https://lh3.googleusercontent.com/SKdWCI-8rZrvWd9Z3s9yGhITXLEiJSDNWN4KK4BsQ-u5vnG1rCmfXawf30JNScOK1DjnplWw4uRlVgkI8nO0x5s9KJvedlZkeS6Sd-H6GZxVU3X4CV-rTU1Z1VU38tI1bw=w1539
- https://lh5.googleusercontent.com/rvSCxIbDrDn9Rk2Y7knpuSxZfWBGaShkWVjcuMkAz4TujN6w1Py5R9fV59_CMRU4CpGnwYZ3qkWeEdtdgw07iEZfde3XiOQiJgKafVCzX9MLsixoWosLeC5OGjQ__x9gzw=w1232
- https://lh5.googleusercontent.com/Wb8xRw46UWaY9cps3y7Jy3c5cvFHflGhSL33vE9p0zffnyO9fN1oUTgTNC2BP69Ll8_kAfDB14A9FpQQ7tMwkgsItTE9FvCwN_gYTt7sa7H1sU0S_mydqDYJn-IG-tVQ9Q=w1337
- https://lh3.googleusercontent.com/I9tAmOp3evTLXeHDlMEFhOFFljbQ5qxyeBvHmHm4n0dv-_gnd3uiOoELW2YIBdiSiEp8YBgrK_8ceFz9bFmQlTJP74TUEiNPDqYRnp9a3vhsh99onIm0R-TPGY5BiJl4XQ=w522
- https://lh5.googleusercontent.com/31TiwiGhWJgZnBjYXnrs9bnLoyBk-FuIyYLdChjcdgwIV4Oy3TyFO0kg4WKsgnsTiw_IrJcD7QpZqbq_Yt_iMfVcBl0LFCwdugb4uimuDnT6DCATCQhQ3NnPy1ozXv_CLA=w1337
- https://lh5.googleusercontent.com/2-rf4IY-mzQCg-I3lglbt5hs_929HwcncfuOvnha6w-B8L9_klcldRHeW2uFXiFmP46Yn6ZSMFcJp8uVnA96Br5YNYndajYCi7L0Cx-OWjEtARHZyeAkoD5jtCdHdUqKoA=w1056
- https://lh4.googleusercontent.com/Hq0mRjaS0iXifiMYBnOAxw_d-tBd_2y-ID5DuOvBlCfcGmdLXxnJIU8FX82onNhuPppuRmK6l2Jr0Xe6jZ50XVmTwxc29LsJkdM8mzzLOQ20pVGt4hJ6FpVkiArlx2D3VQ=w1373
- https://lh5.googleusercontent.com/u5FooHthkJ28pfpRy6aDsb35_-t8eaB_h6jgcGAykrdihFuDmhpuVyyonMz8yd1r759Jb2hgliOh-n8vKUikK18m8LbCMnRQ-WU7vnfg--bPSsBLEGMiJJ_pYYIcR_URmg=w1232
- https://lh6.googleusercontent.com/ywattLts_tmtKkc7bS6bM8x6lRVWewy4TkQosL5-YEZDVprv9sFQI9ltgcwZqYXAYVPBLjkqK3eMKl1exuRWVGpwD2j-h-V5xDy_JQ9LK29QoEC_lOCqO1T_zegWnQ9DJg=w1186
- https://lh6.googleusercontent.com/Ifxf3UG6MrEcpOZLN7oPskBLIRUyAKm-sJu1hzQJ93-DysaVfGUP8KTgKpnmlDy_QMg3PbDOGe4RSj_SdiEdMrhrmwBN443eNvMoMwrwrk-Xz9ekwIL7EzaRxb6GgJaLWQ=w1373
- https://forms.gle/A5sALciiiUE1LZAcA
- https://ultrajourneys.org/category/training/alpine-bootcamp/maps-of-the-himalayas/
- https://ultrajourneys.org/category/training/alpine-bootcamp/
- https://ultrajourneys.org/category/maps/himalayan-maps/
- https://ultrajourneys.org/tag/himalayan-maps/
