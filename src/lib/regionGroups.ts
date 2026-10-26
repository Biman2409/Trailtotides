// India's adventure regions and the states (or places) in each: the home page's "Find by
// region" and the Region filter on Explore and the map both read this list, so they always agree.
// A state can sit in more than one region (Sikkim is Himalayan and Northeastern).

export const REGION_STATES: Record<string, string[]> = {
  "Himalayas": ["Ladakh", "Jammu & Kashmir", "Uttarakhand", "Himachal Pradesh", "Sikkim", "West Bengal", "Arunachal Pradesh", "Nepal", "Bhutan"],
  "Western Ghats": ["Kerala", "Karnataka", "Goa", "Maharashtra", "Gujarat"],
  "Eastern Ghats": ["Odisha", "Andhra Pradesh", "Telangana", "Tamil Nadu"],
  "Desert": ["Rajasthan", "Gujarat"],
  "Coast": ["Maharashtra (Konkan)", "Goa", "Kerala", "Karnataka", "Odisha", "Tamil Nadu", "Andhra Pradesh"],
  "Islands": ["Andaman & Nicobar", "Lakshadweep"],
  "Northeast": ["Nagaland", "Manipur", "Meghalaya", "Assam", "Arunachal Pradesh", "Sikkim"],
  "Urban": ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune"],
};

export const REGION_ORDER = Object.keys(REGION_STATES);
