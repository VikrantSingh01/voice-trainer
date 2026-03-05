import { Router, Request, Response } from "express";

export const lessonsRouter = Router();

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: "vowels" | "consonants" | "blends" | "minimal-pairs" | "sentences";
  difficulty: "beginner" | "intermediate" | "advanced";
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  type: "word" | "phrase" | "sentence";
  text: string;
  ipa: string;
  hint?: string;
}

// Seed lessons — targeting sounds non-English speakers commonly struggle with
const lessons: Lesson[] = [
  {
    id: "th-sounds",
    title: "The TH Sounds",
    description: "Master the voiced (ð) and voiceless (θ) TH sounds",
    category: "consonants",
    difficulty: "beginner",
    exercises: [
      { id: "th-1", type: "word", text: "think", ipa: "/θɪŋk/", hint: "Place tongue between teeth, blow air" },
      { id: "th-2", type: "word", text: "this", ipa: "/ðɪs/", hint: "Tongue between teeth, vibrate vocal cords" },
      { id: "th-3", type: "word", text: "three", ipa: "/θriː/", hint: "Voiceless TH followed by R" },
      { id: "th-4", type: "phrase", text: "the weather", ipa: "/ðə ˈwɛðər/", hint: "Both TH sounds in one phrase" },
      { id: "th-5", type: "sentence", text: "I think the weather is good", ipa: "/aɪ θɪŋk ðə ˈwɛðər ɪz ɡʊd/" },
    ],
  },
  {
    id: "r-l-sounds",
    title: "R vs L Sounds",
    description: "Distinguish and produce R and L sounds clearly",
    category: "minimal-pairs",
    difficulty: "beginner",
    exercises: [
      { id: "rl-1", type: "word", text: "right", ipa: "/raɪt/", hint: "Curl tongue back, don't touch roof" },
      { id: "rl-2", type: "word", text: "light", ipa: "/laɪt/", hint: "Touch tongue tip to ridge behind teeth" },
      { id: "rl-3", type: "word", text: "rice", ipa: "/raɪs/" },
      { id: "rl-4", type: "word", text: "lice", ipa: "/laɪs/" },
      { id: "rl-5", type: "sentence", text: "The red light is really bright", ipa: "/ðə rɛd laɪt ɪz ˈrɪəli braɪt/" },
    ],
  },
  {
    id: "v-w-sounds",
    title: "V vs W Sounds",
    description: "Practice the difference between V and W",
    category: "minimal-pairs",
    difficulty: "beginner",
    exercises: [
      { id: "vw-1", type: "word", text: "vine", ipa: "/vaɪn/", hint: "Upper teeth on lower lip" },
      { id: "vw-2", type: "word", text: "wine", ipa: "/waɪn/", hint: "Round your lips" },
      { id: "vw-3", type: "word", text: "vest", ipa: "/vɛst/" },
      { id: "vw-4", type: "word", text: "west", ipa: "/wɛst/" },
      { id: "vw-5", type: "sentence", text: "We have a very nice view", ipa: "/wiː hæv ə ˈvɛri naɪs vjuː/" },
    ],
  },
  {
    id: "short-vowels",
    title: "Short Vowel Sounds",
    description: "Practice short vowels: /ɪ/, /ɛ/, /æ/, /ʌ/, /ʊ/",
    category: "vowels",
    difficulty: "intermediate",
    exercises: [
      { id: "sv-1", type: "word", text: "sit", ipa: "/sɪt/", hint: "Short I — relaxed, quick" },
      { id: "sv-2", type: "word", text: "set", ipa: "/sɛt/", hint: "Short E — mouth slightly open" },
      { id: "sv-3", type: "word", text: "sat", ipa: "/sæt/", hint: "Short A — mouth wide open" },
      { id: "sv-4", type: "word", text: "cut", ipa: "/kʌt/", hint: "Short U — relaxed, central" },
      { id: "sv-5", type: "sentence", text: "The cat sat on a big red rug", ipa: "/ðə kæt sæt ɒn ə bɪɡ rɛd rʌɡ/" },
    ],
  },
  {
    id: "consonant-clusters",
    title: "Consonant Clusters",
    description: "Practice challenging consonant combinations",
    category: "blends",
    difficulty: "intermediate",
    exercises: [
      { id: "cc-1", type: "word", text: "strength", ipa: "/strɛŋθ/", hint: "S-T-R blend at the start" },
      { id: "cc-2", type: "word", text: "twelfth", ipa: "/twɛlfθ/", hint: "LF-TH at the end" },
      { id: "cc-3", type: "word", text: "glimpse", ipa: "/ɡlɪmps/" },
      { id: "cc-4", type: "phrase", text: "six texts", ipa: "/sɪks tɛksts/" },
      { id: "cc-5", type: "sentence", text: "She sells three fresh shrimp", ipa: "/ʃiː sɛlz θriː frɛʃ ʃrɪmp/" },
    ],
  },
  {
    id: "workplace-phrases",
    title: "Workplace Communication",
    description: "Common phrases used in professional settings",
    category: "sentences",
    difficulty: "advanced",
    exercises: [
      { id: "wp-1", type: "sentence", text: "I would like to schedule a meeting", ipa: "/aɪ wʊd laɪk tuː ˈʃɛdjuːl ə ˈmiːtɪŋ/" },
      { id: "wp-2", type: "sentence", text: "Could you please share the document", ipa: "/kʊd juː pliːz ʃɛr ðə ˈdɒkjʊmənt/" },
      { id: "wp-3", type: "sentence", text: "Let me walk you through the presentation", ipa: "/lɛt miː wɔːk juː θruː ðə ˌprɛzənˈteɪʃən/" },
      { id: "wp-4", type: "sentence", text: "I have a question about the quarterly results", ipa: "/aɪ hæv ə ˈkwɛstʃən əˈbaʊt ðə ˈkwɔːrtərli rɪˈzʌlts/" },
      { id: "wp-5", type: "sentence", text: "Thank you for your feedback on the project", ipa: "/θæŋk juː fɔːr jɔːr ˈfiːdbæk ɒn ðə ˈprɒdʒɛkt/" },
    ],
  },
];

/** GET /api/lessons — List all lessons */
lessonsRouter.get("/", (_req: Request, res: Response) => {
  const summary = lessons.map(({ exercises, ...rest }) => ({
    ...rest,
    exerciseCount: exercises.length,
  }));
  res.json(summary);
});

/** GET /api/lessons/:id — Get a specific lesson with exercises */
lessonsRouter.get("/:id", (req: Request, res: Response) => {
  const lesson = lessons.find((l) => l.id === req.params.id);
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  res.json(lesson);
});

/** GET /api/lessons/category/:category — Filter lessons by category */
lessonsRouter.get("/category/:category", (req: Request, res: Response) => {
  const filtered = lessons.filter((l) => l.category === req.params.category);
  res.json(filtered);
});
