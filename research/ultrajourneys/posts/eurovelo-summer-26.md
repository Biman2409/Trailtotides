# EuroVelo Summer 26 – UltraJourneys

https://ultrajourneys.org/eurovelo-summer-26/

EuroVelo Summer 26

 June 11, 2026

 Peter Van Geit

This post presents an overview on how to plan a long distance cycle tour through Europe. Last year we completed the EuroVelo 8 covering 5000km through 8 countries along the Mediterranean sea from Athens to Barcelona. This year we are combining EuroVelo 6, 11, 13 to cycle through 10 countries in West and Southeast Europe – 4000km through France, Swiss, Germany, Austria, Hungary, Slovenia, Serbia, North Macedonia, Croatia, Chechnya.

Cycles

Planning

Estimation

Schengen

Geography

Climate

Weather

Navigation

Bike Computer

Travel planning

Cycle transport

Luggage

Food supply

Night stay

Sightseeing

Cycles

After our cycles got stolen in Barcelona (emotional hardship after spending so much time on those cycles) we decided to get a new set of touring bikes – Surly Bridge Club – all round bikes for touring, off roading and mountains. Chromolo steel frame with 1&#215;11 Shimano gear set. We replaced the wider stock tires (2.4&#8243; width) with sleeker ones (1.75&#8243; width) to reduce rolling resistance on mostly tar and gravel roads in Europe. Fixed a carrier and fork mounts to carry luggage in saddle bags, fork bags, frame bags and saddle post bag giving us 40L + 2x6L + 10L = 60+L luggage capacity per cycle.3 bottle holders x 2 cycles to carry 5 liters of hydration. 

Planning

EuroVelo

Europe has a beautiful network of 19 long distance cycle routes covering 25 European countries. Each route has a specific theme. Open the EuroVelo website to view a map showing all cycle routes:

You can zoom into the map to see the regions covered by each of the routes and combine individual routes as per your entry / exit point and total duration planned.

Our entry point was Paris / exit via Brussels and we had 1.5 months x 90km / day = 4000km we could cover. We decided to combine Ev6 (purple), Ev11 (orange) and Ev13 (red) to making a loop through West and Southeast Europe:

Waymarked Cycling Trails

Easiest way to plan your (cycling, hiking) route is to in nakarte.me. To do so we first download the required cycle routes from OSM through Waymarked Cycling Trails. We download Ev6, Ev11 and Ev13.

Nakarte

Drag and drop the downloaded GPX routes in nakarte.me to view them on various background map layers. Below we use Google Terrain as a clean topographic base layer.

Create a new layer and mark the main towns passed along your planned route – Paris, Dijon, Basel, Ulm, Vienna, Budapest, etc. This creates a blueprint for your planned cycle route.

Estimation

An excellent web site for estimation (distance, elevation gain) of your planned route is brouter.de. The website has different base map layers including waymarked cycling so it’s easy to mark your route. One can route using different preferences (mountain bike, fast bike, low traffic&#8230;). The created route can be downloaded as a GPX and used for navigation in your bike computer.

One can also bring up an elevation profile of your route showing different gradients / slopes which is very useful to know while cycling.

Schengen

Non Europeans on a Schengen VISA are allowed to stay max 90 days within a 180 days period in the Schengen region (blue countries below). As we were planning to stay longer we looked for a cycle route that would take us outside the Schengen region (red Balkan countries below) to extend our summer stay in Europe.

Geography

It’s always very interesting to visualize and understand the main geographic features along your planned route – mountain ranges, plains, major rivers, etc. Both geo-political (countries, provinces, cities) and natural (geographical features, rivers) can be downloaded from Natural Earth.

Below I use QGIS to open the visualize the downloaded vector files showing countries, rivers, mountain ranges, plains, EuroVelo routes and main towns along the planned route. This gives a clear understanding of major geographic features touched upon while cycling along the EuroVelo routes through various countries.

Ev6:

Doubs river

Dijon / France

Basel / Switzerland / Jura mountains

Ulm / Germany

Donau river

Linz / Austria / Bohmerwald mountains

Vienna / Austria

Bratislava / Cheznia

Budapest / Hungary / Alold plains

Danube river

Belgrade / Serbia / Dinaric Alps

Ev11:

Morava river

Skopje / North Macedonia

Ev13:

Danube river

Sofia / Budapest / Balkan mountains

Morava river

Varzdin / Croatia

Bratislava / Slovenia

Ev7:

Vitava river

Prague / Cheznia

Dresden / Germany / Erzgebirge mountains

Below a smaller scale map showing more details of the Northwest region:

Northwest

And a more detailed small scale map of the Southeast region:

Southeast

Climate

Important for any long distance outdoor journey is to assess the climate (temperature & precipitation) in order to properly plan clothing and camping gears. You can download 2.5 arc minute resolution monthly weather data for the past 70 years from Worldclim.org

Temperature

We can visualize the downloaded raster data in QGIS and overlay on the planned route. Here we are looking at 10min resolution average temperature for the months of June and July. During June we are mostly in the 15-20 degrees range in Northwest.

June

While in July we touch 20-25 degrees in the Southeast of Europe. You can download min (night) and max (day) temperatures from WorldClim to refine your planning for day clothing and night camping.

July

Rainfall

Equally important is to assess seasonal rainfall during your outdoor journey. Below we visualize the average monthly precipitation (0-500mm) for June and July across the planned regions.

June

July

Weather

A good way to assess the immediate weather along the route is an app like windy.com. You can overlay your physical route and check the day (max) / night (min) temperatures along the way to assess clothing and camping gears.

Mid day temperatures in June

Night temperatures in June

Another good layer to watch is Rain Accumulation for the immediate following days to identify regions of intense precipitation which might affect your outdoor travel

Navigation

OSMAnd

To navigate your planned cycle route we can use any mobile app which supports offline Open Street Maps. I mostly use OSMAnd. Download base maps, contours and hillshades for the various provinces, regions and countries passed on your planned route. Covering nearly 100km per day and touching upon 10 countries this will add up to multiple GBs of map data so ensure to complete this before you head out.

Set your Overlay Map as &#8220;Waymarked Trails Cycling&#8221; to see an overview of the long distance cycle routes and quickly locate those you are planning to cover. Enable &#8220;Cycle Routes&#8221; in &#8220;Configure Map&#8221; to select individual route sections and metrics – distance and elevation gain.

Understanding the gradient (slope) of your route is important for cyclist to anticipate the (uphill) effort. 5% uphill gradient is tough already, 10% becomes quite hard. Contours (left) allow you to assess the steepness of the route. We can also color our route as per the slope (right) which gives an excellent understanding of the steepness (effort ahead).

OSMAnd allows you to select a route segment and navigate for easy turn-by-turn route directions. Use &#8220;Show POI Overlay&#8221; to overlay nearby supermarkets and grocery shops to quickly locate food supply and hydration points. While navigating both the physical route as well as elevation profile can be seen to assess the ascents / descents ahead.

Bike Computer

A mobile phone might not be the best navigation solution for a cyclist in terms of outdoor use, battery life, GPS recording and always on display. It is recommended to invest in a dedicated bike computer like the Garmin Edge 1040. It comes with offline (OSM) maps, 60 hour battery live with navigating and GPS recording, always on display, outdoor use (water proof and readable in sunlight) and display functions optimized for cycling – e.g. visualize route gradients. Sections of the EuroVelo routes can be downloaded from OSMAnd, uploaded in Garmin connect on mobile and synced with the Garmin Edge bike computer for navigation. GPS recordings from the bike computer are synced backed to the phone for post ride review and analysis. 

Garmin Connect on mobile – upload new routes, review recordings, analyze route climbs.

Travel Planning

(Western) Europe is a cycle friendly continent making it easy to carry your cycle on public transport. In many cases cycles can be transported for free on trains. To optimize our stay in the Schengen region (90 day Visa stay limit) we plan to skip most of France and Germany and focus on cycling in the Balkans, partly out of the Schengen region and thereby extending our stay in Europe. 

France

France has an extensive railway network with various regional and high speed trains. The SCNF website allows you to plan your travel.

You can specify the #passengers and #cycles while planning your travel. In our case we plan to skip 500km (1 week) in France by taking a train from Paris to Dijon. We carry our cycles fully assembled.

Various trains and timings are listed. Both high speed trains (TVG, OuiGo) and regional trains (TER). We plan to take a regional trail from Paris to Dijon where cycles can be carried for free.

It’s important to reserve slots for your cycles on the TER train as available space is limited. Each region has its own website showing the remaining cycle slots available and allowing you to reserve yours.

Germany

Similar towards the end of our cycle tour we plan to skip 700km (10 days) in Germany by hopping on a train from Dresden (Chechnya border) to Aachen (Belgium border) thereby saving precious time in the Schengen region.

Train journeys in Germany are booked through the Deutche Bhan website which again shows the possibility to carry your cycle (for free) on each individual train.,

Cycle Transport

Cycles are easy to carry along with you on international travel. You partly disassemble the cycle (remove wheels, handlebar, pedals) and pack it in a carton box. Weight of a packed cycle is usually below 20kg which fits in your check-in allowance. Some flight companies might charge 35 USD for oversized luggage handling.

Luggage

A cyclist can carry more weight compared to a hiker. On a 5000km / 2 months / 2 person cycle tour we carry below gears. Camping and cooking gears are shared.

Clothing – 3 sets of clothes, washed weekly in laundromats

Camping – 2 person tent, 2 person quilt, 2 mats

Cooking – Campingaz stove, pot, frying pan, utensils

Toiletries – toothbrush, soap, shampoo, etc. Showers are taken in public springs or warm shower hosts 

Cycle tools – spare tubes, puncture tools, lubricants, cycle helmet, 4 head torches (front / back), 3 big locks.

Electronics – Mac Air, phones (navigation, photography), Anker 2000 mAh powerbank, Anker USB C chargers. Recharge in public places (McD, supermarkets&#8230;)

Food – we buy ingredients in supermarkets and usually carry 2-3kg fresh food items per day.

Water – 3 bottles x 2 cycles = 5 liters of water. Refill from public springs and supermarkets.

Navigation – Phone/OSMAnd, Garmin Edge 1040, Cycplus M1 GPS bike computers

Saddle bags – to carry the above – saddle bags, frame bag, handlebar bag, saddle post bag, fork bags.

Weight – 15 kg cycle / 20 kg luggage / 70kg rider

Expense – 15 Euros / day / head for food ingredients from supermarket. Additional expenses – museums, historical sites, restaurants, etc.

Cycles and luggage are packed in carton boxes which are discarded at the airport. Cycles are assembled and luggage is transferred to the saddle bags and we start cycling from the airport itself. No need for taxi’s. On the way out we can pick up two new cartons in any cycle shop to pack up the cycles on our way back home.

Food Supply

Restaurants are generally expensive in (Western) Europe especially for long distance travelers. We do eat out periodically in fast food places (Kebabs, pizza, fries&#8230;8-10 Euro/head). We mostly eat from bakeries (morning) and buy ingredients from supermarkets available every 10-20km along the route – bread, pasta, sauce, soup, meat, etc. We cook in public parks and scenic spots along the way and dinner near the campsite. Many supermarkets have ready to eat meals as well as many freshly prepared dishes (burgers, steaks, soups, &#8230;) which we just need to fry / cook. We use 350ml Campingaz stove and cannisters which are available in many places in Europe. So we usually carry 1 cannister + stove + cooking pot + frying pan + 2-3kg food ingredients on the cycles.

Night Stay

For night stay there are usually three options – hotels, camping or hosts. Hotels in Europe can be expensive especially for long distance travel. Cycle tourists can avail the warm-showers network which offer free night stay / shower. This is especially popular in Western Europe. 

Most days we camp in open spaces along the way. 

Sightseeing

The EuroVelo routes usually follow dedicated cycle lanes – either tar or gravel away from major highways and traffic. EuroVelo takes you through scenic country-side routes with beautiful natural scenery and through historical sites and cities. Points of interest along each route are documented on eurovelo.com. Bike repair shops, restaurants and hotels are also listed. 

Google Maps is another good source of must visit places along the way. Points of interest are clearly highlighted on the map. At the end of each day it’s usually a good idea to see what’s head in terms of terrain (climbs, towns, supermarkets&#8230;) and POIs (sightseeing, natural features&#8230;).

 Posted in: Cycle Touring

 Filed under: Cycling

## Links

- https://ultrajourneys.org/author/peter_journeys/
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-30-1024x577.png
- https://ultrajourneys.org/eurovelo-8-athens-to-nice-summer-2025/
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-11-at-14.32.25-768x1024.jpeg
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-11-at-14.32.24-768x1024.jpeg
- https://en.eurovelo.com/
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-1024x559.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-1-1024x616.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-32.png
- http://nakarte.me/
- https://cycling.waymarkedtrails.org/
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-3-1024x576.png
- https://nakarte.me/
- https://nakarte.me/#m=5/46.84222/13.39839&l=P
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-5-1024x551.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-6-1024x576.png
- http://brouter.de/
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-37-1024x721.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-38.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-34-1024x683.png
- https://www.naturalearthdata.com/features/
- https://www.naturalearthdata.com/
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-28.png
- https://www.qgis.org/
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-24-1024x576.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-26-1024x545.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-27-1024x561.png
- http://worldclim.org/
- https://ultrajourneys.org/eurovelo-summer-26/worldclim.org
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-21.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-17-1024x545.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-18-1024x544.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-19-1024x555.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-20-1024x571.png
- http://windy.com/
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-12-at-10.21.27-1024x576.jpeg
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-12-at-10.22.18-1024x576.jpeg
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-44.png
- https://osmand.net/
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-15-465x1024.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-11-at-11.24.14-1-465x1024.jpeg
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-11-at-11.24.14-465x1024.jpeg
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-11-at-11.24.15-465x1024.jpeg
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-11-at-16.43.44-465x1024.jpeg
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-11-at-11.24.15-1-1-465x1024.jpeg
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-11-at-11.24.15-2-1-465x1024.jpeg
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-11-at-21.32.40-768x1024.jpeg
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-11-at-21.32.40-1-768x1024.jpeg
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-11-at-21.44.40-465x1024.jpeg
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-11-at-21.44.41-465x1024.jpeg
- http://www.sncf-connect.com/
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-8.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-10.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-11-1024x708.png
- https://www.resaterbfc.fr/
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-12-1024x633.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-7-734x1024.png
- http://int.bahn.de/
- https://ultrajourneys.org/eurovelo-summer-26/int.bahn.de
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-16.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-35-768x1024.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-36-768x1024.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/194278-766x1024.jpg
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-40.png
- https://www.warmshowers.org/
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-39.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-41.png
- http://eurovelo.com/
- https://en.eurovelo.com/ev6/from-nantes-to-nevers
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-42.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/image-43.png
- https://ultrajourneys.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-11-at-22.46.51-465x1024.jpeg
- https://ultrajourneys.org/category/himalayas/cycle-touring/
- https://ultrajourneys.org/tag/cycling/
