# Himalayan Geography & GIS – Part 3 – A Simple Traverse – UltraJourneys

https://ultrajourneys.org/himalayan-geography-gis-part-3-a-simple-traverse/

Himalayan Geography & GIS – Part 3 – A Simple Traverse

 May 23, 2024

 Peter Van Geit

In part 3 we will start planning Himalayan traverses via continuous hiking routes across multiple mountain passes planning for in-between food supply in nearby settlements and night halt in camp sites and shelters.

Contents

Human settlements

Shelters & campsites

A simple traverse

OSM Place Search plugin

Identifying POIs

Visualisation

Exporting to phone

Settlements

Centre your map window at (30.52, 79.2), scale 1:500K or use this window extent. Settlements are useful base points for the alpine style hiker for night halt, food supply, recharging electronics and guidance. We can download the same from OSM using &#8220;place=village&#8221; (major), &#8220;place=hamlet&#8221; (minor), &#8220;place=isolated_dwelling&#8221; (seasonal summer). As per JOSM convention color them red / yellow / green respectively.

Human settlements are high density data so best viewed at smaller scales for individual hiking routes.

Overlaying the geography (valleys) we see that most human settlements are in lower altitude valleys (warmer, abundant water, less winter snow) except for the seasonal dwellings which are higher up closer to the meadows where locals graze their cattle during the summer

Overlaying the OSM hiking routes + human settlements allows us to plan for night halt and food supply along the way

Night Halt

Center your map window at (30.52, 79.2), scale 1:500K or use this window extent. In addition to human settlements we can also look for natural shelters and campsites for night halt on multi-day hikes.Run the queries &#8220;tourism=camp_site&#8221; and &#8220;amenity=shelter&#8221; to bring up the same

Zooming into individual hiking route we now can plan various night halts along higher altitude multi-day traverses

A Simple Traverse

Let’s now plan a simple multi-day traverse across several mid-altitude passes planning night halt and food supply. Let’s say we wish to traverse from Khati village in the Pindari river valley to Sitel village in the Nandakini river valley (read further below how to locate places in QGIS).

Center you window around (30.19, 79.75) at 1:125K scale. There s a connected sequence of OSM hiking routes from bottom right to top level that takes us across the following Himalayan geography:

Pindar river valley

Unnamed valley

Ghatlya Gad

Baura Gad

Unnamed pass

Unnamed pass

Kail Ganga

Halkan Gad

Ali Khal pass

Dhyan Gad

Kukin Khal pass

Semkor Gadhera

Nandakini river valley

Identifying POIs

Let’s create a new point vector layer to store all intermediate points of interest (POI) which are important for the hiker.

Give it a proper name, select &#8220;Geometry type=Point&#8221;, remove the default &#8220;id&#8221; attribute and add two new fields:

&#8220;name&#8221; text field, length=30. Important – use lower case &#8220;name&#8221; (more on this below) 

&#8220;type&#8221; text field, length=30

Select the new point layer, click &#8220;Toggle Edit&#8221; icon on toolbar and choose &#8220;Add Point Feature&#8221; icon to start adding POIs to your layer.

We can easily locate any OSM item in QGIS using the OSM place search plug-in. Search for and mark the starting Khati and ending Sitel villages

Now start marking all useful POIs along the hiking route – stream crossings, mountain passes, villages, hamlets and dwellings.

Around 20 POIs can be identified along this multi-day traverse:

Right click on the layer and open the &#8220;Attribute Table&#8221; to see the same POIs in a tabular list

Visualization

We can visualize the different types of POIs using different colors and symbols in the Symbology tab of the point layer

Overlaying on a topographic map we can easily plan:

Mountain passes (high points)

Stream crossings (drinking water)

Villages, hamlets (food supply, night halt)

Dwellings (night halt)

Additional detail on terrain features, alternate trails and remote settlements can be identified using the Survey maps and satellite maps

Navigation

Final step is to export the POIs to a GPX file which can be downloaded in your phone or watch for navigation

Select only &#8220;name&#8221; field (supported in GPX) and uncheck &#8220;id&#8221; (unsupported). Ensure to save &#8220;&#8230;&#8221; in a directory with write access.

Important – &#8220;name&#8221; field should be in lowcase. Upcase is NOT supported by GPX format. Download the exported GPX file to your phone or watch to start navigating

Hiking Routes

In addition to the POIs we can also retrieve the entire hiking route corresponding to the traverse. Query &#8220;route=hiking&#8221; from OSM.

Select the new line vector layer, &#8220;Toggle Edit&#8221;, &#8220;Select Features&#8221; and multi-select (press Ctrl or Shift) the individual hiking route sections that make up the entire traverse

You can bring up the Attribute Table and filter on &#8220;Show Selected Features&#8221; to show the individual sections that make up your traverse

Right click on the layer to Export Selected Features only as a GPX file

Export in GPX format, give a proper name, ensure the &#8220;&#8230;&#8221; directory is read-write, deselect all fields except for the &#8220;name&#8221; field.

Share the resulting file to your phone to start offline navigation

Assignment

Plan your own multi-day traverse across multiple passes (at least 4-5) following a continuous sequence of OSM (waymarked trails) hiking routes and mark important POIs along the way. Export both POIs and route segments as GPX file and load them in your phone.

 Posted in: GIS, Online Courses, Traverse Planning

 Filed under: GIS, Traverse Planning

## Links

- https://ultrajourneys.org/author/peter_journeys/
- https://lh7-us.googleusercontent.com/IMe1ZuxamLh8g1xbFbC8IprNO3DFHKfAwT-i4J5IWQP2m0ZqWyrcogJkRkHXQNL8r8uAxoVMkAqEVW4w9DhxkhYtPytlepiSQ_4PQuBCgzKFef4gmOydeZXqSiNTuQWi3n00u1wchEC8NMvmBbi6DxE
- https://drive.google.com/file/d/1zBft9Z1-tr8fXZtv6qzWyW_6GZvILYlS/view?usp=drive_link
- https://lh7-us.googleusercontent.com/LmAe-DTuUXqjCWGQt2oe8NksVLDZIa82Fk87rhFvGh6AGToZwGdImNCI0I-h8WcwgCO255BitBc2dcC3KRh68NC0QuBp77mj3Hi1DGMKcYuBAvgCAJtHko5UkEzIPmwhkGyHhZLkNzMTcGTsTmRPTW0
- https://lh7-us.googleusercontent.com/pMmm951mZlwlDShL9eXBja4xNfDE4Vqzc5BTftZyt_DyaKAr4E1iridMxFCz9-TN3Tt5Di8H08UkKMc8bFpqR9I6ehqGkCLwrjH6QdwkSb2rN772ItRQ2xcxwfXMcYzTSTO0VNk7kRESokamlGMfV-g
- https://lh7-us.googleusercontent.com/20Zr83gSOFbghMQHndpR1Ezw8IG_nzVNdDC518oCK-ifYc0nFLDtEMlGiCuAC-9sl0qW35I6PH1u-o0nmWr8QV1cMNsfqkyLSwLULGeBOyjYGZHEGdmHjVKsDwWCI2bZnLauntB5F3R3memGPlGQp2M
- https://lh7-us.googleusercontent.com/RYnMRQtIlFOacrW8jUEElOlhQy_hZkIO09gNVvFQajE6Ls8DDtjuXajllEO5BZkWzjpU0-8x5Q7VArBnPME78uTV0UrEpG9NPG4hA1Ps4nATvbp4gs0gYRkUso37hYUsYathvsKrPA1KyVPsLsCNF4g
- https://lh7-us.googleusercontent.com/Z-55AEX8h7sywKdobCsez6tD0KonAaD9ay-qZebwESNK5Eog_pIezEFx9UDzi2F9vS2WoUNsesez3DG3U2dOVUgtVAp7mIz-W0Q7y8r9oif9zSmF4s5ARlAUuxBhYiqVCN3myhwX2frP16HtMJkHOvI
- https://www.openstreetmap.org/way/428462956#map=15/30.1088/79.9429&layers=Y
- https://www.openstreetmap.org/node/6520227794#map=15/30.2765/79.5535&layers=Y
- https://lh7-us.googleusercontent.com/ypI9xHKY1MYZ7KhHQ2WIB_q-K9L4HP29G4zVgehB7Vj5T-JGO2dxbZ1ajsfqs47E6vU4JodO5jmeGYNbCYz8dTAbdTP8H6PPsJ4t2Wtn4KMV9AZjHqT3fH1zmbtJQwnmpz__KZeggsCv8X-FCmUMfm8
- https://lh7-us.googleusercontent.com/c106T4WMihlvKLe9PHghV42RgSA5ra3yd9qqGBXdEtFkOzy151zXwZf7soGXwik8RVbr5JvbX0OXbf2Ro1fR09Q1oqxI1qjQ6tbo-XtBQsLfFJOcdSEqA3pHL7uIfUJsfI_9URaUrnQYooQ15VyJJPU
- https://lh7-us.googleusercontent.com/Ub4RfDQmRet3EXLbq3U26-S-JqoBFhtRvyJyWQMCd3bA5m34BFlW4B2Pm5spZx4AGVOq6tUTsxXPojBk46m8_ale9P9cXdRoagLZje_0O5YH5ehp3KsqftZMpflwL1vRhj7XWwIMJyQbKZgcWDKKDE8
- https://lh7-us.googleusercontent.com/G5FPFh6uWpboU78OOEF_46gvtPHTX2zxL5llbXp4lQ-dangBND_YsRN0_xMwzZrMwRVMeNQISHfoW7f24bDy5RHh_MEgUyLhC83pxN-oYysJGWxWE6v3E_0SGE7u2jNQGU2fFQG_Bhh7hXsUWaf_Uyo
- https://plugins.qgis.org/plugins/nominatim/
- https://lh7-us.googleusercontent.com/kE5BDl3A1epfbv16mMIKMBAyjBXiGiFAWnDrZdeIy4lOrbxIf7_Qs3t3qnR4_uw3cPWb8SzN16mhwwwnXFawyHYzrqhlbj7CDmD_0OD7jKoVxcUjBkDyU25QCE8DL-C5BVEtOxXRpMmCApmz6ReJW6Y
- https://lh7-us.googleusercontent.com/gXHLKkZnTr98K3EslcIvgAHwLNKHukiXyWu9GncF3Bj__qgXMN_fUGK4GHvbp7yNWAT8HEOV8tD41e_j5zqv1mqF9WclBoZ3unA9o2F810Lp2Vb7SXUWSfpAAoZ0MLf1uKRvL9BFg1IuczJNeCUACMo
- https://lh7-us.googleusercontent.com/-JT_Xg0VX5sPz23tRNWZ4uUFJWpPjVw9hb0BHYZXgDcJq8t1-bWeMppe7QZLnR1qNN9UO3CM3YLeyg3_AzUwgSNfQe7t0OCH9wj0YBIlOQw8tMNpEl7y5Gn96LpotQ3ailBOBs_DWpJjyHAsZS9_S3g
- https://lh7-us.googleusercontent.com/WQzWzQfh0_HPNTwLVWEK4pi5xLbf1XCQNjj24i3_oqM96OEk6sPcHBIDQ5VTLYebn0xYGzW3V6RC78aL-u4ch05cjA6QrR5iFXh4sJcFQeyoFt7MiNu5o156AMQA4bjwennK0Sbdio3VM4AyGORdVPQ
- https://lh7-us.googleusercontent.com/1wkKNMvcLqqt0100UOQeQsXOgzUkWWznAc5eCr4KaPvhbmAFmotn-hOTyOWdEwNM1qHlPMBIYc0xFSWeHNz6Ll33LjP3k_ibW4Pln-0l5o_wyk1XT4eFR85afWCfHijsdQoRALjkHUqiCT3dnc80pes
- https://lh7-us.googleusercontent.com/Q-5bskhEb096K0pexGAdER1CrJjMGzrG3wbNPE79VwItP-OhK732Pgaik2r4b7BSsoiheqzL9GK92EU7x-6JfdheXO3dUUZOkyC-WMsXYt_ICZw-xrU_naTYMz7P_QXEZAAeyDq6WMdAP3WZYlYNsGs
- https://lh7-us.googleusercontent.com/Bu_ECkOOfLzvSum_e6ILRsMUgaJCq22LLCZMYxkJqRyvoV9Z0VY3MvpLi9j6n12YGWdlML6R079TtXRJd1lLtMCK206_Z26ijR22FrxO6zLWtacye44M0kvqRg3L_G8bRroiAI7bP5OumkiC7Oo5Nto
- https://lh7-us.googleusercontent.com/tgJHolpl4VEnfvAaxRYe6VzMGMnoF_RlKm_iDBsjBCRDo72PtLCfiAzBBW_UdV__bFHWYHvRc5vhNel7YIiVnMLhrS5aAUq4fsGnpMj9XXZAi2Un7m5WS4v_EXaUNlmO50SxL7rivplfDKHekejC6Jw
- https://lh7-us.googleusercontent.com/9fS-lo18mPAmDjZFfjwe2-Q4iQW8E_yWjVRHUo86TeOWrv9PIKOifflh3dpJd-HYYgVcLeO-e8MWkGIUr3YrMt4S2g5UNsXMkbjAzWF5ITQaaeusw_1elK-KUklmhmNZJ-YG5Fx9pEkoLbWH9BE7ZyQ
- https://lh7-us.googleusercontent.com/XwWAs9clakFDlMODmjiqpr4F3Qw25zgEFAsAVxcOjvuJOJyCEXDSss3EbNieJ5V5OZIgMjJ-c--n5ft7N1iblVGzKi_jjfCWix690oKW8uxj-AfKMd0RIkBcg3nKWvoP_EMbXFNWBmKc_OUnf6vnX0I
- https://lh7-us.googleusercontent.com/Q1csldpKJLU4WglyHEoZGOku4NPgx9c5AZQ7QqtfpwJpUmtcSjKSQ3dgdkcBVoGYUG_tbfwrFqn6HpkaWaARAk59Jo7qleheXysL5YENjZghGnL6Fjn8NJnoyJL54T51gT-8XuvNByjMDW8bk6Biceo
- https://lh7-us.googleusercontent.com/9hetIS5FTxeNedPeda5EUpK1_Go8WiS7LibLgg-0x5qguysxBA2U-eTwJvHCWstpffkCEuW_bu7SwSig4_-6bkfalmn4Zj2NSBnvEJJDTjAStR2laBpANbgCKDFdDO5PV01RnR6sNbQx33CWHCdFyYE
- https://lh7-us.googleusercontent.com/lyi457wG4sBqz3oGg_5TVV9ik2Wip4_ffcn3O5LYDoS7TCn8WWBUAZvSZwfw9nqnjvQ_sZVXVf7XZVlgWEj4QkKQoLL9NF2wxVLEJ7C1T4NSDWyGRubJynxMrJwDQDhZJbqKzTNx-vXS1jRb6zXENsQ
- https://lh7-us.googleusercontent.com/vtiJIEO86RVnqamqdlQbKg9OnivarKzagz_a-sQ46sSpcHXN28JZLZafuOy1bQBdP5DkmGK58F_fB7JWaQ1ZlUROEQLgiQYkmgVq2Jej1hM1SldTjLrVcs7FMpv5BaAWiDK4IfteRMJ56zMD9EkA1s8
- https://lh7-us.googleusercontent.com/wgMMhdU5ExTjy8lTjzFUTCBf578jpVbvuLuR9tNOZeHv5lceIvyfRZAGfjaVBqfui7nRM9sQv70WpCrYksYXiHUz6EuxXK9-B2uVcY9oHnP8VUblAJBz0xXmZqL_jRcw0i6CpCb-jzV2eeiidHX2vsE
- https://drive.google.com/file/d/1C9RwuhR94wvlCDQh179nFjBgajO_r69B/view?usp=drive_link
- https://lh7-us.googleusercontent.com/CnTCI0n2KGqKUISmF2J5HvVplDa7n9M8uNmcpbfbBJlonMCkHwmYmEelT8cM70leT2yy43eUDVeZwPag-K3L3SrW4cr9XP1T06hPPVdaeTxlrLHEoQqe6RSJDg14PrCr6sthL4onnn8kIRCdsdAUgu0
- https://lh7-us.googleusercontent.com/Vjp_0qTX-LnHkXqAeFILEbztWZFm-l7oURIdhS2WqQv1gcSr4Kf-yNmuA9HKTRcDVwChVtQin4tgzy4UqNeo53xZh9nfrR0pwgL-0KGAxZDbmzuJWwBOonpmZ5Lkgrmrgi40hRuvY_2gyJMg1wdVF-I
- https://lh7-us.googleusercontent.com/UH7RjIcIyiVeUdrDvxCwFHccqBCP-YI8Gg6e6rmv5fLFsR-MPluG98kMgh0Xyi9ad91TkB91KNF9suTZ9zgbGK_SssUyYUDYZdugcokkjI0Z4YKucYMdfF0IEdMwGte8gXL9hY48BOlHmuOTVOI2DYs
- https://lh7-us.googleusercontent.com/EKbWwK2cDLufbJmsQL5XVDUdgTx2ag0tEUpAqnSgI6AX1jAkCxfW4wCyursihiVp-0SQfRocflQlCcw7QcKsUUUgnE-D7xGqP9wi6-TN1U3rWwipUkHpU3L5ZlA6nPUE99_XxaZf_13J9iNYXixj4X8
- https://lh7-us.googleusercontent.com/HA13jvGcVcWPG4EfQWHABM9lAFC71wQeTv-4xjDAj98MZZqJeNdzCaXVgg2gzdFlJb0c1jMU7Q3yeNewBl2W9bLsJH33EeX39MQ0rFb0mtz-hTAwXFHIXQ5JpbBrrWz7sKeRP0pa8bhD8YMapb_5C1Y
- https://lh7-us.googleusercontent.com/VV-xcEbuF09gV5fIqiKfNJm1L2FWxNgBY8GRRVflmr9KKmxUlsYsTyGbAPVIm-a2Fnejo_QoFpnLKXL23yzvBsX_E8uHomwoeMtl9itB-Kr9xPbQ7uz0WPi6rPu4cWPQMKY-1GfHy6q1HxgX89UyhUs
- https://lh7-us.googleusercontent.com/xgmO-7teK5VIOzbo7fR-eqS0F3i02MT3BhHxpoS95veQ2jzG-RRuE-GrVhlNH1hqucYd8i_k0AMDaKpeFWlWrGSRitjjJMPSd8im9rmZxvRzoo5V9xf2xq_3LQKBJCXKMHr2kt6xZovUPmB2OBVrwNo
- https://ultrajourneys.org/category/training/gis-training/
- https://ultrajourneys.org/category/training/
- https://ultrajourneys.org/category/maps/traverse-planning/
- https://ultrajourneys.org/tag/gis/
- https://ultrajourneys.org/tag/traverse-planning/
