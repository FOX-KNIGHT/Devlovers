// src/Project/LandingPage/data.js

const data = {
  hackathons: [
    { id: 1, name: 'Hackathon Alpha', status: 'Active' },
    { id: 2, name: 'Hackathon Beta', status: 'Inactive' },
    { id: 3, name: 'Global Tech Sprint', status: 'Inactive' },
    { id: 4, name: 'Web Dev Challenge', status: 'Inactive' },
    { id: 5, name: 'Mobile App Marathon', status: 'Active' },
    { id: 6, name: 'Climate Action Hack', status: 'Inactive' },
  ],
  feedPosts: [
    {
      id: 1,
      title: 'Future of AI Hackathon 🤖',
      status: 'upcoming',
      hostedBy: 'Innovate Corp',
      starts: 'Nov 10, 2025',
      prize: '$25,000',
      description: 'Join us for a 48-hour sprint building the next generation of AI applications. A great opportunity for Data Scientists and ML Engineers! Prizes and mentorship available from industry experts.',
      tags: ['AI', 'MachineLearning', 'Remote', '48Hours'],
      category: 'upcoming remote prize',
    },
    {
      id: 2,
      title: 'Sustainable Web Design Challenge 🌿',
      status: 'ongoing',
      hostedBy: 'EcoDevs',
      deadline: 'Dec 5, 2025',
      participants: '2,450+',
      description: 'Develop a project that addresses environmental issues using sustainable web technologies. Remote participation welcome and encouraged. Build a greener web with cutting-edge green computing practices!',
      tags: ['WebDev', 'GreenTech', 'SocialGood', 'Sustainability'],
      category: 'ongoing remote',
    },
    {
      id: 3,
      title: 'Blockchain Innovation Summit 2026 ⛓️',
      status: 'upcoming',
      hostedBy: 'CryptoVentures',
      starts: 'Jan 15, 2026',
      prize: '$50,000',
      description: 'Build the next generation of decentralized applications. Focus on Web3, smart contracts, and blockchain scalability solutions. Mentorship from leading blockchain developers included.',
      tags: ['Blockchain', 'Web3', 'SmartContracts', 'DeFi'],
      category: 'upcoming prize',
    },
    {
      id: 4,
      title: 'Healthcare Innovation Challenge 🏥',
      status: 'ongoing',
      hostedBy: 'MedTech Solutions',
      deadline: 'Nov 20, 2025',
      prize: '$30,000',
      description: 'Create innovative solutions for modern healthcare challenges. Focus on telemedicine, patient data management, AI diagnostics, or mental health applications. Make a real impact on healthcare delivery.',
      tags: ['HealthTech', 'Innovation', 'Remote', 'SocialImpact'],
      category: 'ongoing remote prize',
    },
  ],
  trending: [
    { id: 1, title: 'Blockchain Summit 2026', details: '$50k Prize Pool', className: '' },
    { id: 2, title: 'AR/VR Metaverse Build', details: '3 Days Left', className: 'danger-text' },
    { id: 3, title: 'Healthcare Tech Sprint', details: 'New!', className: 'success-text' },
    { id: 4, title: 'Quantum Computing Challenge', details: '3.2k Registered', className: '' },
    { id: 5, title: 'Climate Action Hackathon', details: 'Trending', className: 'success-text' },
  ],
  notifications: [
    { id: 1, message: '🎉 New Feedback on Hackathon Alpha!', time: '2 minutes ago', icon: 'fas fa-comment-dots', unread: true },
    { id: 2, message: '⏰ Blockchain Summit deadline approaching', time: '1 hour ago', icon: 'fas fa-exclamation-triangle', unread: true },
    { id: 3, message: '✅ You joined Web Dev Challenge', time: '1 day ago', icon: 'fas fa-check-circle', unread: false },
    { id: 4, message: '🚀 System Update: New features available', time: '1 day ago', icon: 'fas fa-rocket', unread: true },
    { id: 5, message: '📱 Mobile App Marathon submission approved', time: '2 days ago', icon: 'fas fa-mobile-alt', unread: true },
  ],
};

export default data;