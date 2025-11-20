import { getContentBlock, getContentBlockData, getContentBlocks } from '@/lib/content';

interface ContentBlockProps {
  identifier: string;
  fallback?: string;
  className?: string;
  as?: 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'span';
}

/**
 * Single Content Block Component
 * Fetches and displays a single content block by identifier
 */
export async function ContentBlock({
  identifier,
  fallback = '',
  className = '',
  as: Component = 'div'
}: ContentBlockProps) {
  const content = await getContentBlock(identifier, fallback);

  if (!content) return null;

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

interface ContentBlockSectionProps {
  page: string;
  section?: string;
  className?: string;
  itemClassName?: string;
}

/**
 * Content Block Section Component
 * Fetches and displays all blocks for a page/section
 */
export async function ContentBlockSection({
  page,
  section,
  className = '',
  itemClassName = ''
}: ContentBlockSectionProps) {
  const blocks = await getContentBlocks(page, section);

  if (!blocks || blocks.length === 0) return null;

  // Default styling for content blocks
  const defaultBoxClass = 'glass rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm';
  const defaultContentClass = 'prose prose-invert max-w-none prose-headings:gradient-text prose-a:text-primary-400 prose-a:hover:underline prose-strong:text-white prose-p:text-gray-300 prose-li:text-gray-300';

  // Combine custom itemClassName with default box styling
  const combinedBoxClass = itemClassName ? `${defaultBoxClass} ${itemClassName}` : defaultBoxClass;

  return (
    <div className={className}>
      {blocks.map((block) => (
        <div
          key={block.id}
          className={combinedBoxClass}
          data-block-id={block.identifier}
        >
          {block.type === 'RICH_TEXT' || block.type === 'TEXT' ? (
            <div
              className={defaultContentClass}
              dangerouslySetInnerHTML={{ __html: block.content || '' }}
            />
          ) : block.type === 'IMAGE' ? (
            <img src={block.content || ''} alt={block.title || ''} className="w-full h-auto rounded-lg" />
          ) : block.type === 'VIDEO' ? (
            <iframe
              src={block.content || ''}
              title={block.title || 'Video'}
              className="w-full aspect-video rounded-lg"
              allowFullScreen
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

/**
 * Simple text-only Content Block (no HTML)
 */
export async function ContentBlockText({
  identifier,
  fallback = '',
  className = '',
  as: Component = 'span'
}: ContentBlockProps) {
  const content = await getContentBlock(identifier, fallback);

  if (!content) return null;

  // Strip HTML tags for text-only display
  const textOnly = content.replace(/<[^>]*>/g, '');

  return (
    <Component className={className}>
      {textOnly}
    </Component>
  );
}

interface PreloadedContentBlockSectionProps {
  blocks?: any[];
  className?: string;
  itemClassName?: string;
}

/**
 * Preloaded Content Block Section Component
 * Use when blocks are already fetched to avoid extra DB queries
 */
export function PreloadedContentBlockSection({
  blocks = [],
  className = '',
  itemClassName = ''
}: PreloadedContentBlockSectionProps) {
  if (!blocks || blocks.length === 0) return null;

  // Default styling for content blocks
  const defaultBoxClass = 'glass rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm';
  const defaultContentClass = 'prose prose-invert max-w-none prose-headings:gradient-text prose-a:text-primary-400 prose-a:hover:underline prose-strong:text-white prose-p:text-gray-300 prose-li:text-gray-300';

  // Combine custom itemClassName with default box styling
  const combinedBoxClass = itemClassName ? `${defaultBoxClass} ${itemClassName}` : defaultBoxClass;

  return (
    <div className={className}>
      {blocks.map((block) => (
        <div
          key={block.id}
          className={combinedBoxClass}
          data-block-id={block.identifier}
        >
          {block.type === 'RICH_TEXT' || block.type === 'TEXT' ? (
            <div
              className={defaultContentClass}
              dangerouslySetInnerHTML={{ __html: block.content || '' }}
            />
          ) : block.type === 'IMAGE' ? (
            <img src={block.content || ''} alt={block.title || ''} className="w-full h-auto rounded-lg" />
          ) : block.type === 'VIDEO' ? (
            <iframe
              src={block.content || ''}
              title={block.title || 'Video'}
              className="w-full aspect-video rounded-lg"
              allowFullScreen
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
