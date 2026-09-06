// PalomoProgram content layer.
// Every structure here is derived from "Teddie's daily training guide" (Puppy Foundations, 10-16 weeks).
// Page references are kept so the app can point back to the source.

export const DOG = {
  name: 'Teddie',
  breed: 'German Shepherd (working line)',
  // About 10 weeks on 2026-09-06 -> approximate birth date. Editable in Setup.
  defaultBirthDate: '2026-06-28',
  defaultProgramStart: '2026-09-06',
  caregivers: ['Joey', 'Bryanna'],
  residents: [
    { id: 'maisie', name: 'Maisie', kind: 'dog', note: 'Patient 90-pound Great Pyrenees' },
    { id: 'charlie', name: 'Charlie', kind: 'cat' },
    { id: 'tortilla', name: 'Tortilla', kind: 'cat' },
  ],
};

export const SUCCESS = {
  page: 1,
  headline: 'What success means',
  body: 'A puppy who checks in with you, uses toys appropriately, rests comfortably, and can observe the other pets without pursuing them. Protect Charlie, Tortilla and Maisie while he learns. Follow the response rules consistently; adjust the clock to the puppy in front of you.',
  priorities: [
    'Safety and health',
    'Toileting and rest',
    'Rewarding useful behavior',
    'Gradual pet introductions and socialization',
    'Extra obedience drilling comes last',
  ],
  caution: 'A few good days are encouraging, not a guarantee of adult behavior.',
};

export const KEEP_CHANGE = {
  page: 1,
  rows: [
    { keep: 'Separate feeding and protected pet areas', change: 'Prevent every uncontrolled rush at the cats. Maisie is not responsible for training him.' },
    { keep: 'Potty after waking and before rest', change: 'Offer potty promptly after meals; do not impose a 30-45 minute wait.' },
    { keep: 'Meals in a comfortable crate or pen', change: 'If breakfast and dinner are his only meals, divide the same daily ration into 3-4 meals. This guide uses four initially.' },
    { keep: 'Preventing water spills', change: 'Use a secured or stable bowl so fresh water remains accessible.' },
    { keep: 'Frequent rest opportunities', change: 'Shorten an awake period when needed; do not force an hour of activity or a fixed sleep quota.' },
    { keep: 'Prompt poop pickup and handwashing', change: 'Remove unnecessary cleaning steps; household wipes do not reliably kill roundworm eggs.' },
  ],
};

// Page 2: the daily run of show. Times are minutes from midnight (default clock).
// `kind` drives the icon and which quick-log action is suggested.
export const SCHEDULE = [
  { id: 'wake', start: 7 * 60, end: 7 * 60 + 10, title: 'Wake and potty', kind: 'potty',
    tasks: ['Straight to the potty spot on leash', 'Reward after he finishes, then clean up', 'Check water and pet barriers'] },
  { id: 'meal1', start: 7 * 60 + 10, end: 7 * 60 + 25, title: 'Meal 1', kind: 'meal', meal: 1,
    tasks: ['Use a little of the measured ration for a 1-3 minute lesson', 'Feed the remainder separately from other pets', 'Offer potty promptly afterward'] },
  { id: 'quiet1', start: 7 * 60 + 25, end: 8 * 60, title: 'Quiet interaction', kind: 'play',
    tasks: ['Safe chewing and exploration', 'A short gentle game only if comfortable', 'Potty opportunity before rest'] },
  { id: 'rest1', start: 8 * 60, end: 10 * 60, title: 'Rest opportunity', kind: 'rest',
    tasks: ['Comfortable crate or pen', 'Care for Maisie and the cats', 'Respond if he wakes needing potty'] },
  { id: 'block1', start: 10 * 60, end: 10 * 60 + 45, title: 'Potty, lesson, experience', kind: 'lesson',
    tasks: ['Potty', '1-3 minute lesson', 'A brief positive new experience', 'Suitable play or sniffing', 'Potty and wind down'] },
  { id: 'rest2', start: 10 * 60 + 45, end: 12 * 60, title: 'Rest opportunity', kind: 'rest',
    tasks: ['If awake and calm, safe independent occupation is fine'] },
  { id: 'meal2', start: 12 * 60, end: 13 * 60, title: 'Potty and Meal 2', kind: 'meal', meal: 2,
    tasks: ['Potty', 'Meal 2 around 12:10', 'Prompt post-meal potty', 'Quiet companionship and brief handling practice', 'Rest preparation'] },
  { id: 'rest3', start: 13 * 60, end: 15 * 60, title: 'Rest opportunity', kind: 'rest',
    tasks: ['Interrupt for needs', 'Give the resident pets their normal space and attention'] },
  { id: 'meal3', start: 15 * 60, end: 16 * 60, title: 'Potty and Meal 3', kind: 'meal', meal: 3,
    tasks: ['Potty', 'Meal 3 around 15:10', 'Prompt potty afterward', 'One brief lesson and easy enrichment', 'Wind down'] },
  { id: 'rest4', start: 16 * 60, end: 18 * 60 + 30, title: 'Flexible rest or quiet', kind: 'rest',
    tasks: ['A 2.5-hour block is not a required holding interval', 'If he wakes, potty and adjust the next cycle'] },
  { id: 'meal4', start: 18 * 60 + 30, end: 19 * 60 + 30, title: 'Potty and Meal 4', kind: 'meal', meal: 4,
    tasks: ['Potty', 'Meal 4 around 18:40', 'Prompt potty', 'Brief calm observation of ONE pet only if both animals are comfortable; otherwise train alone'] },
  { id: 'rest5', start: 19 * 60 + 30, end: 21 * 60 + 30, title: 'Rest opportunity', kind: 'rest',
    tasks: ["Prepare tomorrow's ration and supplies", 'Agree overnight coverage'] },
  { id: 'winddown', start: 21 * 60 + 30, end: 22 * 60, title: 'Wind down', kind: 'calm',
    tasks: ['Wake naturally or adjust bedtime', 'Potty, gentle contact, quiet chewing', 'No exciting play', 'Final potty immediately before bed'] },
  { id: 'night', start: 22 * 60, end: 31 * 60, title: 'Bedtime', kind: 'night',
    tasks: ['Overnight potty as needed', 'Low light, leash, quiet praise and reward after toileting', 'Then back to bed'] },
];

export const SCHEDULE_NOTES = {
  page: 2,
  overrides: 'Always overrides the clock: waking, sniffing or circling, a large drink, finishing a meal, distress, illness, or fatigue. Offer extra potty trips during active play. A rest window is an opportunity, not an order to sleep. Do not wake him for a training appointment.',
  dose: 'Daily training dose: 3-5 tiny planned lessons, usually 1-3 minutes each, plus ordinary rewards for good choices. Pet exposure and handling replace a lesson when tiring. Never cram missed sessions into the evening.',
  caveat: 'This clock is a household starting design, not a research-proven optimum. Retaining a later dinner is fine if potty and rest are adjusted. Veterinary instructions take precedence.',
};

export const VOCABULARY = [
  { word: 'Yes', meaning: 'That action earned a reward.' },
  { word: 'Teddie', meaning: 'Turn attention toward me.' },
  { word: 'This way / come', meaning: 'Follow my turn / approach me.' },
  { word: 'Touch', meaning: 'Nose gently touches the offered palm.' },
  { word: 'Sit / down', meaning: 'Bottom down / body down.' },
  { word: 'Mat / crate', meaning: 'Move onto mat / enter crate.' },
  { word: 'Drop / leave it / free', meaning: 'Release item / disengage before taking it / finished with the exercise.' },
];

export const LESSON_RULES = {
  page: 5,
  before: 'Toileted, comfortable, awake and willing to engage. Other pets separated. 5-10 tiny food pieces ready. Start with one skill.',
  during: 'Give a familiar cue once. Mark the correct action immediately with "yes", then deliver food promptly. For a new action, help him succeed before expecting the word to mean anything. If he fails twice, make it easier or stop. Never repeat a cue louder.',
  after: 'Finish with something easy and record the result. A short break beats frustrated drilling. Add only one difficulty at a time: distance, duration, or distraction.',
  stop: 'Stop after 3-5 useful repetitions or about 1-3 minutes.',
  marker: 'Teach the marker first: in a quiet room, say "yes" once, then give a tiny food piece. Repeat about five times. Then mark a simple action such as looking toward you. If you mark accidentally, still pay.',
  fade: 'Fade the visible food, not the reward. Once he follows a lure readily, use the same gesture with an empty hand and feed from the other hand or pouch after success. Do not remove rewards because he performed correctly yesterday.',
  progression: 'Progression rule: 4 of 5 comfortable successes across two separate sessions before one small increase in difficulty. Count a success only when he responds to one cue without seeing a lure first. If he struggles, step back. Cat safety and separation comfort have their own rules; never force exposures to reach a score.',
};

// Skill cards A-J (pages 6-7). `group` decides the daily selection rule.
export const SKILLS = [
  {
    id: 'A', name: 'Name response', cue: 'Teddie', group: 'movement', page: 6,
    goal: 'He turns on one cue in two quiet rooms.',
    steps: [
      'Wait until he is mildly looking elsewhere nearby.',
      'Say "Teddie" once in a friendly voice.',
      'The instant he turns toward you, mark and reward beside your leg.',
      'Repeat 3-5 times with pauses.',
    ],
    ifStuck: 'If he does not turn, make a gentle movement and reduce the distraction next time. Do not chant his name.',
    note: 'This is your foundation for redirecting attention, not a test around cats yet.',
    levels: ['Quiet room, close', 'Quiet room, mild distraction', 'Second quiet room', 'Further away', 'Mild household distraction'],
  },
  {
    id: 'B', name: 'Touch', cue: 'Touch', group: 'movement', page: 6,
    goal: 'He follows the palm one or two steps to touch.',
    steps: [
      'Offer an empty open palm a few inches from his nose.',
      'When he investigates and touches it gently, mark and feed from the other hand.',
      'Move the palm slightly for the next repetition.',
      'Add "touch" just before offering the hand once the action is predictable.',
    ],
    ifStuck: 'If he bites at it, withdraw calmly and use a different exercise.',
    levels: ['Palm a few inches away', 'Palm moved slightly', 'One step to touch', 'Two steps to touch', 'Cue before hand'],
  },
  {
    id: 'C', name: 'This way and come', cue: 'This way / come', group: 'movement', page: 6,
    goal: 'Follows a short turn; approaches willingly from a few feet in a quiet space.',
    steps: [
      '"This way": stand nearby, say it, turn and move two steps. Mark when he follows; reward beside you.',
      '"Come": begin only a few feet away in a secure quiet space. Say it once, move invitingly backward, reward generously on arrival.',
      'Briefly touch the harness only if he is comfortable, reward, then often release him to resume his activity.',
    ],
    ifStuck: 'A lure can help initially. Practice short distances before distractions. Never punish him after coming.',
    note: 'Outdoors, use a secure fenced area or held line. A good indoor recall does not justify off-leash freedom.',
    levels: ['Two-step turn', 'Come from a few feet', 'Come plus harness touch', 'Come across a quiet room', 'Come with mild distraction'],
  },
  {
    id: 'D', name: 'Sit and down', cue: 'Sit / down', group: 'movement', page: 6,
    goal: 'Sit without a displayed treat; a calm completed down on a nonslip surface.',
    steps: [
      'Sit: confirm it without displaying a treat first. Mark and pay when his bottom reaches the floor.',
      'Down: on a nonslip surface, slowly lower a lure from nose level toward the floor, then slightly forward.',
      'Mark the completed position. Add the word when predictable.',
    ],
    ifStuck: 'Never push his body into place. Reward smaller movements or capture a voluntary down.',
    levels: ['Sit without visible treat', 'Down with lure', 'Down with empty-hand gesture', 'Down on cue', 'Sit/down in a second room'],
  },
  {
    id: 'E', name: 'Loose-leash beginnings', cue: 'Leash', group: 'movement', page: 6,
    goal: 'A few comfortable steps with attention, not a formal heel.',
    steps: [
      'Inside, reward standing near your leg with slack in the leash.',
      'Take one step; mark and feed when he follows without pulling.',
      'Build to 3-5 steps, then change direction.',
    ],
    ifStuck: 'If the leash tightens, stop and invite him back. Do not jerk it. Avoid pulling him toward things he fears.',
    levels: ['Standing near leg, slack leash', 'One step', '3-5 steps', 'Direction change', 'Short indoor circuit'],
  },
  {
    id: 'F', name: 'Mat', cue: 'Mat / free', group: 'household', page: 7,
    goal: 'Willingly returning to the mat and relaxing for short periods.',
    steps: [
      'Place a washable mat near you. Reward looking at or stepping onto it; deliver food on the mat.',
      'Build to all four paws, then reward a voluntary sit or down.',
      'Add "mat" when he is predictably moving onto it.',
      'Feed for a second or two of remaining there, say "free", and invite him off.',
      'Increase time slowly before adding distance.',
    ],
    ifStuck: 'If he leaves early, reset easily. Do not pin him down.',
    levels: ['Looks at or steps on mat', 'Four paws on mat', 'Sit or down on mat', 'Stays 1-2 seconds, released with "free"', 'Longer relaxed duration'],
  },
  {
    id: 'G', name: 'Drop', cue: 'Drop', group: 'household', page: 7,
    goal: 'Releases a low-value toy for food and gets the safe toy back.',
    steps: [
      'Begin with a safe, low-value toy. Offer a better food reward near his nose.',
      'When he releases the toy, mark, give food, then return the safe toy.',
      'After several easy trades, say "drop" just before presenting the reward.',
      'Gradually try the word before showing food.',
    ],
    ifStuck: 'No chasing, prying open his mouth, or taking away every possession. For a dangerous swallowed item, contact the vet promptly.',
    levels: ['Trade for food shown', 'Word then food', 'Word before food is shown', 'Medium-value toy', 'Drop in another room'],
  },
  {
    id: 'H', name: 'Leave it', cue: 'Leave it', group: 'household', page: 7,
    goal: 'Voluntary disengagement from a protected boring object.',
    steps: [
      'Practice with a low-value item protected behind a barrier or under a container so he cannot obtain it.',
      'Mark and reward any voluntary disengagement, with food delivered away from it.',
      'Add "leave it" once turning away is predictable.',
    ],
    ifStuck: 'Work with boring objects first. Avoid prolonged fist-mouthing battles. Never use a live cat as the first test. This is a foundation skill, not an emergency guarantee.',
    levels: ['Boring object under container', 'Object behind barrier', 'Cue added', 'Slightly more interesting object', 'Object visible, still protected'],
  },
  {
    id: 'I', name: 'Doorway pause', cue: 'Free', group: 'household', page: 7,
    goal: 'A brief comfortable pause; exterior safety remains physical.',
    steps: [
      'Secure his leash before approaching an exterior door. Begin with the door closed.',
      'Reward four paws on the floor. Touch the handle, reward remaining comfortable, then open a crack.',
      'Close gently if he surges, keeping him clear of the door.',
      'Release with "free" and walk out together when ready. Start with a one-second pause.',
    ],
    ifStuck: 'The latch, leash and adult remain the safety system.',
    levels: ['Door closed, four paws', 'Handle touched', 'Door open a crack', 'One-second pause then "free"', 'Two to three seconds'],
  },
  {
    id: 'J', name: 'Comfortable handling', cue: 'Handling', group: 'handling', page: 7,
    goal: 'Comfort with brief touch, harness, paws, ears, brush and a lip lift.',
    steps: [
      'When relaxed and awake, touch a shoulder briefly, then feed.',
      'Progress separately to harness contact, paws, ears, a brush and a brief lip lift.',
      'One gentle touch per repetition.',
    ],
    ifStuck: 'Stop if he pulls away, freezes or mouths harder. Increase only after comfort, never through restraint struggles. No forced nail-trimming marathon.',
    levels: ['Shoulder touch', 'Harness contact', 'Paws', 'Ears', 'Brush and brief lip lift'],
  },
];

export const SKILL_SELECTION = {
  page: 6,
  rule: 'Choose two movement cards, not all five. One household skill plus a few seconds of handling. Calm mat time is useful even when no new cue is being taught. In the first three days, prioritize A and C; introduce B as an easy additional game. Recheck familiar sit without turning every interaction into an obedience test.',
};

// Page 8: response card.
export const RESPONSES = [
  { id: 'bite', label: 'Teeth touch skin or clothing', short: 'Bite',
    now: 'Stop moving and stop play. If he persists, step behind a nearby barrier for 10-20 seconds; puppy remains safe. Return calmly.',
    next: 'Offer a toy before the next interaction. Reward gentle toy play and calm approaches.' },
  { id: 'bite-repeat', label: 'Biting restarts repeatedly', short: 'Repeat bite',
    now: 'End the session. Check potty, discomfort, hunger and fatigue; offer quiet recovery.',
    next: 'Make the next play period shorter and easier. Do not keep cycling penalties.' },
  { id: 'jump', label: 'Jumps on you', short: 'Jump',
    now: 'Pause attention; turn or step away safely.',
    next: 'Mark and reward four paws on the floor before he jumps.' },
  { id: 'chew', label: 'Chews furniture or a shoe', short: 'Chew',
    now: 'Block access and calmly offer a suitable chew; trade if holding an item.',
    next: 'Improve puppy-proofing and reward choosing his own toys.' },
  { id: 'cat-rush', label: 'Rushes or barks at a cat', short: 'Cat rush',
    now: 'Prevent contact with leash or barrier; calmly move farther away and block view if needed.',
    next: 'Return to the easier cat exercise (protected observation).' },
  { id: 'maisie', label: 'Pesters Maisie', short: 'Pesters Maisie',
    now: 'End access as soon as she disengages or seems uncomfortable.',
    next: 'Reward following you away, with the dogs separated for food.' },
  { id: 'pen-bark', label: 'Barks in pen', short: 'Pen bark',
    now: 'Check toileting, water, discomfort and distress first. Brief mild fuss may settle; escalation means the task is too hard.',
    next: 'Reward quiet before barking starts; teach comfortable separation in tiny steps.' },
  { id: 'ignore', label: 'Ignores a cue', short: 'Ignored cue',
    now: "Don't repeat louder. Reduce distance or distraction, help once or stop.",
    next: 'Return to easier practice where he succeeds.' },
  { id: 'guard', label: 'Growls or guards food or toys', short: 'Guarding', severity: 'high',
    now: 'Give space and prevent access by other pets. Do not punish the warning or test him.',
    next: 'Arrange professional guidance before practicing around the trigger.' },
];

export const RESPONSE_RULES = {
  page: 8,
  never: 'Play ends briefly when biting begins, but never withhold meals, water, toileting or comfort. No shock, ultrasonic deterrents, leash jerks, muzzle grabbing, scruff shaking or forced submission.',
  biting: 'For play biting, the goal is that interaction becomes predictable. A yelp is unnecessary and may excite some puppies; use a quiet pause. If he repeatedly bites to make a toy appear, offer the toy earlier and reward calm approach before teeth contact.',
  reset: 'Caregiver reset: if you feel angry or overwhelmed, place him comfortably in the safe area after checking needs and ask the other adult to take over. Stop training before either of you loses patience. Do not leave a panicking puppy alone as a consequence.',
};

// Page 9: resident pets.
export const PETS = {
  page: 9,
  outcome: 'The outcome is comfortable coexistence, not forced friendship.',
  cats: {
    setup: 'Use a secure barrier plus a held harness leash at first. Work with one cat at a time and keep Maisie elsewhere. The cat chooses whether to appear and can retreat to a protected area. Never hold or lure a frightened cat closer.',
    method: 'Start where Teddie can notice the cat with a loose body and turn toward you. Mark a calm glance and feed beside your leg, away from the cat. As he learns, reward a voluntary glance back to you. Try only a few easy repetitions, then leave. Food acceptance alone is not proof that he is relaxed.',
    abort: 'If he stares rigidly, stiffens, barks, lunges, or cannot turn away: increase distance or end visual access. Do not repeatedly expose him until he stops reacting. Next time start easier.',
    progress: 'Only after repeated calm sessions on different occasions, with the cat comfortable too, change ONE thing: a little more viewing time OR a little less distance. Keep physical prevention in place. Calm behavior near a stationary cat does not establish safety when it runs. No age or 4/5 score authorizes unsupervised access.',
    welfare: 'If a cat stays hidden, stops eating normally or loses access to its resources, restore separation and consult its vet. The cats’ welfare is part of the outcome.',
  },
  maisie: {
    method: 'Begin with brief, closely supervised contact only when both dogs appear comfortable. Interrupt after a short burst and invite Teddie away. Let Maisie decide whether to reapproach.',
    abort: 'If she walks away, hides, stiffens, repeatedly turns her head away or looks overwhelmed, the interaction is over. If Teddie cannot be guided away safely, use barriers and separate activities instead.',
    reward: 'Reward Teddie for following you away after separation, not by scattering food between the dogs. Keep meals, chews and high-value toys separate. Maisie’s size does not remove injury risk to either dog. Do not wait for a correction or a cat scratch to "teach him a lesson".',
  },
  logNote: 'Do not provoke an interaction to fill in the log.',
};

// Page 10: rest, crate comfort and being alone.
export const REST = {
  page: 10,
  rest: 'Offer a comfortable, quiet place after toileting and suitable activity. An awake window can include quiet chewing and lying near you; it need not be a full hour of entertainment. If he becomes frantic or mouthy, check needs rather than automatically adding exercise.',
  sleep: 'Count actual sleep separately from time in the crate. No exact sleep quota or one-hour-up/two-hours-down cycle has been established for Teddie. If he sleeps through a training slot, move or skip the lesson. If he cannot rest despite a sensible setup, discuss health and behavior with his vet.',
  settle: 'Calm outside the crate: sit quietly near his mat in a low-distraction room. Quietly deliver a small reward between his paws when he relaxes, looks away from you, or rests his head. Avoid exciting praise that makes him spring up. Start with brief successes and gradually space rewards.',
  separationSteps: [
    { step: 1, title: 'Settle nearby', text: 'After potty, help him settle in the pen or crate while you sit nearby. Pleasant open-door experiences come first if he is not already comfortable.' },
    { step: 2, title: 'Door closed briefly', text: 'Close the door briefly while he remains comfortable. Reward calmly, then open it.' },
    { step: 3, title: 'Stand, step, return', text: 'Stand up and sit back down. Later, take one step away and return. Repeat easier versions between harder ones.' },
    { step: 4, title: 'Out of view, seconds', text: 'Only after these are easy, leave view briefly, starting with a second or two. Return before distress. Use a camera when you cannot see him.' },
  ],
  separationRules: 'Increase distance or time, not both at once. A food toy may help; check comfort after the food is finished too. Brief mild fuss is different from panic. Escalating cries, frantic escape attempts, panting or drooling unrelated to heat, or inability to settle mean end the difficult exposure and seek guidance. Do not require silence before relieving severe distress.',
  overnight: 'Keep the sleeping setup close enough to hear him. On waking or restlessness, offer a quiet potty trip and return calmly to bed. Record the time rather than deciding that one long night means he can always hold it. If accidents recur before you hear him, plan a break before his usual accident time.',
};

// Page 11: socialization rotation.
export const SOCIAL = {
  page: 11,
  intro: 'Early socialization is valuable before the vaccine series is complete, but recent worms and unknown vaccination dates require the vet’s guidance for classes, other dogs and public ground. Use safe home experiences, being carried, or observation from a comfortable vehicle. Avoid dog parks and shared dog-toilet areas.',
  rule: 'One or two easy experiences each day. An experience can last seconds; a relaxed observation counts. Pair the sight or sound with food and stop before he is overwhelmed. Do not lure him toward something frightening. If he freezes, retreats or stops engaging: increase distance, lower intensity or end.',
  rotation: [
    { day: 1, exposure: 'A different hat or coat on a familiar person', enrichment: 'Find kibble on a clean indoor mat' },
    { day: 2, exposure: 'Quiet recorded household sound, very low volume', enrichment: 'Supervised easy food toy' },
    { day: 3, exposure: 'Voluntary exploration of a clean nonslip new surface', enrichment: 'Gentle two-toy exchange' },
    { day: 4, exposure: 'A calm visitor at comfortable distance, no forced greeting', enrichment: 'Follow you around a quiet room' },
    { day: 5, exposure: 'Short comfortable car experience with safe restraint', enrichment: 'Simple sniff-and-find game' },
    { day: 6, exposure: 'Observe distant people from a safe position', enrichment: 'Appropriate chewing near you' },
    { day: 7, exposure: 'Repeat the easiest exposure; no novelty required', enrichment: 'Calm mat time and favorite easy game' },
  ],
  exercise: 'Short self-paced exploration on safe surfaces and brief gentle play. Let him stop. Avoid forced distance running, repeated high jumps, hard pivots and rough wrestling with a much larger dog. Keep toy play feet-on-the-ground and gentle; practice trading between two toys. If play increases mouthing, pause and lower excitement.',
  classes: 'Class readiness: vet-approved parasite status and vaccine timing; clean facilities; rewards-based instruction; size and temperament-appropriate supervised contact. Do not attend while ill or potentially infectious.',
};

// Page 12: the first 14 days.
export const PLAN14 = [
  { day: 1, focus: 'Set up barriers, ration and water; pair "yes" with food; name response.', progress: 'You can prevent rushing and reward several easy responses. Record baseline.', skills: ['A'] },
  { day: 2, focus: 'Name and "this way" in a quiet room; introduce mat.', progress: 'Turns toward you; follows a short turn; investigates mat willingly.', skills: ['A', 'C', 'F'] },
  { day: 3, focus: 'Repeat; add touch if comfortable. Brief closed-door practice nearby.', progress: 'Several comfortable repetitions; no need to extend time.', skills: ['A', 'C', 'B'], separation: 2 },
  { day: 4, focus: 'Practice familiar cues without showing food first.', progress: 'Responds to a gesture or cue, then receives food from pouch.', skills: ['A', 'C', 'B'] },
  { day: 5, focus: 'Introduce safe toy trade; capture calm on mat.', progress: 'Releases low-value toy for food; gets safe toy back.', skills: ['G', 'F'] },
  { day: 6, focus: 'Add down or one-step leash following.', progress: 'Comfortable movement without pushing or pulling.', skills: ['D', 'E'] },
  { day: 7, focus: 'Review day. Repeat easy lessons; compare with baseline.', progress: 'Identify one improvement and one setup change. No exam.', skills: ['A', 'C'], review: true },
  { day: 8, focus: 'Practice familiar attention cue in a second quiet room.', progress: 'Responds in new location with easy distance and rewards.', skills: ['A'] },
  { day: 9, focus: 'Introduce leave-it with an inaccessible boring object.', progress: 'Voluntary disengagement; protected item remains unavailable.', skills: ['H'] },
  { day: 10, focus: 'Recall a few feet; return to play after reward.', progress: 'Willingly approaches; harness contact stays comfortable.', skills: ['C', 'J'] },
  { day: 11, focus: 'Add a tiny mat duration increase OR one separation step.', progress: 'Relaxed success without increasing two challenges.', skills: ['F'], separation: 3 },
  { day: 12, focus: 'Second caregiver repeats the easiest familiar lesson.', progress: 'Learning transfers with same words and reward timing.', skills: ['A', 'C'] },
  { day: 13, focus: 'Practice doorway pause with secure leash.', progress: 'Brief comfortable pause; exterior safety remains physical.', skills: ['I'] },
  { day: 14, focus: 'Review log and adjust next week.', progress: 'Decide what to repeat, what to advance, and where help is needed.', skills: ['A', 'F'], review: true },
];

export const PLAN_NOTES = {
  page: 12,
  days: 'Days are planning prompts, not deadlines. Keep practicing an earlier step when he needs it. Pet sessions stay at a comfortable distance regardless of the calendar.',
  missed: 'If you miss a day: resume the last easy level. Do not double training volume. On a difficult day, maintain care and safety, reward a few easy choices, and prioritize rest.',
  flat: 'If progress is flat: check reward value, timing, distance, session length, sleep and health before deciding he is stubborn. Ask a qualified trainer to observe actual handling and pet setup.',
};

// Page 13: weeks 3-6 and after.
export const PHASES = [
  { id: 'w1-2', from: 1, to: 14, label: 'Weeks 1-2', age: 'about 10-12 weeks', focus: 'Foundations: marker, name, this way, mat, touch, trade, calm, protected pet observation.' },
  { id: 'w3-4', from: 15, to: 28, label: 'Weeks 3-4', age: 'about 12-14 weeks', focus: 'Familiar cues in more quiet locations; gradually longer relaxed mat moments; comfortable handling; gentle leash skills; positive new experiences; tiny separation increases.' },
  { id: 'w5-6', from: 29, to: 42, label: 'Weeks 5-6', age: 'about 14-16 weeks', focus: 'Add modest everyday distractions one at a time; practice with both caregivers; continue polite play, recall and calm observation of pets. Review meal frequency with vet.' },
  { id: 'after', from: 43, to: 9999, label: 'After 16 weeks', age: '16 weeks and beyond', focus: 'Continue foundation work and supervised pet management. Teething and adolescence can change behavior. Revisit easier levels when needed.' },
];

export const TROUBLESHOOT = [
  { problem: 'Only listens when food is visible', fix: 'Return to an easy known response with an empty-hand gesture; reward afterward. Do not remove payment entirely.' },
  { problem: 'Will not take food near a cat', fix: 'Increase distance or stop. Check illness, satiety and reward preference. Food drive does not override fear or excitement.' },
  { problem: 'Works for Joey but not Bryanna', fix: 'Start the second caregiver in the easiest room with the same cue and reward. Compare setup, not personalities.' },
  { problem: 'Quiet only while eating a food toy', fix: 'Separation training is not finished. Practice very small absences and observe him after the food ends.' },
  { problem: 'Accidents increase', fix: 'Shorten potty intervals and review meal and drink timing. Sudden change, straining or illness warrants a vet call.' },
];

export const HELP = {
  page: 13,
  when: 'Ask your vet and a reward-based puppy trainer for an assessment if biting escalates, he is difficult to handle safely, distress prevents normal rest, or pet introductions remain uncomfortable. Choose someone who can explain body language and demonstrate the household plan with you.',
  urgent: 'Keep pets separated and seek prompt professional guidance for rigid fixation, stalking, grabbing or shaking another animal, guarding, or biting during gentle handling.',
  medical: 'Repeated vomiting or diarrhea, marked lethargy, refusal of food or water, painful swelling, or suspected ingestion require prompt veterinary advice.',
  emergency: 'Collapse, breathing trouble, or unproductive retching with a swollen abdomen are emergencies.',
  handoff: 'At each handoff: last potty, last meal and remaining ration, last sleep, medication due, and current pet separation. Consistency requires a sustainable care arrangement; it cannot depend on one person’s unlimited availability.',
};

// Page 3-4: care reference.
export const CARE = {
  food: {
    page: 3,
    text: 'Use a complete growth food appropriate for large-breed puppies. Confirm the current daily amount with his vet using present weight, body condition and the food’s calorie density. Do not invent a cup amount from the old 15-pound weight or his father’s size. Avoid calcium supplements unless prescribed.',
    split: 'Divide the ration into four small meals initially, unless the vet recommends three. Set aside a small portion of each meal for rewards; feed unused food with that meal. He does not have to earn all his food. Adding meal times does not add calories. At about 12 weeks, ask whether to move to three meals.',
    treats: 'Use tiny, soft rewards he swallows comfortably. Keep non-complete treats at no more than 10% of daily calories; ordinary puppy food can supply most repetitions. If appetite or stools change, simplify treats and speak to his vet.',
    fast: 'For fast eating, try a puppy-appropriate slow feeder or spread the measured meal across a clean wide dish. Supervise feeding toys. Feed all pets separately; pick up leftovers. Do not reach into his bowl or repeatedly take it away to test him.',
  },
  water: {
    page: 3,
    text: 'Fresh water in a securely attached or stable bowl accessible in his safe area. Check it at each handoff and after activity. Do not restrict water to improve house training or make food more motivating.',
  },
  potty: {
    page: 3,
    when: 'Offer a trip immediately after waking, promptly after meals or drinking, before confinement and bedtime, and whenever he signals. While playing actively, start with opportunities roughly every 30 minutes and adjust to his recorded pattern. Calm post-meal toileting is not vigorous exercise.',
    how: 'Go to the same spot on leash. Wait quietly a few minutes. When he finishes, say "yes" and reward outdoors. If nothing happens, return to close supervision and retry in 5-10 minutes; sooner if he signals. Add "go potty" when elimination becomes predictable.',
    accident: 'If you catch an accident starting, guide him outside calmly. Clean with a pet-appropriate cleaner; do not punish.',
  },
  home: {
    page: 4,
    spaces: [
      { name: 'Teddie’s area', text: 'Puppy-proof pen or room, comfortable resting place, accessible water and suitable toys. Near family activity without reaching other pets. If the view excites him, increase distance or block the view.' },
      { name: 'Resident pets’ area', text: 'Charlie, Tortilla and Maisie can eat, rest and move away without being pursued. Cats need independent access to litter, food, water and elevated retreats. Rotate space so the established pets are not always confined to a bedroom.' },
      { name: 'Practice area', text: 'A quiet room away from the animals, slippery flooring and hazards. Keep a mat, rewards, two toys, harness and leash ready. When nobody is actively supervising pet interactions, use secure closed-door separation. A gate must not be something either animal can bypass.' },
    ],
    equipment: [
      'Well-fitted harness, ordinary leash, secure gates or pen and a suitable crate',
      'Stable or attached water bowl; separate measured meals; reward pouch',
      'Washable mat, two appropriately sized toys and a supervised food toy',
      'Poop bags, optional gloves or scoop, covered trash and soap; pet-appropriate accident cleaner',
      'Phone timer and optional camera for checking separation comfort',
    ],
    equipmentNote: 'Remove leash and snag-prone equipment before unsupervised confinement. Check toys for damage and remove anything he can swallow. Use the crate for comfort, never to force prolonged isolation as a penalty.',
    poop: [
      'Secure Teddie so he cannot reach the stool or escape while you clean.',
      'Pick up the entire stool promptly with a bag or scoop; gloves are optional protection.',
      'Seal and dispose in covered trash. Keep contaminated gloves away from handles.',
      'Remove gloves and wash hands with soap and water. Clean any surface actually contaminated.',
    ],
    poopNote: 'Common disinfectants do not reliably kill roundworm eggs. Hosing is not decontamination; collect solids instead of washing them into the ground. Wiping every handle after every stool is not a substitute for removal and parasite treatment. Fresh feces are not harmless simply because roundworm eggs take time to become infective.',
  },
};

// Page 15: weekly review.
export const WEEKLY_QUESTIONS = [
  { id: 'attention', q: 'Can he turn toward each caregiver on one cue in an easy setting?' },
  { id: 'biting', q: 'Is his biting easier to interrupt in comparable play periods?' },
  { id: 'calm', q: 'Does he choose calm behavior outside the crate?' },
  { id: 'separation', q: 'What separation step is comfortable, including after food ends?' },
  { id: 'cats', q: 'Can each cat eat, rest and move freely in protected space?' },
  { id: 'maisie', q: 'Does Maisie comfortably choose contact and get breaks?' },
  { id: 'toileting', q: 'Are accidents and stool changes improving, unchanged or worse?' },
  { id: 'humans', q: 'Can the humans sustain the care plan next week?' },
];

export const WEEKLY_DECISIONS = [
  { id: 'advance', label: 'Advance', text: 'Comfortable success is repeatable; change one variable slightly.' },
  { id: 'repeat', label: 'Repeat', text: 'Variable response, no clear distress; keep the same or easier level.' },
  { id: 'help', label: 'Get help', text: 'Worsening fear or handling, unsafe interactions, persistent distress, illness, or a care arrangement that cannot be maintained.' },
];

export const REVIEW_DAYS = [7, 14, 21, 28, 35, 42];

export const NOT_INFER = 'Food motivation does not certify temperament. A calm three-day period does not establish adult safety. A setback does not establish failure. Assess Teddie’s observable comfort and learning alongside the wellbeing of the existing pets and the adults.';

export const EVIDENCE = {
  page: 16,
  supports: [
    'Training: AVSAB Humane Dog Training position (2021, reaffirmed 2025) supports reward-based methods. VCA Training Basics (2025) supports brief practice and gradual distractions; VCA Marker Training (2023) explains precise feedback. Dogs Trust skill guides supply practical examples.',
    'Care: VCA Housetraining (2023) supports event-based outings. Banfield Puppy Feeding (2026) suggests four meals under 12 weeks; other clinical guidance allows three or four. AAHA Nutrition Guidelines (2021) address growth diets.',
    'Parasites: CAPC Ascarid Guidelines (2025) and CDC Toxocariasis (2024) support prompt waste removal, hygiene and veterinary control.',
    'Other pets and rest: Best Friends Cat Introduction Guide, Dogs Trust Household Guidance, AKC Adult Dogs and Puppies (2025), VCA Confinement Guide (2026).',
    'Socialization: AVSAB Puppy Socialization statement (2008) supports safe early exposure with vaccination and parasite precautions.',
  ],
  limits: 'There is no established fastest daily schedule for a 10-week working-line German Shepherd. The clock, 1-3 minute lessons, 4/5 progression rule and 14-day sequence are practical design choices, not validated prescriptions. No direct behavior observation, physical exam, verified pedigree, current weight, food label or vaccine and parasite records were available. Use the guide consistently, adjust to observed comfort, and seek hands-on help when needed.',
};

// Morning prep and evening handoff checklists (page 14).
export const PREP_ITEMS = [
  { id: 'ration', label: 'Ration measured' },
  { id: 'water', label: 'Water secure and full' },
  { id: 'barriers', label: 'Barriers checked' },
  { id: 'rewards', label: 'Rewards ready' },
  { id: 'meds', label: 'Medication plan checked' },
  { id: 'duty', label: 'Duty and backup assigned' },
  { id: 'pets', label: 'Other pets’ needs met' },
];

export const HANDOFF_CHECKS = [
  { id: 'water', label: 'Clean water available' },
  { id: 'pets', label: 'Pets secured separately' },
  { id: 'overnight', label: 'Overnight adult ready' },
];

// Setup record fields (pages 3, 4, 13, 15).
export const SETUP_FIELDS = [
  { section: 'Feeding plan', fields: [
    { id: 'foodName', label: 'Food name' },
    { id: 'dailyAmount', label: 'Daily complete food (grams or cups)' },
    { id: 'calories', label: 'Calorie density (kcal/cup or kcal/kg)' },
    { id: 'weight', label: 'Current weight and date' },
    { id: 'vetPlan', label: 'Vet-confirmed feeding plan and date' },
    { id: 'mealReview', label: 'Meal-frequency review around 12 weeks' },
  ] },
  { section: 'Parasite follow-up', fields: [
    { id: 'parasite', label: 'Confirmed parasite' },
    { id: 'lastTreatment', label: 'Last treatment' },
    { id: 'nextDose', label: 'Next dose' },
    { id: 'fecalRecheck', label: 'Fecal recheck' },
    { id: 'householdPrevention', label: 'Household-pet prevention' },
  ] },
  { section: 'Veterinary and care', fields: [
    { id: 'vet', label: 'Veterinarian and phone', tel: true },
    { id: 'emergency', label: 'Emergency clinic and phone', tel: true },
    { id: 'trainer', label: 'Trainer, methods and contact' },
    { id: 'vaccines', label: 'Vaccine dates and next appointment' },
    { id: 'classPermission', label: 'Permission for classes and dog contact' },
  ] },
  { section: 'Responsibility roster', fields: [
    { id: 'morningAdult', label: 'Morning adult' },
    { id: 'daytimeAdult', label: 'Daytime adult' },
    { id: 'eveningAdult', label: 'Evening adult' },
    { id: 'overnightAdult', label: 'Overnight adult' },
    { id: 'backupAdult', label: 'Backup when working or traveling' },
  ] },
];

export function skillById(id) {
  return SKILLS.find((s) => s.id === id);
}

export function phaseForDay(day) {
  return PHASES.find((p) => day >= p.from && day <= p.to) || PHASES[PHASES.length - 1];
}
