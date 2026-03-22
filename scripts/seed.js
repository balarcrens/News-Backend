const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Category = require('../models/Category');
const Article = require('../models/Article');
const Tag = require('../models/Tag');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in .env');
  process.exit(1);
}

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await Category.deleteMany({});
    await Article.deleteMany({});
    await Tag.deleteMany({});
    console.log('Existing data cleared.');

    // Create Admin User if not exists
    let admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created (admin@gmail.com / admin123)');
    }

    // Create Tags
    const tagsData = [
      { name: 'Artificial Intelligence', slug: 'ai', description: 'All about AI and Machine Learning' },
      { name: 'Fitness', slug: 'fitness', description: 'Health and workout tips' },
      { name: 'Economy', slug: 'economy', description: 'Global and local economic trends' },
      { name: 'Exploration', slug: 'exploration', description: 'Space and nature exploration' },
      { name: 'Gadgets', slug: 'gadgets', description: 'The latest tech hardware' },
      { name: 'Quantum Computing', slug: 'quantum-computing', description: 'Computing using quantum mechanics' },
      { name: 'Sports Analytics', slug: 'sports-analytics', description: 'Using data to improve sports performance' },
      { name: 'Sustainability', slug: 'sustainability', description: 'Eco-friendly solutions' },
      { name: 'Mental Health', slug: 'mental-health', description: 'Psychological well-being' },
      { name: 'Crypto', slug: 'crypto', description: 'Blockchain and cryptocurrencies' }
    ];
    const tags = await Tag.insertMany(tagsData);
    console.log('Tags seeded.');

    // Create Categories
    const categoriesData = [
      { name: 'Technology', displayOrder: 1, description: 'The latest in tech, software, and gadgets.' },
      { name: 'Health', displayOrder: 2, description: 'Wellness, medical news, and lifestyle tips.' },
      { name: 'Business', displayOrder: 3, description: 'Financial news, market analysis, and startups.' },
      { name: 'Science', displayOrder: 4, description: 'Space, environment, and scientific discoveries.' },
      { name: 'Travel', displayOrder: 5, description: 'Travel guides, hidden gems, and tips.' },
      { name: 'Sports', displayOrder: 6, description: 'Athletics, tournaments, and team news.' }
    ];

    const seededCategories = {};
    for (const cat of categoriesData) {
      const slug = slugify(cat.name, { lower: true, strict: true });
      const newCat = await Category.create({ ...cat, slug });
      seededCategories[cat.name] = newCat;
    }
    console.log('Categories seeded.');

    // Articles Data
    const articlesData = [
      {
        title: 'The Future of AI: Beyond Large Language Models',
        summary: 'As we move past the era of GPT-4, researchers are looking at embodied AI and reasoning capabilities that go beyond simple text prediction.',
        category: seededCategories['Technology']._id,
        type: 'news',
        status: 'published',
        isFeatured: true,
        media: {
          featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop',
          imageAlt: 'AI and Neural Networks'
        },
        content: [
          { type: 'heading', value: 'The Evolution of Cognitive Architecture' },
          { type: 'text', value: 'Artificial Intelligence has witnessed an unprecedented surge in capabilities over the last few years. While Large Language Models (LLMs) have dominated the headlines, the next frontier is about creating agents that can interact with the physical world and reason through complex problems autonomously.' },
          { type: 'text', value: 'Embodied AI represents a shift from static data processing to active learning. By integrating vision, touch, and spatial awareness, these future models will be able to perform tasks that currently require human dexterity and judgment. This transition is expected to revolutionize industries from healthcare to manufacturing.' },
          { type: 'image', value: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop', caption: 'Robotic arm symbolizing the future of embodied AI.' },
          { type: 'heading', value: 'Scaling Laws and Efficiency' },
          { type: 'text', value: 'Another critical area of focus is efficiency. Current models require massive computational resources. Future breakthroughs are likely to come from more biologically-inspired architectures that consume less power while delivering higher performance. The goal is to make AI accessible on edge devices without relying on massive server farms.' }
        ],
        seo: {
          metaTitle: 'The Future of AI: Embodied Intelligence and Reasoning',
          metaDescription: 'Explore what lies beyond LLMs in the world of Artificial Intelligence, including embodied AI and efficient architectures.',
          keywords: ['AI', 'Future Tech', 'Machine Learning', 'GPT-5']
        },
        tags: [tags.find(t => t.slug === 'ai')._id, tags.find(t => t.slug === 'gadgets')._id],
        author: admin._id,
        source: { name: 'TechCrunch', url: 'https://techcrunch.com' }
      },
      {
        title: 'Quantum Computing: The Next Frontier in Security',
        summary: 'With the arrival of early quantum processors, encryption as we know it is under threat. What steps are organizations taking to be quantum-ready?',
        category: seededCategories['Technology']._id,
        type: 'news',
        status: 'published',
        isFeatured: false,
        media: {
          featuredImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop',
          imageAlt: 'Quantum Processor'
        },
        content: [
          { type: 'heading', value: 'Understanding the Quantum Threat' },
          { type: 'text', value: 'Quantum computers use qubits instead of bits, allowing them to perform certain calculations exponentially faster than classical supercomputers. One major concern is Shor\'s algorithm, which can efficiently factorize large prime numbers—the basis of most modern encryption systems.' },
          { type: 'text', value: 'While we are still years away from a "cryptographically relevant" quantum computer, the concept of "harvest now, decrypt later" is already a reality. State actors are believed to be collecting encrypted data today in anticipation of being able to decrypt it with future quantum power.' },
          { type: 'image', value: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop', caption: 'Digital security and encryption conceptual image.' },
          { type: 'heading', value: 'Post-Quantum Cryptography (PQC)' },
          { type: 'text', value: 'The National Institute of Standards and Technology (NIST) has already begun standardizing quantum-resistant algorithms. These PQC methods rely on mathematical problems that are difficult even for quantum computers, such as lattice-based cryptography.' }
        ],
        seo: {
          metaTitle: 'Quantum Computing and the Future of Cybersecurity',
          metaDescription: 'How quantum computing will disrupt current encryption and what you can do to stay secure.',
          keywords: ['Quantum', 'Security', 'Cybersecurity', 'Encyption']
        },
        tags: [tags.find(t => t.slug === 'quantum-computing')._id, tags.find(t => t.slug === 'gadgets')._id],
        author: admin._id,
        source: { name: 'Wired', url: 'https://wired.com' }
      },
      {
        title: '5 Daily Habits for a Healthier Heart in 2026',
        summary: 'Cardiovascular health remains a top priority. Learn how small adjustments in your daily routine can lead to significant long-term benefits.',
        category: seededCategories['Health']._id,
        type: 'blog',
        status: 'published',
        isFeatured: false,
        media: {
          featuredImage: 'https://images.unsplash.com/photo-1505751172107-16010041d5a7?q=80&w=1200&auto=format&fit=crop',
          imageAlt: 'Healthy Lifestyle'
        },
        content: [
          { type: 'heading', value: 'Prioritize Movement Over Intensity' },
          { type: 'text', value: 'Many believe that only high-intensity interval training (HIIT) counts as exercise. However, new studies suggest that consistent, low-impact movement—like walking 30 minutes a day—is equally vital for maintaining heart elasticity and reducing blood pressure.' },
          { type: 'text', value: 'The key is to minimize sedentary time. If you work at a desk, consider a standing desk or setting a timer to move every hour. These small steps accumulate over a lifetime to safeguard your cardiovascular system.' },
          { type: 'heading', value: 'The Importance of Mindful Nutrition' },
          { type: 'text', value: 'Dietary trends come and go, but the Mediterranean diet remains the gold standard. Focus on whole grains, healthy fats like olive oil, and plenty of colorful vegetables. Reducing processed sugars is not just about weight; it is about reducing inflammation in your arteries.' },
          { type: 'image', value: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop', caption: 'Fresh vegetables and a balanced diet.' },
          { type: 'text', value: 'Finally, do not underestimate the power of sleep and stress management. High cortisol levels from chronic stress are a silent killer. Practicing mindfulness or yoga for just 10 minutes a day can significantly lower your resting heart rate.' }
        ],
        seo: {
          metaTitle: '5 Habits for Heart Health | 2026 Wellness Guide',
          metaDescription: 'Discover simple daily habits to improve your cardiovascular health and live a longer, more vibrant life.',
          keywords: ['Health', 'Fitness', 'Wellness', 'Heart Health']
        },
        tags: [tags.find(t => t.slug === 'fitness')._id],
        author: admin._id,
        source: { name: 'Healthline', url: 'https://healthline.com' }
      },
      {
        title: 'The Evolution of Football: How Data Analytics is Changing the Game',
        summary: 'Teams are no longer relying just on scouts; machine learning and big data are now deciding player transfers and match tactics.',
        category: seededCategories['Sports']._id,
        type: 'news',
        status: 'published',
        isFeatured: true,
        media: {
          featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
          imageAlt: 'Football Stadium'
        },
        content: [
          { type: 'heading', value: 'The Rise of the Analyst' },
          { type: 'text', value: 'In every professional football club, analysts now work alongside coaches. They use "Expected Goals" (xG), "Expected Pass Completion," and heat maps to evaluate performance. Every movement on the pitch is tracked by GPS and analyzed in real-time.' },
          { type: 'text', value: 'This transition has changed how players are scouted. Clubs look for specific data profiles that fit their tactical system. If a team needs a "progressive passer," the data can find the top players across all leagues who fit that exact criteria.' },
          { type: 'image', value: 'https://images.unsplash.com/photo-1518091043644-c1d445bb52ed?q=80&w=1200&auto=format&fit=crop', caption: 'Tactical analysis board.' },
          { type: 'heading', value: 'Individualized Training Programs' },
          { type: 'text', value: 'Data analytics also helps in injury prevention. By monitoring player load, sport scientists can predict when a player is at risk of muscle strain. This allows for personalized recovery sessions and training loads, extending the careers of top athletes.' }
        ],
        seo: {
          metaTitle: 'Data Analytics in Football | The Modern Game',
          metaDescription: 'How statistics and machine learning are revolutionizing football tactics and player recruitment.',
          keywords: ['Sports', 'Football', 'Analytics', 'Data Science']
        },
        tags: [tags.find(t => t.slug === 'sports-analytics')._id],
        author: admin._id,
        source: { name: 'ESPN', url: 'https://espn.com' }
      },
      {
        title: 'James Webb Telescope Unveils the Oldest Known Galaxy',
        summary: 'Astronomers have used the JWST to identify a galaxy that formed just 300 million years after the Big Bang, challenging our current models of universe evolution.',
        category: seededCategories['Science']._id,
        type: 'news',
        status: 'published',
        isFeatured: true,
        media: {
          featuredImage: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1200&auto=format&fit=crop',
          imageAlt: 'Deep Space and Galaxies'
        },
        content: [
          { type: 'heading', value: 'A Glimpse into the Cosmic Dawn' },
          { type: 'text', value: 'The James Webb Space Telescope (JWST) has once again redefined our understanding of the cosmos. By capturing light that has traveled for over 13.5 billion years, scientists have identified a galaxy designated as JADES-GS-z14-0.' },
          { type: 'text', value: 'According to current cosmological models, galaxies shouldn\'t have been this massive so quickly. This discovery suggests that star formation in the early universe was much more efficient than previously thought.' },
          { type: 'image', value: 'https://images.unsplash.com/photo-1454789548928-1f1969248232?q=80&w=1200&auto=format&fit=crop', caption: 'JWST imaging a distant nebula.' },
          { type: 'heading', value: 'Shifting Paradigms' },
          { type: 'text', value: 'As JWST continues its mission, we can expect more discoveries that will force us to rewrite textbooks. The next few years of astronomy will likely be focused on understanding these "impossible" early galaxies and the role of dark matter.' }
        ],
        seo: {
          metaTitle: 'Oldest Galaxy Discovered by JWST | Science News',
          metaDescription: 'NASA\'s James Webb Telescope discovers a galaxy from the very beginning of the universe.',
          keywords: ['NASA', 'Space', 'Astronomy', 'James Webb']
        },
        tags: [tags.find(t => t.slug === 'exploration')._id],
        author: admin._id,
        source: { name: 'NASA', url: 'https://nasa.gov' }
      },
      {
        title: 'Global Markets Adjust to Artificial Intelligence Integration',
        summary: 'Stock markets are reaching new heights as traditional industries begin to see the productivity gains from widespread AI adoption.',
        category: seededCategories['Business']._id,
        type: 'news',
        status: 'published',
        isFeatured: false,
        media: {
          featuredImage: 'https://images.unsplash.com/photo-1611974714022-de8be84d0086?q=80&w=1200&auto=format&fit=crop',
          imageAlt: 'Financial Graph'
        },
        content: [
          { type: 'heading', value: 'Broadening the Market Rally' },
          { type: 'text', value: 'While tech giants led the initial AI pump, we are now seeing "old economy" firms like John Deere and Walmart reaping the benefits. Automation in supply chains and inventory management is leading to structural margin improvements.' },
          { type: 'text', value: 'Economists are debating whether we are entering a "Roaring 20s" style productivity boom. If AI can sustainably grow GDP without spiking inflation, central banks might have more room to maneuver on interest rates.' },
          { type: 'image', value: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop', caption: 'Global currency and stock symbols.' },
          { type: 'heading', value: 'Potential Headwinds' },
          { type: 'text', value: 'The risk remains that adoption might be slower than anticipated due to privacy concerns and regulatory friction. A divergence between early adopters and laggards could also exacerbate wealth inequality between nations.' }
        ],
        seo: {
          metaTitle: 'AI and Global Markets | Business Trends 2026',
          metaDescription: 'How productivity gains from AI are impacting stock markets beyond the tech sector.',
          keywords: ['Finance', 'Business', 'AI', 'Economy']
        },
        tags: [tags.find(t => t.slug === 'economy')._id],
        author: admin._id,
        source: { name: 'Reuters', url: 'https://reuters.com' }
      },
      {
        title: 'Hidden Gems: Why Albania is the Next Big Travel Destination',
        summary: 'With its pristine coastline, affordable prices, and rich history, Albania is quickly becoming the favorite for travelers in 2026.',
        category: seededCategories['Travel']._id,
        type: 'blog',
        status: 'published',
        isFeatured: true,
        media: {
          featuredImage: 'https://images.unsplash.com/photo-1580138545465-38505500ce4c?q=80&w=1200&auto=format&fit=crop',
          imageAlt: 'Albanian Coastline'
        },
        content: [
          { type: 'heading', value: 'The Pristine Albanian Riviera' },
          { type: 'text', value: 'While neighbors like Greece and Montenegro have been on the travel radar for decades, Albania has remained a well-kept secret. The southern coast offers turquoise waters and white pebble beaches that rival the best in the Mediterranean.' },
          { type: 'text', value: 'Towns like Ksamil and Himare provide a relaxed atmosphere where you can still find isolated coves even in the peak of summer.' },
          { type: 'image', value: 'https://images.unsplash.com/photo-1579294247012-421734a7065e?q=80&w=1200&auto=format&fit=crop', caption: 'Mountain scenery in Albania.' },
          { type: 'heading', value: 'A Journey Through History' },
          { type: 'text', value: 'Beyond the beaches, Albania is home to incredible UNESCO World Heritage sites. The stone city of Gjirokaster offers a glimpse into the Ottoman past with perfectly preserved architecture and ancient castles.' }
        ],
        seo: {
          metaTitle: 'Travel to Albania: 2026 Guide to Hidden Gems',
          metaDescription: 'Explore the beaches and history of Albania, the rising star of European travel.',
          keywords: ['Travel', 'Albania', 'Europe', 'Beaches']
        },
        tags: [tags.find(t => t.slug === 'exploration')._id],
        author: admin._id,
        source: { name: 'Lonely Planet', url: 'https://lonelyplanet.com' }
      },
      {
        title: 'The Future of Crypto: Regulation vs. Decentralization',
        summary: 'As central banks roll out CBDCs, the original crypto community is doubling down on privacy and self-custody. Which vision of money will win?',
        category: seededCategories['Business']._id,
        type: 'blog',
        status: 'published',
        isFeatured: false,
        media: {
          featuredImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1200&auto=format&fit=crop',
          imageAlt: 'Bitcoin and Ethereum physical coins'
        },
        content: [
          { type: 'heading', value: 'The Rise of Central Bank Digital Currencies' },
          { type: 'text', value: 'In 2026, the digital dollar and digital euro are no longer concepts—they are being tested in the wild. These systems promise faster settlements and lower fees but raise significant concerns about financial surveillance and state control.' },
          { type: 'text', value: 'In response, the decentralization movement is evolving. Layer 2 solutions have made transacting in Bitcoin and Ethereum as fast and cheap as traditional cards, all while maintaining user control over private keys.' },
          { type: 'image', value: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1200&auto=format&fit=crop', caption: 'Blockchain data visualization.' },
          { type: 'heading', value: 'The Regulatory Landscape' },
          { type: 'text', value: 'European regulators have set the world standard with the MiCA framework, providing clarity for institutional investors. Meanwhile, the U.S. continues to struggle between strict enforcement and fostering innovation, leading many firms to relocate to crypto-friendly hubs like Dubai and Singapore.' }
        ],
        seo: {
          metaTitle: 'Crypto Trends 2026: Regulation and CBDCs',
          metaDescription: 'A deep dive into the battle between government-issued digital currencies and decentralized blockchains.',
          keywords: ['Crypto', 'Bitcoin', 'Blockchain', 'Finance']
        },
        tags: [tags.find(t => t.slug === 'crypto')._id, tags.find(t => t.slug === 'economy')._id],
        author: admin._id,
        source: { name: 'CoinDesk', url: 'https://coindesk.com' }
      },
      {
        title: 'Sustainable Cities: The Future of Urban Living',
        summary: 'From vertical forests to 15-minute neighborhoods, urban planners are rethinking how we live to combat climate change.',
        category: seededCategories['Science']._id,
        type: 'blog',
        status: 'published',
        isFeatured: false,
        media: {
          featuredImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1200&auto=format&fit=crop',
          imageAlt: 'Green City Architecture'
        },
        content: [
          { type: 'heading', value: 'Redesigning the Concrete Jungle' },
          { type: 'text', value: 'Urban heat islands are a growing concern. To combat this, cities like Singapore are pioneering "vertical forests"—buildings covered in thousands of trees that naturally cool the environment.' },
          { type: 'text', value: 'The 15-minute city concept is also gaining traction. By ensuring work, schools, and groceries are within a short walk, cities can drastically reduce emissions and improve community ties.' }
        ],
        author: admin._id,
        tags: [tags.find(t => t.slug === 'sustainability')._id]
      },
      {
        title: 'The Mental Health Crisis: How to Build Resilience in a Digital Age',
        summary: 'As burnout rates soar, psychologists are advocating for a return to "analog" experiences and radical digital boundaries.',
        category: seededCategories['Health']._id,
        type: 'blog',
        status: 'published',
        isFeatured: false,
        media: {
          featuredImage: 'https://images.unsplash.com/photo-1499209974431-9dac3adaf471?q=80&w=1200&auto=format&fit=crop',
          imageAlt: 'Person looking at sunset'
        },
        content: [
          { type: 'heading', value: 'The Paradox of Connection' },
          { type: 'text', value: 'We are more connected than ever, yet loneliness is at an all-time high. The constant barrage of comparisons on social media and the "always-on" nature of remote work have created a perfect storm for anxiety.' },
          { type: 'text', value: 'Building resilience is not just about therapy; it is about our daily environments. Implementing "digital sundowns"—no screens after 9 PM—and engaging in deep-work blocks can help reclaim our focus and mental peace.' },
          { type: 'image', value: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop', caption: 'Meditation by the lake.' },
          { type: 'heading', value: 'The Power of Analog Hobbies' },
          { type: 'text', value: 'Whether it is pottery, gardening, or reading physical books, analog hobbies provide a "flow state" that digital entertainment cannot match. These activities engage the senses and provide a tangible sense of accomplishment that is vital for long-term psychological health.' }
        ],
        seo: {
          metaTitle: 'Building Mental Resilience in 2026',
          metaDescription: 'Expert tips on managing digital burnout and fostering mental well-being in a hyper-connected world.',
          keywords: ['Mental Health', 'Wellness', 'Digital Burnout', 'Resilience']
        },
        tags: [tags.find(t => t.slug === 'mental-health')._id],
        author: admin._id,
        source: { name: 'Psychology Today', url: 'https://psychologytoday.com' }
      }
    ];

    for (const artData of articlesData) {
      const slug = slugify(artData.title, { lower: true, strict: true });
      await Article.create({ ...artData, slug });
    }

    console.log(`${articlesData.length} articles seeded.`);
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
