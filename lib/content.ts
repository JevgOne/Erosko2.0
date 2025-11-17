import prisma from './prisma';

/**
 * Get content block by identifier
 * Returns content string or fallback value
 */
export async function getContentBlock(identifier: string, fallback: string = ''): Promise<string> {
  try {
    const block = await prisma.contentBlock.findUnique({
      where: {
        identifier,
        published: true,
      },
    });

    if (!block) {
      return fallback;
    }

    return block.content || fallback;
  } catch (error) {
    console.error(`Error fetching content block "${identifier}":`, error);
    return fallback;
  }
}

/**
 * Get content block data (for JSON blocks)
 * Returns parsed JSON or fallback value
 */
export async function getContentBlockData<T = any>(identifier: string, fallback: T): Promise<T> {
  try {
    const block = await prisma.contentBlock.findUnique({
      where: {
        identifier,
        published: true,
      },
    });

    if (!block || !block.data) {
      return fallback;
    }

    return JSON.parse(block.data) as T;
  } catch (error) {
    console.error(`Error fetching content block data "${identifier}":`, error);
    return fallback;
  }
}

/**
 * Get all content blocks for a page/section
 */
export async function getContentBlocks(page: string, section?: string) {
  try {
    const blocks = await prisma.contentBlock.findMany({
      where: {
        page,
        section: section || undefined,
        published: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return blocks;
  } catch (error) {
    console.error(`Error fetching content blocks for page "${page}":`, error);
    return [];
  }
}

/**
 * Helper: Get content block or throw error if not found
 * Use for required content
 */
export async function getRequiredContentBlock(identifier: string): Promise<string> {
  const content = await getContentBlock(identifier);

  if (!content) {
    throw new Error(`Required content block "${identifier}" not found`);
  }

  return content;
}
