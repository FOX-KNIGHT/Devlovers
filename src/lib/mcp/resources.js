import { getHackathons } from '../../db/queries/hackathons.js';
import data from '../../Project/LandingPage/data.js';

export const MCP_RESOURCES = [
  {
    uri: 'hackathons://active',
    name: 'Active Hackathon Sprints',
    description: 'Real-time JSON directory of active ongoing hackathon challenges, deadlines, and prize pools.',
    mimeType: 'application/json',
  },
  {
    uri: 'rubrics://standard',
    name: 'Official Judging Rubric & Weights',
    description: 'Standard 4-pillar evaluation criteria (Innovation, Technical Depth, Execution, Impact) and scoring rules.',
    mimeType: 'application/json',
  },
  {
    uri: 'squads://open',
    name: 'Open Squad Listings',
    description: 'Active squads seeking new team members across active sprint channels.',
    mimeType: 'application/json',
  },
];

export async function readMcpResource(uri) {
  switch (uri) {
    case 'hackathons://active': {
      const activeHackathons = await getHackathons({ filter: 'ongoing', limit: 20 });
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                generatedAt: new Date().toISOString(),
                count: activeHackathons.length,
                sprints: activeHackathons.map((h) => ({
                  id: h.id,
                  slug: h.slug,
                  title: h.title,
                  prizePoolCents: h.prizePoolCents || h.prize,
                  status: h.status,
                  endsAt: h.endsAt,
                  techStack: h.techStack,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case 'rubrics://standard': {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                version: '2026.1',
                standardWeights: {
                  innovation: {
                    weightPercent: 30,
                    description: 'Novelty of approach, uniqueness of solution, and creative problem solving.',
                  },
                  technicalDepth: {
                    weightPercent: 30,
                    description: 'Architecture robustness, code quality, test coverage, and tech stack mastery.',
                  },
                  execution: {
                    weightPercent: 20,
                    description: 'Completeness of feature set, UX polish, and functional live deployment.',
                  },
                  impact: {
                    weightPercent: 20,
                    description: 'Real-world utility, commercial/open-source viability, and ecosystem contribution.',
                  },
                },
                antiBiasRules: [
                  'Blind judging enabled until sprint status reaches FINISHED.',
                  'Evaluators cannot view competitor scores during active scoring windows.',
                  'Automated Z-score normalization applied to balance tough vs lenient judges.',
                ],
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case 'squads://open': {
      const openSquads = (data.squads || []).filter(
        (s) => (s.membersCount || 2) < (s.maxMembers || 4)
      );
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                generatedAt: new Date().toISOString(),
                totalOpenSquads: openSquads.length,
                squads: openSquads,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    default:
      throw new Error(`Resource '${uri}' not found.`);
  }
}
