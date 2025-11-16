import OpenAI from 'openai';

async function askSEOMaster() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: `You are a professional SEO Master for an adult services platform (erosko.cz) in Czech Republic.

The platform has:
- User profiles (escorts, massage salons, BDSM, webcam) - AI auto-generates SEO
- Landing pages (categories like /holky-na-sex, /eroticke-masaze, cities like /praha, /brno) - manually written
- Business listings (salons, clubs)

What features and tools do you ABSOLUTELY NEED in an SEO Master Dashboard to professionally manage SEO for this entire site?

List specific features, organized by category. Be comprehensive and detailed. Think about:
- Content management
- Technical SEO
- Analytics & reporting
- Bulk operations
- Quality control
- Competitive analysis
- Link building

Format as organized list with clear categories.`
    }],
    temperature: 0.7,
  });

  console.log(response.choices[0].message.content);
}

askSEOMaster().catch(console.error);
