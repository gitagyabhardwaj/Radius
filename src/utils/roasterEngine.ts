import { Creator } from '../types';

export type SpiceLevel = 'mild' | 'spicy' | 'nuclear';

export interface RoastResult {
  title: string;
  verdict: string;
  heatScore: number; // e.g. 94%
  stats: {
    delusionScore: string;
    ringLightHours: string;
    aestheticVsReality: string;
    brandDealReadLatency: string;
  };
  roasts: string[];
  signaturePunchline: string;
}

// Preset custom roasts for known creators
const PRESET_ROASTS: Record<string, Record<SpiceLevel, RoastResult>> = {
  c1: {
    // Aarav Sharma - @aarav.eats (South Delhi / Saket)
    mild: {
      title: "The Artisanal Sourdough Enthusiast",
      verdict: "Needs 15 angles before anyone can take a bite of the butter chicken.",
      heatScore: 68,
      stats: {
        delusionScore: "65%",
        ringLightHours: "4.5 hrs/day",
        aestheticVsReality: "25/100",
        brandDealReadLatency: "Replies faster if you offer truffle oil",
      },
      roasts: [
        "Has photographed 412 avocado toasts this month, consumed zero while they were actually warm.",
        "Local Saket cafes dread his arrival because he rearranges three tables for 'natural afternoon lighting'.",
        "Bio says 'Curating culinary journeys' — bro, you order from Blue Tokai and film the foam art."
      ],
      signaturePunchline: "His food always arrives cold, but his aesthetic is lukewarm."
    },
    spicy: {
      title: "Saket's Self-Proclaimed Michelin Guide",
      verdict: "Can't boil water without putting a cinematic 4K filter over the kettle.",
      heatScore: 89,
      stats: {
        delusionScore: "91%",
        ringLightHours: "8.2 hrs/day",
        aestheticVsReality: "12/100",
        brandDealReadLatency: "Reads DMs within 30s if brand name starts with 'Boutique'",
      },
      roasts: [
        "Takes 45 minutes to film a 5-second Reel of a cappuccino while the restaurant staff contemplates their life choices.",
        "89% local audience in Saket — that's literally his college friends, the Select Citywalk valet, and his mom.",
        "Calls everyday Dal Makhani 'an earthy reduction of heirloom legumes with notes of churned butter'.",
        "Has Velocity Tier enabled so his invoice reaches brands before the food poisoning wears off."
      ],
      signaturePunchline: "Foodie by bio, photographer by obsession, unemployed by tax return."
    },
    nuclear: {
      title: "Select Citywalk Emotional Support Influencer",
      verdict: "Would starve on a deserted island because the coconuts don't have good lighting.",
      heatScore: 98,
      stats: {
        delusionScore: "99.4%",
        ringLightHours: "14 hrs/day",
        aestheticVsReality: "3/100",
        brandDealReadLatency: "Already drafted the brand invoice before they even contacted him",
      },
      roasts: [
        "Claims 42K followers, but engagement rate drops lower than Delhi's winter AQI whenever he forgets to boost the post.",
        "Will debate a street vendor about the acidity balance of pani puri while holding a gimbal in their face.",
        "Subscribed to Velocity tier purely to outrun the embarrassment of charging ₹15,000 for a blurry reel of pasta.",
        "His entire personality is asking the waiter: 'Is the chef comfortable being tagged in an aesthetic story?'"
      ],
      signaturePunchline: "If Select Citywalk bans tripods, this man loses his entire identity."
    }
  },
  c2: {
    // Priya Patel - @priya.fits (Connaught Place)
    mild: {
      title: "The Connaught Place Corridor Model",
      verdict: "Treats the colonnades of CP like Milan Fashion Week.",
      heatScore: 62,
      stats: {
        delusionScore: "70%",
        ringLightHours: "5 hrs/day",
        aestheticVsReality: "30/100",
        brandDealReadLatency: "2 hrs (Busy color-coordinating socks)",
      },
      roasts: [
        "Has 50 drafts of the exact same slow-motion walk outside CP Inner Circle.",
        "Buys outfits from Zara, shoots three reels with the tag tucked inside, and returns them by 5 PM.",
        "Captions photos with existential poetry when she's just showing off a ₹350 tote bag."
      ],
      signaturePunchline: "Fashion is pain, but dodging Delhi pigeons in high heels is torture."
    },
    spicy: {
      title: "CP Heritage Architecture Squatter",
      verdict: "The British built Connaught Place pillars exclusively for her candid hand-on-hip pose.",
      heatScore: 88,
      stats: {
        delusionScore: "92%",
        ringLightHours: "9 hrs/day",
        aestheticVsReality: "15/100",
        brandDealReadLatency: "Instant read if deliverable includes free shoes",
      },
      roasts: [
        "Stands dead still in 42°C Delhi heat just so the linen shirt drapes with 'effortless luxury'.",
        "Free tier status on Radius because all her campaign budget went into paying parking fines near Rajiv Chowk.",
        "Her 'OOTD' videos take 3 days to edit because she has to digitally remove 14 unclejis staring in the background.",
        "Lists 'Fashion Consultant' on LinkedIn, but her consulting is telling her roommate that beige goes with cream."
      ],
      signaturePunchline: "90% of her wardrobe is Zara returns; the other 10% is Janpath bargain bin with an Italian filter."
    },
    nuclear: {
      title: "The Janpath Thrift Exorcist",
      verdict: "Buys a ₹200 oversized blazer and calls it 'vintage Parisian archival menswear'.",
      heatScore: 97,
      stats: {
        delusionScore: "99.1%",
        ringLightHours: "12 hrs/day",
        aestheticVsReality: "5/100",
        brandDealReadLatency: "Seen immediately, replied 3 days later to appear booked & busy",
      },
      roasts: [
        "Refuses to upgrade to Velocity tier because she claims 'true organic reach doesn't need algorithms', aka she's broke.",
        "Has blocked 800 people who commented 'where is this from' after she gatekept a Sarojini Nagar t-shirt.",
        "Walks through Janpath like she's Anna Wintour, haggling ₹50 off sunglasses while wearing fake Prada sunglasses.",
        "Her photo dumps have 10 slides: 1 photo of her face, 4 blurry coffees, a random green leaf, and an empty chair."
      ],
      signaturePunchline: "Aura: 1000. Bank balance: ₹34.50. Ring light battery: 100%."
    }
  },
  c3: {
    // Kabir Malhotra - @kabir.tech (Noida Sector 62)
    mild: {
      title: "The Finger-Tap Unboxing Specimen",
      verdict: "Taps phone boxes with his fingernails for 40 seconds straight.",
      heatScore: 65,
      stats: {
        delusionScore: "68%",
        ringLightHours: "6 hrs/day",
        aestheticVsReality: "35/100",
        brandDealReadLatency: "1 hr (Was benchmarking Geekbench 6)",
      },
      roasts: [
        "Says 'The thermals on this unit are truly phenomenal' while playing Candy Crush in an AC room.",
        "Owns 18 mechanical keyboards, none of which have typed a single original thought.",
        "Spends ₹1.5L on RGB lights to illuminate a Noida Sector 62 PG room."
      ],
      signaturePunchline: "Has 85K followers and 0 friends who don't argue about GPU clock speeds."
    },
    spicy: {
      title: "Noida's Silicon Valley Hallucinator",
      verdict: "Calls unboxing a budget phone 'a deeply tactile tactile sensory experience'.",
      heatScore: 89,
      stats: {
        delusionScore: "90%",
        ringLightHours: "10 hrs/day",
        aestheticVsReality: "18/100",
        brandDealReadLatency: "Replies instantly via automated webhook and 3 Notion automations",
      },
      roasts: [
        "Uses Velocity tier because he calculated that 4.2 milliseconds saved in dispatch boosts his quarterly ROI.",
        "85K followers, but can't explain to his parents why a 26-year-old with a degree screams at graphics cards on camera.",
        "His tech reviews consist of reading the spec sheet on the back of the box with lo-fi beats playing at 80% volume.",
        "Every video starts with: 'So OnePlus sent this over, but all opinions are STRICTLY my own'... right before giving it a 10/10."
      ],
      signaturePunchline: "Built a ₹3 lakh editing rig just to render vertical reels of phone cases."
    },
    nuclear: {
      title: "The Human Geekbench Score",
      verdict: "His blood type is RGB and his emotional range is restricted to frame rates.",
      heatScore: 96,
      stats: {
        delusionScore: "98.7%",
        ringLightHours: "15 hrs/day",
        aestheticVsReality: "2/100",
        brandDealReadLatency: "Faster than 5G mmWave ping",
      },
      roasts: [
        "Will lecture you about why USB 3.2 Gen 2x2 is superior while wearing a t-shirt he hasn't washed since the iPhone 12 launch.",
        "Claims Noida Sector 62 is 'India's tech corridor', bro you live across from an empty vacant plot where buffaloes graze.",
        "Complains about minor screen bezel thickness with the emotional intensity of a Greek tragedy.",
        "Has Velocity tier because without automation, nobody would remember he exists between tech launch cycles."
      ],
      signaturePunchline: "More cables behind his desk than Delhi metro's entire electrical grid."
    }
  },
  c4: {
    // Ananya Sen - @ananya.visuals (West Delhi / Dwarka)
    mild: {
      title: "The Blurry Grain Filter Enthusiast",
      verdict: "Throws 35mm film grain over a blurry photo of a streetlamp and calls it 'Aura'.",
      heatScore: 60,
      stats: {
        delusionScore: "72%",
        ringLightHours: "3 hrs/day",
        aestheticVsReality: "28/100",
        brandDealReadLatency: "3 hrs (Developing emotional connection to a shutter button)",
      },
      roasts: [
        "Captions every photo with Urdu poetry she looked up on Pinterest 2 minutes ago.",
        "Shoots on digital, edits in Lightroom to look like broken 1970s film, then complains about modern technology.",
        "Takes 6 hours to get from Dwarka to Central Delhi just to photograph an empty park bench."
      ],
      signaturePunchline: "The blur in her photos isn't cinematic; the lens was just smudged with momo chutney."
    },
    spicy: {
      title: "Dwarka's Melancholic Pinterest Reposter",
      verdict: "Thinks taking a picture out of a Delhi Metro Blue Line window is peak French cinema.",
      heatScore: 87,
      stats: {
        delusionScore: "93%",
        ringLightHours: "6 hrs/day",
        aestheticVsReality: "14/100",
        brandDealReadLatency: "Replies only if the pitch email mentions 'vibe' or 'aesthetic'",
      },
      roasts: [
        "Free tier because she claims 'monetizing art compromises the spiritual sanctity of the lens'. Translation: no one paid her.",
        "Only 19K followers because her photos are so underexposed that Instagram thinks the file is corrupted.",
        "Dwarka has 23 sectors and she has found a way to look clinically depressed in all 23 of them.",
        "Refuses brand briefs: 'I don't feature products, I let the product exist in conversation with negative space'."
      ],
      signaturePunchline: "Her art conveys sadness, mostly because her bank balance is in mourning."
    },
    nuclear: {
      title: "The 'Nobody Understands My Vision' Trap",
      verdict: "Calls out-of-focus mistakes 'intentional subversion of classical optical clarity'.",
      heatScore: 95,
      stats: {
        delusionScore: "99.8%",
        ringLightHours: "11 hrs/day",
        aestheticVsReality: "1/100",
        brandDealReadLatency: "Ghosted 4 paying brands because their brand color clashed with her beige grid",
      },
      roasts: [
        "Carries an Olympus film camera that hasn't had real film inside since 2021 as a physical prop.",
        "81% local audience in Dwarka — basically aunties from the DDA flats wondering why she's crouching in the bush.",
        "Spends ₹5,000 on vintage film rolls, captures 36 frames of concrete walls, and writes an essay on urban alienation.",
        "If you ask her what camera settings she used, she looks into the middle distance and whispers: 'Intuition'."
      ],
      signaturePunchline: "Not all who wander are lost, but she definitely is, somewhere in Dwarka Sector 14."
    }
  },
  c5: {
    // Rohan Gupta - @rohan_vlogs (North Delhi / DU)
    mild: {
      title: "The DU Decibel Hazard",
      verdict: "Says 'HEYYYY WHAT'S UP GUYS!' loud enough to cause acoustic trauma.",
      heatScore: 66,
      stats: {
        delusionScore: "75%",
        ringLightHours: "7 hrs/day",
        aestheticVsReality: "32/100",
        brandDealReadLatency: "45 mins (Was shouting into a wireless mic)",
      },
      roasts: [
        "Goes to Hudson Cafe solely to record a reel claiming it's the 'best hidden gem' that 4 million college kids already know.",
        "Spends 80% of his vlog time panning across his friend group nodding uncomfortably.",
        "Calls everyday DU campus life 'insane college madness bro'."
      ],
      signaturePunchline: "His voice has three settings: loud, screaming, and sponsored."
    },
    spicy: {
      title: "North Campus Noise Pollution Officer",
      verdict: "Can't eat a plate of Chole Bhature without shoving a wide-angle lens 2 inches from the plate.",
      heatScore: 90,
      stats: {
        delusionScore: "94%",
        ringLightHours: "10 hrs/day",
        aestheticVsReality: "16/100",
        brandDealReadLatency: "Immediate if you offer free food coupons",
      },
      roasts: [
        "93% local audience in DU — it's literally first-year freshers thinking he has the power to get them fest passes.",
        "Velocity tier subscriber because he needs campaign money to pay off his tab at Kamla Nagar food stalls.",
        "Transitions between video clips with whoosh sound effects so aggressive they register on the Richter scale.",
        "Asks street food vendors: 'Bhaiya, isme special secret masala kya hai?' Bhaiya replies: 'Garam masala, camera hatao'."
      ],
      signaturePunchline: "The only thing louder than his intro music is his desperation for a brand collab."
    },
    nuclear: {
      title: "The Kamla Nagar Menace",
      verdict: "Has been barred from 6 street stalls for asking the vendor to 'remake the roll for better slow-mo cheese pull'.",
      heatScore: 97,
      stats: {
        delusionScore: "99.5%",
        ringLightHours: "13 hrs/day",
        aestheticVsReality: "4/100",
        brandDealReadLatency: "Will accept a deal in 12 seconds flat for ₹500 and a thumbs-up",
      },
      roasts: [
        "56K followers, yet still borrows his friend's Pulsar bike to film cinematic DU b-roll transitions.",
        "His video editing is 90% zoom-ins on his own face reacting in fake disbelief to ordinary street food.",
        "Claims he supports local small businesses, but only after demanding they give him and 4 freeloading friends free food.",
        "Will point his camera at a professor walking across Arts Faculty and whisper 'campus legend aura'."
      ],
      signaturePunchline: "If the word 'Bhai' was taxed, he'd be in national debt by Tuesday."
    }
  },
  c6: {
    // Riya Verma - @riya_chic (Gurgaon DLF Phase 3)
    mild: {
      title: "The CyberHub Flat White Aristocrat",
      verdict: "Considers stepping foot outside DLF CyberHub an extreme survival expedition.",
      heatScore: 64,
      stats: {
        delusionScore: "78%",
        ringLightHours: "6.5 hrs/day",
        aestheticVsReality: "31/100",
        brandDealReadLatency: "Depends on whether she's in pilates or brunch",
      },
      roasts: [
        "Calls Gurgaon 'the Manhattan of NCR' without a shred of irony in her voice.",
        "Drinks one iced matcha latte at CyberHub Starbucks and marks it as 'hard work day at the office'.",
        "Has never encountered waterlogging on Golf Course Road because she stays indoors until November."
      ],
      signaturePunchline: "Her sunglasses are bigger than her monthly savings."
    },
    spicy: {
      title: "Cyber City Corporate Aesthetic Tourist",
      verdict: "Dresses in corporate chic blazers despite having never sent a corporate email in her life.",
      heatScore: 91,
      stats: {
        delusionScore: "95%",
        ringLightHours: "11 hrs/day",
        aestheticVsReality: "11/100",
        brandDealReadLatency: "Only replies if the brand pays in advance and sends flowers",
      },
      roasts: [
        "Free tier because she believes brands should pay for her 'lifestyle presence' instead of performance metrics.",
        "33K followers, 30K of which are Gurgaon corporate bros hoping she'll reply to their LinkedIn connection requests.",
        "Poses in front of glass office towers holding an empty Zara paper bag like she just acquired Goldman Sachs.",
        "Her bio says 'Minimalist • Clean Girl • Wellness' — her vanity table looks like a Sephora warehouse fire."
      ],
      signaturePunchline: "Living the 1% lifestyle on a 20% cashback coupon."
    },
    nuclear: {
      title: "DLF Phase 3 Reality Escapee",
      verdict: "Can't survive 10 minutes without air conditioning, high-speed Wi-Fi, and organic oat milk.",
      heatScore: 98,
      stats: {
        delusionScore: "99.9%",
        ringLightHours: "16 hrs/day",
        aestheticVsReality: "2/100",
        brandDealReadLatency: "Left 12 brands on seen because their font choice didn't match her mood board",
      },
      roasts: [
        "Claims 79% local audience, but they're all just other creators sitting three tables away at the same cafe doing the same pose.",
        "Complains about Delhi's chaotic energy while paying ₹450 for avocado toast in a concrete parking complex.",
        "Takes 200 selfies in the elevator of DLF Cyber Park and deletes 199 because 'the elevator mirrors here don't understand my undertones'.",
        "Her idea of roughing it is taking an Uber Premier instead of an Uber Black."
      ],
      signaturePunchline: "So detached from reality that even GPS has trouble locating her ego."
    }
  }
};

/**
 * Procedural roast generator for custom / dynamic creators created in Convex
 */
export function generateDynamicRoast(creator: Creator, spice: SpiceLevel): RoastResult {
  const name = creator.name || 'Anonymous Creator';
  const handle = creator.handle || '@influencer';
  const niche = creator.niche || 'Lifestyle';
  const locality = creator.locality || 'Delhi NCR';
  const followers = creator.followers || '10K';
  const tier = creator.velocityTier || 'Free';
  const bio = creator.bio || '';
  const localAudience = creator.audienceInLocality || 80;

  // Check if we have an explicit preset
  if (PRESET_ROASTS[creator.id] && PRESET_ROASTS[creator.id][spice]) {
    return PRESET_ROASTS[creator.id][spice];
  }

  // Otherwise, procedurally generate hilarious roasts based on metadata
  let heatScore = 70;
  if (spice === 'spicy') heatScore = 88;
  if (spice === 'nuclear') heatScore = 97;

  const titles: Record<SpiceLevel, string[]> = {
    mild: [
      `The Aspiring ${niche} Curator`,
      `${locality}'s Casual Aesthetician`,
      `The "Link In Bio" Optimist`
    ],
    spicy: [
      `${locality}'s Certified Feed Spammer`,
      `The "Collabs via DM" Delusion Specialist`,
      `Self-Appointed ${niche} Visionary`
    ],
    nuclear: [
      `The Ring Light Dictator of ${locality}`,
      `Unemployed With High-Speed Internet`,
      `The Living Reason AdBlock Exists`
    ]
  };

  const selectedTitle = titles[spice][Math.abs(creator.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % titles[spice].length];

  const roasts: string[] = [];

  // Bio roast
  if (bio) {
    if (spice === 'mild') {
      roasts.push(`Bio claims "${bio.slice(0, 40)}..." — we appreciate the optimism!`);
    } else if (spice === 'spicy') {
      roasts.push(`Wrote "${bio.slice(0, 35)}..." in their bio because "full-time vibe consultant" wouldn't fit.`);
    } else {
      roasts.push(`That bio "${bio.slice(0, 35)}..." is doing heavy emotional lifting for a feed that is 90% unedited selfies.`);
    }
  } else {
    roasts.push(`Has no bio, presumably because summarizing their complex aesthetic genius in text is beneath them.`);
  }

  // Niche roast
  if (niche.toLowerCase().includes('food')) {
    roasts.push(spice === 'nuclear'
      ? `Considers adding melted cheese on top of anything 'culinary disruption'.`
      : `Photographs every meal until it's cold, then microwaving it off-camera.`);
  } else if (niche.toLowerCase().includes('tech') || niche.toLowerCase().includes('gaming')) {
    roasts.push(spice === 'nuclear'
      ? `Owns more RGB lights than personality traits; benchmarks toaster ovens for fun.`
      : `Spends 25 minutes discussing button tactility on a device they bought with their parents' card.`);
  } else if (niche.toLowerCase().includes('fashion')) {
    roasts.push(spice === 'nuclear'
      ? `Buys clothes with the price tag tucked under the armpit, films 6 reels, returns everything by Friday.`
      : `Walks in slow motion through crowded streets waiting for random pedestrians to notice the blazer.`);
  } else {
    roasts.push(spice === 'nuclear'
      ? `Claims to do '${niche}', which in practice means reposting Canva quote graphics with lo-fi beats.`
      : `Their ${niche} niche is so broad that even Google's search crawlers get confused.`);
  }

  // Locality & Audience roast
  if (spice === 'mild') {
    roasts.push(`${localAudience}% audience in ${locality} — definitely popular on the neighborhood block!`);
  } else if (spice === 'spicy') {
    roasts.push(`${localAudience}% audience in ${locality} basically means their family group chat, two gym buddies, and the local grocery store.`);
  } else {
    roasts.push(`Stuck with ${localAudience}% local audience in ${locality} because even the next pincode refused to engage with this content.`);
  }

  // Tier & Followers roast
  if (tier === 'Velocity') {
    roasts.push(spice === 'nuclear'
      ? `Paying for Velocity Tier so their overpriced quotes can be ignored by brands 5x faster.`
      : `Subscribed to Velocity Tier hoping the algorithm notices the investment.`);
  } else {
    roasts.push(spice === 'nuclear'
      ? `Free tier warrior. Refuses to pay for platform speed while simultaneously charging brands ₹20k for a reel.`
      : `Keeping it humble on the Free tier while waiting for organic virality to strike.`);
  }

  // Follower count reality check
  roasts.push(spice === 'nuclear'
    ? `${followers} followers, but gets 14 likes unless they pay Meta ₹1,200 for promo reach.`
    : `${followers} followers and dreaming of the day brands start sending free merchandise.`);

  const punchlines: Record<SpiceLevel, string[]> = {
    mild: [
      `A little more content, a little less filter, and you're good to go!`,
      `Keep creating, but maybe let the food stay warm next time!`,
      `Aesthetic is an 8, practicality is a solid 3.`
    ],
    spicy: [
      `Collabs: Open. DMs: Echoing. Ring Light: Blinding.`,
      `Influencing nobody, entertaining everyone, paying for nothing.`,
      `One sponsored reel away from paying rent.`
    ],
    nuclear: [
      `If Instagram deleted all bot accounts tomorrow, this profile would become an empty parking lot.`,
      `Don't quit your day job... wait, this IS your day job? Oh no.`,
      `Aura: -4500. Battery: 12%. Delusion: Unstoppable.`
    ]
  };

  const signaturePunchline = punchlines[spice][Math.abs(handle.length) % punchlines[spice].length];

  return {
    title: selectedTitle,
    verdict: spice === 'nuclear' 
      ? `Needs an intervention and an honest tripod intervention.`
      : spice === 'spicy'
      ? `Living in 4K resolution with 240p real-world practicality.`
      : `Full of potential, just slightly obsessed with the aesthetic.`,
    heatScore,
    stats: {
      delusionScore: spice === 'nuclear' ? "99.2%" : spice === 'spicy' ? "88%" : "64%",
      ringLightHours: spice === 'nuclear' ? "14.5 hrs/day" : spice === 'spicy' ? "8 hrs/day" : "4 hrs/day",
      aestheticVsReality: spice === 'nuclear' ? "4/100" : spice === 'spicy' ? "18/100" : "38/100",
      brandDealReadLatency: tier === 'Velocity' ? "Lightning speed (needs rent money)" : "3 hours (pretending to be at a photoshoot)",
    },
    roasts,
    signaturePunchline
  };
}
