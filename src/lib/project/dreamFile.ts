import matter from 'gray-matter';
import { nanoid } from 'nanoid';

export interface DreamFrontmatter {
  id: string;
  date: string;
  session: number;
  tags: string[];
  flagged: boolean;
  models_used: string[];
}

export interface DreamFile {
  frontmatter: DreamFrontmatter;
  content: string;
}

export function parseDreamFile(fileContent: string): DreamFile {
  const { data, content } = matter(fileContent);
  
  return {
    frontmatter: {
      id: data.id || nanoid(10),
      date: data.date || new Date().toISOString(),
      session: data.session || 1,
      tags: Array.isArray(data.tags) ? data.tags : [],
      flagged: data.flagged || false,
      models_used: Array.isArray(data.models_used) ? data.models_used : [],
    },
    content: content.trim(),
  };
}

export function createNewDreamFile(sessionNumber: number = 1): DreamFile {
  return {
    frontmatter: {
      id: nanoid(10),
      date: new Date().toISOString(),
      session: sessionNumber,
      tags: [],
      flagged: false,
      models_used: [],
    },
    content: '',
  };
}

export function serializeDreamFile(dream: DreamFile): string {
  const frontmatter = dream.frontmatter;
  
  const yamlLines = [
    '---',
    `id: ${frontmatter.id}`,
    `date: ${frontmatter.date}`,
    `session: ${frontmatter.session}`,
    `tags: [${frontmatter.tags.map(t => `"${t}"`).join(', ')}]`,
    `flagged: ${frontmatter.flagged}`,
    `models_used: [${frontmatter.models_used.map(m => `"${m}"`).join(', ')}]`,
    '---',
    '',
    dream.content
  ];
  
  return yamlLines.join('\n');
}
