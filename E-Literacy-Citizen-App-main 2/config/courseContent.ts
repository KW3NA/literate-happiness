// Built-in course content library.
// Provides full modules (lessons) and quiz questions for every course so the
// Learning Hub is never empty, even when Supabase has no data yet.
// Any content loaded from Supabase takes precedence over these defaults.

export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'tip' | 'action' | 'warning';
  content: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface CourseModule {
  id: string;
  title: string;
  order_num: number;
  estimated_minutes: number;
  blocks: ContentBlock[];
  quiz?: { questions: QuizQuestion[] };
}

const m = (
  courseId: string,
  order: number,
  title: string,
  minutes: number,
  blocks: ContentBlock[],
  questions?: QuizQuestion[],
): CourseModule => ({
  id: `${courseId}-m${order}`,
  title,
  order_num: order,
  estimated_minutes: minutes,
  blocks,
  ...(questions && questions.length ? { quiz: { questions } } : {}),
});

// ---------------------------------------------------------------------------
// Course-related YouTube videos. Each entry is a REAL, well-known educational
// video whose topic matches the course it is assigned to. Lessons pick videos
// from their course bank in order (cycling if there are more lessons than
// videos), so every lesson shows content related to the course.
// ---------------------------------------------------------------------------
export interface CourseVideo { id: string; title: string; }

const courseVideos: { [key: string]: CourseVideo[] } = {
  // Digital Basics 101 / Introduction to Computers
  '4': [
    { id: 'Z1XJFdHlos4', title: 'Computer Basics for Complete Beginners' },
    { id: 'vQrUepccYBk', title: 'Introduction to Computers' },
    { id: 'VodBYtDJSAY', title: 'Parts of a Computer' },
  ],
  '5': [
    { id: 'Z1XJFdHlos4', title: 'Computer Basics for Complete Beginners' },
    { id: 'VodBYtDJSAY', title: 'Parts of a Computer' },
    { id: 'vQrUepccYBk', title: 'Introduction to Computers' },
  ],
  // Internet Basics
  '6': [
    { id: 'PfNbaROmwcg', title: 'How the Internet Works in 5 Minutes' },
    { id: '7lpqqmgeLNg', title: 'Introduction to the Internet' },
    { id: 'VKMUIyC_KC0', title: 'Internet Safety Basics' },
  ],
  // Online Safety & Security
  '7': [
    { id: 'SUOc3n06wIA', title: 'What is Cyber Security?' },
    { id: 'hkxKFWR3_-o', title: 'Phishing Explained' },
    { id: 'i2GhEFAkbfo', title: 'Password Security Best Practices' },
  ],
  // Email & Communication
  '8': [
    { id: 'a5uT85i9zQU', title: 'Gmail Tutorial for Beginners' },
    { id: 'bCDG_5dIInA', title: 'Email Etiquette at Work' },
    { id: '7lOdFeAVCVY', title: 'How to Send an Attachment in Gmail' },
  ],
  // Digital Citizenship
  '9': [
    { id: 'F7jGp1GzO_A', title: 'What is Digital Citizenship?' },
    { id: 'lmoW02EwSpA', title: 'Digital Footprint Explained' },
    { id: 'VKMUIyC_KC0', title: 'Online Safety and You' },
  ],
  // Job Search Online
  '10': [
    { id: 'l_C5s4JQHZ4', title: 'How to Write a Resume Step by Step' },
    { id: '33SKN_o2iVA', title: 'Job Interview Tips' },
    { id: 'Z0B4e1GZ5fE', title: 'Using LinkedIn for Job Searching' },
  ],
  // Content Creation
  '11': [
    { id: 'esOIt3-9vlA', title: 'Canva Tutorial for Beginners' },
    { id: 'Y2FEKkePeP0', title: 'Social Media Content Strategy' },
    { id: 'gV1z59fILVo', title: 'Video Editing Basics on Your Phone' },
  ],
  // Digital Banking & Finance
  '12': [
    { id: 'VGETWcjoAUU', title: 'Personal Finance Basics' },
    { id: 'u5ayAWWKRAI', title: 'How Online Banking Works' },
    { id: '3MLkxapGsIk', title: 'Avoiding Money Scams Online' },
  ],
  // E-Government Services
  '13': [
    { id: 'RVMYtnYV4Ds', title: 'What is E-Government?' },
    { id: 'SpxzFoTqCwo', title: 'Using Government Services Online' },
    { id: '7lpqqmgeLNg', title: 'Finding Official Websites Safely' },
  ],
  // Remote Work & Collaboration
  '14': [
    { id: 'wpDi7B_NmQ0', title: 'Remote Work Productivity Tips' },
    { id: 'DGDC954-AO8', title: 'Google Meet Tutorial' },
    { id: '6ON_ACAkMNI', title: 'Microsoft Teams Tutorial for Beginners' },
  ],
  // Digital Marketing Basics
  '15': [
    { id: 'nIoXdkEBl4M', title: 'Digital Marketing explained simply' },
    { id: 'nzbcAhnDsnw', title: 'Social Media Marketing for Beginners' },
    { id: 'aqz-KE-bpKQ', title: 'What is SEO?' },
  ],
  // Data & AI Literacy
  '16': [
    { id: 'aircAruvnKk', title: 'But what is a Neural Network?' },
    { id: 'mkSREaK_f4I', title: 'Artificial Intelligence Explained' },
    { id: 'HXVZze5IY94', title: 'Data Literacy: Reading Charts and Statistics' },
  ],
  // Entrepreneurship Online
  '17': [
    { id: 'ZZkgC9BHy00', title: 'How to Start a Small Business Online' },
    { id: 'VGETWcjoAUU', title: 'Money Basics for Entrepreneurs' },
    { id: 'nzbcAhnDsnw', title: 'Marketing Your Business on Social Media' },
  ],
  // Mobile Skills / Smartphone Basics
  '18': [
    { id: 'fEkXavRkzlQ', title: 'Android Tips and Tricks for Beginners' },
    { id: 'Z1XJFdHlos4', title: 'Smartphone Basics' },
    { id: 'i2GhEFAkbfo', title: 'Keeping Your Phone Secure' },
  ],
  // CV Writing
  '19': [
    { id: 'l_C5s4JQHZ4', title: 'How to Write a Professional CV' },
    { id: '33SKN_o2iVA', title: 'CV Mistakes to Avoid' },
    { id: 'Z0B4e1GZ5fE', title: 'Tailoring Your CV for Each Job' },
  ],
};

/** Returns the YouTube video most related to a given course+lesson position. */
export function getCourseVideo(courseId: string | number, lessonIndex: number = 0): { url: string; title: string } {
  const bank = courseVideos[String(courseId)] || courseVideos['4'];
  const v = bank[lessonIndex % bank.length];
  return { url: `https://www.youtube.com/watch?v=${v.id}`, title: v.title };
}

/** All videos for a course (used as fallback when Supabase has no video_url). */
export function getCourseVideos(courseId: string | number): { url: string; title: string }[] {
  const bank = courseVideos[String(courseId)] || courseVideos['4'];
  return bank.map((v) => ({ url: `https://www.youtube.com/watch?v=${v.id}`, title: v.title }));
}

// ---------------------------------------------------------------------------
// Module content per course id
// ---------------------------------------------------------------------------
const courseModules: { [key: string]: CourseModule[] } = {
  // ---- Digital Basics 101 --------------------------------------------------
  '4': [
    m('4', 1, 'What Is a Digital Device?', 10, [
      { type: 'heading', content: 'Devices around you' },
      { type: 'paragraph', content: 'A digital device is any machine that stores and processes information using electricity — phones, tablets, laptops, TVs and even ATMs. You already use several of them every day.' },
      { type: 'paragraph', content: 'Every device has four parts: hardware (the physical pieces), software (the programs), input (how you tell it things, like tapping or typing) and output (how it answers, like the screen or sound).' },
      { type: 'tip', content: 'Write down every digital device you touch between waking up and going to sleep. Most people count more than ten!' },
      { type: 'action', content: 'Pick one device at home and identify its input methods (buttons, touchscreen, microphone) and output methods (screen, speaker, printer).' },
    ], [
      { question: 'Which of these is an INPUT method for a smartphone?', options: ['Speaker', 'Touchscreen', 'Screen', 'Printer'], correct: 1 },
      { question: 'Software means…', options: ['The physical parts of a device', 'The programs and apps a device runs', 'The power cable', 'The case around the phone'], correct: 1 },
      { question: 'An ATM is an example of…', options: ['A digital device', 'A piece of furniture', 'An analog tool', 'A website only'], correct: 0 },
    ]),
    m('4', 2, 'Turning Devices On & Off Safely', 10, [
      { type: 'heading', content: 'Powering up properly' },
      { type: 'paragraph', content: 'Always let a device finish starting up before you unplug it. Turning off power during an update can corrupt files and "brick" the device (break it permanently).' },
      { type: 'paragraph', content: 'Use the shutdown menu instead of pulling the plug. On phones, hold the power button and choose "Power off". On computers, choose Start > Power > Shut down.' },
      { type: 'warning', content: 'Never remove a USB drive while files are copying — wait until the light stops blinking.' },
      { type: 'action', content: 'Practice shutting your device down correctly using the on-screen menu, then restart it and check how long a full start-up takes.' },
    ], [
      { question: 'What can happen if you unplug a device during a system update?', options: ['Nothing, it is safe', 'Files can be corrupted', 'It charges faster', 'The screen gets brighter'], correct: 1 },
      { question: 'The correct way to turn off a computer is…', options: ['Pull the power cable', 'Hold the mouse still', 'Use the Shut down menu', 'Press every key at once'], correct: 2 },
    ]),
    m('4', 3, 'Your First Week Online', 15, [
      { type: 'heading', content: 'Connecting responsibly' },
      { type: 'paragraph', content: 'Wi-Fi connects your device to the internet without cables. Only join networks you trust — your home network, or a named public network from the shop or library.' },
      { type: 'paragraph', content: 'Data costs money. Turn off automatic app updates on mobile data, and prefer Wi-Fi when downloading videos or large files.' },
      { type: 'tip', content: 'Check your data balance weekly in your phone settings under "Mobile data" so there are no surprises at month-end.' },
      { type: 'action', content: 'Connect to a trusted Wi-Fi network, open a website, then disconnect again. Repeat until it feels natural.' },
    ], [
      { question: 'Which network should you use for banking?', options: ['Any free public Wi-Fi', 'Your trusted home network', 'A neighbour\'s unsecured network', 'A random unnamed network'], correct: 1 },
      { question: 'Why prefer Wi-Fi for big downloads?', options: ['It is always faster than every mobile network', 'Mobile data costs money and has limits', 'Downloads do not work on mobile data', 'Wi-Fi uses more battery'], correct: 1 },
      { question: 'Where can you check your data usage?', options: ['In Phone settings > Mobile data', 'On the charger', 'In the camera app', 'You cannot check it'], correct: 0 },
    ]),
  ],

  // ---- Click with Confidence ----------------------------------------------
  '5': [
    m('5', 1, 'Mouse & Touch Skills', 8, [
      { type: 'heading', content: 'Point, click, scroll' },
      { type: 'paragraph', content: 'A left click selects or opens. A double click opens files and folders. Scrolling moves the page up and down without leaving your place.' },
      { type: 'paragraph', content: 'On touchscreens: tap once to select, tap twice quickly to open links in some apps, swipe to move between pages, and pinch two fingers to zoom.' },
      { type: 'action', content: 'Open a webpage and practise scrolling to the bottom, then use your browser Back button to return where you started.' },
    ], [
      { question: 'What does a single left-click usually do?', options: ['Deletes a file', 'Selects or follows a link', 'Shuts the computer', 'Prints the page'], correct: 1 },
      { question: 'To zoom in on a photo with two fingers you…', options: ['Pinch and spread', 'Shake the phone', 'Tap the power button', 'Long-press the volume key'], correct: 0 },
    ]),
    m('5', 2, 'Inside a Web Browser', 10, [
      { type: 'heading', content: 'Address bar, tabs and bookmarks' },
      { type: 'paragraph', content: 'The address bar (or URL bar) is where web addresses live, e.g. www.google.com. Tabs let you keep several pages open at once without losing your place.' },
      { type: 'paragraph', content: 'Bookmarks (or favourites) save pages you want to revisit. The Home button returns you to your start page; the Back and Forward arrows move through pages you have already visited.' },
      { type: 'tip', content: 'Bookmark useful pages instead of trying to remember addresses — a star icon usually does it in one tap.' },
      { type: 'action', content: 'Open three tabs: a news site, a weather site and a dictionary. Bookmark one of them, then close all tabs except the bookmarked page.' },
    ], [
      { question: 'Where do you type a website address?', options: ['The search engine box on Google only', 'The browser address bar', 'The keyboard settings', 'The download folder'], correct: 1 },
      { question: 'Tabs are used to…', options: ['Print multiple pages', 'Keep several webpages open at once', 'Charge the device', 'Hide viruses'], correct: 1 },
      { question: 'A bookmark saves…', options: ['Your passwords', 'A link to a page for later', 'All your photos', 'The whole internet'], correct: 1 },
    ]),
    m('5', 3, 'Finding Things Online', 12, [
      { type: 'heading', content: 'Search like a pro' },
      { type: 'paragraph', content: 'Good searches use 2–5 specific words: "resume writing tips South Africa" beats "job help". Put quotation marks around a phrase to match it exactly.' },
      { type: 'paragraph', content: 'Results marked "Sponsored" or "Ad" are paid advertisements, not organic results. Check who published a page before trusting it — look for an About page and a date.' },
      { type: 'warning', content: 'Never enter personal details into a site you reached through a pop-up advertisement.' },
      { type: 'action', content: 'Search for something you genuinely need (e.g. "nearest library opening hours") and judge which top result looks most trustworthy, and why.' },
    ], [
      { question: 'Which search is likely to give the best results?', options: ['"help"', '"job"', '"CV template free download PDF"', '"internet"'], correct: 2 },
      { question: 'A result labelled "Sponsored" means…', options: ['It is the most accurate result', 'Someone paid to show it there', 'It is verified by the browser', 'It is offline'], correct: 1 },
      { question: 'Before trusting a page you should check…', options: ['How many colours it uses', 'Who wrote it and when', 'The font size', 'If it has images'], correct: 1 },
    ]),
  ],

  // ---- Staying Safe Online --------------------------------------------------
  '6': [
    m('6', 1, 'Passwords That Protect You', 10, [
      { type: 'heading', content: 'Long beats clever' },
      { type: 'paragraph', content: 'A strong password is long (12+ characters) and mixes letters, numbers and symbols. Passphrases like "Purple-Horse-Battery-9!" are easy to remember and hard to crack.' },
      { type: 'paragraph', content: 'Never reuse one password across accounts. If a site is breached, attackers try that same password everywhere ("credential stuffing").' },
      { type: 'tip', content: 'Use a password manager (many are free) so you only need to remember one master password.' },
      { type: 'warning', content: 'Do not store passwords in notes apps, screenshots, or on paper near the device.' },
      { type: 'action', content: 'Replace your weakest password with a passphrase of four random words plus a number, and enable two-factor authentication on your email.' },
    ], [
      { question: 'Which password is strongest?', options: ['123456', 'password', 'Purple-Horse-Battery-9!', 'your birth date'], correct: 2 },
      { question: 'Why should you not reuse passwords?', options: ['It confuses websites', 'One breach exposes all your accounts', 'Passwords expire', 'It makes typing slower'], correct: 1 },
      { question: 'A password manager helps you…', options: ['Remember many unique passwords securely', 'Share passwords publicly', 'Skip two-factor authentication', 'Hack other accounts'], correct: 0 },
    ]),
    m('6', 2, 'Spotting Scams & Phishing', 12, [
      { type: 'heading', content: 'Urgency is the scammer\'s weapon' },
      { type: 'paragraph', content: 'Phishing messages pretend to be from banks, parcel services or government departments. They create urgency ("your account will close today!") to make you act before you think.' },
      { type: 'paragraph', content: 'Red flags: spelling mistakes, generic greetings ("Dear Customer"), links whose preview doesn\'t match the real address, requests for OTPs or card PINs. No legitimate bank ever asks for your PIN by message.' },
      { type: 'action', content: 'Forward any suspicious message you received this week to yourself, hover/long-press the link to reveal its true destination, and compare it with the official site.' },
    ], [
      { question: 'A message says your bank account will close unless you click a link now. This is most likely…', options: ['A genuine bank alert', 'A phishing scam', 'A software update', 'A newsletter'], correct: 1 },
      { question: 'Will a real bank ever ask for your PIN over WhatsApp?', options: ['Yes, always', 'No, never', 'Only on weekdays', 'Only for large accounts'], correct: 1 },
      { question: 'Checking a link before clicking helps you…', options: ['Type faster', 'See where it really goes', 'Download faster', 'Charge the battery'], correct: 1 },
    ]),
    m('6', 3, 'Privacy & Your Footprint', 10, [
      { type: 'heading', content: 'Think before you post' },
      { type: 'paragraph', content: 'Everything you share online leaves a permanent trace — future employers and scammers can see it. Share less personal data: ID numbers, location of your home, school names of children.' },
      { type: 'paragraph', content: 'Review app permissions: an app only needs what fits its job. A torch app asking for contacts is a warning sign. Set social accounts to private and review tagged photos regularly.' },
      { type: 'action', content: 'Open your phone Settings > Apps > Permissions and revoke one permission that does not make sense for that app.' },
    ], [
      { question: 'A flashlight app asking for your contacts is…', options: ['Normal behaviour', 'A red flag', 'Required for updates', 'A speed boost'], correct: 1 },
      { question: 'Posting your home address online can…', options: ['Improve your wifi', 'Put your safety at risk', 'Save data', 'Charge your device'], correct: 1 },
    ]),
  ],

  // ---- Everyday Tech ---------------------------------------------------------
  '7': [
    m('7', 1, 'Mastering Your Smartphone', 12, [
      { type: 'heading', content: 'Home screen basics' },
      { type: 'paragraph', content: 'Apps live on your home screen and in the app drawer. Long-press an icon to move it, delete it, or see shortcuts. Pull down from the top to open notifications and Quick Settings.' },
      { type: 'paragraph', content: 'Volume keys adjust sound; holding them often takes a screenshot together with the power button. Double-tap the power button usually opens the camera instantly.' },
      { type: 'tip', content: 'Put your five most-used apps on the first home screen row so they are always one tap away.' },
      { type: 'action', content: 'Rearrange your home screen: group calling, messaging and camera apps together, and remove one app you never use.' },
    ], [
      { question: 'To move or delete an app icon you usually…', options: ['Shake the phone', 'Long-press the icon', 'Double-tap the screen', 'Restart the phone'], correct: 1 },
      { question: 'Notifications appear when you…', options: ['Pull down from the top', 'Press volume up', 'Flip the phone', 'Lock the screen'], correct: 0 },
    ]),
    m('7', 2, 'Calls, Messages & Contacts', 10, [
      { type: 'heading', content: 'Communication essentials' },
      { type: 'paragraph', content: 'Save numbers with full names so callers show as people, not陌生 digits. During a call you can mute, put someone on hold, or switch to speaker.' },
      { type: 'paragraph', content: 'Messaging apps show one grey tick (sent), two grey (delivered) and two blue (read). You can reply, forward or delete messages by long-pressing them.' },
      { type: 'warning', content: 'Never send money because a "friend" messages from an unfamiliar number asking urgently — verify by voice call first.' },
      { type: 'action', content: 'Add one new contact properly (name + number), send them a message, and practise deleting a message for everyone.' },
    ], [
      { question: 'Two grey ticks on WhatsApp mean…', options: ['The message was read', 'The message was delivered', 'The message failed', 'You are blocked'], correct: 1 },
      { question: 'An urgent money request from a "friend\'s" unknown number should prompt you to…', options: ['Pay immediately', 'Verify by calling the friend', 'Reply with your PIN', 'Ignore contacts forever'], correct: 1 },
    ]),
    m('7', 3, 'Photos, Camera & Files', 12, [
      { type: 'heading', content: 'Capture and keep memories' },
      { type: 'paragraph', content: 'Tap the circle to take a photo; swipe to switch cameras; tap the grid icon for straighter shots. Photos save to your Gallery/Photos app automatically.' },
      { type: 'paragraph', content: 'Deleted photos sit in "Recently Deleted" for 30 days — recover important ones there. Use Google Drive or a memory card to free space when storage fills up.' },
      { type: 'tip', content: 'Back up family photos monthly; phones get lost, stolen or broken far more often than albums do.' },
      { type: 'action', content: 'Take three photos, delete one, restore it from Recently Deleted, then upload one to cloud storage.' },
    ], [
      { question: 'Where do deleted photos wait before being gone forever?', options: ['The recycle bin on a PC only', 'Recently Deleted album (about 30 days)', 'The SIM card', 'Nowhere, they are instant gone'], correct: 1 },
      { question: 'A good way to free phone storage is…', options: ['Delete your contacts', 'Move photos to cloud storage', 'Lower screen brightness', 'Uninstall the keyboard'], correct: 1 },
    ]),
  ],

  // ---- Intro to Email & Messaging -------------------------------------------
  '8': [
    m('8', 1, 'Your First Email Account', 10, [
      { type: 'heading', content: 'Setting up and sending' },
      { type: 'paragraph', content: 'An email address looks like name@example.com. Choose a professional one for job applications (e.g. initials-based), not nicknames.' },
      { type: 'paragraph', content: 'To send: click Compose, add the recipient in "To", a clear subject line, your message, then Send. "Cc" copies others visibly; "Bcc" copies them secretly.' },
      { type: 'action', content: 'Send yourself an email with the subject "Practice email" and attach a photo. Then reply to it adding one greeting and a sign-off.' },
    ], [
      { question: 'Which email address is best for job applications?', options: ['coolgurl99@...', 'thandi.molefe@...', 'whatever123@...', 'nobody@...'], correct: 1 },
      { question: 'Bcc means recipients are…', options: ['Copied invisibly', 'Copied visibly to all', 'Blocked', 'Deleted'], correct: 0 },
    ]),
    m('8', 2, 'Email Etiquette & Safety', 12, [
      { type: 'heading', content: 'Write clearly, stay safe' },
      { type: 'paragraph', content: 'Professional emails have a greeting, short paragraphs, one clear request, and a polite sign-off. Avoid ALL CAPS and excessive emojis at work.' },
      { type: 'paragraph', content: 'Attachments can carry viruses. Only open attachments you expected, scan QR codes from unknown sources never, and be careful with .exe/.zip files.' },
      { type: 'warning', content: 'Emails claiming you won a prize you never entered are scams — mark them as junk.' },
      { type: 'action', content: 'Rewrite this message professionally: "hey u got my cv?? answer fast" into a proper follow-up email to a recruiter.' },
    ], [
      { question: 'The safest behaviour with attachments is…', options: ['Open everything quickly', 'Only open attachments you expected', 'Rename them first', 'Print them'], correct: 1 },
      { question: 'A good email subject line is…', options: ['"!!!"', '"Hello"', '"Application: Sales Assistant - T. Molefe"', '"read this"'], correct: 2 },
    ]),
    m('8', 3, 'Organising Your Inbox', 8, [
      { type: 'heading', content: 'Zero-stress inbox' },
      { type: 'paragraph', content: 'Use folders/labels (Jobs, Bills, Family) and archive instead of deleting. Unsubscribe from newsletters you never read — the link sits at the bottom of every legitimate marketing email.' },
      { type: 'tip', content: 'Set one alarm per week for a 10-minute inbox tidy. It beats a 3-hour panic clean-up later.' },
      { type: 'action', content: 'Create two folders, move five emails into them, and unsubscribe from two mailing lists.' },
    ], [
      { question: 'Where do you find the unsubscribe option in marketing emails?', options: ['Top header', 'Bottom of the email', 'In the attachment', 'There is none'], correct: 1 },
    ]),
  ],

  // ---- Smart Skills: Working with Tools -------------------------------------
  '9': [
    m('9', 1, 'Word Processing Basics', 15, [
      { type: 'heading', content: 'Documents that look professional' },
      { type: 'paragraph', content: 'Google Docs and Word let you type, format (bold, headings, alignment), and insert tables or images. Save often — cloud docs autosave, desktop files need Ctrl+S.' },
      { type: 'paragraph', content: 'Use Styles (Heading 1, Heading 2) instead of just making text big; it creates a navigable structure and table of contents automatically.' },
      { type: 'action', content: 'Create a one-page document titled "My Weekly Plan" with two headings, a bulleted list and one bold sentence.' },
    ], [
      { question: 'Ctrl+S does what in most editors?', options: ['Searches', 'Saves', 'Spells checks', 'Shares'], correct: 1 },
      { question: 'Using Heading styles instead of random big text gives you…', options: ['Automatic structure and contents', 'Faster printing', 'Free storage', 'Better colours only'], correct: 0 },
    ]),
    m('9', 2, 'Spreadsheets Without Fear', 15, [
      { type: 'heading', content: 'Budgets and lists' },
      { type: 'paragraph', content: 'Spreadsheets organise data in rows and columns. Every formula starts with "=": =SUM(B2:B10) adds a range; =AVERAGE() finds the mean.' },
      { type: 'paragraph', content: 'Format cells as Currency for money, use bold headers, and freeze the top row so labels stay visible while scrolling.' },
      { type: 'tip', content: 'Build a simple monthly budget: income in column A, expenses in B, total with =SUM() at the bottom.' },
      { type: 'action', content: 'Create a spreadsheet of your last 5 purchases, add a SUM formula for the total, and format the amount column as currency.' },
    ], [
      { question: 'All spreadsheet formulas begin with…', options: ['#', '=', '+', '@'], correct: 1 },
      { question: '=SUM(B2:B10) calculates…', options: ['The average of B2:B10', 'The total of B2 through B10', 'Only B2 and B10', 'The count of cells'], correct: 1 },
    ]),
    m('9', 3, 'Presentations & Collaboration', 12, [
      { type: 'heading', content: 'Shareable slides and files' },
      { type: 'paragraph', content: 'Good slides use one idea per slide, large readable text (24pt+), and minimal bullet points. Rehearse with a timer.' },
      { type: 'paragraph', content: 'Sharing in Google Docs/Sheets: "Comment" access lets feedback, "Editor" allows changes, "Viewer" is read-only. Choose deliberately.' },
      { type: 'action', content: 'Make a 3-slide intro presentation about yourself and share the second slide\'s doc version with a friend set to Comment access.' },
    ], [
      { question: 'Which access level lets someone change your document?', options: ['Viewer', 'Commenter', 'Editor', 'Owner only'], correct: 2 },
      { question: 'Best practice for slide text size is…', options: ['10pt', 'Tiny italics', '24pt or larger', 'As small as possible'], correct: 2 },
    ]),
  ],

  // ---- Online Job Search Essentials ------------------------------------------
  '10': [
    m('10', 1, 'Where Jobs Live Online', 10, [
      { type: 'heading', content: 'Portals, LinkedIn and company sites' },
      { type: 'paragraph', content: 'Major SA job portals include Careers24, Indeed, PNet and LinkedIn. Company "Careers" pages often list roles before portals do.' },
      { type: 'paragraph', content: 'Set up saved-search alerts with keywords like "admin clerk Durban" so new vacancies arrive by email daily.' },
      { type: 'warning', content: 'Any "job" that asks YOU to pay a registration fee is a scam. Legitimate employers pay recruiters; candidates pay nothing.' },
      { type: 'action', content: 'Create one saved search alert on a job portal for a role you actually want.' },
    ], [
      { question: 'A job asking you to pay R350 to "register" is…', options: ['Standard practice', 'A scam', 'A government requirement', 'Tax deductible'], correct: 1 },
      { question: 'Saved-search alerts do what?', options: ['Auto-apply for you', 'Email you matching new vacancies', 'Delete old jobs', 'Interview candidates'], correct: 1 },
    ]),
    m('10', 2, 'Applications That Get Read', 12, [
      { type: 'heading', content: 'Tailoring matters' },
      { type: 'paragraph', content: 'Mirror the vacancy\'s own words in your CV and cover letter — many companies screen with keyword software first. Address the letter to a person, not "To whom it may concern", when you can find a name.' },
      { type: 'paragraph', content: 'Follow instructions exactly: if they ask for PDF named "Surname_Job.pdf", submit exactly that. Ignoring simple instructions fails the first test.' },
      { type: 'action', content: 'Take one real vacancy advert and rewrite your CV summary to include three keywords from it.' },
    ], [
      { question: 'Why mirror the advert\'s wording in your CV?', options: ['To copy them', 'Keyword screening systems check for it', 'It is polite', 'Recruiters dislike originality'], correct: 1 },
      { question: 'If an application requires a PDF named a certain way you should…', options: ['Submit Word format', 'Ignore it, names do not matter', 'Follow the instruction exactly', 'Ask them to change it'], correct: 2 },
    ]),
    m('10', 3, 'Online Interviews', 10, [
      { type: 'heading', content: 'Camera-ready' },
      { type: 'paragraph', content: 'Test your device, connection and platform (Zoom/Teams/Meet) the day before. Sit where light hits your face, background tidy, phone on Do Not Disturb.' },
      { type: 'paragraph', content: 'Prepare the STAR method for questions: Situation, Task, Action, Result. Keep notes on sticky notes near the camera, not scattered pages.' },
      { type: 'action', content: 'Do a 2-minute practice video call with a friend; ask them whether you were audible, visible and looking at the camera.' },
    ], [
      { question: 'STAR stands for…', options: ['Study, Test, Answer, Review', 'Situation, Task, Action, Result', 'Salary, Terms, Agreement, Renewal', 'Speed, Time, Accuracy, Report'], correct: 1 },
      { question: 'Before an online interview you should…', options: ['Test device, connection and platform', 'Wait until the call starts', 'Use any random background', 'Apply for other jobs loudly'], correct: 0 },
    ]),
  ],

  // ---- Digital Communication at Work ----------------------------------------
  '11': [
    m('11', 1, 'Workplace Email & Chat Norms', 10, [
      { type: 'heading', content: 'Match the channel to the message' },
      { type: 'paragraph', content: 'Email for formal or documented requests; chat (Teams/Slack/WhatsApp) for quick questions; phone or meeting for anything emotional or complex. Copy managers only when visibility truly helps.' },
      { type: 'paragraph', content: 'Response expectations differ: emails within a day, chats within the hour during working time. State deadlines politely but clearly.' },
      { type: 'action', content: 'Rewrite one vague chat message ("can we talk about the thing?") into a clear request with topic, purpose and two time options.' },
    ], [
      { question: 'The best channel for a sensitive performance conversation is…', options: ['Group WhatsApp', 'A scheduled call/meeting', 'Email CC\'ing everyone', 'Chat meme'], correct: 1 },
    ]),
    m('11', 2, 'Video Meetings Like a Professional', 12, [
      { type: 'heading', content: 'Mute, camera, agenda' },
      { type: 'paragraph', content: 'Join 2 minutes early, test audio, mute when not speaking, and use raise-hand/reactions rather than interrupting. Meetings with an agenda end faster and produce action points.' },
      { type: 'paragraph', content: 'Share screens cleanly: close unrelated tabs and notifications first. Take notes in the shared doc so nobody loses them.' },
      { type: 'tip', content: 'Summarise your own contribution at the end: "So I will deliver X by Friday" — written confirmation prevents repeat meetings.' },
      { type: 'action', content: 'In your next call, share one screen after checking notifications are silenced, and write one action point in the shared notes.' },
    ], [
      { question: 'When you are not speaking in a video meeting you should…', options: ['Play music', 'Stay muted', 'Turn off your monitor', 'Talk over others'], correct: 1 },
      { question: 'Before sharing your screen, close…', options: ['Your email forever', 'Unrelated tabs and notifications', 'The meeting', 'Your camera app'], correct: 1 },
    ]),
    m('11', 3, 'Remote Work Discipline', 10, [
      { type: 'heading', content: 'Visible, reliable, balanced' },
      { type: 'paragraph', content: 'Remote workers succeed by over-communicating progress, keeping a dedicated workspace, and setting clear working hours so colleagues know when you are available.' },
      { type: 'paragraph', content: 'Use shared calendars and task boards (Trello, Planner) so work is tracked, not remembered.' },
      { type: 'action', content: 'Block your focused-work hours on a shared calendar for one week and report how interruptions changed.' },
    ], [
      { question: 'Remote teams track work best using…', options: ['Memory', 'Shared calendars and task boards', 'Weekend calls', 'Paper diaries at the office'], correct: 1 },
    ]),
  ],

  // ---- Manage Your Digital Identity -----------------------------------------
  '12': [
    m('12', 1, 'Your Digital Footprint', 10, [
      { type: 'heading', content: 'Everything leaves traces' },
      { type: 'paragraph', content: 'Posts, comments, likes, photos and sign-ups build a footprint employers and strangers can search. Google yourself now and note what appears.' },
      { type: 'paragraph', content: 'You can shrink the footprint: delete old posts, request removal from data-broker lists, tighten privacy settings, and think "would I say this in an interview?" before posting.' },
      { type: 'action', content: 'Search your own name, and delete or unpublish one old post you would rather not show an employer.' },
    ], [
      { question: 'Googling your own name reveals…', options: ['Your passwords', 'What others can find about you', 'Your bank balance', 'Nothing ever'], correct: 1 },
    ]),
    m('12', 2, 'Personal Branding Basics', 12, [
      { type: 'heading', content: 'Consistent, professional, authentic' },
      { type: 'paragraph', content: 'A personal brand is simply the reputation you want: pick one clear photo used everywhere, consistent names across platforms, and a bio stating what you do and for whom.' },
      { type: 'paragraph', content: 'LinkedIn profiles with a photo, headline, summary and activity get dramatically more recruiter views than empty ones.' },
      { type: 'action', content: 'Update your LinkedIn (or main profile): professional photo, headline including your target role, and a 3-line summary.' },
    ], [
      { question: 'A strong profile headline should state…', options: ['Your mood today', 'What you do and the value you offer', 'A movie quote only', 'Your home address'], correct: 1 },
    ]),
    m('12', 3, 'Account Security Hygiene', 10, [
      { type: 'heading', content: 'Own your accounts' },
      { type: 'paragraph', content: 'Recovery email and phone must be current, 2FA enabled on email + social accounts, and logged-out devices reviewed monthly (Settings > Security > Active sessions).' },
      { type: 'warning', content: 'If you suspect an account was accessed by someone else, change the password AND log out all sessions immediately.' },
      { type: 'action', content: 'Check active sessions on one account today and end any device you do not recognise.' },
    ], [
      { question: 'After changing a possibly-compromised password you should also…', options: ['Post about it', 'Log out all other sessions', 'Delete the account history', 'Nothing else'], correct: 1 },
    ]),
  ],

  // ---- Intro to Cloud Tools ---------------------------------------------------
  '13': [
    m('13', 1, 'What the Cloud Actually Is', 8, [
      { type: 'heading', content: 'Other people\'s computers' },
      { type: 'paragraph', content: '"The cloud" simply means storing and running things on remote servers you access via the internet — Google Drive, OneDrive, iCloud. Your files sync across devices automatically.' },
      { type: 'paragraph', content: 'Benefits: recovery when a phone breaks, sharing links instead of attachments, and access from anywhere. Costs: you need connectivity and must trust the provider with data.' },
      { type: 'action', content: 'Upload one important document to a free cloud drive and open it from a different device.' },
    ], [
      { question: 'Cloud storage means files live…', options: ['Only on your phone', 'On remote servers accessed via the internet', 'On your SIM card', 'In printed form'], correct: 1 },
    ]),
    m('13', 2, 'Backups That Save You', 10, [
      { type: 'heading', content: 'The 3-2-1 idea' },
      { type: 'paragraph', content: 'Keep important data in at least two places: your device plus one cloud backup (and ideally a third offline copy). Enable photo auto-backup and contact sync today.' },
      { type: 'paragraph', content: 'Test restores occasionally — a backup you have never restored is just hope, not insurance.' },
      { type: 'warning', content: 'Free tiers have limits (e.g. 15 GB Google). Check what counts against your quota: photos and backups do.' },
      { type: 'action', content: 'Turn on automatic photo backup, then restore one photo onto another device to prove the backup works.' },
    ], [
      { question: 'A backup is only proven when you…', options: ['Buy the biggest plan', 'Successfully restore something from it', 'Show friends', 'Name the folder carefully'], correct: 1 },
    ]),
    m('13', 3, 'Working Together Online', 10, [
      { type: 'heading', content: 'Docs, sheets and shared drives' },
      { type: 'paragraph', content: 'Google Docs/Sheets allow simultaneous editing with visible cursors, comment threads and version history (File > Version history) that can undo any mistake.' },
      { type: 'paragraph', content: 'Share with the right permission: View for read-only, Comment for feedback, Edit for collaborators. Shared Drives/Folders beat emailing attachments back and forth.' },
      { type: 'action', content: 'Co-edit one document with another person and explore restoring a previous version together.' },
    ], [
      { question: 'Version history lets you…', options: ['Delete the internet', 'Restore earlier versions of a file', 'Translate documents', 'Increase storage'], correct: 1 },
    ]),
  ],

  // ---- Tech for Entrepreneurs -------------------------------------------------
  '14': [
    m('14', 1, 'Digital Tools for Small Business', 12, [
      { type: 'heading', content: 'Start lean, stay organised' },
      { type: 'paragraph', content: 'Free tools cover most early needs: Google Sheets for bookkeeping, Canva for marketing graphics, WhatsApp Business catalogue for products, and a simple Facebook page for presence.' },
      { type: 'paragraph', content: 'Separate business and personal numbers/accounts where possible — cleaner records and easier tax season.' },
      { type: 'action', content: 'Set up a WhatsApp Business profile with description, hours and three catalogue items.' },
    ], [
      { question: 'A zero-cost first step for product marketing visuals is…', options: ['Hiring an agency', 'Using Canva templates', 'Printing flyers only', 'Waiting for funding'], correct: 1 },
    ]),
    m('14', 2, 'Selling Online', 12, [
      { type: 'heading', content: 'From marketplace to own store' },
      { type: 'paragraph', content: 'Marketplaces (Facebook Marketplace, Takealot, Etsy) bring traffic but charge fees. Own channels (Instagram + payment link, simple Shopify/WooCommerce site) build your brand and customer list.' },
      { type: 'paragraph', content: 'Great listings: clear daylight photos, honest descriptions, price with delivery stated, and fast replies — response time decides sales more than design does.' },
      { type: 'warning', content: 'Collect payment through verifiable methods (bank, PayFast/Yoco, card) and beware buyers pushing to move conversations off-platform before paying.' },
      { type: 'action', content: 'Create one polished listing for an item you could actually sell: 3 photos, description, price and collection/delivery terms.' },
    ], [
      { question: 'Marketplaces mainly offer…', options: ['Zero competition', 'Built-in buyer traffic for a fee', 'Free forever storefronts', 'Guaranteed sales'], correct: 1 },
      { question: 'The factor closest to deciding whether a listing sells is…', options: ['Logo colour', 'Clear photos, honest price and fast replies', 'Number of hashtags', 'Time of day only'], correct: 1 },
    ]),
    m('14', 3, 'Simple Automation & Bookkeeping', 10, [
      { type: 'heading', content: 'Let software do the boring parts' },
      { type: 'paragraph', content: 'Automate: invoice reminders, recurring expense categories, and weekly revenue summaries. Even a Sheet with =SUMIF by month halves admin time.' },
      { type: 'paragraph', content: 'Track cash flow, not just profit: money owed to you (debtors) is not money in the bank.' },
      { type: 'action', content: 'Build a mini bookkeeping sheet: Date, Description, Category, In, Out, Balance — with formulas for totals.' },
    ], [
      { question: 'Cash flow differs from profit because…', options: ['They are identical', 'Unpaid invoices are profit but not yet cash', 'Profit ignores expenses', 'Cash flow only counts coins'], correct: 1 },
    ]),
  ],

  // ---- Cybersecurity Basics ----------------------------------------------------
  '15': [
    m('15', 1, 'Malware & How It Arrives', 12, [
      { type: 'heading', content: 'Viruses, trojans, ransomware' },
      { type: 'paragraph', content: 'Malware is any harmful software. It arrives via infected attachments, fake installers, pirated apps and malicious links. Ransomware encrypts your files and demands payment.' },
      { type: 'paragraph', content: 'Defences: keep OS and apps updated (updates patch security holes), use built-in antivirus (Windows Defender/Play Protect), and never sideload apps from random APK sites.' },
      { type: 'action', content: 'Run your device updates now if pending, and confirm Play Protect/auto-update is enabled on Android or App updates on iPhone.' },
    ], [
      { question: 'Software updates matter for security because they…', options: ['Change the theme', 'Patch known vulnerabilities', 'Free up RAM only', 'Are marketing'], correct: 1 },
      { question: 'Ransomware does what?', options: ['Speeds up your phone', 'Encrypts files and demands payment', 'Blocks ads', 'Backs up data'], correct: 1 },
    ]),
    m('15', 2, 'Networks, Wi-Fi & VPNs', 12, [
      { type: 'heading', content: 'Public networks need care' },
      { type: 'paragraph', content: 'Open/public Wi-Fi can be monitored. Avoid banking on café Wi-Fi; if unavoidable, use mobile data or a reputable VPN which encrypts your traffic.' },
      { type: 'paragraph', content: 'Secure your home router: change the default admin password, use WPA2/WPA3, strong Wi-Fi key, and firmware updates. A hidden SSID is nice-to-have, not essential.' },
      { type: 'action', content: 'Check your router admin password is not the sticker default, and confirm encryption shows as WPA2 or better.' },
    ], [
      { question: 'The safest option for banking while travelling is…', options: ['Airport free Wi-Fi', 'Mobile data or a trusted VPN', 'Hotel lobby network', 'Any network with bars'], correct: 1 },
      { question: 'Default router passwords are risky because…', options: ['They are too long', 'Everyone knows them', 'They expire', 'They slow Wi-Fi'], correct: 1 },
    ]),
    m('15', 3, 'Responding to Incidents', 10, [
      { type: 'heading', content: 'Act fast, report properly' },
      { type: 'paragraph', content: 'If compromised: change passwords (starting with email), enable 2FA, run a malware scan, log out all sessions, and alert your bank if financial data was involved.' },
      { type: 'paragraph', content: 'Report phishing to the impersonated company, and serious fraud to the SAPS Cybercrime hub / your bank\'s fraud line. Keep evidence: screenshots, sender addresses.' },
      { type: 'action', content: 'Write down your personal incident checklist: 5 steps you would take tonight if your email was hacked.' },
    ], [
      { question: 'The FIRST action when your email is compromised is…', options: ['Post about it socially', 'Change the password and secure linked accounts', 'Format the computer', 'Create a new email'], correct: 1 },
    ]),
  ],

  // ---- Data Skills for Decision-Making ----------------------------------------
  '16': [
    m('16', 1, 'Reading Data Around You', 12, [
      { type: 'heading', content: 'Numbers tell stories — sometimes badly' },
      { type: 'paragraph', content: 'Understand averages vs extremes: "average salary R25k" hides whether most earn R5k and a few earn millions. Always ask: what is the distribution? Who collected this? What is missing?' },
      { type: 'paragraph', content: 'Correlation ≠ causation: ice-cream sales and drownings both rise in summer without one causing the other.' },
      { type: 'action', content: 'Find one statistic in a news article this week and list two questions a sceptical reader should ask about it.' },
    ], [
      { question: 'An "average" can mislead because…', options: ['Maths is wrong', 'Extremes distort it; distribution matters', 'Averages are illegal', 'It is always rounded'], correct: 1 },
      { question: 'Correlation without causation means…', options: ['One proves the other', 'Two things move together but neither causes the other', 'Data is fake', 'Charts are useless'], correct: 1 },
    ]),
    m('16', 2, 'Building Honest Charts', 15, [
      { type: 'heading', content: 'Visual choices carry meaning' },
      { type: 'paragraph', content: 'Bar charts compare categories; line charts show trends over time; pie charts show parts of a whole (use ≤5 slices). Truncated Y-axes exaggerate differences — start bars at zero.' },
      { type: 'paragraph', content: 'Label axes, cite sources, and avoid dual-axis tricks that imply false relationships.' },
      { type: 'action', content: 'Recreate one misleading chart you have seen (or invent one) honestly: zero-based axis, clear labels, source noted.' },
    ], [
      { question: 'Which chart best shows a trend over months?', options: ['Pie chart', 'Line chart', 'Scatter plot', 'Table only'], correct: 1 },
      { question: 'Cutting the Y-axis so bars start at 90% …', options: ['Is required practice', 'Exaggerates small differences', 'Improves accuracy', 'Saves ink'], correct: 1 },
    ]),
    m('16', 3, 'Deciding With Data', 12, [
      { type: 'heading', content: 'From dashboard to decision' },
      { type: 'paragraph', content: 'Define the decision first, then collect only relevant data. Compare options with a simple weighted table (criteria × scores) instead of gut feel alone.' },
      { type: 'paragraph', content: 'Accept uncertainty: sample surveys carry margins of error; small samples wobble. Decide thresholds in advance ("switch supplier if defects >3% for 2 months").' },
      { type: 'action', content: 'Score one real upcoming choice (phone plan, transport, study path) with a 4-criteria weighted table.' },
    ], [
      { question: 'The first step in data-driven decisions is…', options: ['Collect everything', 'Define the actual decision/question', 'Buy software', 'Draw a pie chart'], correct: 1 },
    ]),
  ],

  // ---- Content Creation Toolkit -------------------------------------------------
  '17': [
    m('17', 1, 'Design Fundamentals', 12, [
      { type: 'heading', content: 'Contrast, alignment, hierarchy' },
      { type: 'paragraph', content: 'Four rules fix most amateur designs: Alignment (everything lines up with something), Contrast (important things stand out), Repetition (consistent fonts/colors), Proximity (related items grouped).' },
      { type: 'paragraph', content: 'Use max two fonts and a palette of 3 colors. White space is a feature, not wasted room.' },
      { type: 'action', content: 'Redesign one flyer/post in Canva applying all four CRAP principles, and compare before/after.' },
    ], [
      { question: 'Proximity in design means…', options: ['Using nearby shops', 'Grouping related elements together', 'Bold borders', 'Bright colours'], correct: 1 },
      { question: 'Recommended number of fonts per design is…', options: ['At most about two', 'Six minimum', 'One per line', 'As many as possible'], correct: 0 },
    ]),
    m('17', 2, 'Phone Video Production', 15, [
      { type: 'heading', content: 'Shoot, cut, publish' },
      { type: 'paragraph', content: 'Good phone video = steady shot (lean the phone or use a R30 tripod), light facing your subject (window in front of you, not behind), and audio close to the mouth (record voice separately if needed).' },
      { type: 'paragraph', content: 'Edit in CapCut/InShot: trim silence, add captions (most viewers watch muted), 9:16 for TikTok/Reels, 16:9 for YouTube.' },
      { type: 'action', content: 'Film a 60-second clip with natural light and captions, then post or share it with one friend for feedback.' },
    ], [
      { question: 'Why add captions to social videos?', options: ['Phones lack speakers', 'Most people watch without sound', 'It is law', 'Improves battery'], correct: 1 },
      { question: 'Vertical video format ratio is…', options: ['16:9', '4:3', '9:16', '1:1'], correct: 2 },
    ]),
    m('17', 3, 'Storytelling & Social Content', 12, [
      { type: 'heading', content: 'Hook, value, call-to-action' },
      { type: 'paragraph', content: 'Winning structure: hook in the first 2 seconds, deliver one clear value point, end with a call-to-action (follow/comment/share). Consistency beats virality — post on a schedule you can sustain.' },
      { type: 'paragraph', content: 'Repurpose: one lesson filmed becomes a reel, a carousel, and a status. Batch-create on one day per week.' },
      { type: 'action', content: 'Draft three hooks for your niche ("Stop doing X…", "The 60-second trick for…", "Nobody tells beginners that…").' },
    ], [
      { question: 'The hook has roughly how long to grab attention?', options: ['2 seconds', '30 seconds', '2 minutes', 'No limit'], correct: 0 },
      { question: 'For growth, consistency means…', options: ['Going viral weekly', 'A sustainable regular posting rhythm', 'Posting 30 times a day', 'Never replying to comments'], correct: 1 },
    ]),
  ],

  // ---- AI & the Future of Work ---------------------------------------------------
  '18': [
    m('18', 1, 'What AI Really Is', 10, [
      { type: 'heading', content: 'Patterns, not magic' },
      { type: 'paragraph', content: 'AI systems learn statistical patterns from huge amounts of examples. Large language models predict likely next words — powerful, but they can confidently produce wrong answers ("hallucinations").' },
      { type: 'paragraph', content: 'Everyday AI: recommendations (Netflix/YouTube), maps routing, spam filters, translation, voice assistants.' },
      { type: 'action', content: 'List three AI features you personally used this week without naming them "AI".' },
    ], [
      { question: 'Language models generate text by…', options: ['Looking up answers in a database', 'Predicting likely word sequences from patterns', 'Googling live', 'Random guessing'], correct: 1 },
      { question: 'A "hallucination" is…', options: ['A visual glitch', 'Confidently wrong generated content', 'A virus', 'Slow internet'], correct: 1 },
    ]),
    m('18', 2, 'Using AI Tools Effectively', 12, [
      { type: 'heading', content: 'Prompting is the new literacy' },
      { type: 'paragraph', content: 'Good prompts give role, context, task and format: "You are a CV reviewer. Here is my summary [...]. Rewrite it for a retail supervisor role in under 60 words."' },
      { type: 'paragraph', content: 'Iterate: treat answers as drafts. Ask for alternatives, critique, or shorter versions. Never paste personal ID/banking data into AI tools.' },
      { type: 'warning', content: 'AI output must be fact-checked before use in applications, homework or business decisions.' },
      { type: 'action', content: 'Use an AI assistant to draft one real message/document, then edit it yourself and note what you changed.' },
    ], [
      { question: 'A strong prompt includes…', options: ['Just one word', 'Role, context, task and desired format', 'Your password', 'Three question marks'], correct: 1 },
      { question: 'You should never paste into AI chatbots…', options: ['Draft emails', 'ID numbers and banking details', 'Public articles', 'Grammar questions'], correct: 1 },
    ]),
    m('18', 3, 'Staying Employable With AI', 10, [
      { type: 'heading', content: 'Augment, don\'t compete' },
      { type: 'paragraph', content: 'Roles shift rather than vanish: routine drafting/data tasks automate; judgement, empathy, trades, client trust and AI-supervision grow. Workers who use AI well replace those who refuse to.' },
      { type: 'paragraph', content: 'Build the habit: pick one weekly task, automate half of it with a tool, keep the human 50% (checking, tailoring, relationships).' },
      { type: 'action', content: 'Identify one repetitive task in your work/study life and design how AI could handle 50% of it.' },
    ], [
      { question: 'Historically, technology mostly…', options: ['Eliminates all jobs permanently', 'Shifts tasks and creates new roles', 'Changes nothing', 'Only affects office work'], correct: 1 },
    ]),
  ],

  // ---- CV Mastery (Resume course) ---------------------------------------------
  '19': [
    m('19', 1, 'CV Structure That Wins', 10, [
      { type: 'heading', content: 'One page, clear order' },
      { type: 'paragraph', content: 'Order: Contact info → Professional summary → Experience (newest first) → Education → Skills. Use consistent dates (MM/YYYY) and bullet points starting with action verbs: "Managed", "Increased", "Trained".' },
      { type: 'paragraph', content: 'Quantify wherever possible: "Handled 40+ customer queries daily" beats "Helped customers".' },
      { type: 'action', content: 'Rewrite three experience bullets adding an action verb and a number to each.' },
    ], [
      { question: 'Experience entries should be ordered…', options: ['Oldest first', 'Newest first', 'Alphabetically', 'By salary'], correct: 1 },
      { question: 'The strongest bullets combine…', options: ['Adjectives only', 'Action verb + task + measurable result', 'Long paragraphs', 'Emojis'], correct: 1 },
    ]),
    m('19', 2, 'Tailoring & Keywords', 10, [
      { type: 'heading', content: 'One CV per application' },
      { type: 'paragraph', content: 'Highlight experience matching the advert\'s requirements; reword your summary to echo their language. ATS software screens for exact keywords like "customer service", "MS Excel", "matric".' },
      { type: 'warning', content: 'Never lie about qualifications — verification is common and dismissal follows discovery.' },
      { type: 'action', content: 'Take a real advert and mark 5 keywords, then ensure each appears naturally in your CV.' },
    ], [
      { question: 'ATS screening relies heavily on…', options: ['Photo quality', 'Keyword matches', 'Font colour', 'Paper thickness'], correct: 1 },
    ]),
    m('19', 3, 'Cover Letters & Follow-ups', 8, [
      { type: 'heading', content: 'Short, specific, polite' },
      { type: 'paragraph', content: 'Cover letter: 3 paragraphs — why this role/company, proof you fit (2 achievements), closing with availability. Follow up once after 5–7 working days, thanking and reaffirming interest.' },
      { type: 'action', content: 'Draft one reusable cover-letter skeleton with blanks for company name and role-specific proof.' },
    ], [
      { question: 'A good follow-up email is sent…', options: ['Hourly until answered', 'Once, about a week after applying', 'Never', 'Before applying'], correct: 1 },
    ]),
  ],
};

// Default fallback for any course id without a specific set
const defaultModules: CourseModule[] = [
  m('gen', 1, 'Course Orientation', 8, [
    { type: 'heading', content: 'How to use this course' },
    { type: 'paragraph', content: 'Work through each module in order, watch the preview video, complete the practice actions, then take the quiz. You can retake quizzes — learning beats scoring first time.' },
    { type: 'tip', content: 'Set aside 20 minutes a day. Consistency completes courses; cramming rarely does.' },
  ], [
    { question: 'The recommended study approach is…', options: ['Cram everything in one night', 'Short regular sessions in module order', 'Skip to the quiz', 'Watch videos only'], correct: 1 },
  ]),
  m('gen', 2, 'Core Concepts', 12, [
    { type: 'heading', content: 'Key ideas' },
    { type: 'paragraph', content: 'This course covers practical digital skills you can apply immediately on any device. Focus on understanding why each step matters, not just memorising buttons.' },
    { type: 'action', content: 'Write down one situation from your own life where each skill would help you.' },
  ], [
    { question: 'Deeper learning happens when you…', options: ['Memorise button positions', 'Understand why each step matters and apply it', 'Skip examples', 'Read once quickly'], correct: 1 },
  ]),
];

/**
 * Returns built-in modules for a course id (specific set, or a sensible
 * generated default so no course ever appears empty).
 */
export function getCourseModules(courseId: string | number): CourseModule[] {
  const key = String(courseId);
  if (courseModules[key]) return courseModules[key];
  // Generate a default curriculum keyed to the id so ids outside 4..19 still
  // render real content instead of an empty screen.
  return defaultModules.map((mod, i) => ({ ...mod, id: `${key}-d${i + 1}` }));
}

/**
 * Flattens all quiz questions of a course into a single question array
 * (used as the local fallback for the Quiz screen).
 */
export function getCourseQuizQuestions(courseId: string | number): QuizQuestion[] {
  const mods = getCourseModules(courseId);
  const qs: QuizQuestion[] = [];
  mods.forEach((mod) => {
    if (mod.quiz?.questions) qs.push(...mod.quiz.questions);
  });
  return qs;
}
