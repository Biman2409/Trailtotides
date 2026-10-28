# Geo-referencing Survey of India Maps – UltraJourneys

https://ultrajourneys.org/geo-referencing-survey-of-india-maps/

Geo-referencing Survey of India Maps

 March 15, 2021

 Peter Van Geit

Survey of India (SOI) maps provide freely downloadable 1:50K topographic maps through its portal soinakshe.uk.gov.in/ (Note: Map download limited to 3 per day and maps of border areas as well as J & K and Lahaul Spiti are not available for download now). These maps are downloadable as PDF.

Convert PDF to JPEG – To be able to georeference the map on QGIS, you first need to convert it JPEG. You can use any online resource (e.g. https://www.ilovepdf.com/pdf_to_jpg) or look into your PDF reader like Adobe Acrobat or Foxit Reader. For reasons that will be clear later, make sure that the resulting image has a resolution of less than 10k X 10k. The website above seems to do this automatically but other PDF readers, reduce the resolution until it fits the criteria, but still allowing details in the map to be read.
JPEG to TIF – Open QGIS. Go to Raster-> Georeferencer (You might have to activate the plugin, see here (https://www.qgistutorials.com/en/docs/3/georeferencing_basics.html)). This will a window like below – 

Click on the blue checkered box or File->Open Raster. Raster is in our case the SOI map.
When the map opens in the window, go to the top left corner of the map and select the tool marked with the blue circle. This allows you to point on the map and say what are its coordinates.

To mark the point, we will need to zoom into the top left corner and find a point at which we think is a good position. After clicking you can zoom out using the mouse wheel and read the coordinates from the map. The coordinates here are given in degree minutes seconds but you can also write the coordinates in decimal. In the picture below the point where I have marked is not yet visible but becomes visible as a tiny red dot after the coordinates are entered.

Repeat the above step for the four map corners (giving more coordinates points increasing the accuracy of the map but given that we know the coordinate system of the map and the quantity of the maps me have to georeferenced, this method is sufficient). You can use the hand tool in between to move the map. 
The four points should be visible in the GCP (Ground control points) table. If it is hidden go to View->Panels->GCP table and select it. If you have wrongly entered any of the coordinates, you can re-enter them by editing the table.

Now go to the yellow cog in the blue circle below. This opens the “Settings window”. The SOI maps are in a WGS 84 projection and this is automatically taken as the default in the Target SRS filled so you don’t have to do anything. Leave all the fields as is. 

Once you click ok, QGIS will align your map to fit the given coordinates (GCPs) and in the process giving any point in your map also coordinates. The fields for Residuals (pixels) below will also get filled in. This tells you the error where it expected the points to be based on a specific algorithm and where it found them. Theoretically, the lower the residual, the better the georeferencing. Here, 4 pixels is agreeable. 

Now press the green play icon on the toolbar to execute the transformation. You will notice that a “modified.TIF” file of the map is visible in your folder where the map is stored. This file is likely to be quite huge (>100 MB). This is the georeferenced map.

To make the maps open in Google Earth and or Open source maps (OSM editing software – JOSM), we will use Map tiler for Desktop (https://www.maptiler.com/desktop/). 

Run the app and click on “Google Earth”. In the following window, simply drag and drop your raster/Georeferenced map. Here the point mentioned in Step 1 is important. The free version only allows a max conversion of a 10k X 10k map, higher and you need the paid version.

Uploading will result in a new window like this. Since the map is already georeferenced you can simply click “Continue”

In the new window, you can select a normal zoom (until 5). Use this option if you want to see the resulting map on Google Earth. If you want to be able to see the map on JOSM, select “Garmin GPS Devices”. Both methods involve splitting the map into tiles, with the slight difference how the tiles are numbered. The plugin used with JOSM recognizes only the latter. We will first open it on Google Earth.

The folder where the map is rendered looks like this. The different numbered folders contain the map at different zoom levels. To open in Google Earth, either click on the KML file or drag and drop in Google Earth.

The image is rendered on google earth overlaying a terrain map. 

To open the image in JOSM, you need to use the other mentioned above. Follow the remaining steps as in here https://ultrajourneys.org/mapping-the-himalayas/

 Posted in: 6 GIS, Survey of India

 Filed under: GIS, Survey of India

## Links

- https://ultrajourneys.org/author/peter_journeys/
- https://www.ilovepdf.com/pdf_to_jpg
- https://www.qgistutorials.com/en/docs/3/georeferencing_basics.html)
- https://lh5.googleusercontent.com/GiNa0_sR9DXQvZrDg4vk1t-TtfSgsF_uueWUYQdTnflt-UR1lka9MU_rGdwZUllA8Q4b0bBMLUQ9bhX4TbEHTGVeK1zp-vgStmSezoXetxMpdf9cAi11HJe_oVX5UaswwUfs7pM
- https://lh5.googleusercontent.com/zX84lb9eunVAJ_ve_cD14SDTBah5Fa4Ang38oCX_tG71c3Z12a3o560InNUY2wsxprIvU02VbiaXD3fHcqXQ_caDGpVDNWkFejt5ZJYQSOOiC8AnkFFB9zVrzW8J7u8Kz5tazAA
- https://lh6.googleusercontent.com/AV_nf7cWGLoiYGZz6aJovuPS1Aou7BR1J1cP9ST3G0JO2DVieAB9q5KYjh-VPAPhAVS42O6_3ZtH-IYSUDUCfS5718rx36B_CQv3B7VjywKgwkEOVXpdu02CEhtK8o51Qn2lAqE
- https://lh3.googleusercontent.com/jZjMb8pxlc1AYu0RjuXWULR89zsd5iJXopm0aKJ8uZOE7c0OjBs-X2r5pQnAOFzZVd0wfNM1oHPjKpobCYG9OGa6oLaW-i7sy3rl7qLqyXmUQxnbSPdp-ZCpfTs5efSUT5cRAg8
- https://lh5.googleusercontent.com/_yJELDXF97nfWxdaH6MVe21jt2fcW3fEI39cpSNbdy3fHJUTWa4wspgKV9xxUzTw4stL1exM_q3WU93kDhibdiemi5Lp6RqaLlGgG-dYZWv8aIk-NyWD6ADGzI-GiG8Z6s7JN0w
- https://lh5.googleusercontent.com/hZF4CPHYX_Sxg8PbCdycD8Nh9hwB4q8hZPhyLhW400XiJ7zSMTHEuJyq6FO1oohcowUwM9Db6J8K2i29SVX2EU4J9WT9xAFKxCO6lSG21jT6y53n0xKRE3w0v86Yx0t7YAh6yX0
- https://www.maptiler.com/desktop/
- https://lh3.googleusercontent.com/GndUOezkdPqiSG-XnrWFFjpVsa_r8bwkusDyHLKf9cU56PpEZU2QZCKUTMZlHYuEfkNX5og_HX_y7HTIbo4aWTG0Y9RGdkAYhnKU_P0AF75047HUHLKTGKer3yeLa3Db4WOATy4
- https://lh5.googleusercontent.com/-6PFiRRKtXGJmGZZ1bSNABWjPMiVtxxcMMhhdH9bKgCiyxblUtu_Yx_fmNIVsUEPdCefmW9UYy-bPFFPMItaC6m_G-6TfNBJaOW4m9XxUkzN9i-Vs5PoY595DyUt7f1T4dTsa24
- https://lh5.googleusercontent.com/-U_bPc8KCQBpACDHZ3vLzGE1QYIm0uCQgQCgzL0TPBuvWFSEeIiFeTsBXU8bvas84VN2FmWZoFCDx4aXIp8T68heztyOZ02OBBiDChXZXt2TxL39yJfAxDsg3h1unaGaYrV4Ykw
- https://lh4.googleusercontent.com/B97i9xtnc8_N0j_5hzngYGwc4scwPJBZdnsKc-TPBtsvrE3fOB8aV9t5e3b4p-hcHahVdZhCDhuPlEUDXfu2NS23hjYtBjRn9DIDM9eGwN40SvoiCXYA7QOasHwbQGSMYv2UGlI
- https://lh6.googleusercontent.com/ulAui2MO8ZHLbew-JWhrq4RXnUHg6QUcyNR3VHBTzyyukDHjxJsFsoVje7PqezBxX2zqGr11ExN4Xl8zEXrrz7I80ABvVG82PbBWp5TsTgxHbXebY4hnpZzYDGWAkBmbztoNGOg
- https://lh4.googleusercontent.com/Q--voNGPY0CzbRhmdHKVQUPpPZuHzzwU6t5aEQ9sSrPQ60DLPQHW5g9ghealt-9qC-WG9y4oVBn4Y1SBuCnpErs1o2pVRN7aCbusR52YUHnWtty6udSB5dbB4CwSjsW4e_r50Rg
- https://ultrajourneys.org/category/training/alpine-bootcamp/gis/
- https://ultrajourneys.org/category/maps/survey-of-india/
- https://ultrajourneys.org/tag/gis/
- https://ultrajourneys.org/tag/survey-of-india/
