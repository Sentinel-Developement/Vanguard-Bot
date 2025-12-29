/*
 ██████╗ ██╗      █████╗  ██████╗███████╗██╗   ██╗████████╗
██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝╚══██╔══╝
██║  ███╗██║     ███████║██║     █████╗   ╚████╔╝    ██║   
██║   ██║██║     ██╔══██║██║     ██╔══╝    ╚██╔╝     ██║   
╚██████╔╝███████╗██║  ██║╚██████╗███████╗   ██║      ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝      ╚═╝   

-------------------------------------
📡 Discord : https://discord.gg/xQF9f9yUEM
🌐 Website : https://glaceyt.com
🎥 YouTube : https://youtube.com/@GlaceYT
✅ Verified | 🧩 Tested | ⚙️ Stable
-------------------------------------
> © 2025 GlaceYT.com | All rights reserved.
*/
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const aiManager = require('../../utils/AIManager');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ai")
    .setDescription("AI-powered tools (ask questions, generate images, analyze content, etc.)")
    .addSubcommand(subcommand =>
      subcommand
        .setName("ask")
        .setDescription("Ask Gemini AI a quick question")
        .addStringOption(option =>
          option.setName("question")
            .setDescription("Your question for Gemini AI")
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName("image")
        .setDescription("Generate an image with Gemini AI")
        .addStringOption(option =>
          option.setName("prompt")
            .setDescription("Describe the image you want to generate")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("style")
            .setDescription("Image style (optional)")
            .addChoices(
              { name: 'Realistic', value: 'realistic' },
              { name: 'Cartoon', value: 'cartoon' },
              { name: 'Anime', value: 'anime' },
              { name: 'Art', value: 'artistic' },
              { name: 'Photography', value: 'photographic' }
            )
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName("analyze")
        .setDescription("Analyze an image and describe what's in it")
        .addAttachmentOption(option =>
          option.setName("image")
            .setDescription("Upload an image to analyze")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("focus")
            .setDescription("What to focus on in the analysis")
            .addChoices(
              { name: 'General Description', value: 'general' },
              { name: 'Objects & People', value: 'objects' },
              { name: 'Text/OCR', value: 'ocr' },
              { name: 'Emotions & Mood', value: 'emotions' },
              { name: 'Colors & Composition', value: 'artistic' }
            )
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName("story")
        .setDescription("Generate a creative story with AI")
        .addStringOption(option =>
          option.setName("prompt")
            .setDescription("Story theme, characters, or starting idea")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("genre")
            .setDescription("Story genre/style")
            .addChoices(
              { name: 'Horror 👻', value: 'horror' },
              { name: 'Romance 💕', value: 'romantic' },
              { name: 'Adventure 🗡️', value: 'adventure' },
              { name: 'Anime/Manga 🎌', value: 'anime' },
              { name: 'Kids Friendly 🌈', value: 'kids' },
              { name: 'Sci-Fi 🚀', value: 'scifi' },
              { name: 'Fantasy ✨', value: 'fantasy' },
              { name: 'Mystery 🕵️', value: 'mystery' }
            )
            .setRequired(false))
        .addStringOption(option =>
          option.setName("length")
            .setDescription("Story length")
            .addChoices(
              { name: 'Short (few paragraphs)', value: 'short' },
              { name: 'Medium (half page)', value: 'medium' },
              { name: 'Long (full story)', value: 'long' }
            )
            .setRequired(false)))

.addSubcommand(subcommand =>
  subcommand
    .setName("research")
    .setDescription("Conduct research and compile comprehensive reports")
    .addStringOption(option =>
      option.setName("topic")
        .setDescription("Research topic or question")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("depth")
        .setDescription("Research depth and focus")
        .addChoices(
          { name: 'Quick Overview 📋', value: 'overview' },
          { name: 'Detailed Analysis 🔍', value: 'detailed' },
          { name: 'Comprehensive Report 📊', value: 'comprehensive' },
          { name: 'Academic Level 🎓', value: 'academic' },
          { name: 'Business Intelligence 💼', value: 'business' }
        )
        .setRequired(false))
    .addStringOption(option =>
      option.setName("format")
        .setDescription("Output format")
        .addChoices(
          { name: 'Report Format', value: 'report' },
          { name: 'Bullet Points', value: 'bullets' },
          { name: 'FAQ Style', value: 'faq' },
          { name: 'Presentation Outline', value: 'presentation' }
        )
        .setRequired(false)))

.addSubcommand(subcommand =>
  subcommand
    .setName("translate")
    .setDescription("Advanced translation with context and cultural nuances")
    .addStringOption(option =>
      option.setName("text")
        .setDescription("Text to translate")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("target_language")
        .setDescription("Target language")
        .addChoices(
          { name: 'Spanish 🇪🇸', value: 'spanish' },
          { name: 'French 🇫🇷', value: 'french' },
          { name: 'German 🇩🇪', value: 'german' },
          { name: 'Italian 🇮🇹', value: 'italian' },
          { name: 'Japanese 🇯🇵', value: 'japanese' },
          { name: 'Chinese 🇨🇳', value: 'chinese' },
          { name: 'Korean 🇰🇷', value: 'korean' },
          { name: 'Russian 🇷🇺', value: 'russian' },
          { name: 'Arabic 🇸🇦', value: 'arabic' },
          { name: 'Hindi 🇮🇳', value: 'hindi' }
        )
        .setRequired(true))
    .addStringOption(option =>
      option.setName("style")
        .setDescription("Translation style")
        .addChoices(
          { name: 'Formal/Professional', value: 'formal' },
          { name: 'Casual/Conversational', value: 'casual' },
          { name: 'Technical/Precise', value: 'technical' },
          { name: 'Creative/Literary', value: 'creative' },
          { name: 'Business/Commercial', value: 'business' }
        )
        .setRequired(false))
    .addStringOption(option =>
      option.setName("context")
        .setDescription("Context or setting for better translation")
        .setRequired(false)))

.addSubcommand(subcommand =>
  subcommand
    .setName("proofread")
    .setDescription("Professional proofreading and editing with suggestions")
    .addStringOption(option =>
      option.setName("text")
        .setDescription("Text to proofread and edit")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("level")
        .setDescription("Editing level")
        .addChoices(
          { name: 'Grammar & Spelling Only 📝', value: 'grammar' },
          { name: 'Style & Clarity 🎯', value: 'style' },
          { name: 'Comprehensive Edit ✨', value: 'comprehensive' },
          { name: 'Academic Standards 🎓', value: 'academic' },
          { name: 'Business Professional 💼', value: 'business' }
        )
        .setRequired(false))
    .addStringOption(option =>
      option.setName("document_type")
        .setDescription("Type of document")
        .addChoices(
          { name: 'Essay/Article', value: 'essay' },
          { name: 'Business Document', value: 'business' },
          { name: 'Email/Letter', value: 'correspondence' },
          { name: 'Creative Writing', value: 'creative' },
          { name: 'Technical/Manual', value: 'technical' }
        )
        .setRequired(false)))

.addSubcommand(subcommand =>
  subcommand
    .setName("curriculum")
    .setDescription("Create learning curriculums and educational content")
    .addStringOption(option =>
      option.setName("subject")
        .setDescription("Subject or skill to create curriculum for")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("level")
        .setDescription("Difficulty level")
        .addChoices(
          { name: 'Beginner 🌱', value: 'beginner' },
          { name: 'Intermediate 📈', value: 'intermediate' },
          { name: 'Advanced 🎯', value: 'advanced' },
          { name: 'Expert/Professional 🏆', value: 'expert' },
          { name: 'Mixed Levels 📊', value: 'mixed' }
        )
        .setRequired(false))
    .addStringOption(option =>
      option.setName("duration")
        .setDescription("Course duration")
        .addChoices(
          { name: '1 Week Crash Course', value: 'week' },
          { name: '1 Month Program', value: 'month' },
          { name: '3 Month Course', value: 'quarter' },
          { name: '6 Month Program', value: 'semester' },
          { name: 'Full Year Course', value: 'year' }
        )
        .setRequired(false))
    .addStringOption(option =>
      option.setName("focus")
        .setDescription("Special focus or goal")
        .addChoices(
          { name: 'Practical/Hands-on', value: 'practical' },
          { name: 'Theoretical/Academic', value: 'theoretical' },
          { name: 'Certification Prep', value: 'certification' },
          { name: 'Career Change', value: 'career' },
          { name: 'Personal Interest', value: 'personal' }
        )
        .setRequired(false)))

.addSubcommand(subcommand =>
  subcommand
    .setName("presentation")
    .setDescription("Create complete presentations with slides and speaker notes")
    .addStringOption(option =>
      option.setName("topic")
        .setDescription("Presentation topic")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("audience")
        .setDescription("Target audience")
        .addChoices(
          { name: 'Business/Corporate 💼', value: 'business' },
          { name: 'Academic/Educational 🎓', value: 'academic' },
          { name: 'Technical/Engineering 🔧', value: 'technical' },
          { name: 'Sales/Marketing 📈', value: 'sales' },
          { name: 'General Public 👥', value: 'general' },
          { name: 'Students 📚', value: 'students' },
          { name: 'Investors 💰', value: 'investors' }
        )
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName("slides")
        .setDescription("Number of slides (5-30)")
        .setMinValue(5)
        .setMaxValue(30)
        .setRequired(false))
    .addStringOption(option =>
      option.setName("style")
        .setDescription("Presentation style")
        .addChoices(
          { name: 'Informative', value: 'informative' },
          { name: 'Persuasive', value: 'persuasive' },
          { name: 'Training/Workshop', value: 'training' },
          { name: 'Pitch/Proposal', value: 'pitch' },
          { name: 'Report/Update', value: 'report' }
        )
        .setRequired(false)))

.addSubcommand(subcommand =>
  subcommand
    .setName("seo_content")
    .setDescription("Create SEO-optimized content with keyword analysis")
    .addStringOption(option =>
      option.setName("topic")
        .setDescription("Content topic or main keyword")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("content_type")
        .setDescription("Type of content to create")
        .addChoices(
          { name: 'Blog Article 📝', value: 'blog' },
          { name: 'Product Description 🛍️', value: 'product' },
          { name: 'Landing Page 🎯', value: 'landing' },
          { name: 'Meta Tags 🏷️', value: 'meta' },
          { name: 'Social Media Posts 📱', value: 'social' },
          { name: 'FAQ Section ❓', value: 'faq' },
          { name: 'Category Page 📂', value: 'category' }
        )
        .setRequired(false))
    .addStringOption(option =>
      option.setName("target_keywords")
        .setDescription("Additional keywords to include (comma-separated)")
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName("word_count")
        .setDescription("Target word count (300-3000)")
        .setMinValue(300)
        .setMaxValue(3000)
        .setRequired(false)))

.addSubcommand(subcommand =>
  subcommand
    .setName("legal_doc")
    .setDescription("Generate legal documents and contracts (for reference only)")
    .addStringOption(option =>
      option.setName("document_type")
        .setDescription("Type of legal document")
        .addChoices(
          { name: 'Terms of Service 📋', value: 'terms' },
          { name: 'Privacy Policy 🔒', value: 'privacy' },
          { name: 'Non-Disclosure Agreement 🤐', value: 'nda' },
          { name: 'Service Agreement 🤝', value: 'service' },
          { name: 'Employment Contract 💼', value: 'employment' },
          { name: 'Rental Agreement 🏠', value: 'rental' },
          { name: 'Invoice Template 💰', value: 'invoice' },
          { name: 'Disclaimer 📝', value: 'disclaimer' }
        )
        .setRequired(true))
    .addStringOption(option =>
      option.setName("business_info")
        .setDescription("Business/entity information (name, industry, location)")
        .setRequired(false))
    .addStringOption(option =>
      option.setName("specific_terms")
        .setDescription("Specific terms, conditions, or requirements to include")
        .setRequired(false))
    .addStringOption(option =>
      option.setName("jurisdiction")
        .setDescription("Legal jurisdiction/location")
        .addChoices(
          { name: 'United States', value: 'us' },
          { name: 'European Union', value: 'eu' },
          { name: 'United Kingdom', value: 'uk' },
          { name: 'Canada', value: 'ca' },
          { name: 'Australia', value: 'au' },
          { name: 'Other/Generic', value: 'generic' }
        )
        .setRequired(false)))

.addSubcommand(subcommand =>
  subcommand
    .setName("qa_generator")
    .setDescription("Generate comprehensive Q&A sets and knowledge bases")
    .addStringOption(option =>
      option.setName("topic")
        .setDescription("Topic or subject for Q&A generation")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("question_type")
        .setDescription("Type of questions to generate")
        .addChoices(
          { name: 'FAQ for Customers 💬', value: 'faq' },
          { name: 'Interview Questions 👔', value: 'interview' },
          { name: 'Study/Exam Questions 📚', value: 'study' },
          { name: 'Troubleshooting Q&A 🔧', value: 'troubleshooting' },
          { name: 'Product Knowledge 🛍️', value: 'product' },
          { name: 'Training Material 🎓', value: 'training' },
          { name: 'Quiz/Assessment 📊', value: 'quiz' }
        )
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName("count")
        .setDescription("Number of Q&A pairs to generate (5-50)")
        .setMinValue(5)
        .setMaxValue(50)
        .setRequired(false))
    .addStringOption(option =>
      option.setName("difficulty")
        .setDescription("Question difficulty level")
        .addChoices(
          { name: 'Basic/Beginner', value: 'basic' },
          { name: 'Intermediate', value: 'intermediate' },
          { name: 'Advanced', value: 'advanced' },
          { name: 'Expert/Professional', value: 'expert' },
          { name: 'Mixed Levels', value: 'mixed' }
        )
        .setRequired(false)))

    .addSubcommand(subcommand =>
      subcommand
        .setName("summarize")
        .setDescription("Summarize text or analyze content")
        .addStringOption(option =>
          option.setName("text")
            .setDescription("Text to summarize (paste text, URL, or describe content)")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("style")
            .setDescription("Summary style")
            .addChoices(
              { name: 'Brief Summary', value: 'brief' },
              { name: 'Key Points', value: 'points' },
              { name: 'Detailed Analysis', value: 'detailed' },
              { name: 'ELI5 (Simple)', value: 'eli5' }
            )
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName("code")
        .setDescription("Generate, explain, or debug code")
        .addStringOption(option =>
          option.setName("request")
            .setDescription("What you want to do with code")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("language")
            .setDescription("Programming language")
            .addChoices(
              { name: 'JavaScript', value: 'javascript' },
              { name: 'Python', value: 'python' },
              { name: 'Java', value: 'java' },
              { name: 'C++', value: 'cpp' },
              { name: 'HTML/CSS', value: 'web' },
              { name: 'SQL', value: 'sql' }
            )
            .setRequired(false)))
    

    .addSubcommand(subcommand =>
      subcommand
        .setName("email")
        .setDescription("Write professional emails with AI")
        .addStringOption(option =>
          option.setName("purpose")
            .setDescription("What kind of email do you need?")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("tone")
            .setDescription("Email tone and style")
            .addChoices(
              { name: 'Professional 💼', value: 'professional' },
              { name: 'Friendly 😊', value: 'friendly' },
              { name: 'Formal 🎩', value: 'formal' },
              { name: 'Casual 👋', value: 'casual' },
              { name: 'Apologetic 😔', value: 'apologetic' },
              { name: 'Persuasive 🎯', value: 'persuasive' },
              { name: 'Follow-up 🔔', value: 'followup' }
            )
            .setRequired(false))
        .addStringOption(option =>
          option.setName("recipient")
            .setDescription("Who are you writing to? (boss, client, friend, etc.)")
            .setRequired(false)))
    
    .addSubcommand(subcommand =>
      subcommand
        .setName("message")
        .setDescription("Craft messages for social media, texts, or announcements")
        .addStringOption(option =>
          option.setName("content")
            .setDescription("What do you want to communicate?")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("platform")
            .setDescription("Where will this be posted?")
            .addChoices(
              { name: 'Discord Announcement 📢', value: 'discord' },
              { name: 'Twitter/X Post 🐦', value: 'twitter' },
              { name: 'Instagram Caption 📸', value: 'instagram' },
              { name: 'LinkedIn Post 💼', value: 'linkedin' },
              { name: 'Text Message 📱', value: 'text' },
              { name: 'WhatsApp Message 💬', value: 'whatsapp' },
              { name: 'General Message ✉️', value: 'general' }
            )
            .setRequired(false))
        .addStringOption(option =>
          option.setName("style")
            .setDescription("Message style and mood")
            .addChoices(
              { name: 'Engaging & Fun 🎉', value: 'engaging' },
              { name: 'Professional 💼', value: 'professional' },
              { name: 'Informative 📚', value: 'informative' },
              { name: 'Motivational 💪', value: 'motivational' },
              { name: 'Humorous 😄', value: 'humorous' },
              { name: 'Serious & Direct 🎯', value: 'serious' }
            )
            .setRequired(false)))
    
    .addSubcommand(subcommand =>
      subcommand
        .setName("letter")
        .setDescription("Write formal letters, cover letters, or personal notes")
        .addStringOption(option =>
          option.setName("type")
            .setDescription("What type of letter?")
            .addChoices(
              { name: 'Cover Letter 📄', value: 'cover' },
              { name: 'Resignation Letter 👋', value: 'resignation' },
              { name: 'Complaint Letter 😤', value: 'complaint' },
              { name: 'Thank You Note 🙏', value: 'thankyou' },
              { name: 'Recommendation Letter ⭐', value: 'recommendation' },
              { name: 'Personal Letter 💌', value: 'personal' },
              { name: 'Business Proposal 💼', value: 'proposal' }
            )
            .setRequired(true))
        .addStringOption(option =>
          option.setName("details")
            .setDescription("Specific details, context, or key points to include")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("recipient")
            .setDescription("Who is this letter for? (company, person, etc.)")
            .setRequired(false)))
    
    .addSubcommand(subcommand =>
      subcommand
        .setName("script")
        .setDescription("Write scripts, speeches, or presentations")
        .addStringOption(option =>
          option.setName("type")
            .setDescription("What kind of script?")
            .addChoices(
              { name: 'Presentation Script 🎤', value: 'presentation' },
              { name: 'YouTube Video Script 📹', value: 'youtube' },
              { name: 'Podcast Introduction 🎙️', value: 'podcast' },
              { name: 'Speech/Toast 🥂', value: 'speech' },
              { name: 'Sales Pitch 💰', value: 'sales' },
              { name: 'Interview Prep 👔', value: 'interview' },
              { name: 'Meeting Agenda 📋', value: 'meeting' }
            )
            .setRequired(true))
        .addStringOption(option =>
          option.setName("topic")
            .setDescription("Main topic or subject matter")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("audience")
            .setDescription("Who is your audience? (colleagues, friends, customers, etc.)")
            .setRequired(false))
        .addStringOption(option =>
          option.setName("duration")
            .setDescription("How long should it be?")
            .addChoices(
              { name: '1-2 minutes ⚡', value: 'short' },
              { name: '3-5 minutes 🎯', value: 'medium' },
              { name: '10+ minutes 📚', value: 'long' }
            )
            .setRequired(false)))
    
    .addSubcommand(subcommand =>
      subcommand
        .setName("rewrite")
        .setDescription("Improve, rephrase, or rewrite existing text")
        .addStringOption(option =>
          option.setName("text")
            .setDescription("Text you want to rewrite or improve")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("goal")
            .setDescription("What do you want to improve?")
            .addChoices(
              { name: 'Make it Professional 💼', value: 'professional' },
              { name: 'Make it Clearer 🔍', value: 'clarity' },
              { name: 'Make it Shorter ✂️', value: 'concise' },
              { name: 'Make it Longer 📝', value: 'expand' },
              { name: 'Fix Grammar 📚', value: 'grammar' },
              { name: 'Change Tone 🎭', value: 'tone' },
              { name: 'Make it Friendlier 😊', value: 'friendly' }
            )
            .setRequired(false))
        .addStringOption(option =>
          option.setName("target_tone")
            .setDescription("Desired tone for the rewritten text")
            .addChoices(
              { name: 'Formal', value: 'formal' },
              { name: 'Casual', value: 'casual' },
              { name: 'Professional', value: 'professional' },
              { name: 'Friendly', value: 'friendly' },
              { name: 'Persuasive', value: 'persuasive' }
            )
            .setRequired(false)))
    
    .addSubcommand(subcommand =>
      subcommand
        .setName("brainstorm")
        .setDescription("Generate ideas, concepts, or creative solutions")
        .addStringOption(option =>
          option.setName("topic")
            .setDescription("What do you need ideas for?")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("type")
            .setDescription("What kind of ideas?")
            .addChoices(
              { name: 'Business Ideas 💡', value: 'business' },
              { name: 'Content Ideas 📝', value: 'content' },
              { name: 'Project Names 🏷️', value: 'names' },
              { name: 'Creative Solutions 🎨', value: 'creative' },
              { name: 'Marketing Campaigns 📢', value: 'marketing' },
              { name: 'Event Planning 🎉', value: 'events' },
              { name: 'Problem Solving 🔧', value: 'solutions' }
            )
            .setRequired(false))
        .addIntegerOption(option =>
          option.setName("count")
            .setDescription("How many ideas do you want? (1-20)")
            .setMinValue(1)
            .setMaxValue(20)
            .setRequired(false))),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "ask") {
      const question = interaction.options.getString("question");
      await interaction.deferReply();

      try {
        const response = await aiManager.generateContent(question, { 
          model: "gemini-2.5-flash",
          timeout: 30000 
        });
        
        const answer = response.text();
        
        const embed = new EmbedBuilder()
          .setColor('#4285f4')
          .setTitle('🤖 AI Response')
          .setDescription(answer.length > 4000 ? answer.substring(0, 4000) + '...' : answer)
          .addFields({ 
            name: '❓ Question', 
            value: question.length > 1000 ? question.substring(0, 1000) + '...' : question,
            inline: false 
          })
          .setTimestamp()
          .setFooter({ text: 'Powered by Gemini AI' });

        await interaction.editReply({ embeds: [embed] });
        
      } catch (error) {
        console.error('AI Ask Error:', error);
        await interaction.editReply("❌ Error while asking Gemini AI.");
      }
    }

    if (subcommand === "image") {
      const prompt = interaction.options.getString("prompt");
      const style = interaction.options.getString("style");
      await interaction.deferReply();

      try {
        let enhancedPrompt = prompt;
        if (style) {
          const stylePrompts = {
            realistic: "Create a photorealistic, highly detailed image of: ",
            cartoon: "Create a colorful cartoon-style illustration of: ",
            anime: "Create an anime art style image of: ",
            artistic: "Create an artistic, painterly image of: ",
            photographic: "Create a professional photography-style image of: "
          };
          enhancedPrompt = stylePrompts[style] + prompt;
        }

        const result = await aiManager.generateImage(enhancedPrompt);
        
        if (result.imageBuffer) {
          const attachment = new AttachmentBuilder(result.imageBuffer, { 
            name: 'gemini-generated-image.png' 
          });

          const embed = new EmbedBuilder()
            .setColor('#ff6b35')
            .setTitle('🖼️ Image Generated Successfully!')
            .addFields(
              { name: '🎨 Original Prompt', value: prompt, inline: false },
              { name: '✨ Style', value: style ? style.charAt(0).toUpperCase() + style.slice(1) : 'Default', inline: true }
            )
            .setImage('attachment://gemini-generated-image.png')
            .setTimestamp()
            .setFooter({ text: 'Generated by Gemini AI' });

          if (result.textResponse) {
            embed.addFields({ 
              name: '🤖 AI Notes', 
              value: result.textResponse.length > 500 ? result.textResponse.substring(0, 500) + '...' : result.textResponse,
              inline: false 
            });
          }

          await interaction.editReply({ 
            embeds: [embed], 
            files: [attachment] 
          });
        } else {
          await interaction.editReply("❌ Failed to generate image. Please try a different prompt.");
        }

      } catch (error) {
        console.error('AI Image Error:', error);
        await interaction.editReply("❌ Error while generating image.");
      }
    }

    if (subcommand === "analyze") {
      const image = interaction.options.getAttachment("image");
      const focus = interaction.options.getString("focus") || 'general';
      await interaction.deferReply();

      try {
        if (!image.contentType?.startsWith('image/')) {
          return await interaction.editReply("❌ Please upload a valid image file.");
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        const result = await aiManager.analyzeImage(image.url, focus);
        
        const embed = new EmbedBuilder()
          .setColor('#9b59b6')
          .setTitle('🔍 Image Analysis Results')
          .setDescription(result.analysis)
          .addFields(
            { name: '🎯 Focus', value: focus.charAt(0).toUpperCase() + focus.slice(1), inline: true },
            { name: '🖼️ Image', value: `[View Image](${image.url})`, inline: true }
          )
          .setThumbnail(image.url)
          .setTimestamp()
          .setFooter({ text: 'Analyzed by Gemini AI' });

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('AI Analysis Error:', error);
        await interaction.editReply("❌ Error while analyzing image.");
      }
    }

    if (subcommand === "story") {
      const prompt = interaction.options.getString("prompt");
      const genre = interaction.options.getString("genre") || 'adventure';
      const length = interaction.options.getString("length") || 'medium';
      await interaction.deferReply();

      try {
        const result = await aiManager.generateStory(prompt, genre, length);
        
        const embed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setTitle('📚 Generated Story')
          .setDescription(result.story.length > 4000 ? result.story.substring(0, 4000) + '...' : result.story)
          .addFields(
            { name: '💡 Theme', value: prompt, inline: false },
            { name: '🎭 Genre', value: genre.charAt(0).toUpperCase() + genre.slice(1), inline: true },
            { name: '📏 Length', value: length.charAt(0).toUpperCase() + length.slice(1), inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'Story by Gemini AI' });

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('AI Story Error:', error);
        await interaction.editReply("❌ Error while generating story.");
      }
    }

    if (subcommand === "summarize") {
      const text = interaction.options.getString("text");
      const style = interaction.options.getString("style") || 'brief';
      await interaction.deferReply();

      try {
        const result = await aiManager.summarizeText(text, style);
        
        const embed = new EmbedBuilder()
          .setColor('#3498db')
          .setTitle('📝 Text Summary')
          .setDescription(result.summary)
          .addFields(
            { name: '📊 Style', value: style.charAt(0).toUpperCase() + style.slice(1), inline: true },
            { name: '📄 Original Length', value: `${text.length} characters`, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'Summarized by Gemini AI' });

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('AI Summary Error:', error);
        await interaction.editReply("❌ Error while summarizing text.");
      }
    }

    if (subcommand === "code") {
      const request = interaction.options.getString("request");
      const language = interaction.options.getString("language") || 'general';
      await interaction.deferReply();

      try {
        const result = await aiManager.helpWithCode(request, language);
        
        const embed = new EmbedBuilder()
          .setColor('#f39c12')
          .setTitle('💻 Code Helper')
          .setDescription(result.response.length > 3000 ? result.response.substring(0, 3000) + '...' : result.response)
          .addFields(
            { name: '❓ Request', value: request, inline: false },
            { name: '⚡ Language', value: language.charAt(0).toUpperCase() + language.slice(1), inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'Code help by Gemini AI' });

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('AI Code Error:', error);
        await interaction.editReply("❌ Error while helping with code.");
      }
    }


if (subcommand === "research") {
  const topic = interaction.options.getString("topic");
  const depth = interaction.options.getString("depth") || 'detailed';
  const format = interaction.options.getString("format") || 'report';
  await interaction.deferReply();

  try {
    const result = await this.conductResearch(topic, depth, format);
    
    const embed = new EmbedBuilder()
      .setColor('#16a085')
      .setTitle('🔍 Research Report')
      .setDescription(result.research.length > 3500 ? result.research.substring(0, 3500) + '...' : result.research)
      .addFields(
        { name: '🎯 Topic', value: topic, inline: false },
        { name: '📊 Depth', value: depth.charAt(0).toUpperCase() + depth.slice(1), inline: true },
        { name: '📋 Format', value: format.charAt(0).toUpperCase() + format.slice(1), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Research compiled by Gemini AI' });

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('AI Research Error:', error);
    await interaction.editReply("❌ Error while conducting research.");
  }
}

if (subcommand === "translate") {
  const text = interaction.options.getString("text");
  const targetLanguage = interaction.options.getString("target_language");
  const style = interaction.options.getString("style") || 'formal';
  const context = interaction.options.getString("context");
  await interaction.deferReply();

  try {
    const result = await this.translateText(text, targetLanguage, style, context);
    
    const embed = new EmbedBuilder()
      .setColor('#e74c3c')
      .setTitle('🌐 Advanced Translation')
      .addFields(
        { name: '📝 Original Text', value: text.length > 500 ? text.substring(0, 500) + '...' : text, inline: false },
        { name: '✨ Translation', value: result.translation, inline: false },
        { name: '🎯 Target Language', value: targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1), inline: true },
        { name: '🎭 Style', value: style.charAt(0).toUpperCase() + style.slice(1), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Translated by Gemini AI with cultural context' });

    if (result.notes) {
      embed.addFields({ name: '📋 Translation Notes', value: result.notes, inline: false });
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('AI Translation Error:', error);
    await interaction.editReply("❌ Error while translating text.");
  }
}

if (subcommand === "proofread") {
  const text = interaction.options.getString("text");
  const level = interaction.options.getString("level") || 'comprehensive';
  const documentType = interaction.options.getString("document_type") || 'general';
  await interaction.deferReply();

  try {
    const result = await this.proofreadText(text, level, documentType);
    
    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle('✏️ Professional Proofreading')
      .addFields(
        { name: '📝 Original Text', value: text.length > 800 ? text.substring(0, 800) + '...' : text, inline: false },
        { name: '✨ Corrected Version', value: result.corrected.length > 1200 ? result.corrected.substring(0, 1200) + '...' : result.corrected, inline: false },
        { name: '📊 Editing Level', value: level.charAt(0).toUpperCase() + level.slice(1), inline: true },
        { name: '📄 Document Type', value: documentType.charAt(0).toUpperCase() + documentType.slice(1), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Proofread by Gemini AI' });

    if (result.suggestions && result.suggestions.length > 0) {
      embed.addFields({ 
        name: '💡 Key Improvements', 
        value: result.suggestions.substring(0, 800),
        inline: false 
      });
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('AI Proofread Error:', error);
    await interaction.editReply("❌ Error while proofreading text.");
  }
}

if (subcommand === "curriculum") {
  const subject = interaction.options.getString("subject");
  const level = interaction.options.getString("level") || 'intermediate';
  const duration = interaction.options.getString("duration") || 'month';
  const focus = interaction.options.getString("focus") || 'practical';
  await interaction.deferReply();

  try {
    const result = await this.createCurriculum(subject, level, duration, focus);
    
    const embed = new EmbedBuilder()
      .setColor('#27ae60')
      .setTitle('📚 Learning Curriculum')
      .setDescription(result.curriculum.length > 3500 ? result.curriculum.substring(0, 3500) + '...' : result.curriculum)
      .addFields(
        { name: '🎯 Subject', value: subject, inline: false },
        { name: '📈 Level', value: level.charAt(0).toUpperCase() + level.slice(1), inline: true },
        { name: '⏰ Duration', value: duration.charAt(0).toUpperCase() + duration.slice(1), inline: true },
        { name: '🎨 Focus', value: focus.charAt(0).toUpperCase() + focus.slice(1), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Curriculum designed by Gemini AI' });

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('AI Curriculum Error:', error);
    await interaction.editReply("❌ Error while creating curriculum.");
  }
}

if (subcommand === "presentation") {
  const topic = interaction.options.getString("topic");
  const audience = interaction.options.getString("audience") || 'general';
  const slides = interaction.options.getInteger("slides") || 10;
  const style = interaction.options.getString("style") || 'informative';
  await interaction.deferReply();

  try {
    const result = await this.createPresentation(topic, audience, slides, style);
    
    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('🎤 Presentation Created')
      .setDescription(result.presentation.length > 3500 ? result.presentation.substring(0, 3500) + '...' : result.presentation)
      .addFields(
        { name: '🎯 Topic', value: topic, inline: false },
        { name: '👥 Audience', value: audience.charAt(0).toUpperCase() + audience.slice(1), inline: true },
        { name: '📊 Slides', value: slides.toString(), inline: true },
        { name: '🎭 Style', value: style.charAt(0).toUpperCase() + style.slice(1), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Presentation by Gemini AI' });

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('AI Presentation Error:', error);
    await interaction.editReply("❌ Error while creating presentation.");
  }
}

if (subcommand === "seo_content") {
  const topic = interaction.options.getString("topic");
  const contentType = interaction.options.getString("content_type") || 'blog';
  const targetKeywords = interaction.options.getString("target_keywords");
  const wordCount = interaction.options.getInteger("word_count") || 800;
  await interaction.deferReply();

  try {
    const result = await this.createSEOContent(topic, contentType, targetKeywords, wordCount);
    
    const embed = new EmbedBuilder()
      .setColor('#e67e22')
      .setTitle('🔍 SEO-Optimized Content')
      .setDescription(result.content.length > 3000 ? result.content.substring(0, 3000) + '...' : result.content)
      .addFields(
        { name: '🎯 Main Topic', value: topic, inline: false },
        { name: '📝 Content Type', value: contentType.charAt(0).toUpperCase() + contentType.slice(1), inline: true },
        { name: '📊 Word Count', value: wordCount.toString(), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'SEO content by Gemini AI' });

    if (targetKeywords) {
      embed.addFields({ name: '🏷️ Target Keywords', value: targetKeywords, inline: false });
    }

    if (result.seoTips) {
      embed.addFields({ name: '💡 SEO Tips', value: result.seoTips.substring(0, 500), inline: false });
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('AI SEO Content Error:', error);
    await interaction.editReply("❌ Error while creating SEO content.");
  }
}

if (subcommand === "legal_doc") {
  const documentType = interaction.options.getString("document_type");
  const businessInfo = interaction.options.getString("business_info");
  const specificTerms = interaction.options.getString("specific_terms");
  const jurisdiction = interaction.options.getString("jurisdiction") || 'generic';
  await interaction.deferReply();

  try {
    const result = await this.createLegalDocument(documentType, businessInfo, specificTerms, jurisdiction);
    
    const embed = new EmbedBuilder()
      .setColor('#8e44ad')
      .setTitle('⚖️ Legal Document Template')
      .setDescription('⚠️ **DISCLAIMER:** This is a template for reference only. Consult a qualified attorney for legal advice.\n\n' + 
        (result.document.length > 3000 ? result.document.substring(0, 3000) + '...' : result.document))
      .addFields(
        { name: '📝 Document Type', value: documentType.charAt(0).toUpperCase() + documentType.slice(1), inline: true },
        { name: '🌍 Jurisdiction', value: jurisdiction.toUpperCase(), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Legal template by Gemini AI - Not legal advice' });

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('AI Legal Doc Error:', error);
    await interaction.editReply("❌ Error while creating legal document.");
  }
}

if (subcommand === "qa_generator") {
  const topic = interaction.options.getString("topic");
  const questionType = interaction.options.getString("question_type") || 'faq';
  const count = interaction.options.getInteger("count") || 15;
  const difficulty = interaction.options.getString("difficulty") || 'mixed';
  await interaction.deferReply();

  try {
    const result = await this.generateQA(topic, questionType, count, difficulty);
    
    const embed = new EmbedBuilder()
      .setColor('#f39c12')
      .setTitle('❓ Q&A Knowledge Base')
      .setDescription(result.qaSet.length > 3500 ? result.qaSet.substring(0, 3500) + '...' : result.qaSet)
      .addFields(
        { name: '🎯 Topic', value: topic, inline: false },
        { name: '💬 Question Type', value: questionType.charAt(0).toUpperCase() + questionType.slice(1), inline: true },
        { name: '🔢 Questions Generated', value: count.toString(), inline: true },
        { name: '📊 Difficulty', value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Q&A generated by Gemini AI' });

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('AI Q&A Error:', error);
    await interaction.editReply("❌ Error while generating Q&A.");
  }
}

 
    if (subcommand === "email") {
      const purpose = interaction.options.getString("purpose");
      const tone = interaction.options.getString("tone") || 'professional';
      const recipient = interaction.options.getString("recipient");
      await interaction.deferReply();

      try {
        const result = await this.generateEmail(purpose, tone, recipient);
        
        const embed = new EmbedBuilder()
          .setColor('#27ae60')
          .setTitle('📧 Professional Email Generated')
          .setDescription(result.email)
          .addFields(
            { name: '🎯 Purpose', value: purpose, inline: false },
            { name: '🎭 Tone', value: tone.charAt(0).toUpperCase() + tone.slice(1), inline: true },
            { name: '👤 Recipient', value: recipient || 'General', inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'Professional email by Gemini AI' });

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('AI Email Error:', error);
        await interaction.editReply("❌ Error while generating email.");
      }
    }

    if (subcommand === "message") {
      const content = interaction.options.getString("content");
      const platform = interaction.options.getString("platform") || 'general';
      const style = interaction.options.getString("style") || 'engaging';
      await interaction.deferReply();

      try {
        const result = await this.generateMessage(content, platform, style);
        
        const embed = new EmbedBuilder()
          .setColor('#e67e22')
          .setTitle('💬 Message Crafted')
          .setDescription(result.message)
          .addFields(
            { name: '💡 Content', value: content, inline: false },
            { name: '📱 Platform', value: platform.charAt(0).toUpperCase() + platform.slice(1), inline: true },
            { name: '🎨 Style', value: style.charAt(0).toUpperCase() + style.slice(1), inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'Message crafted by Gemini AI' });

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('AI Message Error:', error);
        await interaction.editReply("❌ Error while crafting message.");
      }
    }

    if (subcommand === "letter") {
      const type = interaction.options.getString("type");
      const details = interaction.options.getString("details");
      const recipient = interaction.options.getString("recipient");
      await interaction.deferReply();

      try {
        const result = await this.generateLetter(type, details, recipient);
        
        const embed = new EmbedBuilder()
          .setColor('#8e44ad')
          .setTitle('📄 Formal Letter Generated')
          .setDescription(result.letter.length > 3500 ? result.letter.substring(0, 3500) + '...' : result.letter)
          .addFields(
            { name: '📝 Type', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true },
            { name: '👤 Recipient', value: recipient || 'Not specified', inline: true },
            { name: '📋 Details', value: details.length > 100 ? details.substring(0, 100) + '...' : details, inline: false }
          )
          .setTimestamp()
          .setFooter({ text: 'Formal letter by Gemini AI' });

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('AI Letter Error:', error);
        await interaction.editReply("❌ Error while generating letter.");
      }
    }

    if (subcommand === "script") {
      const type = interaction.options.getString("type");
      const topic = interaction.options.getString("topic");
      const audience = interaction.options.getString("audience");
      const duration = interaction.options.getString("duration") || 'medium';
      await interaction.deferReply();

      try {
        const result = await this.generateScript(type, topic, audience, duration);
        
        const embed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setTitle('🎤 Script Generated')
          .setDescription(result.script.length > 3500 ? result.script.substring(0, 3500) + '...' : result.script)
          .addFields(
            { name: '🎭 Type', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true },
            { name: '📝 Topic', value: topic, inline: true },
            { name: '👥 Audience', value: audience || 'General', inline: true },
            { name: '⏱️ Duration', value: duration.charAt(0).toUpperCase() + duration.slice(1), inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'Script by Gemini AI' });

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('AI Script Error:', error);
        await interaction.editReply("❌ Error while generating script.");
      }
    }

    if (subcommand === "rewrite") {
      const text = interaction.options.getString("text");
      const goal = interaction.options.getString("goal") || 'clarity';
      const targetTone = interaction.options.getString("target_tone");
      await interaction.deferReply();

      try {
        const result = await this.rewriteText(text, goal, targetTone);
        
        const embed = new EmbedBuilder()
          .setColor('#2ecc71')
          .setTitle('✨ Text Rewritten')
          .addFields(
            { name: '📝 Original', value: text.length > 500 ? text.substring(0, 500) + '...' : text, inline: false },
            { name: '🎯 Improved Version', value: result.rewritten.length > 1500 ? result.rewritten.substring(0, 1500) + '...' : result.rewritten, inline: false },
            { name: '🎯 Goal', value: goal.charAt(0).toUpperCase() + goal.slice(1), inline: true },
            { name: '🎭 Tone', value: targetTone ? targetTone.charAt(0).toUpperCase() + targetTone.slice(1) : 'Original', inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'Rewritten by Gemini AI' });

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('AI Rewrite Error:', error);
        await interaction.editReply("❌ Error while rewriting text.");
      }
    }

    if (subcommand === "brainstorm") {
      const topic = interaction.options.getString("topic");
      const type = interaction.options.getString("type") || 'creative';
      const count = interaction.options.getInteger("count") || 10;
      await interaction.deferReply();

      try {
        const result = await this.brainstormIdeas(topic, type, count);
        
        const embed = new EmbedBuilder()
          .setColor('#f39c12')
          .setTitle('💡 Brainstorming Results')
          .setDescription(result.ideas)
          .addFields(
            { name: '🎯 Topic', value: topic, inline: true },
            { name: '📝 Type', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true },
            { name: '🔢 Ideas Generated', value: count.toString(), inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'Ideas generated by Gemini AI' });

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('AI Brainstorm Error:', error);
        await interaction.editReply("❌ Error while brainstorming ideas.");
      }
    }
  },


  async generateEmail(purpose, tone, recipient) {
    const tonePrompts = {
      professional: "Write in a professional, business-appropriate tone",
      friendly: "Write in a warm, friendly tone while remaining professional",
      formal: "Write in a very formal, official tone",
      casual: "Write in a casual, relaxed tone",
      apologetic: "Write with a sincere, apologetic tone",
      persuasive: "Write with a convincing, persuasive tone",
      followup: "Write as a polite follow-up"
    };

    const prompt = `Write a professional email for the following purpose: ${purpose}

${tonePrompts[tone] || 'Write in a professional tone'}.
${recipient ? `The recipient is: ${recipient}.` : ''}

Include:
1. Appropriate subject line
2. Professional greeting
3. Clear, well-structured body
4. Professional closing
5. Placeholder for signature

Format it as a complete email ready to send.`;

    const response = await aiManager.generateContent(prompt, { timeout: 30000 });
    return { email: response.text() };
  },

  async generateMessage(content, platform, style) {
    const platformPrompts = {
      discord: "Format for Discord announcement with appropriate emojis and formatting",
      twitter: "Format as Twitter/X post with hashtags, keep under 280 characters",
      instagram: "Format as Instagram caption with relevant hashtags and emojis",
      linkedin: "Format for LinkedIn with professional tone and relevant hashtags",
      text: "Format as clear, concise text message",
      whatsapp: "Format for WhatsApp with appropriate emojis",
      general: "Format as general message"
    };

    const stylePrompts = {
      engaging: "Make it engaging, fun, and attention-grabbing",
      professional: "Keep it professional and business-appropriate",
      informative: "Focus on clear, informative content",
      motivational: "Make it inspiring and motivational",
      humorous: "Add appropriate humor and wit",
      serious: "Keep it serious and direct"
    };

    const prompt = `Create a message about: ${content}

${platformPrompts[platform] || 'Format as general message'}.
${stylePrompts[style] || 'Make it engaging'}.

Make it compelling and appropriate for the platform and audience.`;

    const response = await aiManager.generateContent(prompt, { timeout: 30000 });
    return { message: response.text() };
  },

  async generateLetter(type, details, recipient) {
    const letterPrompts = {
      cover: "Write a professional cover letter",
      resignation: "Write a professional resignation letter",
      complaint: "Write a formal complaint letter",
      thankyou: "Write a sincere thank you letter",
      recommendation: "Write a professional recommendation letter",
      personal: "Write a personal letter",
      proposal: "Write a business proposal letter"
    };

    const prompt = `${letterPrompts[type] || 'Write a formal letter'} with the following details:

${details}

${recipient ? `Addressed to: ${recipient}` : ''}

Include:
1. Proper letter format with date and addresses
2. Appropriate salutation
3. Well-structured body paragraphs
4. Professional closing
5. Signature line

Make it professional, clear, and appropriate for the purpose.`;

    const response = await aiManager.generateContent(prompt, { timeout: 30000 });
    return { letter: response.text() };
  },

  async generateScript(type, topic, audience, duration) {
    const scriptPrompts = {
      presentation: "Write a presentation script",
      youtube: "Write a YouTube video script with hooks and engagement",
      podcast: "Write a podcast introduction script",
      speech: "Write a speech or toast script",
      sales: "Write a sales pitch script",
      interview: "Write interview preparation talking points",
      meeting: "Write a meeting agenda and talking points"
    };

    const durationGuides = {
      short: "Keep it brief, 1-2 minutes (150-300 words)",
      medium: "Medium length, 3-5 minutes (450-750 words)",
      long: "Longer format, 10+ minutes (1500+ words)"
    };

    const prompt = `${scriptPrompts[type] || 'Write a script'} about: ${topic}

${audience ? `Target audience: ${audience}` : ''}
${durationGuides[duration] || 'Medium length script'}

Include:
1. Strong opening/hook
2. Clear structure with main points
3. Engaging content appropriate for the format
4. Strong conclusion/call to action
5. Speaker notes or timing cues where relevant

Make it engaging and well-structured.`;

    const response = await aiManager.generateContent(prompt, { timeout: 30000 });
    return { script: response.text() };
  },

  async rewriteText(text, goal, targetTone) {
    const goalPrompts = {
      professional: "Rewrite to sound more professional and business-appropriate",
      clarity: "Rewrite for better clarity and understanding",
      concise: "Rewrite to be more concise and to-the-point",
      expand: "Rewrite to be more detailed and comprehensive",
      grammar: "Fix grammar, spelling, and syntax errors",
      tone: "Adjust the tone as specified",
      friendly: "Rewrite to sound more friendly and approachable"
    };

    const prompt = `${goalPrompts[goal] || 'Improve the following text'}:

"${text}"

${targetTone ? `Target tone: ${targetTone}` : ''}

Provide the improved version while maintaining the original meaning and intent.`;

    const response = await aiManager.generateContent(prompt, { timeout: 30000 });
    return { rewritten: response.text() };
  },


async conductResearch(topic, depth, format) {
  const depthPrompts = {
    overview: "Provide a comprehensive overview with key points and basic information",
    detailed: "Conduct detailed analysis with in-depth exploration of key aspects",
    comprehensive: "Create a comprehensive research report with thorough investigation",
    academic: "Write an academic-level analysis with scholarly depth and citations",
    business: "Focus on business intelligence and practical applications"
  };

  const formatPrompts = {
    report: "Format as a professional research report with sections and conclusions",
    bullets: "Present information as organized bullet points and key highlights", 
    faq: "Structure as frequently asked questions with detailed answers",
    presentation: "Create as presentation outline with main points and sub-points"
  };

  const prompt = `Research the following topic: ${topic}

${depthPrompts[depth]}
${formatPrompts[format]}

Include:
1. Executive summary
2. Key findings and insights
3. Important data and statistics
4. Multiple perspectives and viewpoints
5. Conclusions and implications
6. Recommendations or next steps

Make it comprehensive, accurate, and well-structured.`;

  const response = await aiManager.generateContent(prompt, { timeout: 45000 });
  return { research: response.text() };
},

async translateText(text, targetLanguage, style, context) {
  const stylePrompts = {
    formal: "Use formal, professional language appropriate for business or official contexts",
    casual: "Use casual, conversational tone suitable for everyday communication",
    technical: "Maintain technical precision and specialized terminology",
    creative: "Preserve creative elements, literary style, and artistic expression",
    business: "Use business-appropriate language suitable for commercial contexts"
  };

  const prompt = `Translate the following text to ${targetLanguage}:

"${text}"

Translation requirements:
- ${stylePrompts[style]}
- Maintain the original meaning and intent
- Consider cultural nuances and context
- Provide natural, fluent translation
- ${context ? `Context: ${context}` : 'No specific context provided'}

After the translation, provide brief notes about:
- Any cultural adaptations made
- Alternative translations for key phrases
- Important context considerations

Format your response as:
TRANSLATION: [translated text]
NOTES: [translation notes and explanations]`;

  const response = await aiManager.generateContent(prompt, { timeout: 30000 });
  const result = response.text();
  
  const translationMatch = result.match(/TRANSLATION:\s*(.*?)(?=NOTES:|$)/s);
  const notesMatch = result.match(/NOTES:\s*(.*)/s);

  return {
    translation: translationMatch ? translationMatch[1].trim() : result,
    notes: notesMatch ? notesMatch[1].trim() : null
  };
},

async proofreadText(text, level, documentType) {
  const levelPrompts = {
    grammar: "Focus only on grammar, spelling, and punctuation corrections",
    style: "Improve style, clarity, flow, and readability while fixing basic errors",
    comprehensive: "Provide comprehensive editing including structure, tone, and content improvements",
    academic: "Apply academic writing standards with formal tone and scholarly conventions",
    business: "Ensure professional business communication standards and clarity"
  };

  const typePrompts = {
    essay: "Apply essay writing conventions with clear thesis and supporting arguments",
    business: "Ensure professional business document standards and formatting",
    correspondence: "Apply professional correspondence etiquette and tone",
    creative: "Preserve creative voice while improving technical accuracy",
    technical: "Maintain technical precision while improving clarity and accessibility"
  };

  const prompt = `Proofread and edit the following text:

"${text}"

Editing requirements:
- ${levelPrompts[level]}
- ${typePrompts[documentType] || 'Apply general writing best practices'}

Provide your response in this format:
CORRECTED VERSION: [fully edited text]
KEY IMPROVEMENTS: [list the main changes and improvements made]
SUGGESTIONS: [additional recommendations for further improvement]`;

  const response = await aiManager.generateContent(prompt, { timeout: 35000 });
  const result = response.text();
  
  const correctedMatch = result.match(/CORRECTED VERSION:\s*(.*?)(?=KEY IMPROVEMENTS:|$)/s);
  const suggestionsMatch = result.match(/(?:KEY IMPROVEMENTS:|SUGGESTIONS:)\s*(.*)/s);

  return {
    corrected: correctedMatch ? correctedMatch[1].trim() : result,
    suggestions: suggestionsMatch ? suggestionsMatch[1].trim() : null
  };
},

async createCurriculum(subject, level, duration, focus) {
  const levelGuides = {
    beginner: "Design for complete beginners with no prior experience",
    intermediate: "Build on basic knowledge with more complex concepts", 
    advanced: "Cover sophisticated topics for experienced learners",
    expert: "Focus on mastery-level skills and professional expertise",
    mixed: "Include progressive difficulty from basic to advanced"
  };

  const durationStructures = {
    week: "Intensive 7-day crash course with daily focused sessions",
    month: "4-week program with weekly modules and daily activities",
    quarter: "12-week comprehensive course with detailed progression",
    semester: "6-month in-depth program with extensive coverage",
    year: "Full-year comprehensive curriculum with seasonal modules"
  };

  const focusApproaches = {
    practical: "Emphasize hands-on exercises, projects, and real-world applications",
    theoretical: "Focus on underlying principles, concepts, and academic understanding",
    certification: "Align with industry certifications and professional requirements",
    career: "Target specific career objectives and job market needs",
    personal: "Cater to personal interest and self-improvement goals"
  };

  const prompt = `Create a comprehensive learning curriculum for: ${subject}

Requirements:
- ${levelGuides[level]}
- ${durationStructures[duration]}
- ${focusApproaches[focus]}

Structure your curriculum with:
1. Course Overview and Learning Objectives
2. Prerequisites and Required Resources
3. Module/Week Breakdown with Topics
4. Learning Activities and Exercises
5. Assessment Methods and Milestones  
6. Recommended Resources and Materials
7. Final Project or Capstone
8. Next Steps and Advanced Learning Paths

Make it detailed, practical, and progressive.`;

  const response = await aiManager.generateContent(prompt, { timeout: 40000 });
  return { curriculum: response.text() };
},

async createPresentation(topic, audience, slides, style) {
  const audienceAdaptations = {
    business: "Use professional tone with business metrics and ROI focus",
    academic: "Include scholarly references and research-based evidence",
    technical: "Incorporate technical depth with specifications and data",
    sales: "Focus on benefits, features, and compelling value propositions",
    general: "Use accessible language and relatable examples",
    students: "Include interactive elements and educational approaches",
    investors: "Emphasize market opportunity, growth potential, and financial projections"
  };

  const styleApproaches = {
    informative: "Focus on clear information delivery with supporting data",
    persuasive: "Build compelling arguments with strong calls to action",
    training: "Include interactive elements and skill-building components",
    pitch: "Create compelling narrative with problem-solution structure",
    report: "Present findings and recommendations in structured format"
  };

  const prompt = `Create a ${slides}-slide presentation about: ${topic}

Presentation specifications:
- ${audienceAdaptations[audience]}
- ${styleApproaches[style]}

For each slide, provide:
1. Slide Title
2. Key Points/Content (2-4 bullet points)
3. Speaker Notes (what to say)
4. Visual Suggestions (images, charts, graphics)

Structure:
- Opening hook and agenda
- Main content divided logically
- Supporting evidence and examples
- Strong conclusion with takeaways
- Q&A preparation notes

Make it engaging, well-paced, and audience-appropriate.`;

  const response = await aiManager.generateContent(prompt, { timeout: 40000 });
  return { presentation: response.text() };
},

async createSEOContent(topic, contentType, targetKeywords, wordCount) {
  const contentTypePrompts = {
    blog: "Write an engaging blog article with clear structure and SEO optimization",
    product: "Create compelling product descriptions that drive conversions",
    landing: "Develop landing page content that converts visitors to customers", 
    meta: "Generate SEO meta titles, descriptions, and tags",
    social: "Create social media content optimized for engagement and sharing",
    faq: "Develop comprehensive FAQ content that answers user questions",
    category: "Write category page content that helps users navigate and discover"
  };

  const keywords = targetKeywords ? targetKeywords.split(',').map(k => k.trim()) : [];
  const keywordText = keywords.length > 0 ? `Target keywords: ${keywords.join(', ')}` : '';

  const prompt = `Create SEO-optimized content about: ${topic}

Content specifications:
- ${contentTypePrompts[contentType]}
- Target length: approximately ${wordCount} words
- ${keywordText}

SEO requirements:
1. Include primary keyword in title and first paragraph
2. Use keywords naturally throughout content
3. Create engaging headings and subheadings  
4. Include related terms and semantic keywords
5. Write compelling meta description
6. Ensure good readability and user experience

Content structure:
- Attention-grabbing headline
- Engaging introduction with keyword
- Well-organized main content with headers
- Relevant examples and actionable insights
- Strong conclusion with call-to-action
- SEO metadata (title, description, keywords)

Also provide:
- SEO optimization tips for this content
- Additional keyword suggestions
- Internal linking opportunities`;

  const response = await aiManager.generateContent(prompt, { timeout: 40000 });
  const result = response.text();
  
  const contentMatch = result.match(/^(.*?)(?=SEO TIPS:|$)/s);
  const tipsMatch = result.match(/SEO TIPS:\s*(.*)/s);

  return {
    content: contentMatch ? contentMatch[1].trim() : result,
    seoTips: tipsMatch ? tipsMatch[1].trim() : null
  };
},

async createLegalDocument(documentType, businessInfo, specificTerms, jurisdiction) {
  const documentPrompts = {
    terms: "Create comprehensive Terms of Service agreement",
    privacy: "Generate detailed Privacy Policy document",
    nda: "Draft Non-Disclosure Agreement with standard protections",
    service: "Create Service Agreement with clear obligations",
    employment: "Generate Employment Contract with standard clauses",
    rental: "Create Rental/Lease Agreement with tenant protections",
    invoice: "Design professional Invoice Template with payment terms",
    disclaimer: "Generate Disclaimer statement with liability limitations"
  };

  const jurisdictionNotes = {
    us: "Include US legal standards and regulations",
    eu: "Comply with European Union regulations including GDPR",
    uk: "Follow United Kingdom legal requirements",
    ca: "Incorporate Canadian legal standards",
    au: "Include Australian legal requirements",
    generic: "Use general international legal principles"
  };

  const prompt = `Create a ${documentType} legal document template.

Requirements:
- ${documentPrompts[documentType]}
- ${jurisdictionNotes[jurisdiction]}
- ${businessInfo ? `Business context: ${businessInfo}` : 'Generic business template'}
- ${specificTerms ? `Include these specific terms: ${specificTerms}` : 'Use standard industry terms'}

Document structure:
1. Title and effective date
2. Definitions and interpretations
3. Main terms and conditions
4. Rights and obligations
5. Limitation of liability
6. Termination clauses
7. Governing law and jurisdiction
8. Signature blocks

Important disclaimers:
- This is a template for reference only
- Legal review recommended before use
- May need customization for specific situations
- Not a substitute for professional legal advice

Make it comprehensive but readable, with clear language and standard legal formatting.`;

  const response = await aiManager.generateContent(prompt, { timeout: 35000 });
  return { document: response.text() };
},

async generateQA(topic, questionType, count, difficulty) {
  const typePrompts = {
    faq: "Generate frequently asked questions that customers typically have",
    interview: "Create interview questions to assess knowledge and skills",
    study: "Develop study questions for learning and exam preparation",
    troubleshooting: "Generate troubleshooting Q&A for problem-solving",
    product: "Create product knowledge questions for training purposes",
    training: "Develop training questions for skill development",
    quiz: "Generate quiz questions for assessment and evaluation"
  };

  const difficultyLevels = {
    basic: "Focus on fundamental concepts and basic understanding",
    intermediate: "Include moderate complexity requiring some experience",
    advanced: "Create challenging questions for experienced users",
    expert: "Develop professional-level questions for specialists",
    mixed: "Include a range from basic to advanced difficulty levels"
  };

  const prompt = `Generate ${count} Q&A pairs about: ${topic}

Requirements:
- ${typePrompts[questionType]}
- ${difficultyLevels[difficulty]}

For each Q&A pair provide:
1. Clear, specific question
2. Comprehensive, accurate answer
3. Brief difficulty indicator (Basic/Intermediate/Advanced)
4. Relevant examples or elaboration where helpful

Format as:
Q1: [Question]
A1: [Detailed Answer]
Difficulty: [Level]

Q2: [Question] 
A2: [Detailed Answer]
Difficulty: [Level]

[Continue for all ${count} questions]

Make questions practical, relevant, and valuable for the intended purpose.
Ensure answers are informative and actionable.`;

  const response = await aiManager.generateContent(prompt, { timeout: 40000 });
  return { qaSet: response.text() };
},
  async brainstormIdeas(topic, type, count) {
    const typePrompts = {
      business: "Generate business and entrepreneurial ideas",
      content: "Generate content creation and marketing ideas",
      names: "Generate creative names and titles",
      creative: "Generate creative and innovative solutions",
      marketing: "Generate marketing campaign and strategy ideas",
      events: "Generate event planning and activity ideas",
      solutions: "Generate problem-solving approaches and solutions"
    };

    const prompt = `${typePrompts[type] || 'Generate creative ideas'} for: ${topic}

Provide ${count} distinct, creative, and practical ideas.
Format as a numbered list with brief explanations for each idea.
Make them actionable and innovative.`;

    const response = await aiManager.generateContent(prompt, { timeout: 30000 });
    return { ideas: response.text() };
  }
};

/*
 ██████╗ ██╗      █████╗  ██████╗███████╗██╗   ██╗████████╗
██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝╚══██╔══╝
██║  ███╗██║     ███████║██║     █████╗   ╚████╔╝    ██║   
██║   ██║██║     ██╔══██║██║     ██╔══╝    ╚██╔╝     ██║   
╚██████╔╝███████╗██║  ██║╚██████╗███████╗   ██║      ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝      ╚═╝   

-------------------------------------
📡 Discord : https://discord.gg/xQF9f9yUEM
🌐 Website : https://glaceyt.com
🎥 YouTube : https://youtube.com/@GlaceYT
✅ Verified | 🧩 Tested | ⚙️ Stable
-------------------------------------
> © 2025 GlaceYT.com | All rights reserved.
*/