import { getHackathonBySlug } from '../../db/queries/hackathons.js';

export const MCP_PROMPTS = [
  {
    name: 'audit_submission',
    description: 'Generates an expert judging audit prompt for an AI agent to critically evaluate a hackathon project submission against technical rubrics.',
    arguments: [
      {
        name: 'hackathonTitle',
        description: 'Title of the hackathon sprint.',
        required: true,
      },
      {
        name: 'repoUrl',
        description: 'GitHub repository URL.',
        required: true,
      },
      {
        name: 'techStack',
        description: 'Comma-separated technologies used.',
        required: false,
      },
      {
        name: 'demoUrl',
        description: 'Optional live deployment URL.',
        required: false,
      },
    ],
  },
  {
    name: 'squad_pitch',
    description: 'Generates a compelling squad recruitment pitch to attract high-caliber engineers and specialists in developer channels.',
    arguments: [
      {
        name: 'hackathonTitle',
        description: 'Title of the hackathon sprint.',
        required: true,
      },
      {
        name: 'projectVision',
        description: 'Core problem and solution summary.',
        required: true,
      },
      {
        name: 'neededRoles',
        description: 'Comma-separated target roles (e.g., "Full-Stack, ML Engineer, UI Designer").',
        required: true,
      },
    ],
  },
  {
    name: 'summarize_hackathon',
    description: 'Produces a structured developer briefing summarizing prize bounties, technical tracks, eligibility, and key deadlines.',
    arguments: [
      {
        name: 'hackathonSlug',
        description: 'Unique slug of the hackathon sprint.',
        required: true,
      },
    ],
  },
];

export async function getMcpPrompt(name, args = {}) {
  switch (name) {
    case 'audit_submission': {
      const { hackathonTitle, repoUrl, techStack = 'Next.js, React, Node.js', demoUrl = 'Not provided' } = args;

      return {
        description: `Judicial audit prompt for ${hackathonTitle}`,
        messages: [
          {
            role: 'system',
            content: {
              type: 'text',
              text: `You are an elite Hackathon Lead Judge on the Devlovers platform. You apply rigorous, objective evaluation across four pillars: Innovation (30%), Technical Depth (30%), Execution (20%), and Real-World Impact (20%).`,
            },
          },
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please perform a comprehensive evaluation of the following sprint submission:
- Hackathon: ${hackathonTitle}
- Repository: ${repoUrl}
- Declared Tech Stack: ${techStack}
- Live Demo: ${demoUrl}

Required Analysis:
1. Architecture & Code Quality: Review repository structure, test coverage, and documentation.
2. Commit Timeline Verification: Verify work occurred during the sprint window without recycled legacy boilerplate.
3. 4-Pillar Scoring: Assign points out of 100 for Innovation, Technical Depth, Execution, and Impact.
4. Constructive Feedback: Provide 3 strengths and 2 actionable recommendations.`,
            },
          },
        ],
      };
    }

    case 'squad_pitch': {
      const { hackathonTitle, projectVision, neededRoles } = args;

      return {
        description: `Squad formation pitch for ${hackathonTitle}`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Craft an energetic, high-converting squad recruitment announcement for the Devlovers matchmaking feed:
- Sprint: ${hackathonTitle}
- Project Vision: ${projectVision}
- Open Roles: ${neededRoles}

Format with:
- Catchy Header & Mission Statement
- Problem & Proposed Architecture
- Roles Needed & What We Offer
- Call-to-Action to connect on Devlovers.`,
            },
          },
        ],
      };
    }

    case 'summarize_hackathon': {
      const { hackathonSlug } = args;
      const sprint = await getHackathonBySlug(hackathonSlug);

      const title = sprint?.title || hackathonSlug;
      const prize = sprint?.prizePoolCents ? `$${(sprint.prizePoolCents / 100).toLocaleString()}` : '$25,000+ USD';
      const endsAt = sprint?.endsAt || 'Upcoming';

      return {
        description: `Executive summary for ${title}`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Provide a developer-focused executive summary for the "${title}" hackathon sprint.
- Total Prize Bounty: ${prize}
- Deadline: ${endsAt}
- Category: ${sprint?.category || 'General Technology'}

Include:
1. Target Challenge & Problem Statement
2. Recommended Tech Stack & Integration Points
3. Judging Rubric & Criteria Weights
4. Key Milestones & Submission Requirements.`,
            },
          },
        ],
      };
    }

    default:
      throw new Error(`Prompt '${name}' not found.`);
  }
}
