// Full guides for the air adventures. See ./index.ts for how they're used.
import type { ActivityDetail } from "./types";

export const AIR: Record<string, ActivityDetail> = {
  paragliding: {
    tldr: [
      "A tandem flight is the way in: a pilot flies, you sit in front. No experience needed.",
      "Check the pilot is registered and carries a reserve parachute; ask to see the registration.",
      "Good operators cancel when the wind is wrong. Keep a spare day for it.",
      "Bir Billing is India's best-known site; autumn is its peak season.",
      "Learning to fly solo takes a course of a week or two with a certified school.",
    ],
    sections: [
      {
        id: "tandem",
        title: "What a tandem flight is like",
        blocks: [
          { steps: [
            "**Briefing and harness:** the pilot straps you in, checks your helmet and explains take-off.",
            "**Take-off:** you walk or run a few steps downhill as the wing lifts. Keep running until your feet leave the ground.",
            "**The flight:** usually 10 to 30 minutes, longer if the air is lifting well. You sit back in the harness.",
            "**Landing:** lift your legs when the pilot asks, then stand or slide in on the grass.",
          ] },
          { p: "Most operators have weight limits for passengers, and some won't fly children, pregnant women, or people with back, heart or seizure conditions. Tell them about anything that applies." },
        ],
      },
      {
        id: "where",
        title: "Where to fly",
        blocks: [
          { table: { head: ["Site", "What it's like", "Season"], rows: [
            ["Bir Billing, Himachal Pradesh", "Take off from Billing at about 2,400 m and land in Bir, 1,000 m below. Has hosted the Paragliding World Cup", "October and November best; also March to May"],
            ["Kamshet, Maharashtra", "Near Pune, many schools for learners, gentle ridges", "October to May"],
            ["Solang and Manali, Himachal Pradesh", "Short tandem hops close to town", "Spring to autumn, outside the monsoon"],
            ["Vagamon, Kerala", "Green hills, a small festival scene", "Outside the monsoon"],
            ["Gangtok, Sikkim", "Flights above the valley with Himalayan views", "Autumn and spring"],
          ] } },
        ],
      },
      {
        id: "safety",
        title: "Choosing a safe pilot",
        blocks: [
          { list: [
            "**Registration:** in Himachal, tandem pilots and operators have to be registered with the state; other states have their own rules. Ask to see it.",
            "**Kit:** a tandem wing in good condition, a reserve parachute, and a helmet for you.",
            "**Weather calls:** a good pilot won't fly in strong or gusty wind, or with storms building. Don't push them to.",
            "**Insurance:** check yours names paragliding; many policies exclude it. See [Insurance, rescue and emergencies](/adventurepedia/insurance-and-emergencies).",
          ] },
          { callout: "warn", title: "Cheap and crowded", text: "Accidents in India have often involved unregistered pilots, old gear or flying in poor conditions at busy tourist sites. Paying a little more for an established school is worth it." },
        ],
      },
      {
        id: "solo",
        title: "Learning to fly solo",
        blocks: [
          { p: "Beginner courses (often called P1 and P2) take a week or two: ground handling the wing, then short supervised flights off a training slope, then higher flights with an instructor on the radio. Bir and Kamshet have most of the schools. Look for a school that teaches theory and weather, not just flying." },
        ],
      },
    ],
  },

  skydiving: {
    tldr: [
      "Your first jump is a tandem: you're harnessed to an instructor who does everything.",
      "India has very few drop zones, and many run on scheduled dates. Book ahead.",
      "Expect weight, age and health limits, and a form to sign.",
      "Don't scuba dive in the 24 hours before you jump.",
      "Weather delays are normal. Keep the whole day free.",
    ],
    sections: [
      {
        id: "tandem",
        title: "What a tandem jump is like",
        blocks: [
          { steps: [
            "**Training:** 20 to 30 minutes on the exit position, freefall posture and landing.",
            "**The climb:** the plane climbs to around 10,000 to 15,000 feet. It takes about 15 to 20 minutes.",
            "**Freefall:** around 30 to 60 seconds, depending on the height, at roughly 200 km/h.",
            "**Under the parachute:** 4 to 6 minutes of quiet gliding. Some instructors let you steer.",
            "**Landing:** lift your legs and slide in on your bum, or stand up if it's a gentle one.",
          ] },
        ],
      },
      {
        id: "where",
        title: "Skydiving in India",
        blocks: [
          { p: "Skydiving in India is small. A handful of operators run tandem jumps and courses from airfields such as Dhana in Madhya Pradesh, often as scheduled camps rather than every day. Check that the operator has the approvals to fly, and read recent reviews." },
          { p: "To jump solo, you'd take a course like Accelerated Freefall (AFF), with instructors holding on to you through your first jumps. Many Indians train abroad, where drop zones run daily." },
        ],
      },
      {
        id: "limits",
        title: "Limits and health",
        blocks: [
          { list: [
            "**Weight:** most drop zones set a limit around 90 to 100 kg for tandems, for the gear's sake.",
            "**Age:** usually 18, sometimes 16 with a parent's consent.",
            "**Health:** heart conditions, recent surgery, back or neck problems, epilepsy and pregnancy usually rule it out. Ask your doctor if you're unsure.",
            "**After diving:** wait at least 24 hours after scuba diving before you jump.",
          ] },
        ],
      },
    ],
  },

  "hot-air-balloon": {
    tldr: [
      "Flights take off at sunrise and last about an hour; the whole outing takes 3 to 4 hours.",
      "Calm wind is everything: flights are often cancelled. Book early in your trip so you can rebook.",
      "Fly with an operator approved by India's aviation regulator, the DGCA.",
      "You need to climb in and out of a waist-high basket, and stand for the flight.",
      "On landing, bend your knees, hold the handles and face the way you're going.",
    ],
    sections: [
      {
        id: "flight",
        title: "How a balloon flight works",
        blocks: [
          { steps: [
            "**Pickup before dawn,** to the launch site the pilot picks for that morning's wind.",
            "**Inflation:** fans and burners fill the envelope. Often you can help hold it.",
            "**The flight:** you drift with the wind, gently and almost silently, a few metres to a few hundred metres up.",
            "**Landing:** in a field the pilot chooses, sometimes with a bump or a short drag.",
            "**Back by mid-morning,** often with tea or breakfast.",
          ] },
        ],
      },
      {
        id: "where",
        title: "Where to fly",
        blocks: [
          { list: [
            "**Jaipur:** over forts, villages and the Aravalli hills, through the winter season.",
            "**Pushkar:** often around the Pushkar camel fair in autumn.",
            "**Lonavala** and other hill stations, and festivals that bring in balloons for a few days.",
          ] },
          { p: "The season runs roughly September to March, when winter mornings are cool and still." },
        ],
      },
      {
        id: "safety",
        title: "Safety",
        blocks: [
          { list: [
            "**Licensed pilot, approved operator:** balloon flights carrying passengers need approval from the DGCA. Ask.",
            "**Weather:** pilots cancel for wind, mist or rain. It's a good sign, not an inconvenience.",
            "**Landing position:** knees bent, back against the basket wall, holding the rope handles, facing the direction of travel.",
            "**Who shouldn't fly:** pregnant women, very young children, and anyone who can't stand for an hour or climb into the basket. Tell the operator about back or knee problems.",
          ] },
        ],
      },
    ],
    sources: [{ label: "Directorate General of Civil Aviation", url: "https://www.dgca.gov.in/" }],
  },

  "hang-gliding": {
    tldr: [
      "Hang gliding is rare in India: most foot-launched flying here is paragliding.",
      "If you find a club, start with a tandem flight with a qualified instructor.",
      "You fly lying prone under a rigid wing, steering by shifting your weight.",
      "It needs more upper-body strength and training than paragliding.",
      "Check your insurance names hang gliding; most don't.",
    ],
    sections: [
      {
        id: "what",
        title: "Hang gliding and paragliding",
        blocks: [
          { table: { head: ["", "Hang glider", "Paraglider"], rows: [
            ["Wing", "Rigid aluminium frame with a sail", "Soft fabric, folds into a backpack"],
            ["How you fly", "Lying prone, steering with a control bar", "Seated in a harness, steering with brake lines"],
            ["Speed", "Faster, glides further", "Slower, easier to launch and land"],
            ["Learning", "Longer, more physical", "Quicker to learn"],
          ] } },
        ],
      },
      {
        id: "in-india",
        title: "Flying in India",
        blocks: [
          { p: "A few clubs and pilots have flown hang gliders in India, mostly at established paragliding sites like Bir Billing and the Sahyadri ridges, but there are very few regular operators. Motorised versions (microlight trikes) sometimes run joyrides at airfields and fairs; these count as aircraft and need aviation approval." },
          { p: "If you want to learn, many Indian pilots train abroad, or start with [paragliding](/adventurepedia/activities/paragliding), which shares the same weather and air sense." },
        ],
      },
      {
        id: "safety",
        title: "Before you fly",
        blocks: [
          { list: [
            "Ask about the instructor's qualifications and how many tandem flights they've done.",
            "Check the glider and harness look well kept, and that there's a reserve parachute.",
            "Don't fly in gusty wind or with storms around.",
            "Make sure your insurance names hang gliding.",
          ] },
        ],
      },
    ],
  },
};
